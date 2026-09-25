-- Phase 7: Teaching Assistant (معيد) role
ALTER TYPE role_type ADD VALUE IF NOT EXISTS 'teaching-assistant';

CREATE TABLE IF NOT EXISTS ta_section_assignments (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ta_id                  UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id              UUID REFERENCES courses(id) ON DELETE CASCADE,
  supervising_faculty_id UUID REFERENCES users(id) ON DELETE SET NULL,
  section_label          VARCHAR(50) NOT NULL,
  room                   VARCHAR(100),
  UNIQUE(ta_id, course_id, section_label)
);

CREATE TABLE IF NOT EXISTS ta_materials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ta_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  course_id     UUID REFERENCES courses(id) ON DELETE CASCADE,
  section_label VARCHAR(50) NOT NULL,
  file_name     VARCHAR(255) NOT NULL,
  file_key      TEXT NOT NULL,
  file_size     VARCHAR(50),
  material_type VARCHAR(100) NOT NULL,
  uploaded_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ta_student_flags (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ta_id            UUID REFERENCES users(id) ON DELETE CASCADE,
  student_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id        UUID REFERENCES courses(id) ON DELETE CASCADE,
  section_label    VARCHAR(50) NOT NULL,
  reason           TEXT NOT NULL,
  notified_faculty BOOLEAN DEFAULT false,
  resolved         BOOLEAN DEFAULT false,
  flagged_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ta_id, student_id, course_id)
);

CREATE TABLE IF NOT EXISTS ta_academic_record (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ta_id             UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  degree_type       VARCHAR(50) DEFAULT 'Master''s',
  thesis_title      VARCHAR(500),
  thesis_supervisor VARCHAR(255),
  research_field    VARCHAR(255),
  enrollment_year   INT,
  expected_grad     INT,
  current_stage     VARCHAR(100),
  stage_progress    INT DEFAULT 0,
  gpa               NUMERIC(3,2),
  notes             TEXT,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ta_postgrad_courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ta_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  course_name VARCHAR(255) NOT NULL,
  course_code VARCHAR(50)  NOT NULL,
  semester    VARCHAR(100) NOT NULL,
  credits     INT DEFAULT 3,
  grade       VARCHAR(10),
  status      VARCHAR(20) DEFAULT 'IN PROGRESS',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ta_grade_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ta_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  course_id     UUID REFERENCES courses(id) ON DELETE CASCADE,
  section_label VARCHAR(50) NOT NULL,
  submitted_at  TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ,
  reviewed_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  status        VARCHAR(20) DEFAULT 'PENDING',
  professor_note TEXT,
  UNIQUE(ta_id, assessment_id, section_label)
);

ALTER TABLE attendance_sessions ADD COLUMN IF NOT EXISTS section_label VARCHAR(50);
ALTER TABLE attendance_sessions ADD COLUMN IF NOT EXISTS ta_id UUID REFERENCES users(id) ON DELETE SET NULL;