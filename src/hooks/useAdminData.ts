import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useAdminDashboard = () =>
  useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data),
  });

export const useAdminStudents = () =>
  useQuery({
    queryKey: ['admin', 'students'],
    queryFn: () => api.get('/admin/students').then(r => r.data),
  });

export const useAdminFaculty = () =>
  useQuery({
    queryKey: ['admin', 'faculty'],
    queryFn: () => api.get('/admin/faculty').then(r => r.data),
  });

export const useAdminStaff = () =>
  useQuery({
    queryKey: ['admin', 'staff'],
    queryFn: () => api.get('/admin/staff').then(r => r.data),
  });

export const useAdminLeaveRequests = () =>
  useQuery({
    queryKey: ['admin', 'leave-requests'],
    queryFn: () => api.get('/admin/leave-requests').then(r => r.data),
  });

export const useAdminEnrollment = () =>
  useQuery({
    queryKey: ['admin', 'enrollment'],
    queryFn: () => api.get('/admin/enrollment').then(r => r.data),
  });

export const useAdminFinance = () =>
  useQuery({
    queryKey: ['admin', 'finance'],
    queryFn: () => api.get('/admin/finance').then(r => r.data),
  });

export const useAdminExams = () =>
  useQuery({
    queryKey: ['admin', 'exams'],
    queryFn: () => api.get('/admin/exams').then(r => r.data),
  });

export const useAdminAnalytics = () =>
  useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => api.get('/admin/analytics').then(r => r.data),
  });

export const useAdminReports = () =>
  useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => api.get('/admin/reports').then(r => r.data),
  });

export const useCreateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/admin/students', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'students'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
};

export const useUpdateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch(`/admin/students/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'students'] }),
  });
};

export const useDeactivateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/admin/students/${id}/deactivate`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'students'] }),
  });
};

export const useCreateFaculty = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/admin/faculty', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'faculty'] }),
  });
};

export const useUpdateLeaveRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/leave-requests/${id}`, { status }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'leave-requests'] }),
  });
};

export const useEnrollStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { studentId: string; courseId: string }) =>
      api.post('/admin/enrollment', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'enrollment'] }),
  });
};

export const useDropEnrollment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) =>
      api.delete(`/admin/enrollment/${enrollmentId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'enrollment'] }),
  });
};

export const useSendReminder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: string) =>
      api.post(`/admin/finance/reminder/${invoiceId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'finance'] }),
  });
};

export const useSendBulkReminder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/admin/finance/reminder/bulk').then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'finance'] }),
  });
};

export const useCreateExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/admin/exams', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'exams'] }),
  });
};

export const useUpdateExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch(`/admin/exams/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'exams'] }),
  });
};

export const useResolveConflict = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conflictId: string) =>
      api.patch(`/admin/exams/conflicts/${conflictId}/resolve`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'exams'] }),
  });
};

export const useUpdateRegistration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/registrations/${id}`, { status }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
  });
};

export const useGenerateReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; type: string; format: string }) =>
      api.post('/admin/reports/generate', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  });
};
