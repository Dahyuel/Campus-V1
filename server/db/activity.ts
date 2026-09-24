import { pool } from './client.js';

export async function logActivity(
  userId: string,
  action: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO activity_log (user_id, action, metadata) VALUES ($1, $2, $3)`,
      [userId, action, metadata ?? null]
    );
  } catch (err) {
    console.error('Failed to write activity log:', err);
  }
}

export async function logRefreshToken(
  userId: string,
  jti: string,
  expiresAt: Date
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO refresh_token_log (user_id, jti, expires_at) VALUES ($1, $2, $3)`,
      [userId, jti, expiresAt]
    );
  } catch (err) {
    console.error('Failed to write refresh token log:', err);
  }
}

export async function revokeRefreshToken(jti: string): Promise<void> {
  try {
    await pool.query(`UPDATE refresh_token_log SET revoked = true WHERE jti = $1`, [jti]);
  } catch (err) {
    console.error('Failed to revoke refresh token log:', err);
  }
}