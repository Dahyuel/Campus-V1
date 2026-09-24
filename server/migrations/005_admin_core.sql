CREATE TABLE IF NOT EXISTS exam_rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL UNIQUE,
  capacity    INT NOT NULL DEFAULT 50
);

CREATE TABLE IF NOT EXISTS exam_schedule (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     UUID REFERENCES courses(id) ON DELETE SET NULL,
  room_id       UUID REFERENCES exam_rooms(id) ON DELETE SET NULL,
  invigilator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  exam_date     DATE NOT NULL,
  time_slot     VARCHAR(50) NOT NULL,
  status        VARCHAR(20) DEFAULT 'PENDING',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  invoice_no    VARCHAR(50) UNIQUE NOT NULL,
  type          VARCHAR(50) NOT NULL,
  amount_cents  INT NOT NULL,
  due_date      DATE NOT NULL,
  paid_date     DATE,
  status        VARCHAR(20) DEFAULT 'OVERDUE',
  reminder_sent BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(255) NOT NULL,
  report_type    VARCHAR(50) NOT NULL,
  format         VARCHAR(10) NOT NULL,
  generated_by   VARCHAR(100) NOT NULL,
  is_ai          BOOLEAN DEFAULT false,
  summary        TEXT,
  file_key       TEXT,
  generated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registrations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  program     VARCHAR(255) NOT NULL,
  status      VARCHAR(20) DEFAULT 'PENDING',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE courses ADD COLUMN IF NOT EXISTS capacity INT DEFAULT 70;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS waitlist_count INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS staff (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  department  VARCHAR(255),
  role_label  VARCHAR(100),
  shift       VARCHAR(50),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  department   VARCHAR(255),
  leave_type   VARCHAR(100) NOT NULL,
  from_date    DATE NOT NULL,
  to_date      DATE NOT NULL,
  status       VARCHAR(20) DEFAULT 'pending',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_conflicts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conflict_type VARCHAR(20) NOT NULL,
  description  TEXT NOT NULL,
  resolved     BOOLEAN DEFAULT false,
  detected_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exam_schedule_course_id ON exam_schedule(course_id);
CREATE INDEX IF NOT EXISTS idx_exam_schedule_room_id ON exam_schedule(room_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student_id ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);