import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Building2,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Info,
  Edit2,
  X,
  Check,
  Search,
  Filter
} from 'lucide-react';
import { useAdminExams, useResolveConflict } from '../../hooks/useAdminData';

interface ExamItem {
  id: string;
  course: string;
  code: string;
  date: string;
  time: string;
  room: string;
  invigilator: string;
  students: number;
  status: 'CONFIRMED' | 'PENDING';
}

const INITIAL_EXAMS: ExamItem[] = [
  { id: 'ex-1', course: 'Data Structures', code: 'CS-301', date: '10 Jul 2024', time: '9:00 AM', room: 'Hall A', invigilator: 'Dr. Ahmed Dahy', students: 67, status: 'CONFIRMED' },
  { id: 'ex-2', course: 'Mathematics', code: 'MATH-201', date: '10 Jul 2024', time: '12:00 PM', room: 'Hall B', invigilator: 'Dr. Sara Nour', students: 70, status: 'CONFIRMED' },
  { id: 'ex-3', course: 'AI', code: 'CS-401', date: '11 Jul 2024', time: '9:00 AM', room: 'Room 301', invigilator: 'Dr. Mostafa Hagras', students: 48, status: 'PENDING' },
  { id: 'ex-4', course: 'Networks', code: 'CS-303', date: '12 Jul 2024', time: '11:00 AM', room: 'Hall A', invigilator: 'Dr. Omar Farid', students: 44, status: 'CONFIRMED' },
  { id: 'ex-5', course: 'Business Law', code: 'LAW-201', date: '13 Jul 2024', time: '10:00 AM', room: 'Hall C', invigilator: 'Dr. Nour Hassan', students: 60, status: 'PENDING' },
  { id: 'ex-6', course: 'Chemistry', code: 'CHEM-301', date: '14 Jul 2024', time: '9:00 AM', room: 'Lab 2', invigilator: 'Dr. Youssef Samir', students: 35, status: 'CONFIRMED' },
];

const ROOM_SCHEDULE = [
  { room: 'Hall A', capacity: 120, mon: 'BOOKED', tue: 'FREE', wed: 'BOOKED', thu: 'FREE', fri: 'BOOKED' },
  { room: 'Hall B', capacity: 100, mon: 'BOOKED', tue: 'BOOKED', wed: 'FREE', thu: 'FREE', fri: 'FREE' },
  { room: 'Hall C', capacity: 80, mon: 'FREE', tue: 'FREE', wed: 'BOOKED', thu: 'BOOKED', fri: 'FREE' },
  { room: 'Room 301', capacity: 50, mon: 'FREE', tue: 'BOOKED', wed: 'FREE', thu: 'FREE', fri: 'BOOKED' },
  { room: 'Lab 2', capacity: 40, mon: 'BOOKED', tue: 'FREE', wed: 'FREE', thu: 'BOOKED', fri: 'FREE' },
];

interface ConflictItem {
  id: string;
  type: 'critical' | 'warning';
  text: string;
}

const INITIAL_CONFLICTS: ConflictItem[] = [
  { id: 'cf-1', type: 'critical', text: 'Hall A double-booked on 10 Jul at 9:00 AM — resolve immediately' },
  { id: 'cf-2', type: 'warning', text: 'Dr. Omar Farid assigned to 2 exams on the same day' },
];

export const AdminExamSchedulingTab: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const { data: examsData, isLoading } = useAdminExams();
  const resolveConflict = useResolveConflict();
  const [exams, setExams] = useState<ExamItem[]>(INITIAL_EXAMS);
  const [conflicts, setConflicts] = useState<ConflictItem[]>(INITIAL_CONFLICTS);
  const ROOM_SCHEDULE = (examsData?.roomSchedule ?? []) as any[];

  useEffect(() => {
    if (examsData?.exams) setExams(examsData.exams);
    if (examsData?.conflicts) setConflicts(examsData.conflicts);
  }, [examsData]);
  
  // Modal for new exam
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamItem | null>(null);

  const [formCourse, setFormCourse] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDate, setFormDate] = useState('15 Jul 2024');
  const [formTime, setFormTime] = useState('9:00 AM');
  const [formRoom, setFormRoom] = useState('Hall A');
  const [formInvigilator, setFormInvigilator] = useState('Dr. Ahmed Dahy');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResolveConflict = (id: string) => {
    setConflicts((prev) => prev.filter((c) => c.id !== id));
    showToast('Conflict successfully resolved and schedule updated.');
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCourse || !formCode) return;

    if (editingExam) {
      setExams((prev) =>
        prev.map((item) =>
          item.id === editingExam.id
            ? {
                ...item,
                course: formCourse,
                code: formCode,
                date: formDate,
                time: formTime,
                room: formRoom,
                invigilator: formInvigilator,
                status: 'CONFIRMED',
              }
            : item
        )
      );
      showToast(`Updated examination schedule for ${formCode}.`);
    } else {
      const newExam: ExamItem = {
        id: `ex-${Date.now()}`,
        course: formCourse,
        code: formCode,
        date: formDate,
        time: formTime,
        room: formRoom,
        invigilator: formInvigilator,
        students: 50,
        status: 'CONFIRMED',
      };
      setExams([...exams, newExam]);
      showToast(`Scheduled new examination for ${formCode}.`);
    }

    setIsModalOpen(false);
    setEditingExam(null);
  };

  const openEdit = (exam: ExamItem) => {
    setEditingExam(exam);
    setFormCourse(exam.course);
    setFormCode(exam.code);
    setFormDate(exam.date);
    setFormTime(exam.time);
    setFormRoom(exam.room);
    setFormInvigilator(exam.invigilator);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingExam(null);
    setFormCourse('');
    setFormCode('');
    setFormDate('15 Jul 2024');
    setFormTime('9:00 AM');
    setFormRoom('Hall A');
    setFormInvigilator('Dr. Ahmed Dahy');
    setIsModalOpen(true);
  };

  const filteredExams = exams.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      e.course.toLowerCase().includes(q) ||
      e.code.toLowerCase().includes(q) ||
      e.room.toLowerCase().includes(q) ||
      e.invigilator.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading exam schedule...</div>;
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
        {/* Scheduled Exams */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Scheduled Exams
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">42</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                this semester
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Upcoming This Week */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Upcoming This Week
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">8</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700">
                high priority
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Rooms Booked */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Rooms Booked
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">18</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                capacity locked
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#3256a8] flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN LAYOUT: TWO COLUMNS (Left Wide, Right Narrow)     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column (col-span-8) — Exam Schedule Table */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Examination Schedule</h3>
                <p className="text-xs text-slate-400 mt-0.5">Invigilation roster, venues, and timings</p>
              </div>

              <button
                onClick={openNew}
                className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule New Exam</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Course</th>
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Time</th>
                    <th className="py-3 px-3">Room</th>
                    <th className="py-3 px-3">Invigilator</th>
                    <th className="py-3 px-3">Students</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredExams.map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900">{ex.course}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-600">{ex.code}</td>
                      <td className="py-3.5 px-3 text-slate-700 font-medium">{ex.date}</td>
                      <td className="py-3.5 px-3 text-slate-600">{ex.time}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">{ex.room}</td>
                      <td className="py-3.5 px-3 text-slate-700">{ex.invigilator}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">{ex.students}</td>
                      <td className="py-3.5 px-3">
                        {ex.status === 'CONFIRMED' ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wide">
                            CONFIRMED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => openEdit(ex)}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (col-span-4) — Two Stacked Cards */}
        <div className="lg:col-span-4 space-y-7">
          {/* Top Card: Room Availability */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Room Availability</h3>
              <p className="text-xs text-slate-400 mt-0.5">Booking status for current exam week</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-1.5">Room</th>
                    <th className="py-2.5 px-1.5">Cap.</th>
                    <th className="py-2.5 px-1">M</th>
                    <th className="py-2.5 px-1">T</th>
                    <th className="py-2.5 px-1">W</th>
                    <th className="py-2.5 px-1">T</th>
                    <th className="py-2.5 px-1">F</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {ROOM_SCHEDULE.map((r, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-1.5 font-bold text-slate-900">{r.room}</td>
                      <td className="py-2.5 px-1.5 text-slate-500">{r.capacity}</td>
                      {([r.mon, r.tue, r.wed, r.thu, r.fri] as const).map((day, dIdx) => (
                        <td key={dIdx} className="py-2.5 px-1">
                          {day === 'BOOKED' ? (
                            <span className="px-1 py-0.5 rounded-sm bg-red-100 text-red-700 text-[9px] font-bold">
                              BK
                            </span>
                          ) : (
                            <span className="px-1 py-0.5 rounded-sm bg-emerald-100 text-emerald-700 text-[9px] font-bold">
                              FR
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Booked
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Free
              </span>
            </div>
          </div>

          {/* Bottom Card: Conflict Detector */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#3256a8] flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Conflict Detector</h3>
                <p className="text-xs text-slate-400">Automated schedule integrity check</p>
              </div>
            </div>

            <div className="space-y-3">
              {conflicts.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No conflicts detected. All venues & proctors clear.</span>
                </div>
              ) : (
                conflicts.map((cf) => (
                  <div
                    key={cf.id}
                    className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between gap-3 ${
                      cf.type === 'critical'
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm shrink-0">{cf.type === 'critical' ? '🔴' : '🟡'}</span>
                      <span className="font-semibold leading-relaxed">{cf.text}</span>
                    </div>
                    <button
                      onClick={() => handleResolveConflict(cf.id)}
                      className="self-end px-3 py-1.5 bg-[#3256a8] hover:bg-[#284588] text-white font-bold rounded-xl text-xs transition-all shadow-2xs cursor-pointer"
                    >
                      Resolve
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MODAL: SCHEDULE OR EDIT EXAM                          */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-100 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingExam ? 'Edit Examination Slot' : 'Schedule New Examination'}
                </h3>
                <p className="text-xs text-slate-400">Configure exam room, timing, and proctor assignments</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Operating Systems"
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS-305"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-hidden focus:border-[#3256a8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="text"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Examination Hall / Room</label>
                  <select
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-[#3256a8]"
                  >
                    <option value="Hall A">Hall A (120 Seats)</option>
                    <option value="Hall B">Hall B (100 Seats)</option>
                    <option value="Hall C">Hall C (80 Seats)</option>
                    <option value="Room 301">Room 301 (50 Seats)</option>
                    <option value="Lab 2">Lab 2 (40 Seats)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Invigilator</label>
                  <select
                    value={formInvigilator}
                    onChange={(e) => setFormInvigilator(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-[#3256a8]"
                  >
                    <option value="Dr. Ahmed Dahy">Dr. Ahmed Dahy</option>
                    <option value="Dr. Sara Nour">Dr. Sara Nour</option>
                    <option value="Dr. Mostafa Hagras">Dr. Mostafa Hagras</option>
                    <option value="Dr. Omar Farid">Dr. Omar Farid</option>
                    <option value="Dr. Nour Hassan">Dr. Nour Hassan</option>
                    <option value="Dr. Youssef Samir">Dr. Youssef Samir</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3256a8] hover:bg-[#284588] text-white font-bold rounded-xl shadow-xs"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
