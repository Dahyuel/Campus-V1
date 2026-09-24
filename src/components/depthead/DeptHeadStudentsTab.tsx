import React, { useState } from 'react';
import { useDeptHeadStudents } from '../../hooks/useDeptHeadData';
import {
  GraduationCap,
  Users,
  Search,
  Download,
  AlertTriangle,
  X,
  Send,
  CheckCircle2,
  BookOpen,
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';

interface DeptHeadStudentsTabProps {
  searchQuery?: string;
  onNavigateTab?: (tab: any) => void;
}

interface StudentRecord {
  id: string;
  name: string;
  studentId: string;
  year: string;
  gpa: number;
  attendance: string;
  attendanceNum: number;
  standing: 'GOOD STANDING' | 'WARNING' | 'AT RISK' | 'PROBATION';
  standingColor: 'green' | 'orange' | 'red';
  coursesCount: number;
  email: string;
  phone: string;
  primaryCourse: string;
  gpaTrend: string;
  feeStatus: 'Paid in Full' | 'Partial Outstanding' | 'Overdue';
  atRiskFlags?: string[];
  enrolledCourses: { code: string; name: string; grade: string; attendance: string }[];
}

const MOCK_STUDENTS_DATA: StudentRecord[] = [
  {
    id: 'stu-1',
    name: 'Omar Hassan',
    studentId: '202100234',
    year: 'Year 3',
    gpa: 3.6,
    attendance: '91%',
    attendanceNum: 91,
    standing: 'GOOD STANDING',
    standingColor: 'green',
    coursesCount: 6,
    email: 'omar.hassan@nilebyte.edu',
    phone: '+20 100 982 1204',
    primaryCourse: 'Data Structures',
    gpaTrend: '+0.15 upward trajectory over last 2 terms',
    feeStatus: 'Paid in Full',
    enrolledCourses: [
      { code: 'CS-301', name: 'Data Structures', grade: 'A (88%)', attendance: '94%' },
      { code: 'CS-302', name: 'Databases', grade: 'B+ (84%)', attendance: '90%' },
      { code: 'CS-402', name: 'Software Engineering', grade: 'A- (86%)', attendance: '92%' },
    ],
  },
  {
    id: 'stu-2',
    name: 'Sara Mahmoud',
    studentId: '202100187',
    year: 'Year 2',
    gpa: 2.4,
    attendance: '61%',
    attendanceNum: 61,
    standing: 'AT RISK',
    standingColor: 'red',
    coursesCount: 5,
    email: 'sara.mahmoud@nilebyte.edu',
    phone: '+20 101 234 5678',
    primaryCourse: 'Networks',
    gpaTrend: '-0.38 steep decline since midterm evaluations',
    feeStatus: 'Partial Outstanding',
    atRiskFlags: [
      'Attendance dropped below 65% mandatory threshold (currently 61%)',
      'Failed assignment 2 & 3 in CS-303 (Networks)',
      'Last login to Campus portal 9 days ago',
    ],
    enrolledCourses: [
      { code: 'CS-303', name: 'Networks', grade: 'D (52%)', attendance: '58%' },
      { code: 'MATH-201', name: 'Mathematics', grade: 'C- (60%)', attendance: '64%' },
      { code: 'CS-304', name: 'Operating Systems', grade: 'C (67%)', attendance: '62%' },
    ],
  },
  {
    id: 'stu-3',
    name: 'Nour Ali',
    studentId: '202100312',
    year: 'Year 1',
    gpa: 2.9,
    attendance: '74%',
    attendanceNum: 74,
    standing: 'WARNING',
    standingColor: 'orange',
    coursesCount: 6,
    email: 'nour.ali@nilebyte.edu',
    phone: '+20 102 345 6789',
    primaryCourse: 'Mathematics',
    gpaTrend: 'Plateaued around 2.9 with attendance fluctuations',
    feeStatus: 'Paid in Full',
    atRiskFlags: ['Attendance approaching 70% institutional warning threshold'],
    enrolledCourses: [
      { code: 'MATH-201', name: 'Mathematics', grade: 'C+ (72%)', attendance: '71%' },
      { code: 'CS-101', name: 'Intro to CS', grade: 'B (78%)', attendance: '76%' },
      { code: 'CS-102', name: 'Programming II', grade: 'B- (73%)', attendance: '75%' },
    ],
  },
  {
    id: 'stu-4',
    name: 'Youssef Samir',
    studentId: '202100098',
    year: 'Year 4',
    gpa: 3.8,
    attendance: '95%',
    attendanceNum: 95,
    standing: 'GOOD STANDING',
    standingColor: 'green',
    coursesCount: 5,
    email: 'youssef.s@nilebyte.edu',
    phone: '+20 100 456 7891',
    primaryCourse: 'Artificial Intelligence',
    gpaTrend: 'Consistent Dean’s Honor List candidate (+0.08)',
    feeStatus: 'Paid in Full',
    enrolledCourses: [
      { code: 'CS-401', name: 'Artificial Intelligence', grade: 'A+ (96%)', attendance: '98%' },
      { code: 'CS-403', name: 'Algorithms', grade: 'A (92%)', attendance: '94%' },
      { code: 'CS-499', name: 'Grad Project', grade: 'A+ (97%)', attendance: '95%' },
    ],
  },
  {
    id: 'stu-5',
    name: 'Layla Ahmed',
    studentId: '202100445',
    year: 'Year 2',
    gpa: 2.6,
    attendance: '68%',
    attendanceNum: 68,
    standing: 'AT RISK',
    standingColor: 'red',
    coursesCount: 6,
    email: 'layla.ahmed@nilebyte.edu',
    phone: '+20 109 876 5432',
    primaryCourse: 'Data Structures',
    gpaTrend: '-0.25 downward shift over current semester',
    feeStatus: 'Paid in Full',
    atRiskFlags: [
      'Community activity dropped to zero',
      'Missed 4 lab session submissions',
    ],
    enrolledCourses: [
      { code: 'CS-301', name: 'Data Structures', grade: 'C (64%)', attendance: '68%' },
      { code: 'CS-302', name: 'Databases', grade: 'C+ (71%)', attendance: '70%' },
      { code: 'MATH-201', name: 'Mathematics', grade: 'C- (62%)', attendance: '66%' },
    ],
  },
  {
    id: 'stu-6',
    name: 'Khaled Mostafa',
    studentId: '202100267',
    year: 'Year 3',
    gpa: 3.1,
    attendance: '83%',
    attendanceNum: 83,
    standing: 'GOOD STANDING',
    standingColor: 'green',
    coursesCount: 6,
    email: 'khaled.m@nilebyte.edu',
    phone: '+20 103 456 1234',
    primaryCourse: 'Operating Systems',
    gpaTrend: '+0.10 stable academic recovery',
    feeStatus: 'Paid in Full',
    enrolledCourses: [
      { code: 'CS-304', name: 'Operating Systems', grade: 'B (79%)', attendance: '82%' },
      { code: 'CS-301', name: 'Data Structures', grade: 'B+ (83%)', attendance: '85%' },
    ],
  },
  {
    id: 'stu-7',
    name: 'Dina Kamal',
    studentId: '202100391',
    year: 'Year 1',
    gpa: 2.1,
    attendance: '55%',
    attendanceNum: 55,
    standing: 'AT RISK',
    standingColor: 'red',
    coursesCount: 5,
    email: 'dina.kamal@nilebyte.edu',
    phone: '+20 104 567 8901',
    primaryCourse: 'Mathematics',
    gpaTrend: 'Critical GPA trajectory (probation threshold is 2.0)',
    feeStatus: 'Overdue',
    atRiskFlags: [
      'Attendance at critical 55% (minimum required is 65%)',
      'Grade declined 3 consecutive assessments',
      'Missing 40% of assignment deadlines',
    ],
    enrolledCourses: [
      { code: 'MATH-201', name: 'Mathematics', grade: 'F (48%)', attendance: '52%' },
      { code: 'CS-101', name: 'Intro to CS', grade: 'D+ (58%)', attendance: '57%' },
    ],
  },
  {
    id: 'stu-8',
    name: 'Ahmed Tarek',
    studentId: '202100156',
    year: 'Year 4',
    gpa: 3.4,
    attendance: '88%',
    attendanceNum: 88,
    standing: 'GOOD STANDING',
    standingColor: 'green',
    coursesCount: 4,
    email: 'ahmed.tarek@nilebyte.edu',
    phone: '+20 105 678 9012',
    primaryCourse: 'Software Engineering',
    gpaTrend: 'Strong performance on senior capstone project',
    feeStatus: 'Paid in Full',
    enrolledCourses: [
      { code: 'CS-402', name: 'Software Engineering', grade: 'A- (86%)', attendance: '89%' },
      { code: 'CS-499', name: 'Grad Project', grade: 'A (91%)', attendance: '92%' },
    ],
  },
];

export const DeptHeadStudentsTab: React.FC<DeptHeadStudentsTabProps> = ({
  searchQuery = '',
  onNavigateTab,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [standingFilter, setStandingFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Name');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const combinedSearch = (searchQuery || localSearch).trim().toLowerCase();

  const { data, isLoading } = useDeptHeadStudents();
  const STUDENTS_DATA = (data as StudentRecord[]) ?? [];

  const filteredStudents = STUDENTS_DATA.filter((s) => {
    if (courseFilter !== 'All' && s.primaryCourse !== courseFilter) return false;
    if (standingFilter !== 'All') {
      if (standingFilter === 'Good Standing' && s.standing !== 'GOOD STANDING') return false;
      if (standingFilter === 'Warning' && s.standing !== 'WARNING') return false;
      if (standingFilter === 'At-Risk' && s.standing !== 'AT RISK') return false;
    }
    if (yearFilter !== 'All' && s.year !== yearFilter) return false;
    if (!combinedSearch) return true;
    return (
      s.name.toLowerCase().includes(combinedSearch) ||
      s.studentId.toLowerCase().includes(combinedSearch) ||
      s.email.toLowerCase().includes(combinedSearch)
    );
  }).sort((a, b) => {
    if (sortBy === 'GPA') return b.gpa - a.gpa;
    if (sortBy === 'Attendance') return b.attendanceNum - a.attendanceNum;
    if (sortBy === 'Risk Level') {
      const order = { 'AT RISK': 3, 'WARNING': 2, 'GOOD STANDING': 1, 'PROBATION': 4 };
      return (order[b.standing] || 0) - (order[a.standing] || 0);
    }
    return a.name.localeCompare(b.name);
  });

  const handleExport = () => {
    setNotification('CS Department Student Roster and Standing Data exported (Excel/CSV).');
    setTimeout(() => setNotification(null), 3000);
  };

  if (isLoading) return <div className="p-8 text-center text-sm text-slate-500">Loading…</div>;

  return (
    <div className="space-y-7 relative">
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {notification}
        </div>
      )}

      {/* 1. TOP ROW OF 4 STAT CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Department Students
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +31 ↑
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">946</span>
            <span className="text-xs text-slate-400 font-medium">CS Majors</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Good Standing
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              87%
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-700 tracking-tight">821</span>
            <span className="text-xs text-slate-400 font-medium">GPA ≥ 2.5</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Academic Warning
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              watch
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-600 tracking-tight">114</span>
            <span className="text-xs text-slate-400 font-medium">GPA 2.0 – 2.49</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              At-Risk
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
              <AlertTriangle className="w-2.5 h-2.5" />
              action needed
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-rose-600 tracking-tight">11</span>
            <span className="text-xs text-slate-400 font-medium">Intervention queue</span>
          </div>
        </div>
      </section>

      {/* 2. FILTER BAR */}
      <section className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student name or ID..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3256a8]"
            />
          </div>

          {/* Course filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#3256a8]"
          >
            <option value="All">All Courses</option>
            <option value="Data Structures">Data Structures</option>
            <option value="Networks">Networks</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Software Engineering">Software Engineering</option>
          </select>

          {/* Standing filter */}
          <select
            value={standingFilter}
            onChange={(e) => setStandingFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#3256a8]"
          >
            <option value="All">All Standings</option>
            <option value="Good Standing">Good Standing</option>
            <option value="Warning">Warning</option>
            <option value="At-Risk">At-Risk</option>
          </select>

          {/* Year filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#3256a8]"
          >
            <option value="All">All Years</option>
            <option value="Year 1">Year 1</option>
            <option value="Year 2">Year 2</option>
            <option value="Year 3">Year 3</option>
            <option value="Year 4">Year 4</option>
          </select>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#3256a8]"
          >
            <option value="Name">Sort by: Name</option>
            <option value="GPA">Sort by: GPA</option>
            <option value="Attendance">Sort by: Attendance</option>
            <option value="Risk Level">Sort by: Risk Level</option>
          </select>
        </div>

        {/* Right side: Export */}
        <button
          type="button"
          onClick={handleExport}
          className="w-full lg:w-auto px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-2xl font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Export List
        </button>
      </section>

      {/* 3. MAIN STUDENT TABLE */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Computer Science Department Students
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Academic standing, cumulative GPAs, and attendance compliance
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            {filteredStudents.length} Students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Student ID</th>
                <th className="py-3 px-3">Year</th>
                <th className="py-3 px-3">GPA</th>
                <th className="py-3 px-3">Attendance</th>
                <th className="py-3 px-3">Standing</th>
                <th className="py-3 px-3">Courses</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.map((s) => {
                const isAtRisk = s.standing === 'AT RISK';
                const rowBg = isAtRisk
                  ? 'bg-rose-50/40 hover:bg-rose-50/70'
                  : 'hover:bg-slate-50/70';

                return (
                  <tr key={s.id} className={`${rowBg} transition-colors`}>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-900">{s.name}</span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-500">{s.studentId}</td>
                    <td className="py-3.5 px-3 text-slate-700">{s.year}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                      <span
                        className={
                          s.gpa < 2.5
                            ? 'text-rose-600 font-black'
                            : s.gpa < 3.0
                            ? 'text-amber-700'
                            : 'text-slate-900'
                        }
                      >
                        {s.gpa.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-700">{s.attendance}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          s.standingColor === 'green'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : s.standingColor === 'orange'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {s.standing}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600">
                      {s.coursesCount} courses
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(s)}
                        className="px-3 py-1 bg-white border border-slate-200 hover:border-[#3256a8] text-[#3256a8] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. FULL STUDENT PROFILE SIDE PANEL (SLIDE-OVER FROM RIGHT) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setSelectedStudent(null)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-[#3256a8] uppercase">
                      ID: {selectedStudent.studentId} · {selectedStudent.year}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">
                      {selectedStudent.name}
                    </h2>
                    <span className="text-xs text-slate-500">
                      Computer Science Undergraduate · {selectedStudent.standing}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* At-Risk Banner if flagged */}
                {selectedStudent.atRiskFlags && selectedStudent.atRiskFlags.length > 0 && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>At-Risk Diagnostic Alerts</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-rose-800 text-[11px]">
                      {selectedStudent.atRiskFlags.map((flag, i) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Personal & Contact Info */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Email:</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {selectedStudent.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Mobile Phone:</span>
                      <span className="font-semibold text-slate-800">{selectedStudent.phone}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Tuition Fee Status:</span>
                    <span className="font-bold text-slate-800">{selectedStudent.feeStatus}</span>
                  </div>
                </div>

                {/* 4 Metric Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Cumulative GPA
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {selectedStudent.gpa.toFixed(2)} / 4.0
                    </span>
                    <span className="text-[10px] text-slate-500 block">4-point scale</span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Attendance Rate
                    </span>
                    <span
                      className={`text-lg font-black ${
                        selectedStudent.attendanceNum < 65 ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {selectedStudent.attendance}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Standard: ≥75%</span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs col-span-2">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      GPA Trajectory Trend
                    </span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#3256a8]" />
                      {selectedStudent.gpaTrend}
                    </span>
                  </div>
                </div>

                {/* Enrolled Courses Breakdown */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block">
                    Enrolled Courses ({selectedStudent.enrolledCourses.length})
                  </span>
                  <div className="space-y-1.5">
                    {selectedStudent.enrolledCourses.map((c) => (
                      <div
                        key={c.code}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{c.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {c.code} · Attendance: {c.attendance}
                          </span>
                        </div>
                        <span className="font-bold font-mono text-[#3256a8] bg-white px-2.5 py-1 rounded-lg border border-slate-100">
                          {c.grade}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudent(null);
                    if (onNavigateTab) onNavigateTab('messages');
                  }}
                  className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Message Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
