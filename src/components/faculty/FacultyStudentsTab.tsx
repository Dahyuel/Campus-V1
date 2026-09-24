import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  TrendingDown,
  Search,
  Download,
  Mail,
  UserCheck,
  ChevronDown,
  X,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { FacultyStudentRow } from '../../data/facultyMockData';
import { useFacultyStudents } from '../../hooks/useFacultyData';

interface FacultyStudentsTabProps {
  searchQuery?: string;
}

export const FacultyStudentsTab: React.FC<FacultyStudentsTabProps> = ({
  searchQuery = '',
}) => {
  const { data, isLoading } = useFacultyStudents();
  const FACULTY_STUDENTS_LIST: FacultyStudentRow[] = data ?? [];

  const [localSearch, setLocalSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'Name' | 'GPA' | 'Attendance' | 'Risk Level'>('Name');
  const [selectedStudent, setSelectedStudent] = useState<FacultyStudentRow | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#3256a8] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const combinedSearch = (localSearch || searchQuery).trim().toLowerCase();

  const filteredStudents = FACULTY_STUDENTS_LIST.filter((student) => {
    // Search match
    if (combinedSearch) {
      const match =
        student.name.toLowerCase().includes(combinedSearch) ||
        student.studentId.toLowerCase().includes(combinedSearch);
      if (!match) return false;
    }

    // Course filter
    if (courseFilter !== 'All Courses' && student.course !== courseFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'At-Risk' && student.status !== 'AT RISK') return false;
      if (statusFilter === 'Good Standing' && student.status !== 'GOOD STANDING') return false;
      if (statusFilter === 'Academic Warning' && student.status !== 'WARNING') return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'Name') return a.name.localeCompare(b.name);
    if (sortBy === 'GPA') return b.gpa - a.gpa;
    if (sortBy === 'Attendance') return b.attendance - a.attendance;
    if (sortBy === 'Risk Level') {
      const riskWeight = (s: string) => (s === 'AT RISK' ? 3 : s === 'WARNING' ? 2 : 1);
      return riskWeight(b.status) - riskWeight(a.status);
    }
    return 0;
  });

  const handleExportList = () => {
    showToast('Exported student roster (CSV) successfully');
  };

  const handleMessageAll = () => {
    showToast('Broadcast composer opened for selected student cohort');
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3256a8] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Row of 3 Stat Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Students */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Students
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">213</div>
            <p className="text-xs text-slate-500 mt-0.5">Across 4 teaching sections</p>
          </div>
          <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200/60 rounded-full text-xs font-extrabold text-emerald-700 flex items-center gap-1">
            +12 ↑
          </span>
        </div>

        {/* At-Risk Students */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              At-Risk Students
            </span>
            <div className="text-2xl font-bold text-rose-600 mt-1">8</div>
            <p className="text-xs text-slate-500 mt-0.5">Attendance &lt; 70% or GPA &lt; 2.5</p>
          </div>
          <span className="px-3 py-1.5 bg-rose-50 border border-rose-200/60 rounded-full text-xs font-extrabold text-rose-700">
            needs attention
          </span>
        </div>

        {/* Avg. Grade Across All Courses */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avg. Grade Across All Courses
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">76%</div>
            <p className="text-xs text-slate-500 mt-0.5">Mid-semester baseline</p>
          </div>
          <span className="px-3 py-1.5 bg-amber-50 border border-amber-200/60 rounded-full text-xs font-extrabold text-amber-700 flex items-center gap-1">
            -2% ↓
          </span>
        </div>
      </section>

      {/* Filter Bar & Student Table Section */}
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        {/* Top Controls: Search, Filters, Export, Message All */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
          {/* Left filters */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search student name or ID..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#3256a8] focus:bg-white transition-all"
              />
            </div>

            {/* Course Filter Dropdown */}
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#3256a8] cursor-pointer"
            >
              <option value="All Courses">All Courses</option>
              <option value="Data Structures">Data Structures</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Artificial Intelligence">AI</option>
              <option value="Networks">Networks</option>
            </select>

            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#3256a8] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="At-Risk">At-Risk</option>
              <option value="Good Standing">Good Standing</option>
              <option value="Academic Warning">Academic Warning</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:border-[#3256a8] cursor-pointer"
            >
              <option value="Name">Sort by Name</option>
              <option value="GPA">Sort by GPA</option>
              <option value="Attendance">Sort by Attendance Rate</option>
              <option value="Risk Level">Sort by Risk Level</option>
            </select>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="btn-export-student-roster"
              onClick={handleExportList}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export List</span>
            </button>
            <button
              id="btn-message-all-students"
              onClick={handleMessageAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Message All</span>
            </button>
          </div>
        </div>

        {/* Full-width Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Current Grade</th>
                <th className="py-3 px-4">GPA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredStudents.map((student) => {
                const isAtRisk = student.status === 'AT RISK';
                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${
                      isAtRisk
                        ? 'bg-rose-50/50 hover:bg-rose-50/80'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {student.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                      {student.studentId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {student.course}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold ${
                          student.attendance < 70 ? 'text-rose-600' : 'text-slate-800'
                        }`}
                      >
                        {student.attendance}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {student.currentGrade}/100
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {student.gpa.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          student.status === 'GOOD STANDING'
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                            : student.status === 'AT RISK'
                            ? 'text-rose-700 bg-rose-50 border border-rose-200/60'
                            : 'text-amber-800 bg-amber-50 border border-amber-200/60'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        id={`btn-view-profile-${student.id}`}
                        onClick={() => setSelectedStudent(student)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] rounded-lg font-bold text-xs transition-all cursor-pointer"
                      >
                        <span>View Profile</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Student Profile Quick View Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#3256a8]" />
                <h3 className="font-bold text-slate-900 text-sm">Student Academic Profile</h3>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{selectedStudent.name}</h4>
                  <span className="font-mono text-slate-500 font-semibold">
                    ID: {selectedStudent.studentId}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    selectedStudent.status === 'GOOD STANDING'
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                      : 'text-rose-700 bg-rose-50 border border-rose-200'
                  }`}
                >
                  {selectedStudent.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-400 font-medium">Course</span>
                  <p className="font-bold text-slate-800">{selectedStudent.course}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Cumulative GPA</span>
                  <p className="font-bold text-slate-800">{selectedStudent.gpa.toFixed(2)} / 4.0</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Attendance Rate</span>
                  <p className="font-bold text-slate-800">{selectedStudent.attendance}%</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Current Grade</span>
                  <p className="font-bold text-slate-800">{selectedStudent.currentGrade} / 100</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  showToast(`Direct message started with ${selectedStudent.name}`);
                  setSelectedStudent(null);
                }}
                className="flex-1 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Send Direct Message
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
