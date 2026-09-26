import { User, ActivityItem, InvoiceItem, GradeSubject, NavItemConfig, RoleType } from '../types';

export const CAMPUS_LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuANOUHsS2A32C6TTPU0QbyZztuA_QQ-a8oFZ0aB4sYvW344qtZFOJsflz7bqywyWhjCxaiqBB4TIhrvZ3_AFbsvJIbs8cW7QHfPMch8_6TppPfFEhGbVuTr0qLbD-fsD1c0CLqW6wrxmP1ZwPSOPTsqcnLHdS-54zEB3FKBZSSH8-669ZbmUJroFvsFi9utxNhex8HzG6O0kg_C7iq87tOQjrE_tTtZv8b3RRZXFekZfmP-_8vhprduuUvQWX1kjAPtlA';

export const SHARED_AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOWpAWSY7hyaz8dkxQPEayHxti52b3vmlbJorx074WkRmRSLbxwkKj1mR1Icnmsr9JMusApS1YhekwJvDxJNPxOpbRLCBHzBzx31kSQafzmMR_9-x5Dlb6MJmVSjCSGBurP3_rALIciT2IRf3hZFhNOEX5xymJlJygIBnMCKueE8UWHges0OevFTaj2cVi7fpkqG4VhjsLCHEOucMDSeN5WojFbL4A9ChO6uw1a1D8NLYcMtKQX8I0B_5-W2F714jxNA';

export interface DemoCredential {
  roleType: RoleType;
  title: string;
  roleLabel: string;
  name: string;
  email: string;
  username: string;
  password: string;
  description: string;
}

export const ROLE_CREDENTIALS: Record<RoleType, DemoCredential> = {
  student: {
    roleType: 'student',
    title: 'Student Portal',
    roleLabel: 'Student',
    name: 'Ahmed Dahy',
    email: 'ahmed.dahy@nilebyte.edu',
    username: 'student',
    password: 'password123',
    description: 'Academic performance, course stats, invoices & AI tutor',
  },
  faculty: {
    roleType: 'faculty',
    title: 'Faculty Dashboard',
    roleLabel: 'Faculty',
    name: 'Dr. Ahmed Dahy',
    email: 'faculty@nilebyte.edu',
    username: 'faculty',
    password: 'password123',
    description: 'Teaching command center, QR attendance & at-risk alerts',
  },
  admin: {
    roleType: 'admin',
    title: 'Admin Dashboard',
    roleLabel: 'Admin',
    name: 'Karim Amr',
    email: 'admin@nilebyte.edu',
    username: 'admin',
    password: 'password123',
    description: 'Operations control room, enrollment, health bar & finance',
  },
  'dept-head': {
    roleType: 'dept-head',
    title: 'Department Head',
    roleLabel: 'Dept. Head — Computer Science',
    name: 'Dr. Mostafa Hagras',
    email: 'depthead@nilebyte.edu',
    username: 'depthead',
    password: 'password123',
    description: 'Department pulse, faculty metrics & pass rate threshold alerts',
  },
  dean: {
    roleType: 'dean',
    title: 'University Dean',
    roleLabel: 'Dean',
    name: 'Prof. Ahmed El Gohary',
    email: 'dean@nilebyte.edu',
    username: 'dean',
    password: 'password123',
    description: 'Executive intelligence briefing, university metrics & dept. audits',
  },
  'teaching-assistant': {
    roleType: 'teaching-assistant',
    title: 'Teaching Assistant',
    roleLabel: 'Teaching Assistant — Computer Science',
    name: 'Omar Tarek',
    email: 'ta@nilebyte.edu',
    username: 'ta',
    password: 'password123',
    description: 'Section management, lab attendance, grade submission & thesis tracker',
  },
};

export const ROLE_USERS: Record<RoleType, User> = {
  student: {
    id: 'u-student',
    name: 'Ahmed Dahy',
    role: 'Student',
    roleType: 'student',
    email: 'ahmed.dahy@nilebyte.edu',
    codeId: 'STU-9921',
    avatarUrl: SHARED_AVATAR_URL,
    messageBadge: 2,
  },
  faculty: {
    id: 'u-faculty',
    name: 'Dr. Ahmed Dahy',
    role: 'Faculty',
    roleType: 'faculty',
    email: 'faculty@nilebyte.edu',
    codeId: 'FAC-4012',
    avatarUrl: SHARED_AVATAR_URL,
    messageBadge: 4,
  },
  admin: {
    id: 'u-admin',
    name: 'Karim Amr',
    role: 'Admin',
    roleType: 'admin',
    email: 'admin@nilebyte.edu',
    codeId: 'ADM-1004',
    avatarUrl: SHARED_AVATAR_URL,
    messageBadge: 7,
  },
  'dept-head': {
    id: 'u-depthead',
    name: 'Dr. Mostafa Hagras',
    role: 'Dept. Head — Computer Science',
    roleType: 'dept-head',
    email: 'depthead@nilebyte.edu',
    codeId: 'DH-2041',
    avatarUrl: SHARED_AVATAR_URL,
    messageBadge: 2,
  },
  dean: {
    id: 'u-dean',
    name: 'Prof. Ahmed El Gohary',
    role: 'Dean',
    roleType: 'dean',
    email: 'dean@nilebyte.edu',
    codeId: 'DEAN-001',
    avatarUrl: SHARED_AVATAR_URL,
    messageBadge: 5,
  },
  'teaching-assistant': {
    id: 'u-ta',
    name: 'Omar Tarek',
    role: 'Teaching Assistant — Computer Science',
    roleType: 'teaching-assistant',
    email: 'ta@nilebyte.edu',
    codeId: 'TA-3021',
    avatarUrl: SHARED_AVATAR_URL,
    messageBadge: 3,
  },
};

export const ROLE_NAVIGATION: Record<RoleType, NavItemConfig[]> = {
  student: [
    { id: 'home', label: 'Home', iconName: 'Home' },
    { id: 'courses', label: 'My Courses', iconName: 'BookOpen' },
    { id: 'materials', label: 'Materials', iconName: 'FileText' },
    { id: 'schedule', label: 'Schedule', iconName: 'Calendar' },
    { id: 'smart-schedule', label: 'Smart Schedule', iconName: 'Sparkles', badge: 'NEW' },
    { id: 'grades', label: 'Grades', iconName: 'BarChart2' },
    { id: 'todo-list', label: 'To-Do List', iconName: 'CheckSquare', badge: 'NEW' },
    { id: 'recordings', label: 'Recordings', iconName: 'Video', badge: 'NEW' },
    { id: 'community', label: 'Community', iconName: 'Users' },
    { id: 'ai-tutor', label: 'AI Tutor', iconName: 'Bot', badge: 'AI' },
    { id: 'messages', label: 'Messages', iconName: 'MessageSquare' },
    { id: 'settings', label: 'Settings', iconName: 'Settings' },
    { id: 'help', label: 'Help', iconName: 'HelpCircle' },
  ],
  faculty: [
    { id: 'home', label: 'Home', iconName: 'Home' },
    { id: 'courses', label: 'My Courses', iconName: 'BookOpen' },
    { id: 'my-students', label: 'My Students', iconName: 'Users' },
    { id: 'attendance', label: 'Attendance', iconName: 'CheckCircle2' },
    { id: 'grade-entry', label: 'Grade Entry', iconName: 'BarChart2' },
    { id: 'smart-schedule', label: 'Smart Schedule', iconName: 'Sparkles', badge: 'NEW' },
    { id: 'recordings', label: 'Recordings', iconName: 'Video', badge: 'NEW' },
    { id: 'messages', label: 'Messages', iconName: 'MessageSquare' },
    { id: 'course-community', label: 'Course Community', iconName: 'Pin' },
    { id: 'settings', label: 'Settings', iconName: 'Settings' },
    { id: 'help', label: 'Help', iconName: 'HelpCircle' },
  ],
  admin: [
    { id: 'home', label: 'Home', iconName: 'Home' },
    { id: 'students', label: 'Students', iconName: 'GraduationCap' },
    { id: 'faculty-staff', label: 'Faculty & Staff', iconName: 'UserCheck' },
    { id: 'enrollment', label: 'Enrollment', iconName: 'ClipboardList' },
    { id: 'finance', label: 'Finance', iconName: 'DollarSign' },
    { id: 'exam-scheduling', label: 'Exam Scheduling', iconName: 'Calendar' },
    { id: 'analytics', label: 'Analytics', iconName: 'BarChart3' },
    { id: 'reports', label: 'Reports', iconName: 'FileText' },
    { id: 'messages', label: 'Messages', iconName: 'MessageSquare' },
    { id: 'settings', label: 'Settings', iconName: 'Settings' },
    { id: 'help', label: 'Help', iconName: 'HelpCircle' },
  ],
  'dept-head': [
    { id: 'home', label: 'Home', iconName: 'Home' },
    { id: 'courses', label: 'Courses', iconName: 'BookOpen' },
    { id: 'faculty-staff', label: 'Faculty', iconName: 'UserCheck' },
    { id: 'students', label: 'Students', iconName: 'GraduationCap' },
    { id: 'analytics', label: 'Analytics', iconName: 'BarChart3' },
    { id: 'at-risk', label: 'At-Risk Students', iconName: 'AlertTriangle' },
    { id: 'reports', label: 'Reports', iconName: 'FileText' },
    { id: 'messages', label: 'Messages', iconName: 'MessageSquare' },
    { id: 'settings', label: 'Settings', iconName: 'Settings' },
    { id: 'help', label: 'Help', iconName: 'HelpCircle' },
  ],
  'teaching-assistant': [
    { id: 'home', label: 'Home', iconName: 'Home' },
    { id: 'ta-sections', label: 'My Sections', iconName: 'Layout' },
    { id: 'ta-attendance', label: 'Attendance', iconName: 'CheckCircle2' },
    { id: 'ta-grades', label: 'Grade Entry', iconName: 'BarChart2' },
    { id: 'ta-students', label: 'My Students', iconName: 'Users' },
    { id: 'ta-materials', label: 'Materials', iconName: 'FolderOpen' },
    { id: 'ta-academic-record', label: 'Academic Record', iconName: 'GraduationCap' },
    { id: 'messages', label: 'Messages', iconName: 'MessageSquare' },
    { id: 'settings', label: 'Settings', iconName: 'Settings' },
    { id: 'help', label: 'Help', iconName: 'HelpCircle' },
  ],
  dean: [
    { id: 'home', label: 'Home', iconName: 'Home' },
    { id: 'departments', label: 'Departments', iconName: 'Building2' },
    { id: 'academic-overview', label: 'Academic Overview', iconName: 'GraduationCap' },
    { id: 'financial-overview', label: 'Financial Overview', iconName: 'DollarSign' },
    { id: 'university-analytics', label: 'University Analytics', iconName: 'BarChart3' },
    { id: 'reports', label: 'Reports', iconName: 'FileText' },
    { id: 'messages', label: 'Messages', iconName: 'MessageSquare' },
    { id: 'settings', label: 'Settings', iconName: 'Settings' },
    { id: 'help', label: 'Help', iconName: 'HelpCircle' },
  ],
};

// ==========================================
// STUDENT DATA
// ==========================================
export const CURRENT_USER: User = ROLE_USERS.student;
export const DEMO_CREDENTIALS = ROLE_CREDENTIALS.student;

export const GRADE_SUBJECTS: GradeSubject[] = [
  { subject: 'Mathematics', shortLabel: 'Math', score: 68, maxScore: 100 },
  { subject: 'Physics', shortLabel: 'Phys', score: 55, maxScore: 100 },
  { subject: 'Computer Science', shortLabel: 'CS', score: 45, maxScore: 100 },
  { subject: 'Data Structures', shortLabel: 'DS', score: 92, maxScore: 100, highlighted: true },
  { subject: 'English', shortLabel: 'Eng', score: 50, maxScore: 100 },
  { subject: 'Artificial Intelligence', shortLabel: 'AI', score: 76, maxScore: 100 },
  { subject: 'Computer Networks', shortLabel: 'Net', score: 62, maxScore: 100 },
  { subject: 'UI/UX Design', shortLabel: 'UI', score: 70, maxScore: 100 },
];

export const ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'assignment',
    title: 'Francisco Gibbs submitted',
    code: 'PQ-4491C',
    time: 'Just Now',
  },
  {
    id: 'act-2',
    type: 'invoice',
    title: 'Invoice JL-3432B reminder was sent to',
    subject: 'Chester Corp',
    time: 'Friday, 12:26PM',
  },
  {
    id: 'act-3',
    type: 'grade',
    title: 'Grade Released for',
    subject: 'Operating Systems Exam',
    time: 'Yesterday, 4:10PM',
  },
];

export const INVOICES: InvoiceItem[] = [
  {
    id: 'inv-1',
    no: 'PQ-4491C',
    dateCreated: '3 Jul, 2020',
    client: 'Daniel Padilla',
    amount: '$ 2,450',
    status: 'PAID',
  },
  {
    id: 'inv-2',
    no: 'IN-9911J',
    dateCreated: '21 May, 2021',
    client: 'Christina Jacobs',
    amount: '$ 14,810',
    status: 'OVERDUE',
  },
  {
    id: 'inv-3',
    no: 'UV-2319A',
    dateCreated: '14 Apr, 2020',
    client: 'Elizabeth Bailey',
    amount: '$ 450',
    status: 'PAID',
  },
];

export const NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Assignment PQ-4491C verified',
    time: '10 minutes ago',
    unread: true,
  },
  {
    id: 'notif-2',
    title: 'Tuition installment due in 5 days',
    time: '2 hours ago',
    unread: true,
  },
];

// ==========================================
// FACULTY DATA
// ==========================================
export interface TeachingScheduleItem {
  id: string;
  courseId?: string;
  courseName: string;
  code: string;
  room: string;
  time: string;
  studentsCount: number;
  status: 'Completed' | 'In Progress' | 'Upcoming';
}

export const FACULTY_SCHEDULE: TeachingScheduleItem[] = [
  {
    id: 'sch-1',
    courseName: 'Data Structures & Algorithms',
    code: 'CS-201',
    room: 'Hall 304',
    time: '09:00 - 10:30 AM',
    studentsCount: 64,
    status: 'Completed',
  },
  {
    id: 'sch-2',
    courseName: 'Artificial Intelligence Foundations',
    code: 'CS-410',
    room: 'Lab B-12',
    time: '11:00 AM - 12:30 PM',
    studentsCount: 52,
    status: 'In Progress',
  },
  {
    id: 'sch-3',
    courseName: 'Computer Networks Seminar',
    code: 'CS-304',
    room: 'Room 208',
    time: '02:00 - 03:30 PM',
    studentsCount: 48,
    status: 'Upcoming',
  },
  {
    id: 'sch-4',
    courseName: 'Office Hours & Consultations',
    code: 'OFFICE',
    room: 'Office 412',
    time: '04:00 - 05:00 PM',
    studentsCount: 12,
    status: 'Upcoming',
  },
];

export const FACULTY_PENDING_ACTIONS = [
  {
    id: 'act-f1',
    priority: 'high',
    color: 'bg-rose-500',
    text: 'Enter midterm grades for Data Structures — due in 3 days',
    actionText: 'Do Now',
  },
  {
    id: 'act-f2',
    priority: 'medium',
    color: 'bg-amber-500',
    text: 'Review 2 flagged community posts in AI course',
    actionText: 'Do Now',
  },
  {
    id: 'act-f3',
    priority: 'info',
    color: 'bg-blue-500',
    text: 'Office hours start at 2:00 PM — 3 students in queue',
    actionText: 'Do Now',
  },
  {
    id: 'act-f4',
    priority: 'low',
    color: 'bg-emerald-500',
    text: 'Quiz 3 results ready to release for Networks',
    actionText: 'Do Now',
  },
];

export const FACULTY_AT_RISK_STUDENTS = [
  {
    id: 'ar-1',
    name: 'Karim Mansour',
    course: 'Data Structures',
    riskLevel: 'Critical',
    signal: 'Missed 4 lectures & Quiz 1 absent',
  },
  {
    id: 'ar-2',
    name: 'Layla Ezzat',
    course: 'Networks',
    riskLevel: 'High',
    signal: 'Midterm score: 38/100',
  },
  {
    id: 'ar-3',
    name: 'Omar Tarek',
    course: 'AI Foundations',
    riskLevel: 'Moderate',
    signal: '2 late homework submissions',
  },
  {
    id: 'ar-4',
    name: 'Hana Soliman',
    course: 'Data Structures',
    riskLevel: 'High',
    signal: 'Lab attendance 50%',
  },
];

export const FACULTY_COMMUNITIES = [
  {
    id: 'comm-1',
    course: 'Data Structures (CS-201)',
    newPosts: 8,
    latestQuestion: 'Can binary search trees have duplicate keys in assignment 3?',
  },
  {
    id: 'comm-2',
    course: 'AI Foundations (CS-410)',
    newPosts: 5,
    latestQuestion: 'Clarification on loss function formulation in slide 24?',
  },
  {
    id: 'comm-3',
    course: 'Networks (CS-304)',
    newPosts: 12,
    latestQuestion: 'Subnet mask calculation question for midterm prep',
  },
  {
    id: 'comm-4',
    course: 'Advanced Algorithms (CS-501)',
    newPosts: 3,
    latestQuestion: 'Recommended proof method for greedy interval scheduling?',
  },
];

// ==========================================
// ADMIN DATA
// ==========================================
export const ADMIN_HEALTH_INDICATORS = [
  { label: 'Enrollment', status: 'Healthy', icon: 'check', color: 'emerald' },
  { label: 'Finance', status: 'Warning', icon: 'alert', color: 'amber' },
  { label: 'Attendance', status: 'Healthy', icon: 'check', color: 'emerald' },
  { label: 'Exams', status: 'Healthy', icon: 'check', color: 'emerald' },
  { label: 'At-Risk Students', status: 'Critical', icon: 'danger', color: 'rose' },
];

export const ADMIN_ENROLLMENT_CHART = [
  { semester: 'S1 2023', count: 3950 },
  { semester: 'S2 2023', count: 4120 },
  { semester: 'S1 2024', count: 4280 },
  { semester: 'S2 2024', count: 4410 },
  { semester: 'S1 2025', count: 4590 },
  { semester: 'S2 2025', count: 4680 },
  { semester: 'S1 2026', count: 4760 },
  { semester: 'S2 2026', count: 4821, active: true },
];

export const ADMIN_PENDING_ACTIONS = [
  { id: 'ap-1', priority: 'red', text: '27 students at-risk — advisors not yet assigned' },
  { id: 'ap-2', priority: 'red', text: '52 students with overdue fee balances' },
  { id: 'ap-3', priority: 'yellow', text: 'Exam schedule for Semester 3 not yet published' },
  { id: 'ap-4', priority: 'yellow', text: '14 new student registrations pending approval' },
  { id: 'ap-5', priority: 'green', text: 'Semester 2 academic report ready to export' },
];

export const ADMIN_REGISTRATIONS = [
  { id: 'reg-1', name: 'Ziad El-Shamy', program: 'Computer Science', date: 'Today, 11:20 AM', status: 'APPROVED' },
  { id: 'reg-2', name: 'Nourhan Fathy', program: 'Business Admin', date: 'Today, 10:45 AM', status: 'PENDING' },
  { id: 'reg-3', name: 'Seif El-Din Mostafa', program: 'Engineering', date: 'Yesterday', status: 'APPROVED' },
  { id: 'reg-4', name: 'Mariam Adel', program: 'Medicine', date: 'Yesterday', status: 'PENDING' },
  { id: 'reg-5', name: 'Tamer Yassin', program: 'Law', date: '18 Sep, 2026', status: 'REJECTED' },
];

export const ADMIN_ACTIVITY_LOGS = [
  { id: 'log-1', action: 'Grade batch released', user: 'Dr. Ahmed', time: '11:00 AM' },
  { id: 'log-2', action: 'QR session started', user: 'Dr. Sara', time: '10:45 AM' },
  { id: 'log-3', action: 'Invoice batch sent', user: 'System', time: '9:00 AM' },
  { id: 'log-4', action: 'New user created', user: 'Admin', time: '8:30 AM' },
  { id: 'log-5', action: 'Exam published', user: 'Dr. Youssef', time: 'Yesterday' },
];

// ==========================================
// DEPARTMENT HEAD DATA
// ==========================================
export const DEPT_COURSE_PERFORMANCE = [
  { code: 'CS-101', name: 'Intro to CS', passRate: 88 },
  { code: 'CS-102', name: 'Prog. II', passRate: 78 },
  { code: 'CS-201', name: 'Data Struct', passRate: 92 },
  { code: 'CS-204', name: 'Discrete Math', passRate: 61, belowThreshold: true },
  { code: 'CS-301', name: 'Algorithms', passRate: 74 },
  { code: 'CS-304', name: 'Networks', passRate: 58, belowThreshold: true },
  { code: 'CS-308', name: 'Databases', passRate: 82 },
  { code: 'CS-312', name: 'OS', passRate: 64, belowThreshold: true },
  { code: 'CS-401', name: 'Software Eng', passRate: 85 },
  { code: 'CS-410', name: 'AI', passRate: 76 },
  { code: 'CS-415', name: 'Cybersec', passRate: 79 },
  { code: 'CS-499', name: 'Grad Project', passRate: 95 },
];

export const DEPT_FACULTY_LIST = [
  { id: 'f-1', name: 'Dr. Ahmed Dahy', coursesCount: 4, studentsCount: 213, avgGrade: '84/100', passRate: 88, status: 'green' },
  { id: 'f-2', name: 'Dr. Sara Nour', coursesCount: 3, studentsCount: 165, avgGrade: '82/100', passRate: 84, status: 'green' },
  { id: 'f-3', name: 'Dr. Tarek Fouad', coursesCount: 3, studentsCount: 142, avgGrade: '71/100', passRate: 62, status: 'red' },
  { id: 'f-4', name: 'Dr. Mona Wagdy', coursesCount: 4, studentsCount: 198, avgGrade: '77/100', passRate: 73, status: 'orange' },
  { id: 'f-5', name: 'Dr. Khaled Helmy', coursesCount: 2, studentsCount: 94, avgGrade: '80/100', passRate: 81, status: 'green' },
];

export const DEPT_AT_RISK_STUDENTS = [
  { id: 'dar-1', name: 'Karim Mansour', course: 'CS-201', risk: 'Critical', trigger: 'Missed 4 lectures & Quiz absent' },
  { id: 'dar-2', name: 'Layla Ezzat', course: 'CS-304', risk: 'Critical', trigger: 'Midterm 38/100 & lab warning' },
  { id: 'dar-3', name: 'Sherif Badawy', course: 'CS-204', risk: 'High', trigger: 'Failed assignment 1 & 2' },
  { id: 'dar-4', name: 'Hossam Nabil', course: 'CS-312', risk: 'High', trigger: 'Attendance rate 54%' },
  { id: 'dar-5', name: 'Dina Raafat', course: 'CS-304', risk: 'Moderate', trigger: 'GPA drop to 2.1' },
];

export const DEPT_EVENTS = [
  { id: 'ev-1', title: 'Midterm Week starts', date: 'Mon 8 Jul' },
  { id: 'ev-2', title: 'Course evaluation opens', date: 'Wed 10 Jul' },
  { id: 'ev-3', title: 'Faculty load report due', date: 'Fri 12 Jul' },
  { id: 'ev-4', title: 'Department meeting', date: 'Sat 13 Jul, 10:00 AM' },
];

// ==========================================
// DEAN DATA
// ==========================================
export const DEAN_DEPARTMENT_PASS_RATES = [
  { name: 'Medicine', passRate: 81, status: 'green' },
  { name: 'Arts & Humanities', passRate: 79, status: 'green' },
  { name: 'Computer Science', passRate: 76, status: 'orange' },
  { name: 'Engineering', passRate: 74, status: 'orange' },
  { name: 'Business', passRate: 72, status: 'orange' },
  { name: 'Law', passRate: 58, status: 'red' },
];

export const DEAN_ALERTS = [
  { id: 'da-1', color: 'red', text: 'Law department pass rate at 58% — below minimum threshold' },
  { id: 'da-2', color: 'red', text: '27 students at-risk university-wide — 11 in CS, 8 in Engineering' },
  { id: 'da-3', color: 'yellow', text: 'Finance: $180k in outstanding balances this semester' },
  { id: 'da-4', color: 'yellow', text: 'Networks course flagged by 3 department heads independently' },
  { id: 'da-5', color: 'green', text: 'Medicine department improved pass rate by 6% vs last semester' },
];

export const DEAN_ENROLLMENT_CURVE = [
  { semester: 'S1 2024', students: 4100 },
  { semester: 'S2 2024', students: 4320 },
  { semester: 'S1 2025', students: 4490 },
  { semester: 'S2 2025', students: 4620 },
  { semester: 'S1 2026', students: 4740 },
  { semester: 'S2 2026', students: 4821 },
];

export const DEAN_HEADS_SUMMARY = [
  {
    id: 'dh-1',
    department: 'Computer Science',
    head: 'Dr. Mostafa Hagras',
    email: 'm.hagras@nilebyte.edu',
    phone: '+20 100 234 5671',
    students: 946,
    faculty: 24,
    avgGpa: '3.2',
    passRate: '76%',
    atRisk: 11,
    status: 'WATCH',
    statusColor: 'orange',
  },
  {
    id: 'dh-2',
    department: 'Medicine',
    head: 'Dr. Sara Nour',
    email: 's.nour@nilebyte.edu',
    phone: '+20 100 891 2345',
    students: 1203,
    faculty: 41,
    avgGpa: '3.5',
    passRate: '81%',
    atRisk: 4,
    status: 'ON TRACK',
    statusColor: 'green',
  },
  {
    id: 'dh-3',
    department: 'Law',
    head: 'Dr. Omar Farid',
    email: 'o.farid@nilebyte.edu',
    phone: '+20 101 456 7890',
    students: 734,
    faculty: 18,
    avgGpa: '2.8',
    passRate: '58%',
    atRisk: 6,
    status: 'CRITICAL',
    statusColor: 'red',
  },
  {
    id: 'dh-4',
    department: 'Business',
    head: 'Dr. Nour Hassan',
    email: 'n.hassan@nilebyte.edu',
    phone: '+20 102 345 6789',
    students: 891,
    faculty: 22,
    avgGpa: '3.0',
    passRate: '72%',
    atRisk: 4,
    status: 'WATCH',
    statusColor: 'orange',
  },
  {
    id: 'dh-5',
    department: 'Engineering',
    head: 'Dr. Youssef Samir',
    email: 'y.samir@nilebyte.edu',
    phone: '+20 109 876 5432',
    students: 1047,
    faculty: 31,
    avgGpa: '3.1',
    passRate: '74%',
    atRisk: 8,
    status: 'WATCH',
    statusColor: 'orange',
  },
  {
    id: 'dh-6',
    department: 'Arts & Humanities',
    head: 'Dr. Layla Ahmed',
    email: 'l.ahmed@nilebyte.edu',
    phone: '+20 106 123 9874',
    students: 612,
    faculty: 16,
    avgGpa: '3.3',
    passRate: '79%',
    atRisk: 2,
    status: 'ON TRACK',
    statusColor: 'green',
  },
];
