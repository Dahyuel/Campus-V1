import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  Download,
  AlertCircle,
  Plus,
  X,
  RefreshCw,
  Copy
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { StudentAttendanceSummary } from '../../data/facultyMockData';
import {
  useFacultyCourses,
  useFacultyAttendanceSessions,
  useFacultyAttendanceSummary,
  useCreateAttendanceSession,
  useExtendAttendanceSession,
  useCloseAttendanceSession,
  useMarkAttendanceManual,
} from '../../hooks/useFacultyData';

interface FacultyCourse {
  id: string;
  name: string;
  code: string;
}

interface ActiveSession {
  sessionId: string;
  qrToken: string;
  expiresAt: string;
  lectureLabel: string;
  courseName: string;
  geofenced: boolean;
}

type ManualStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED';

export const FacultyAttendanceTab: React.FC = () => {
  const { data: coursesData } = useFacultyCourses();
  const courses: FacultyCourse[] = coursesData ?? [];

  // Bottom section - records for the selected course tab
  const [selectedTabCourseId, setActiveCourseTab] = useState<string | null>(null);
  const tabCourse = courses.find((c) => c.id === selectedTabCourseId) ?? courses[0] ?? null;
  const activeCourseId = tabCourse?.id ?? null;
  const activeCourseTab = tabCourse?.name ?? '';
  const { data: sessionsData } = useFacultyAttendanceSessions(activeCourseId);
  const { data: summaryData } = useFacultyAttendanceSummary(activeCourseId);

  // Top section - QR session
  const createSession = useCreateAttendanceSession();
  const extendSession = useExtendAttendanceSession();
  const closeSession = useCloseAttendanceSession();
  const markManual = useMarkAttendanceManual();
  const [selectedCourseId, setSelectedCourse] = useState<string | null>(null);
  const qrCourse = courses.find((c) => c.id === selectedCourseId) ?? courses[0] ?? null;
  const [selectedLecture, setSelectedLecture] = useState('');
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manual mark modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualSessionId, setManualSessionId] = useState('');
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualStatus, setManualStatus] = useState<ManualStatus>('PRESENT');

  const studentSummaries: StudentAttendanceSummary[] = summaryData ?? [];
  const PAST_ATTENDANCE_SESSIONS = sessionsData ?? [];

  const timeLeft = activeSession
    ? Math.max(0, Math.round((new Date(activeSession.expiresAt).getTime() - now) / 1000))
    : 0;

  // Countdown tick while a session is open
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const checkInUrl = activeSession
    ? `${window.location.origin}/?attend=${encodeURIComponent(activeSession.qrToken)}`
    : '';

  const handleCopyToken = async () => {
    if (!activeSession) return;
    try {
      await navigator.clipboard.writeText(activeSession.qrToken);
      showToast('Check-in token copied');
    } catch {
      showToast('Could not copy — select the token manually');
    }
  };

  const handleExtendTime = async () => {
    if (!activeSession) return;
    try {
      const result = await extendSession.mutateAsync(activeSession.sessionId);
      setActiveSession({ ...activeSession, expiresAt: result.expiresAt });
      setNow(Date.now());
      showToast('Extended attendance session by 5 minutes');
    } catch {
      showToast('Failed to extend session.');
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    try {
      await closeSession.mutateAsync(activeSession.sessionId);
      setActiveSession(null);
      showToast('Attendance session closed. Students who did not check in were marked absent.');
    } catch {
      showToast('Failed to close session.');
    }
  };

  const handleRegenerateQr = async () => {
    if (!qrCourse) return;
    const lectureLabel = selectedLecture.trim();
    if (!lectureLabel) {
      showToast('Enter a lecture label first, e.g. "Lecture 12".');
      return;
    }
    let latitude: number | undefined;
    let longitude: number | undefined;
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch {
        // continue without geofencing
      }
    }
    try {
      const result = await createSession.mutateAsync({ courseId: qrCourse.id, lectureLabel, latitude, longitude, radiusMeters: 100 });
      setActiveSession({
        sessionId: result.sessionId,
        qrToken: result.qrToken,
        expiresAt: result.expiresAt,
        lectureLabel,
        courseName: qrCourse.name,
        geofenced: latitude !== undefined,
      });
      setNow(Date.now());
      setActiveCourseTab(qrCourse.id);
      const geoMsg = latitude !== undefined ? ' (Geofenced to 100m radius)' : ' (No geofencing - location unavailable)';
      showToast(`Attendance QR opened for ${lectureLabel}${geoMsg}`);
    } catch {
      showToast('Failed to generate QR. Please try again.');
    }
  };

  const openManualModal = () => {
    setManualSessionId(PAST_ATTENDANCE_SESSIONS[0]?.id ?? '');
    setManualStudentId(studentSummaries[0]?.id ?? '');
    setManualStatus('PRESENT');
    setIsManualModalOpen(true);
  };

  const handleManualMarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSessionId || !manualStudentId) return;
    const studentName = studentSummaries.find((s) => s.id === manualStudentId)?.name ?? 'student';
    try {
      await markManual.mutateAsync({ sessionId: manualSessionId, studentId: manualStudentId, status: manualStatus });
      setIsManualModalOpen(false);
      showToast(`Marked ${studentName} as ${manualStatus.toLowerCase()}`);
    } catch {
      showToast('Failed to update attendance.');
    }
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

      {/* ======================================================== */}
      {/* TOP SECTION — Start Attendance Card with Light Blue Tint */}
      {/* ======================================================== */}
      <section className="bg-blue-50/70 border border-blue-200/80 rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-bold text-[#3256a8] uppercase tracking-wider">
            Live Automated Check-In
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Start a New Attendance Session
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Generate a dynamic geofenced session token for instant classroom check-in
          </p>

          {/* Controls: Select Course, Select Lecture, Generate Button */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <select
              value={qrCourse?.id ?? ''}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={!!activeSession}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-xs focus:outline-hidden focus:border-[#3256a8] cursor-pointer disabled:opacity-60"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>

            <input
              type="text"
              value={selectedLecture}
              onChange={(e) => setSelectedLecture(e.target.value)}
              placeholder="Lecture label, e.g. Lecture 12"
              disabled={!!activeSession}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-xs focus:outline-hidden focus:border-[#3256a8] disabled:opacity-60"
            />

            <button
              id="btn-generate-qr"
              onClick={handleRegenerateQr}
              disabled={!!activeSession || createSession.isPending}
              className="px-5 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate QR Code</span>
            </button>
          </div>

          {/* Active Generated QR State */}
          {activeSession ? (
            <div className="mt-7 flex flex-col items-center">
              <p className="text-xs font-semibold text-slate-600 mb-3">
                {activeSession.courseName} · {activeSession.lectureLabel}
              </p>
              {/* QR Code Container */}
              <div className="p-4 bg-white rounded-3xl border-2 border-[#3256a8]/30 shadow-lg inline-block relative">
                <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white p-2 rounded-2xl flex items-center justify-center">
                  <QRCodeSVG
                    value={checkInUrl}
                    size={256}
                    level="M"
                    fgColor="#0f172a"
                    className={`w-full h-full ${timeLeft === 0 ? 'opacity-20' : ''}`}
                  />
                </div>
                <div
                  className={`absolute -top-2.5 -right-2.5 px-2.5 py-0.5 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider shadow-xs ${
                    timeLeft > 0 ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                >
                  {timeLeft > 0 ? 'Active' : 'Expired'}
                </div>
              </div>

              {/* Live countdown */}
              <div className="mt-4 text-center">
                <div className="text-base font-bold text-slate-800">
                  {timeLeft > 0 ? (
                    <>
                      Session expires in{' '}
                      <span className="font-mono text-[#3256a8] font-extrabold text-lg">
                        {formatCountdown(timeLeft)}
                      </span>
                    </>
                  ) : (
                    'QR expired — extend it or end the session'
                  )}
                </div>
                {activeSession.geofenced && (
                  <div className="mt-2 flex items-center justify-center">
                    <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <span>Geofenced — 100m radius active</span>
                    </div>
                  </div>
                )}

                {/* Two small buttons: Extend Time & End Session */}
                <div className="flex items-center justify-center gap-2.5 mt-3">
                  <button
                    id="btn-extend-attendance-time"
                    onClick={handleExtendTime}
                    disabled={extendSession.isPending}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    Extend Time
                  </button>
                  <button
                    id="btn-end-attendance-session"
                    onClick={handleEndSession}
                    disabled={closeSession.isPending}
                    className="px-3.5 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    End Session
                  </button>
                </div>

                {/* Note + manual token fallback */}
                <p className="text-[11px] text-slate-500 mt-3 font-medium">
                  Students scan this QR with their phone camera, or enter the token below from their Home page.
                </p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl">
                  <code className="text-[11px] font-mono text-slate-700 select-all break-all">{activeSession.qrToken}</code>
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="p-1 text-slate-400 hover:text-[#3256a8] cursor-pointer"
                    aria-label="Copy check-in token"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 py-6 bg-white/60 rounded-2xl border border-slate-200 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No active session running</p>
              <p className="text-xs text-slate-500 mt-0.5">Click "Generate QR Code" to open a live attendance window</p>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* BOTTOM SECTION — Attendance Records                      */}
      {/* ======================================================== */}
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        {/* Course Tab Strip */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4 mb-6">
          {courses.map((course) => (
            <button
              key={course.id}
              id={`tab-attendance-${course.code.toLowerCase()}`}
              onClick={() => setActiveCourseTab(course.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCourseId === course.id
                  ? 'bg-[#3256a8] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {course.name}
            </button>
          ))}
        </div>

        {/* Two Sub-Sections Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Session History */}
          <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Past Records
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight mt-0.5">
                    Session History: {activeCourseTab}
                  </h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Lecture No.</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Present</th>
                      <th className="py-2.5 px-3">Absent</th>
                      <th className="py-2.5 px-3">Rate</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 text-xs text-slate-700">
                    {PAST_ATTENDANCE_SESSIONS.map((sess: any) => (
                      <tr key={sess.id} className="hover:bg-white/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900">{sess.lectureNo}</td>
                        <td className="py-3 px-3 text-slate-500">{sess.date}</td>
                        <td className="py-3 px-3 font-semibold text-emerald-700">{sess.present}</td>
                        <td className="py-3 px-3 font-semibold text-rose-600">{sess.absent}</td>
                        <td className="py-3 px-3 font-bold text-slate-800">{sess.rate}%</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            id={`btn-view-details-${sess.id}`}
                            onClick={() => showToast(`Opened roster log for ${sess.lectureNo}`)}
                            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200/60">
              <button
                id="btn-export-attendance-report"
                onClick={() => showToast('Attendance report exported to CSV')}
                className="w-full py-2.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Attendance Report</span>
              </button>
            </div>
          </div>

          {/* Right — Student Attendance Summary */}
          <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Student Breakdown
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight mt-0.5">
                    Student Attendance Summary
                  </h3>
                </div>

                <button
                  id="btn-manual-mark-attendance"
                  onClick={openManualModal}
                  disabled={PAST_ATTENDANCE_SESSIONS.length === 0 || studentSummaries.length === 0}
                  title={PAST_ATTENDANCE_SESSIONS.length === 0 ? 'No sessions yet for this course' : undefined}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manual Mark</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Present</th>
                      <th className="py-2.5 px-3">Absent</th>
                      <th className="py-2.5 px-3">Rate</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 text-xs text-slate-700">
                    {studentSummaries.map((s) => {
                      const isAtRisk = s.status === 'AT RISK';
                      return (
                        <tr
                          key={s.id}
                          className={`transition-colors ${
                            isAtRisk ? 'bg-rose-50/60 hover:bg-rose-50/90' : 'hover:bg-white/80'
                          }`}
                        >
                          <td className="py-3 px-3 font-bold text-slate-900">{s.name}</td>
                          <td className="py-3 px-3 font-semibold text-emerald-700">{s.present}</td>
                          <td className="py-3 px-3 font-semibold text-rose-600">{s.absent}</td>
                          <td className="py-3 px-3 font-bold text-slate-800">{s.rate === null ? '—' : `${s.rate}%`}</td>
                          <td className="py-3 px-3 text-right">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                s.status === 'GOOD'
                                  ? 'text-emerald-700 bg-emerald-100/70'
                                  : s.status === 'AT RISK'
                                  ? 'text-rose-700 bg-rose-100/70'
                                  : s.status === 'NO RECORDS'
                                  ? 'text-slate-500 bg-slate-100'
                                  : 'text-amber-800 bg-amber-100/70'
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Required minimum attendance threshold: 75%</span>
              <span className="font-bold text-[#3256a8]">Live Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* Manual Mark Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Manual Attendance Override</h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualMarkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Session
                </label>
                <select
                  value={manualSessionId}
                  onChange={(e) => setManualSessionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                >
                  {PAST_ATTENDANCE_SESSIONS.map((session: { id: string; lectureNo: string; date: string }) => (
                    <option key={session.id} value={session.id}>
                      {session.lectureNo} — {session.date}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Student
                </label>
                <select
                  value={manualStudentId}
                  onChange={(e) => setManualStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                >
                  {studentSummaries.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attendance Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    ['PRESENT', 'Present', 'bg-emerald-50 border-emerald-300 text-emerald-700'],
                    ['ABSENT', 'Absent', 'bg-rose-50 border-rose-300 text-rose-700'],
                    ['EXCUSED', 'Excused', 'bg-blue-50 border-blue-300 text-[#3256a8]'],
                  ] as const).map(([value, label, activeClass]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setManualStatus(value)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        manualStatus === value ? activeClass : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={markManual.isPending}
                  className="flex-1 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Confirm Status
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
