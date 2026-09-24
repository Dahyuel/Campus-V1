import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useDeanConversations = () =>
  useQuery({
    queryKey: ['dean', 'messages'],
    queryFn: () => api.get('/dean/messages').then((r) => r.data),
  });

export const useDeanMessageThread = (userId: string | null) =>
  useQuery({
    queryKey: ['dean', 'messages', userId],
    queryFn: () => api.get(`/dean/messages/${userId}`).then((r) => r.data),
    enabled: !!userId,
  });

export const useSendDeanMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: string }) =>
      api.post(`/dean/messages/${userId}`, { body }).then((r) => r.data),
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ['dean', 'messages', v.userId] }),
  });
};
