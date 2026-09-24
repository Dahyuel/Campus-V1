import React, { useState } from 'react';
import { useDeptHeadCourses } from '../../hooks/useDeptHeadData';
import {
  BookOpen,
  Users,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  X,
  Send,
  Sparkles,
  FileCheck,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';

interface DeptHeadCoursesTabProps {
  searchQuery?: string;
  onNavigateTab?: (tab: any) => void;
}

interface CourseItem {
  id: string;
  name: string;
  code: string;
  faculty: string;
  sections: number;
  enrolled: number;
  avgAttendance: string;
  avgGrade: string;
  passRate: string;
  passRateNum: number;
  status: 'ON TRACK' | 'WATCH' | 'CRITICAL';
  statusColor: 'green' | 'orange' | 'red';
  hasMaterial: boolean;
  room?: string;
  description?: string;
}

const MOCK_COURSES_DATA: CourseItem[] = [
  {
    id: 'c-1',
    name: 'Data Structures',
    code: 'CS-301',
    faculty: 'Dr. Ahmed Dahy',
    sections: 3,
    enrolled: 187,
    avgAttendance: '84%',
    avgGrade: '81/100',
    passRate: '84%',
    passRateNum: 84,
    status: 'ON TRACK',
    statusColor: 'green',
    hasMaterial: true,
    room: 'Hall B-201',
    description: 'Fundamental linear and non-linear data structures including trees, graphs, heaps, and advanced sorting algorithms.',
  },
  {
    id: 'c-2',
    name: 'Mathematics',
    code: 'MATH-201',
    faculty: 'Dr. Sara Nour',
    sections: 2,
    enrolled: 134,
    avgAttendance: '79%',
    avgGrade: '74/100',
    passRate: '71%',
    passRateNum: 71,
    status: 'WATCH',
    statusColor: 'orange',
    hasMaterial: true,
    room: 'Lecture Hall C',
    description: 'Discrete mathematics, propositional logic, recurrence relations, and graph theory applied to computing.',
  },
  {
    id: 'c-3',
    name: 'Artificial Intelligence',
    code: 'CS-401',
    faculty: 'Dr. Mostafa Hagras',
    sections: 2,
    enrolled: 96,
    avgAttendance: '91%',
    avgGrade: '88/100',
    passRate: '90%',
    passRateNum: 90,
    status: 'ON TRACK',
    statusColor: 'green',
    hasMaterial: true,
    room: 'Lab 4 (AI Center)',
    description: 'Heuristic search, knowledge representation, reinforcement learning, and neural networks fundamentals.',
  },
  {
    id: 'c-4',
    name: 'Networks',
    code: 'CS-303',
    faculty: 'Dr. Omar Farid',
    sections: 3,
    enrolled: 201,
    avgAttendance: '69%',
    avgGrade: '68/100',
    passRate: '61%',
    passRateNum: 61,
    status: 'CRITICAL',
    statusColor: 'red',
    hasMaterial: false,
    room: 'Networking Lab 1',
    description: 'OSI 7-layer architecture, TCP/IP socket programming, subnetting, congestion control algorithms, and routing protocols.',
  },
  {
    id: 'c-5',
    name: 'Software Engineering',
    code: 'CS-402',
    faculty: 'Dr. Ahmed Dahy',
    sections: 2,
    enrolled: 112,
    avgAttendance: '86%',
    avgGrade: '79/100',
    passRate: '80%',
    passRateNum: 80,
    status: 'ON TRACK',
    statusColor: 'green',
    hasMaterial: true,
    room: 'Auditorium 1',
    description: 'Agile methodologies, CI/CD pipelines, software design patterns, and microservices architecture.',
  },
  {
    id: 'c-6',
    name: 'Databases',
    code: 'CS-302',
    faculty: 'Dr. Youssef Samir',
    sections: 2,
    enrolled: 98,
    avgAttendance: '81%',
    avgGrade: '76/100',
    passRate: '77%',
    passRateNum: 77,
    status: 'ON TRACK',
    statusColor: 'green',
    hasMaterial: true,
    room: 'Database Lab 3',
    description: 'Relational database schema normalization, SQL optimization, transaction concurrency control, and ACID principles.',
  },
  {
    id: 'c-7',
    name: 'Operating Systems',
    code: 'CS-304',
    faculty: 'Dr. Sara Nour',
    sections: 2,
    enrolled: 89,
    avgAttendance: '77%',
    avgGrade: '72/100',
    passRate: '73%',
    passRateNum: 73,
    status: 'WATCH',
    statusColor: 'orange',
    hasMaterial: true,
    room: 'Hall B-104',
    description: 'Process scheduling, virtual memory paging, mutex locks, semaphores, and kernel architectures.',
  },
  {
    id: 'c-8',
    name: 'Algorithms',
    code: 'CS-403',
    faculty: 'Dr. Mostafa Hagras',
    sections: 2,
    enrolled: 76,
    avgAttendance: '88%',
    avgGrade: '83/100',
    passRate: '85%',
    passRateNum: 85,
    status: 'ON TRACK',
    statusColor: 'green',
    hasMaterial: true,
    room: 'Hall A-101',
    description: 'Advanced dynamic programming, greedy algorithms, divide-and-conquer paradigms, and NP-completeness proofs.',
  },
];

const ALL_18_COURSES = [
  { code: 'CS-301', name: 'Data Structures', hasMaterial: true },
  { code: 'MATH-201', name: 'Mathematics', hasMaterial: true },
  { code: 'CS-401', name: 'Artificial Intelligence', hasMaterial: true },
  { code: 'CS-303', name: 'Networks', hasMaterial: false },
  { code: 'CS-402', name: 'Software Engineering', hasMaterial: true },
  { code: 'CS-302', name: 'Databases', hasMaterial: true },
  { code: 'CS-304', name: 'Operating Systems', hasMaterial: true },
  { code: 'CS-403', name: 'Algorithms', hasMaterial: true },
  { code: 'CS-101', name: 'Intro to Computer Science', hasMaterial: true },
  { code: 'CS-102', name: 'Programming II (OOP)', hasMaterial: true },
  { code: 'CS-204', name: 'Discrete Math', hasMaterial: false },
  { code: 'CS-415', name: 'Cybersecurity Principles', hasMaterial: true },
  { code: 'CS-420', name: 'Cloud Computing Architecture', hasMaterial: true },
  { code: 'CS-425', name: 'Mobile App Development', hasMaterial: false },
  { code: 'CS-430', name: 'Computer Graphics', hasMaterial: true },
  { code: 'CS-440', name: 'Compiler Construction', hasMaterial: false },
  { code: 'CS-490', name: 'Senior Capstone Project I', hasMaterial: true },
  { code: 'CS-499', name: 'Senior Capstone Project II', hasMaterial: true },
];

export const DeptHeadCoursesTab: React.FC<DeptHeadCoursesTabProps> = ({
  searchQuery = '',
  onNavigateTab,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Course Name');
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const { data, isLoading } = useDeptHeadCourses();
  const COURSES_DATA = (data as CourseItem[]) ?? [];
  const ALL_18_COURSES = (data as { code: string; name: string; hasMaterial: boolean }[]) ?? [];

  const combinedSearch = (searchQuery || localSearch).trim().toLowerCase();

  const filteredCourses = COURSES_DATA.filter((c) => {
    if (facultyFilter !== 'All' && c.faculty !== facultyFilter) return false;
    if (statusFilter !== 'All') {
      if (statusFilter === 'On Track' && c.status !== 'ON TRACK') return false;
      if (statusFilter === 'Attention Needed' && c.status !== 'WATCH') return false;
      if (statusFilter === 'Critical' && c.status !== 'CRITICAL') return false;
    }
    if (!combinedSearch) return true;
    return (
      c.name.toLowerCase().includes(combinedSearch) ||
      c.code.toLowerCase().includes(combinedSearch) ||
      c.faculty.toLowerCase().includes(combinedSearch)
    );
  }).sort((a, b) => {
    if (sortBy === 'Pass Rate') return b.passRateNum - a.passRateNum;
    if (sortBy === 'Enrollment') return b.enrolled - a.enrolled;
    if (sortBy === 'Attendance') return parseInt(b.avgAttendance) - parseInt(a.avgAttendance);
    return a.name.localeCompare(b.name);
  });

  const handleExport = () => {
    setNotification('CS Department course roster exported successfully (Excel/CSV).');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleNotifyFaculty = () => {
    setNotification('Automated reminder dispatched to 4 faculty members with unuploaded RAG course materials.');
    setTimeout(() => setNotification(null), 3500);
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

      {/* 1. TOP ROW OF 3 STAT CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Courses
            </span>
            <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              no change
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">18</span>
            <span className="text-xs text-slate-400 font-medium">CS Department</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Course Sections
            </span>
            <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              active
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">34</span>
            <span className="text-xs text-slate-400 font-medium">Classroom & Labs</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Courses Needing Attention
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
              <AlertTriangle className="w-2.5 h-2.5" />
              action needed
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-rose-600 tracking-tight">3</span>
            <span className="text-xs text-slate-400 font-medium">&lt;75% Pass Rate</span>
          </div>
        </div>
      </section>

      {/* 2. FILTER BAR */}
      <section className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search course name or code..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3256a8]"
            />
          </div>

          {/* Faculty filter dropdown */}
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#3256a8]"
          >
            <option value="All">All Faculty</option>
            <option value="Dr. Ahmed Dahy">Dr. Ahmed Dahy</option>
            <option value="Dr. Sara Nour">Dr. Sara Nour</option>
            <option value="Dr. Mostafa Hagras">Dr. Mostafa Hagras</option>
            <option value="Dr. Omar Farid">Dr. Omar Farid</option>
            <option value="Dr. Youssef Samir">Dr. Youssef Samir</option>
          </select>

          {/* Status filter dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#3256a8]"
          >
            <option value="All">All Statuses</option>
            <option value="On Track">On Track</option>
            <option value="Attention Needed">Attention Needed</option>
            <option value="Critical">Critical</option>
          </select>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#3256a8]"
          >
            <option value="Course Name">Sort by: Course Name</option>
            <option value="Pass Rate">Sort by: Pass Rate</option>
            <option value="Enrollment">Sort by: Enrollment</option>
            <option value="Attendance">Sort by: Attendance</option>
          </select>
        </div>

        {/* Right side: Export button */}
        <button
          type="button"
          onClick={handleExport}
          className="w-full lg:w-auto px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-2xl font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Export Course List
        </button>
      </section>

      {/* 3. MAIN COURSES TABLE */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Active Courses Directory
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Instructional overview and performance metrics across Computer Science modules
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            {filteredCourses.length} Courses
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-3">Course Name</th>
                <th className="py-3 px-3">Code</th>
                <th className="py-3 px-3">Faculty</th>
                <th className="py-3 px-3">Sections</th>
                <th className="py-3 px-3">Enrolled</th>
                <th className="py-3 px-3">Avg Attendance</th>
                <th className="py-3 px-3">Avg Grade</th>
                <th className="py-3 px-3">Pass Rate</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCourses.map((c) => {
                const isCritical = c.status === 'CRITICAL';
                const isWatch = c.status === 'WATCH';
                const rowBg = isCritical
                  ? 'bg-rose-50/40 hover:bg-rose-50/70'
                  : isWatch
                  ? 'bg-amber-50/30 hover:bg-amber-50/60'
                  : 'hover:bg-slate-50/60';

                return (
                  <tr key={c.id} className={`${rowBg} transition-colors`}>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-900">{c.name}</span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600 font-semibold">{c.code}</td>
                    <td className="py-3.5 px-3 text-slate-800">{c.faculty}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-600">{c.sections} sec</td>
                    <td className="py-3.5 px-3 font-mono text-slate-700">{c.enrolled} students</td>
                    <td className="py-3.5 px-3 font-mono text-slate-700">{c.avgAttendance}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{c.avgGrade}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`font-mono font-black ${
                          isCritical ? 'text-rose-600' : isWatch ? 'text-amber-700' : 'text-slate-900'
                        }`}
                      >
                        {c.passRate}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          c.statusColor === 'green'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : c.statusColor === 'orange'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCourse(c)}
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

      {/* 4. COURSE MATERIAL COVERAGE CARD (RAG System Readiness) */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#3256a8]" />
              <h3 className="text-base font-bold text-slate-900">
                Course Material Coverage (RAG Knowledge Engine)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Courses without uploaded material cannot use the AI Tutor or Community AI features.
            </p>
          </div>

          <button
            type="button"
            onClick={handleNotifyFaculty}
            className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0 flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Notify Faculty
          </button>
        </div>

        {/* 18 Courses List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2">
          {ALL_18_COURSES.map((c) => (
            <div
              key={c.code}
              className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-2 text-xs"
            >
              <div className="min-w-0">
                <span className="font-bold text-slate-800 block truncate">{c.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">{c.code}</span>
              </div>
              <span
                className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                  c.hasMaterial
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {c.hasMaterial ? 'MATERIAL UPLOADED' : 'NO MATERIAL'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. COURSE DETAIL SIDE PANEL (SLIDE-OVER FROM RIGHT) */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setSelectedCourse(null)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-[#3256a8] uppercase">
                      {selectedCourse.code} · Section Details
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">
                      {selectedCourse.name}
                    </h2>
                    <span className="text-xs text-slate-400">
                      Primary Instructor: {selectedCourse.faculty}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(null)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Course Info & Overview */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <span className="font-bold text-slate-700 block uppercase text-[10px] tracking-wider">
                    Syllabus Description
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedCourse.description}
                  </p>
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Classroom / Hall:</span>
                      <span className="font-bold text-slate-800">{selectedCourse.room}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">RAG AI Materials:</span>
                      <span className="font-bold text-emerald-700">
                        {selectedCourse.hasMaterial ? 'Indexed in Vector DB' : 'Pending Upload'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Four Quick Stat Blocks */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Enrolled Students
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {selectedCourse.enrolled}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Across {selectedCourse.sections} sections</span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Pass Rate
                    </span>
                    <span className="text-lg font-black text-[#3256a8]">
                      {selectedCourse.passRate}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Standard: &gt;75%</span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Attendance Avg
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {selectedCourse.avgAttendance}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Daily QR scans</span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Average Assessment
                    </span>
                    <span className="text-lg font-black text-emerald-700">
                      {selectedCourse.avgGrade}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Weighted coursework</span>
                  </div>
                </div>

                {/* Sections & Schedules Breakdown */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block text-xs">
                    All Sections ({selectedCourse.sections} Active)
                  </span>
                  <div className="space-y-1.5">
                    {Array.from({ length: selectedCourse.sections }).map((_, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800">
                            Section 0{idx + 1}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Mon / Wed · 10:00 AM – 11:30 AM
                          </span>
                        </div>
                        <span className="text-slate-600 font-mono font-bold">
                          {Math.round(selectedCourse.enrolled / selectedCourse.sections)} students
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Community Activity Count & Faculty Contact */}
                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950">Community Engagement</span>
                    <span className="px-2 py-0.5 bg-white text-[#3256a8] rounded-md font-bold text-[10px]">
                      142 Discussions
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800">
                    Faculty contact: <span className="font-semibold">{selectedCourse.faculty}</span> (office hours: Sun/Tue 1:00 PM).
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCourse(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourse(null);
                    if (onNavigateTab) onNavigateTab('messages');
                  }}
                  className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Message Faculty
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
