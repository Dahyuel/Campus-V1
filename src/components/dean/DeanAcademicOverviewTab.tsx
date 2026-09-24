import React, { useState } from 'react';
import {
  GraduationCap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  BookOpen,
  Filter,
  Eye,
  X,
  ArrowRight,
  Flag
} from 'lucide-react';

interface DeanAcademicOverviewTabProps {
  searchQuery?: string;
  onNavigateTab?: (tab: any) => void;
}

const DEPARTMENT_PASS_RATES = [
  { name: 'Medicine', passRate: 81, status: 'green' },
  { name: 'Arts & Humanities', passRate: 79, status: 'green' },
  { name: 'Computer Science', passRate: 76, status: 'green' },
  { name: 'Engineering', passRate: 74, status: 'orange' },
  { name: 'Business', passRate: 72, status: 'orange' },
  { name: 'Law', passRate: 58, status: 'red' },
];

const GPA_DISTRIBUTION = [
  { band: 'Below 1.0', count: 184, percentage: 4 },
  { band: '1.0–2.0', count: 580, percentage: 12 },
  { band: '2.0–3.0', count: 2150, percentage: 45 },
  { band: '3.0–4.0', count: 1907, percentage: 39 },
];

const AT_RISK_BREAKDOWN = [
  { dept: 'CS', count: 11, barColor: 'bg-amber-500', max: 15 },
  { dept: 'Engineering', count: 8, barColor: 'bg-amber-500', max: 15 },
  { dept: 'Law', count: 6, barColor: 'bg-rose-500', max: 15 },
  { dept: 'Business', count: 4, barColor: 'bg-emerald-500', max: 15 },
  { dept: 'Medicine', count: 4, barColor: 'bg-emerald-500', max: 15 },
];

const TOP_PERFORMING_COURSES = [
  { rank: '🥇', rankNum: 1, name: 'Advanced Medicine', dept: 'MED Dept', avg: '91%' },
  { rank: '🥈', rankNum: 2, name: 'AI Fundamentals', dept: 'CS Dept', avg: '88%' },
  { rank: '🥉', rankNum: 3, name: 'Business Strategy', dept: 'BUS Dept', avg: '86%' },
  { rank: '4', rankNum: 4, name: 'Corporate Law', dept: 'LAW Dept', avg: '84%' },
  { rank: '5', rankNum: 5, name: 'Data Structures', dept: 'CS Dept', avg: '82%' },
];

const COURSES_NEEDING_ATTENTION = [
  { id: 'c-1', name: 'Networks', dept: 'CS Dept', passRate: '61%', passRateNum: 61, badgeColor: 'red' },
  { id: 'c-2', name: 'Criminal Law', dept: 'LAW Dept', passRate: '63%', passRateNum: 63, badgeColor: 'red' },
  { id: 'c-3', name: 'Organic Chemistry', dept: 'MED Dept', passRate: '66%', passRateNum: 66, badgeColor: 'orange' },
  { id: 'c-4', name: 'Calculus II', dept: 'ENG Dept', passRate: '67%', passRateNum: 67, badgeColor: 'orange' },
  { id: 'c-5', name: 'Constitutional Law', dept: 'LAW Dept', passRate: '69%', passRateNum: 69, badgeColor: 'orange' },
];

const SEMESTER_COMPARISON = [
  { dept: 'Medicine', s1: 75, s2: 81, change: '+6%', isPositive: true },
  { dept: 'Arts & Humanities', s1: 77, s2: 79, change: '+2%', isPositive: true },
  { dept: 'Computer Science', s1: 78, s2: 76, change: '-2%', isPositive: false },
  { dept: 'Engineering', s1: 75, s2: 74, change: '-1%', isPositive: false },
  { dept: 'Business', s1: 76, s2: 72, change: '-4%', isPositive: false },
  { dept: 'Law', s1: 64, s2: 58, change: '-6%', isPositive: false },
];

export const DeanAcademicOverviewTab: React.FC<DeanAcademicOverviewTabProps> = ({
  searchQuery = '',
  onNavigateTab,
}) => {
  const [flaggedCourses, setFlaggedCourses] = useState<Record<string, boolean>>({});
  const [showAtRiskModal, setShowAtRiskModal] = useState(false);

  const toggleFlag = (id: string) => {
    setFlaggedCourses((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-7">
      {/* 1. TOP STAT CARDS (Row of 4) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* University GPA Average */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              University GPA Average
            </span>
            <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              no change
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">3.1</span>
            <span className="text-xs text-slate-400 font-medium">Scale of 4.0</span>
          </div>
        </div>

        {/* Overall Pass Rate */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Overall Pass Rate
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              <TrendingDown className="w-2.5 h-2.5" />
              -2% ↓
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-600 tracking-tight">74%</span>
            <span className="text-xs text-slate-400 font-medium">Target: &gt;75%</span>
          </div>
        </div>

        {/* At-Risk Students */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              At-Risk Students
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
              <AlertTriangle className="w-2.5 h-2.5" />
              action needed
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-rose-600 tracking-tight">27</span>
            <span className="text-xs text-slate-400 font-medium">Across 5 depts</span>
          </div>
        </div>

        {/* Total Active Courses */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Active Courses
            </span>
            <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              active
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">84</span>
            <span className="text-xs text-slate-400 font-medium">Semester 2 roster</span>
          </div>
        </div>
      </section>

      {/* 2. TOP SECTION: TWO CARDS SIDE BY SIDE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left card (wider: 7 cols) — Academic Performance by Department */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  University Benchmark
                </p>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  Pass Rate by Department — Semester 2
                </h3>
              </div>
              {/* Color legend */}
              <div className="flex items-center gap-2.5 text-[11px] font-semibold">
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> &gt;75%
                </span>
                <span className="flex items-center gap-1 text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> 65–75%
                </span>
                <span className="flex items-center gap-1 text-rose-700">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> &lt;65%
                </span>
              </div>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="space-y-4 pt-2">
              {DEPARTMENT_PASS_RATES.map((dept) => {
                const colorClass =
                  dept.passRate > 75
                    ? 'bg-emerald-500'
                    : dept.passRate >= 65
                    ? 'bg-amber-500'
                    : 'bg-rose-500';

                return (
                  <div key={dept.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{dept.name}</span>
                      <span className="font-mono font-extrabold text-slate-900">
                        {dept.passRate}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex items-center">
                      <div
                        className={`h-full ${colorClass} rounded-full transition-all duration-700`}
                        style={{ width: `${dept.passRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 mt-5">
            <span>Standard requirement: 65% minimum</span>
            <span className="font-medium text-slate-600">Updated today · Registrar verified</span>
          </div>
        </div>

        {/* Right card (narrower: 5 cols) — GPA Distribution University-Wide */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="mb-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Cohort Stratification
              </p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                GPA Distribution
              </h3>
            </div>

            {/* Vertical Bar Chart Representation */}
            <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
              {GPA_DISTRIBUTION.map((item) => (
                <div key={item.band} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[11px] font-bold text-slate-700">{item.percentage}%</span>
                  <div
                    className="w-full bg-[#3256a8] hover:bg-[#284588] rounded-t-xl transition-all duration-500 shadow-xs"
                    style={{ height: `${item.percentage * 2.8}%` }}
                    title={`${item.count} students`}
                  />
                  <span className="text-[10px] font-semibold text-slate-500 text-center leading-tight whitespace-nowrap">
                    {item.band}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 mt-4">
            <div className="flex items-center justify-between text-xs font-bold bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-slate-600">
                Highest Dept Avg: <span className="text-emerald-700 font-extrabold">Medicine 3.5</span>
              </span>
              <span className="text-slate-600">
                Lowest Dept Avg: <span className="text-rose-700 font-extrabold">Law 2.8</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BOTTOM SECTION: THREE CARDS SIDE BY SIDE */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* Left card — At-Risk Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                At-Risk Breakdown
              </h3>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                27 Total
              </span>
            </div>

            <div className="space-y-3.5">
              {AT_RISK_BREAKDOWN.map((item) => (
                <div key={item.dept} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.dept}</span>
                    <span className="font-semibold text-slate-600">
                      <span className="font-black text-slate-900">{item.count}</span> students
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${(item.count / 15) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAtRiskModal(true)}
            className="w-full mt-5 py-2.5 px-4 bg-[#3256a8] hover:bg-[#284588] text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer text-center"
          >
            View All At-Risk
          </button>
        </div>

        {/* Center card — Top Performing Courses University-Wide */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Top Performing Courses
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Honor Roll
              </span>
            </div>

            <div className="space-y-2.5">
              {TOP_PERFORMING_COURSES.map((course) => (
                <div
                  key={course.name}
                  className="p-2.5 bg-slate-50/70 rounded-2xl border border-slate-100/90 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">{course.rank}</span>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 truncate block text-[11px]">
                        {course.name}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase">
                        {course.dept}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 bg-emerald-100/70 text-emerald-800 font-extrabold text-[11px] rounded-lg shrink-0">
                    {course.avg} avg
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center mt-3">
            Ranked by overall student cohort average grade
          </p>
        </div>

        {/* Right card — Courses Needing Attention */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Courses Needing Attention
              </h3>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                Action Req.
              </span>
            </div>

            <div className="space-y-2.5">
              {COURSES_NEEDING_ATTENTION.map((c, idx) => {
                const isFlagged = flaggedCourses[c.id];
                return (
                  <div
                    key={c.id}
                    className="p-2.5 bg-slate-50/70 rounded-2xl border border-slate-100/90 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-mono font-bold text-slate-400 w-3">
                        {idx + 1}.
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 truncate block text-[11px]">
                          {c.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-semibold text-slate-400">
                            {c.dept}
                          </span>
                          <span
                            className={`inline-flex items-center px-1.5 py-0.2 rounded-md font-bold text-[9px] ${
                              c.badgeColor === 'red'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {c.passRate} pass
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFlag(c.id)}
                      className={`px-2 py-1 rounded-xl text-[10px] font-bold border transition-colors shrink-0 cursor-pointer ${
                        isFlagged
                          ? 'bg-rose-600 border-rose-600 text-white'
                          : 'border-rose-300 hover:border-rose-400 text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      {isFlagged ? 'Flagged ✓' : 'Flag for Review'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center mt-3">
            Pass rate below or near the 65% minimum policy threshold
          </p>
        </div>
      </section>

      {/* 4. FULL-WIDTH "SEMESTER COMPARISON TABLE" */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Semester Comparison Table
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical performance trajectory between Semester 1 and Semester 2
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            6 Departments Audited
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Semester 1 Pass Rate</th>
                <th className="py-3 px-3">Semester 2 Pass Rate</th>
                <th className="py-3 px-3">Change</th>
                <th className="py-3 px-3 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {SEMESTER_COMPARISON.map((row) => (
                <tr key={row.dept} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-900">{row.dept}</td>
                  <td className="py-3.5 px-3 text-slate-600 font-mono font-bold">
                    {row.s1}%
                  </td>
                  <td className="py-3.5 px-3 text-slate-900 font-mono font-black">
                    {row.s2}%
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center font-bold font-mono px-2 py-0.5 rounded-full text-[11px] ${
                        row.isPositive
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                          : 'text-rose-700 bg-rose-50 border border-rose-100'
                      }`}
                    >
                      {row.change}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 font-bold text-xs ${
                        row.isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {row.isPositive ? (
                        <>
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Up</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>Down</span>
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* AT-RISK MODAL */}
      {showAtRiskModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  University-Wide At-Risk Roster (27 Students)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAtRiskModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Students identified by the Early Warning System triggered by attendance below 70%, failing midterm evaluations, or GPA drop.
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {[
                { name: 'Karim Mansour', dept: 'CS', reason: 'Missed 4 lectures & Quiz absent', severity: 'Critical' },
                { name: 'Layla Ezzat', dept: 'CS', reason: 'Midterm 38/100 & lab warning', severity: 'Critical' },
                { name: 'Sherif Badawy', dept: 'CS', reason: 'Failed assignment 1 & 2', severity: 'High' },
                { name: 'Youssef Galal', dept: 'Engineering', reason: 'Calculus II score 42%', severity: 'Critical' },
                { name: 'Nour El-Din', dept: 'Engineering', reason: 'Physics midterm absent', severity: 'High' },
                { name: 'Tarek Zaki', dept: 'Law', reason: 'Criminal Law attendance 55%', severity: 'Critical' },
                { name: 'Rania Fawzy', dept: 'Business', reason: 'Accounting midterm failed', severity: 'Moderate' },
              ].map((st, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{st.name}</span>
                      <span className="text-[10px] font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                        {st.dept}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">{st.reason}</span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      st.severity === 'Critical'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {st.severity}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAtRiskModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Close Roster
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAtRiskModal(false);
                  if (onNavigateTab) onNavigateTab('departments');
                }}
                className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold"
              >
                Notify Department Chairs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
