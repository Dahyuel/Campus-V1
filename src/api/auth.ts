import { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

let inMemoryAccessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? 'Request failed');
  }
  return data as T;
}

export interface LoginResult {
  accessToken: string;
  user: User;
}

export async function login(identifier: string, password: string): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ identifier, password }),
  });

  const result = await handleResponse<LoginResult>(response);
  setAccessToken(result.accessToken);
  return result;
}

export interface RefreshResult {
  accessToken: string;
}

export async function refreshAccessToken(): Promise<RefreshResult> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({}),
  });

  const result = await handleResponse<RefreshResult>(response);
  setAccessToken(result.accessToken);
  return result;
}

export async function getMe(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  return handleResponse<User>(response);
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({}),
  });

  await handleResponse<{ message: string }>(response);
  setAccessToken(null);
}
