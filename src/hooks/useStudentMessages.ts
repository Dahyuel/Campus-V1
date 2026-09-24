import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useStudentConversations = () =>
  useQuery({
    queryKey: ['student', 'messages'],
    queryFn: () => api.get('/student/messages').then((r) => r.data),
  });

export const useStudentMessageThread = (userId: string | null) =>
  useQuery({
    queryKey: ['student', 'messages', userId],
    queryFn: () => api.get(`/student/messages/${userId}`).then((r) => r.data),
    enabled: !!userId,
  });

export const useSendStudentMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: string }) =>
      api.post(`/student/messages/${userId}`, { body }).then((r) => r.data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['student', 'messages', vars.userId] }),
  });
};
