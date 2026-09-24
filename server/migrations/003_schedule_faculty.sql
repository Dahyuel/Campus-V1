-- AUDIT I.10/M.1: per-slot faculty for schedule slots
ALTER TABLE schedule_slots
  ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES users(id) ON DELETE SET NULL;
