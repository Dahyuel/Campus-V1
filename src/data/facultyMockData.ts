// Faculty dashboard domain models and mock data for all tabs

export interface FacultyCourseItem {
  id: string;
  userId?: string;
  name: string;
  code: string;
  section: string;
  room: string;
  studentsCount: number;
  creditHours: number;
  attendanceRate: number; // e.g. 84
  gradesEntered: number; // e.g. 2
  gradesTotal: number; // e.g. 4
  status: 'ON TRACK' | 'ATTENTION NEEDED' | 'OVERDUE';
}

export const FACULTY_COURSES: FacultyCourseItem[] = [
  {
    id: 'cs-301',
    name: 'Data Structures',
    code: 'CS-301',
    section: 'Section A',
    room: 'Room 204',
    studentsCount: 67,
    creditHours: 3,
    attendanceRate: 84,
    gradesEntered: 2,
    gradesTotal: 4,
    status: 'ON TRACK',
  },
  {
    id: 'math-201',
    name: 'Mathematics',
    code: 'MATH-201',
    section: 'Section B',
    room: 'Room 101',
    studentsCount: 54,
    creditHours: 3,
    attendanceRate: 78,
    gradesEntered: 1,
    gradesTotal: 4,
    status: 'ATTENTION NEEDED',
  },
  {
    id: 'cs-401',
    name: 'Artificial Intelligence',
    code: 'CS-401',
    section: 'Section A',
    room: 'Room 301',
    studentsCount: 48,
    creditHours: 3,
    attendanceRate: 91,
    gradesEntered: 2,
    gradesTotal: 4,
    status: 'ON TRACK',
  },
  {
    id: 'cs-303',
    name: 'Networks',
    code: 'CS-303',
    section: 'Section C',
    room: 'Room 205',
    studentsCount: 44,
    creditHours: 3,
    attendanceRate: 69,
    gradesEntered: 0,
    gradesTotal: 4,
    status: 'OVERDUE',
  },
];

export interface CourseMaterialRow {
  id: string;
  fileName: string;
  course: string;
  type: string;
  uploadDate: string;
  size: string;
}

export const FACULTY_MATERIALS: CourseMaterialRow[] = [
  {
    id: 'mat-1',
    fileName: 'CS301_Lecture08_BinaryTrees_Advanced.pdf',
    course: 'Data Structures',
    type: 'PDF Lecture Slides',
    uploadDate: '12 Jul 2024',
    size: '4.2 MB',
  },
  {
    id: 'mat-2',
    fileName: 'MATH201_Calculus_Practice_Set_03.pdf',
    course: 'Mathematics',
    type: 'Assignment PDF',
    uploadDate: '09 Jul 2024',
    size: '1.8 MB',
  },
  {
    id: 'mat-3',
    fileName: 'CS401_A*Search_Implementation_Guide.zip',
    course: 'Artificial Intelligence',
    type: 'Lab Archive Code',
    uploadDate: '05 Jul 2024',
    size: '8.7 MB',
  },
];

export interface FacultyStudentRow {
  rowId?: string;
  id: string;
  courseId?: string;
  name: string;
  studentId: string;
  course: string;
  attendance: number;
  currentGrade: number | null;
  gpa: number | null;
  status: 'GOOD STANDING' | 'AT RISK' | 'WARNING';
}

export const FACULTY_STUDENTS_LIST: FacultyStudentRow[] = [
  {
    id: 's1',
    name: 'Omar Hassan',
    studentId: '202100234',
    course: 'Data Structures',
    attendance: 91,
    currentGrade: 88,
    gpa: 3.6,
    status: 'GOOD STANDING',
  },
  {
    id: 's2',
    name: 'Sara Mahmoud',
    studentId: '202100187',
    course: 'Networks',
    attendance: 61,
    currentGrade: 54,
    gpa: 2.4,
    status: 'AT RISK',
  },
  {
    id: 's3',
    name: 'Nour Ali',
    studentId: '202100312',
    course: 'Mathematics',
    attendance: 74,
    currentGrade: 71,
    gpa: 2.9,
    status: 'WARNING',
  },
  {
    id: 's4',
    name: 'Youssef Samir',
    studentId: '202100098',
    course: 'Artificial Intelligence',
    attendance: 95,
    currentGrade: 93,
    gpa: 3.8,
    status: 'GOOD STANDING',
  },
  {
    id: 's5',
    name: 'Layla Ahmed',
    studentId: '202100445',
    course: 'Data Structures',
    attendance: 68,
    currentGrade: 62,
    gpa: 2.6,
    status: 'AT RISK',
  },
  {
    id: 's6',
    name: 'Khaled Mostafa',
    studentId: '202100267',
    course: 'Networks',
    attendance: 83,
    currentGrade: 79,
    gpa: 3.1,
    status: 'GOOD STANDING',
  },
  {
    id: 's7',
    name: 'Dina Kamal',
    studentId: '202100391',
    course: 'Mathematics',
    attendance: 77,
    currentGrade: 74,
    gpa: 3.0,
    status: 'GOOD STANDING',
  },
  {
    id: 's8',
    name: 'Ahmed Tarek',
    studentId: '202100156',
    course: 'Artificial Intelligence',
    attendance: 55,
    currentGrade: 48,
    gpa: 2.1,
    status: 'AT RISK',
  },
];

export interface PastAttendanceSession {
  id: string;
  lectureNo: string;
  date: string;
  present: number;
  absent: number;
  rate: number;
}

export const PAST_ATTENDANCE_SESSIONS: PastAttendanceSession[] = [
  { id: 'att-11', lectureNo: 'Lecture 11', date: '7 Jul 2024', present: 61, absent: 6, rate: 91 },
  { id: 'att-10', lectureNo: 'Lecture 10', date: '3 Jul 2024', present: 58, absent: 9, rate: 87 },
  { id: 'att-9', lectureNo: 'Lecture 9', date: '30 Jun 2024', present: 55, absent: 12, rate: 82 },
];

export interface StudentAttendanceSummary {
  id: string;
  name: string;
  present: number;
  absent: number;
  rate: number | null;
  status: 'GOOD' | 'AT RISK' | 'WARNING' | 'NO RECORDS';
}

export const STUDENT_ATTENDANCE_SUMMARY: StudentAttendanceSummary[] = [
  { id: 'sa-1', name: 'Omar Hassan', present: 10, absent: 1, rate: 91, status: 'GOOD' },
  { id: 'sa-2', name: 'Sara Mahmoud', present: 7, absent: 4, rate: 64, status: 'AT RISK' },
  { id: 'sa-3', name: 'Nour Ali', present: 9, absent: 2, rate: 82, status: 'GOOD' },
  { id: 'sa-4', name: 'Ahmed Tarek', present: 5, absent: 6, rate: 45, status: 'AT RISK' },
  { id: 'sa-5', name: 'Layla Ahmed', present: 8, absent: 3, rate: 73, status: 'WARNING' },
];

export interface GradeEntryRow {
  studentName: string;
  studentId: string;
  grade: number | null;
  outOf: number;
  percentage: number | null;
  status: 'ENTERED' | 'MISSING';
}

export const INITIAL_GRADE_ENTRIES: GradeEntryRow[] = [
  { studentName: 'Omar Hassan', studentId: '202100234', grade: 26, outOf: 30, percentage: 87, status: 'ENTERED' },
  { studentName: 'Sara Mahmoud', studentId: '202100187', grade: null, outOf: 30, percentage: null, status: 'MISSING' },
  { studentName: 'Nour Ali', studentId: '202100312', grade: 22, outOf: 30, percentage: 73, status: 'ENTERED' },
  { studentName: 'Youssef Samir', studentId: '202100098', grade: 29, outOf: 30, percentage: 97, status: 'ENTERED' },
  { studentName: 'Layla Ahmed', studentId: '202100445', grade: null, outOf: 30, percentage: null, status: 'MISSING' },
  { studentName: 'Ahmed Tarek', studentId: '202100156', grade: 14, outOf: 30, percentage: 47, status: 'ENTERED' },
];

export interface FacultyCommunityPost {
  id: string;
  type: 'QUESTION' | 'RESOURCE' | 'DISCUSSION';
  title: string;
  author: string;
  authorRole: string;
  avatar: string;
  timeAgo: string;
  content: string;
  upvotes: number;
  isPinned?: boolean;
  hasAiResponse?: boolean;
  aiResponse?: {
    answer: string;
    citation: string;
    status: 'awaiting_approval' | 'approved' | 'correction_needed';
  };
}

export const FACULTY_COMMUNITY_POSTS: FacultyCommunityPost[] = [
  {
    id: 'fcp-1',
    type: 'QUESTION',
    title: 'What is the time complexity of AVL tree insertion?',
    author: 'Karim Mostafa',
    authorRole: 'Student',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    timeAgo: '2 hours ago',
    content: 'When we insert a node into an AVL tree and it causes a double rotation (RL or LR), does the height update take O(1) or does it traverse up the whole tree? Trying to understand the rigorous proof for the exam.',
    upvotes: 9,
    hasAiResponse: true,
    aiResponse: {
      answer: 'AVL tree insertion takes O(log n) total time in both worst and average cases. While searching for the insertion spot takes O(log n), rebalancing requires at most one single or double rotation (which is strictly O(1) pointer updates). Height recalculations from the inserted leaf back to the root require at most O(log n) steps.',
      citation: 'Lecture 08: Self-Balancing Binary Search Trees, Slide 14',
      status: 'awaiting_approval',
    },
  },
  {
    id: 'fcp-2',
    type: 'RESOURCE',
    title: 'My full summary notes for Chapter 4 — Trees',
    author: 'Layla Ahmed',
    authorRole: 'Student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    timeAgo: 'Yesterday',
    content: 'Uploaded handwritten PDF notes summarizing BST insertion, in-order traversals, and heapify operations with color-coded diagrams. Hope this helps everyone preparing for the upcoming quiz!',
    upvotes: 28,
    isPinned: true,
  },
  {
    id: 'fcp-3',
    type: 'QUESTION',
    title: 'Will the exam cover graph traversal algorithms?',
    author: 'Ziad Nabil',
    authorRole: 'Student',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    timeAgo: '2 days ago',
    content: 'Are Breadth-First Search (BFS) and Depth-First Search (DFS) included in the Midterm examination or will they be postponed to the final?',
    upvotes: 14,
    hasAiResponse: true,
    aiResponse: {
      answer: 'According to the official CS-301 syllabus, BFS, DFS, and topological sort algorithms will be covered in the Midterm exam (Weeks 1 to 7). Dijkstra algorithm will be assessed in the final exam only.',
      citation: 'CS-301 Official Syllabus & Midterm Study Guide (Rev 2)',
      status: 'approved',
    },
  },
  {
    id: 'fcp-4',
    type: 'DISCUSSION',
    title: 'Should we form a study group for the final?',
    author: 'Omar Hassan',
    authorRole: 'Student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    timeAgo: '3 days ago',
    content: 'Looking to organize an active evening study group in the central library Room 2B or over Discord to solve past exam problems together. Who wants to join?',
    upvotes: 15,
  },
];

export interface FacultyMessageConversation {
  id: string;
  userId?: string;
  name: string;
  role: 'Student' | 'Admin' | 'Faculty' | 'System' | 'Teaching Assistant';
  roleCategory: 'Students' | 'Admin' | 'Faculty' | 'All';
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  courseTag?: string;
  studentAttendance?: number;
  studentGrade?: string;
  online?: boolean;
}

export const FACULTY_CONVERSATIONS: FacultyMessageConversation[] = [
  {
    id: 'conv-1',
    name: 'Omar Hassan',
    role: 'Student',
    roleCategory: 'Students',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    lastMessage: 'Professor, can you clarify the midterm scope?',
    time: '10:30 AM',
    unreadCount: 1,
    courseTag: 'Data Structures CS-301',
    studentAttendance: 91,
    studentGrade: '88/100',
    online: true,
  },
  {
    id: 'conv-2',
    name: 'Admin Office',
    role: 'Admin',
    roleCategory: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    lastMessage: 'Please submit your faculty load report by...',
    time: 'Yesterday',
    unreadCount: 1,
    online: true,
  },
  {
    id: 'conv-3',
    name: 'Dr. Sara Nour',
    role: 'Faculty',
    roleCategory: 'Faculty',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    lastMessage: 'Are you free to co-supervise the graduation project?',
    time: 'Monday',
    online: false,
  },
  {
    id: 'conv-4',
    name: 'Sara Mahmoud',
    role: 'Student',
    roleCategory: 'Students',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    lastMessage: 'I missed lecture 9 due to illness, can I...',
    time: 'Sunday',
    courseTag: 'Networks CS-303',
    studentAttendance: 61,
    studentGrade: '54/100',
    online: false,
  },
  {
    id: 'conv-5',
    name: 'Campus System',
    role: 'System',
    roleCategory: 'All',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    lastMessage: 'Reminder: Midterm grades due in 3 days',
    time: 'Sat',
    online: true,
  },
];
