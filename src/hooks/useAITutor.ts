import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useAITutorSessions = () =>
  useQuery({
    queryKey: ['ai', 'sessions'],
    queryFn: () => api.get('/ai/sessions').then((r) => r.data),
  });

export const useCreateAISession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseCode: string) => api.post('/ai/sessions', { courseCode }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai', 'sessions'] }),
  });
};
