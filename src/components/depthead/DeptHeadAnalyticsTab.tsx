import React, { useState } from 'react';
import { useDeptHeadAnalytics } from '../../hooks/useDeptHeadData';
import {
  BarChart3,
  Calendar,
  Download,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Award,
  CheckCircle2,
  Flag,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Eye,
  FileText
} from 'lucide-react';

interface DeptHeadAnalyticsTabProps {
  onNavigateTab?: (tab: any) => void;
}

interface CourseSummaryRow {
  code: string;
  name: string;
  faculty: string;
  enrolled: number;
  avgGrade: string;
  passRate: string;
  passRateNum: number;
  attendance: string;
  change: string;
  changeIsPositive: boolean;
  status: 'ON TRACK' | 'WATCH' | 'CRITICAL';
  statusColor: 'green' | 'orange' | 'red';
}

const MOCK_ALL_18_CS_COURSES_RATES = [
  { code: 'CS-301', name: 'Data Struct', rate: 84 },
  { code: 'MATH-201', name: 'Math', rate: 71 },
  { code: 'CS-401', name: 'AI', rate: 90 },
  { code: 'CS-303', name: 'Networks', rate: 61 },
  { code: 'CS-402', name: 'Soft Eng', rate: 80 },
  { code: 'CS-302', name: 'Databases', rate: 77 },
  { code: 'CS-304', name: 'OS', rate: 73 },
  { code: 'CS-403', name: 'Algorithms', rate: 85 },
  { code: 'CS-101', name: 'Intro CS', rate: 89 },
  { code: 'CS-102', name: 'Prog II', rate: 82 },
  { code: 'CS-204', name: 'Discrete', rate: 64 },
  { code: 'CS-415', name: 'Cybersec', rate: 81 },
  { code: 'CS-420', name: 'Cloud', rate: 86 },
  { code: 'CS-425', name: 'Mobile', rate: 78 },
  { code: 'CS-430', name: 'Graphics', rate: 83 },
  { code: 'CS-440', name: 'Compiler', rate: 69 },
  { code: 'CS-490', name: 'Capstone I', rate: 94 },
  { code: 'CS-499', name: 'Capstone II', rate: 96 },
];

const MOCK_GPA_BANDS = [
  { band: '< 2.0', count: 18 },
  { band: '2.0-2.4', count: 96 },
  { band: '2.5-2.9', count: 215 },
  { band: '3.0-3.4', count: 382 },
  { band: '3.5-3.8', count: 198 },
  { band: '3.9-4.0', count: 37 },
];

const MOCK_SEMESTER_COMPARISON_DATA = [
  { name: 'AI', s1: 86, s2: 90 },
  { name: 'Algorithms', s1: 81, s2: 85 },
  { name: 'Data Struct', s1: 82, s2: 84 },
  { name: 'Software Eng', s1: 76, s2: 80 },
  { name: 'Databases', s1: 79, s2: 77 },
  { name: 'Networks', s1: 72, s2: 61 },
];

const MOCK_ACADEMIC_SUMMARY_ROWS: CourseSummaryRow[] = [
  {
    code: 'CS-301',
    name: 'Data Structures',
    faculty: 'Dr. Ahmed Dahy',
    enrolled: 187,
    avgGrade: '81/100',
    passRate: '84%',
    passRateNum: 84,
    attendance: '84%',
    change: '+2%',
    changeIsPositive: true,
    status: 'ON TRACK',
    statusColor: 'green',
  },
  {
    code: 'MATH-201',
    name: 'Mathematics',
    faculty: 'Dr. Sara Nour',
    enrolled: 134,
    avgGrade: '74/100',
    passRate: '71%',
    passRateNum: 71,
    attendance: '79%',
    change: '-3%',
    changeIsPositive: false,
    status: 'WATCH',
    statusColor: 'orange',
  },
  {
    code: 'CS-401',
    name: 'Artificial Intelligence',
    faculty: 'Dr. Mostafa Hagras',
    enrolled: 96,
    avgGrade: '88/100',
    passRate: '90%',
    passRateNum: 90,
    attendance: '91%',
    change: '+4%',
    changeIsPositive: true,
    status: 'ON TRACK',
    statusColor: 'green',
  },
  {
    code: 'CS-303',
    name: 'Networks',
    faculty: 'Dr. Omar Farid',
    enrolled: 201,
    avgGrade: '68/100',
    passRate: '61%',
    passRateNum: 61,
    attendance: '69%',
    change: '-11%',
    changeIsPositive: false,
    status: 'CRITICAL',
    statusColor: 'red',
  },
  {
    code: 'CS-402',
    name: 'Software Engineering',
    faculty: 'Dr. Ahmed Dahy',
    enrolled: 112,
    avgGrade: '79/100',
    passRate: '80%',
    passRateNum: 80,
    attendance: '86%',
    change: '+4%',
    changeIsPositive: true,
    status: 'ON TRACK',
    statusColor: 'green',
  },
  {
    code: 'CS-302',
    name: 'Databases',
    faculty: 'Dr. Youssef Samir',
    enrolled: 98,
    avgGrade: '76/100',
    passRate: '77%',
    passRateNum: 77,
    attendance: '81%',
    change: '-2%',
    changeIsPositive: false,
    status: 'ON TRACK',
    statusColor: 'green',
  },
  {
    code: 'CS-304',
    name: 'Operating Systems',
    faculty: 'Dr. Sara Nour',
    enrolled: 89,
    avgGrade: '72/100',
    passRate: '73%',
    passRateNum: 73,
    attendance: '77%',
    change: '-4%',
    changeIsPositive: false,
    status: 'WATCH',
    statusColor: 'orange',
  },
  {
    code: 'CS-403',
    name: 'Algorithms',
    faculty: 'Dr. Mostafa Hagras',
    enrolled: 76,
    avgGrade: '83/100',
    passRate: '85%',
    passRateNum: 85,
    attendance: '88%',
    change: '+4%',
    changeIsPositive: true,
    status: 'ON TRACK',
    statusColor: 'green',
  },
];

export const DeptHeadAnalyticsTab: React.FC<DeptHeadAnalyticsTabProps> = ({ onNavigateTab }) => {
  const [dateRange, setDateRange] = useState('This Semester');
  const [activeCategory, setActiveCategory] = useState<'Academic' | 'Attendance' | 'Faculty Performance'>('Academic');
  const [notification, setNotification] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  const { data, isLoading } = useDeptHeadAnalytics();
  const ALL_18_CS_COURSES_RATES = data?.coursePassRates ?? [];
  const GPA_BANDS = data?.gpaBands ?? [];
  const SEMESTER_COMPARISON_DATA = data?.semesterComparison ?? [];
  const ACADEMIC_SUMMARY_ROWS = (data?.academicSummary as CourseSummaryRow[]) ?? [];

  const handleExport = (format: 'PDF' | 'Excel') => {
    setNotification(`Department Analytics exported as ${format} successfully.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFlagReview = (courseName: string) => {
    setNotification(`${courseName} flagged for department curriculum review.`);
    setTimeout(() => setNotification(null), 3500);
  };

  if (isLoading) return <div className="p-8 text-center text-sm text-slate-500">Loading…</div>;

  return (
    <div className="space-y-7 relative">
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {notification}
        </div>
      )}

      {/* HEADER WITH DATE SELECTOR & TAB STRIP */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tab Strip with 3 categories */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl">
          {(['Academic', 'Attendance', 'Faculty Performance'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Date range selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3256a8] shadow-xs"
          >
            <option value="This Semester">This Semester (S2 2026)</option>
            <option value="Last Semester">Last Semester (S1 2026)</option>
            <option value="Last Year">Last Academic Year</option>
            <option value="Custom Range">Custom Date Range</option>
          </select>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 1. ACADEMIC VIEW (DEFAULT ACTIVE)                         */}
      {/* ======================================================== */}
      {activeCategory === 'Academic' && (
        <div className="space-y-7">
          {/* ROW 1: TWO CHARTS SIDE BY SIDE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Card (wider: 7 cols) - Bar chart: Pass Rate by Course (All 18 courses) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Academic Benchmark
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      Course Pass Rates — Semester 2 (All 18 Courses)
                    </h3>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> &gt;75%
                    </span>
                    <span className="flex items-center gap-1 text-amber-700">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> 65–75%
                    </span>
                    <span className="flex items-center gap-1 text-rose-700">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> &lt;65%
                    </span>
                  </div>
                </div>

                {/* Vertical Bar Chart (SVG or flex bars) */}
                <div className="h-44 pt-4 flex items-end justify-between gap-1.5 border-b border-slate-100 pb-2">
                  {ALL_18_CS_COURSES_RATES.map((c: any) => {
                    const barColor =
                      c.rate >= 75
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : c.rate >= 65
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : 'bg-rose-500 hover:bg-rose-600';

                    return (
                      <div
                        key={c.code}
                        className="flex-1 flex flex-col items-center justify-end h-full group relative"
                      >
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-20">
                          {c.code}: {c.rate}%
                        </div>
                        <div
                          className={`w-full max-w-[16px] rounded-t-sm ${barColor} transition-all duration-500`}
                          style={{ height: `${c.rate}%` }}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono pt-1">
                  <span>CS-301</span>
                  <span>18 CS Courses (X-Axis)</span>
                  <span>CS-499</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400 mt-3">
                <span>CS Department Average: 76.4%</span>
                <span className="text-slate-600 font-semibold">15 on track · 3 need action</span>
              </div>
            </div>

            {/* Right Card (narrower: 5 cols) - GPA Distribution */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Student Cohort Metrics
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      GPA Distribution — CS Students
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">946 Enrolled</span>
                </div>

                {/* GPA Histogram */}
                <div className="h-44 pt-4 flex items-end justify-between gap-3 border-b border-slate-100 pb-2">
                  {GPA_BANDS.map((b: any) => {
                    const maxCount = 382;
                    const heightPercent = Math.round((b.count / maxCount) * 100);

                    return (
                      <div
                        key={b.band}
                        className="flex-1 flex flex-col items-center justify-end h-full group relative"
                      >
                        <span className="text-[9px] font-mono font-bold text-slate-600 mb-1">
                          {b.count}
                        </span>
                        <div
                          className="w-full rounded-t-md bg-[#3256a8] hover:bg-[#284588] transition-all duration-500"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[9px] font-bold text-slate-500 mt-1.5 whitespace-nowrap">
                          {b.band}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Two inline stats */}
              <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-600 mt-3">
                <div>
                  Highest GPA: <strong className="text-slate-900">3.8 / 4.0</strong>
                </div>
                <div>
                  Department Average: <strong className="text-[#3256a8]">3.2 / 4.0</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: THREE CARDS SIDE BY SIDE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Left Card: Semester Comparison (Top 6 courses S1 vs S2) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    Semester 1 vs Semester 2 Pass Rate
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-bold mb-3">
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#7fa1ea]" /> S1 (Light Blue)
                  </span>
                  <span className="flex items-center gap-1 text-slate-900">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#3256a8]" /> S2 (Dark Blue)
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {SEMESTER_COMPARISON_DATA.map((item: any) => (
                    <div key={item.name} className="text-xs space-y-1">
                      <div className="flex justify-between text-[11px] font-medium text-slate-700">
                        <span className="font-bold">{item.name}</span>
                        <span className="font-mono text-slate-500">
                          {item.s1}% → <strong>{item.s2}%</strong>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 h-2 bg-slate-50 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-[#7fa1ea] rounded-full"
                          style={{ width: `${item.s1}%` }}
                        />
                        <div
                          className="h-full bg-[#3256a8] rounded-full"
                          style={{ width: `${item.s2}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 text-[11px] text-slate-400 mt-3">
                Networks dropped 11% in S2
              </div>
            </div>

            {/* Center Card: Top Performing Courses */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">Top Performing Courses</h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Ranked
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mb-3">
                  Ranked by cohort average grade achievements:
                </p>

                <div className="space-y-2.5">
                  {[
                    { rank: 1, name: 'Artificial Intelligence', grade: '88%', code: 'CS-401' },
                    { rank: 2, name: 'Algorithms', grade: '83%', code: 'CS-403' },
                    { rank: 3, name: 'Data Structures', grade: '81%', code: 'CS-301' },
                    { rank: 4, name: 'Software Engineering', grade: '79%', code: 'CS-402' },
                    { rank: 5, name: 'Databases', grade: '76%', code: 'CS-302' },
                  ].map((c) => (
                    <div
                      key={c.code}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">
                          {c.rank}
                        </span>
                        <span className="font-bold text-slate-800">{c.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono font-bold text-[11px] border border-emerald-200">
                        {c.grade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 text-[11px] text-emerald-700 font-medium mt-3">
                All 5 exceed department benchmark
              </div>
            </div>

            {/* Right Card: Courses Needing Attention */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <h3 className="text-sm font-bold text-slate-900">Courses Needing Attention</h3>
                  </div>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                    3 Flagged
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mb-3">
                  Bottom courses by semester pass rate:
                </p>

                <div className="space-y-3">
                  {[
                    { rank: 1, name: 'Networks', rate: '61%', color: 'red', code: 'CS-303' },
                    { rank: 2, name: 'Mathematics', rate: '71%', color: 'orange', code: 'MATH-201' },
                    { rank: 3, name: 'Operating Systems', rate: '73%', color: 'orange', code: 'CS-304' },
                  ].map((c) => (
                    <div
                      key={c.code}
                      className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 flex flex-col gap-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {c.rank}. {c.name}
                        </span>
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                            c.color === 'red'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {c.rate}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFlagReview(c.name)}
                        className="w-full py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Flag className="w-3 h-3" />
                        Flag for Review
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 text-[11px] text-rose-600 font-medium mt-3">
                Action plan required before term end
              </div>
            </div>
          </div>

          {/* FULL-WIDTH DEPARTMENT ACADEMIC SUMMARY TABLE */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Department Academic Summary Table
                </h3>
                <p className="text-xs text-slate-400">
                  Detailed semester metrics across core instructional modules
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">8 Courses Evaluated</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-3 px-3">Course</th>
                    <th className="py-3 px-3">Faculty</th>
                    <th className="py-3 px-3">Enrolled</th>
                    <th className="py-3 px-3">Avg Grade</th>
                    <th className="py-3 px-3">Pass Rate</th>
                    <th className="py-3 px-3">Attendance</th>
                    <th className="py-3 px-3">Semester Change</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {ACADEMIC_SUMMARY_ROWS.map((row) => (
                    <tr key={row.code} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900">{row.name}</td>
                      <td className="py-3.5 px-3 text-slate-700">{row.faculty}</td>
                      <td className="py-3.5 px-3 font-mono text-slate-600">{row.enrolled}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        {row.avgGrade}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-black text-slate-900">
                        {row.passRate}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-700">{row.attendance}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-0.5 font-bold font-mono ${
                            row.changeIsPositive ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {row.changeIsPositive ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {row.change}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            row.statusColor === 'green'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : row.statusColor === 'orange'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* BOTTOM EXPORT BAR */}
          <section className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleExport('PDF')}
              className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-2xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export as PDF
            </button>
            <button
              type="button"
              onClick={() => handleExport('Excel')}
              className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-2xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export as Excel
            </button>
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-2xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate AI Report
            </button>
          </section>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ATTENDANCE VIEW                                       */}
      {/* ======================================================== */}
      {activeCategory === 'Attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Department Attendance Rate
              </span>
              <span className="text-3xl font-black text-slate-900 mt-2 block">82.4%</span>
              <p className="text-xs text-slate-500 mt-1">Across 34 active section meeting times</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Lecture Attendance
              </span>
              <span className="text-3xl font-black text-emerald-700 mt-2 block">86.1%</span>
              <p className="text-xs text-slate-500 mt-1">Daily QR Code scan verified</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Lab Practical Attendance
              </span>
              <span className="text-3xl font-black text-amber-600 mt-2 block">78.2%</span>
              <p className="text-xs text-slate-500 mt-1">Lower compliance in afternoon lab blocks</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Attendance Threshold Compliance
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Students falling below the mandatory 65% university attendance requirement receive automated warning notifications.
            </p>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                <span className="font-bold text-slate-800">&gt;85% High Compliance</span>
                <span className="font-mono text-emerald-700 font-bold">642 Students (67.8%)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                <span className="font-bold text-slate-800">70% – 84% Regular Attendance</span>
                <span className="font-mono text-[#3256a8] font-bold">263 Students (27.8%)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-rose-50 rounded-2xl border border-rose-100">
                <span className="font-bold text-rose-800">&lt;65% Critical Attendance Warning</span>
                <span className="font-mono text-rose-700 font-bold">41 Students (4.4%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. FACULTY PERFORMANCE VIEW                              */}
      {/* ======================================================== */}
      {activeCategory === 'Faculty Performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Syllabus Progress
              </span>
              <span className="text-3xl font-black text-slate-900 mt-2 block">94.2%</span>
              <p className="text-xs text-slate-500 mt-1">Paced on track for final exams</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Student Satisfaction Score
              </span>
              <span className="text-3xl font-black text-emerald-700 mt-2 block">4.6 / 5.0</span>
              <p className="text-xs text-slate-500 mt-1">Midterm student feedback surveys</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Grade Return Speed
              </span>
              <span className="text-3xl font-black text-[#3256a8] mt-2 block">3.8 days</span>
              <p className="text-xs text-slate-500 mt-1">Average turnaround for assignment grading</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Faculty Workload & Assessment Compliance
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All 24 faculty members are reviewed against maximum teaching load (16 hours/week) and timely midterm grade submission.
            </p>
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between">
              <div>
                <strong>Grade Submission Compliance:</strong> 100% of instructors submitted midterm assessments prior to deadline.
              </div>
              <span className="px-3 py-1 bg-white text-emerald-800 rounded-full font-bold text-[10px] border border-emerald-200">
                Audit Passed
              </span>
            </div>
          </div>
        </div>
      )}

      {/* AI REPORT GENERATION MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-100 shadow-2xl relative">
            <span className="text-[10px] font-bold text-[#3256a8] uppercase tracking-wider block">
              Campus AI Synthesis
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              CS Department Executive Brief
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Compiled automatically from live semester data for Department Head review.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-3 text-slate-700 leading-relaxed max-h-64 overflow-y-auto">
              <p>
                <strong>Executive Summary:</strong> The Department of Computer Science demonstrates strong overall academic health with an aggregate pass rate of 76.4% across 18 courses. Artificial Intelligence and Algorithms courses lead with pass rates of 90% and 85% respectively.
              </p>
              <p>
                <strong>Primary Area of Concern:</strong> Networks (CS-303) has experienced an 11% drop in pass rate (currently 61%) alongside attendance falling to 69%. With 201 enrolled students, intervention is recommended.
              </p>
              <p>
                <strong>Faculty & Workload:</strong> Teaching loads remain within policy (average 11.2 hours vs. 16 hours cap). RAG material coverage stands at 78% (14 of 18 courses indexed).
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAiModal(false);
                  handleExport('PDF');
                }}
                className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download Full Brief
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
