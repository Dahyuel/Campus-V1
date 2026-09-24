import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useAdminChannels = () =>
  useQuery({
    queryKey: ['admin', 'channels'],
    queryFn: () => api.get('/admin/messages/channels').then((r) => r.data),
  });

export const useAdminDirectConversations = () =>
  useQuery({
    queryKey: ['admin', 'messages'],
    queryFn: () => api.get('/admin/messages/direct').then((r) => r.data),
  });

export const useAdminMessageThread = (userId: string | null) =>
  useQuery({
    queryKey: ['admin', 'messages', userId],
    queryFn: () => api.get(`/admin/messages/direct/${userId}`).then((r) => r.data),
    enabled: !!userId,
  });

export const useSendBroadcast = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { channelType: string; body: string }) =>
      api.post('/admin/messages/broadcast', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'channels'] }),
  });
};

export const useSendAdminDirectMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: string }) =>
      api.post(`/admin/messages/direct/${userId}`, { body }).then((r) => r.data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['admin', 'messages', vars.userId] }),
  });
};
