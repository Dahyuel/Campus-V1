import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { TabId } from '../../types';
import { useAdminAnalytics } from '../../hooks/useAdminData';

const ENROLLMENT_8_SEMESTERS = [
  { term: 'F20', count: 3950, label: '3,950' },
  { term: 'S21', count: 4120, label: '4,120' },
  { term: 'F21', count: 4280, label: '4,280' },
  { term: 'S22', count: 4400, label: '4,400' },
  { term: 'F22', count: 4520, label: '4,520' },
  { term: 'S23', count: 4610, label: '4,610' },
  { term: 'F23', count: 4678, label: '4,678' },
  { term: 'S24', count: 4821, label: '4,821', current: true },
];

const GPA_RANGES = [
  { range: '0–1.0', count: 120, pct: 2.5 },
  { range: '1.0–2.0', count: 480, pct: 10 },
  { range: '2.0–3.0', count: 2150, pct: 44.6 },
  { range: '3.0–4.0', count: 2071, pct: 42.9 },
];

const ATTENDANCE_DEPTS = [
  { dept: 'CS Dept', rate: 86 },
  { dept: 'ENG Dept', rate: 79 },
  { dept: 'BUS Dept', rate: 74 },
  { dept: 'MED Dept', rate: 93 },
  { dept: 'LAW Dept', rate: 68 },
];

const PASS_FAIL_DEPTS = [
  { dept: 'CS Dept', rate: 89 },
  { dept: 'ENG Dept', rate: 82 },
  { dept: 'BUS Dept', rate: 76 },
  { dept: 'MED Dept', rate: 95 },
  { dept: 'LAW Dept', rate: 69 },
];

export const AdminAnalyticsTab: React.FC<{ onNavigateTab?: (tab: TabId) => void }> = ({
  onNavigateTab,
}) => {
  const { data: analyticsData, isLoading } = useAdminAnalytics();
  const [dateRange, setDateRange] = useState('This Semester');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const ENROLLMENT_8_SEMESTERS = (analyticsData?.enrollmentTrend ?? []) as any[];
  const GPA_RANGES = (analyticsData?.gpaRanges ?? []) as any[];
  const ATTENDANCE_DEPTS = (analyticsData?.attendanceDepts ?? []) as any[];
  const PASS_FAIL_DEPTS = (analyticsData?.passFailDepts ?? []) as any[];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getBarColor = (rate: number) => {
    if (rate >= 80) return 'bg-emerald-500';
    if (rate >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading analytics...</div>;
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
      {/* Header & Date Range Selector                             */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">University Analytics Command Center</h2>
          <p className="text-xs text-slate-500 mt-0.5">High-level institutional performance, enrollment, and risk metrics</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scope:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#3256a8] shadow-xs cursor-pointer"
          >
            <option value="This Semester">This Semester (S2 2024)</option>
            <option value="Last Semester">Last Semester (S1 2024)</option>
            <option value="Last Year">Last Year (2023–2024)</option>
            <option value="Custom Range">Custom Range</option>
          </select>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2x3 Grid of Analytics Cards                              */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 — Enrollment Trend (bar chart) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900">Enrollment Trend</h3>
              <span className="text-[11px] font-bold text-slate-400">8 Semesters</span>
            </div>
            <p className="text-xs text-[#3256a8] font-bold">4,821 students this semester</p>

            <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
              {ENROLLMENT_8_SEMESTERS.map((s) => {
                const max = 5000;
                const min = 3500;
                const heightPercent = Math.max(15, ((s.count - min) / (max - min)) * 100);
                return (
                  <div key={s.term} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {s.label}
                    </span>
                    <div
                      className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                        s.current ? 'bg-[#3256a8]' : 'bg-slate-200 group-hover:bg-slate-300'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className={`text-[10px] font-bold ${s.current ? 'text-[#3256a8]' : 'text-slate-500'}`}>
                      {s.term}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-3">
            Steady +3.1% YoY compound enrollment growth
          </span>
        </div>

        {/* Card 2 — GPA Distribution (bar chart) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900">GPA Distribution</h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Avg: 3.12
              </span>
            </div>
            <p className="text-xs text-slate-400">Total 4,821 student academic standing distribution</p>

            <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100">
              {GPA_RANGES.map((g) => {
                const maxCount = 2500;
                const heightPercent = (g.count / maxCount) * 100;
                return (
                  <div key={g.range} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-bold text-slate-500">
                      {g.count}
                    </span>
                    <div
                      className="w-full max-w-[40px] rounded-t-lg bg-[#3256a8] transition-all hover:bg-[#284588]"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] font-bold text-slate-600">{g.range}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-3">
            87.5% of students in 2.0 - 4.0 GPA bracket
          </span>
        </div>

        {/* Card 3 — Attendance Overview (bar chart) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900">Attendance by Department</h3>
              <span className="text-[11px] font-bold text-slate-400">Avg 81.2%</span>
            </div>
            <p className="text-xs text-slate-400">Average semester lecture attendance compliance</p>

            <div className="h-44 flex items-end justify-between gap-2.5 pt-6 pb-2 border-b border-slate-100">
              {ATTENDANCE_DEPTS.map((d) => {
                const color = getBarColor(d.rate);
                return (
                  <div key={d.dept} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-bold text-slate-700">{d.rate}%</span>
                    <div
                      className={`w-full max-w-[34px] rounded-t-lg transition-all ${color}`}
                      style={{ height: `${d.rate}%` }}
                    />
                    <span className="text-[10px] font-bold text-slate-600 truncate max-w-full">
                      {d.dept.replace(' Dept', '')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mt-3">
            <span className="text-emerald-700 font-bold">&gt;80% High</span>
            <span className="text-amber-700 font-bold">70–80% Warning</span>
            <span className="text-red-600 font-bold">&lt;70% Critical</span>
          </div>
        </div>

        {/* Card 4 — Pass/Fail Rate (bar chart) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900">Pass Rate by Department</h3>
              <span className="text-[11px] font-bold text-slate-400">Univ. Avg 82.2%</span>
            </div>
            <p className="text-xs text-slate-400">Passing grades (C or better) across faculties</p>

            <div className="h-44 flex items-end justify-between gap-2.5 pt-6 pb-2 border-b border-slate-100">
              {PASS_FAIL_DEPTS.map((d) => {
                const color = getBarColor(d.rate);
                return (
                  <div key={d.dept} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-bold text-slate-700">{d.rate}%</span>
                    <div
                      className={`w-full max-w-[34px] rounded-t-lg transition-all ${color}`}
                      style={{ height: `${d.rate}%` }}
                    />
                    <span className="text-[10px] font-bold text-slate-600 truncate max-w-full">
                      {d.dept.replace(' Dept', '')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-3">
            Medicine and CS lead institutional completion rates
          </span>
        </div>

        {/* Card 5 — Fee Collection Progress (progress bars) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Fee Collection Status</h3>
            <p className="text-xs text-slate-400">Tuition, lab service, and receivables breakdown</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-700">Tuition Collected</span>
                <span className="font-extrabold text-slate-900">$980k <span className="text-[#3256a8]">(65%)</span></span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#3256a8] h-full rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-700">Service Fees Collected</span>
                <span className="font-extrabold text-slate-900">$220k <span className="text-[#3256a8]">(73%)</span></span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#3256a8] h-full rounded-full" style={{ width: '73%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-700">Outstanding Balances</span>
                <span className="font-extrabold text-red-600">$180k Overdue</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: '22%' }} />
              </div>
            </div>
          </div>

          <span className="text-[11px] text-slate-400 font-medium block">
            Target $1.8M total semester collection by mid-term
          </span>
        </div>

        {/* Card 6 — At-Risk Overview (summary card, no chart) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">At-Risk Summary</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 font-bold text-[11px]">
                Total: 27
              </span>
            </div>

            {/* Severity pills */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-[10px] font-bold text-amber-700 uppercase block">Moderate</span>
                <span className="text-base font-extrabold text-amber-900">12</span>
              </div>
              <div className="p-2.5 bg-orange-50 rounded-xl border border-orange-100">
                <span className="text-[10px] font-bold text-orange-700 uppercase block">High</span>
                <span className="text-base font-extrabold text-orange-900">9</span>
              </div>
              <div className="p-2.5 bg-red-50 rounded-xl border border-red-100">
                <span className="text-[10px] font-bold text-red-700 uppercase block">Critical</span>
                <span className="text-base font-extrabold text-red-900">6</span>
              </div>
            </div>

            {/* Top 3 depts */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Top Departments by Risk Volume
              </span>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-800">Law Department</span>
                <span className="font-bold text-red-600">11 students</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-800">Business Admin</span>
                <span className="font-bold text-amber-700">9 students</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-800">Engineering</span>
                <span className="font-bold text-slate-700">7 students</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab ? onNavigateTab('students') : showToast('Viewing At-Risk Roster')}
            className="w-full mt-4 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Full Report</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. FULL-WIDTH "EXPORT ANALYTICS" BAR                     */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900 tracking-tight">Institutional Intelligence Export</h4>
          <p className="text-xs text-slate-400 mt-0.5">Generate verified compliance decks and board briefings</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => showToast('Analytics compiled and exported to PDF format.')}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Export as PDF</span>
          </button>
          <button
            onClick={() => showToast('Analytics data tables exported to Excel workbook.')}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Export as Excel</span>
          </button>
          <button
            onClick={() => showToast('Campus AI is generating executive narrative analysis...')}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate AI Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
