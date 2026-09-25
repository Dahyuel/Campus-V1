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
  RefreshCw
} from 'lucide-react';
import { StudentAttendanceSummary } from '../../data/facultyMockData';
import {
  useFacultyCourses,
  useFacultyAttendanceSessions,
  useFacultyAttendanceSummary,
  useCreateAttendanceSession,
} from '../../hooks/useFacultyData';

export const FacultyAttendanceTab: React.FC = () => {
  // Top Section State - QR Attendance Session
  const { data: coursesData } = useFacultyCourses();
  const [activeCourseTab, setActiveCourseTab] = useState('Data Structures');
  const activeCourseId =
    coursesData?.find((c: { name: string; id: string }) => c.name === activeCourseTab || c.name.startsWith(activeCourseTab))?.id ?? null;
  const { data: sessionsData } = useFacultyAttendanceSessions(activeCourseId);
  const { data: summaryData } = useFacultyAttendanceSummary(activeCourseId);
  const createSession = useCreateAttendanceSession();

  const [selectedCourse, setSelectedCourse] = useState('Data Structures');
  const [selectedLecture, setSelectedLecture] = useState('Lecture 12');
  const [isQrActive, setIsQrActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState(527); // 8 minutes 47 seconds = 527 seconds
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manual mark modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [studentSummaries, setStudentSummaries] = useState<StudentAttendanceSummary[]>([]);
  const [manualStudentName, setManualStudentName] = useState('Sara Mahmoud');
  const [manualStatus, setManualStatus] = useState<'Present' | 'Excused'>('Present');

  useEffect(() => {
    if (summaryData) setStudentSummaries(summaryData);
  }, [summaryData]);

  const PAST_ATTENDANCE_SESSIONS = sessionsData ?? [];

  // Countdown timer effect
  useEffect(() => {
    if (!isQrActive || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isQrActive, timeLeft]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExtendTime = () => {
    setTimeLeft((prev) => prev + 300); // add 5 minutes
    showToast('Extended attendance session by 5 minutes');
  };

  const handleEndSession = () => {
    setIsQrActive(false);
    showToast('Attendance session concluded. Results synced.');
  };

  const handleRegenerateQr = async () => {
    if (!activeCourseId) return;
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
      await createSession.mutateAsync({ courseId: activeCourseId, lectureLabel: selectedLecture, latitude, longitude, radiusMeters: 100 });
      setIsQrActive(true);
      setTimeLeft(600);
      const geoMsg = latitude ? ' (Geofenced to 100m radius)' : ' (No geofencing - location unavailable)';
      showToast(`Generated fresh attendance QR token for ${selectedLecture}${geoMsg}`);
    } catch {
      showToast('Failed to generate QR. Please try again.');
    }
  };

  const handleManualMarkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentSummaries((prev) =>
      prev.map((s) => {
        if (s.name === manualStudentName) {
          const newPresent = s.present + 1;
          const newRate = Math.round((newPresent / (newPresent + s.absent)) * 100);
          return {
            ...s,
            present: newPresent,
            rate: newRate,
            status: newRate >= 75 ? 'GOOD' : 'WARNING',
          };
        }
        return s;
      })
    );
    setIsManualModalOpen(false);
    showToast(`Marked ${manualStudentName} as ${manualStatus}`);
  };

  const courseTabs = ['Data Structures', 'Mathematics', 'AI', 'Networks'];

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
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-xs focus:outline-hidden focus:border-[#3256a8] cursor-pointer"
            >
              <option value="Data Structures">Data Structures (CS-301)</option>
              <option value="Mathematics">Mathematics (MATH-201)</option>
              <option value="Artificial Intelligence">Artificial Intelligence (CS-401)</option>
              <option value="Networks">Networks (CS-303)</option>
            </select>

            <select
              value={selectedLecture}
              onChange={(e) => setSelectedLecture(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-xs focus:outline-hidden focus:border-[#3256a8] cursor-pointer"
            >
              <option value="Lecture 12">Lecture 12</option>
              <option value="Lecture 13">Lecture 13</option>
              <option value="Lecture 14">Lecture 14</option>
              <option value="Lab Section 06">Lab Section 06</option>
            </select>

            <button
              id="btn-generate-qr"
              onClick={handleRegenerateQr}
              className="px-5 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate QR Code</span>
            </button>
          </div>

          {/* Active Generated QR State */}
          {isQrActive ? (
            <div className="mt-7 flex flex-col items-center">
              {/* QR Code Container */}
              <div className="p-4 bg-white rounded-3xl border-2 border-[#3256a8]/30 shadow-lg inline-block relative">
                <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white p-2 rounded-2xl flex items-center justify-center">
                  {/* High visual quality scannable SVG QR representation */}
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full text-slate-900"
                    fill="currentColor"
                  >
                    {/* Corner Position Targets */}
                    <rect x="5" y="5" width="26" height="26" rx="4" fill="#3256a8" />
                    <rect x="9" y="9" width="18" height="18" fill="white" />
                    <rect x="13" y="13" width="10" height="10" fill="#3256a8" />

                    <rect x="69" y="5" width="26" height="26" rx="4" fill="#3256a8" />
                    <rect x="73" y="9" width="18" height="18" fill="white" />
                    <rect x="77" y="13" width="10" height="10" fill="#3256a8" />

                    <rect x="5" y="69" width="26" height="26" rx="4" fill="#3256a8" />
                    <rect x="9" y="73" width="18" height="18" fill="white" />
                    <rect x="13" y="77" width="10" height="10" fill="#3256a8" />

                    {/* QR Data Pattern Dots */}
                    <rect x="36" y="8" width="5" height="5" />
                    <rect x="45" y="8" width="5" height="5" />
                    <rect x="54" y="8" width="5" height="5" />
                    <rect x="36" y="17" width="5" height="5" />
                    <rect x="45" y="26" width="5" height="5" />
                    <rect x="54" y="26" width="5" height="5" />
                    <rect x="8" y="36" width="5" height="5" />
                    <rect x="17" y="36" width="5" height="5" />
                    <rect x="26" y="36" width="5" height="5" />
                    <rect x="36" y="36" width="6" height="6" fill="#3256a8" />
                    <rect x="46" y="36" width="8" height="8" />
                    <rect x="58" y="36" width="5" height="5" fill="#3256a8" />
                    <rect x="67" y="36" width="6" height="6" />
                    <rect x="77" y="36" width="5" height="5" />
                    <rect x="86" y="36" width="5" height="5" />

                    <rect x="8" y="46" width="5" height="5" />
                    <rect x="17" y="55" width="5" height="5" />
                    <rect x="26" y="46" width="5" height="5" />
                    <rect x="36" y="46" width="6" height="6" />
                    <rect x="46" y="48" width="8" height="8" fill="#3256a8" />
                    <rect x="58" y="46" width="5" height="5" />
                    <rect x="67" y="46" width="6" height="6" />
                    <rect x="77" y="55" width="5" height="5" />
                    <rect x="86" y="46" width="5" height="5" />

                    <rect x="36" y="58" width="5" height="5" />
                    <rect x="45" y="58" width="5" height="5" />
                    <rect x="54" y="58" width="5" height="5" />
                    <rect x="36" y="69" width="5" height="5" fill="#3256a8" />
                    <rect x="45" y="69" width="5" height="5" />
                    <rect x="54" y="78" width="5" height="5" />
                    <rect x="69" y="69" width="5" height="5" />
                    <rect x="78" y="69" width="5" height="5" />
                    <rect x="87" y="69" width="5" height="5" />
                    <rect x="69" y="78" width="5" height="5" />
                    <rect x="78" y="87" width="5" height="5" />
                    <rect x="87" y="78" width="5" height="5" fill="#3256a8" />
                  </svg>
                </div>
                <div className="absolute -top-2.5 -right-2.5 px-2.5 py-0.5 bg-emerald-500 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider shadow-xs">
                  Active
                </div>
              </div>

              {/* Live countdown */}
              <div className="mt-4 text-center">
                <div className="text-base font-bold text-slate-800">
                  Session expires in{' '}
                  <span className="font-mono text-[#3256a8] font-extrabold text-lg">
                    {formatCountdown(timeLeft)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-center">
                  <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <span>Geofenced — 100m radius active</span>
                  </div>
                </div>

                {/* Two small buttons: Extend Time & End Session */}
                <div className="flex items-center justify-center gap-2.5 mt-3">
                  <button
                    id="btn-extend-attendance-time"
                    onClick={handleExtendTime}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Extend Time
                  </button>
                  <button
                    id="btn-end-attendance-session"
                    onClick={handleEndSession}
                    className="px-3.5 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    End Session
                  </button>
                </div>

                {/* Note */}
                <p className="text-[11px] text-slate-500 mt-3 font-medium">
                  Students scan this QR from their phone browser — no app required.
                </p>
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
          {courseTabs.map((tab) => (
            <button
              key={tab}
              id={`tab-attendance-${tab.toLowerCase().replace(' ', '-')}`}
              onClick={() => setActiveCourseTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCourseTab === tab
                  ? 'bg-[#3256a8] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {tab}
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
                  onClick={() => setIsManualModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
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
                          <td className="py-3 px-3 font-bold text-slate-800">{s.rate}%</td>
                          <td className="py-3 px-3 text-right">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                s.status === 'GOOD'
                                  ? 'text-emerald-700 bg-emerald-100/70'
                                  : s.status === 'AT RISK'
                                  ? 'text-rose-700 bg-rose-100/70'
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
                  Select Student
                </label>
                <select
                  value={manualStudentName}
                  onChange={(e) => setManualStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                >
                  {studentSummaries.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attendance Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualStatus('Present')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      manualStatus === 'Present'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualStatus('Excused')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      manualStatus === 'Excused'
                        ? 'bg-blue-50 border-blue-300 text-[#3256a8]'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Excused
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
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
