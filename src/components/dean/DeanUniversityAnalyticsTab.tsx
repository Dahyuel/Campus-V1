import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Users,
  Bot,
  DollarSign,
  X,
  Layers
} from 'lucide-react';

interface DeanUniversityAnalyticsTabProps {
  onNavigateTab?: (tab: any) => void;
}

type AnalyticsCategory = 'academic' | 'financial' | 'enrollment' | 'ai-usage';

const DEPARTMENTS_COMPREHENSIVE = [
  {
    dept: 'Medicine',
    students: 1203,
    faculty: 41,
    avgGpa: '3.5',
    passRate: '81%',
    passRateNum: 81,
    s1PassRate: 75,
    atRisk: 4,
    attendance: '92%',
    attendanceNum: 92,
    change: '+6%',
    isPositive: true,
    status: 'ON TRACK',
    statusColor: 'green',
  },
  {
    dept: 'Arts & Humanities',
    students: 612,
    faculty: 16,
    avgGpa: '3.3',
    passRate: '79%',
    passRateNum: 79,
    s1PassRate: 77,
    atRisk: 2,
    attendance: '88%',
    attendanceNum: 88,
    change: '+2%',
    isPositive: true,
    status: 'ON TRACK',
    statusColor: 'green',
  },
  {
    dept: 'Computer Science',
    students: 946,
    faculty: 24,
    avgGpa: '3.2',
    passRate: '76%',
    passRateNum: 76,
    s1PassRate: 78,
    atRisk: 11,
    attendance: '84%',
    attendanceNum: 84,
    change: '-2%',
    isPositive: false,
    status: 'WATCH',
    statusColor: 'orange',
  },
  {
    dept: 'Engineering',
    students: 1047,
    faculty: 31,
    avgGpa: '3.1',
    passRate: '74%',
    passRateNum: 74,
    s1PassRate: 75,
    atRisk: 8,
    attendance: '81%',
    attendanceNum: 81,
    change: '-1%',
    isPositive: false,
    status: 'WATCH',
    statusColor: 'orange',
  },
  {
    dept: 'Business',
    students: 891,
    faculty: 22,
    avgGpa: '3.0',
    passRate: '72%',
    passRateNum: 72,
    s1PassRate: 76,
    atRisk: 4,
    attendance: '76%',
    attendanceNum: 76,
    change: '-4%',
    isPositive: false,
    status: 'WATCH',
    statusColor: 'orange',
  },
  {
    dept: 'Law',
    students: 734,
    faculty: 18,
    avgGpa: '2.8',
    passRate: '58%',
    passRateNum: 58,
    s1PassRate: 64,
    atRisk: 6,
    attendance: '67%',
    attendanceNum: 67,
    change: '-6%',
    isPositive: false,
    status: 'CRITICAL',
    statusColor: 'red',
  },
];

const GPA_TIERS = [
  { label: 'Below 1.0', pct: 4, count: 184 },
  { label: '1.0–2.0', pct: 12, count: 580 },
  { label: '2.0–3.0', pct: 45, count: 2150 },
  { label: '3.0–4.0', pct: 39, count: 1907 },
];

const TOP_BOTTOM_COURSES = [
  { pair: '1', topName: 'Adv. Medicine', topRate: 91, bottomName: 'Networks', bottomRate: 61 },
  { pair: '2', topName: 'AI Fund.', topRate: 88, bottomName: 'Crim. Law', bottomRate: 63 },
  { pair: '3', topName: 'Bus. Strategy', topRate: 86, bottomName: 'Org. Chem', bottomRate: 66 },
  { pair: '4', topName: 'Corp. Law', topRate: 84, bottomName: 'Calc II', bottomRate: 67 },
  { pair: '5', topName: 'Data Struct.', topRate: 82, bottomName: 'Const. Law', bottomRate: 69 },
];

export const DeanUniversityAnalyticsTab: React.FC<DeanUniversityAnalyticsTabProps> = ({
  onNavigateTab,
}) => {
  const [dateRange, setDateRange] = useState('This Semester');
  const [activeCategory, setActiveCategory] = useState<AnalyticsCategory>('academic');
  const [showSemesterComparison, setShowSemesterComparison] = useState(true);
  const [showAIReportModal, setShowAIReportModal] = useState(false);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  const handleExport = (type: string) => {
    setExportNotification(`Generating ${type} report for ${dateRange}... Download initiated.`);
    setTimeout(() => setExportNotification(null), 3500);
  };

  return (
    <div className="space-y-7">
      {/* 1. TOP HEADER & DATE SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#3256a8] uppercase tracking-wider block">
            Executive Intelligence Core
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            University Analytics & Institutional Research
          </h2>
        </div>

        {/* Date Range Selector Dropdown */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-2xl px-3.5 py-2 shadow-xs focus:outline-none focus:border-[#3256a8]"
          >
            <option>This Semester</option>
            <option>Last Semester</option>
            <option>Last Year</option>
            <option>Custom Range</option>
          </select>
        </div>
      </div>

      {/* 2. CATEGORY TAB STRIP */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'academic', label: 'Academic Performance' },
          { id: 'financial', label: 'Financial Health' },
          { id: 'enrollment', label: 'Enrollment & Retention' },
          { id: 'ai-usage', label: 'AI & Platform Usage' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id as AnalyticsCategory)}
            className={`px-4 py-2 rounded-2xl whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-[#3256a8] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {exportNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {exportNotification}
        </div>
      )}

      {/* CATEGORY 1: ACADEMIC (Default Active) */}
      {activeCategory === 'academic' && (
        <div className="space-y-7">
          {/* ROW 1: TWO CHARTS SIDE BY SIDE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left: Bar Chart "Pass Rate by Department" with Semester Comparison */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Comparative Benchmark
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                      Pass Rate by Department
                    </h3>
                  </div>

                  {/* Semester comparison toggle */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-semibold text-[11px]">Compare S1 vs S2:</span>
                    <button
                      type="button"
                      onClick={() => setShowSemesterComparison(!showSemesterComparison)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        showSemesterComparison ? 'bg-[#3256a8]' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          showSemesterComparison ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-[11px] font-semibold mb-4 text-slate-600">
                  {showSemesterComparison && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-blue-300"></span> Semester 1
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#3256a8]"></span> Semester 2 (Current)
                  </span>
                </div>

                {/* Double Bar / Single Bar Chart */}
                <div className="space-y-3 pt-1">
                  {DEPARTMENTS_COMPREHENSIVE.map((dept) => (
                    <div key={dept.dept} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800">{dept.dept}</span>
                        <span className="font-mono text-slate-900">
                          {showSemesterComparison && (
                            <span className="text-slate-400 font-normal mr-2">S1: {dept.s1PassRate}%</span>
                          )}
                          S2: {dept.passRate}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {/* Semester 1 Bar */}
                        {showSemesterComparison && (
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-300 rounded-full transition-all duration-500"
                              style={{ width: `${dept.s1PassRate}%` }}
                            />
                          </div>
                        )}
                        {/* Semester 2 Bar */}
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#3256a8] rounded-full transition-all duration-500"
                            style={{ width: `${dept.passRateNum}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 mt-4">
                <span>Minimum university standard: 65%</span>
                <span className="text-emerald-600 font-bold">Medicine achieved +6% growth</span>
              </div>
            </div>

            {/* Right: Bar Chart "GPA Distribution University-Wide" */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Academic Curve
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                    GPA Distribution University-Wide
                  </h3>
                </div>

                <div className="h-44 flex items-end justify-between gap-3 pt-3 px-2">
                  {GPA_TIERS.map((tier) => (
                    <div key={tier.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[11px] font-bold text-slate-700">{tier.pct}%</span>
                      <div
                        className="w-full bg-[#3256a8] hover:bg-[#284588] rounded-t-xl transition-all duration-500 shadow-xs"
                        style={{ height: `${tier.pct * 2.8}%` }}
                      />
                      <span className="text-[10px] font-semibold text-slate-500 text-center leading-tight whitespace-nowrap">
                        {tier.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 mt-4">
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal uppercase">
                      Top Quartile
                    </span>
                    <span className="text-slate-900">3.0–4.0 (1,907 students)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal uppercase">
                      Intervention Pool
                    </span>
                    <span className="text-rose-600">&lt;2.0 (764 students)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: THREE CHARTS SIDE BY SIDE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {/* Left: Bar Chart "Attendance Rate by Department" */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Attendance Rate by Dept
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Audit</span>
                </div>

                <div className="space-y-3">
                  {DEPARTMENTS_COMPREHENSIVE.map((d) => {
                    const barColor =
                      d.attendanceNum >= 85
                        ? 'bg-emerald-500'
                        : d.attendanceNum >= 75
                        ? 'bg-amber-500'
                        : 'bg-rose-500';

                    return (
                      <div key={d.dept} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{d.dept}</span>
                          <span className="font-mono font-bold text-slate-700">{d.attendance}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColor} rounded-full transition-all duration-500`}
                            style={{ width: `${d.attendanceNum}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 text-[10px] text-slate-400 text-center mt-3">
                Minimum 75% attendance mandatory for exam entry
              </div>
            </div>

            {/* Center: Bar Chart "At-Risk Students by Department" */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    At-Risk Students by Dept
                  </h3>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                    27 Total
                  </span>
                </div>

                <div className="space-y-3">
                  {DEPARTMENTS_COMPREHENSIVE.map((d) => (
                    <div key={d.dept} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{d.dept}</span>
                        <span className="font-mono font-bold text-rose-700">{d.atRisk} students</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${(d.atRisk / 12) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 text-[10px] text-slate-400 text-center mt-3">
                Early Intervention alerts dispatched to academic advisers
              </div>
            </div>

            {/* Right: Bar Chart "Top 5 vs Bottom 5 Courses" */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Top 5 vs Bottom 5 Courses
                  </h3>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold">
                    <span className="text-emerald-700">Top (Green)</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-rose-700">Bottom (Red)</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {TOP_BOTTOM_COURSES.map((item) => (
                    <div
                      key={item.pair}
                      className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]"
                    >
                      {/* Top course */}
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="font-bold text-slate-800 truncate block">
                          {item.topName}
                        </span>
                        <span className="text-emerald-700 font-extrabold text-[10px]">
                          {item.topRate}%
                        </span>
                      </div>

                      <span className="text-slate-300 font-bold px-1.5">vs</span>

                      {/* Bottom course */}
                      <div className="flex items-center justify-end gap-1.5 min-w-0 flex-1 text-right">
                        <span className="font-bold text-slate-800 truncate block">
                          {item.bottomName}
                        </span>
                        <span className="text-rose-700 font-extrabold text-[10px]">
                          {item.bottomRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-50 text-[10px] text-slate-400 text-center mt-3">
                Course performance disparity index
              </div>
            </div>
          </div>

          {/* 3. FULL-WIDTH "UNIVERSITY ACADEMIC SUMMARY TABLE" */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  University Academic Summary Table
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Institutional departmental scorecard across all core academic criteria
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                6 Operating Faculties
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Students</th>
                    <th className="py-3 px-3">Faculty</th>
                    <th className="py-3 px-3">Avg GPA</th>
                    <th className="py-3 px-3">Pass Rate</th>
                    <th className="py-3 px-3">At-Risk</th>
                    <th className="py-3 px-3">Attendance Avg</th>
                    <th className="py-3 px-3">Semester Change</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {DEPARTMENTS_COMPREHENSIVE.map((d) => (
                    <tr key={d.dept} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900">{d.dept}</td>
                      <td className="py-3.5 px-3 text-slate-700 font-mono">
                        {d.students.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-mono">{d.faculty}</td>
                      <td className="py-3.5 px-3 font-black text-slate-900">{d.avgGpa}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{d.passRate}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`font-mono font-bold ${
                            d.atRisk > 5 ? 'text-rose-600' : 'text-slate-600'
                          }`}
                        >
                          {d.atRisk}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-700">{d.attendance}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center font-bold font-mono px-2 py-0.5 rounded-full text-[11px] ${
                            d.isPositive
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                              : 'text-rose-700 bg-rose-50 border border-rose-100'
                          }`}
                        >
                          {d.change}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            d.status === 'ON TRACK'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : d.status === 'WATCH'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* CATEGORY 2: FINANCIAL VIEW */}
      {activeCategory === 'financial' && (
        <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-5">
          <h3 className="text-base font-bold text-slate-900">Institutional Financial Run-Rate</h3>
          <p className="text-xs text-slate-500">
            Comprehensive breakdown of tuition receipts, lab fees, departmental budget execution, and outstanding arrears across all colleges.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-bold uppercase">Budget Allocation</span>
              <span className="text-2xl font-black text-slate-900">$2,400,000</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-bold uppercase">Tuition Collected</span>
              <span className="text-2xl font-black text-emerald-600">$1,200,000</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-bold uppercase">Research Grants</span>
              <span className="text-2xl font-black text-[#3256a8]">$580,000</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-bold uppercase">Arrears Rate</span>
              <span className="text-2xl font-black text-rose-600">8.2%</span>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 3: ENROLLMENT VIEW */}
      {activeCategory === 'enrollment' && (
        <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-5">
          <h3 className="text-base font-bold text-slate-900">Enrollment & Student Retention Curves</h3>
          <p className="text-xs text-slate-500">
            Total active headcount stands at 4,821 students with a 94.2% sophomore-to-junior retention rate.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-bold uppercase">Fall 2026 Inflow</span>
              <span className="text-2xl font-black text-slate-900">+1,420 Enrolled</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-bold uppercase">Graduation Rate</span>
              <span className="text-2xl font-black text-emerald-600">89.4%</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-bold uppercase">International Ratio</span>
              <span className="text-2xl font-black text-[#3256a8]">14.8%</span>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 4: AI USAGE */}
      {activeCategory === 'ai-usage' && (
        <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-5">
          <h3 className="text-base font-bold text-slate-900">Campus AI & Intelligent Assistant Metrics</h3>
          <p className="text-xs text-slate-500">
            Platform telemetry measuring AI Tutor interactions, automated early-warning detections, and exam scheduling conflict predictions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-bold uppercase">AI Queries Processed</span>
              <span className="text-2xl font-black text-[#3256a8]">42,810</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-bold uppercase">At-Risk Interventions</span>
              <span className="text-2xl font-black text-emerald-600">96.2% Accurate</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-bold uppercase">Hours Saved by Faculty</span>
              <span className="text-2xl font-black text-slate-900">1,240 hrs</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. BOTTOM "EXPORT" BAR */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">
            Export Institutional Analytics ({dateRange})
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleExport('PDF')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-rose-500" />
            Export as PDF
          </button>
          <button
            type="button"
            onClick={() => handleExport('Excel')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Export as Excel
          </button>
          <button
            type="button"
            onClick={() => setShowAIReportModal(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white rounded-2xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            Generate AI Narrative Report
          </button>
        </div>
      </div>

      {/* AI EXECUTIVE NARRATIVE REPORT MODAL */}
      {showAIReportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-slate-100 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#3256a8]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Executive AI Narrative Report
                  </h3>
                  <span className="text-xs text-slate-400">
                    Generated by Campus AI · Ready for Board Presentation
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAIReportModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-4 text-xs leading-relaxed text-slate-700 overflow-y-auto flex-1">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  1. Executive Summary & Institutional Health
                </h4>
                <p>
                  During Semester 2 of Academic Year 2026, the university maintained steady operations across its 18 faculties, serving 4,821 active students overseen by 312 faculty members. The university aggregate pass rate concluded at <strong>74%</strong> with a mean cumulative GPA of <strong>3.1 / 4.0</strong>.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  2. Departmental Performance Highlights
                </h4>
                <p>
                  The <strong>Faculty of Medicine</strong> led institutional outcomes with an <strong>81% pass rate</strong> (up 6% from Semester 1) and a faculty average GPA of 3.5. <strong>Arts & Humanities</strong> followed closely at 79%.
                </p>
                <p className="mt-1.5">
                  Conversely, the <strong>Faculty of Law</strong> recorded a pass rate of <strong>58%</strong>, representing a 6% decline below policy thresholds. Immediate recommendations include convening an academic curriculum audit and restructuring introductory procedural law modules.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  3. Early Warning & At-Risk Mitigations
                </h4>
                <p>
                  A total of <strong>27 students</strong> are flagged for mandatory academic advising, concentrated in Computer Science (11 students) and Engineering (8 students). Early tutoring interventions are currently deployed with an expected 80% recovery trajectory prior to final evaluations.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  4. Fiscal & Tuition Run-Rate
                </h4>
                <p>
                  Total revenue collected reached <strong>$1.2M</strong> against an initial mid-term expectation of $1.1M (+7% over budget). Bursar balances of $180k remain across 52 accounts with targeted outreach currently active.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">Word count: 320 · Certified by Dean</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAIReportModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleExport('AI Executive Brief');
                    setShowAIReportModal(false);
                  }}
                  className="px-5 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Download PDF Brief
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
