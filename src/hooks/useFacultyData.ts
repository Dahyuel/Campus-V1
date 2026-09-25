import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useFacultyDashboard = () =>
  useQuery({
    queryKey: ['faculty', 'dashboard'],
    queryFn: () => api.get('/faculty/dashboard').then((r) => r.data),
  });

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

export const useFacultyGrades = (courseId: string | null, assessmentTitle: string) =>
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculty', 'grades'] }),
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

export const useSendMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: string }) =>
      api.post(`/faculty/messages/${userId}`, { body }).then((r) => r.data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['faculty', 'messages', vars.userId] }),
  });
};
