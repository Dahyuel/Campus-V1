export type RoleType = 'student' | 'faculty' | 'admin' | 'dept-head' | 'dean' | 'teaching-assistant';

export type TabId = 
  | 'home' 
  // Student
  | 'courses' 
  | 'my-courses'
  | 'materials'
  | 'schedule' 
  | 'grades' 
  | 'community' 
  | 'ai-tutor' 
  | 'smart-schedule'
  | 'todo-list'
  | 'recordings'
  // Faculty
  | 'my-students'
  | 'attendance'
  | 'grade-entry'
  | 'course-community'
  // Admin
  | 'students'
  | 'faculty-staff'
  | 'enrollment'
  | 'finance'
  | 'exam-scheduling'
  | 'analytics'
  | 'reports'
  // Dept Head
  | 'at-risk'
  // Dean
  | 'departments'
  | 'academic-overview'
  | 'financial-overview'
  | 'university-analytics'
  // Teaching Assistant
  | 'ta-sections'
  | 'ta-attendance'
  | 'ta-grades'
  | 'ta-students'
  | 'ta-materials'
  | 'ta-academic-record'
  // Common
  | 'messages' 
  | 'settings' 
  | 'help';

export interface User {
  id: string;
  name: string;
  role: string;
  roleType: RoleType;
  email: string;
  codeId: string;
  avatarUrl: string;
  messageBadge?: number;
}

export interface NavItemConfig {
  id: TabId;
  label: string;
  iconName: string;
  badge?: string | number;
}

export interface ActivityItem {
  id: string;
  type: 'assignment' | 'invoice' | 'grade';
  title: string;
  subject?: string;
  code?: string;
  time: string;
}

export interface InvoiceItem {
  id: string;
  no: string;
  dateCreated: string;
  client: string;
  amount: string;
  status: 'PAID' | 'OVERDUE' | 'PENDING';
}

export interface GradeSubject {
  subject: string;
  shortLabel: string;
  score: number;
  maxScore: number;
  highlighted?: boolean;
}
