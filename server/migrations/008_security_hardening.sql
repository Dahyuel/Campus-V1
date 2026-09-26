-- Security hardening migration
-- Adds data-integrity constraints and defense-in-depth controls.

-- 1. Ensure users.code_id stays unique and non-empty
ALTER TABLE users ADD CONSTRAINT users_code_id_not_empty CHECK (code_id <> '');

-- 2. Ensure password_hash is never empty
ALTER TABLE users ADD CONSTRAINT users_password_hash_not_empty CHECK (password_hash <> '');

-- 3. Grade values must be within a sensible range
ALTER TABLE grades ADD CONSTRAINT grades_grade_range CHECK (grade IS NULL OR (grade >= 0 AND grade <= 1000));

-- 4. Attendance percentages must be 0-100
ALTER TABLE enrollments ADD CONSTRAINT enrollments_attendance_range CHECK (attendance_pct >= 0 AND attendance_pct <= 100);

-- 5. Assessment weights should be non-empty and reasonable
ALTER TABLE assessments ADD CONSTRAINT assessments_weight_not_empty CHECK (weight_pct <> '');

-- 6. Exam schedule status enum constraint
ALTER TABLE exam_schedule ADD CONSTRAINT exam_schedule_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED'));

-- 7. Invoice amounts must be non-negative
ALTER TABLE invoices ADD CONSTRAINT invoices_amount_non_negative CHECK (amount_cents >= 0);

-- 8. Course capacity must be positive
ALTER TABLE courses ADD CONSTRAINT courses_capacity_positive CHECK (capacity IS NULL OR capacity > 0);

-- 9. Indexes to speed up authorization checks
CREATE INDEX IF NOT EXISTS idx_enrollments_course_status ON enrollments(course_id, status);
CREATE INDEX IF NOT EXISTS idx_community_posts_course_id ON community_posts(course_id);
CREATE INDEX IF NOT EXISTS idx_at_risk_flags_course_id ON at_risk_flags(course_id);
CREATE INDEX IF NOT EXISTS idx_faculty_course_assignments_faculty_course ON faculty_course_assignments(faculty_id, course_id);

-- 10. Row-level security as defense in depth.
-- The application connects with a single privileged DB user, so these policies
-- primarily protect against accidental direct SQL access / future API exposure.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Allow full table access to the application role (campus).
-- In a multi-tenant or direct-client setup, replace these with user-scoped policies.
CREATE POLICY users_all_campus ON users FOR ALL TO campus USING (true) WITH CHECK (true);

CREATE POLICY enrollments_all_campus ON enrollments FOR ALL TO campus USING (true) WITH CHECK (true);

CREATE POLICY grades_all_campus ON grades FOR ALL TO campus USING (true) WITH CHECK (true);

CREATE POLICY messages_all_campus ON messages FOR ALL TO campus USING (true) WITH CHECK (true);

CREATE POLICY notifications_all_campus ON notifications FOR ALL TO campus USING (true) WITH CHECK (true);

CREATE POLICY tutor_sessions_all_campus ON tutor_sessions FOR ALL TO campus USING (true) WITH CHECK (true);

CREATE POLICY tutor_messages_all_campus ON tutor_messages FOR ALL TO campus USING (true) WITH CHECK (true);

CREATE POLICY community_posts_all_campus ON community_posts FOR ALL TO campus USING (true) WITH CHECK (true);

CREATE POLICY course_materials_all_campus ON course_materials FOR ALL TO campus USING (true) WITH CHECK (true);

CREATE POLICY attendance_records_all_campus ON attendance_records FOR ALL TO campus USING (true) WITH CHECK (true);
