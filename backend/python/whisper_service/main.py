from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import boto3
import psycopg2
import os
import tempfile
import requests

app = FastAPI()

_model = None


def get_model():
    global _model
    if _model is None:
        import whisper
        _model = whisper.load_model(os.environ.get('WHISPER_MODEL', 'base'))
    return _model


def get_s3():
    return boto3.client(
        's3',
        endpoint_url=os.environ.get('MINIO_ENDPOINT', 'http://localhost:9000'),
        aws_access_key_id=os.environ.get('MINIO_ACCESS_KEY'),
        aws_secret_access_key=os.environ.get('MINIO_SECRET_KEY'),
    )


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


class TranscribeRequest(BaseModel):
    recordingId: str
    fileKey: str
    bucket: str


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.post('/transcribe')
async def transcribe(req: TranscribeRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(run_transcription, req)
    return {'status': 'queued', 'recordingId': req.recordingId}


def run_transcription(req: TranscribeRequest):
    db = get_db()
    cur = db.cursor()
    tmp_path = None
    try:
        s3 = get_s3()
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as tmp:
            s3.download_fileobj(req.bucket, req.fileKey, tmp)
            tmp_path = tmp.name

        model = get_model()
        result = model.transcribe(tmp_path)

        for i, seg in enumerate(result['segments']):
            cur.execute(
                """
                INSERT INTO recording_transcripts
                  (recording_id, segment_index, start_time_secs, end_time_secs, text)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (req.recordingId, i, seg['start'], seg['end'], seg['text']),
            )

        cur.execute("UPDATE lecture_recordings SET status='READY' WHERE id=%s", (req.recordingId,))
        db.commit()

        parts = req.fileKey.split('/')
        course_code = parts[1] if len(parts) > 1 else ''
        backend_url = os.environ.get('BACKEND_URL', 'http://backend:4000')
        for seg in result['segments'][-10:]:
            try:
                requests.post(
                    f"{backend_url}/internal/rag/index-chunk",
                    json={
                        'recordingId': req.recordingId,
                        'courseCode': course_code,
                        'text': seg['text'],
                        'startTime': seg['start'],
                        'endTime': seg['end'],
                        'source': 'lecture_recording',
                    },
                    headers={'x-internal-secret': os.environ.get('INTERNAL_SECRET', '')},
                    timeout=10,
                )
            except Exception:
                pass

    except Exception as e:
        try:
            cur.execute("UPDATE lecture_recordings SET status='FAILED' WHERE id=%s", (req.recordingId,))
            db.commit()
        except Exception:
            pass
        print(f"Transcription failed: {e}")
    finally:
        cur.close()
        db.close()
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)