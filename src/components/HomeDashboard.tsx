import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  pageVariants,
  listContainer,
  listItem,
  fadeIn,
  barGrow,
} from '../lib/motion';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Zap,
  Check,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { useStudentDashboard, useStudentSchedule } from '../hooks/useStudentData';
import { api } from '../lib/api';
import { GradeSubject } from '../types';

interface HomeDashboardProps {
  onOpenAITutor: () => void;
  searchQuery: string;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onOpenAITutor,
  searchQuery,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('DS');
  const reduce = useReducedMotion();
  const initial = reduce ? false : 'hidden';

  const { data: dashData, isLoading } = useStudentDashboard();
  const { data: scheduleData } = useStudentSchedule();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const liveClass = (scheduleData ?? []).find((item: { isLive?: boolean }) => item.isLive);

  const submitAttendance = async (token: string) => {
    let studentLat: number | undefined;
    let studentLng: number | undefined;
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        studentLat = pos.coords.latitude;
        studentLng = pos.coords.longitude;
      } catch {
        // continue without location
      }
    }
    try {
      await api.post('/student/attendance/scan', { qrToken: token, studentLat, studentLng });
      showToast('Attendance marked successfully!');
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to mark attendance.';
      showToast(msg);
    }
  };

  const handleScanAttendance = async () => {
    const token = window.prompt('Enter the QR token shown by your faculty:');
    if (!token) return;
    await submitAttendance(token.trim());
  };

  // Opened from a scanned attendance QR (token stashed in main.tsx)
  const pendingAttendHandled = useRef(false);
  useEffect(() => {
    if (pendingAttendHandled.current) return;
    pendingAttendHandled.current = true;
    let token: string | null = null;
    try {
      token = sessionStorage.getItem('pendingAttendToken');
      sessionStorage.removeItem('pendingAttendToken');
    } catch {
      return;
    }
    if (token) submitAttendance(token);
  }, []);

  const GRADE_SUBJECTS: GradeSubject[] = dashData?.gradeSubjects ?? [];
  const ACTIVITIES = dashData?.activities ?? [];
  const INVOICES = dashData?.invoices ?? [];

  // Filter activities and invoices if search query is entered
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredActivities = ACTIVITIES.filter((act: { title: string; subject?: string; code?: string }) => {
    if (!normalizedQuery) return true;
    return (
      act.title.toLowerCase().includes(normalizedQuery) ||
      (act.subject && act.subject.toLowerCase().includes(normalizedQuery)) ||
      (act.code && act.code.toLowerCase().includes(normalizedQuery))
    );
  });

  const filteredInvoices = INVOICES.filter((inv: { no: string; client: string; status: string }) => {
    if (!normalizedQuery) return true;
    return (
      inv.no.toLowerCase().includes(normalizedQuery) ||
      inv.client.toLowerCase().includes(normalizedQuery) ||
      inv.status.toLowerCase().includes(normalizedQuery)
    );
  });

  // Calculate dynamic bar height
  const getBarHeight = (score: number) => {
    // scale 0-100 to appropriate percentage
    const minHeight = 35;
    const maxHeight = 176;
    return Math.round(minHeight + (score / 100) * (maxHeight - minHeight));
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-[#3256a8]/20 border-t-[#3256a8] rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div
      variants={pageVariants}
      initial={initial}
      animate="visible"
      className="space-y-7"
    >
      {liveClass && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between">
          <div>
            <p className="font-medium text-rose-700 text-sm">Live Session: {liveClass.courseName | liveClass.courseCode}</p>
            <p className="text-xs text-rose-500">Tap to mark your attendance</p>
          </div>
          <button
            onClick={handleScanAttendance}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm rounded-lg font-medium transition-all"
          >
            Mark Attendance
          </button>
        </div>
      )}

      {toast && (
        <div className="p-3 bg-slate-900 text-white text-sm rounded-lg">{toast}</div>
      )}

      {/* BEGIN: StatCardsRow */}
      <section aria-label="Quick Performance Statistics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card 1: GPA */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between transition-all hover:border-slate-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current GPA</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">3.7</span>
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                +0.2 ↗
              </span>
            </div>
          </div>
        </div>

        {/* Stat Card 2: Enrolled Courses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between transition-all hover:border-slate-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Courses</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">6</span>
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Stat Card 3: Attendance Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between transition-all hover:border-slate-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-[#3256a8] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">89%</span>
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Good
              </span>
            </div>
          </div>
        </div>

        {/* Stat Card 4: Outstanding Fees */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between transition-all hover:border-slate-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tuition Due</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">$450</span>
              <span className="inline-flex items-center text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                Due 5d
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* END: StatCardsRow */}

      {/* BEGIN: MidSectionGrid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Grade Trend Bar Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between relative">
          {/* Chart Header */}
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grade Trend</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">84</span>
                <span className="text-sm font-semibold text-slate-400">/ 100 avg</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200/60 rounded-full text-xs font-semibold text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#3256a8]"></span> Current Term
              </span>
            </div>
          </div>

          {/* Vertical Bar Chart Visual */}
          <div className="flex-1 flex items-end justify-between px-2 sm:px-6 pt-12 pb-2 h-56">
            {GRADE_SUBJECTS.map((item: GradeSubject) => {
              const isSelected = selectedSubject === item.shortLabel;
              const barHeight = getBarHeight(item.score);

              return (
                <div
                  key={item.shortLabel}
                  onClick={() => setSelectedSubject(item.shortLabel)}
                  className="flex flex-col items-center gap-3 flex-1 relative group cursor-pointer"
                >
                  {/* Floating Dark Pill Tooltip if selected or hovered */}
                  {isSelected && (
                    <div className="absolute -top-11 z-10 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-[0_10px_25px_-5px_rgba(15,23,42,0.35)] whitespace-nowrap flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
                      <span>{item.score} / {item.maxScore}</span>
                      <div className="w-2 h-2 bg-slate-900 rotate-45 -mb-1 mt-0.5"></div>
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    style={{ height: `${barHeight}px` }}
                    className={`w-7 sm:w-11 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-[#3256a8] shadow-lg shadow-[#3256a8]/25 brightness-105'
                        : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  />
                  <span
                    className={`text-[11px] sm:text-xs transition-colors ${
                      isSelected ? 'font-bold text-slate-900' : 'font-medium text-slate-400 group-hover:text-slate-600'
                    }`}
                  >
                    {item.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Promo Announcement Card (4 cols) */}
        <div className="lg:col-span-4 bg-[#204498] promo-card-pattern text-white rounded-3xl p-7 shadow-[0_8px_30px_-4px_rgba(32,68,152,0.35)] flex flex-col justify-between relative overflow-hidden">
          {/* Graphic wave circles overlay */}
          <div className="absolute -right-10 -bottom-10 w-52 h-52 rounded-full bg-white/10 blur-md pointer-events-none"></div>
          <div className="absolute right-0 bottom-0 w-40 h-40 rounded-tl-[90px] bg-sky-400/25 pointer-events-none"></div>
          <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full bg-sky-300/20 pointer-events-none"></div>

          <div className="space-y-4 relative z-10">
            {/* NEW Badge */}
            <div>
              <span className="inline-block px-3 py-1 bg-white text-[#204498] text-xs font-extrabold rounded-full tracking-wider shadow-xs">
                NEW
              </span>
            </div>
            {/* Headline */}
            <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
              Your AI Tutor is now live!
            </h3>
            {/* Body Description */}
            <p className="text-blue-100/90 text-xs sm:text-sm font-normal leading-relaxed">
              Practice any concept from your course syllabus with your personalized AI Tutor — available 24/7.
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-6 relative z-10">
            <button
              type="button"
              onClick={onOpenAITutor}
              className="w-full py-3 px-5 bg-white hover:bg-blue-50 text-slate-900 font-bold rounded-2xl text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              Try AI Tutor
            </button>
          </div>
        </div>
      </section>
      {/* END: MidSectionGrid */}

      {/* BEGIN: BottomSplitGrid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Box: Activities Feed (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900">Activities</h3>
              {searchQuery && (
                <span className="text-xs text-slate-400 font-medium">
                  {filteredActivities.length} matching
                </span>
              )}
            </div>

            <motion.div
              variants={listContainer(0.09)}
              initial={initial}
              animate="visible"
              className="space-y-5"
            >
              {filteredActivities.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No activities match your search</p>
              ) : (
                filteredActivities.map((act: { id: string; type: string; title: string; subject?: string; code?: string; time: string }) => (
                  <motion.div key={act.id} variants={listItem} className="flex items-start gap-3.5">
                    {act.type === 'assignment' && (
                      <div className="w-9 h-9 rounded-full bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    )}
                    {act.type === 'invoice' && (
                      <div className="w-9 h-9 rounded-full bg-amber-100/70 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="w-4 h-4 fill-current" />
                      </div>
                    )}
                    {act.type === 'grade' && (
                      <div className="w-9 h-9 rounded-full bg-blue-100/70 text-[#3256a8] flex items-center justify-center shrink-0 mt-0.5">
                        <Zap className="w-4 h-4" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {act.type === 'assignment' && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                              Assignment Submitted
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 truncate">
                            {act.title} <span className="font-bold text-slate-900">{act.code}</span>
                          </p>
                        </>
                      )}

                      {act.type === 'invoice' && (
                        <p className="text-xs sm:text-sm text-slate-700 leading-snug">
                          Invoice <span className="font-bold text-slate-900">JL-3432B</span> reminder was sent to{' '}
                          <span className="font-bold text-slate-900">{act.subject}</span>
                        </p>
                      )}

                      {act.type === 'grade' && (
                        <p className="text-xs sm:text-sm text-slate-700 leading-snug">
                          {act.title} <span className="font-bold text-slate-900">{act.subject}</span>
                        </p>
                      )}

                      <span className="text-[11px] text-slate-400 font-medium block mt-0.5">{act.time}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>

          <div className="pt-4 border-t border-slate-50 mt-4">
            <button
              type="button"
              onClick={() => {}}
              className="text-xs font-semibold text-[#3256a8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all activities</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Box: Recent Invoices / Grades Table (7 cols) */}
        <motion.div
          variants={fadeIn}
          initial={initial}
          animate="visible"
          className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Recent Invoices</h3>
              <button
                type="button"
                className="text-xs font-medium text-slate-400 hover:text-slate-600"
              >
                See All
              </button>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-2 font-medium">No</th>
                    <th className="pb-3 px-2 font-medium">Date Created</th>
                    <th className="pb-3 px-2 font-medium">Client</th>
                    <th className="pb-3 px-2 font-medium">Amount</th>
                    <th className="pb-3 pl-2 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                        No invoices match your search
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv: { id: string; no: string; dateCreated: string; client: string; amount: string; status: string }) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 pr-2 font-semibold text-slate-800">{inv.no}</td>
                        <td className="py-3.5 px-2 text-slate-500">{inv.dateCreated}</td>
                        <td className="py-3.5 px-2 font-medium text-slate-800">{inv.client}</td>
                        <td className="py-3.5 px-2 font-bold text-slate-900">{inv.amount}</td>
                        <td className="py-3.5 pl-2 text-right">
                          <span
                            className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                              inv.status === 'PAID'
                                ? 'text-emerald-600 bg-emerald-50'
                                : 'text-rose-600 bg-rose-50'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Footer Brand Note */}
          <div className="pt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-50 mt-2">
            <span>One Campus. Every Mind.</span>
            <span>Nilebyte Systems</span>
          </div>
        </motion.div>
      </section>
      {/* END: BottomSplitGrid */}
    </motion.div>
  );
};
