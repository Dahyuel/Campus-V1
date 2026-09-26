-- Per-course community policy set by the course's faculty.
-- Absent row means the defaults below apply.

CREATE TABLE IF NOT EXISTS community_settings (
  course_id          UUID PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
  allow_anonymous    BOOLEAN NOT NULL DEFAULT true,
  auto_ai_response   BOOLEAN NOT NULL DEFAULT true,
  post_notifications BOOLEAN NOT NULL DEFAULT true,
  updated_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_by         UUID REFERENCES users(id)
);
