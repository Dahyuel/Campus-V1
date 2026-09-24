import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Users,
  Clock,
  Search,
  Download,
  Plus,
  X,
  Check,
  CheckCircle2,
  BookOpen,
  DollarSign,
  Star,
  Calendar,
  Briefcase,
  Mail,
  Phone,
  Building2,
  FileText
} from 'lucide-react';
import { SHARED_AVATAR_URL } from '../../data/mockData';
import {
  useAdminFaculty,
  useAdminStaff,
  useAdminLeaveRequests,
  useUpdateLeaveRequest,
} from '../../hooks/useAdminData';

interface FacultyRecord {
  id: string;
  name: string;
  codeId: string;
  department: string;
  title: string;
  coursesCount: number;
  studentsCount: number;
  loadHours: number;
  status: 'ACTIVE' | 'ON LEAVE';
  email: string;
  phone: string;
  assignedCourses: string[];
  leaveHistory: string;
  payrollSummary: string;
  performanceRating: number;
}

interface StaffRecord {
  id: string;
  name: string;
  codeId: string;
  department: string;
  role: string;
  shift: string;
  status: 'ACTIVE' | 'ON LEAVE';
  email: string;
  phone: string;
}

interface LeaveRequest {
  id: string;
  name: string;
  department: string;
  leaveType: string;
  from: string;
  to: string;
  status: 'pending' | 'approved' | 'rejected';
}

const INITIAL_FACULTY: FacultyRecord[] = [
  {
    id: 'f-1',
    name: 'Dr. Ahmed Dahy',
    codeId: 'FAC-001',
    department: 'CS Dept',
    title: 'Ass. Professor',
    coursesCount: 4,
    studentsCount: 213,
    loadHours: 12,
    status: 'ACTIVE',
    email: 'faculty@nilebyte.edu',
    phone: '+20 102 345 6789',
    assignedCourses: ['CS-301 Data Structures', 'CS-401 Artificial Intelligence', 'CS-201 Object-Oriented Programming', 'CS-409 Senior Project'],
    leaveHistory: '2 days casual leave (March 2024)',
    payrollSummary: 'Grade A2 Senior Lecturer · $3,850/mo · Direct Deposit Active',
    performanceRating: 4.8,
  },
  {
    id: 'f-2',
    name: 'Dr. Sara Nour',
    codeId: 'FAC-002',
    department: 'CS Dept',
    title: 'Professor',
    coursesCount: 2,
    studentsCount: 134,
    loadHours: 8,
    status: 'ACTIVE',
    email: 'sara.nour@nilebyte.edu',
    phone: '+20 101 999 8888',
    assignedCourses: ['MATH-201 Linear Algebra', 'CS-502 Advanced Algorithmic Complexity'],
    leaveHistory: 'None recorded this academic year',
    payrollSummary: 'Tenured Full Professor · $4,500/mo · Direct Deposit Active',
    performanceRating: 4.9,
  },
  {
    id: 'f-3',
    name: 'Dr. Youssef Samir',
    codeId: 'FAC-003',
    department: 'CS Dept',
    title: 'Ass. Professor',
    coursesCount: 3,
    studentsCount: 201,
    loadHours: 10,
    status: 'ACTIVE',
    email: 'youssef.samir@nilebyte.edu',
    phone: '+20 109 222 3333',
    assignedCourses: ['CS-204 Database Systems', 'CS-308 Web Development', 'CS-101 Introduction to Computing'],
    leaveHistory: '3 days sick leave (May 2024)',
    payrollSummary: 'Grade A1 Lecturer · $3,400/mo · Direct Deposit Active',
    performanceRating: 4.7,
  },
  {
    id: 'f-4',
    name: 'Dr. Omar Farid',
    codeId: 'FAC-004',
    department: 'ENG Dept',
    title: 'Associate Professor',
    coursesCount: 3,
    studentsCount: 178,
    loadHours: 11,
    status: 'ON LEAVE',
    email: 'omar.farid@nilebyte.edu',
    phone: '+20 115 444 7777',
    assignedCourses: ['CS-303 Computer Networks', 'ENG-301 Embedded Systems', 'ENG-204 Signals'],
    leaveHistory: 'Medical leave until Jul 18, 2024',
    payrollSummary: 'Associate Professor B · $3,950/mo · Medical Benefit Applied',
    performanceRating: 4.6,
  },
  {
    id: 'f-5',
    name: 'Dr. Mostafa Hagras',
    codeId: 'FAC-005',
    department: 'CS Dept',
    title: 'Professor',
    coursesCount: 2,
    studentsCount: 96,
    loadHours: 6,
    status: 'ACTIVE',
    email: 'mostafa.hagras@nilebyte.edu',
    phone: '+20 100 111 2222',
    assignedCourses: ['CS-401 Artificial Intelligence', 'CS-501 Neural Computing & Deep Learning'],
    leaveHistory: 'Sabbatical approval completed',
    payrollSummary: 'Department Head & Tenured Professor · $4,800/mo',
    performanceRating: 4.95,
  },
  {
    id: 'f-6',
    name: 'Dr. Nour Hassan',
    codeId: 'FAC-006',
    department: 'BUS Dept',
    title: 'Ass. Professor',
    coursesCount: 4,
    studentsCount: 187,
    loadHours: 13,
    status: 'ACTIVE',
    email: 'nour.hassan@nilebyte.edu',
    phone: '+20 122 555 8888',
    assignedCourses: ['BUS-201 Principles of Marketing', 'LAW-201 Business Law', 'MGT-301 Strategic Management', 'BUS-402 Case Analysis'],
    leaveHistory: '1 day conference attendance leave',
    payrollSummary: 'Grade A2 Senior Lecturer · $3,700/mo',
    performanceRating: 4.75,
  },
];

const INITIAL_STAFF: StaffRecord[] = [
  { id: 'st-1', name: 'Mona Ibrahim', codeId: 'STF-101', department: 'Registrar Office', role: 'Chief Registrar', shift: 'Morning (08:00 - 16:00)', status: 'ACTIVE', email: 'mona.ibrahim@nilebyte.edu', phone: '+20 100 888 1234' },
  { id: 'st-2', name: 'Tarek Zaki', codeId: 'STF-102', department: 'IT Services', role: 'Systems Admin', shift: 'Morning (08:30 - 16:30)', status: 'ACTIVE', email: 'tarek.zaki@nilebyte.edu', phone: '+20 102 777 5678' },
  { id: 'st-3', name: 'Reem Soliman', codeId: 'STF-103', department: 'Student Affairs', role: 'Counselor', shift: 'Morning (09:00 - 17:00)', status: 'ACTIVE', email: 'reem.soliman@nilebyte.edu', phone: '+20 109 666 9012' },
  { id: 'st-4', name: 'Hossam El Din', codeId: 'STF-104', department: 'Finance Office', role: 'Senior Accountant', shift: 'Morning (08:00 - 16:00)', status: 'ON LEAVE', email: 'hossam.eldin@nilebyte.edu', phone: '+20 111 555 3456' },
];

const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lr-1',
    name: 'Dr. Omar Farid',
    department: 'ENG Dept',
    leaveType: 'Medical Leave',
    from: '10 Jul 2024',
    to: '18 Jul 2024',
    status: 'pending',
  },
  {
    id: 'lr-2',
    name: 'Dr. Dina Fawzy',
    department: 'CS Dept',
    leaveType: 'Conference Attendance',
    from: '14 Jul 2024',
    to: '17 Jul 2024',
    status: 'pending',
  },
  {
    id: 'lr-3',
    name: 'Dr. Samer Nabil',
    department: 'BUS Dept',
    leaveType: 'Personal / Family',
    from: '20 Jul 2024',
    to: '22 Jul 2024',
    status: 'pending',
  },
];

export const AdminFacultyStaffTab: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const { data: facultyData, isLoading } = useAdminFaculty();
  const { data: staffData } = useAdminStaff();
  const { data: leaveData } = useAdminLeaveRequests();
  const updateLeave = useUpdateLeaveRequest();
  const [activeView, setActiveView] = useState<'faculty' | 'staff'>('faculty');
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>(INITIAL_FACULTY);
  const [staffList, setStaffList] = useState<StaffRecord[]>(INITIAL_STAFF);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);

  useEffect(() => { if (facultyData) setFacultyList(facultyData); }, [facultyData]);
  useEffect(() => { if (staffData) setStaffList(staffData); }, [staffData]);
  useEffect(() => { if (leaveData) setLeaveRequests(leaveData); }, [leaveData]);

  // Filters
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [deptFilter, setDeptFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected faculty for side panel
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRecord | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApproveLeave = (id: string, name: string) => {
    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    );
    showToast(`Leave request for ${name} approved.`);
  };

  const handleRejectLeave = (id: string, name: string) => {
    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    );
    showToast(`Leave request for ${name} rejected.`);
  };

  const filteredFaculty = facultyList.filter((f) => {
    const q = (searchInput || searchQuery).toLowerCase().trim();
    const matchesSearch =
      !q ||
      f.name.toLowerCase().includes(q) ||
      f.codeId.toLowerCase().includes(q) ||
      f.department.toLowerCase().includes(q);

    const matchesDept = deptFilter === 'All' || f.department === deptFilter;
    const matchesRole = roleFilter === 'All' || f.title.toLowerCase().includes(roleFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;

    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading faculty & staff...</div>;
  }

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3256a8] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. TOP STAT CARDS (3 cards)                              */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Faculty */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Faculty
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">312</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                no change
              </span>
              <span className="text-xs text-slate-400">across 6 departments</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#3256a8] flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Total Staff */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Staff
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">89</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                no change
              </span>
              <span className="text-xs text-slate-400">administration & support</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Leave Requests */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Pending Leave Requests
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">7</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
                awaiting approval
              </span>
              <span className="text-xs text-slate-400">dean review</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TOGGLE & FILTER BAR                                   */}
      {/* ======================================================== */}
      <div className="space-y-4">
        {/* Toggle between Faculty and Staff */}
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveView('faculty')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeView === 'faculty'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Faculty (312)
            </button>
            <button
              onClick={() => setActiveView('staff')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeView === 'staff'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Staff (89)
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative flex-1 min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search faculty by name, ID, or department..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#3256a8] focus:bg-white transition-all"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold text-[11px] uppercase">Dept:</span>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-hidden focus:border-[#3256a8] cursor-pointer"
                >
                  <option value="All">All Departments</option>
                  <option value="CS Dept">CS Dept</option>
                  <option value="ENG Dept">ENG Dept</option>
                  <option value="BUS Dept">BUS Dept</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold text-[11px] uppercase">Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-hidden focus:border-[#3256a8] cursor-pointer"
                >
                  <option value="All">All Titles</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Ass. Professor">Ass. Professor</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold text-[11px] uppercase">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-hidden focus:border-[#3256a8] cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ON LEAVE">On Leave</option>
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => showToast('Faculty directory exported')}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export List</span>
              </button>
              <button
                onClick={() => showToast('Faculty onboard modal dialog opened')}
                className="px-4 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{activeView === 'faculty' ? 'Add New Faculty' : 'Add New Staff'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN FACULTY TABLE (6 rows)                           */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {activeView === 'faculty' ? 'Faculty Directory' : 'Administrative Staff Directory'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeView === 'faculty' ? 'Academic load, teaching credits, and status' : 'Operational personnel'}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">Total: {activeView === 'faculty' ? filteredFaculty.length : staffList.length}</span>
        </div>

        {activeView === 'faculty' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Faculty Name</th>
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Title</th>
                  <th className="py-3 px-3">Courses</th>
                  <th className="py-3 px-3">Students</th>
                  <th className="py-3 px-3">Load Hours</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredFaculty.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-[#3256a8] font-bold text-xs flex items-center justify-center shrink-0">
                          {fac.name.split(' ')[1]?.charAt(0) || 'F'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{fac.name}</span>
                          <span className="text-[11px] text-slate-400 font-normal">{fac.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-600">{fac.codeId}</td>
                    <td className="py-3.5 px-3 text-slate-700">{fac.department}</td>
                    <td className="py-3.5 px-3 text-slate-800 font-bold">{fac.title}</td>
                    <td className="py-3.5 px-3 text-slate-600">{fac.coursesCount} courses</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">{fac.studentsCount} students</td>
                    <td className="py-3.5 px-3 font-bold text-slate-700">{fac.loadHours}hrs</td>
                    <td className="py-3.5 px-3">
                      {fac.status === 'ACTIVE' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wide">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 uppercase tracking-wide">
                          ON LEAVE
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedFaculty(fac)}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Staff Name</th>
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Shift Schedule</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {staffList.map((stf) => (
                  <tr key={stf.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900">{stf.name}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-600">{stf.codeId}</td>
                    <td className="py-3.5 px-3 text-slate-700">{stf.department}</td>
                    <td className="py-3.5 px-3 text-slate-800 font-bold">{stf.role}</td>
                    <td className="py-3.5 px-3 text-slate-500 font-medium">{stf.shift}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                        stf.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {stf.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => showToast(`Staff profile for ${stf.name}`)}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. PENDING LEAVE REQUESTS SECTION                        */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Pending Leave Requests</h3>
              <p className="text-xs text-slate-400 mt-0.5">3 faculty leave applications awaiting administrative sanction</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
            {leaveRequests.filter((r) => r.status === 'pending').length} Pending Review
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Faculty Name</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Leave Type</th>
                <th className="py-3 px-3">From</th>
                <th className="py-3 px-3">To</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {leaveRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-3 font-bold text-slate-900">{req.name}</td>
                  <td className="py-3.5 px-3 text-slate-600">{req.department}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold text-[11px]">
                      {req.leaveType}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 font-medium">{req.from}</td>
                  <td className="py-3.5 px-3 text-slate-700 font-medium">{req.to}</td>
                  <td className="py-3.5 px-3 text-right">
                    {req.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveLeave(req.id, req.name)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectLeave(req.id, req.name)}
                          className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : req.status === 'approved' ? (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-[11px]">
                        Approved
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-50 text-red-700 rounded-lg font-bold text-[11px]">
                        Rejected
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. SLIDE-OVER SIDE PANEL: FACULTY PROFILE                */}
      {/* ======================================================== */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 sm:p-7 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#3256a8] text-white flex items-center justify-center font-bold text-lg">
                    {selectedFaculty.name.split(' ')[1]?.charAt(0) || 'F'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedFaculty.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {selectedFaculty.codeId} · {selectedFaculty.title} ({selectedFaculty.department})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFaculty(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status and Rating Badges */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                    selectedFaculty.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {selectedFaculty.status}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-slate-900 font-extrabold">{selectedFaculty.performanceRating}</span>
                  <span className="text-slate-400 font-normal">/ 5.0 (Student Evaluation)</span>
                </div>
              </div>

              {/* Teaching Load & Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Courses</span>
                  <span className="text-lg font-extrabold text-slate-900">{selectedFaculty.coursesCount}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Students</span>
                  <span className="text-lg font-extrabold text-[#3256a8]">{selectedFaculty.studentsCount}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Weekly Load</span>
                  <span className="text-lg font-extrabold text-slate-900">{selectedFaculty.loadHours} hrs</span>
                </div>
              </div>

              {/* Personal Info & Contact */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Contact Information
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </span>
                  <span className="font-bold">{selectedFaculty.email}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone
                  </span>
                  <span className="font-bold">{selectedFaculty.phone}</span>
                </div>
              </div>

              {/* Assigned Courses */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Assigned Courses This Term
                </h4>
                <div className="space-y-2">
                  {selectedFaculty.assignedCourses.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-900">{c}</span>
                      <span className="px-2 py-0.5 bg-blue-50 text-[#3256a8] font-bold rounded-md text-[11px]">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leave & Payroll Summary */}
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Leave History</span>
                  <p className="font-medium text-slate-800">{selectedFaculty.leaveHistory}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Payroll Summary</span>
                  <p className="font-medium text-slate-800">{selectedFaculty.payrollSummary}</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  showToast(`Adjusted workload form generated for ${selectedFaculty.name}`);
                }}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Modify Workload
              </button>
              <button
                onClick={() => {
                  showToast(`Department dispatch memo issued for ${selectedFaculty.name}`);
                  setSelectedFaculty(null);
                }}
                className="px-4 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Issue Dean Memo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
