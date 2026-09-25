import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
// AUDIT-DEVIATION: using bcryptjs (pure-JS) instead of bcrypt (native) — functionally
// equivalent, rounds=12 preserved, no native build step required. See README §Known Deviations.
import bcrypt from 'bcryptjs';
import { pool } from './client.js';
import { config } from '../config.js';
import { indexMaterial } from '../lib/rag.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, '..', 'migrations');

interface SeedUser {
  name: string;
  email: string;
  username: string;
  roleType: string;
  codeId: string;
  messageBadge: number;
  role: string;
}

const SEED_USERS: SeedUser[] = [
  {
    name: 'Ahmed Dahy',
    email: 'ahmed.dahy@nilebyte.edu',
    username: 'student',
    roleType: 'student',
    codeId: 'STU-9921',
    messageBadge: 2,
    role: 'Student',
  },
  {
    name: 'Dr. Ahmed Dahy',
    email: 'faculty@nilebyte.edu',
    username: 'faculty',
    roleType: 'faculty',
    codeId: 'FAC-4012',
    messageBadge: 4,
    role: 'Faculty',
  },
  {
    name: 'Karim Amr',
    email: 'admin@nilebyte.edu',
    username: 'admin',
    roleType: 'admin',
    codeId: 'ADM-1004',
    messageBadge: 7,
    role: 'Admin',
  },
  {
    name: 'Dr. Mostafa Hagras',
    email: 'depthead@nilebyte.edu',
    username: 'depthead',
    roleType: 'dept-head',
    codeId: 'DH-2041',
    messageBadge: 2,
    role: 'Dept. Head — Computer Science',
  },
  {
    name: 'Prof. Ahmed El Gohary',
    email: 'dean@nilebyte.edu',
    username: 'dean',
    roleType: 'dean',
    codeId: 'DEAN-001',
    messageBadge: 5,
    role: 'Dean',
  },
  {
    name: 'Omar Tarek',
    email: 'ta@nilebyte.edu',
    username: 'ta',
    roleType: 'teaching-assistant',
    codeId: 'TA-3021',
    messageBadge: 3,
    role: 'Teaching Assistant — Computer Science',
  },
];

interface ExtraFaculty {
  name: string;
  email: string;
  username: string;
  codeId: string;
}

const EXTRA_FACULTY: ExtraFaculty[] = [
  { name: 'Dr. Sara Nour', email: 'sara.nour@nilebyte.edu', username: 'sara_nour', codeId: 'FAC-4013' },
  { name: 'Dr. Youssef Samir', email: 'youssef@nilebyte.edu', username: 'youssef', codeId: 'FAC-4014' },
  { name: 'Dr. Omar Farid', email: 'omar.farid@nilebyte.edu', username: 'omar_farid', codeId: 'FAC-4015' },
  { name: 'Dr. Nour Hassan', email: 'nour.hassan@nilebyte.edu', username: 'nour_hassan', codeId: 'FAC-4016' },
  { name: 'Eng. Karim Gamal', email: 'karim.gamal@nilebyte.edu', username: 'karim_gamal', codeId: 'FAC-4017' },
];

const SHARED_AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBOWpAWSY7hyaz8dkxQPEayHxti52b3vmlbJorx074WkRmRSLbxwkKj1mR1Icnmsr9JMusApS1YhekwJvDxJNPxOpbRLCBHzBzx31kSQafzmMR_9-x5Dlb6MJmVSjCSGBurP3_rALIciT2IRf3hZFhNOEX5xymJlJygIBnMCKueE8UWHges0OevFTaj2cVi7fpkqG4VhjsLCHEOucMDSeN5WojFbL4A9ChO6uw1a1D8NLYcMtKQX8I0B_5-W2F714jxNA';

interface CourseAssessmentSeed {
  title: string;
  type: string;
  weight: string;
  outOf: number | null;
  grade: number | null;
  releasedDate: string | null;
  status: 'RELEASED' | 'PENDING';
}

interface CourseSeed {
  name: string;
  code: string;
  credits: number;
  facultyEmail: string;
  attendance: number;
  status: string;
  assessments: CourseAssessmentSeed[];
}

const COURSES: CourseSeed[] = [
  {
    name: 'Data Structures',
    code: 'CS-301',
    credits: 3,
    facultyEmail: 'faculty@nilebyte.edu',
    attendance: 87,
    status: 'IN PROGRESS',
    assessments: [
      { title: 'Assignment 1', type: 'Coursework', weight: '10%', outOf: 20, grade: 18, releasedDate: '1 Jun 2024', status: 'RELEASED' },
      { title: 'Assignment 2', type: 'Coursework', weight: '10%', outOf: 20, grade: 17, releasedDate: '15 Jun 2024', status: 'RELEASED' },
      { title: 'Midterm', type: 'Exam', weight: '30%', outOf: 30, grade: 26.5, releasedDate: '20 Jun 2024', status: 'RELEASED' },
      { title: 'Final', type: 'Exam', weight: '50%', outOf: null, grade: null, releasedDate: null, status: 'PENDING' },
    ],
  },
  {
    name: 'Mathematics',
    code: 'MATH-201',
    credits: 3,
    facultyEmail: 'sara.nour@nilebyte.edu',
    attendance: 79,
    status: 'EXAM SOON',
    assessments: [
      { title: 'Quiz 1 — Linear Systems', type: 'Quiz', weight: '10%', outOf: 10, grade: 4, releasedDate: '28 May 2024', status: 'RELEASED' },
      { title: 'Problem Set 1', type: 'Coursework', weight: '15%', outOf: 15, grade: 14, releasedDate: '10 Jun 2024', status: 'RELEASED' },
      { title: 'Midterm Examination', type: 'Exam', weight: '25%', outOf: 25, grade: 19, releasedDate: '18 Jun 2024', status: 'RELEASED' },
      { title: 'Comprehensive Final', type: 'Exam', weight: '50%', outOf: null, grade: null, releasedDate: null, status: 'PENDING' },
    ],
  },
  {
    name: 'Operating Systems',
    code: 'CS-302',
    credits: 3,
    facultyEmail: 'youssef@nilebyte.edu',
    attendance: 92,
    status: 'IN PROGRESS',
    assessments: [
      { title: 'Process Scheduling Lab', type: 'Coursework', weight: '15%', outOf: 15, grade: 12.3, releasedDate: '5 Jun 2024', status: 'RELEASED' },
      { title: 'Concurrency Project', type: 'Project', weight: '15%', outOf: null, grade: null, releasedDate: null, status: 'PENDING' },
      { title: 'Midterm Exam', type: 'Exam', weight: '30%', outOf: null, grade: null, releasedDate: null, status: 'PENDING' },
      { title: 'Final Exam', type: 'Exam', weight: '40%', outOf: null, grade: null, releasedDate: null, status: 'PENDING' },
    ],
  },
  {
    name: 'Artificial Intelligence',
    code: 'CS-401',
    credits: 3,
    facultyEmail: 'depthead@nilebyte.edu',
    attendance: 95,
    status: 'IN PROGRESS',
    assessments: [
      { title: 'A* Search Benchmark Lab', type: 'Coursework', weight: '15%', outOf: 15, grade: 15, releasedDate: '8 Jun 2024', status: 'RELEASED' },
      { title: 'Neural Net Classifier', type: 'Project', weight: '20%', outOf: 20, grade: 17, releasedDate: '19 Jun 2024', status: 'RELEASED' },
      { title: 'Midterm Assessment', type: 'Exam', weight: '25%', outOf: null, grade: null, releasedDate: null, status: 'PENDING' },
      { title: 'Final Written Exam', type: 'Exam', weight: '40%', outOf: null, grade: null, releasedDate: null, status: 'PENDING' },
    ],
  },
  {
    name: 'Networks',
    code: 'CS-303',
    credits: 3,
    facultyEmail: 'omar.farid@nilebyte.edu',
    attendance: 71,
    status: 'EXAM SOON',
    assessments: [
      { title: 'Packet Tracer Assignment', type: 'Coursework', weight: '10%', outOf: 10, grade: 7, releasedDate: '3 Jun 2024', status: 'RELEASED' },
      { title: 'Subnetting Quiz', type: 'Quiz', weight: '15%', outOf: 15, grade: 10, releasedDate: '14 Jun 2024', status: 'RELEASED' },
      { title: 'Midterm Exam', type: 'Exam', weight: '25%', outOf: null, grade: null, releasedDate: null, status: 'PENDING' },
      { title: 'Final Exam', type: 'Exam', weight: '50%', outOf: null, grade: null, releasedDate: null, status: 'PENDING' },
    ],
  },
  {
    name: 'English Communication',
    code: 'ENG-101',
    credits: 3,
    facultyEmail: 'nour.hassan@nilebyte.edu',
    attendance: 88,
    status: 'IN PROGRESS',
    assessments: [
      { title: 'Technical Essay', type: 'Coursework', weight: '20%', outOf: 20, grade: 18, releasedDate: '25 May 2024', status: 'RELEASED' },
      { title: 'Oral Presentation', type: 'Project', weight: '20%', outOf: 20, grade: 17, releasedDate: '12 Jun 2024', status: 'RELEASED' },
      { title: 'Midterm Reading Analysis', type: 'Exam', weight: '20%', outOf: 20, grade: 18, releasedDate: '18 Jun 2024', status: 'RELEASED' },
      { title: 'Final Research Paper', type: 'Coursework', weight: '40%', outOf: 40, grade: 33, releasedDate: '22 Jun 2024', status: 'RELEASED' },
    ],
  },
];

interface ScheduleSeed {
  courseCode: string;
  name?: string;
  day: string;
  timeSlot: string;
  room: string;
  isLive: boolean;
  facultyEmail?: string;
}

const SCHEDULE: ScheduleSeed[] = [
  { courseCode: 'MATH-201', day: 'Saturday', timeSlot: '9:00 AM', room: 'Hall 104', isLive: false },
  { courseCode: 'CS-302', day: 'Saturday', timeSlot: '11:00 AM', room: 'Lab 2B', isLive: false },
  { courseCode: 'CS-301', day: 'Sunday', timeSlot: '10:00 AM', room: 'Hall 3', isLive: true },
  { courseCode: 'CS-401', day: 'Sunday', timeSlot: '1:00 PM', room: 'Smart Room 5', isLive: false },
  { courseCode: 'CS-303', day: 'Monday', timeSlot: '8:00 AM', room: 'Cisco Lab 1', isLive: false },
  { courseCode: 'ENG-101', day: 'Monday', timeSlot: '12:00 PM', room: 'Seminar Room 2', isLive: false },
  { courseCode: 'CS-301', name: 'Data Structures Lab', day: 'Tuesday', timeSlot: '10:00 AM', room: 'Lab 4', isLive: false, facultyEmail: 'karim.gamal@nilebyte.edu' },
  { courseCode: 'CS-302', day: 'Tuesday', timeSlot: '2:00 PM', room: 'Hall 2', isLive: false },
  { courseCode: 'CS-401', day: 'Wednesday', timeSlot: '9:00 AM', room: 'Smart Room 5', isLive: false },
  { courseCode: 'MATH-201', day: 'Wednesday', timeSlot: '11:00 AM', room: 'Hall 104', isLive: false },
  { courseCode: 'CS-303', name: 'Networks Practical', day: 'Thursday', timeSlot: '10:00 AM', room: 'Cisco Lab 1', isLive: false },
  { courseCode: 'ENG-101', name: 'English Discussion', day: 'Thursday', timeSlot: '1:00 PM', room: 'Room 301', isLive: false },
];

interface EventSeed {
  type: string;
  title: string;
  courseCode: string;
  dateLabel: string;
  timeLabel: string;
  room: string;
  startsAt: string;
}

const EVENTS: EventSeed[] = [
  { type: 'OFFICE HOURS', title: 'Dr. Ahmed Dahy (Advising)', courseCode: 'CS-301', dateLabel: 'Tuesday, 22 Sep', timeLabel: '02:00 PM - 04:00 PM', room: 'Faculty Bldg 3 - Office 312', startsAt: '2025-09-22 14:00' },
  { type: 'EXAM', title: 'Mathematics Midterm', courseCode: 'MATH-201', dateLabel: 'Wednesday, 23 Sep', timeLabel: '09:00 AM - 11:00 AM', room: 'Grand Hall B', startsAt: '2025-09-23 09:00' },
  { type: 'DEADLINE', title: 'Data Structures Assignment 3', courseCode: 'CS-301', dateLabel: 'Thursday, 24 Sep', timeLabel: '11:59 PM', room: 'Online Portal', startsAt: '2025-09-24 23:59' },
  { type: 'LECTURE', title: 'AI Guest Lecture: LLM Systems', courseCode: 'CS-401', dateLabel: 'Thursday, 24 Sep', timeLabel: '01:00 PM - 03:00 PM', room: 'Auditorium 1', startsAt: '2025-09-24 13:00' },
];

interface TranscriptSeed {
  courseName: string;
  courseCode: string;
  grade: string;
  gpaPoints: string;
  semester: string;
  enrolledAt: string;
}

const TRANSCRIPT: TranscriptSeed[] = [
  { courseName: 'Object-Oriented Programming', courseCode: 'CS-201', grade: 'A', gpaPoints: '4.0', semester: 'Fall 2025', enrolledAt: '2025-09-01' },
  { courseName: 'Discrete Mathematics', courseCode: 'MATH-102', grade: 'A-', gpaPoints: '3.7', semester: 'Fall 2025', enrolledAt: '2025-09-02' },
  { courseName: 'Digital Logic Design', courseCode: 'CS-203', grade: 'B+', gpaPoints: '3.3', semester: 'Spring 2025', enrolledAt: '2025-02-01' },
  { courseName: 'Introduction to Computer Science', courseCode: 'CS-101', grade: 'A', gpaPoints: '4.0', semester: 'Fall 2024', enrolledAt: '2024-09-02' },
  { courseName: 'Calculus I', courseCode: 'MATH-101', grade: 'B', gpaPoints: '3.0', semester: 'Fall 2024', enrolledAt: '2024-09-01' },
];

async function runMigrations(): Promise<void> {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       filename    TEXT PRIMARY KEY,
       applied_at  TIMESTAMPTZ DEFAULT NOW()
     )`
  );

  const files = [
    '001_init.sql',
    '002_student_core.sql',
    '003_schedule_faculty.sql',
    '004_faculty_core.sql',
    '005_admin_core.sql',
    '006_events_notifications.sql',
    '007_ai_tutor.sql',
    '008_security_hardening.sql',
    '009_features.sql',
    '010_teaching_assistant.sql',
  ];

  for (const filename of files) {
    const applied = await pool.query<{ filename: string }>(
      `SELECT filename FROM schema_migrations WHERE filename = $1 LIMIT 1`,
      [filename]
    );
    if (applied.rows[0]) {
      console.log(`Skipping already-applied migration ${filename}`);
      continue;
    }

    const sql = readFileSync(join(MIGRATIONS_DIR, filename), 'utf8');
    await pool.query(sql);
    await pool.query(
      `INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING`,
      [filename]
    );
    console.log(`Applied migration ${filename}`);
  }
}

function getDemoSeedPassword(): string {
  const value = process.env.DEMO_SEED_PASSWORD;
  if (!value || value.length < 12) {
    throw new Error(
      'DEMO_SEED_PASSWORD must be set in .env and be at least 12 characters long.'
    );
  }
  return value;
}

async function seedUsers(): Promise<void> {
  const demoPassword = getDemoSeedPassword();
  const passwordHash = await bcrypt.hash(demoPassword, config.bcryptRounds);

  for (const user of SEED_USERS) {
    await pool.query(
      `INSERT INTO users (name, email, username, password_hash, role_type, code_id, avatar_url, message_badge)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [
        user.name,
        user.email,
        user.username,
        passwordHash,
        user.roleType,
        user.codeId,
        SHARED_AVATAR_URL,
        user.messageBadge,
      ]
    );
  }

  console.log(`Seeded ${SEED_USERS.length} demo users.`);
  console.log('Demo accounts password is set from DEMO_SEED_PASSWORD in your .env file.');
}

async function seedStudentCore(): Promise<void> {
  const demoPassword = getDemoSeedPassword();
  const passwordHash = await bcrypt.hash(demoPassword, config.bcryptRounds);

  const deptResult = await pool.query<{ id: string }>(
    `INSERT INTO departments (name, code) VALUES ('Computer Science', 'CS')
     ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id`
  );
  const departmentId = deptResult.rows[0].id;

  const deptHeadRow = await pool.query<{ id: string }>(
    `SELECT id FROM users WHERE email = 'depthead@nilebyte.edu' LIMIT 1`
  );
  if (deptHeadRow.rows[0]) {
    await pool.query(`UPDATE departments SET head_id = $1 WHERE id = $2`, [
      deptHeadRow.rows[0].id,
      departmentId,
    ]);
  }

  for (const f of EXTRA_FACULTY) {
    await pool.query(
      `INSERT INTO users (name, email, username, password_hash, role_type, code_id, avatar_url, message_badge)
       VALUES ($1, $2, $3, $4, 'faculty', $5, $6, 0)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name`,
      [f.name, f.email, f.username, passwordHash, f.codeId, SHARED_AVATAR_URL]
    );
  }

  const courseIdByCode = new Map<string, string>();

  for (const course of COURSES) {
    const facultyRow = await pool.query<{ id: string }>(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [course.facultyEmail]
    );
    const facultyId = facultyRow.rows[0]?.id ?? null;

    const result = await pool.query<{ id: string }>(
      `INSERT INTO courses (name, code, credits, department_id, faculty_id, semester)
       VALUES ($1, $2, $3, $4, $5, 'Semester 2 — 2025/2026')
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, credits = EXCLUDED.credits,
         department_id = EXCLUDED.department_id, faculty_id = EXCLUDED.faculty_id
       RETURNING id`,
      [course.name, course.code, course.credits, departmentId, facultyId]
    );
    courseIdByCode.set(course.code, result.rows[0].id);
  }

  const studentRow = await pool.query<{ id: string }>(
    `SELECT id FROM users WHERE email = 'ahmed.dahy@nilebyte.edu' LIMIT 1`
  );
  const studentId = studentRow.rows[0].id;

  for (const course of COURSES) {
    const courseId = courseIdByCode.get(course.code)!;

    await pool.query(
      `INSERT INTO enrollments (student_id, course_id, status, attendance_pct)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, course_id) DO UPDATE SET status = EXCLUDED.status,
         attendance_pct = EXCLUDED.attendance_pct`,
      [studentId, courseId, course.status, course.attendance]
    );

    let order = 0;
    for (const a of course.assessments) {
      order += 1;
      const existing = await pool.query<{ id: string }>(
        `SELECT id FROM assessments WHERE course_id = $1 AND title = $2 LIMIT 1`,
        [courseId, a.title]
      );
      let assessmentId: string;
      if (existing.rows[0]) {
        assessmentId = existing.rows[0].id;
        await pool.query(
          `UPDATE assessments SET type = $1, weight_pct = $2, out_of = $3, display_order = $4 WHERE id = $5`,
          [a.type, a.weight, a.outOf, order, assessmentId]
        );
      } else {
        const inserted = await pool.query<{ id: string }>(
          `INSERT INTO assessments (course_id, title, type, weight_pct, out_of, display_order)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [courseId, a.title, a.type, a.weight, a.outOf, order]
        );
        assessmentId = inserted.rows[0].id;
      }

      await pool.query(
        `INSERT INTO grades (assessment_id, student_id, grade, released_date, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (assessment_id, student_id) DO UPDATE SET grade = EXCLUDED.grade,
           released_date = EXCLUDED.released_date, status = EXCLUDED.status`,
        [assessmentId, studentId, a.grade, a.releasedDate, a.status]
      );
    }
  }

  await pool.query(`DELETE FROM schedule_slots`);
  for (const slot of SCHEDULE) {
    const courseId = courseIdByCode.get(slot.courseCode)!;
    let facultyId: string | null = null;
    if (slot.facultyEmail) {
      const row = await pool.query<{ id: string }>(
        `SELECT id FROM users WHERE email = $1 LIMIT 1`,
        [slot.facultyEmail]
      );
      facultyId = row.rows[0]?.id ?? null;
    }
    await pool.query(
      `INSERT INTO schedule_slots (course_id, name, day_of_week, time_slot, room, is_live, faculty_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [courseId, slot.name ?? null, slot.day, slot.timeSlot, slot.room, slot.isLive, facultyId]
    );
  }

  await pool.query(`DELETE FROM upcoming_events WHERE student_id = $1`, [studentId]);
  for (const ev of EVENTS) {
    const courseId = courseIdByCode.get(ev.courseCode) ?? null;
    await pool.query(
      `INSERT INTO upcoming_events (course_id, student_id, type, title, date_label, time_label, room)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [courseId, studentId, ev.type, ev.title, ev.dateLabel, ev.timeLabel, ev.room]
    );
  }

  await pool.query(`DELETE FROM transcript_entries WHERE student_id = $1`, [studentId]);
  for (const t of TRANSCRIPT) {
    await pool.query(
      `INSERT INTO transcript_entries (student_id, course_name, course_code, grade, gpa_points, semester, enrolled_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [studentId, t.courseName, t.courseCode, t.grade, t.gpaPoints, t.semester, t.enrolledAt]
    );
  }

  console.log('Seeded student core data');
}

interface DemoStudent {
  name: string;
  codeId: string;
  email: string;
}

const FACULTY_DEMO_STUDENTS: DemoStudent[] = [
  { name: 'Omar Hassan', codeId: '202100234', email: 'omar.hassan@nilebyte.edu' },
  { name: 'Sara Mahmoud', codeId: '202100187', email: 'sara.mahmoud@nilebyte.edu' },
  { name: 'Nour Ali', codeId: '202100312', email: 'nour.ali@nilebyte.edu' },
  { name: 'Youssef Samir', codeId: '202100098', email: 'youssef.samir@nilebyte.edu' },
  { name: 'Layla Ahmed', codeId: '202100445', email: 'layla.ahmed@nilebyte.edu' },
  { name: 'Khaled Mostafa', codeId: '202100267', email: 'khaled.mostafa@nilebyte.edu' },
  { name: 'Dina Kamal', codeId: '202100391', email: 'dina.kamal@nilebyte.edu' },
  { name: 'Ahmed Tarek', codeId: '202100156', email: 'ahmed.tarek@nilebyte.edu' },
];

const AT_RISK_SEED: DemoStudent[] = [
  { name: 'Karim Mansour', codeId: '202100501', email: 'karim.mansour@nilebyte.edu' },
  { name: 'Layla Ezzat', codeId: '202100502', email: 'layla.ezzat@nilebyte.edu' },
  { name: 'Omar Tarek', codeId: '202100503', email: 'omar.tarek@nilebyte.edu' },
  { name: 'Hana Soliman', codeId: '202100504', email: 'hana.soliman@nilebyte.edu' },
];

async function upsertDemoStudent(student: DemoStudent, passwordHash: string): Promise<string> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO users (name, email, username, password_hash, role_type, code_id, avatar_url, message_badge)
     VALUES ($1, $2, $3, $4, 'student', $5, $6, 0)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash
     RETURNING id`,
    [
      student.name,
      student.email,
      student.email.split('@')[0],
      passwordHash,
      student.codeId,
      SHARED_AVATAR_URL,
    ]
  );
  return result.rows[0].id;
}

async function seedFacultyCore(): Promise<void> {
  const demoPassword = getDemoSeedPassword();
  const passwordHash = await bcrypt.hash(demoPassword, config.bcryptRounds);

  const facultyRow = await pool.query<{ id: string }>(
    `SELECT id FROM users WHERE email = 'faculty@nilebyte.edu' LIMIT 1`
  );
  const facultyId = facultyRow.rows[0]?.id;
  if (!facultyId) return;

  const courseRow = await pool.query<{ id: string; code: string }>(`SELECT id, code FROM courses`);
  const courseIdByCode = new Map<string, string>();
  for (const row of courseRow.rows) courseIdByCode.set(row.code, row.id);

  const ASSIGNMENTS = [
    { code: 'CS-301', section: 'Section A', room: 'Room 204' },
    { code: 'MATH-201', section: 'Section B', room: 'Room 101' },
    { code: 'CS-401', section: 'Section A', room: 'Room 301' },
    { code: 'CS-303', section: 'Section C', room: 'Room 205' },
  ];
  for (const a of ASSIGNMENTS) {
    const courseId = courseIdByCode.get(a.code);
    if (!courseId) continue;
    await pool.query(
      `INSERT INTO faculty_course_assignments (faculty_id, course_id, section, room)
       VALUES ($1, $2, $3, $4) ON CONFLICT (faculty_id, course_id, section) DO NOTHING`,
      [facultyId, courseId, a.section, a.room]
    );
  }

  for (const s of FACULTY_DEMO_STUDENTS) {
    const studentId = await upsertDemoStudent(s, passwordHash);
    const course = {
      'Omar Hassan': 'CS-301', 'Sara Mahmoud': 'CS-303', 'Nour Ali': 'MATH-201',
      'Youssef Samir': 'CS-401', 'Layla Ahmed': 'CS-301', 'Khaled Mostafa': 'CS-303',
      'Dina Kamal': 'MATH-201', 'Ahmed Tarek': 'CS-401',
    }[s.name];
    const courseId = course ? courseIdByCode.get(course) : undefined;
    if (!courseId) continue;
    const attendance = { 'Omar Hassan': 91, 'Sara Mahmoud': 61, 'Nour Ali': 74, 'Youssef Samir': 95, 'Layla Ahmed': 68, 'Khaled Mostafa': 83, 'Dina Kamal': 77, 'Ahmed Tarek': 55 }[s.name] ?? 80;
    await pool.query(
      `INSERT INTO enrollments (student_id, course_id, status, attendance_pct)
       VALUES ($1, $2, 'IN PROGRESS', $3)
       ON CONFLICT (student_id, course_id) DO UPDATE SET attendance_pct = EXCLUDED.attendance_pct`,
      [studentId, courseId, attendance]
    );
  }

  const studentIdByName = new Map<string, string>();
  for (const s of [...FACULTY_DEMO_STUDENTS, ...AT_RISK_SEED]) {
    const id = await upsertDemoStudent(s, passwordHash);
    studentIdByName.set(s.name, id);
  }

  const cs301 = courseIdByCode.get('CS-301');
  if (cs301) {
    await pool.query(`DELETE FROM attendance_sessions WHERE course_id = $1`, [cs301]);
    const sessions = [
      { label: 'Lecture 11', date: '2024-07-07', present: 61, absent: 6 },
      { label: 'Lecture 10', date: '2024-07-03', present: 58, absent: 9 },
      { label: 'Lecture 9', date: '2024-06-30', present: 55, absent: 12 },
    ];
    const sessionIds = new Map<string, string>();
    for (const s of sessions) {
      const r = await pool.query<{ id: string }>(
        `INSERT INTO attendance_sessions (course_id, faculty_id, lecture_label, session_date, is_open, present_count, absent_count)
         VALUES ($1, $2, $3, $4, false, $5, $6) RETURNING id`,
        [cs301, facultyId, s.label, s.date, s.present, s.absent]
      );
      sessionIds.set(s.label, r.rows[0].id);
    }

    const lec11 = sessionIds.get('Lecture 11');
    if (lec11) {
      const records = [
        { name: 'Omar Hassan', status: 'PRESENT' },
        { name: 'Sara Mahmoud', status: 'ABSENT' },
        { name: 'Nour Ali', status: 'PRESENT' },
        { name: 'Ahmed Tarek', status: 'ABSENT' },
        { name: 'Layla Ahmed', status: 'PRESENT' },
      ];
      for (const rec of records) {
        const sid = studentIdByName.get(rec.name);
        if (!sid) continue;
        await pool.query(
          `INSERT INTO attendance_records (session_id, student_id, status, method)
           VALUES ($1, $2, $3, 'MANUAL') ON CONFLICT (session_id, student_id) DO NOTHING`,
          [lec11, sid, rec.status]
        );
      }
    }
  }

  await pool.query(`DELETE FROM at_risk_flags`);
  const RISK = [
    { name: 'Karim Mansour', code: 'CS-301', level: 'Critical', signal: 'Missed 4 lectures & Quiz 1 absent' },
    { name: 'Layla Ezzat', code: 'CS-303', level: 'High', signal: 'Midterm score: 38/100' },
    { name: 'Omar Tarek', code: 'CS-401', level: 'Moderate', signal: '2 late homework submissions' },
    { name: 'Hana Soliman', code: 'CS-301', level: 'High', signal: 'Grade trend: 72 → 61 → 54' },
  ];
  for (const r of RISK) {
    const sid = studentIdByName.get(r.name);
    const cid = courseIdByCode.get(r.code);
    if (!sid || !cid) continue;
    await pool.query(
      `INSERT INTO at_risk_flags (student_id, course_id, risk_level, signal)
       VALUES ($1, $2, $3, $4) ON CONFLICT (student_id, course_id) DO NOTHING`,
      [sid, cid, r.level, r.signal]
    );
  }

  await pool.query(`DELETE FROM course_materials WHERE faculty_id = $1`, [facultyId]);
  const MATERIALS = [
    { code: 'CS-301', file: 'CS301_Lecture08_BinaryTrees_Advanced.pdf', type: 'PDF Lecture Slides', size: '4.2 MB', date: '2024-07-12' },
    { code: 'MATH-201', file: 'MATH201_Calculus_Practice_Set_03.pdf', type: 'Assignment PDF', size: '1.8 MB', date: '2024-07-09' },
    { code: 'CS-401', file: 'CS401_A*Search_Implementation_Guide.zip', type: 'Lab Archive Code', size: '8.7 MB', date: '2024-07-05' },
  ];
  for (const m of MATERIALS) {
    const cid = courseIdByCode.get(m.code);
    if (!cid) continue;
    await pool.query(
      `INSERT INTO course_materials (course_id, faculty_id, file_name, file_key, file_size, material_type, uploaded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [cid, facultyId, m.file, `courses/${m.code.toLowerCase()}/materials/${m.file}`, m.size, m.type, m.date]
    );
  }

  await pool.query(`DELETE FROM community_posts WHERE course_id = $1`, [cs301]);
  if (cs301) {
    const POSTS = [
      { type: 'QUESTION', title: 'What is the time complexity of AVL tree insertion?', author: 'Karim Mostafa', content: 'When we insert a node into an AVL tree and it causes a double rotation (RL or LR), does the height update take O(1) or does it traverse up the whole tree? Trying to understand the rigorous proof for the exam.', upvotes: 9, pinned: false, aiAnswer: 'AVL tree insertion takes O(log n) total time in both worst and average cases. While searching for the insertion spot takes O(log n), rebalancing requires at most one single or double rotation (which is strictly O(1) pointer updates). Height recalculations from the inserted leaf back to the root require at most O(log n) steps.', aiCitation: 'Lecture 08: Self-Balancing Binary Search Trees, Slide 14', aiStatus: 'awaiting_approval' },
      { type: 'RESOURCE', title: 'My full summary notes for Chapter 4 — Trees', author: 'Layla Ahmed', content: 'Uploaded handwritten PDF notes summarizing BST insertion, in-order traversals, and heapify operations with color-coded diagrams. Hope this helps everyone preparing for the upcoming quiz!', upvotes: 28, pinned: true, aiAnswer: null, aiCitation: null, aiStatus: null },
      { type: 'QUESTION', title: 'Will the exam cover graph traversal algorithms?', author: 'Ziad Nabil', content: 'Are Breadth-First Search (BFS) and Depth-First Search (DFS) included in the Midterm examination or will they be postponed to the final?', upvotes: 14, pinned: false, aiAnswer: 'According to the official CS-301 syllabus, BFS, DFS, and topological sort algorithms will be covered in the Midterm exam (Weeks 1 to 7). Dijkstra algorithm will be assessed in the final exam only.', aiCitation: 'CS-301 Official Syllabus & Midterm Study Guide (Rev 2)', aiStatus: 'approved' },
      { type: 'DISCUSSION', title: 'Should we form a study group for the final?', author: 'Omar Hassan', content: 'Looking to organize an active evening study group in the central library Room 2B or over Discord to solve past exam problems together. Who wants to join?', upvotes: 15, pinned: false, aiAnswer: null, aiCitation: null, aiStatus: null },
    ];
    for (const p of POSTS) {
      const authorId = studentIdByName.get(p.author) ?? null;
      await pool.query(
        `INSERT INTO community_posts (course_id, author_id, post_type, title, content, upvotes, is_pinned, ai_answer, ai_citation, ai_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [cs301, authorId, p.type, p.title, p.content, p.upvotes, p.pinned, p.aiAnswer, p.aiCitation, p.aiStatus]
      );
    }
  }

  await pool.query(`DELETE FROM messages WHERE sender_id = $1 OR recipient_id = $1`, [facultyId]);
  const omarId = studentIdByName.get('Omar Hassan');
  if (omarId) {
    const THREAD = [
      { from: omarId, to: facultyId, body: 'Good morning Professor Ahmed, hope you are having a productive week.' },
      { from: omarId, to: facultyId, body: 'Professor, can you clarify the midterm scope? Specifically regarding whether AVL double rotations will involve full runtime proofs or just pointer operations?' },
      { from: facultyId, to: omarId, body: 'Hello Omar. For the Midterm, focus on identifying when RL and LR rotations occur and updating the tree pointers. Full height proofs will only be an extra credit component.' },
    ];
    for (const m of THREAD) {
      await pool.query(`INSERT INTO messages (sender_id, recipient_id, body) VALUES ($1, $2, $3)`, [m.from, m.to, m.body]);
    }
  }

  console.log('Seeded faculty core data');
}

async function seedAdminCore(): Promise<void> {
  const demoPassword = getDemoSeedPassword();
  const passwordHash = await bcrypt.hash(demoPassword, config.bcryptRounds);

  const ROOMS = [
    { name: 'Hall A', capacity: 120 },
    { name: 'Hall B', capacity: 100 },
    { name: 'Hall C', capacity: 80 },
    { name: 'Room 301', capacity: 50 },
    { name: 'Lab 2', capacity: 40 },
  ];
  const roomIdByName = new Map<string, string>();
  for (const r of ROOMS) {
    const res = await pool.query<{ id: string }>(
      `INSERT INTO exam_rooms (name, capacity) VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET capacity = EXCLUDED.capacity RETURNING id`,
      [r.name, r.capacity]
    );
    roomIdByName.set(r.name, res.rows[0].id);
  }

  const courseRow = await pool.query<{ id: string; code: string }>(`SELECT id, code FROM courses`);
  const courseIdByCode = new Map<string, string>();
  for (const row of courseRow.rows) courseIdByCode.set(row.code, row.id);

  const EXTRA_COURSES = [
    { name: 'Business Law', code: 'LAW-201', credits: 3 },
    { name: 'Organic Chemistry', code: 'CHEM-301', credits: 3 },
  ];
  for (const c of EXTRA_COURSES) {
    if (courseIdByCode.has(c.code)) continue;
    const res = await pool.query<{ id: string }>(
      `INSERT INTO courses (name, code, credits, is_active) VALUES ($1, $2, $3, true)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [c.name, c.code, c.credits]
    );
    courseIdByCode.set(c.code, res.rows[0].id);
  }

  const userRow = await pool.query<{ id: string; name: string; email: string }>(
    `SELECT id, name, email FROM users`
  );
  const userIdByName = new Map<string, string>();
  const userIdByEmail = new Map<string, string>();
  for (const row of userRow.rows) {
    userIdByName.set(row.name, row.id);
    userIdByEmail.set(row.email, row.id);
  }

  await pool.query(`DELETE FROM exam_schedule`);
  const EXAMS = [
    { code: 'CS-301', room: 'Hall A', invigilator: 'Dr. Ahmed Dahy', date: '2024-07-10', time: '9:00 AM', status: 'CONFIRMED' },
    { code: 'MATH-201', room: 'Hall B', invigilator: 'Dr. Sara Nour', date: '2024-07-10', time: '12:00 PM', status: 'CONFIRMED' },
    { code: 'CS-401', room: 'Room 301', invigilator: 'Dr. Mostafa Hagras', date: '2024-07-11', time: '9:00 AM', status: 'PENDING' },
    { code: 'CS-303', room: 'Hall A', invigilator: 'Dr. Omar Farid', date: '2024-07-12', time: '11:00 AM', status: 'CONFIRMED' },
    { code: 'LAW-201', room: 'Hall C', invigilator: 'Dr. Nour Hassan', date: '2024-07-13', time: '10:00 AM', status: 'PENDING' },
    { code: 'CHEM-301', room: 'Lab 2', invigilator: 'Dr. Youssef Samir', date: '2024-07-14', time: '9:00 AM', status: 'CONFIRMED' },
  ];
  for (const e of EXAMS) {
    const cid = courseIdByCode.get(e.code) ?? null;
    const rid = roomIdByName.get(e.room) ?? null;
    const inv = userIdByName.get(e.invigilator) ?? null;
    await pool.query(
      `INSERT INTO exam_schedule (course_id, room_id, invigilator_id, exam_date, time_slot, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [cid, rid, inv, e.date, e.time, e.status]
    );
  }

  await pool.query(`DELETE FROM exam_conflicts`);
  const CONFLICTS = [
    { type: 'critical', text: 'Hall A double-booked on 10 Jul at 9:00 AM — resolve immediately' },
    { type: 'warning', text: 'Dr. Omar Farid assigned to 2 exams on the same day' },
  ];
  for (const c of CONFLICTS) {
    await pool.query(
      `INSERT INTO exam_conflicts (conflict_type, description, resolved) VALUES ($1, $2, false)`,
      [c.type, c.text]
    );
  }

  await pool.query(`DELETE FROM invoices`);
  const INVOICES = [
    { code: '202100234', no: 'INV-3312', type: 'Tuition', cents: 120000, due: '2024-07-01', paid: '2024-07-01', status: 'PAID' },
    { code: '202100187', no: 'INV-3301', type: 'Tuition', cents: 120000, due: '2024-07-01', paid: null, status: 'OVERDUE' },
    { code: '202100312', no: 'INV-3289', type: 'Service Fee', cents: 60000, due: '2024-07-01', paid: '2024-07-03', status: 'PAID' },
    { code: '202100098', no: 'INV-3276', type: 'Tuition', cents: 120000, due: '2024-07-01', paid: null, status: 'PARTIAL' },
    { code: '202100445', no: 'INV-3265', type: 'Tuition', cents: 120000, due: '2024-07-01', paid: null, status: 'OVERDUE' },
    { code: '202100267', no: 'INV-3254', type: 'Tuition', cents: 120000, due: '2024-07-01', paid: '2024-07-05', status: 'PAID' },
    { code: '202100391', no: 'INV-3243', type: 'Service Fee', cents: 60000, due: '2024-07-01', paid: null, status: 'OVERDUE' },
    { code: '202100156', no: 'INV-3232', type: 'Tuition', cents: 120000, due: '2024-07-01', paid: '2024-07-02', status: 'PAID' },
  ];
  const studentRow = await pool.query<{ id: string; code_id: string }>(
    `SELECT id, code_id FROM users WHERE role_type = 'student'`
  );
  const studentIdByCode = new Map<string, string>();
  for (const row of studentRow.rows) studentIdByCode.set(row.code_id, row.id);
  for (const inv of INVOICES) {
    const sid = studentIdByCode.get(inv.code) ?? null;
    await pool.query(
      `INSERT INTO invoices (student_id, invoice_no, type, amount_cents, due_date, paid_date, status, reminder_sent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false)`,
      [sid, inv.no, inv.type, inv.cents, inv.due, inv.paid, inv.status]
    );
  }

  await pool.query(`DELETE FROM reports`);
  const REPORTS = [
    { name: 'Semester 2 Academic Report', type: 'Academic', format: 'PDF', by: 'Campus AI', ai: true, summary: 'Comprehensive audit of final grades, GPA distributions, and departmental performance indices.' },
    { name: 'Faculty Load Report — Jul 2024', type: 'HR', format: 'Excel', by: 'Admin', ai: false, summary: 'Teaching credit allocations, weekly load hours, and overtime stipends across faculties.' },
    { name: 'Fee Collection Report — Semester 2', type: 'Finance', format: 'PDF', by: 'Admin', ai: false, summary: 'Tuition revenue, outstanding ledger balances, and payment gateway settlement reports.' },
    { name: 'At-Risk Students Report', type: 'Academic', format: 'PDF', by: 'Campus AI', ai: true, summary: 'Risk matrix detailing 27 flagged students, attendance dropoffs, and intervention plans.' },
    { name: 'Enrollment Summary — Semester 2', type: 'Enrollment', format: 'Excel', by: 'Admin', ai: false, summary: 'Census count of 4,821 active students, waitlists, and capacity ceilings.' },
    { name: 'Board Meeting Brief — Jul 2024', type: 'Executive', format: 'PDF', by: 'Campus AI', ai: true, summary: 'Executive summary briefing prepared for Chancellor and Board of Trustees.' },
  ];
  for (const r of REPORTS) {
    await pool.query(
      `INSERT INTO reports (name, report_type, format, generated_by, is_ai, summary, generated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [r.name, r.type, r.format, r.by, r.ai, r.summary]
    );
  }

  await pool.query(`DELETE FROM registrations`);
  const REGISTRATIONS = [
    { name: 'Ziad El-Shamy', program: 'Computer Science', status: 'APPROVED' },
    { name: 'Nourhan Fathy', program: 'Business Admin', status: 'PENDING' },
    { name: 'Hana Soliman', program: 'Medicine', status: 'PENDING' },
    { name: 'Omar Khaled', program: 'Engineering', status: 'REJECTED' },
    { name: 'Salma Adel', program: 'Computer Science', status: 'PENDING' },
  ];
  for (const r of REGISTRATIONS) {
    await pool.query(
      `INSERT INTO registrations (name, program, status) VALUES ($1, $2, $3)`,
      [r.name, r.program, r.status]
    );
  }

  const STAFF = [
    { name: 'Eman Samy', email: 'eman@nilebyte.edu', code: 'STF-001', department: 'Registrar Office', role: 'Registrar Officer', shift: 'Morning shift' },
    { name: 'Hassan Ali', email: 'hassan.ali@nilebyte.edu', code: 'STF-002', department: 'IT Department', role: 'System Admin', shift: 'Morning shift' },
    { name: 'Rania Kamal', email: 'rania.kamal@nilebyte.edu', code: 'STF-003', department: 'Library', role: 'Head Librarian', shift: 'Afternoon shift' },
  ];
  for (const s of STAFF) {
    const res = await pool.query<{ id: string }>(
      `INSERT INTO users (name, email, username, password_hash, role_type, code_id, avatar_url, message_badge)
       VALUES ($1, $2, $3, $4, 'admin', $5, $6, 0)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash RETURNING id`,
      [s.name, s.email, s.email.split('@')[0], passwordHash, s.code, SHARED_AVATAR_URL]
    );
    const uid = res.rows[0].id;
    await pool.query(
      `INSERT INTO staff (user_id, department, role_label, shift)
       VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET department = EXCLUDED.department`,
      [uid, s.department, s.role, s.shift]
    );
  }

  await pool.query(`DELETE FROM leave_requests`);
  const LEAVES = [
    { name: 'Dr. Sara Nour', department: 'CS Dept', type: 'Annual Leave', from: '2024-07-15', to: '2024-07-22', status: 'pending' },
    { name: 'Eng. Hassan Ali', department: 'IT Dept', type: 'Emergency Leave', from: '2024-07-10', to: '2024-07-12', status: 'approved' },
    { name: 'Dr. Tarek Fouad', department: 'CS Dept', type: 'Conference Leave', from: '2024-07-18', to: '2024-07-20', status: 'pending' },
  ];
  for (const l of LEAVES) {
    let uid = userIdByName.get(l.name) ?? null;
    if (!uid) {
      const res = await pool.query<{ id: string }>(
        `INSERT INTO users (name, email, username, password_hash, role_type, code_id, avatar_url, message_badge)
         VALUES ($1, $2, $3, $4, 'faculty', $5, $6, 0)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash RETURNING id`,
        [l.name, `${l.name.toLowerCase().replace(/[^a-z]/g, '.')}@nilebyte.edu`, l.name.toLowerCase().replace(/[^a-z]/g, '_'), passwordHash, `FAC-9${Math.floor(Math.random() * 900 + 100)}`, SHARED_AVATAR_URL]
      );
      uid = res.rows[0].id;
    }
    await pool.query(
      `INSERT INTO leave_requests (user_id, department, leave_type, from_date, to_date, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uid, l.department, l.type, l.from, l.to, l.status]
    );
  }

  await pool.query(`DELETE FROM enrollments WHERE course_id IN (SELECT id FROM courses WHERE code IN ('CS-301'))`);
  const CORE_ENROLLMENTS = [
    { name: 'Ahmed Tarek', code: 'CS-301', attendance: 91 },
    { name: 'Khaled Mostafa', code: 'CS-301', attendance: 83 },
    { name: 'Nour Ali', code: 'CS-301', attendance: 88 },
  ];
  for (const e of CORE_ENROLLMENTS) {
    const sid = userIdByName.get(e.name);
    const cid = courseIdByCode.get(e.code);
    if (!sid || !cid) continue;
    await pool.query(
      `INSERT INTO enrollments (student_id, course_id, status, attendance_pct)
       VALUES ($1, $2, 'IN PROGRESS', $3) ON CONFLICT (student_id, course_id) DO UPDATE SET attendance_pct = EXCLUDED.attendance_pct`,
      [sid, cid, e.attendance]
    );
  }

  await pool.query(`UPDATE courses SET capacity = 70 WHERE code = 'CS-301'`);
  await pool.query(`UPDATE courses SET capacity = 70 WHERE code = 'MATH-201'`);
  await pool.query(`UPDATE courses SET capacity = 50 WHERE code = 'CS-401'`);
  await pool.query(`UPDATE courses SET capacity = 60 WHERE code = 'CS-303'`);
  await pool.query(`UPDATE courses SET capacity = 60 WHERE code = 'LAW-201'`);
  await pool.query(`UPDATE courses SET capacity = 50 WHERE code = 'CHEM-301'`);

  console.log('Seeded admin core data');
}

async function seedPhase5(): Promise<void> {
  const EXTRA_DEPTS = [
    { name: 'Medicine', code: 'MED' },
    { name: 'Engineering', code: 'ENG' },
    { name: 'Business', code: 'BUS' },
    { name: 'Arts & Humanities', code: 'AH' },
    { name: 'Law', code: 'LAW' },
  ];
  for (const d of EXTRA_DEPTS) {
    await pool.query(
      `INSERT INTO departments (name, code) VALUES ($1, $2)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name`,
      [d.name, d.code]
    );
  }

  const csRow = await pool.query<{ id: string }>(`SELECT id FROM departments WHERE code = 'CS' LIMIT 1`);
  const csDeptId = csRow.rows[0]?.id ?? null;
  if (csDeptId) {
    await pool.query(
      `INSERT INTO dept_stats (department_id, at_risk_count, pass_rate, avg_attendance)
       VALUES ($1, 5, 76, 84)
       ON CONFLICT (department_id) DO UPDATE SET at_risk_count = EXCLUDED.at_risk_count,
         pass_rate = EXCLUDED.pass_rate, avg_attendance = EXCLUDED.avg_attendance`,
      [csDeptId]
    );
  }

  const adminRow = await pool.query<{ id: string }>(`SELECT id FROM users WHERE email = 'admin@nilebyte.edu' LIMIT 1`);
  const adminId = adminRow.rows[0]?.id ?? null;
  if (adminId && csDeptId) {
    await pool.query(`DELETE FROM activity_log WHERE action LIKE 'intervention:%'`);
    const INTERVENTIONS = [
      { action: 'intervention:email_warning_sent', metadata: { studentName: 'Sara Mahmoud', deptId: csDeptId, performer: 'Dr. Mostafa Hagras', date: '8 Jul 2024' } },
      { action: 'intervention:advisor_assigned', metadata: { studentName: 'Ahmed Tarek', deptId: csDeptId, performer: 'Dr. Mostafa Hagras', date: '5 Jul 2024' } },
      { action: 'intervention:academic_plan_set', metadata: { studentName: 'Layla Ahmed', deptId: csDeptId, performer: 'System', date: '3 Jul 2024' } },
    ];
    for (const i of INTERVENTIONS) {
      await pool.query(`INSERT INTO activity_log (user_id, action, metadata) VALUES ($1, $2, $3)`, [adminId, i.action, i.metadata]);
    }
  }

  const studentRow = await pool.query<{ id: string }>(`SELECT id FROM users WHERE email = 'ahmed.dahy@nilebyte.edu' LIMIT 1`);
  const studentId = studentRow.rows[0]?.id ?? null;
  if (studentId) {
    await pool.query(`DELETE FROM notifications WHERE user_id = $1`, [studentId]);
    const NOTIFS = [
      { title: 'Grade Released for Assignment 1', body: 'Your grade for Assignment 1 has been released.', type: 'grade', readAt: null },
      { title: 'Tuition installment due in 5 days', body: 'Your next tuition installment is due soon.', type: 'info', readAt: null },
      { title: 'Attendance Alert', body: 'You were marked absent recently. Contact your faculty if this is incorrect.', type: 'attendance', readAt: 'now' },
      { title: 'New semester enrollment open', body: 'Enrollment for the new semester is now open.', type: 'info', readAt: 'now' },
    ];
    for (const n of NOTIFS) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, body, type, read_at, created_at)
         VALUES ($1, $2, $3, $4, ${n.readAt ? 'NOW()' : 'NULL'}, NOW())`,
        [studentId, n.title, n.body, n.type]
      );
    }
  }

  await pool.query(
    `DELETE FROM reports WHERE name IN ('CS Dept Performance Report — Jul 2024', 'Faculty Load Report — CS Dept', 'At-Risk Students CS Report', 'University Academic Report S2 2026', 'Board Meeting Brief — Jul 2024', 'University Fee Collection Summary', 'Enrollment Census S2 2026')`
  );
  const PHASE5_REPORTS = [
    { name: 'CS Dept Performance Report — Jul 2024', type: 'Academic', format: 'PDF', by: 'Campus AI', ai: true, summary: 'Department performance report for Computer Science.' },
    { name: 'Faculty Load Report — CS Dept', type: 'HR', format: 'Excel', by: 'Admin', ai: false, summary: 'Faculty load summary for the CS department.' },
    { name: 'At-Risk Students CS Report', type: 'Academic', format: 'PDF', by: 'Campus AI', ai: true, summary: 'At-risk students in the CS department.' },
    { name: 'University Academic Report S2 2026', type: 'Academic', format: 'PDF', by: 'Campus AI', ai: true, summary: 'University-wide academic report.' },
    { name: 'Board Meeting Brief — Jul 2024', type: 'Executive', format: 'PDF', by: 'Campus AI', ai: true, summary: 'Executive brief for the board.' },
    { name: 'University Fee Collection Summary', type: 'Finance', format: 'Excel', by: 'Admin', ai: false, summary: 'Fee collection summary.' },
    { name: 'Enrollment Census S2 2026', type: 'Enrollment', format: 'Excel', by: 'Admin', ai: false, summary: 'Enrollment census report.' },
  ];
  for (const r of PHASE5_REPORTS) {
    await pool.query(
      `INSERT INTO reports (name, report_type, format, generated_by, is_ai, summary, generated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [r.name, r.type, r.format, r.by, r.ai, r.summary]
    );
  }

  console.log('Seeded phase 5 data');
}

async function seedPhase6(): Promise<void> {
  const studentRow = await pool.query<{ id: string }>(`SELECT id FROM users WHERE email = 'ahmed.dahy@nilebyte.edu' LIMIT 1`);
  const studentId = studentRow.rows[0]?.id ?? null;

  const adminRow = await pool.query<{ id: string }>(`SELECT id FROM users WHERE email = 'admin@nilebyte.edu' LIMIT 1`);
  const adminId = adminRow.rows[0]?.id ?? null;

  const courseRow = await pool.query<{ id: string }>(`SELECT id FROM courses WHERE code = 'CS-301' LIMIT 1`);
  const courseId = courseRow.rows[0]?.id ?? null;

  if (studentId && courseId) {
    await pool.query(`DELETE FROM tutor_sessions WHERE student_id = $1 AND course_id = $2`, [studentId, courseId]);

    const session1 = await pool.query<{ id: string }>(
      `INSERT INTO tutor_sessions (student_id, course_id, course_name, course_code, date_label, preview, exchanges_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [studentId, courseId, 'Data Structures', 'CS-301', 'Today', "I don't understand how gradient descent works...", 4]
    );
    const session1Id = session1.rows[0].id;
    const session1Messages = [
      { sender: 'student', text: "I don't understand how gradient descent works" },
      { sender: 'ai', text: 'Good question. Before I explain, what do you already know about optimization in machine learning? What do you think the goal of gradient descent might be?', citation: 'Source: Lecture 5, Slide 3' },
      { sender: 'student', text: 'I think it tries to minimize error somehow?' },
      { sender: 'ai', text: "Exactly right — you're closer than you think. Now, if the error is a surface with hills and valleys, what direction would you want to move in to reach the lowest point?", citation: 'Source: Lecture 5, Slide 6' },
    ];
    for (const m of session1Messages) {
      await pool.query(
        `INSERT INTO tutor_messages (session_id, sender, text, citation) VALUES ($1, $2, $3, $4)`,
        [session1Id, m.sender, m.text, (m as { citation?: string }).citation ?? null]
      );
    }

    const session2 = await pool.query<{ id: string }>(
      `INSERT INTO tutor_sessions (student_id, course_id, course_name, course_code, date_label, preview, exchanges_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [studentId, courseId, 'Data Structures', 'CS-301', 'Yesterday', 'Why is quicksort worst case O(n^2)?', 6]
    );
    const session2Id = session2.rows[0].id;
    const session2Messages = [
      { sender: 'student', text: 'Why is quicksort worst case O(n^2)?' },
      { sender: 'ai', text: 'Think about how the pivot is selected. What happens to the partitions if the array is already sorted and we pick the first element as pivot?', citation: 'Source: Lecture 3, Slide 18' },
    ];
    for (const m of session2Messages) {
      await pool.query(
        `INSERT INTO tutor_messages (session_id, sender, text, citation) VALUES ($1, $2, $3, $4)`,
        [session2Id, m.sender, m.text, (m as { citation?: string }).citation ?? null]
      );
    }
  }

  if (adminId) {
    await pool.query(`DELETE FROM broadcast_messages WHERE sender_id = $1`, [adminId]);
    const broadcasts = [
      { channelType: 'all_students', body: 'Midterm schedule published. Review your course portals.' },
      { channelType: 'all_faculty', body: 'Grade submission portal locks July 15 at midnight.' },
      { channelType: 'dept_heads', body: 'Executive Academic Council meeting agenda attached.' },
      { channelType: 'at_risk', body: 'Mandatory academic advising appointment required this week.' },
    ];
    for (const b of broadcasts) {
      await pool.query(
        `INSERT INTO broadcast_messages (sender_id, channel_type, body) VALUES ($1, $2, $3)`,
        [adminId, b.channelType, b.body]
      );
    }
  }

  // Seed Qdrant with existing course materials
  const materialRows = await pool.query<{ id: string; file_name: string; file_key: string; course_code: string }>(
    `SELECT cm.id, cm.file_name, cm.file_key, c.code AS course_code
     FROM course_materials cm
     JOIN courses c ON c.id = cm.course_id
     WHERE cm.file_key IN (
       'courses/cs-301/materials/CS301_Lecture08_BinaryTrees_Advanced.pdf',
       'courses/math-201/materials/MATH201_Calculus_Practice_Set_03.pdf',
       'courses/cs-401/materials/CS401_A*Search_Implementation_Guide.zip'
     )`
  );
  for (const m of materialRows.rows) {
    try {
      await indexMaterial({
        id: m.id,
        courseCode: m.course_code,
        fileName: m.file_name,
        fileKey: m.file_key,
      });
    } catch (err) {
      console.warn('Failed to index seeded material:', m.file_key, err);
    }
  }

  console.log('Seeded phase 6 data');
}

async function seedTA(): Promise<void> {
  const taRow = await pool.query<{ id: string }>(`SELECT id FROM users WHERE email = 'ta@nilebyte.edu' LIMIT 1`);
  const taId = taRow.rows[0]?.id ?? null;
  if (!taId) return;

  const facultyRow = await pool.query<{ id: string }>(`SELECT id FROM users WHERE email = 'faculty@nilebyte.edu' LIMIT 1`);
  const facultyId = facultyRow.rows[0]?.id ?? null;
  const deptHeadRow = await pool.query<{ id: string }>(`SELECT id FROM users WHERE email = 'depthead@nilebyte.edu' LIMIT 1`);
  const deptHeadId = deptHeadRow.rows[0]?.id ?? null;

  const cs301 = await pool.query<{ id: string }>(`SELECT id FROM courses WHERE code = 'CS-301' LIMIT 1`);
  const cs401 = await pool.query<{ id: string }>(`SELECT id FROM courses WHERE code = 'CS-401' LIMIT 1`);
  const cs301Id = cs301.rows[0]?.id ?? null;
  const cs401Id = cs401.rows[0]?.id ?? null;

  await pool.query(`DELETE FROM ta_section_assignments WHERE ta_id = $1`, [taId]);
  if (cs301Id) {
    await pool.query(
      `INSERT INTO ta_section_assignments (ta_id, course_id, supervising_faculty_id, section_label, room)
       VALUES ($1, $2, $3, 'Section B', 'Lab 204') ON CONFLICT (ta_id, course_id, section_label) DO NOTHING`,
      [taId, cs301Id, facultyId]
    );
  }
  if (cs401Id) {
    await pool.query(
      `INSERT INTO ta_section_assignments (ta_id, course_id, supervising_faculty_id, section_label, room)
       VALUES ($1, $2, $3, 'Lab Group 2', 'Lab 301') ON CONFLICT (ta_id, course_id, section_label) DO NOTHING`,
      [taId, cs401Id, deptHeadId]
    );
  }

  await pool.query(`DELETE FROM ta_academic_record WHERE ta_id = $1`, [taId]);
  await pool.query(
    `INSERT INTO ta_academic_record (ta_id, degree_type, thesis_title, thesis_supervisor, research_field, enrollment_year, expected_grad, current_stage, stage_progress, gpa, notes)
     VALUES ($1, 'Master''s', 'Optimizing Graph Traversal Algorithms for Large-Scale Social Networks', 'Prof. Ahmed El Gohary', 'Graph Theory & Distributed Systems', 2023, 2025, 'Research Proposal', 65, 3.7, 'Proposal defense scheduled for September 2024')`,
    [taId]
  );

  await pool.query(`DELETE FROM ta_postgrad_courses WHERE ta_id = $1`, [taId]);
  const PG = [
    { name: 'Advanced Algorithms', code: 'CS-601', semester: 'Fall 2023', credits: 3, grade: 'A', status: 'COMPLETED' },
    { name: 'Research Methodology', code: 'RS-501', semester: 'Fall 2023', credits: 3, grade: 'A-', status: 'COMPLETED' },
    { name: 'Machine Learning Theory', code: 'CS-611', semester: 'Spring 2024', credits: 3, grade: 'B+', status: 'COMPLETED' },
    { name: 'Graduate Seminar', code: 'GS-501', semester: 'Fall 2024', credits: 1, grade: 'In Progress', status: 'IN PROGRESS' },
  ];
  for (const c of PG) {
    await pool.query(
      `INSERT INTO ta_postgrad_courses (ta_id, course_name, course_code, semester, credits, grade, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [taId, c.name, c.code, c.semester, c.credits, c.grade, c.status]
    );
  }

  await pool.query(`DELETE FROM ta_materials WHERE ta_id = $1`, [taId]);
  if (cs301Id) {
    await pool.query(
      `INSERT INTO ta_materials (ta_id, course_id, section_label, file_name, file_key, file_size, material_type)
       VALUES ($1, $2, 'Section B', 'CS301_SectionB_Lab7_Trees_Practice.pdf', 'courses/cs-301/ta-materials/TA3021_Lab7.pdf', '1.2 MB', 'Lab Sheet')`,
      [taId, cs301Id]
    );
  }
  if (cs401Id) {
    await pool.query(
      `INSERT INTO ta_materials (ta_id, course_id, section_label, file_name, file_key, file_size, material_type)
       VALUES ($1, $2, 'Lab Group 2', 'CS401_LabGroup2_AI_Assignment1.pdf', 'courses/cs-401/ta-materials/TA3021_AI_Assignment1.pdf', '800 KB', 'Assignment PDF')`,
      [taId, cs401Id]
    );
  }

  await pool.query(`DELETE FROM attendance_sessions WHERE ta_id = $1`, [taId]);
  if (cs301Id) {
    const sessions = [
      { label: 'Lab Session 7', date: '2024-07-08', present: 18, absent: 3 },
      { label: 'Lab Session 6', date: '2024-07-04', present: 20, absent: 1 },
    ];
    for (const s of sessions) {
      await pool.query(
        `INSERT INTO attendance_sessions (course_id, ta_id, section_label, lecture_label, session_date, is_open, present_count, absent_count)
         VALUES ($1, $2, 'Section B', $3, $4, false, $5, $6)`,
        [cs301Id, taId, s.label, s.date, s.present, s.absent]
      );
    }
  }

  await pool.query(`DELETE FROM ta_grade_submissions WHERE ta_id = $1`, [taId]);
  if (cs301Id) {
    const assessmentRow = await pool.query<{ id: string }>(
      `SELECT id FROM assessments WHERE course_id = $1 AND title = 'Assignment 1' LIMIT 1`,
      [cs301Id]
    );
    if (assessmentRow.rows[0]) {
      await pool.query(
        `INSERT INTO ta_grade_submissions (ta_id, assessment_id, course_id, section_label, submitted_at, status)
         VALUES ($1, $2, $3, 'Section B', '2024-07-10', 'PENDING')`,
        [taId, assessmentRow.rows[0].id, cs301Id]
      );
    }
  }

  await pool.query(`DELETE FROM notifications WHERE user_id = $1`, [taId]);
  const NOTIFS = [
    { title: 'Grade submission approved', body: 'Dr. Ahmed Dahy approved your Quiz 1 grades for Section B', type: 'grade', read: false },
    { title: 'New student flagged', body: 'Your attention flag for Ahmed Tarek has been forwarded to Dr. Ahmed Dahy', type: 'info', read: true },
    { title: 'Thesis reminder', body: 'Research proposal deadline in 14 days', type: 'info', read: false },
  ];
  for (const n of NOTIFS) {
    await pool.query(
      `INSERT INTO notifications (user_id, title, body, type, read_at, created_at)
       VALUES ($1, $2, $3, $4, ${n.read ? 'NOW()' : 'NULL'}, NOW())`,
      [taId, n.title, n.body, n.type]
    );
  }

  console.log('Seeded teaching assistant data');
}

async function main(): Promise<void> {
  try {
    await runMigrations();
    await seedUsers();
    await seedStudentCore();
    await seedFacultyCore();
    await seedAdminCore();
    await seedPhase5();
    await seedPhase6();
    await seedTA();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void main();
