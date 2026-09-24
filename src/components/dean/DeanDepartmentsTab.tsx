import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  Mail,
  Phone,
  BarChart2,
  AlertTriangle,
  CheckCircle2,
  X,
  Send,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useDeanDepartments } from '../../hooks/useDeanData';

interface DepartmentData {
  id: string;
  department: string;
  head: string;
  email: string;
  phone: string;
  students: number;
  faculty: number;
  avgGpa: string;
  passRate: string;
  passRateNum: number;
  atRisk: number;
  status: 'ON TRACK' | 'WATCH' | 'CRITICAL';
  statusColor: 'green' | 'orange' | 'red';
  avatarUrl: string;
}

const INITIAL_DEPARTMENTS: DepartmentData[] = [
  {
    id: 'cs',
    department: 'Computer Science',
    head: 'Dr. Mostafa Hagras',
    email: 'm.hagras@nilebyte.edu',
    phone: '+20 100 234 5671',
    students: 946,
    faculty: 24,
    avgGpa: '3.2',
    passRate: '76%',
    passRateNum: 76,
    atRisk: 11,
    status: 'WATCH',
    statusColor: 'orange',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'med',
    department: 'Medicine',
    head: 'Dr. Sara Nour',
    email: 's.nour@nilebyte.edu',
    phone: '+20 100 891 2345',
    students: 1203,
    faculty: 41,
    avgGpa: '3.5',
    passRate: '81%',
    passRateNum: 81,
    atRisk: 4,
    status: 'ON TRACK',
    statusColor: 'green',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'law',
    department: 'Law',
    head: 'Dr. Omar Farid',
    email: 'o.farid@nilebyte.edu',
    phone: '+20 101 456 7890',
    students: 734,
    faculty: 18,
    avgGpa: '2.8',
    passRate: '58%',
    passRateNum: 58,
    atRisk: 6,
    status: 'CRITICAL',
    statusColor: 'red',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'bus',
    department: 'Business',
    head: 'Dr. Nour Hassan',
    email: 'n.hassan@nilebyte.edu',
    phone: '+20 102 345 6789',
    students: 891,
    faculty: 22,
    avgGpa: '3.0',
    passRate: '72%',
    passRateNum: 72,
    atRisk: 4,
    status: 'WATCH',
    statusColor: 'orange',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'eng',
    department: 'Engineering',
    head: 'Dr. Youssef Samir',
    email: 'y.samir@nilebyte.edu',
    phone: '+20 109 876 5432',
    students: 1047,
    faculty: 31,
    avgGpa: '3.1',
    passRate: '74%',
    passRateNum: 74,
    atRisk: 8,
    status: 'WATCH',
    statusColor: 'orange',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'arts',
    department: 'Arts & Humanities',
    head: 'Dr. Layla Ahmed',
    email: 'l.ahmed@nilebyte.edu',
    phone: '+20 106 123 9874',
    students: 612,
    faculty: 16,
    avgGpa: '3.3',
    passRate: '79%',
    passRateNum: 79,
    atRisk: 2,
    status: 'ON TRACK',
    statusColor: 'green',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
];

interface DeanDepartmentsTabProps {
  searchQuery?: string;
  onNavigateTab?: (tab: any) => void;
}

export const DeanDepartmentsTab: React.FC<DeanDepartmentsTabProps> = ({
  searchQuery = '',
  onNavigateTab,
}) => {
  const { data: deanDepts } = useDeanDepartments();
  const [localSearch, setLocalSearch] = useState('');
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [selectedDept, setSelectedDept] = useState<DepartmentData | null>(null);

  useEffect(() => {
    if (deanDepts) setDepartments(deanDepts);
  }, [deanDepts]);
  const [contactHead, setContactHead] = useState<DepartmentData | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Department Form state
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptHead, setNewDeptHead] = useState('');
  const [newDeptEmail, setNewDeptEmail] = useState('');
  const [newDeptPhone, setNewDeptPhone] = useState('');
  const [newDeptStudents, setNewDeptStudents] = useState('250');
  const [newDeptFaculty, setNewDeptFaculty] = useState('12');

  const combinedSearch = (searchQuery || localSearch).trim().toLowerCase();

  const filteredDepts = departments.filter((d) => {
    if (!combinedSearch) return true;
    return (
      d.department.toLowerCase().includes(combinedSearch) ||
      d.head.toLowerCase().includes(combinedSearch) ||
      d.status.toLowerCase().includes(combinedSearch)
    );
  });

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptHead) return;

    const newDept: DepartmentData = {
      id: `dept-${Date.now()}`,
      department: newDeptName,
      head: newDeptHead,
      email: newDeptEmail || `${newDeptHead.toLowerCase().replace(/[^a-z]/g, '')}@nilebyte.edu`,
      phone: newDeptPhone || '+20 100 000 0000',
      students: parseInt(newDeptStudents, 10) || 100,
      faculty: parseInt(newDeptFaculty, 10) || 5,
      avgGpa: '3.2',
      passRate: '75%',
      passRateNum: 75,
      atRisk: 0,
      status: 'ON TRACK',
      statusColor: 'green',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    setDepartments((prev) => [...prev, newDept]);
    setShowAddModal(false);
    setNewDeptName('');
    setNewDeptHead('');
    setNewDeptEmail('');
    setNewDeptPhone('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setContactHead(null);
      setMessageText('');
    }, 1800);
  };

  return (
    <div className="space-y-7">
      {/* 1. TOP STAT CARDS (Row of 3) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Departments */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Departments
            </span>
            <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              no change
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              18
            </span>
            <span className="text-xs text-slate-400 font-medium">Under Dean oversight</span>
          </div>
        </div>

        {/* Departments On Track */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Departments On Track
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-2.5 h-2.5" />
              72% of total
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
              13
            </span>
            <span className="text-xs text-slate-400 font-medium">&gt;75% pass rate</span>
          </div>
        </div>

        {/* Departments Flagged */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Departments Flagged
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-2.5 h-2.5" />
              needs attention
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-rose-600 tracking-tight">
              5
            </span>
            <span className="text-xs text-slate-400 font-medium">Watch & critical status</span>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & ADD DEPARTMENT ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search departments, heads, or status..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3256a8] shadow-xs"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white rounded-2xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* 3. MAIN CONTENT: GRID OF DEPARTMENT CARDS (3 per row) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDepts.map((dept) => {
          // Progress bar color rules: turns orange if <75%, red if <65%, otherwise blue
          const progressColorClass =
            dept.passRateNum < 65
              ? 'bg-rose-500'
              : dept.passRateNum < 75
              ? 'bg-amber-500'
              : 'bg-[#3256a8]';

          const badgeStyles =
            dept.status === 'ON TRACK'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : dept.status === 'WATCH'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200';

          return (
            <div
              key={dept.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Header: Dept Name and Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {dept.department}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badgeStyles} shrink-0`}
                  >
                    {dept.status}
                  </span>
                </div>

                {/* Dept Head Info with Avatar */}
                <div className="flex items-center gap-2.5 mb-5">
                  <img
                    src={dept.avatarUrl}
                    alt={dept.head}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block leading-tight">
                      {dept.head}
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Department Chair
                    </span>
                  </div>
                </div>

                {/* 2x2 Grid of Metrics */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/70 rounded-2xl border border-slate-100 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Students
                    </span>
                    <span className="text-sm font-black text-slate-800">
                      {dept.students.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Faculty
                    </span>
                    <span className="text-sm font-black text-slate-800">
                      {dept.faculty}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Avg GPA
                    </span>
                    <span className="text-sm font-black text-slate-800">
                      {dept.avgGpa}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Pass Rate
                    </span>
                    <span className="text-sm font-black text-slate-800">
                      {dept.passRate}
                    </span>
                  </div>
                </div>

                {/* Horizontal Pass Rate Progress Bar */}
                <div className="space-y-1.5 mb-5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500">Pass Rate Bench</span>
                    <span className="font-bold text-slate-800">{dept.passRate}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${progressColorClass} rounded-full transition-all duration-500`}
                      style={{ width: `${dept.passRateNum}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Two buttons at bottom */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className="w-full py-2 px-3 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  View Analytics
                </button>
                <button
                  type="button"
                  onClick={() => setContactHead(dept)}
                  className="w-full py-2 px-3 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  Contact Head
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* 4. FULL-WIDTH "DEPARTMENT HEADS DIRECTORY" TABLE */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Department Heads Directory
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Executive faculty directory and immediate leadership contacts
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            {departments.length} Department Heads
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Students</th>
                <th className="py-3 px-3">Faculty</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {filteredDepts.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={d.avatarUrl}
                        alt={d.head}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <span className="font-bold text-slate-900">{d.head}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{d.department}</td>
                  <td className="py-3 px-3 text-slate-500">{d.email}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{d.phone}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {d.students.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{d.faculty}</td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setContactHead(d)}
                        className="px-3 py-1.5 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Message
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDept(d)}
                        className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        View Department
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL 1: ADD DEPARTMENT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-100 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#3256a8]" />
                <h3 className="text-base font-bold text-slate-900">Add University Department</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Architecture & Design"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Head</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Hisham Helmy"
                  value={newDeptHead}
                  onChange={(e) => setNewDeptHead(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="head@nilebyte.edu"
                    value={newDeptEmail}
                    onChange={(e) => setNewDeptEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+20 100 000 0000"
                    value={newDeptPhone}
                    onChange={(e) => setNewDeptPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Students</label>
                  <input
                    type="number"
                    value={newDeptStudents}
                    onChange={(e) => setNewDeptStudents(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Faculty Count</label>
                  <input
                    type="number"
                    value={newDeptFaculty}
                    onChange={(e) => setNewDeptFaculty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl font-bold transition-colors"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONTACT HEAD / DIRECT MESSAGE */}
      {contactHead && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={contactHead.avatarUrl}
                  alt={contactHead.head}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{contactHead.head}</h3>
                  <span className="text-[11px] text-slate-400 block">
                    Chair · {contactHead.department}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setContactHead(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {messageSent ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Message dispatched to {contactHead.head}&apos;s priority inbox.
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-semibold text-slate-800">{contactHead.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pass Rate:</span>
                    <span className="font-semibold text-slate-800">{contactHead.passRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>At-Risk Students:</span>
                    <span className="font-bold text-rose-600">{contactHead.atRisk}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Executive Direct Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={`Dear ${contactHead.head}, please note...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-slate-400">Sent with Dean priority seal</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setContactHead(null)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl font-bold"
                    >
                      <Send className="w-3 h-3" />
                      Send Message
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW DEPARTMENT ANALYTICS SLIDEOVER / MODAL */}
      {selectedDept && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-100 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#3256a8] uppercase tracking-wider block">
                  Department Intelligence Briefing
                </span>
                <h3 className="text-xl font-black text-slate-900">{selectedDept.department}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Led by {selectedDept.head} · Status: {selectedDept.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDept(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Students
                </span>
                <span className="text-lg font-black text-slate-900">
                  {selectedDept.students.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Pass Rate
                </span>
                <span
                  className={`text-lg font-black ${
                    selectedDept.passRateNum < 65
                      ? 'text-rose-600'
                      : selectedDept.passRateNum < 75
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {selectedDept.passRate}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  At-Risk
                </span>
                <span className="text-lg font-black text-rose-600">{selectedDept.atRisk}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">Dean Action Recommendations</span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {selectedDept.status === 'CRITICAL'
                  ? 'Pass rate is currently below university minimum (65%). Convene an emergency academic review committee with the Department Chair to investigate curriculum bottlenecks.'
                  : selectedDept.status === 'WATCH'
                  ? 'Pass rate is within the watch zone (65–75%). Ensure faculty tutoring hours and supplemental instruction sessions are adequately staffed before midterms.'
                  : 'Operating consistently above benchmark standards. Recommend best-practice sharing during upcoming Dean Council meeting.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDept(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDept(null);
                  setContactHead(selectedDept);
                }}
                className="px-5 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold transition-colors"
              >
                Message Department Head
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
