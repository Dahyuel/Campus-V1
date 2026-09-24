CREATE TABLE IF NOT EXISTS faculty_course_assignments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id    UUID REFERENCES courses(id) ON DELETE CASCADE,
  section      VARCHAR(50) NOT NULL DEFAULT 'Section A',
  room         VARCHAR(100),
  UNIQUE(faculty_id, course_id, section)
);

CREATE TABLE IF NOT EXISTS course_materials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     UUID REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  file_name     VARCHAR(255) NOT NULL,
  file_key      VARCHAR(500) NOT NULL,
  file_size     VARCHAR(50),
  material_type VARCHAR(100) NOT NULL,
  uploaded_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  lecture_label   VARCHAR(100) NOT NULL,
  session_date    DATE NOT NULL,
  qr_token        VARCHAR(255),
  qr_expires_at   TIMESTAMPTZ,
  is_open         BOOLEAN DEFAULT true,
  present_count   INT DEFAULT 0,
  absent_count    INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  status        VARCHAR(20) DEFAULT 'PRESENT',
  marked_at     TIMESTAMPTZ DEFAULT NOW(),
  method        VARCHAR(20) DEFAULT 'QR',
  UNIQUE(session_id, student_id)
);

CREATE TABLE IF NOT EXISTS at_risk_flags (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id    UUID REFERENCES courses(id) ON DELETE CASCADE,
  risk_level   VARCHAR(20) NOT NULL,
  signal       TEXT NOT NULL,
  flagged_at   TIMESTAMPTZ DEFAULT NOW(),
  resolved     BOOLEAN DEFAULT false,
  UNIQUE(student_id, course_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  recipient_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  body            TEXT NOT NULL,
  sent_at         TIMESTAMPTZ DEFAULT NOW(),
  read_at         TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS community_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID REFERENCES courses(id) ON DELETE CASCADE,
  author_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  post_type       VARCHAR(20) NOT NULL,
  title           VARCHAR(500) NOT NULL,
  content         TEXT NOT NULL,
  upvotes         INT DEFAULT 0,
  is_pinned       BOOLEAN DEFAULT false,
  is_flagged      BOOLEAN DEFAULT false,
  ai_answer       TEXT,
  ai_citation     VARCHAR(500),
  ai_status       VARCHAR(30),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faculty_assignments_faculty_id ON faculty_course_assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_course_id ON course_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_course_id ON attendance_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session_id ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_at_risk_flags_student_id ON at_risk_flags(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_course_id ON community_posts(course_id);
