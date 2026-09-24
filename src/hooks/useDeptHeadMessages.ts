import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useDeptHeadConversations = () =>
  useQuery({
    queryKey: ['depthead', 'messages'],
    queryFn: () => api.get('/depthead/messages').then((r) => r.data),
  });

export const useDeptHeadMessageThread = (userId: string | null) =>
  useQuery({
    queryKey: ['depthead', 'messages', userId],
    queryFn: () => api.get(`/depthead/messages/${userId}`).then((r) => r.data),
    enabled: !!userId,
  });

export const useSendDeptHeadMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: string }) =>
      api.post(`/depthead/messages/${userId}`, { body }).then((r) => r.data),
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ['depthead', 'messages', v.userId] }),
  });
};
