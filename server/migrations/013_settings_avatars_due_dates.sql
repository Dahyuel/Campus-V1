-- Per-user settings (notification mutes, default course, language).
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Object-storage key of an uploaded profile photo; avatar_url then points at
-- the public /avatars/:userId route that streams it.
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_key VARCHAR(500);

-- Assessment deadlines for Grade Entry.
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS due_date DATE;
