import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useDeptHeadDashboard = () =>
  useQuery({ queryKey: ['depthead', 'dashboard'], queryFn: () => api.get('/depthead/dashboard').then((r) => r.data) });

export const useDeptHeadCourses = () =>
  useQuery({ queryKey: ['depthead', 'courses'], queryFn: () => api.get('/depthead/courses').then((r) => r.data) });

export const useDeptHeadFaculty = () =>
  useQuery({ queryKey: ['depthead', 'faculty'], queryFn: () => api.get('/depthead/faculty').then((r) => r.data) });

export const useDeptHeadStudents = () =>
  useQuery({ queryKey: ['depthead', 'students'], queryFn: () => api.get('/depthead/students').then((r) => r.data) });

export const useDeptHeadAtRisk = () =>
  useQuery({ queryKey: ['depthead', 'at-risk'], queryFn: () => api.get('/depthead/at-risk').then((r) => r.data) });

export const useDeptHeadAnalytics = () =>
  useQuery({ queryKey: ['depthead', 'analytics'], queryFn: () => api.get('/depthead/analytics').then((r) => r.data) });

export const useDeptHeadReports = () =>
  useQuery({ queryKey: ['depthead', 'reports'], queryFn: () => api.get('/depthead/reports').then((r) => r.data) });

export const useLogIntervention = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, action, note }: { studentId: string; action: string; note?: string }) =>
      api.post(`/depthead/at-risk/${studentId}/intervene`, { action, note }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['depthead', 'at-risk'] }),
  });
};
