import { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireAuth } from '../middleware/requireAuth.js';
import { query } from '../db/client.js';
import { MATERIALS_BUCKET } from '../plugins/minio.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateLabel(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function formatSeconds(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default async function recordingRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', requireAuth);

  fastify.post('/faculty/recordings/upload', async (request, reply) => {
    const facultyId = request.user!.id;
    if (request.user!.roleType !== 'faculty') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const parts = request.parts();
    let fileBuffer: Buffer | null = null;
    let fileName = '';
    let courseId = '';
    let sessionId: string | null = null;
    let lectureLabel = '';

    for await (const part of parts) {
      if (part.type === 'file') {
        const chunks: Buffer[] = [];
        for await (const chunk of part.file) {
          chunks.push(chunk as Buffer);
        }
        fileBuffer = Buffer.concat(chunks);
        fileName = part.filename;
      } else {
        const value = String(part.value ?? '');
        if (part.fieldname === 'courseId') courseId = value;
        if (part.fieldname === 'sessionId') sessionId = value || null;
        if (part.fieldname === 'lectureLabel') lectureLabel = value;
      }
    }

    if (!fileBuffer || !courseId || !lectureLabel) {
      return reply.status(400).send({ error: 'file, courseId and lectureLabel are required' });
    }

    const courseRows = await query<{ code: string }>(
      `SELECT c.code FROM courses c
       JOIN faculty_course_assignments fca ON fca.course_id = c.id
       WHERE c.id = $1 AND fca.faculty_id = $2 LIMIT 1`,
      [courseId, facultyId]
    );
    if (!courseRows[0]) {
      return reply.status(403).send({ error: 'Course not assigned to you' });
    }
    const courseCode = courseRows[0].code;

    const fileKey = `courses/${courseCode}/recordings/${lectureLabel}_${Date.now()}.webm`;
    await fastify.minio.send(
      new PutObjectCommand({
        Bucket: MATERIALS_BUCKET,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: 'video/webm',
      })
    );

    const recordingRows = await query<{ id: string }>(
      `INSERT INTO lecture_recordings (session_id, course_id, faculty_id, file_key, file_name, size_bytes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'PROCESSING')
       RETURNING id`,
      [sessionId, courseId, facultyId, fileKey, fileName || `${lectureLabel}.webm`, fileBuffer.length]
    );
    const recordingId = recordingRows[0].id;

    if (sessionId) {
      await query(
        `INSERT INTO recording_access (recording_id, student_id, access_type, granted_by)
         SELECT $1, ar.student_id, 'attended', $2
         FROM attendance_records ar
         WHERE ar.session_id = $3 AND ar.status = 'PRESENT'
         ON CONFLICT DO NOTHING`,
        [recordingId, facultyId, sessionId]
      );
    }

    try {
      await fastify.amqp.publish('recording.uploaded', { recordingId, fileKey, courseCode });
    } catch {
      // event publish failure should not fail the upload
    }

    return reply.status(200).send({
      id: recordingId,
      fileKey,
      fileName: fileName || `${lectureLabel}.webm`,
      status: 'PROCESSING',
      lectureLabel,
    });
  });

  fastify.get('/faculty/recordings', async (request, reply) => {
    const facultyId = request.user!.id;
    const { courseId } = request.query as { courseId?: string };
    if (!courseId) return reply.status(400).send({ error: 'courseId is required' });

    const rows = await query<{
      id: string;
      file_key: string;
      status: string;
      uploaded_at: string;
      file_name: string;
      access_count: string;
      excuse_count: string;
      transcript_segments: string;
    }>(
      `SELECT r.id, r.file_key, r.status, r.uploaded_at, r.file_name,
              (SELECT COUNT(*)::text FROM recording_access ra WHERE ra.recording_id = r.id) AS access_count,
              (SELECT COUNT(*)::text FROM recording_access ra WHERE ra.recording_id = r.id AND ra.access_type = 'excuse') AS excuse_count,
              (SELECT COUNT(*)::text FROM recording_transcripts rt WHERE rt.recording_id = r.id) AS transcript_segments
       FROM lecture_recordings r
       JOIN courses c ON c.id = r.course_id
       JOIN faculty_course_assignments fca ON fca.course_id = c.id
       WHERE r.course_id = $1 AND fca.faculty_id = $2
       ORDER BY r.uploaded_at DESC`,
      [courseId, facultyId]
    );

    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        lectureLabel: r.file_name.replace(/\.webm$/i, '').replace(/_\d+$/, ''),
        uploadedAt: formatDateLabel(r.uploaded_at),
        duration: '—',
        status: r.status,
        accessCount: Number(r.access_count),
        excuseCount: Number(r.excuse_count),
        transcriptSegments: Number(r.transcript_segments),
        fileKey: r.file_key,
      }))
    );
  });

  fastify.get('/faculty/recordings/:recordingId/access', async (request, reply) => {
    const facultyId = request.user!.id;
    const { recordingId } = request.params as { recordingId: string };

    const rows = await query<{
      id: string;
      name: string;
      code_id: string;
      access_type: string;
      granted_at: string;
      granted_by_name: string | null;
    }>(
      `SELECT ra.id, u.name, u.code_id, ra.access_type, ra.granted_at, gb.name AS granted_by_name
       FROM recording_access ra
       JOIN lecture_recordings r ON r.id = ra.recording_id
       JOIN faculty_course_assignments fca ON fca.course_id = r.course_id AND fca.faculty_id = $2
       JOIN users u ON u.id = ra.student_id
       LEFT JOIN users gb ON gb.id = ra.granted_by
       WHERE ra.recording_id = $1`,
      [recordingId, facultyId]
    );

    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        name: r.name,
        studentId: r.code_id,
        accessType: r.access_type,
        grantedAt: formatDateLabel(r.granted_at),
        grantedBy: r.granted_by_name ?? undefined,
      }))
    );
  });

  fastify.post('/faculty/recordings/:recordingId/grant-access', async (request, reply) => {
    const facultyId = request.user!.id;
    const { recordingId } = request.params as { recordingId: string };
    const body = request.body as { studentId?: string };
    if (!body.studentId) return reply.status(400).send({ error: 'studentId is required' });

    const rows = await query<{ lecture_label: string; course_id: string }>(
      `SELECT r.file_name AS lecture_label, r.course_id
       FROM lecture_recordings r
       JOIN faculty_course_assignments fca ON fca.course_id = r.course_id
       WHERE r.id = $1 AND fca.faculty_id = $2 LIMIT 1`,
      [recordingId, facultyId]
    );
    if (!rows[0]) return reply.status(403).send({ error: 'Recording not found for your course' });

    const enrolled = await query<{ id: string }>(
      `SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2 LIMIT 1`,
      [body.studentId, rows[0].course_id]
    );
    if (!enrolled[0]) return reply.status(400).send({ error: 'Student is not enrolled in this course' });

    const insert = await query<{ id: string }>(
      `INSERT INTO recording_access (recording_id, student_id, access_type, granted_by)
       VALUES ($1, $2, 'excuse', $3)
       ON CONFLICT (recording_id, student_id) DO UPDATE SET access_type = 'excuse', granted_by = $3, granted_at = NOW()
       RETURNING id`,
      [recordingId, body.studentId, facultyId]
    );

    await query(
      `INSERT INTO notifications (user_id, title, body, type)
       VALUES ($1, 'Recording access granted', $2, 'info')`,
      [body.studentId, `You have been granted access to the recording for ${rows[0].lecture_label.replace(/\.webm$/i, '')}`]
    );

    return reply.status(200).send({ id: insert[0].id, accessType: 'excuse' });
  });

  fastify.delete('/faculty/recordings/:recordingId/revoke-access/:studentId', async (request, reply) => {
    const facultyId = request.user!.id;
    const { recordingId, studentId } = request.params as { recordingId: string; studentId: string };

    const rows = await query<{ id: string }>(
      `SELECT r.id FROM lecture_recordings r
       JOIN faculty_course_assignments fca ON fca.course_id = r.course_id AND fca.faculty_id = $3
       WHERE r.id = $1 LIMIT 1`,
      [recordingId, studentId, facultyId]
    );
    if (!rows[0]) return reply.status(403).send({ error: 'Forbidden' });

    await query(
      `DELETE FROM recording_access WHERE recording_id = $1 AND student_id = $2 AND access_type = 'excuse'`,
      [recordingId, studentId]
    );
    return reply.status(200).send({ ok: true });
  });

  fastify.get('/faculty/recordings/:recordingId/transcript', async (request, reply) => {
    const facultyId = request.user!.id;
    const { recordingId } = request.params as { recordingId: string };

    const rows = await query<{ id: string }>(
      `SELECT r.id FROM lecture_recordings r
       JOIN faculty_course_assignments fca ON fca.course_id = r.course_id AND fca.faculty_id = $2
       WHERE r.id = $1 LIMIT 1`,
      [recordingId, facultyId]
    );
    if (!rows[0]) return reply.status(403).send({ error: 'Forbidden' });

    const segments = await query<{ segment_index: number; start_time_secs: string; end_time_secs: string; text: string }>(
      `SELECT segment_index, start_time_secs, end_time_secs, text
       FROM recording_transcripts WHERE recording_id = $1 ORDER BY segment_index ASC`,
      [recordingId]
    );

    return reply.status(200).send({
      recordingId,
      segments: segments.map((s) => ({
        index: s.segment_index,
        startTime: formatSeconds(Number(s.start_time_secs)),
        endTime: formatSeconds(Number(s.end_time_secs)),
        text: s.text,
      })),
      fullText: segments.map((s) => s.text).join(' '),
    });
  });

  fastify.get('/student/recordings', async (request, reply) => {
    const studentId = request.user!.id;
    if (request.user!.roleType !== 'student') {
      return reply.status(403).send({ error: 'Forbidden' });
    }

    const rows = await query<{
      id: string;
      course_code: string;
      course_name: string;
      file_name: string;
      uploaded_at: string;
      status: string;
      access_type: string;
      has_transcript: boolean;
    }>(
      `SELECT r.id, c.code AS course_code, c.name AS course_name, r.file_name, r.uploaded_at, r.status,
              ra.access_type,
              EXISTS (SELECT 1 FROM recording_transcripts rt WHERE rt.recording_id = r.id) AS has_transcript
       FROM recording_access ra
       JOIN lecture_recordings r ON r.id = ra.recording_id
       JOIN courses c ON c.id = r.course_id
       WHERE ra.student_id = $1
       ORDER BY r.uploaded_at DESC`,
      [studentId]
    );

    return reply.status(200).send(
      rows.map((r) => ({
        id: r.id,
        courseCode: r.course_code,
        courseName: r.course_name,
        lectureLabel: r.file_name.replace(/\.webm$/i, '').replace(/_\d+$/, ''),
        uploadedAt: formatDateLabel(r.uploaded_at),
        duration: '—',
        status: r.status,
        accessType: r.access_type,
        hasTranscript: r.has_transcript,
        streamUrl: null,
      }))
    );
  });

  fastify.get('/student/recordings/:recordingId/stream-url', async (request, reply) => {
    const studentId = request.user!.id;
    const { recordingId } = request.params as { recordingId: string };

    const rows = await query<{ file_key: string }>(
      `SELECT r.file_key FROM recording_access ra
       JOIN lecture_recordings r ON r.id = ra.recording_id
       WHERE ra.recording_id = $1 AND ra.student_id = $2 LIMIT 1`,
      [recordingId, studentId]
    );
    if (!rows[0]) {
      return reply.status(403).send({ error: 'You were not present for this session. Contact your faculty for access.' });
    }

    const url = await getSignedUrl(
      fastify.minio,
      new GetObjectCommand({ Bucket: MATERIALS_BUCKET, Key: rows[0].file_key }),
      { expiresIn: 4 * 60 * 60 }
    );

    return reply.status(200).send({
      url,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    });
  });

  fastify.get('/student/recordings/:recordingId/transcript', async (request, reply) => {
    const studentId = request.user!.id;
    const { recordingId } = request.params as { recordingId: string };

    const access = await query<{ id: string }>(
      `SELECT id FROM recording_access WHERE recording_id = $1 AND student_id = $2 LIMIT 1`,
      [recordingId, studentId]
    );
    if (!access[0]) {
      return reply.status(403).send({ error: 'You were not present for this session. Contact your faculty for access.' });
    }

    const segments = await query<{ segment_index: number; start_time_secs: string; end_time_secs: string; text: string }>(
      `SELECT segment_index, start_time_secs, end_time_secs, text
       FROM recording_transcripts WHERE recording_id = $1 ORDER BY segment_index ASC`,
      [recordingId]
    );

    return reply.status(200).send({
      recordingId,
      segments: segments.map((s) => ({
        index: s.segment_index,
        startTime: formatSeconds(Number(s.start_time_secs)),
        endTime: formatSeconds(Number(s.end_time_secs)),
        text: s.text,
      })),
      fullText: segments.map((s) => s.text).join(' '),
    });
  });
}

export { randomUUID };