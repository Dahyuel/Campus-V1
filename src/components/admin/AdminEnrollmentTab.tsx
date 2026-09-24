import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  BookOpen,
  Users,
  Calendar,
  UploadCloud,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  ArrowUpRight,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import { useAdminEnrollment, useDropEnrollment } from '../../hooks/useAdminData';

interface CourseEnrollment {
  id: string;
  name: string;
  code: string;
  department: string;
  faculty: string;
  enrolled: number;
  capacity: number;
  waitlisted: number;
  status: 'OPEN' | 'FULL';
  roster: { id: string; name: string; studentId: string; date: string }[];
  waitlistStudents: { id: string; name: string; studentId: string; position: number }[];
}

const INITIAL_COURSES: CourseEnrollment[] = [
  {
    id: 'c-1',
    name: 'Data Structures',
    code: 'CS-301',
    department: 'CS Dept',
    faculty: 'Dr. Ahmed Dahy',
    enrolled: 67,
    capacity: 70,
    waitlisted: 3,
    status: 'OPEN',
    roster: [
      { id: 'st-1', name: 'Ahmed Tarek', studentId: '202100234', date: '01 Jul 2024' },
      { id: 'st-2', name: 'Khaled Mostafa', studentId: '202100267', date: '02 Jul 2024' },
      { id: 'st-3', name: 'Mona Salem', studentId: '202100512', date: '03 Jul 2024' },
    ],
    waitlistStudents: [
      { id: 'w-1', name: 'Salma Fathy', studentId: '202100812', position: 1 },
      { id: 'w-2', name: 'Rami Galal', studentId: '202100819', position: 2 },
      { id: 'w-3', name: 'Heba Adel', studentId: '202100891', position: 3 },
    ],
  },
  {
    id: 'c-2',
    name: 'Mathematics',
    code: 'MATH-201',
    department: 'MATH Dept',
    faculty: 'Dr. Sara Nour',
    enrolled: 70,
    capacity: 70,
    waitlisted: 8,
    status: 'FULL',
    roster: [
      { id: 'st-4', name: 'Sara Mahmoud', studentId: '202100187', date: '29 Jun 2024' },
      { id: 'st-5', name: 'Youssef Samir', studentId: '202100098', date: '30 Jun 2024' },
    ],
    waitlistStudents: [
      { id: 'w-4', name: 'Tarek Nader', studentId: '202100661', position: 1 },
      { id: 'w-5', name: 'Nouran Zaki', studentId: '202100672', position: 2 },
      { id: 'w-6', name: 'Kareem Aly', studentId: '202100690', position: 3 },
    ],
  },
  {
    id: 'c-3',
    name: 'AI',
    code: 'CS-401',
    department: 'CS Dept',
    faculty: 'Dr. Mostafa Hagras',
    enrolled: 48,
    capacity: 50,
    waitlisted: 0,
    status: 'OPEN',
    roster: [
      { id: 'st-6', name: 'Khaled Mostafa', studentId: '202100267', date: '01 Jul 2024' },
    ],
    waitlistStudents: [],
  },
  {
    id: 'c-4',
    name: 'Networks',
    code: 'CS-303',
    department: 'CS Dept',
    faculty: 'Dr. Omar Farid',
    enrolled: 44,
    capacity: 60,
    waitlisted: 0,
    status: 'OPEN',
    roster: [
      { id: 'st-7', name: 'Sara Mahmoud', studentId: '202100187', date: '03 Jul 2024' },
    ],
    waitlistStudents: [],
  },
  {
    id: 'c-5',
    name: 'Business Law',
    code: 'LAW-201',
    department: 'LAW Dept',
    faculty: 'Dr. Nour Hassan',
    enrolled: 60,
    capacity: 60,
    waitlisted: 12,
    status: 'FULL',
    roster: [
      { id: 'st-8', name: 'Layla Ahmed', studentId: '202100445', date: '28 Jun 2024' },
    ],
    waitlistStudents: [
      { id: 'w-7', name: 'Mostafa Kamel', studentId: '202100778', position: 1 },
      { id: 'w-8', name: 'Farah Helmy', studentId: '202100799', position: 2 },
    ],
  },
  {
    id: 'c-6',
    name: 'Organic Chemistry',
    code: 'CHEM-301',
    department: 'MED Dept',
    faculty: 'Dr. Youssef Samir',
    enrolled: 35,
    capacity: 50,
    waitlisted: 0,
    status: 'OPEN',
    roster: [
      { id: 'st-9', name: 'Omar Hassan', studentId: '202100156', date: '02 Jul 2024' },
    ],
    waitlistStudents: [],
  },
];

interface GlobalWaitlist {
  id: string;
  studentName: string;
  courseCode: string;
  courseName: string;
  position: number;
}

const INITIAL_GLOBAL_WAITLIST: GlobalWaitlist[] = [
  { id: 'gw-1', studentName: 'Salma Fathy', courseCode: 'CS-301', courseName: 'Data Structures', position: 1 },
  { id: 'gw-2', studentName: 'Tarek Nader', courseCode: 'MATH-201', courseName: 'Mathematics', position: 1 },
  { id: 'gw-3', studentName: 'Mostafa Kamel', courseCode: 'LAW-201', courseName: 'Business Law', position: 1 },
  { id: 'gw-4', studentName: 'Farah Helmy', courseCode: 'LAW-201', courseName: 'Business Law', position: 2 },
  { id: 'gw-5', studentName: 'Nouran Zaki', courseCode: 'MATH-201', courseName: 'Mathematics', position: 2 },
];

export const AdminEnrollmentTab: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const { data: enrollmentData, isLoading } = useAdminEnrollment();
  const dropEnrollment = useDropEnrollment();
  const [courses, setCourses] = useState<CourseEnrollment[]>(INITIAL_COURSES);
  const [waitlist, setWaitlist] = useState<GlobalWaitlist[]>(INITIAL_GLOBAL_WAITLIST);

  useEffect(() => { if (enrollmentData) setCourses(enrollmentData); }, [enrollmentData]);

  // Selected course for side panel
  const [selectedCourse, setSelectedCourse] = useState<CourseEnrollment | null>(null);

  // Bulk enrollment state
  const [bulkSemester, setBulkSemester] = useState('Fall 2024');
  const [bulkDept, setBulkDept] = useState('All Departments');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePromoteFromGlobal = (item: GlobalWaitlist) => {
    setWaitlist((prev) => prev.filter((w) => w.id !== item.id));
    setCourses((prev) =>
      prev.map((c) => {
        if (c.code === item.courseCode) {
          return {
            ...c,
            enrolled: c.enrolled + 1,
            waitlisted: Math.max(0, c.waitlisted - 1),
            status: c.enrolled + 1 >= c.capacity ? 'FULL' : 'OPEN',
          };
        }
        return c;
      })
    );
    showToast(`Promoted ${item.studentName} into ${item.courseCode}! Seat confirmed.`);
  };

  const handlePromoteInCourse = (studentName: string) => {
    if (!selectedCourse) return;
    const updated = {
      ...selectedCourse,
      enrolled: selectedCourse.enrolled + 1,
      waitlisted: Math.max(0, selectedCourse.waitlisted - 1),
      status: (selectedCourse.enrolled + 1 >= selectedCourse.capacity ? 'FULL' : 'OPEN') as 'OPEN' | 'FULL',
      waitlistStudents: selectedCourse.waitlistStudents.filter((w) => w.name !== studentName),
      roster: [
        ...selectedCourse.roster,
        { id: `st-${Date.now()}`, name: studentName, studentId: '202100888', date: 'Today' },
      ],
    };
    setSelectedCourse(updated);
    setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast(`Promoted ${studentName} to active roster.`);
  };

  const handleRemoveFromRoster = (studentId: string, studentName: string) => {
    if (!selectedCourse) return;
    const updated = {
      ...selectedCourse,
      enrolled: Math.max(0, selectedCourse.enrolled - 1),
      status: 'OPEN' as 'OPEN' | 'FULL',
      roster: selectedCourse.roster.filter((s) => s.studentId !== studentId),
    };
    setSelectedCourse(updated);
    setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast(`Removed ${studentName} from course roster.`);
  };

  const handleBulkUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      showToast('Please select or drop a valid CSV file first.');
      return;
    }
    showToast(`Successfully processed ${uploadedFile}. 114 students enrolled.`);
    setUploadedFile(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading enrollment...</div>;
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
      {/* 1. TOP STAT CARDS (4 cards)                              */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Enrolled This Semester */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Enrolled
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">4,821</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                +143 ↑
              </span>
              <span className="text-xs text-slate-400">active this term</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#3256a8] flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Open Courses */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Open Courses
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">84</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                seats available
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Waitlisted Students */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Waitlisted Students
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">37</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
                in queue
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Enrollment Deadline */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Enrollment Deadline
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">Jul 15</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600">
                6 days left
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN LAYOUT: TWO COLUMNS (Left Wide, Right Narrow)     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column (col-span-8) — Course Enrollment Table */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Course Enrollment Status</h3>
                <p className="text-xs text-slate-400 mt-0.5">Live section capacities and queue status</p>
              </div>
              <span className="text-xs font-bold text-slate-400">Term 2024</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Course</th>
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Faculty</th>
                    <th className="py-3 px-3">Enrolled</th>
                    <th className="py-3 px-3">Waitlist</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {courses.map((c) => {
                    const isFull = c.status === 'FULL';
                    return (
                      <tr
                        key={c.id}
                        className={`transition-colors ${
                          isFull
                            ? 'bg-amber-50/50 hover:bg-amber-50/80'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="py-3.5 px-3 font-bold text-slate-900">{c.name}</td>
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-600">{c.code}</td>
                        <td className="py-3.5 px-3 text-slate-600">{c.department}</td>
                        <td className="py-3.5 px-3 text-slate-700">{c.faculty}</td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{c.enrolled}/{c.capacity}</span>
                            <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isFull ? 'bg-amber-500' : 'bg-[#3256a8]'}`}
                                style={{ width: `${Math.min(100, (c.enrolled / c.capacity) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          {c.waitlisted > 0 ? (
                            <span className="font-bold text-amber-600">{c.waitlisted} waitlisted</span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          {isFull ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
                              FULL
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wide">
                              OPEN
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedCourse(c)}
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (col-span-4) — Enrollment Actions */}
        <div className="lg:col-span-4 space-y-7">
          {/* Top Card — Bulk Enrollment */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Bulk Enrollment</h3>
              <p className="text-xs text-slate-400 mt-0.5">Upload student roster spreadsheet for batch registration</p>
            </div>

            <form onSubmit={handleBulkUpload} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Semester</label>
                <select
                  value={bulkSemester}
                  onChange={(e) => setBulkSemester(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-[#3256a8]"
                >
                  <option value="Fall 2024">Fall 2024</option>
                  <option value="Spring 2024">Spring 2024</option>
                  <option value="Summer 2024">Summer 2024</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Scope</label>
                <select
                  value={bulkDept}
                  onChange={(e) => setBulkDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-[#3256a8]"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="CS Dept">Computer Science</option>
                  <option value="ENG Dept">Engineering</option>
                  <option value="BUS Dept">Business</option>
                  <option value="MED Dept">Medicine</option>
                </select>
              </div>

              {/* Drag-and-drop file upload */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">CSV File Upload</label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setUploadedFile(e.dataTransfer.files[0].name);
                    }
                  }}
                  onClick={() => setUploadedFile('fall2024_roster_batch.csv')}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-[#3256a8] bg-blue-50/50'
                      : uploadedFile
                      ? 'border-emerald-300 bg-emerald-50/40'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <UploadCloud className={`w-7 h-7 mx-auto mb-2 ${uploadedFile ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {uploadedFile ? (
                    <div>
                      <span className="font-bold text-emerald-800 block text-xs">{uploadedFile}</span>
                      <span className="text-[11px] text-emerald-600 font-medium">Ready to process</span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold text-slate-700 block text-xs">Click or drag CSV here</span>
                      <span className="text-[11px] text-slate-400">Supports .csv or .xlsx up to 10MB</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Upload & Enroll</span>
              </button>
            </form>
          </div>

          {/* Bottom Card — Waitlist Manager */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Waitlist Manager</h3>
                <p className="text-xs text-slate-400 mt-0.5">Top priority waitlist queue</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
                {waitlist.length} Queue
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {waitlist.length === 0 ? (
                <div className="p-4 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl">
                  All waitlist queues are currently clear.
                </div>
              ) : (
                waitlist.slice(0, 5).map((w) => (
                  <div
                    key={w.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{w.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {w.courseCode} · <span className="text-amber-600 font-bold">Pos #{w.position}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePromoteFromGlobal(w)}
                      className="px-2.5 py-1.5 bg-[#3256a8] hover:bg-[#284588] text-white font-bold rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1 shrink-0 text-[11px]"
                    >
                      Promote
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. SLIDE-OVER SIDE PANEL: MANAGE COURSE ENROLLMENT       */}
      {/* ======================================================== */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-6 sm:p-7 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-[#3256a8] uppercase tracking-wider font-mono">
                    {selectedCourse.code} · {selectedCourse.department}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedCourse.name}</h3>
                  <p className="text-xs text-slate-500">Instructor: {selectedCourse.faculty}</p>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Capacity Banner */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[11px] block">Capacity Status</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5">
                    {selectedCourse.enrolled} / {selectedCourse.capacity} Students Enrolled
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                  selectedCourse.status === 'FULL' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {selectedCourse.status}
                </span>
              </div>

              {/* Waitlist Promotion for this course */}
              {selectedCourse.waitlistStudents.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Waitlisted Applicants ({selectedCourse.waitlistStudents.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {selectedCourse.waitlistStudents.map((ws) => (
                      <div
                        key={ws.id}
                        className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{ws.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono">ID: {ws.studentId} · Position #{ws.position}</span>
                        </div>
                        <button
                          onClick={() => handlePromoteInCourse(ws.name)}
                          className="px-2.5 py-1 bg-[#3256a8] hover:bg-[#284588] text-white font-bold rounded-lg text-xs transition-all cursor-pointer"
                        >
                          Promote to Enrolled
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enrolled Roster */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Enrolled Students Roster
                  </h4>
                  <button
                    onClick={() => {
                      const name = prompt('Enter student full name to add manually:');
                      if (name) {
                        const updated = {
                          ...selectedCourse,
                          enrolled: selectedCourse.enrolled + 1,
                          roster: [...selectedCourse.roster, { id: `m-${Date.now()}`, name, studentId: '202100999', date: 'Manual Add' }],
                        };
                        setSelectedCourse(updated);
                        setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                        showToast(`Manually enrolled ${name}`);
                      }
                    }}
                    className="text-xs font-bold text-[#3256a8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Student
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedCourse.roster.map((st) => (
                    <div
                      key={st.id}
                      className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{st.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">ID: {st.studentId} · Enrolled {st.date}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveFromRoster(st.studentId, st.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Close */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-5 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
