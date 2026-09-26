import React, { useState } from 'react';
import {
  QrCode,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  UserX,
  X,
  Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { TeachingScheduleItem } from '../../data/mockData';
import {
  useFacultyDashboard,
  useCreateAttendanceSession,
  useCloseAttendanceSession,
} from '../../hooks/useFacultyData';

interface FacultyDashboardProps {
  searchQuery?: string;
  onNavigateTab?: (tabId: any) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  searchQuery = '',
  onNavigateTab
}) => {
  const { data: dashData, isLoading } = useFacultyDashboard();
  const FACULTY_SCHEDULE: TeachingScheduleItem[] = dashData?.schedule ?? [];
  const FACULTY_PENDING_ACTIONS = dashData?.pendingActions ?? [];
  const FACULTY_AT_RISK_STUDENTS = dashData?.atRiskStudents ?? [];
  const FACULTY_COMMUNITIES = dashData?.communities ?? [];
  const stats = dashData?.stats;
  const scheduleDay: string = dashData?.scheduleDay ?? '';
  const scheduleIsToday: boolean = dashData?.scheduleIsToday ?? true;

  const [activeQrCourse, setActiveQrCourse] = useState<TeachingScheduleItem | null>(null);
  const [qrSession, setQrSession] = useState<{ sessionId: string; qrToken: string; expiresAt: string } | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<string | null>(null);
  const createSession = useCreateAttendanceSession();
  const closeSession = useCloseAttendanceSession();

  const startAttendance = async (item: TeachingScheduleItem) => {
    setActiveQrCourse(item);
    setQrSession(null);
    setQrError(null);
    if (!item.courseId) {
      setQrError('This class has no course linked, so a session cannot be opened.');
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
      const result = await createSession.mutateAsync({
        courseId: item.courseId,
        lectureLabel: `${item.code} ${item.time}`.trim(),
        latitude,
        longitude,
        radiusMeters: 100,
      });
      setQrSession({ sessionId: result.sessionId, qrToken: result.qrToken, expiresAt: result.expiresAt });
    } catch {
      setQrError('Could not open an attendance session. Please try again.');
    }
  };

  const closeQrModal = () => {
    setActiveQrCourse(null);
    setQrSession(null);
    setQrError(null);
    setEndError(null);
  };

  const endQrSession = async () => {
    if (!qrSession) return;
    setEndError(null);
    try {
      await closeSession.mutateAsync(qrSession.sessionId);
      closeQrModal();
    } catch {
      setEndError('Could not end the session. Try again, or end it from the Attendance tab.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#3256a8] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredSchedule = FACULTY_SCHEDULE.filter((item) => {
    if (!normalizedQuery) return true;
    return (
      item.courseName.toLowerCase().includes(normalizedQuery) ||
      item.code.toLowerCase().includes(normalizedQuery) ||
      item.room.toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <div className="space-y-7">
      {/* ======================================================== */}
      {/* 1. TOP SECTION: Teaching Schedule Horizontal Timeline   */}
      {/* ======================================================== */}
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Teaching Command Center
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
              {scheduleIsToday ? "Today's Teaching Schedule" : `Next Teaching Day — ${scheduleDay}`}
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100/60 rounded-full text-xs font-semibold text-[#3256a8]">
            <span className="w-2 h-2 rounded-full bg-[#3256a8] animate-pulse"></span>
            Live Semester Schedule
          </span>
        </div>

        {FACULTY_SCHEDULE.length === 0 && (
          <p className="text-xs text-slate-500 py-6 text-center">
            No lectures are scheduled for your courses yet.
          </p>
        )}

        {/* Horizontal Timeline Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredSchedule.map((item) => {
            const isCurrent = item.status === 'In Progress';
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative ${
                  isCurrent
                    ? 'bg-blue-50/40 border-blue-200/80 shadow-xs'
                    : 'bg-slate-50/60 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white rounded-md text-slate-700 border border-slate-200/60">
                      {item.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        item.status === 'Completed'
                          ? 'text-emerald-700 bg-emerald-100/70'
                          : item.status === 'In Progress'
                          ? 'text-[#3256a8] bg-blue-100/80'
                          : 'text-slate-500 bg-slate-200/70'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                    {item.courseName}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.studentsCount} Enrolled Students</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => startAttendance(item)}
                    className="w-full py-2 px-3 bg-[#3256a8] hover:bg-[#2c4c96] active:scale-[0.98] text-white font-bold text-xs rounded-xl transition-all shadow-[0_2px_8px_0_rgba(50,86,168,0.25)] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Start Attendance</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. TODAY AT A GLANCE: 4 Small Summary Cards              */}
      {/* ======================================================== */}
      <section aria-label="Today at a Glance" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Courses',
            value: stats ? String(stats.activeCourses) : '—',
            note: 'this semester',
            noteClass: 'text-slate-500 bg-slate-100',
          },
          {
            label: 'Total Students',
            value: stats ? String(stats.totalStudents) : '—',
            note: stats ? `across ${stats.activeCourses} course${stats.activeCourses === 1 ? '' : 's'}` : '',
            noteClass: 'text-slate-500 bg-slate-100',
          },
          {
            label: 'Pending Grades',
            value: stats ? String(stats.pendingGrades) : '—',
            note: stats && stats.pendingGrades > 0 ? 'action needed' : 'all caught up',
            noteClass:
              stats && stats.pendingGrades > 0
                ? 'text-rose-600 bg-rose-50'
                : 'text-emerald-600 bg-emerald-50',
          },
          {
            label: 'Avg. Attendance Rate',
            value: stats?.avgAttendance === null || stats === undefined ? '—' : `${stats.avgAttendance}%`,
            note:
              stats?.avgAttendance === null || stats === undefined
                ? 'no data yet'
                : stats.avgAttendance >= 75
                ? 'above 75% threshold'
                : 'below 75% threshold',
            noteClass:
              stats?.avgAttendance !== null && stats !== undefined && stats.avgAttendance >= 75
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-amber-600 bg-amber-50',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between"
          >
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{card.value}</span>
                {card.note && (
                  <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${card.noteClass}`}>
                    {card.note}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ======================================================== */}
      {/* 3. THREE COLUMNS LAYOUT                                  */}
      {/* ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left column — My Courses Today (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {scheduleIsToday ? 'My Courses Today' : `My Courses — ${scheduleDay}`}
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                {FACULTY_SCHEDULE.length} session{FACULTY_SCHEDULE.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="space-y-3">
              {FACULTY_SCHEDULE.map((course) => (
                <div
                  key={course.id}
                  className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all bg-slate-50/40"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{course.courseName}</h4>
                      <p className="text-[11px] text-slate-500">Sec 01 · {course.room}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                        course.status === 'Completed'
                          ? 'text-emerald-700 bg-emerald-100/70'
                          : course.status === 'In Progress'
                          ? 'text-[#3256a8] bg-blue-100/70'
                          : 'text-slate-600 bg-slate-200/60'
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 border-t border-slate-200/60 mt-2">
                    <span className="font-medium text-slate-700">{course.time}</span>
                    <span>{course.studentsCount} Students</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 mt-4">
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('courses')}
              className="text-xs font-semibold text-[#3256a8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage all curriculum courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center column — Pending Actions (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Pending Actions</h3>
              <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                {FACULTY_PENDING_ACTIONS.length} to do
              </span>
            </div>

            <div className="space-y-3">
              {FACULTY_PENDING_ACTIONS.length === 0 && (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Nothing pending — grades are entered and reviews are done.
                </p>
              )}
              {FACULTY_PENDING_ACTIONS.map((action: any) => (
                <div
                  key={action.id}
                  className="p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 bg-white border-slate-100 hover:border-slate-200"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${action.color}`} />
                    <p className="text-xs font-medium leading-snug text-slate-800">{action.text}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => action.targetTab && onNavigateTab && onNavigateTab(action.targetTab)}
                    className="py-1.5 px-3 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer bg-[#3256a8] hover:bg-[#2c4c96] text-white shadow-xs"
                  >
                    {action.actionText ?? 'Do Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 mt-4">
            <span className="text-[11px] text-slate-400">
              Synced with Faculty Academic Planner
            </span>
          </div>
        </div>

        {/* Right column — At-Risk Alert (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900">At-Risk Alert</h3>
              </div>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                4 Flagged
              </span>
            </div>

            <div className="space-y-3">
              {FACULTY_AT_RISK_STUDENTS.map((st: any) => (
                <div
                  key={st.id}
                  className="p-3 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900">{st.name}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        st.riskLevel === 'Critical'
                          ? 'text-rose-700 bg-rose-100'
                          : st.riskLevel === 'High'
                          ? 'text-amber-700 bg-amber-100'
                          : 'text-orange-700 bg-orange-100'
                      }`}
                    >
                      {st.riskLevel}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{st.course}</span> · {st.signal}
                  </p>

                  <div className="pt-2 mt-1.5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentProfile(st.name)}
                      className="text-[11px] font-bold text-[#3256a8] hover:underline cursor-pointer"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 mt-4">
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('my-students')}
              className="w-full py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all text-center cursor-pointer"
            >
              View All At-Risk Students
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. BOTTOM FULL-WIDTH: Recent Community Activity         */}
      {/* ======================================================== */}
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#3256a8]" />
            <h3 className="text-base font-bold text-slate-900">Recent Community Activity</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">One card per active course</span>
        </div>

        {/* Horizontal scrollable row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto pb-1">
          {FACULTY_COMMUNITIES.map((comm: any) => (
            <div
              key={comm.id}
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{comm.course}</h4>
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 rounded-full shrink-0">
                    +{comm.newPosts} new
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic bg-white p-2.5 rounded-xl border border-slate-100/80 mt-2">
                  "{comm.latestQuestion}"
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('course-community')}
                  className="w-full py-2 px-3 text-xs font-bold text-[#3256a8] hover:text-white bg-blue-50/80 hover:bg-[#3256a8] rounded-xl transition-all cursor-pointer text-center"
                >
                  View Community
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* INTERACTIVE QR ATTENDANCE MODAL                         */}
      {/* ======================================================== */}
      {activeQrCourse && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-slate-100 shadow-2xl relative text-center animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={closeQrModal}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              QR Attendance Active
            </span>

            <h3 className="text-base font-bold text-slate-900">{activeQrCourse.courseName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeQrCourse.code} · {activeQrCourse.room} · {activeQrCourse.time}
            </p>

            {/* Live QR for the session just opened */}
            <div className="my-5 p-4 bg-white rounded-2xl border-2 border-dashed border-[#3256a8]/30 flex flex-col items-center justify-center">
              {qrError ? (
                <p className="text-xs font-semibold text-rose-600 py-10">{qrError}</p>
              ) : qrSession ? (
                <>
                  <div className="w-44 h-44 bg-white p-2 rounded-2xl flex items-center justify-center">
                    <QRCodeSVG
                      value={`${window.location.origin}/?attend=${encodeURIComponent(qrSession.qrToken)}`}
                      size={256}
                      level="M"
                      fgColor="#0f172a"
                      className="w-full h-full"
                    />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-600 mt-2 break-all select-all px-2 text-center">
                    {qrSession.qrToken}
                  </span>
                </>
              ) : (
                <div className="w-44 h-44 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-[#3256a8] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Students scan this with their phone camera, or enter the token from their Home page. Hiding
              this window keeps the session open; you can still end it from the Attendance tab.
            </p>

            {endError && <p className="text-xs font-semibold text-rose-600 mb-3">{endError}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeQrModal}
                className="flex-1 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hide (keep open)
              </button>
              <button
                type="button"
                onClick={endQrSession}
                disabled={!qrSession || closeSession.isPending}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
              >
                {closeSession.isPending ? 'Ending…' : 'End Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Quick View Modal */}
      {selectedStudentProfile && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-slate-100 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setSelectedStudentProfile(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Student Risk Dossier
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedStudentProfile}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Faculty Academic Counseling Record</p>

            <div className="my-4 p-3.5 bg-slate-50 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-bold text-slate-800">Computer Science</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Term GPA:</span>
                <span className="font-bold text-rose-600">2.14 / 4.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Course Attendance:</span>
                <span className="font-bold text-rose-600">54% (Flagged)</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedStudentProfile(null)}
                className="flex-1 py-2 text-xs font-bold text-white bg-[#3256a8] hover:bg-[#2c4c96] rounded-xl cursor-pointer"
              >
                Send Direct Message
              </button>
              <button
                type="button"
                onClick={() => setSelectedStudentProfile(null)}
                className="py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
