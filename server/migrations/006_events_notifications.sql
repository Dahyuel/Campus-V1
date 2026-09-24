-- Notifications table (written by RabbitMQ consumers)
CREATE TABLE IF NOT EXISTS notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  body         TEXT,
  type         VARCHAR(50) DEFAULT 'info',
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Department-level aggregated stats (refreshed by at-risk consumer)
CREATE TABLE IF NOT EXISTS dept_stats (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id  UUID REFERENCES departments(id) ON DELETE CASCADE UNIQUE,
  at_risk_count  INT DEFAULT 0,
  pass_rate      NUMERIC(5,2) DEFAULT 0,
  avg_attendance NUMERIC(5,2) DEFAULT 0,
  refreshed_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_dept_stats_department_id ON dept_stats(department_id);
