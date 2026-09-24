import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  FileText,
  Download,
  Eye,
  AlertCircle,
  Users,
  DollarSign,
  GraduationCap,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2
} from 'lucide-react';
import { useDeanDashboard } from '../../hooks/useDeanData';

interface DeanDashboardProps {
  searchQuery?: string;
  onNavigateTab?: (tabId: any) => void;
}

export const DeanDashboard: React.FC<DeanDashboardProps> = ({
  searchQuery = '',
  onNavigateTab,
}) => {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  const { data: dashData } = useDeanDashboard();

  const DEAN_DEPARTMENT_PASS_RATES: any[] = dashData?.departmentPassRates ?? [];
  const DEAN_ALERTS: any[] = dashData?.alerts ?? [];
  const DEAN_ENROLLMENT_CURVE: any[] = dashData?.enrollmentCurve ?? [];
  const DEAN_HEADS_SUMMARY: any[] = dashData?.headsSummary ?? [];

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredSummary = DEAN_HEADS_SUMMARY.filter((row) => {
    if (!normalizedQuery) return true;
    return (
      row.department.toLowerCase().includes(normalizedQuery) ||
      row.head.toLowerCase().includes(normalizedQuery) ||
      row.status.toLowerCase().includes(normalizedQuery)
    );
  });

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div className="space-y-7">
      {/* ======================================================== */}
      {/* 1. TOP BANNER: University at a Glance                    */}
      {/* ======================================================== */}
      <section className="bg-gradient-to-r from-blue-50/80 via-white to-slate-50 rounded-3xl p-6 sm:p-7 border border-blue-100/70 shadow-[0_8px_30px_-4px_rgba(50,86,168,0.06)] relative overflow-hidden">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-[#3256a8] uppercase tracking-wider block">
                Executive Intelligence Briefing · Office of the Dean
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                University at a Glance
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-100 rounded-full text-xs font-semibold text-slate-600 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Academic Year 2026
            </span>
          </div>

          {/* 5 Metrics in a Single Row with Extra-Large Bold Numbers */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
            {/* Metric 1 */}
            <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-slate-100/90 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                Students
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                4,821
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  +143 vs LY ↑
                </span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-slate-100/90 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                Faculty
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                312
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  no change
                </span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-slate-100/90 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                Departments
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                18
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  all accredited
                </span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-slate-100/90 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                Pass Rate
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                74%
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  +2.1% ↑
                </span>
              </div>
            </div>

            {/* Metric 5 */}
            <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-slate-100/90 shadow-xs col-span-2 md:col-span-1">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                Revenue
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                $1.2M
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  +$84k vs budget
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. TOP SECTION: TWO CARDS SIDE BY SIDE                   */}
      {/* ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left card (wider: 7 cols) — Academic Performance by Department */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Academic Benchmark
                </p>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Department Pass Rates — Semester 2
                </h3>
              </div>
              {/* Color legend */}
              <div className="flex items-center gap-2.5 text-[11px] font-semibold">
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> &gt;75%
                </span>
                <span className="flex items-center gap-1 text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> 65-75%
                </span>
                <span className="flex items-center gap-1 text-rose-700">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> &lt;65%
                </span>
              </div>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="space-y-4 pt-2">
              {DEAN_DEPARTMENT_PASS_RATES.map((dept) => {
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

          <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 mt-4">
            <span>Minimum university standard: 65%</span>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('academic-overview')}
              className="text-[#3256a8] font-bold hover:underline cursor-pointer"
            >
              Academic Audit Reports
            </button>
          </div>
        </div>

        {/* Right card (narrower: 5 cols) — University Alerts */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900">University Alerts</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Intelligence Feed</span>
            </div>

            <div className="space-y-3">
              {DEAN_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                        alert.color === 'red'
                          ? 'bg-rose-500'
                          : alert.color === 'yellow'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <p className="font-medium text-slate-800 leading-snug">{alert.text}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedAlert(alert.text)}
                    className="text-xs font-bold text-[#3256a8] hover:underline shrink-0 cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 mt-3 text-[11px] text-slate-400">
            Real-time feed coordinated across 18 department deanships
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. MIDDLE SECTION: THREE CARDS SIDE BY SIDE              */}
      {/* ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left card — Enrollment Trend (Line chart: 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Growth Pattern
                </p>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Enrollment Growth</h3>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                +17.5%
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">Total university enrollment over 6 semesters</p>

            {/* Clean SVG Line Chart */}
            <div className="h-36 w-full pt-2">
              <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="deanLineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3256a8" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3256a8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Shaded Area under curve */}
                <path
                  d="M 10 100 Q 60 85, 110 65 T 210 35 T 290 15 L 290 115 L 10 115 Z"
                  fill="url(#deanLineGrad)"
                />

                {/* Line Curve */}
                <path
                  d="M 10 100 Q 60 85, 110 65 T 210 35 T 290 15"
                  fill="none"
                  stroke="#3256a8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Highlight Dot on End */}
                <circle cx="290" cy="15" r="5" fill="#3256a8" stroke="#ffffff" strokeWidth="2.5" />
              </svg>

              <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-2">
                <span>S1 2024 (4,100)</span>
                <span>S2 2025</span>
                <span className="font-bold text-slate-900">S2 2026 (4,821)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 text-[11px] text-slate-400 mt-2">
            Steady upward admission slope
          </div>
        </div>

        {/* Center card — Revenue Snapshot (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Cash Flow
                </p>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Revenue Snapshot</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">Term 2</span>
            </div>

            {/* Three stacked progress bars */}
            <div className="space-y-4 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Fees Collected: $1.2M / $1.8M</span>
                  <span className="font-bold text-[#3256a8]">67%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3256a8] rounded-full" style={{ width: '67%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Scholarships Disbursed: $340k</span>
                  <span className="font-bold text-[#3256a8]">19%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3b66cf] rounded-full" style={{ width: '19%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Outstanding: $180k</span>
                  <span className="font-bold text-rose-600">10%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Target closure date: 31 July 2026</span>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('financial-overview')}
              className="text-[#3256a8] font-bold hover:underline cursor-pointer"
            >
              Financial Overview →
            </button>
          </div>
        </div>

        {/* Right card — Semester 2 Report (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#3256a8] flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-snug">
              Semester 2 Academic Report
            </h3>
            <p className="text-[11px] font-semibold text-[#3256a8] mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Generated by Campus AI · Ready for Review
            </p>

            <p className="text-xs text-slate-500 leading-relaxed mt-3">
              Comprehensive performance synthesis of 18 departments, cross-faculty evaluations, and
              accreditation milestone status.
            </p>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-50">
            {exportNotice && (
              <div className="mb-2 p-2 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-lg text-center animate-in fade-in">
                ✓ PDF Report downloaded successfully
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReportPreview(true)}
                className="flex-1 py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab ? onNavigateTab('reports') : handleExport()}
                className="flex-1 py-2 px-3 text-xs font-bold text-white bg-[#3256a8] hover:bg-[#2c4c96] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Reports Tab</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. BOTTOM SECTION: Department Heads Summary Table        */}
      {/* ======================================================== */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Leadership Oversight
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Department Heads Summary Table
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">
              {DEAN_HEADS_SUMMARY.length} Primary Faculties
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('departments')}
              className="text-xs font-bold text-[#3256a8] hover:underline cursor-pointer"
            >
              View All Departments →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-medium">Department</th>
                <th className="pb-3 font-medium">Head</th>
                <th className="pb-3 text-right font-medium">Students</th>
                <th className="pb-3 text-right font-medium">Faculty</th>
                <th className="pb-3 text-right font-medium">Avg. GPA</th>
                <th className="pb-3 text-right font-medium">Pass Rate</th>
                <th className="pb-3 text-right font-medium">At-Risk</th>
                <th className="pb-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSummary.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 font-bold text-slate-900">{row.department}</td>
                  <td className="py-3.5 text-slate-600 font-medium">{row.head}</td>
                  <td className="py-3.5 text-right font-mono text-slate-700">
                    {row.students.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-right font-mono text-slate-700">{row.faculty}</td>
                  <td className="py-3.5 text-right font-mono font-bold text-slate-900">
                    {row.avgGpa}
                  </td>
                  <td className="py-3.5 text-right font-mono font-bold text-slate-900">
                    {row.passRate}
                  </td>
                  <td className="py-3.5 text-right font-mono font-bold text-rose-600">
                    {row.atRisk}
                  </td>
                  <td className="py-3.5 text-right">
                    <span
                      className={`inline-block px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full ${
                        row.statusColor === 'green'
                          ? 'text-emerald-700 bg-emerald-100/70'
                          : row.statusColor === 'orange'
                          ? 'text-amber-700 bg-amber-100/70'
                          : 'text-rose-700 bg-rose-100/70'
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

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-100 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setSelectedAlert(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-[#3256a8] uppercase tracking-wider">
              Dean Intelligence Dispatch
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">{selectedAlert}</h3>
            <p className="text-xs text-slate-500 mt-2">
              Action recommended: A formal dean inquiry has been drafted for the responsible department committee.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="py-2 px-4 text-xs font-bold text-white bg-[#3256a8] hover:bg-[#2c4c96] rounded-xl cursor-pointer"
              >
                Acknowledge Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      {showReportPreview && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 border border-slate-100 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setShowReportPreview(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-bold text-[#3256a8] uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" />
              <span>Campus AI Report Preview</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Semester 2 Academic Performance Synthesis</h3>
            <p className="text-xs text-slate-400 mt-0.5">Prepared for: Prof. Ahmed El Gohary · University Dean</p>

            <div className="my-5 p-4 bg-slate-50 rounded-2xl space-y-3 text-xs text-slate-600 border border-slate-100 max-h-60 overflow-y-auto">
              <p className="font-semibold text-slate-800">
                1. Executive Summary:
              </p>
              <p>
                University overall pass rate stands at 74%, registering a +2.1% improvement over Semester 1. Four out of five key faculties maintain active accreditation standard compliance.
              </p>
              <p className="font-semibold text-slate-800">
                2. Key Areas for Remediation:
              </p>
              <p>
                Faculty of Law requires targeted academic support with pass rate settling at 58%. Computer Science faculty has 11 students flagged under early warning triggers.
              </p>
              <p className="font-semibold text-slate-800">
                3. Financial Alignment:
              </p>
              <p>
                Tuition fee realization rate reached 67% with $1.2M collected.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowReportPreview(false);
                  handleExport();
                }}
                className="py-2 px-4 text-xs font-bold text-white bg-[#3256a8] hover:bg-[#2c4c96] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Executive PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
