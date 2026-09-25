import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface StudentRecording {
  id: string;
  courseCode: string;
  courseName: string;
  lectureLabel: string;
  uploadedAt: string;
  duration: string;
  status: string;
  accessType: 'attended' | 'excuse';
  hasTranscript: boolean;
  streamUrl: string | null;
}

export interface FacultyRecording {
  id: string;
  lectureLabel: string;
  uploadedAt: string;
  duration: string;
  status: string;
  accessCount: number;
  excuseCount: number;
  transcriptSegments: number;
  fileKey: string;
}

export interface TranscriptSegment {
  index: number;
  startTime: string;
  endTime: string;
  text: string;
}

export interface TranscriptResponse {
  recordingId: string;
  segments: TranscriptSegment[];
  fullText: string;
}

export const useStudentRecordings = () =>
  useQuery({
    queryKey: ['student', 'recordings'],
    queryFn: () => api.get('/student/recordings').then((r) => r.data as StudentRecording[]),
  });

export const useRecordingStreamUrl = () =>
  useMutation({
    mutationFn: (id: string) =>
      api.get(`/student/recordings/${id}/stream-url`).then((r) => r.data as { url: string; expiresAt: string }),
  });

export const useStudentTranscript = (recordingId: string | null) =>
  useQuery({
    queryKey: ['student', 'recordings', recordingId, 'transcript'],
    queryFn: () => api.get(`/student/recordings/${recordingId}/transcript`).then((r) => r.data as TranscriptResponse),
    enabled: !!recordingId,
  });

export const useFacultyRecordings = (courseId: string | null) =>
  useQuery({
    queryKey: ['faculty', 'recordings', courseId],
    queryFn: () => api.get(`/faculty/recordings?courseId=${courseId}`).then((r) => r.data as FacultyRecording[]),
    enabled: !!courseId,
  });

export const useRecordingAccess = (recordingId: string | null) =>
  useQuery({
    queryKey: ['faculty', 'recordings', recordingId, 'access'],
    queryFn: () => api.get(`/faculty/recordings/${recordingId}/access`).then((r) => r.data),
    enabled: !!recordingId,
  });

export const useFacultyTranscript = (recordingId: string | null) =>
  useQuery({
    queryKey: ['faculty', 'recordings', recordingId, 'transcript'],
    queryFn: () => api.get(`/faculty/recordings/${recordingId}/transcript`).then((r) => r.data as TranscriptResponse),
    enabled: !!recordingId,
  });

export const useGrantRecordingAccess = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recordingId, studentId }: { recordingId: string; studentId: string }) =>
      api.post(`/faculty/recordings/${recordingId}/grant-access`, { studentId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculty', 'recordings'] }),
  });
};

export const useRevokeRecordingAccess = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recordingId, studentId }: { recordingId: string; studentId: string }) =>
      api.delete(`/faculty/recordings/${recordingId}/revoke-access/${studentId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculty', 'recordings'] }),
  });
};

export const useUploadRecording = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      api
        .post('/faculty/recordings/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faculty', 'recordings'] }),
  });
};