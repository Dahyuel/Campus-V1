import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Activity,
  Check
} from 'lucide-react';
import { useAdminDashboard, useUpdateRegistration } from '../../hooks/useAdminData';

interface AdminDashboardProps {
  searchQuery?: string;
  onNavigateTab?: (tabId: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  searchQuery = '',
  onNavigateTab,
}) => {
  const [resolvedActions, setResolvedActions] = useState<Record<string, boolean>>({});
  const { data: dashData, isLoading } = useAdminDashboard();
  const updateRegistration = useUpdateRegistration();

  const ADMIN_HEALTH_INDICATORS = (dashData?.healthIndicators ?? []) as any[];
  const ADMIN_ENROLLMENT_CHART = (dashData?.enrollmentChart ?? []) as any[];
  const ADMIN_PENDING_ACTIONS = (dashData?.pendingActions ?? []) as any[];
  const ADMIN_REGISTRATIONS = (dashData?.registrations ?? []) as any[];
  const ADMIN_ACTIVITY_LOGS = (dashData?.activityLogs ?? []) as any[];

  const toggleResolve = (id: string) => {
    setResolvedActions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading dashboard…</div>
    );
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredRegistrations = ADMIN_REGISTRATIONS.filter((r) => {
    if (!normalizedQuery) return true;
    return (
      r.name.toLowerCase().includes(normalizedQuery) ||
      r.program.toLowerCase().includes(normalizedQuery) ||
      r.status.toLowerCase().includes(normalizedQuery)
    );
  });

  const filteredLogs = ADMIN_ACTIVITY_LOGS.filter((l) => {
    if (!normalizedQuery) return true;
    return (
      l.action.toLowerCase().includes(normalizedQuery) ||
      l.user.toLowerCase().includes(normalizedQuery)
    );
  });

  // Calculate bar heights for the 8 semesters
  const maxEnrollment = 5000;
  const minEnrollment = 3500;

  return (
    <div className="space-y-7">
      {/* ======================================================== */}
      {/* 1. UNIVERSITY HEALTH BAR                                 */}
      {/* ======================================================== */}
      <section className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#3256a8] flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Executive Status Strip
              </span>
              <h2 className="text-sm font-bold text-slate-900">University Health Bar</h2>
            </div>
          </div>

          {/* 5 Status Indicators Side by Side */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {ADMIN_HEALTH_INDICATORS.map((indicator, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  indicator.color === 'emerald'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                    : indicator.color === 'amber'
                    ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                    : 'bg-rose-50 text-rose-800 border-rose-200/80 animate-pulse'
                }`}
              >
                <span>{indicator.label}</span>
                {indicator.color === 'emerald' && <span>✅</span>}
                {indicator.color === 'amber' && <span>⚠️</span>}
                {indicator.color === 'rose' && <span>🔴</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. ROW OF 4 STAT CARDS                                   */}
      {/* ======================================================== */}
      <section aria-label="University Key Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-[#3256a8] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">4,821</span>
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                +143 ↑
              </span>
            </div>
          </div>
        </div>

        {/* Total Faculty */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-500/10 text-slate-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Faculty</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">312</span>
              <span className="inline-flex items-center text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                no change
              </span>
            </div>
          </div>
        </div>

        {/* Fees Collected */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fees Collected</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">$1.2M</span>
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                +$84k ↑
              </span>
            </div>
          </div>
        </div>

        {/* At-Risk Students */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">At-Risk Students</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">27</span>
              <span className="inline-flex items-center text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                action needed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. FIRST ROW — TWO SIDE BY SIDE CARDS                    */}
      {/* ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left card — Enrollment Overview (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Enrollment Overview
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    4,821
                  </span>
                  <span className="text-sm font-semibold text-slate-400">active students</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200/60 rounded-full text-xs font-semibold text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#3256a8]"></span>
                Last 8 Semesters
              </span>
            </div>

            {/* Bar Chart Visual */}
            <div className="flex items-end justify-between px-2 sm:px-4 pt-8 pb-2 h-52">
              {ADMIN_ENROLLMENT_CHART.map((item) => {
                const heightPct = Math.round(
                  ((item.count - minEnrollment) / (maxEnrollment - minEnrollment)) * 100
                );
                return (
                  <div key={item.semester} className="flex flex-col items-center gap-2.5 flex-1 relative group">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-9 z-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md whitespace-nowrap transition-opacity pointer-events-none">
                      {item.count.toLocaleString()} students
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${Math.max(28, heightPct * 1.5)}px` }}
                      className={`w-6 sm:w-10 rounded-xl transition-all ${
                        item.active
                          ? 'bg-[#3256a8] shadow-md shadow-[#3256a8]/25'
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    />
                    <span
                      className={`text-[10px] sm:text-[11px] truncate max-w-[45px] text-center ${
                        item.active ? 'font-bold text-slate-900' : 'font-medium text-slate-400'
                      }`}
                    >
                      {item.semester.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
            <span>Overall university retention: 94.2%</span>
            <span className="font-semibold text-slate-600">Current: Semester 2 (2026)</span>
          </div>
        </div>

        {/* Right card — Finance Snapshot (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Financial Health
                </p>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Finance Snapshot</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                On Budget
              </span>
            </div>

            {/* Three horizontal stacked progress bars */}
            <div className="space-y-6 pt-2">
              {/* Bar 1: Fees Collected */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800">Fees Collected this semester</span>
                    <p className="text-[11px] text-slate-400">Target: $1.8M total projected</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900">$1.2M</span>
                    <span className="text-xs font-bold text-[#3256a8] ml-1.5">67%</span>
                  </div>
                </div>
                <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3256a8] rounded-full transition-all duration-500 shadow-xs"
                    style={{ width: '67%' }}
                  />
                </div>
              </div>

              {/* Bar 2: Scholarships Disbursed */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800">Scholarships Disbursed</span>
                    <p className="text-[11px] text-slate-400">142 meritorious grants awarded</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900">$340k</span>
                    <span className="text-xs font-bold text-[#3256a8] ml-1.5">19%</span>
                  </div>
                </div>
                <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3b66cf] rounded-full transition-all duration-500"
                    style={{ width: '19%' }}
                  />
                </div>
              </div>

              {/* Bar 3: Outstanding Balances */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800">Outstanding Balances</span>
                    <p className="text-[11px] text-rose-500 font-medium">52 accounts awaiting settlement</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-rose-600">$180k</span>
                    <span className="text-xs font-bold text-rose-600 ml-1.5">10%</span>
                  </div>
                </div>
                <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: '10%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 mt-4">
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('finance')}
              className="text-xs font-semibold text-[#3256a8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View full institutional ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. SECOND ROW — THREE SIDE BY SIDE CARDS                 */}
      {/* ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left card — Pending Admin Actions (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Pending Admin Actions</h3>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                5 Tasks
              </span>
            </div>

            <div className="space-y-3">
              {ADMIN_PENDING_ACTIONS.map((item) => {
                const isResolved = resolvedActions[item.id];
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isResolved
                        ? 'bg-slate-50 border-slate-100 opacity-60'
                        : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                          item.priority === 'red'
                            ? 'bg-rose-500'
                            : item.priority === 'yellow'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <p
                        className={`text-xs font-medium leading-snug ${
                          isResolved ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {item.text}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleResolve(item.id)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                        isResolved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#3256a8] hover:bg-[#2c4c96] text-white shadow-xs'
                      }`}
                    >
                      {isResolved ? 'Resolved' : 'Resolve'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 mt-4">
            <span className="text-[11px] text-slate-400">Automated triage cycle: Every 30 mins</span>
          </div>
        </div>

        {/* Center card — Recent Registrations (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Recent Registrations</h3>
              <span className="text-xs font-medium text-slate-400">Last 5 applicants</span>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-2.5 font-medium">Name</th>
                    <th className="pb-2.5 px-1 font-medium">Program</th>
                    <th className="pb-2.5 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 pr-2">
                        <span className="font-bold text-slate-800 block text-xs truncate max-w-[110px]">
                          {reg.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{reg.date}</span>
                      </td>
                      <td className="py-2.5 px-1 text-slate-500 text-[11px] truncate max-w-[90px]">
                        {reg.program}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full ${
                            reg.status === 'APPROVED'
                              ? 'text-emerald-700 bg-emerald-50'
                              : reg.status === 'PENDING'
                              ? 'text-amber-700 bg-amber-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 mt-3">
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('enrollment')}
              className="text-xs font-semibold text-[#3256a8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View admission queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right card — System Activity Log (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <h3 className="text-base font-bold text-slate-900">System Activity Log</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>

            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50/60 border border-slate-100 flex items-start justify-between gap-2 text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-800 leading-snug">{log.action}</p>
                    <span className="text-[11px] text-slate-400 font-medium">{log.user}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 mt-0.5">
                    {log.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 mt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span>Server status: Nominal</span>
            <span>Uptime: 99.98%</span>
          </div>
        </div>
      </section>
    </div>
  );
};
