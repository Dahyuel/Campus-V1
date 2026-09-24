-- Departments (referenced by courses)
CREATE TABLE IF NOT EXISTS departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  code        VARCHAR(50) UNIQUE NOT NULL,
  head_id     UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Courses master table
CREATE TABLE IF NOT EXISTS courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  code            VARCHAR(50) UNIQUE NOT NULL,
  credits         INT NOT NULL DEFAULT 3,
  department_id   UUID REFERENCES departments(id) ON DELETE SET NULL,
  faculty_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  semester        VARCHAR(100) NOT NULL DEFAULT 'Semester 2 — 2025/2026',
  is_active       BOOLEAN DEFAULT true
);

-- Student enrollments (student ↔ course with attendance and status)
CREATE TABLE IF NOT EXISTS enrollments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id        UUID REFERENCES courses(id) ON DELETE CASCADE,
  status           VARCHAR(50) DEFAULT 'IN PROGRESS',
  attendance_pct   INT DEFAULT 100,
  enrolled_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Assessments for a course (assignments, exams, projects)
CREATE TABLE IF NOT EXISTS assessments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id      UUID REFERENCES courses(id) ON DELETE CASCADE,
  title          VARCHAR(255) NOT NULL,
  type           VARCHAR(50) NOT NULL,
  weight_pct     VARCHAR(10) NOT NULL,
  out_of         INT,
  display_order  INT DEFAULT 0
);

-- Student grades per assessment
CREATE TABLE IF NOT EXISTS grades (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id  UUID REFERENCES assessments(id) ON DELETE CASCADE,
  student_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  grade          NUMERIC(5,2),
  released_date  VARCHAR(50),
  status         VARCHAR(20) DEFAULT 'PENDING',
  entered_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, student_id)
);

-- Weekly schedule slots
CREATE TABLE IF NOT EXISTS schedule_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID REFERENCES courses(id) ON DELETE CASCADE,
  day_of_week  VARCHAR(20) NOT NULL,
  time_slot    VARCHAR(20) NOT NULL,
  room         VARCHAR(100),
  is_live      BOOLEAN DEFAULT false
);

-- Upcoming events (exams, deadlines, office hours, lectures)
CREATE TABLE IF NOT EXISTS upcoming_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID REFERENCES courses(id) ON DELETE SET NULL,
  student_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  type         VARCHAR(30) NOT NULL,
  title        VARCHAR(255) NOT NULL,
  date_label   VARCHAR(100) NOT NULL,
  time_label   VARCHAR(100) NOT NULL,
  room         VARCHAR(100)
);

-- Previous semester completed courses (academic transcript)
CREATE TABLE IF NOT EXISTS transcript_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  course_name  VARCHAR(255) NOT NULL,
  course_code  VARCHAR(50) NOT NULL,
  grade        VARCHAR(5) NOT NULL,
  gpa_points   VARCHAR(5) NOT NULL,
  semester     VARCHAR(100) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_schedule_slots_course_id ON schedule_slots(course_id);
CREATE INDEX IF NOT EXISTS idx_upcoming_events_student_id ON upcoming_events(student_id);
CREATE INDEX IF NOT EXISTS idx_transcript_entries_student_id ON transcript_entries(student_id);

-- AUDIT-FIX: per-slot display name (mock's WEEK_SCHEDULE has variants like "Data Structures Lab")
ALTER TABLE schedule_slots ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- AUDIT-FIX: transcript ordering by real enrollment date (mock order: Fall 2025 first)
ALTER TABLE transcript_entries ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMPTZ;

-- AUDIT-FIX: upcoming event ordering by real start time (chronological ASC)
ALTER TABLE upcoming_events ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ;
