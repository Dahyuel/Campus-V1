// Shape of users.preferences. Unknown keys and bad values are dropped so the
// column can never feed garbage back to the client or the notification filter.

// Notification types a user may mute; others (e.g. 'info') always show.
export const MUTABLE_NOTIFICATION_TYPES = ['grade', 'alert'] as const;
export type MutableNotificationType = (typeof MUTABLE_NOTIFICATION_TYPES)[number];

export interface UserPreferences {
  mutedNotificationTypes: MutableNotificationType[];
  defaultCourseId: string | null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function normalizePreferences(raw: unknown): UserPreferences {
  const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const muted = Array.isArray(obj.mutedNotificationTypes) ? obj.mutedNotificationTypes : [];
  return {
    mutedNotificationTypes: MUTABLE_NOTIFICATION_TYPES.filter((t) => muted.includes(t)),
    defaultCourseId:
      typeof obj.defaultCourseId === 'string' && UUID_RE.test(obj.defaultCourseId) ? obj.defaultCourseId : null,
  };
}
