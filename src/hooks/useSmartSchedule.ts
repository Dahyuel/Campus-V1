import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useSchedulePreferences = () =>
  useQuery({
    queryKey: ['schedule', 'preferences'],
    queryFn: () => api.get('/schedule-ai/preferences').then((r) => r.data),
  });

export const useSavePreferences = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/schedule-ai/preferences', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedule', 'preferences'] }),
  });
};

export const useGenerateSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/schedule-ai/generate').then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedule', 'cached'] }),
  });
};

export const useCachedSchedule = () =>
  useQuery({
    queryKey: ['schedule', 'cached'],
    queryFn: () => api.get('/schedule-ai/cached').then((r) => r.data),
  });