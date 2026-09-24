-- AI Tutor sessions
CREATE TABLE IF NOT EXISTS tutor_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id     UUID REFERENCES courses(id) ON DELETE SET NULL,
  course_name   VARCHAR(255) NOT NULL,
  course_code   VARCHAR(50)  NOT NULL,
  date_label    VARCHAR(100) NOT NULL DEFAULT 'Today',
  preview       TEXT,
  exchanges_count INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- AI Tutor messages within a session
CREATE TABLE IF NOT EXISTS tutor_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES tutor_sessions(id) ON DELETE CASCADE,
  sender      VARCHAR(20) NOT NULL,   -- 'student' | 'ai'
  text        TEXT NOT NULL,
  citation    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Broadcast messages (admin channels — Phase 6)
CREATE TABLE IF NOT EXISTS broadcast_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  channel_type  VARCHAR(30) NOT NULL,   -- 'all_students' | 'all_faculty' | 'dept_heads' | 'at_risk'
  body          TEXT NOT NULL,
  sent_at       TIMESTAMPTZ DEFAULT NOW()
);

-- RAG indexing tracker (which materials have been indexed)
CREATE TABLE IF NOT EXISTS rag_index_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id   UUID REFERENCES course_materials(id) ON DELETE CASCADE UNIQUE,
  indexed_at    TIMESTAMPTZ DEFAULT NOW(),
  chunk_count   INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_tutor_sessions_student_id ON tutor_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_tutor_messages_session_id ON tutor_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_channel_type ON broadcast_messages(channel_type);
