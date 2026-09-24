import { SeededUser } from '../types.js';
import { pool } from '../db/client.js';

interface UserRow {
  id: string;
  name: string;
  email: string;
  username: string;
  password_hash: string;
  role_type: SeededUser['roleType'];
  code_id: string;
  avatar_url: string | null;
  message_badge: number | null;
  is_active: boolean | null;
}

const ROLE_LABELS: Record<SeededUser['roleType'], string> = {
  student: 'Student',
  faculty: 'Faculty',
  admin: 'Admin',
  'dept-head': 'Dept. Head — Computer Science',
  dean: 'Dean',
};

function mapRow(row: UserRow): SeededUser {
  return {
    id: row.id,
    name: row.name,
    role: ROLE_LABELS[row.role_type],
    roleType: row.role_type,
    email: row.email,
    username: row.username,
    codeId: row.code_id,
    avatarUrl: row.avatar_url ?? '',
    messageBadge: row.message_badge ?? 0,
    passwordHash: row.password_hash,
    isActive: row.is_active === null ? true : row.is_active,
  };
}

export async function findUserByIdentifier(identifier: string): Promise<SeededUser | undefined> {
  const clean = identifier.trim().toLowerCase();
  const result = await pool.query<UserRow>(
    `SELECT id, name, email, username, password_hash, role_type, code_id, avatar_url, message_badge, is_active
     FROM users
     WHERE LOWER(email) = $1 OR LOWER(username) = $1
     LIMIT 1`,
    [clean]
  );
  const row = result.rows[0];
  return row ? mapRow(row) : undefined;
}

export async function findUserById(id: string): Promise<SeededUser | undefined> {
  const result = await pool.query<UserRow>(
    `SELECT id, name, email, username, password_hash, role_type, code_id, avatar_url, message_badge, is_active
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  const row = result.rows[0];
  return row ? mapRow(row) : undefined;
}

export function stripSensitive(user: SeededUser): Omit<SeededUser, 'passwordHash' | 'username'> {
  const { passwordHash: _passwordHash, username: _username, ...publicUser } = user;
  return publicUser;
}