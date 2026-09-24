import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useDeanDashboard = () =>
  useQuery({ queryKey: ['dean', 'dashboard'], queryFn: () => api.get('/dean/dashboard').then((r) => r.data) });

export const useDeanDepartments = () =>
  useQuery({ queryKey: ['dean', 'departments'], queryFn: () => api.get('/dean/departments').then((r) => r.data) });

export const useDeanAcademicOverview = () =>
  useQuery({ queryKey: ['dean', 'academic-overview'], queryFn: () => api.get('/dean/academic-overview').then((r) => r.data) });

export const useDeanUniversityAnalytics = () =>
  useQuery({ queryKey: ['dean', 'university-analytics'], queryFn: () => api.get('/dean/university-analytics').then((r) => r.data) });

export const useDeanFinancialOverview = () =>
  useQuery({ queryKey: ['dean', 'financial-overview'], queryFn: () => api.get('/dean/financial-overview').then((r) => r.data) });

export const useDeanReports = () =>
  useQuery({ queryKey: ['dean', 'reports'], queryFn: () => api.get('/dean/reports').then((r) => r.data) });
