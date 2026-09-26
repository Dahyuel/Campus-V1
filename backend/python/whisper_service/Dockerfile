FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*
# CPU-only torch first: the default wheel pulls several GB of CUDA libraries.
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir fastapi uvicorn openai-whisper boto3 psycopg2-binary requests
COPY main.py .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5002"]
