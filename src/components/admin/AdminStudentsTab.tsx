import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  X,
  Check,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  DollarSign,
  GraduationCap,
  FileText,
  Mail,
  Phone,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { SHARED_AVATAR_URL } from '../../data/mockData';
import { useAdminStudents, useCreateStudent, useDeactivateStudent } from '../../hooks/useAdminData';

interface StudentRecord {
  id: string;
  name: string;
  studentId: string;
  program: string;
  department: string;
  gpa: number;
  attendance: string;
  standing: 'Good Standing' | 'At Risk' | 'Warning' | 'Probation';
  email: string;
  phone: string;
  enrolledCourses: { code: string; name: string; credits: number; grade: string }[];
  feeStatus: 'Paid in Full' | 'Outstanding Balance' | 'Partial';
  balance: string;
  riskFlags?: string[];
}

const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 's-1',
    name: 'Ahmed Tarek',
    studentId: '202100234',
    program: 'Computer Science',
    department: 'CS Dept',
    gpa: 3.6,
    attendance: '91%',
    standing: 'Good Standing',
    email: 'ahmed.tarek@nilebyte.edu',
    phone: '+20 101 234 5678',
    feeStatus: 'Paid in Full',
    balance: '$0.00',
    enrolledCourses: [
      { code: 'CS-301', name: 'Data Structures & Algorithms', credits: 3, grade: 'A' },
      { code: 'CS-303', name: 'Computer Networks', credits: 3, grade: 'B+' },
      { code: 'MATH-201', name: 'Linear Algebra', credits: 3, grade: 'A-' },
      { code: 'GEN-102', name: 'Technical Writing', credits: 2, grade: 'A' },
    ],
  },
  {
    id: 's-2',
    name: 'Sara Mahmoud',
    studentId: '202100187',
    program: 'Networks Engineering',
    department: 'ENG Dept',
    gpa: 2.4,
    attendance: '61%',
    standing: 'At Risk',
    email: 'sara.mahmoud@nilebyte.edu',
    phone: '+20 102 987 6543',
    feeStatus: 'Outstanding Balance',
    balance: '$1,200.00',
    riskFlags: ['Low attendance below 65%', 'Failed Midterm in CS-303', 'Overdue tuition invoice INV-3301'],
    enrolledCourses: [
      { code: 'CS-303', name: 'Computer Networks', credits: 3, grade: 'D+' },
      { code: 'ENG-204', name: 'Signal Processing', credits: 4, grade: 'C-' },
      { code: 'MATH-201', name: 'Linear Algebra', credits: 3, grade: 'C' },
    ],
  },
  {
    id: 's-3',
    name: 'Nour Ali',
    studentId: '202100312',
    program: 'Business Admin',
    department: 'BUS Dept',
    gpa: 2.9,
    attendance: '74%',
    standing: 'Warning',
    email: 'nour.ali@nilebyte.edu',
    phone: '+20 109 456 7890',
    feeStatus: 'Paid in Full',
    balance: '$0.00',
    riskFlags: ['Attendance dropped below 75% threshold in BUS-201'],
    enrolledCourses: [
      { code: 'BUS-201', name: 'Principles of Marketing', credits: 3, grade: 'B-' },
      { code: 'ACC-101', name: 'Financial Accounting', credits: 3, grade: 'B' },
      { code: 'ECON-102', name: 'Macroeconomics', credits: 3, grade: 'C+' },
    ],
  },
  {
    id: 's-4',
    name: 'Youssef Samir',
    studentId: '202100098',
    program: 'Medicine',
    department: 'MED Dept',
    gpa: 3.8,
    attendance: '95%',
    standing: 'Good Standing',
    email: 'youssef.samir@nilebyte.edu',
    phone: '+20 111 888 9999',
    feeStatus: 'Partial',
    balance: '$600.00',
    enrolledCourses: [
      { code: 'MED-301', name: 'Human Anatomy II', credits: 4, grade: 'A' },
      { code: 'MED-303', name: 'Physiology & Pathology', credits: 4, grade: 'A' },
      { code: 'CHEM-301', name: 'Organic Chemistry', credits: 3, grade: 'A-' },
    ],
  },
  {
    id: 's-5',
    name: 'Layla Ahmed',
    studentId: '202100445',
    program: 'Law',
    department: 'LAW Dept',
    gpa: 2.6,
    attendance: '68%',
    standing: 'At Risk',
    email: 'layla.ahmed@nilebyte.edu',
    phone: '+20 115 222 3333',
    feeStatus: 'Outstanding Balance',
    balance: '$1,200.00',
    riskFlags: ['Attendance warning in Constitutional Law', 'Pending invoice INV-3265'],
    enrolledCourses: [
      { code: 'LAW-201', name: 'Constitutional Law', credits: 3, grade: 'C' },
      { code: 'LAW-203', name: 'Civil Procedures', credits: 3, grade: 'C+' },
      { code: 'PHIL-101', name: 'Legal Ethics', credits: 2, grade: 'B-' },
    ],
  },
  {
    id: 's-6',
    name: 'Khaled Mostafa',
    studentId: '202100267',
    program: 'Computer Science',
    department: 'CS Dept',
    gpa: 3.1,
    attendance: '83%',
    standing: 'Good Standing',
    email: 'khaled.mostafa@nilebyte.edu',
    phone: '+20 100 444 5555',
    feeStatus: 'Paid in Full',
    balance: '$0.00',
    enrolledCourses: [
      { code: 'CS-301', name: 'Data Structures & Algorithms', credits: 3, grade: 'B' },
      { code: 'CS-401', name: 'Artificial Intelligence', credits: 3, grade: 'B+' },
      { code: 'CS-303', name: 'Computer Networks', credits: 3, grade: 'B' },
    ],
  },
  {
    id: 's-7',
    name: 'Dina Kamal',
    studentId: '202100391',
    program: 'Business Admin',
    department: 'BUS Dept',
    gpa: 2.1,
    attendance: '55%',
    standing: 'At Risk',
    email: 'dina.kamal@nilebyte.edu',
    phone: '+20 122 333 4444',
    feeStatus: 'Outstanding Balance',
    balance: '$600.00',
    riskFlags: ['Critical attendance below 60%', 'Cumulative GPA near probation cutoff', 'Unpaid semester fees'],
    enrolledCourses: [
      { code: 'BUS-201', name: 'Principles of Marketing', credits: 3, grade: 'D' },
      { code: 'ACC-101', name: 'Financial Accounting', credits: 3, grade: 'F' },
      { code: 'STAT-101', name: 'Business Statistics', credits: 3, grade: 'D+' },
    ],
  },
  {
    id: 's-8',
    name: 'Omar Hassan',
    studentId: '202100156',
    program: 'Medicine',
    department: 'MED Dept',
    gpa: 3.4,
    attendance: '88%',
    standing: 'Good Standing',
    email: 'omar.hassan@nilebyte.edu',
    phone: '+20 114 777 8888',
    feeStatus: 'Paid in Full',
    balance: '$0.00',
    enrolledCourses: [
      { code: 'MED-301', name: 'Human Anatomy II', credits: 4, grade: 'B+' },
      { code: 'MED-303', name: 'Physiology & Pathology', credits: 4, grade: 'A-' },
      { code: 'CHEM-301', name: 'Organic Chemistry', credits: 3, grade: 'B' },
    ],
  },
];

interface PendingRegistration {
  id: string;
  name: string;
  program: string;
  submittedDate: string;
  documents: string;
  status: 'pending' | 'approved' | 'rejected';
}

const INITIAL_REGISTRATIONS: PendingRegistration[] = [
  {
    id: 'reg-1',
    name: 'Mariam Ezzat',
    program: 'Computer Science (B.Sc.)',
    submittedDate: '08 Jul 2024',
    documents: 'High School Cert, National ID, Medical',
    status: 'pending',
  },
  {
    id: 'reg-2',
    name: 'Karim Sherif',
    program: 'Electrical Engineering (B.Sc.)',
    submittedDate: '07 Jul 2024',
    documents: 'High School Cert, Military Status, Transcripts',
    status: 'pending',
  },
  {
    id: 'reg-3',
    name: 'Hana Wael',
    program: 'Business Administration (BBA)',
    submittedDate: '06 Jul 2024',
    documents: 'High School Cert, National ID, Bank Receipt',
    status: 'pending',
  },
];

export const AdminStudentsTab: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const { data: studentsData, isLoading } = useAdminStudents();
  const createStudent = useCreateStudent();
  const deactivateStudent = useDeactivateStudent();
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [registrations, setRegistrations] = useState<PendingRegistration[]>(INITIAL_REGISTRATIONS);

  useEffect(() => {
    if (studentsData) setStudents(studentsData);
  }, [studentsData]);
  
  // Filters
  const [deptFilter, setDeptFilter] = useState('All');
  const [standingFilter, setStandingFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('Fall 2024');
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Selected student for slide-over side panel
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Modal for Add New Student
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    studentId: '',
    program: 'Computer Science',
    department: 'CS Dept',
    gpa: '3.0',
    email: '',
    phone: '',
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const q = (searchInput || searchQuery).toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.program.toLowerCase().includes(q);

    const matchesDept = deptFilter === 'All' || s.department === deptFilter;
    const matchesStanding =
      standingFilter === 'All' || s.standing.toLowerCase() === standingFilter.toLowerCase();

    return matchesSearch && matchesDept && matchesStanding;
  });

  const handleExportCsv = () => {
    const header = ['Name', 'Student ID', 'Email', 'Program', 'Department', 'GPA', 'Attendance', 'Standing'];
    const escapeCell = (value: string | number | null) => {
      const text = value === null ? '' : String(value);
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const rows = filteredStudents.map((s) =>
      [s.name, s.studentId, s.email, s.program, s.department, s.gpa.toFixed(1), s.attendance, s.standing]
        .map(escapeCell)
        .join(',')
    );
    // BOM so Excel reads UTF-8 names correctly
    const csv = `﻿${[header.join(','), ...rows].join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `student-roster-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredStudents.length} row${filteredStudents.length === 1 ? '' : 's'} to CSV`);
  };

  const handleApproveRegistration = (id: string, name: string) => {
    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    );
    showToast(`Application for ${name} approved. Welcome packet dispatched.`);
  };

  const handleRejectRegistration = (id: string, name: string) => {
    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    );
    showToast(`Application for ${name} marked as rejected.`);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.name) return;
    try {
      const result = await createStudent.mutateAsync({
        name: newStudentForm.name,
        email: newStudentForm.email || undefined,
        program: newStudentForm.program,
        department: newStudentForm.department,
        phone: newStudentForm.phone || undefined,
      });
      showToast("Student created. Temp password: " + result.tempPassword);
    } catch {
      showToast("Failed to create student.");
    }
    setIsAddModalOpen(false);
    setNewStudentForm({
      name: "",
      studentId: "",
      program: "Computer Science",
      department: "CS Dept",
      gpa: "3.0",
      email: "",
      phone: "",
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading students...</div>;
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
        {/* Total Students */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Students
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">4,821</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                +143 ↑
              </span>
              <span className="text-xs text-slate-400">vs last semester</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#3256a8] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* At-Risk Students */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              At-Risk Students
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">27</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600">
                action needed
              </span>
              <span className="text-xs text-slate-400">counseling flagged</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Registrations */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Pending Registrations
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">14</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
                awaiting approval
              </span>
              <span className="text-xs text-slate-400">document review</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. FILTER & ACTION BAR                                   */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Left search input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#3256a8] focus:bg-white transition-all"
            />
          </div>

          {/* Middle dropdowns */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-bold text-[11px] uppercase">Dept:</span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-hidden focus:border-[#3256a8] cursor-pointer"
              >
                <option value="All">All Depts</option>
                <option value="CS Dept">CS Dept</option>
                <option value="ENG Dept">ENG Dept</option>
                <option value="BUS Dept">BUS Dept</option>
                <option value="MED Dept">MED Dept</option>
                <option value="LAW Dept">LAW Dept</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-bold text-[11px] uppercase">Standing:</span>
              <select
                value={standingFilter}
                onChange={(e) => setStandingFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-hidden focus:border-[#3256a8] cursor-pointer"
              >
                <option value="All">All Standing</option>
                <option value="Good Standing">Good Standing</option>
                <option value="Warning">Warning</option>
                <option value="Probation">Probation</option>
                <option value="At Risk">At-Risk</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-bold text-[11px] uppercase">Semester:</span>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-hidden focus:border-[#3256a8] cursor-pointer"
              >
                <option value="Fall 2024">Fall 2024</option>
                <option value="Spring 2024">Spring 2024</option>
                <option value="Summer 2024">Summer 2024</option>
              </select>
            </div>
          </div>

          {/* Right action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export List (.csv)</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Student</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN STUDENT TABLE (8 rows)                           */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Active Student Directory</h3>
            <p className="text-xs text-slate-400 mt-0.5">Showing {filteredStudents.length} enrolled students</p>
          </div>
          <span className="text-xs font-bold text-slate-400">Semester 2 · 2024</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Student ID</th>
                <th className="py-3 px-3">Program</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">GPA</th>
                <th className="py-3 px-3">Attendance</th>
                <th className="py-3 px-3">Standing</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.map((st) => {
                const isAtRisk = st.standing === 'At Risk';
                return (
                  <tr
                    key={st.id}
                    className={`transition-colors ${
                      isAtRisk
                        ? 'bg-red-50/50 hover:bg-red-50/80'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{st.name}</span>
                          <span className="text-[11px] text-slate-400 font-normal">{st.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-600">{st.studentId}</td>
                    <td className="py-3.5 px-3 text-slate-700">{st.program}</td>
                    <td className="py-3.5 px-3 text-slate-600">{st.department}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">{st.gpa.toFixed(1)}</td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              parseInt(st.attendance) < 70
                                ? 'bg-red-500'
                                : parseInt(st.attendance) < 80
                                ? 'bg-amber-500'
                                : 'bg-[#3256a8]'
                            }`}
                            style={{ width: st.attendance }}
                          />
                        </div>
                        <span className="font-bold text-slate-700">{st.attendance}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      {st.standing === 'Good Standing' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wide">
                          GOOD STANDING
                        </span>
                      ) : st.standing === 'At Risk' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 uppercase tracking-wide flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          AT RISK
                        </span>
                      ) : st.standing === 'Warning' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 uppercase tracking-wide">
                          WARNING
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wide">
                          {st.standing}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedStudent(st)}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
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
      </div>

      {/* ======================================================== */}
      {/* 4. PENDING REGISTRATIONS SECTION                         */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Pending Student Registrations</h3>
              <p className="text-xs text-slate-400 mt-0.5">3 applicant submissions requiring document verification</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
            {registrations.filter((r) => r.status === 'pending').length} Action Needed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Applicant Name</th>
                <th className="py-3 px-3">Program</th>
                <th className="py-3 px-3">Submitted Date</th>
                <th className="py-3 px-3">Documents</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-900 block">{reg.name}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700">{reg.program}</td>
                  <td className="py-3.5 px-3 text-slate-500 font-medium">{reg.submittedDate}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-medium">
                      {reg.documents}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {reg.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveRegistration(reg.id, reg.name)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRegistration(reg.id, reg.name)}
                          className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : reg.status === 'approved' ? (
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
      {/* 5. SLIDE-OVER SIDE PANEL: STUDENT PROFILE                */}
      {/* ======================================================== */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 sm:p-7 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#3256a8] text-white flex items-center justify-center font-bold text-lg">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">ID: {selectedStudent.studentId} · {selectedStudent.department}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* At-Risk Banner if any */}
              {selectedStudent.riskFlags && selectedStudent.riskFlags.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-red-700 font-bold text-xs mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Academic & Financial Risk Flags</span>
                  </div>
                  <ul className="space-y-1 text-xs text-red-600 font-medium list-disc list-inside">
                    {selectedStudent.riskFlags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">GPA</span>
                  <span className="text-lg font-extrabold text-slate-900">{selectedStudent.gpa.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Attendance</span>
                  <span className="text-lg font-extrabold text-[#3256a8]">{selectedStudent.attendance}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Standing</span>
                  <span className={`text-xs font-bold block mt-1 ${
                    selectedStudent.standing === 'Good Standing'
                      ? 'text-emerald-700'
                      : selectedStudent.standing === 'At Risk'
                      ? 'text-red-600'
                      : 'text-amber-600'
                  }`}>
                    {selectedStudent.standing}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Contact & Enrollment Info
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </span>
                  <span className="font-bold">{selectedStudent.email}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone
                  </span>
                  <span className="font-bold">{selectedStudent.phone}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" /> Program
                  </span>
                  <span className="font-bold">{selectedStudent.program}</span>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Enrolled Courses ({selectedStudent.enrolledCourses.length})
                  </h4>
                  <span className="text-xs text-slate-400">Current Semester</span>
                </div>
                <div className="space-y-2">
                  {selectedStudent.enrolledCourses.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{c.code} · {c.name}</div>
                        <div className="text-[11px] text-slate-400">{c.credits} Credit Hours</div>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-50 text-[#3256a8] font-bold rounded-lg text-xs">
                        Grade: {c.grade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Status Summary */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Fee Status</span>
                  <span className={`font-bold text-sm ${
                    selectedStudent.feeStatus === 'Paid in Full' ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {selectedStudent.feeStatus}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Balance Due</span>
                  <span className="font-bold text-sm text-slate-900">{selectedStudent.balance}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  showToast(`Official academic transcript generated for ${selectedStudent.name}`);
                }}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Transcript
              </button>
              <button
                onClick={() => {
                  showToast(`Advisor alert dispatched for ${selectedStudent.name}`);
                  setSelectedStudent(null);
                }}
                className="px-4 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Send Advisor Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MODAL: ADD NEW STUDENT                                */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-100 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Student</h3>
                <p className="text-xs text-slate-400">Enroll an accepted applicant into the university directory</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Student Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ziad Khaled"
                    value={newStudentForm.name}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student ID (National / Code)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 202100512"
                    value={newStudentForm.studentId}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, studentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Program</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.program}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, program: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={newStudentForm.department}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-[#3256a8]"
                  >
                    <option value="CS Dept">CS Dept</option>
                    <option value="ENG Dept">ENG Dept</option>
                    <option value="BUS Dept">BUS Dept</option>
                    <option value="MED Dept">MED Dept</option>
                    <option value="LAW Dept">LAW Dept</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="student@nilebyte.edu"
                    value={newStudentForm.email}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+20 1..."
                    value={newStudentForm.phone}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3256a8] hover:bg-[#284588] text-white font-bold rounded-xl shadow-xs"
                >
                  Save & Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
