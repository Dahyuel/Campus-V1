-- Feature 1: Smart Schedule
CREATE TABLE IF NOT EXISTS schedule_preferences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  blocked_slots   JSONB DEFAULT '[]',
  preferred_study VARCHAR(20) DEFAULT 'morning',
  max_study_block INT DEFAULT 90,
  personal_events JSONB DEFAULT '[]',
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS smart_schedules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start   DATE NOT NULL,
  slots        JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Feature 2: To-Do List
CREATE TABLE IF NOT EXISTS todos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  title             VARCHAR(500) NOT NULL,
  course_code       VARCHAR(50),
  due_date          DATE,
  priority          VARCHAR(10) DEFAULT 'medium',
  status            VARCHAR(20) DEFAULT 'pending',
  is_suggested      BOOLEAN DEFAULT false,
  suggestion_reason TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  completed_at      TIMESTAMPTZ
);

-- Feature 3: Lecture Recordings
CREATE TABLE IF NOT EXISTS lecture_recordings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID REFERENCES attendance_sessions(id) ON DELETE SET NULL,
  course_id     UUID REFERENCES courses(id) ON DELETE CASCADE,
  faculty_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  file_key      TEXT NOT NULL,
  file_name     VARCHAR(255) NOT NULL,
  duration_secs INT,
  size_bytes    BIGINT,
  status        VARCHAR(20) DEFAULT 'PROCESSING',
  uploaded_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recording_access (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID REFERENCES lecture_recordings(id) ON DELETE CASCADE,
  student_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  access_type  VARCHAR(20) DEFAULT 'attended',
  granted_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  granted_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recording_id, student_id)
);

CREATE TABLE IF NOT EXISTS recording_transcripts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id    UUID REFERENCES lecture_recordings(id) ON DELETE CASCADE,
  segment_index   INT NOT NULL,
  start_time_secs NUMERIC(8,2) NOT NULL,
  end_time_secs   NUMERIC(8,2) NOT NULL,
  text            TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Feature 5: Geofencing
ALTER TABLE attendance_sessions ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7);
ALTER TABLE attendance_sessions ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);
ALTER TABLE attendance_sessions ADD COLUMN IF NOT EXISTS radius_meters INT DEFAULT 100;

CREATE INDEX IF NOT EXISTS idx_smart_schedules_user_id ON smart_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_lecture_recordings_course_id ON lecture_recordings(course_id);
CREATE INDEX IF NOT EXISTS idx_recording_access_student_id ON recording_access(student_id);
CREATE INDEX IF NOT EXISTS idx_recording_transcripts_recording_id ON recording_transcripts(recording_id);
