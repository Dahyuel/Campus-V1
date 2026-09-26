-- Faculty profile fields backing the Settings tab.
-- Office hours are one row per weekday so a day can be marked closed.

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS academic_rank VARCHAR(100);

CREATE TABLE IF NOT EXISTS office_hours (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20) NOT NULL,
  start_time  VARCHAR(20),
  end_time    VARCHAR(20),
  location    VARCHAR(255),
  is_closed   BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (user_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_office_hours_user_id ON office_hours(user_id);
