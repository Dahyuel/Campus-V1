import React, { useState } from 'react';
import { useDeptHeadFaculty } from '../../hooks/useDeptHeadData';
import {
  UserCheck,
  Users,
  Search,
  Download,
  Mail,
  X,
  Send,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  AlertCircle
} from 'lucide-react';

interface DeptHeadFacultyTabProps {
  searchQuery?: string;
  onNavigateTab?: (tab: any) => void;
}

interface FacultyMember {
  id: string;
  codeId: string;
  name: string;
  title: string;
  coursesCount: number;
  studentsCount: number;
  loadHours: number;
  avgGrade: string;
  passRate: string;
  passRateNum: number;
  status: 'ACTIVE' | 'ON LEAVE';
  statusColor: 'green' | 'orange';
  email: string;
  office: string;
  officeHours: string;
  recentActivity: string;
  assignedCourses: { name: string; code: string; passRate: string; students: number }[];
}

const MOCK_FACULTY_DATA: FacultyMember[] = [
  {
    id: 'fac-1',
    codeId: 'FAC-001',
    name: 'Dr. Ahmed Dahy',
    title: 'Assistant Professor',
    coursesCount: 5,
    studentsCount: 299,
    loadHours: 15,
    avgGrade: '80/100',
    passRate: '82%',
    passRateNum: 82,
    status: 'ACTIVE',
    statusColor: 'green',
    email: 'ahmed.dahy@nilebyte.edu',
    office: 'Building CS - Room 304',
    officeHours: 'Sun & Tue · 11:00 AM – 1:00 PM',
    recentActivity: 'Graded Midterm Exam for Data Structures (187 submissions) 2h ago',
    assignedCourses: [
      { name: 'Data Structures', code: 'CS-301', passRate: '84%', students: 187 },
      { name: 'Software Engineering', code: 'CS-402', passRate: '80%', students: 112 },
    ],
  },
  {
    id: 'fac-2',
    codeId: 'FAC-002',
    name: 'Dr. Sara Nour',
    title: 'Professor',
    coursesCount: 4,
    studentsCount: 223,
    loadHours: 12,
    avgGrade: '73/100',
    passRate: '72%',
    passRateNum: 72,
    status: 'ACTIVE',
    statusColor: 'green',
    email: 'sara.nour@nilebyte.edu',
    office: 'Building CS - Room 410',
    officeHours: 'Mon & Wed · 10:00 AM – 12:00 PM',
    recentActivity: 'Published lecture notes for Operating Systems chapter 6',
    assignedCourses: [
      { name: 'Mathematics', code: 'MATH-201', passRate: '71%', students: 134 },
      { name: 'Operating Systems', code: 'CS-304', passRate: '73%', students: 89 },
    ],
  },
  {
    id: 'fac-3',
    codeId: 'FAC-003',
    name: 'Dr. Youssef Samir',
    title: 'Assistant Professor',
    coursesCount: 2,
    studentsCount: 98,
    loadHours: 6,
    avgGrade: '76/100',
    passRate: '77%',
    passRateNum: 77,
    status: 'ACTIVE',
    statusColor: 'green',
    email: 'youssef.samir@nilebyte.edu',
    office: 'Building CS - Room 208',
    officeHours: 'Sun & Thu · 1:00 PM – 3:00 PM',
    recentActivity: 'Created SQL practice lab assignment for Database Systems',
    assignedCourses: [
      { name: 'Databases', code: 'CS-302', passRate: '77%', students: 98 },
    ],
  },
  {
    id: 'fac-4',
    codeId: 'FAC-004',
    name: 'Dr. Omar Farid',
    title: 'Associate Professor',
    coursesCount: 3,
    studentsCount: 201,
    loadHours: 9,
    avgGrade: '68/100',
    passRate: '61%',
    passRateNum: 61,
    status: 'ON LEAVE',
    statusColor: 'orange',
    email: 'omar.farid@nilebyte.edu',
    office: 'Building CS - Room 312',
    officeHours: 'On medical leave until 25 July 2026',
    recentActivity: 'Substitute instructor assigned for Networks lab sections',
    assignedCourses: [
      { name: 'Networks', code: 'CS-303', passRate: '61%', students: 201 },
    ],
  },
  {
    id: 'fac-5',
    codeId: 'FAC-005',
    name: 'Dr. Mostafa Hagras',
    title: 'Professor',
    coursesCount: 4,
    studentsCount: 172,
    loadHours: 12,
    avgGrade: '86/100',
    passRate: '88%',
    passRateNum: 88,
    status: 'ACTIVE',
    statusColor: 'green',
    email: 'depthead@nilebyte.edu',
    office: 'Dept Head Office - Room 101',
    officeHours: 'Daily · 9:00 AM – 11:00 AM (By Appointment)',
    recentActivity: 'Conducted AI research symposium and department curriculum review',
    assignedCourses: [
      { name: 'Artificial Intelligence', code: 'CS-401', passRate: '90%', students: 96 },
      { name: 'Algorithms', code: 'CS-403', passRate: '85%', students: 76 },
    ],
  },
  {
    id: 'fac-6',
    codeId: 'FAC-006',
    name: 'Dr. Nour Hassan',
    title: 'Assistant Professor',
    coursesCount: 2,
    studentsCount: 89,
    loadHours: 6,
    avgGrade: '72/100',
    passRate: '73%',
    passRateNum: 73,
    status: 'ACTIVE',
    statusColor: 'green',
    email: 'nour.hassan@nilebyte.edu',
    office: 'Building CS - Room 215',
    officeHours: 'Tue & Thu · 2:00 PM – 4:00 PM',
    recentActivity: 'Verified student submissions for Discrete Mathematics quiz 2',
    assignedCourses: [
      { name: 'Discrete Math', code: 'CS-204', passRate: '73%', students: 89 },
    ],
  },
];

export const DeptHeadFacultyTab: React.FC<DeptHeadFacultyTabProps> = ({
  searchQuery = '',
  onNavigateTab,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [titleFilter, setTitleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Name');
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [showMessageAllModal, setShowMessageAllModal] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const combinedSearch = (searchQuery || localSearch).trim().toLowerCase();

  const { data, isLoading } = useDeptHeadFaculty();
  const FACULTY_DATA = (data as FacultyMember[]) ?? [];

  const filteredFaculty = FACULTY_DATA.filter((f) => {
    if (titleFilter !== 'All') {
      if (titleFilter === 'Assistant Professor' && !f.title.includes('Assistant')) return false;
      if (titleFilter === 'Associate Professor' && !f.title.includes('Associate')) return false;
      if (titleFilter === 'Professor' && f.title !== 'Professor') return false;
    }
    if (statusFilter !== 'All') {
      if (statusFilter === 'Active' && f.status !== 'ACTIVE') return false;
      if (statusFilter === 'On Leave' && f.status !== 'ON LEAVE') return false;
    }
    if (!combinedSearch) return true;
    return (
      f.name.toLowerCase().includes(combinedSearch) ||
      f.codeId.toLowerCase().includes(combinedSearch) ||
      f.title.toLowerCase().includes(combinedSearch)
    );
  }).sort((a, b) => {
    if (sortBy === 'Students') return b.studentsCount - a.studentsCount;
    if (sortBy === 'Load Hours') return b.loadHours - a.loadHours;
    if (sortBy === 'Pass Rate') return b.passRateNum - a.passRateNum;
    return a.name.localeCompare(b.name);
  });

  const handleExport = () => {
    setNotification('CS Faculty Directory and teaching load rosters exported successfully (Excel).');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastBody.trim()) return;
    setNotification(`Broadcast message sent to all 24 Computer Science department faculty members.`);
    setShowMessageAllModal(false);
    setBroadcastSubject('');
    setBroadcastBody('');
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
              Total Faculty
            </span>
            <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              no change
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">24</span>
            <span className="text-xs text-slate-400 font-medium">CS Department</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active This Semester
            </span>
            <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              teaching
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">22</span>
            <span className="text-xs text-slate-400 font-medium">92% Availability</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              On Leave
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              coverage active
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-600 tracking-tight">2</span>
            <span className="text-xs text-slate-400 font-medium">Sabbatical & Medical</span>
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
              placeholder="Search faculty name or ID..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3256a8]"
            />
          </div>

          {/* Title filter */}
          <select
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#3256a8]"
          >
            <option value="All">All Academic Titles</option>
            <option value="Assistant Professor">Assistant Professor</option>
            <option value="Associate Professor">Associate Professor</option>
            <option value="Professor">Professor</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#3256a8]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
          </select>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#3256a8]"
          >
            <option value="Name">Sort by: Name</option>
            <option value="Students">Sort by: Students</option>
            <option value="Load Hours">Sort by: Load Hours</option>
            <option value="Pass Rate">Sort by: Pass Rate</option>
          </select>
        </div>

        {/* Right buttons: Export & Message All */}
        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 justify-end">
          <button
            type="button"
            onClick={handleExport}
            className="flex-1 lg:flex-initial px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-2xl font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Faculty List
          </button>
          <button
            type="button"
            onClick={() => setShowMessageAllModal(true)}
            className="flex-1 lg:flex-initial px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-2xl font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Mail className="w-3.5 h-3.5" />
            Message All Faculty
          </button>
        </div>
      </section>

      {/* 3. MAIN FACULTY TABLE */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Faculty Roster & Teaching Load
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Academic personnel performance and workload distribution
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            {filteredFaculty.length} Instructors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-3">Faculty Name</th>
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Title</th>
                <th className="py-3 px-3">Courses</th>
                <th className="py-3 px-3">Students</th>
                <th className="py-3 px-3">Load Hours</th>
                <th className="py-3 px-3">Avg Student Grade</th>
                <th className="py-3 px-3">Pass Rate</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredFaculty.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-900">{f.name}</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-500">{f.codeId}</td>
                  <td className="py-3.5 px-3 text-slate-700">{f.title}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-700">{f.coursesCount} courses</td>
                  <td className="py-3.5 px-3 font-mono text-slate-700">{f.studentsCount}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`font-mono font-bold ${
                        f.loadHours >= 15 ? 'text-amber-700' : 'text-slate-800'
                      }`}
                    >
                      {f.loadHours} hrs
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{f.avgGrade}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`font-mono font-black ${
                        f.passRateNum < 65
                          ? 'text-rose-600'
                          : f.passRateNum < 75
                          ? 'text-amber-700'
                          : 'text-slate-900'
                      }`}
                    >
                      {f.passRate}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        f.statusColor === 'green'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedFaculty(f)}
                      className="px-3 py-1 bg-white border border-slate-200 hover:border-[#3256a8] text-[#3256a8] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. FACULTY LOAD SUMMARY CARD */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="text-base font-bold text-slate-900">Teaching Load Overview</h3>
            <p className="text-xs text-slate-400">
              Maximum load: 16 hours per week per faculty policy.
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-500">Cap: 16h / week</span>
        </div>

        <div className="space-y-3 pt-2">
          {FACULTY_DATA.map((f) => {
            const percentage = Math.min(100, Math.round((f.loadHours / 16) * 100));
            const barColor =
              f.loadHours >= 16
                ? 'bg-rose-500'
                : f.loadHours > 14
                ? 'bg-amber-500'
                : 'bg-[#3256a8]';

            return (
              <div key={f.id} className="space-y-1 text-xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">{f.name}</span>
                  <span className="font-mono text-slate-600">
                    <strong className="text-slate-900">{f.loadHours} hrs</strong> / 16 hrs max ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. FACULTY PROFILE SIDE PANEL (SLIDE-OVER FROM RIGHT) */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setSelectedFaculty(null)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-[#3256a8] uppercase">
                      {selectedFaculty.codeId} · Faculty Profile
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">
                      {selectedFaculty.name}
                    </h2>
                    <span className="text-xs text-slate-500">
                      {selectedFaculty.title} · Department of Computer Science
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFaculty(null)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Personal & Contact Info */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Email Address:</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {selectedFaculty.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Campus Office:</span>
                      <span className="font-semibold text-slate-800">{selectedFaculty.office}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Office Hours:</span>
                    <span className="font-bold text-slate-800">{selectedFaculty.officeHours}</span>
                  </div>
                </div>

                {/* 4 Metric Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Weekly Load
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {selectedFaculty.loadHours} hrs
                    </span>
                    <span className="text-[10px] text-slate-500 block">Cap: 16 hours max</span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Assigned Students
                    </span>
                    <span className="text-lg font-black text-[#3256a8]">
                      {selectedFaculty.studentsCount}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Total enrollment</span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Cumulative Pass Rate
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {selectedFaculty.passRate}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Across taught courses</span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Average Student Grade
                    </span>
                    <span className="text-lg font-black text-emerald-700">
                      {selectedFaculty.avgGrade}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Coursework + exams</span>
                  </div>
                </div>

                {/* Assigned Courses with Individual Pass Rates */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block">
                    Assigned Courses ({selectedFaculty.assignedCourses.length})
                  </span>
                  <div className="space-y-1.5">
                    {selectedFaculty.assignedCourses.map((c) => (
                      <div
                        key={c.code}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{c.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {c.code} · {c.students} Students
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#3256a8] font-mono block">
                            {c.passRate}
                          </span>
                          <span className="text-[10px] text-slate-400">Pass Rate</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Community Activity */}
                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs space-y-1.5">
                  <span className="font-bold text-blue-950 block">Recent Academic Activity</span>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    {selectedFaculty.recentActivity}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFaculty(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFaculty(null);
                    if (onNavigateTab) onNavigateTab('messages');
                  }}
                  className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MESSAGE ALL CS FACULTY MODAL */}
      {showMessageAllModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-100 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowMessageAllModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold text-[#3256a8] uppercase tracking-wider block">
              Department Broadcast
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Message All CS Faculty (24 Recipients)
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Send an instant administrative broadcast to all Computer Science instructors.
            </p>

            <form onSubmit={handleSendBroadcast} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Grading Deadline & Syllabus Coverage"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3256a8]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Message Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type your announcement or administrative instruction..."
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3256a8] resize-none"
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900">
                Messages are delivered via both in-app notification and institutional Nilebyte email.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMessageAllModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
