import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Todo {
  id: string;
  title: string;
  courseCode: string | null;
  dueDate: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'done';
  isSuggested: boolean;
  suggestionReason: string | null;
}

export interface SuggestedTodo {
  title: string;
  courseCode: string | null;
  priority: 'high' | 'medium' | 'low';
  isSuggested: boolean;
  suggestionReason: string;
}

export const useTodos = () =>
  useQuery({
    queryKey: ['todos'],
    queryFn: () => api.get('/todos').then((r) => r.data as { todos: Todo[]; suggestions: SuggestedTodo[] }),
  });

export const useCreateTodo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; courseCode?: string | null; dueDate?: string | null; priority: string }) =>
      api.post('/todos', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
};

export const useUpdateTodo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; priority?: string; dueDate?: string | null; status?: string }) =>
      api.patch(`/todos/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
};

export const useMarkDone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/todos/${id}/done`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
};

export const useDeleteTodo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/todos/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
};

export const useAcceptSuggestion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SuggestedTodo) => api.post('/todos/accept-suggestion', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
};