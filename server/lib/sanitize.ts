// Lightweight HTML escape helper to mitigate stored XSS in JSON responses.
// For rich text, use a proper sanitizer on the client instead.

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

const ESCAPE_REGEX = /[&<>"'/]/g;

export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(ESCAPE_REGEX, (char) => ESCAPE_MAP[char] ?? char);
}

export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  keys: Array<keyof T>
): T {
  const copy = { ...obj };
  for (const key of keys) {
    const value = copy[key];
    if (typeof value === 'string') {
      (copy as Record<string, unknown>)[key as string] = escapeHtml(value);
    }
  }
  return copy;
}
