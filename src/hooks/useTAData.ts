import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useTADashboard = () =>
  useQuery({ queryKey: ['ta', 'dashboard'], queryFn: () => api.get('/ta/dashboard').then((r) => r.data) });

export const useTASections = () =>
  useQuery({ queryKey: ['ta', 'sections'], queryFn: () => api.get('/ta/sections').then((r) => r.data) });

export const useTASectionStudents = (courseId: string | null, section: string | null) =>
  useQuery({
    queryKey: ['ta', 'sections', courseId, section],
    queryFn: () =>
      api.get(`/ta/sections/${courseId}/students?section=${encodeURIComponent(section!)}`).then((r) => r.data),
    enabled: !!courseId && !!section,
  });

export const useTAAttendanceSessions = (courseId: string | null) =>
  useQuery({
    queryKey: ['ta', 'attendance', 'sessions', courseId],
    queryFn: () => api.get(`/ta/attendance/sessions?courseId=${courseId}`).then((r) => r.data),
    enabled: !!courseId,
  });

export const useTAAttendanceSummary = (courseId: string | null) =>
  useQuery({
    queryKey: ['ta', 'attendance', 'summary', courseId],
    queryFn: () => api.get(`/ta/attendance/summary?courseId=${courseId}`).then((r) => r.data),
    enabled: !!courseId,
  });

export const useTAGrades = (courseId: string | null, assessmentTitle: string) =>
  useQuery({
    queryKey: ['ta', 'grades', courseId, assessmentTitle],
    queryFn: () =>
      api.get(`/ta/grades?courseId=${courseId}&assessmentTitle=${encodeURIComponent(assessmentTitle)}`).then((r) => r.data),
    enabled: !!courseId && !!assessmentTitle,
  });

export const useTAGradeSubmissions = () =>
  useQuery({ queryKey: ['ta', 'grades', 'submissions'], queryFn: () => api.get('/ta/grades/submissions').then((r) => r.data) });

export const useTAStudents = () =>
  useQuery({ queryKey: ['ta', 'students'], queryFn: () => api.get('/ta/students').then((r) => r.data) });

export const useTAMaterials = () =>
  useQuery({ queryKey: ['ta', 'materials'], queryFn: () => api.get('/ta/materials').then((r) => r.data) });

export const useTAAcademicRecord = () =>
  useQuery({ queryKey: ['ta', 'academic-record'], queryFn: () => api.get('/ta/academic-record').then((r) => r.data) });

export const useCreateTAAttendanceSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { courseId: string; lectureLabel: string; sectionLabel: string }) =>
      api.post('/ta/attendance/session', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ta', 'attendance'] }),
  });
};

export const useSaveTAGrades = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { courseId: string; assessmentTitle: string; entries: Array<{ studentId: string; grade: number }> }) =>
      api.post('/ta/grades', payload).then((r) => r.data),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['ta', 'grades', vars.courseId] }),
  });
};

export const useSubmitTAGrades = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { courseId: string; assessmentTitle: string; sectionLabel: string }) =>
      api.post('/ta/grades/submit', payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ta', 'grades'] });
      qc.invalidateQueries({ queryKey: ['ta', 'dashboard'] });
    },
  });
};

export const useFlagTAStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { studentId: string; courseId: string; sectionLabel: string; reason: string }) =>
      api
        .post(`/ta/students/${payload.studentId}/flag`, {
          courseId: payload.courseId,
          sectionLabel: payload.sectionLabel,
          reason: payload.reason,
        })
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ta', 'students'] }),
  });
};

export const useResolveTAFlag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { studentId: string; courseId: string }) =>
      api.delete(`/ta/students/${payload.studentId}/flag?courseId=${payload.courseId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ta', 'students'] }),
  });
};

export const useUploadTAMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.post('/ta/materials/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ta', 'materials'] }),
  });
};

export const useDeleteTAMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/ta/materials/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ta', 'materials'] }),
  });
};

export const useUpdateTAAcademicRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.put('/ta/academic-record', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ta', 'academic-record'] }),
  });
};

export const useAddPostgradCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/ta/academic-record/courses', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ta', 'academic-record'] }),
  });
};

export const useUpdatePostgradCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.patch(`/ta/academic-record/courses/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ta', 'academic-record'] }),
  });
};

export const useDeletePostgradCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/ta/academic-record/courses/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ta', 'academic-record'] }),
  });
};

export const useTAConversations = () =>
  useQuery({ queryKey: ['ta', 'messages'], queryFn: () => api.get('/ta/messages').then((r) => r.data) });

export const useTAMessageThread = (userId: string | null) =>
  useQuery({
    queryKey: ['ta', 'messages', userId],
    queryFn: () => api.get(`/ta/messages/${userId}`).then((r) => r.data),
    enabled: !!userId,
  });

export const useSendTAMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: string }) =>
      api.post(`/ta/messages/${userId}`, { body }).then((r) => r.data),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['ta', 'messages', v.userId] }),
  });
};
