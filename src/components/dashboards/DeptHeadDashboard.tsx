import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';
import { useDeptHeadDashboard } from '../../hooks/useDeptHeadData';

interface DeptHeadDashboardProps {
  searchQuery?: string;
  onNavigateTab?: (tabId: any) => void;
}

export const DeptHeadDashboard: React.FC<DeptHeadDashboardProps> = ({
  searchQuery = '',
  onNavigateTab
}) => {
  const [selectedFaculty, setSelectedFaculty] = useState<any | null>(null);
  const [showAllAtRisk, setShowAllAtRisk] = useState(false);

  const { data: dashData, isLoading } = useDeptHeadDashboard();

  const DEPT_COURSE_PERFORMANCE: any[] = dashData?.coursePerformance ?? [];
  const DEPT_FACULTY_LIST: any[] = dashData?.facultyList ?? [];
  const DEPT_AT_RISK_STUDENTS: any[] = dashData?.atRiskStudents ?? [];
  const DEPT_EVENTS: any[] = dashData?.events ?? [];

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCourses = DEPT_COURSE_PERFORMANCE.filter((c) => {
    if (!normalizedQuery) return true;
    return c.name.toLowerCase().includes(normalizedQuery) || c.code.toLowerCase().includes(normalizedQuery);
  });

  const filteredFaculty = DEPT_FACULTY_LIST.filter((f: any) => {
    if (!normalizedQuery) return true;
    return f.name.toLowerCase().includes(normalizedQuery);
  });

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading…</div>;
  }

  return (
    <div className="space-y-7">
      {/* ======================================================== */}
      {/* 1. TOP BANNER: Department Pulse (Unified Wide Banner)    */}
      {/* ======================================================== */}
      <section className="bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/80 rounded-3xl p-6 sm:p-7 border border-blue-100 shadow-[0_8px_30px_-4px_rgba(50,86,168,0.06)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs font-bold text-[#3256a8] uppercase tracking-wider block mb-1">
              Department Performance Headquarters · Computer Science
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Department Pulse
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Academic term Semester 2 · Real-time departmental metrics
            </p>
          </div>

          {/* 4 Inline Metrics in Large Text */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-white/85 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-blue-100/80 shadow-xs">
            {/* Metric 1 */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                Active Courses
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-slate-900 tracking-tight">18</span>
                <span className="text-xs font-bold text-slate-400">→</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                Students
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-slate-900 tracking-tight">946</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                Avg. Pass Rate
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-slate-900 tracking-tight">76%</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                At-Risk
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-rose-600 tracking-tight">11</span>
                <span className="text-xs font-bold text-rose-500 flex items-center">
                  <TrendingDown className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. TWO COLUMNS (Wider Course Performance & Faculty List) */}
      {/* ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left column (wider: 7 cols) — Course Performance Overview */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Academic Performance
                </p>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Pass Rate by Course — Semester 2
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3256a8]"></span>
                  &ge; 65% Target
                </span>
                <span className="flex items-center gap-1.5 text-rose-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                  &lt; 65% Alert
                </span>
              </div>
            </div>

            {/* Bar chart with red below 65% */}
            <div className="h-56 flex items-end justify-between gap-1.5 sm:gap-2 px-1 pb-2 border-b border-slate-100">
              {filteredCourses.map((c) => {
                const heightPx = Math.max(24, Math.round((c.passRate / 100) * 160));
                return (
                  <div key={c.code} className="flex flex-col items-center gap-2 flex-1 relative group">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 z-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow pointer-events-none whitespace-nowrap">
                      {c.name}: {c.passRate}%
                    </div>

                    <div
                      style={{ height: `${heightPx}px` }}
                      className={`w-full rounded-t-lg transition-all ${
                        c.belowThreshold
                          ? 'bg-rose-500 shadow-sm shadow-rose-500/30 hover:bg-rose-600'
                          : 'bg-[#3256a8] hover:bg-[#28468d]'
                      }`}
                    />
                    <span className="text-[10px] font-mono text-slate-500 truncate max-w-[36px] text-center">
                      {c.code.replace('CS-', '')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Note below chart */}
            <p className="mt-4 text-xs font-semibold text-rose-600 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>3 courses below the 65% threshold</span>
            </p>
          </div>

          <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 mt-2">
            <span>Minimum academic accreditation pass threshold: 65%</span>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('courses')}
              className="text-[#3256a8] font-bold hover:underline cursor-pointer"
            >
              View Syllabus Metrics
            </button>
          </div>
        </div>

        {/* Right column (narrower: 5 cols) — Faculty Overview */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Instruction Team
                </p>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Faculty Overview</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {DEPT_FACULTY_LIST.length} Members
              </span>
            </div>

            {/* Scrollable vertical list */}
            <div className="space-y-3 max-h-[310px] overflow-y-auto pr-1">
              {filteredFaculty.map((fac) => (
                <div
                  key={fac.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{fac.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {fac.coursesCount} courses · {fac.studentsCount} students · Avg {fac.avgGrade}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        fac.status === 'green'
                          ? 'text-emerald-700 bg-emerald-100/70'
                          : fac.status === 'orange'
                          ? 'text-amber-700 bg-amber-100/70'
                          : 'text-rose-700 bg-rose-100/70'
                      }`}
                    >
                      {fac.passRate}% pass
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedFaculty(fac)}
                      className="text-xs font-bold text-[#3256a8] hover:underline cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 mt-3">
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('faculty-staff')}
              className="text-xs font-semibold text-[#3256a8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage faculty teaching loads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. SECOND ROW OF THREE CARDS SIDE BY SIDE                */}
      {/* ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left card — At-Risk Students (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">At-Risk Students</h3>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                11 in CS
              </span>
            </div>

            <div className="space-y-2.5">
              {DEPT_AT_RISK_STUDENTS.map((st) => (
                <div
                  key={st.id}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/40 text-xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{st.name}</span>
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                        st.risk === 'Critical'
                          ? 'text-rose-700 bg-rose-100'
                          : st.risk === 'High'
                          ? 'text-amber-700 bg-amber-100'
                          : 'text-orange-700 bg-orange-100'
                      }`}
                    >
                      {st.risk}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{st.course}:</span> {st.trigger}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 mt-4">
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('at-risk')}
              className="w-full py-2 px-3 text-xs font-bold text-white bg-[#3256a8] hover:bg-[#2c4c96] rounded-xl shadow-xs transition-all text-center cursor-pointer"
            >
              View All 11
            </button>
          </div>
        </div>

        {/* Center card — Upcoming Department Events (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#3256a8]" />
                <h3 className="text-base font-bold text-slate-900">Upcoming Department Events</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Next 7 days</span>
            </div>

            {/* Vertical timeline */}
            <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 pl-6">
              {DEPT_EVENTS.map((ev) => (
                <div key={ev.id} className="relative text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3256a8] absolute -left-6 top-1 border-2 border-white ring-2 ring-blue-100" />
                  <p className="font-bold text-slate-900 leading-snug">{ev.title}</p>
                  <span className="text-[11px] text-slate-500 font-medium">{ev.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 mt-4 text-[11px] text-slate-400">
            Synced with Dean's Academic Master Calendar
          </div>
        </div>

        {/* Right card — Community Pulse (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#3256a8]" />
                <h3 className="text-base font-bold text-slate-900">Community Pulse</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Stat rows */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-600">Total new posts this week</span>
                <span className="font-extrabold text-slate-900 text-sm">143</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-600">Questions answered by AI</span>
                <span className="font-extrabold text-[#3256a8] text-sm">89</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-600">Most active course</span>
                <span className="font-bold text-slate-800 text-xs">Data Structures (41)</span>
              </div>

              {/* Highlighted unanswered question */}
              <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl">
                <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block mb-1">
                  Needs Faculty Attention:
                </span>
                <p className="text-[11px] text-amber-900 italic line-clamp-2">
                  "CS-304: Can you provide clarification on subnet masking question #4?"
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 mt-4">
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('community')}
              className="w-full py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all text-center cursor-pointer"
            >
              View All Communities
            </button>
          </div>
        </div>
      </section>

      {/* Faculty Modal View */}
      {selectedFaculty && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-slate-100 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setSelectedFaculty(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-[#3256a8] uppercase tracking-wider">
              Faculty Load Report
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedFaculty.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Computer Science Department Member</p>

            <div className="my-4 p-3.5 bg-slate-50 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Courses:</span>
                <span className="font-bold text-slate-800">{selectedFaculty.coursesCount} active courses</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student Load:</span>
                <span className="font-bold text-slate-800">{selectedFaculty.studentsCount} students</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Average Grade Given:</span>
                <span className="font-bold text-[#3256a8]">{selectedFaculty.avgGrade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pass Rate:</span>
                <span className="font-bold text-emerald-600">{selectedFaculty.passRate}%</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedFaculty(null)}
              className="w-full py-2 text-xs font-bold text-white bg-[#3256a8] hover:bg-[#2c4c96] rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
