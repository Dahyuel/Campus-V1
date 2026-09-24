import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// AUDIT-FIX: student-only hooks are gated on role so a non-student render
// does not fire /student/* requests that would 403.
function useIsStudent(): boolean {
  const { user } = useAuth();
  return user?.roleType === 'student';
}

export const useStudentCourses = () => {
  const enabled = useIsStudent();
  return useQuery({
    queryKey: ['student', 'courses'],
    queryFn: () => api.get('/student/courses').then((r) => r.data),
    enabled,
  });
};

export const useStudentTranscript = () => {
  const enabled = useIsStudent();
  return useQuery({
    queryKey: ['student', 'transcript'],
    queryFn: () => api.get('/student/transcript').then((r) => r.data),
    enabled,
  });
};

export const useStudentSchedule = () => {
  const enabled = useIsStudent();
  return useQuery({
    queryKey: ['student', 'schedule'],
    queryFn: () => api.get('/student/schedule').then((r) => r.data),
    enabled,
  });
};

export const useStudentEvents = () => {
  const enabled = useIsStudent();
  return useQuery({
    queryKey: ['student', 'events'],
    queryFn: () => api.get('/student/events').then((r) => r.data),
    enabled,
  });
};

export const useStudentDashboard = () => {
  const enabled = useIsStudent();
  return useQuery({
    queryKey: ['student', 'dashboard'],
    queryFn: () => api.get('/student/dashboard').then((r) => r.data),
    enabled,
  });
};

export const useStudentMaterials = () => {
  const enabled = useIsStudent();
  return useQuery({
    queryKey: ['student', 'materials'],
    queryFn: () => api.get('/student/materials').then((r) => r.data),
    enabled,
  });
};

export const useMaterialUrl = () => {
  return useMutation({
    mutationFn: (materialId: string) =>
      api.get(`/student/materials/${materialId}/url`).then((r) => r.data.url as string),
  });
};
