import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useFacultyDashboard = () =>
  useQuery({
    queryKey: ['faculty', 'dashboard'],
    queryFn: () => api.get('/faculty/dashboard').then((r) => r.data),
  });

export interface OfficeHourSlot {
  day: string;
  start: string;
  end: string;
  location: string;
  isClosed: boolean;
}

export interface FacultyProfile {
  name: string;
  email: string;
  phone: string;
  rank: string;
  codeId: string;
  avatarUrl: string | null;
  department: string | null;
  courseCount: number;
  creditHours: number;
  studentCount: number;
  preferences: FacultyPreferences;
  officeHours: OfficeHourSlot[];
}

export type MutableNotificationType = 'grade' | 'alert';

export interface FacultyPreferences {
  mutedNotificationTypes: MutableNotificationType[];
  defaultCourseId: string | null;
}

export const useSaveFacultyPreferences = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prefs: FacultyPreferences) =>
      api.patch('/faculty/preferences', prefs).then((r) => r.data as FacultyPreferences),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faculty', 'profile'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useUploadAvatar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api
        .post('/faculty/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((r) => r.data as { avatarUrl: string });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculty', 'profile'] }),
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      api.post('/auth/change-password', payload).then((r) => r.data),
  });

export const useSetAssessmentDueDate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ assessmentId, dueDate }: { assessmentId: string; dueDate: string | null }) =>
      api.patch(`/faculty/assessments/${assessmentId}/due-date`, { dueDate }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculty', 'assessments'] }),
  });
};

export const useFacultyProfile = () =>
  useQuery<FacultyProfile>({
    queryKey: ['faculty', 'profile'],
    queryFn: () => api.get('/faculty/profile').then((r) => r.data),
  });

export const useSaveFacultyProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      name: string;
      email: string;
      phone: string;
      rank: string;
      officeHours: OfficeHourSlot[];
    }) => api.patch('/faculty/profile', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculty', 'profile'] }),
  });
};

export const useFacultyCourses = () =>
  useQuery({
    queryKey: ['faculty', 'courses'],
    queryFn: () => api.get('/faculty/courses').then((r) => r.data),
  });

export const useFacultyMaterials = () =>
  useQuery({
    queryKey: ['faculty', 'materials'],
    queryFn: () => api.get('/faculty/materials').then((r) => r.data),
  });

export const useFacultyStudents = () =>
  useQuery({
    queryKey: ['faculty', 'students'],
    queryFn: () => api.get('/faculty/students').then((r) => r.data),
  });

export const useFacultyAttendanceSessions = (courseId: string | null) =>
  useQuery({
    queryKey: ['faculty', 'attendance', 'sessions', courseId],
    queryFn: () => api.get(`/faculty/attendance/sessions?courseId=${courseId}`).then((r) => r.data),
    enabled: !!courseId,
  });

export const useFacultyAttendanceSummary = (courseId: string | null) =>
  useQuery({
    queryKey: ['faculty', 'attendance', 'summary', courseId],
    queryFn: () => api.get(`/faculty/attendance/summary?courseId=${courseId}`).then((r) => r.data),
    enabled: !!courseId,
  });

export const useFacultyAssessments = (courseId: string | null) =>
  useQuery({
    queryKey: ['faculty', 'assessments', courseId],
    queryFn: () => api.get(`/faculty/assessments?courseId=${courseId}`).then((r) => r.data),
    enabled: !!courseId,
  });

export const useFacultyGrades =(courseId: string | null, assessmentTitle: string) =>
  useQuery({
    queryKey: ['faculty', 'grades', courseId, assessmentTitle],
    queryFn: () =>
      api
        .get(`/faculty/grades?courseId=${courseId}&assessmentTitle=${encodeURIComponent(assessmentTitle)}&showTAPending=true`)
        .then((r) => r.data),
    enabled: !!courseId,
  });

export const useFacultyMessages = () =>
  useQuery({
    queryKey: ['faculty', 'messages'],
    queryFn: () => api.get('/faculty/messages').then((r) => r.data),
  });

export const useBroadcastToStudents = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { studentIds: string[]; body: string }) =>
      api.post('/faculty/messages/broadcast', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculty', 'messages'] }),
  });
};

export const useFacultyMessageRecipients = () =>
  useQuery({
    queryKey: ['faculty', 'message-recipients'],
    queryFn: () => api.get('/faculty/message-recipients').then((r) => r.data),
  });

export const useFacultyMessageThread = (userId: string | null) =>
  useQuery({
    queryKey: ['faculty', 'messages', userId],
    queryFn: () => api.get(`/faculty/messages/${userId}`).then((r) => r.data),
    enabled: !!userId,
  });

export const useFacultyCommunity = (courseId: string | null) =>
  useQuery({
    queryKey: ['faculty', 'community', courseId],
    queryFn: () => api.get(`/faculty/community?courseId=${courseId}`).then((r) => r.data),
    enabled: !!courseId,
  });

export const useUploadMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.post('/faculty/materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculty', 'materials'] }),
  });
};

export const getMaterialUrl = (materialId: string): Promise<string> =>
  api.get(`/faculty/materials/${materialId}/url`).then((r) => r.data.url);

export const useDeleteMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (materialId: string) => api.delete(`/faculty/materials/${materialId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculty', 'materials'] }),
  });
};

export const useSaveGrades = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { courseId: string; assessmentTitle: string; entries: Array<{ studentId: string; grade: number }> }) =>
      api.post('/faculty/grades', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculty', 'grades'] }),
  });
};

export const useReleaseGrades = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { courseId: string; assessmentTitle: string }) =>
      api.post('/faculty/grades/release', payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faculty', 'grades'] });
      qc.invalidateQueries({ queryKey: ['faculty', 'assessments'] });
    },
  });
};

export const useReviewTaSubmission = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, decision, note }: { submissionId: string; decision: 'approve' | 'reject'; note?: string }) =>
      api
        .post(`/faculty/grades/submissions/${submissionId}/${decision}`, decision === 'reject' ? { note } : undefined)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['faculty', 'grades'] });
      qc.invalidateQueries({ queryKey: ['faculty', 'dashboard'] });
    },
  });
};

export const useCreateAttendanceSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { courseId: string; lectureLabel: string; latitude?: number; longitude?: number; radiusMeters?: number }) =>
      api.post('/faculty/attendance/session', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculty', 'attendance'] }),
  });
};

export interface LiveAttendance {
  isOpen: boolean;
  expiresAt: string | null;
  totalStudents: number;
  presentCount: number;
  present: Array<{ id: string; name: string; studentId: string; method: string; markedAt: string }>;
}

/** Polls check-ins while an attendance session is open. */
export interface SessionRoster {
  lectureLabel: string;
  date: string;
  isOpen: boolean;
  presentCount: number;
  absentCount: number;
  hasRecords: boolean;
  students: Array<{
    id: string;
    name: string;
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'NOT RECORDED';
    method: string | null;
    markedAt: string | null;
  }>;
}

export const useSessionRoster = (sessionId: string | null) =>
  useQuery<SessionRoster>({
    queryKey: ['faculty', 'attendance', 'roster', sessionId],
    queryFn: () => api.get(`/faculty/attendance/session/${sessionId}/roster`).then((r) => r.data),
    enabled: !!sessionId,
  });

export const useLiveAttendance = (sessionId: string | null) =>
  useQuery<LiveAttendance>({
    queryKey: ['faculty', 'attendance', 'live', sessionId],
    queryFn: () => api.get(`/faculty/attendance/session/${sessionId}/live`).then((r) => r.data),
    enabled: !!sessionId,
    refetchInterval: sessionId ? 5000 : false,
  });

export const useExtendAttendanceSession = () =>
  useMutation({
    mutationFn: (sessionId: string) =>
      api.post(`/faculty/attendance/session/${sessionId}/extend`).then((r) => r.data),
  });

export const useCloseAttendanceSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) =>
      api.post(`/faculty/attendance/session/${sessionId}/close`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculty', 'attendance'] }),
  });
};

export const useMarkAttendanceManual = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { sessionId: string; studentId: string; status: 'PRESENT' | 'ABSENT' | 'EXCUSED' }) =>
      api.post('/faculty/attendance/mark-manual', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculty', 'attendance'] }),
  });
};

export interface CommunitySettings {
  allowAnonymous: boolean;
  autoAiResponse: boolean;
  postNotifications: boolean;
}

export const useCommunitySettings = (courseId: string | null) =>
  useQuery<CommunitySettings>({
    queryKey: ['faculty', 'community', 'settings', courseId],
    queryFn: () => api.get(`/faculty/community/settings?courseId=${courseId}`).then((r) => r.data),
    enabled: !!courseId,
  });

export const useSaveCommunitySettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { courseId: string } & Partial<CommunitySettings>) =>
      api.patch('/faculty/community/settings', payload).then((r) => r.data),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ['faculty', 'community', 'settings', vars.courseId] }),
  });
};

export const useFacultyRemovedPosts = (courseId: string | null) =>
  useQuery({
    queryKey: ['faculty', 'community', 'removed', courseId],
    queryFn: () => api.get(`/faculty/community/removed?courseId=${courseId}`).then((r) => r.data),
    enabled: !!courseId,
  });

const useCommunityPostAction = (action: (postId: string) => Promise<unknown>) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculty', 'community'] }),
  });
};

export const useRestorePost = () =>
  useCommunityPostAction((postId) => api.patch(`/faculty/community/${postId}/restore`).then((r) => r.data));

export const useTogglePinPost = () =>
  useCommunityPostAction((postId) => api.patch(`/faculty/community/${postId}/pin`).then((r) => r.data));

export const useApproveAiAnswer = () =>
  useCommunityPostAction((postId) => api.patch(`/faculty/community/${postId}/approve-ai`).then((r) => r.data));

export const useFlagAiCorrection = () =>
  useCommunityPostAction((postId) => api.patch(`/faculty/community/${postId}/ai-correction`).then((r) => r.data));

export const useRemovePost = () =>
  useCommunityPostAction((postId) => api.delete(`/faculty/community/${postId}`).then((r) => r.data));

export const useSendMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: string }) =>
      api.post(`/faculty/messages/${userId}`, { body }).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['faculty', 'messages', vars.userId] });
      // Refresh the conversation list so a brand-new thread shows up
      qc.invalidateQueries({ queryKey: ['faculty', 'messages'], exact: true });
    },
  });
};
