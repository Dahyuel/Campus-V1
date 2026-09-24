import axios from 'axios';
import { getAccessToken, setAccessToken, refreshAccessToken } from '../api/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function streamAIMessage(
  sessionId: string,
  text: string,
  onToken: (token: string) => void,
  onDone: (messageId: string, citation: string) => void,
  onError: (err: Error) => void
) {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE_URL}/ai/sessions/${sessionId}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? ''}`,
    },
    body: JSON.stringify({ text }),
    credentials: 'include',
  });

  if (!res.ok || !res.body) {
    onError(new Error('Stream failed'));
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split('\n').filter((l) => l.startsWith('data: '));
    for (const line of lines) {
      const payload = JSON.parse(line.slice(6));
      if (payload.type === 'token') onToken(payload.content);
      if (payload.type === 'done') onDone(payload.messageId, payload.citation);
    }
  }
}

let refreshPromise: Promise<string> | null = null;

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return ['/auth/refresh', '/auth/login'].some((path) => url.includes(path));
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken()
            .then((result) => result.accessToken)
            .finally(() => {
              refreshPromise = null;
            });
        }
        const accessToken = await refreshPromise;
        setAccessToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        setAccessToken(null);
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);
