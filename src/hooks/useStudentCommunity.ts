import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useStudentCommunityPosts = (courseCode?: string) =>
  useQuery({
    queryKey: ['student', 'community', courseCode],
    queryFn: () =>
      api.get(`/student/community${courseCode ? `?courseCode=${courseCode}` : ''}`).then((r) => r.data),
  });

export const useCommunitySettings = (courseCode?: string) =>
  useQuery({
    queryKey: ['student', 'community', 'settings', courseCode],
    queryFn: () =>
      api.get(`/student/community/settings?courseCode=${courseCode}`).then((r) => r.data),
    enabled: !!courseCode,
  });

export const useCreateCommunityPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      courseCode: string;
      type: string;
      title: string;
      body: string;
      isAnonymous: boolean;
    }) => api.post('/student/community', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student', 'community'] }),
  });
};

export const useUpvotePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      api.post(`/student/community/${postId}/upvote`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['student', 'community'] }),
  });
};
