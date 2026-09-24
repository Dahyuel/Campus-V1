import { SHARED_AVATAR_URL } from './mockData';

export interface StudentCourse {
  id: string;
  name: string;
  code: string;
  faculty: string;
  facultyAvatar: string;
  credits: number;
  attendancePct: number;
  gradesReleased: number;
  totalGrades: number;
  status: 'IN PROGRESS' | 'EXAM SOON' | 'COMPLETED';
  currentAverage: number;
  assessments: CourseAssessment[];
}

export interface CourseAssessment {
  id: string;
  assessment: string;
  type: 'Coursework' | 'Exam' | 'Project' | 'Quiz';
  weight: string;
  grade: number | null;
  outOf: number | null;
  releasedDate: string | null;
  status: 'RELEASED' | 'PENDING';
}

export interface CompletedCourse {
  id: string;
  course: string;
  code: string;
  grade: string;
  gpaPoints: string;
  semester: string;
}

export const STUDENT_COURSES: StudentCourse[] = [
  {
    id: 'c-1',
    name: 'Data Structures',
    code: 'CS-301',
    faculty: 'Dr. Ahmed Dahy',
    facultyAvatar: SHARED_AVATAR_URL,
    credits: 3,
    attendancePct: 87,
    gradesReleased: 2,
    totalGrades: 4,
    status: 'IN PROGRESS',
    currentAverage: 88,
    assessments: [
      {
        id: 'a-1',
        assessment: 'Assignment 1',
        type: 'Coursework',
        weight: '10%',
        grade: 18,
        outOf: 20,
        releasedDate: '1 Jun 2024',
        status: 'RELEASED',
      },
      {
        id: 'a-2',
        assessment: 'Assignment 2',
        type: 'Coursework',
        weight: '10%',
        grade: 17,
        outOf: 20,
        releasedDate: '15 Jun 2024',
        status: 'RELEASED',
      },
      {
        id: 'a-3',
        assessment: 'Midterm',
        type: 'Exam',
        weight: '30%',
        grade: 26.5,
        outOf: 30,
        releasedDate: '20 Jun 2024',
        status: 'RELEASED',
      },
      {
        id: 'a-4',
        assessment: 'Final',
        type: 'Exam',
        weight: '50%',
        grade: null,
        outOf: null,
        releasedDate: null,
        status: 'PENDING',
      },
    ],
  },
  {
    id: 'c-2',
    name: 'Mathematics',
    code: 'MATH-201',
    faculty: 'Dr. Sara Nour',
    facultyAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    credits: 3,
    attendancePct: 79,
    gradesReleased: 3,
    totalGrades: 4,
    status: 'EXAM SOON',
    currentAverage: 74,
    assessments: [
      {
        id: 'm-1',
        assessment: 'Quiz 1 — Linear Systems',
        type: 'Quiz',
        weight: '10%',
        grade: 4,
        outOf: 10,
        releasedDate: '28 May 2024',
        status: 'RELEASED',
      },
      {
        id: 'm-2',
        assessment: 'Problem Set 1',
        type: 'Coursework',
        weight: '15%',
        grade: 14,
        outOf: 15,
        releasedDate: '10 Jun 2024',
        status: 'RELEASED',
      },
      {
        id: 'm-3',
        assessment: 'Midterm Examination',
        type: 'Exam',
        weight: '25%',
        grade: 19,
        outOf: 25,
        releasedDate: '18 Jun 2024',
        status: 'RELEASED',
      },
      {
        id: 'm-4',
        assessment: 'Comprehensive Final',
        type: 'Exam',
        weight: '50%',
        grade: null,
        outOf: null,
        releasedDate: null,
        status: 'PENDING',
      },
    ],
  },
  {
    id: 'c-3',
    name: 'Operating Systems',
    code: 'CS-302',
    faculty: 'Dr. Youssef Samir',
    facultyAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    credits: 3,
    attendancePct: 92,
    gradesReleased: 1,
    totalGrades: 4,
    status: 'IN PROGRESS',
    currentAverage: 82,
    assessments: [
      {
        id: 'os-1',
        assessment: 'Process Scheduling Lab',
        type: 'Coursework',
        weight: '15%',
        grade: 12.3,
        outOf: 15,
        releasedDate: '5 Jun 2024',
        status: 'RELEASED',
      },
      {
        id: 'os-2',
        assessment: 'Concurrency Project',
        type: 'Project',
        weight: '15%',
        grade: null,
        outOf: null,
        releasedDate: null,
        status: 'PENDING',
      },
      {
        id: 'os-3',
        assessment: 'Midterm Exam',
        type: 'Exam',
        weight: '30%',
        grade: null,
        outOf: null,
        releasedDate: null,
        status: 'PENDING',
      },
      {
        id: 'os-4',
        assessment: 'Final Exam',
        type: 'Exam',
        weight: '40%',
        grade: null,
        outOf: null,
        releasedDate: null,
        status: 'PENDING',
      },
    ],
  },
  {
    id: 'c-4',
    name: 'Artificial Intelligence',
    code: 'CS-401',
    faculty: 'Dr. Mostafa Hagras',
    facultyAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    credits: 3,
    attendancePct: 95,
    gradesReleased: 2,
    totalGrades: 4,
    status: 'IN PROGRESS',
    currentAverage: 91,
    assessments: [
      {
        id: 'ai-1',
        assessment: 'A* Search Benchmark Lab',
        type: 'Coursework',
        weight: '15%',
        grade: 15,
        outOf: 15,
        releasedDate: '8 Jun 2024',
        status: 'RELEASED',
      },
      {
        id: 'ai-2',
        assessment: 'Neural Net Classifier',
        type: 'Project',
        weight: '20%',
        grade: 17,
        outOf: 20,
        releasedDate: '19 Jun 2024',
        status: 'RELEASED',
      },
      {
        id: 'ai-3',
        assessment: 'Midterm Assessment',
        type: 'Exam',
        weight: '25%',
        grade: null,
        outOf: null,
        releasedDate: null,
        status: 'PENDING',
      },
      {
        id: 'ai-4',
        assessment: 'Final Written Exam',
        type: 'Exam',
        weight: '40%',
        grade: null,
        outOf: null,
        releasedDate: null,
        status: 'PENDING',
      },
    ],
  },
  {
    id: 'c-5',
    name: 'Networks',
    code: 'CS-303',
    faculty: 'Dr. Omar Farid',
    facultyAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80',
    credits: 3,
    attendancePct: 71,
    gradesReleased: 2,
    totalGrades: 4,
    status: 'EXAM SOON',
    currentAverage: 68,
    assessments: [
      {
        id: 'net-1',
        assessment: 'Packet Tracer Assignment',
        type: 'Coursework',
        weight: '10%',
        grade: 7,
        outOf: 10,
        releasedDate: '3 Jun 2024',
        status: 'RELEASED',
      },
      {
        id: 'net-2',
        assessment: 'Subnetting Quiz',
        type: 'Quiz',
        weight: '15%',
        grade: 10,
        outOf: 15,
        releasedDate: '14 Jun 2024',
        status: 'RELEASED',
      },
      {
        id: 'net-3',
        assessment: 'Midterm Exam',
        type: 'Exam',
        weight: '25%',
        grade: null,
        outOf: null,
        releasedDate: null,
        status: 'PENDING',
      },
      {
        id: 'net-4',
        assessment: 'Final Exam',
        type: 'Exam',
        weight: '50%',
        grade: null,
        outOf: null,
        releasedDate: null,
        status: 'PENDING',
      },
    ],
  },
  {
    id: 'c-6',
    name: 'English Communication',
    code: 'ENG-101',
    faculty: 'Dr. Nour Hassan',
    facultyAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
    credits: 3,
    attendancePct: 88,
    gradesReleased: 4,
    totalGrades: 4,
    status: 'IN PROGRESS',
    currentAverage: 86,
    assessments: [
      {
        id: 'eng-1',
        assessment: 'Technical Essay',
        type: 'Coursework',
        weight: '20%',
        grade: 18,
        outOf: 20,
        releasedDate: '25 May 2024',
        status: 'RELEASED',
      },
      {
        id: 'eng-2',
        assessment: 'Oral Presentation',
        type: 'Project',
        weight: '20%',
        grade: 17,
        outOf: 20,
        releasedDate: '12 Jun 2024',
        status: 'RELEASED',
      },
      {
        id: 'eng-3',
        assessment: 'Midterm Reading Analysis',
        type: 'Exam',
        weight: '20%',
        grade: 18,
        outOf: 20,
        releasedDate: '18 Jun 2024',
        status: 'RELEASED',
      },
      {
        id: 'eng-4',
        assessment: 'Final Research Paper',
        type: 'Coursework',
        weight: '40%',
        grade: 33,
        outOf: 40,
        releasedDate: '22 Jun 2024',
        status: 'RELEASED',
      },
    ],
  },
];

export const PREVIOUS_SEMESTERS_COURSES: CompletedCourse[] = [
  {
    id: 'pc-1',
    course: 'Object-Oriented Programming',
    code: 'CS-201',
    grade: 'A',
    gpaPoints: '4.0',
    semester: 'Fall 2025',
  },
  {
    id: 'pc-2',
    course: 'Discrete Mathematics',
    code: 'MATH-102',
    grade: 'A-',
    gpaPoints: '3.7',
    semester: 'Fall 2025',
  },
  {
    id: 'pc-3',
    course: 'Digital Logic Design',
    code: 'CS-203',
    grade: 'B+',
    gpaPoints: '3.3',
    semester: 'Spring 2025',
  },
  {
    id: 'pc-4',
    course: 'Introduction to Computer Science',
    code: 'CS-101',
    grade: 'A',
    gpaPoints: '4.0',
    semester: 'Fall 2024',
  },
  {
    id: 'pc-5',
    course: 'Calculus I',
    code: 'MATH-101',
    grade: 'B',
    gpaPoints: '3.0',
    semester: 'Fall 2024',
  },
];

// Schedule Timetable
export interface ScheduleClassItem {
  id: string;
  day: 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday';
  timeSlot: string; // e.g. "10:00 AM"
  courseName: string;
  courseCode: string;
  room: string;
  faculty: string;
  isLive?: boolean;
}

export const WEEK_SCHEDULE: ScheduleClassItem[] = [
  {
    id: 'sc-1',
    day: 'Saturday',
    timeSlot: '9:00 AM',
    courseName: 'Mathematics',
    courseCode: 'MATH-201',
    room: 'Hall 104',
    faculty: 'Dr. Sara Nour',
  },
  {
    id: 'sc-2',
    day: 'Saturday',
    timeSlot: '11:00 AM',
    courseName: 'Operating Systems',
    courseCode: 'CS-302',
    room: 'Lab 2B',
    faculty: 'Dr. Youssef Samir',
  },
  {
    id: 'sc-3',
    day: 'Sunday',
    timeSlot: '10:00 AM',
    courseName: 'Data Structures',
    courseCode: 'CS-301',
    room: 'Hall 3',
    faculty: 'Dr. Ahmed Dahy',
    isLive: true,
  },
  {
    id: 'sc-4',
    day: 'Sunday',
    timeSlot: '1:00 PM',
    courseName: 'Artificial Intelligence',
    courseCode: 'CS-401',
    room: 'Smart Room 5',
    faculty: 'Dr. Mostafa Hagras',
  },
  {
    id: 'sc-5',
    day: 'Monday',
    timeSlot: '8:00 AM',
    courseName: 'Networks',
    courseCode: 'CS-303',
    room: 'Cisco Lab 1',
    faculty: 'Dr. Omar Farid',
  },
  {
    id: 'sc-6',
    day: 'Monday',
    timeSlot: '12:00 PM',
    courseName: 'English Communication',
    courseCode: 'ENG-101',
    room: 'Seminar Room 2',
    faculty: 'Dr. Nour Hassan',
  },
  {
    id: 'sc-7',
    day: 'Tuesday',
    timeSlot: '10:00 AM',
    courseName: 'Data Structures Lab',
    courseCode: 'CS-301',
    room: 'Lab 4',
    faculty: 'Eng. Karim Gamal',
  },
  {
    id: 'sc-8',
    day: 'Tuesday',
    timeSlot: '2:00 PM',
    courseName: 'Operating Systems',
    courseCode: 'CS-302',
    room: 'Hall 2',
    faculty: 'Dr. Youssef Samir',
  },
  {
    id: 'sc-9',
    day: 'Wednesday',
    timeSlot: '9:00 AM',
    courseName: 'Artificial Intelligence',
    courseCode: 'CS-401',
    room: 'Smart Room 5',
    faculty: 'Dr. Mostafa Hagras',
  },
  {
    id: 'sc-10',
    day: 'Wednesday',
    timeSlot: '11:00 AM',
    courseName: 'Mathematics',
    courseCode: 'MATH-201',
    room: 'Hall 104',
    faculty: 'Dr. Sara Nour',
  },
  {
    id: 'sc-11',
    day: 'Thursday',
    timeSlot: '10:00 AM',
    courseName: 'Networks Practical',
    courseCode: 'CS-303',
    room: 'Cisco Lab 1',
    faculty: 'Dr. Omar Farid',
  },
  {
    id: 'sc-12',
    day: 'Thursday',
    timeSlot: '1:00 PM',
    courseName: 'English Discussion',
    courseCode: 'ENG-101',
    room: 'Room 301',
    faculty: 'Dr. Nour Hassan',
  },
];

export interface UpcomingWeekEvent {
  id: string;
  type: 'LECTURE' | 'EXAM' | 'DEADLINE' | 'OFFICE HOURS';
  courseName: string;
  courseCode: string;
  date: string;
  time: string;
  room: string;
}

export const UPCOMING_WEEK_EVENTS: UpcomingWeekEvent[] = [
  {
    id: 'ev-1',
    type: 'EXAM',
    courseName: 'Mathematics Midterm',
    courseCode: 'MATH-201',
    date: 'Wednesday, 23 Sep',
    time: '09:00 AM - 11:00 AM',
    room: 'Grand Hall B',
  },
  {
    id: 'ev-2',
    type: 'DEADLINE',
    courseName: 'Data Structures Assignment 3',
    courseCode: 'CS-301',
    date: 'Thursday, 24 Sep',
    time: '11:59 PM',
    room: 'Online Portal',
  },
  {
    id: 'ev-3',
    type: 'OFFICE HOURS',
    courseName: 'Dr. Ahmed Dahy (Advising)',
    courseCode: 'CS-301',
    date: 'Tuesday, 22 Sep',
    time: '02:00 PM - 04:00 PM',
    room: 'Faculty Bldg 3 - Office 312',
  },
  {
    id: 'ev-4',
    type: 'LECTURE',
    courseName: 'AI Guest Lecture: LLM Systems',
    courseCode: 'CS-401',
    date: 'Thursday, 24 Sep',
    time: '01:00 PM - 03:00 PM',
    room: 'Auditorium 1',
  },
];

// Community Data
export interface CommunityPost {
  id: string;
  type: 'QUESTION' | 'RESOURCE' | 'DISCUSSION';
  course: string;
  courseCode: string;
  author: string;
  authorRole: string;
  authorAvatar: string | undefined;
  isAnonymous: boolean;
  timePosted: string;
  title: string;
  body: string;
  upvotes: number;
  repliesCount: number;
  isPinned?: boolean;
  aiResponse?: {
    answer: string;
    citation: string;
    isFacultyApproved?: boolean;
  };
}

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    type: 'QUESTION',
    course: 'Data Structures',
    courseCode: 'CS-301',
    author: 'Student (Ahmed)',
    authorRole: 'Student',
    authorAvatar: SHARED_AVATAR_URL,
    isAnonymous: false,
    timePosted: '2 hours ago',
    isPinned: true,
    title: 'Can someone explain what a Red-Black tree balancing case looks like?',
    body: 'I am struggling with Case 2 and Case 3 during insertion when the uncle node is black and the current node is a right child. How does the left-rotation transform it into Case 3 before recoloring?',
    upvotes: 12,
    repliesCount: 4,
    aiResponse: {
      answer:
        'When node z is a right child and uncle is black, perform a left-rotation on z.parent. This transforms Case 2 into Case 3 (where z is now a left child). In Case 3, you recolor parent to black, grandparent to red, and perform a right-rotation on the grandparent to restore the black-height invariant.',
      citation: 'Source: Lecture 4, Slide 12 — "Self-Balancing Binary Trees"',
      isFacultyApproved: true,
    },
  },
  {
    id: 'post-2',
    type: 'RESOURCE',
    course: 'Artificial Intelligence',
    courseCode: 'CS-401',
    author: 'Omar Sherif',
    authorRole: 'Student TA',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    isAnonymous: false,
    timePosted: '5 hours ago',
    title: 'Summarized notes for Chapter 3 — Neural Networks',
    body: 'Hey everyone, I compiled a neat 4-page PDF cheatsheet covering Forward Propagation, Backpropagation matrix calculus, and activation function derivative comparisons (ReLU, Sigmoid, Leaky ReLU). You can grab the notes in the attachment below.',
    upvotes: 34,
    repliesCount: 9,
  },
  {
    id: 'post-3',
    type: 'QUESTION',
    course: 'Mathematics',
    courseCode: 'MATH-201',
    author: 'Anonymous Student',
    authorRole: 'Student',
    authorAvatar: '',
    isAnonymous: true,
    timePosted: '1 day ago',
    title: 'Is the integral formula in Lecture 6 going to be in the exam?',
    body: 'Dr. Sara mentioned during Thursday lecture that integration by parts for trigonometric substitutions would have a formula sheet provided. Can someone confirm whether we need to memorize the hyperbolic substitutions as well?',
    upvotes: 8,
    repliesCount: 3,
    aiResponse: {
      answer:
        'Standard trigonometric substitution tables will be attached to the back of the midterm exam booklet. However, standard hyperbolic identity transformations (cosh² x - sinh² x = 1) must be derived or recalled.',
      citation: 'Source: Course Syllabus & Lecture 6 Exam Notice',
      isFacultyApproved: true,
    },
  },
  {
    id: 'post-4',
    type: 'DISCUSSION',
    course: 'Networks',
    courseCode: 'CS-303',
    author: 'Yara Tarek',
    authorRole: 'Student',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    isAnonymous: false,
    timePosted: '2 days ago',
    title: 'Does anyone else think the OSI model should be simplified in the curriculum?',
    body: 'Modern production internet stacks strictly operate on the 4-layer / 5-layer TCP/IP architecture. Spending 3 weeks distinguishing the Presentation and Session layers feels rather academic. What do practical engineers think about focusing more on TLS 1.3 and QUIC protocol instead?',
    upvotes: 21,
    repliesCount: 14,
  },
];

// AI Tutor Data
export interface TutorSession {
  id: string;
  course: string;
  courseCode: string;
  dateLabel: string;
  preview: string;
  exchangesCount: number;
  messages: TutorMessage[];
}

export interface TutorMessage {
  id: string;
  sender: 'student' | 'ai';
  text: string;
  citation?: string;
  time: string;
}

export const TUTOR_SESSIONS: TutorSession[] = [
  {
    id: 'sess-1',
    course: 'Data Structures',
    courseCode: 'CS-301',
    dateLabel: 'Today',
    preview: 'I don’t understand how gradient descent works...',
    exchangesCount: 4,
    messages: [
      {
        id: 'tm-1',
        sender: 'student',
        text: "I don't understand how gradient descent works",
        time: '10:30 AM',
      },
      {
        id: 'tm-2',
        sender: 'ai',
        text: 'Good question. Before I explain, what do you already know about optimization in machine learning? What do you think the goal of gradient descent might be?',
        citation: 'Source: Lecture 5, Slide 3',
        time: '10:31 AM',
      },
      {
        id: 'tm-3',
        sender: 'student',
        text: 'I think it tries to minimize error somehow?',
        time: '10:32 AM',
      },
      {
        id: 'tm-4',
        sender: 'ai',
        text: "Exactly right — you're closer than you think. Now, if the error is a surface with hills and valleys, what direction would you want to move in to reach the lowest point?",
        citation: 'Source: Lecture 5, Slide 6',
        time: '10:33 AM',
      },
    ],
  },
  {
    id: 'sess-2',
    course: 'Data Structures',
    courseCode: 'CS-301',
    dateLabel: 'Yesterday',
    preview: 'Why is quicksort worst case O(n^2)?',
    exchangesCount: 6,
    messages: [
      {
        id: 'tm-21',
        sender: 'student',
        text: 'Why is quicksort worst case O(n^2)?',
        time: '04:15 PM',
      },
      {
        id: 'tm-22',
        sender: 'ai',
        text: 'Think about how the pivot is selected. What happens to the partitions if the array is already sorted and we pick the first element as pivot?',
        citation: 'Source: Lecture 3, Slide 18',
        time: '04:16 PM',
      },
      {
        id: 'tm-23',
        sender: 'student',
        text: 'One partition will have 0 items and the other will have n-1 items!',
        time: '04:18 PM',
      },
      {
        id: 'tm-24',
        sender: 'ai',
        text: 'Precisely. And how many times would you have to repeat that unbalanced partition until you finish?',
        citation: 'Source: Lecture 3, Slide 21',
        time: '04:19 PM',
      },
    ],
  },
  {
    id: 'sess-3',
    course: 'Data Structures',
    courseCode: 'CS-301',
    dateLabel: '3 Jul 2024',
    preview: 'Difference between BFS and DFS queue vs stack...',
    exchangesCount: 8,
    messages: [
      {
        id: 'tm-31',
        sender: 'student',
        text: 'Can you help me differentiate BFS vs DFS memory usage?',
        time: '02:10 PM',
      },
      {
        id: 'tm-32',
        sender: 'ai',
        text: 'Consider a wide tree with branching factor b and depth d. What does BFS keep in memory at the maximum level?',
        citation: 'Source: Lecture 7, Slide 8',
        time: '02:11 PM',
      },
    ],
  },
];

// Messages Data
export interface ChatConversation {
  id: string;
  userId?: string;
  senderName: string;
  senderRole: string;
  avatarUrl: string | undefined;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  thread: {
    id: string;
    sender: 'me' | 'them';
    senderName: string;
    text: string;
    time: string;
  }[];
}

export const CHAT_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-1',
    senderName: 'Dr. Ahmed Dahy',
    senderRole: 'Faculty — Data Structures',
    avatarUrl: SHARED_AVATAR_URL,
    lastMessage: 'Your Assignment 3 grade has been updated in the portal. Please review your recursion test cases.',
    timestamp: '10:14 AM',
    unreadCount: 1,
    isOnline: true,
    thread: [
      {
        id: 'th-1',
        sender: 'them',
        senderName: 'Dr. Ahmed Dahy',
        text: 'Hello Ahmed, I saw your submission for Assignment 3.',
        time: '09:45 AM',
      },
      {
        id: 'th-2',
        sender: 'me',
        senderName: 'Ahmed Dahy',
        text: 'Good morning Dr. Ahmed. Did the balanced tree rotation test cases pass all benchmarks?',
        time: '10:02 AM',
      },
      {
        id: 'th-3',
        sender: 'them',
        senderName: 'Dr. Ahmed Dahy',
        text: 'Yes, your runtime benchmarks scored in the top 5% of the cohort. Your Assignment 3 grade has been updated in the portal.',
        time: '10:14 AM',
      },
      {
        id: 'th-4',
        sender: 'me',
        senderName: 'Ahmed Dahy',
        text: 'Thank you Dr. Ahmed! I will check the feedback and attend the office hours on Tuesday for the final project topic.',
        time: '10:16 AM',
      },
    ],
  },
  {
    id: 'conv-2',
    senderName: 'Admin Office',
    senderRole: 'University Administration',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
    lastMessage: 'Your fee invoice for Semester 2 is generated and ready for digital settlement.',
    timestamp: 'Yesterday',
    unreadCount: 2,
    isOnline: false,
    thread: [
      {
        id: 'adm-1',
        sender: 'them',
        senderName: 'Admin Office',
        text: 'Notice: Registration for Spring term electives opens next Monday.',
        time: 'Yesterday 02:30 PM',
      },
      {
        id: 'adm-2',
        sender: 'them',
        senderName: 'Admin Office',
        text: 'Your fee invoice for Semester 2 is generated and ready for digital settlement.',
        time: 'Yesterday 04:15 PM',
      },
    ],
  },
  {
    id: 'conv-3',
    senderName: 'Dr. Sara Nour',
    senderRole: 'Faculty — Mathematics',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    lastMessage: 'Please check the updated exam schedule on the campus noticeboard.',
    timestamp: 'Monday',
    unreadCount: 0,
    isOnline: true,
    thread: [
      {
        id: 'sn-1',
        sender: 'them',
        senderName: 'Dr. Sara Nour',
        text: 'Please check the updated exam schedule on the campus noticeboard.',
        time: 'Monday 11:20 AM',
      },
    ],
  },
  {
    id: 'conv-4',
    senderName: 'Dr. Youssef Samir',
    senderRole: 'Faculty — Operating Systems',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    lastMessage: 'Office hours moved to Thursday 3PM due to the faculty council assembly.',
    timestamp: 'Sunday',
    unreadCount: 0,
    isOnline: false,
    thread: [
      {
        id: 'ys-1',
        sender: 'them',
        senderName: 'Dr. Youssef Samir',
        text: 'Office hours moved to Thursday 3PM due to the faculty council assembly.',
        time: 'Sunday 03:00 PM',
      },
    ],
  },
  {
    id: 'conv-5',
    senderName: 'Campus System',
    senderRole: 'Automated Academic Alert',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=160&q=80',
    lastMessage: 'Absence alert: You have missed 3 lectures in Networks. Attendance is currently at 71%.',
    timestamp: 'Sat',
    unreadCount: 0,
    isOnline: true,
    thread: [
      {
        id: 'cs-1',
        sender: 'them',
        senderName: 'Campus System',
        text: 'Absence alert: You have missed 3 lectures in Networks. Attendance is currently at 71%. Contact Dr. Omar Farid if you have an official medical excuse.',
        time: 'Sat 09:12 AM',
      },
    ],
  },
];
