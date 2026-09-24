import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  FileText,
  Award,
  Users,
  Building2,
  Calendar,
  ArrowRight,
  CheckCircle2,
  X,
  Clock
} from 'lucide-react';

interface DeanFinancialOverviewTabProps {
  searchQuery?: string;
  onNavigateTab?: (tab: any) => void;
}

const REVENUE_SEMESTERS = [
  { term: 'F23', amount: '$920k', value: 920, height: 60 },
  { term: 'S24', amount: '$980k', value: 980, height: 68 },
  { term: 'F24', amount: '$1.05M', value: 1050, height: 75 },
  { term: 'S25', amount: '$1.10M', value: 1100, height: 82 },
  { term: 'F25', amount: '$1.15M', value: 1150, height: 88 },
  { term: 'S26', amount: '$1.20M', value: 1200, height: 95 },
];

const DEPT_COLLECTION_RATES = [
  { dept: 'Medicine', rate: 94, barColor: 'bg-emerald-500' },
  { dept: 'CS', rate: 89, barColor: 'bg-emerald-500' },
  { dept: 'Engineering', rate: 85, barColor: 'bg-[#3256a8]' },
  { dept: 'Business', rate: 79, barColor: 'bg-amber-500' },
  { dept: 'Law', rate: 71, barColor: 'bg-amber-500' },
  { dept: 'Arts', rate: 65, barColor: 'bg-rose-500' },
];

const SCHOLARSHIP_TOP_DEPTS = [
  { dept: 'Medicine', recipients: 48, amount: '$120k' },
  { dept: 'Engineering', recipients: 42, amount: '$95k' },
  { dept: 'Computer Science', recipients: 31, amount: '$78k' },
];

const OUTSTANDING_TOP_DEPTS = [
  { dept: 'Law', amount: '$62k', badgeColor: 'bg-rose-100 text-rose-800' },
  { dept: 'Engineering', amount: '$54k', badgeColor: 'bg-rose-100 text-rose-800' },
  { dept: 'Business', amount: '$41k', badgeColor: 'bg-amber-100 text-amber-800' },
];

export const DeanFinancialOverviewTab: React.FC<DeanFinancialOverviewTabProps> = ({
  searchQuery = '',
  onNavigateTab,
}) => {
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);

  return (
    <div className="space-y-7">
      {/* 1. TOP STAT CARDS (Row of 4) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Revenue This Semester */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <TrendingUp className="w-2.5 h-2.5" />
              +7% ↑
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">$1.2M</span>
            <span className="text-xs text-slate-400 font-medium">Semester 2</span>
          </div>
        </div>

        {/* Outstanding Balances */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Outstanding Balances
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
              <AlertCircle className="w-2.5 h-2.5" />
              overdue
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-rose-600 tracking-tight">$180k</span>
            <span className="text-xs text-slate-400 font-medium">52 accounts</span>
          </div>
        </div>

        {/* Scholarships Disbursed */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Scholarships Disbursed
            </span>
            <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              disbursed
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 tracking-tight">$340k</span>
            <span className="text-xs text-slate-400 font-medium">143 recipients</span>
          </div>
        </div>

        {/* Collection Rate */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Collection Rate
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <TrendingUp className="w-2.5 h-2.5" />
              +3% ↑
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-600 tracking-tight">87%</span>
            <span className="text-xs text-slate-400 font-medium">Target: 90%</span>
          </div>
        </div>
      </section>

      {/* 2. TOP SECTION: TWO CARDS SIDE BY SIDE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left card (wider: 7 cols) — Revenue Trend */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Fiscal Growth
                </p>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  Semester Revenue Trend
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                Last 6 Semesters
              </span>
            </div>

            {/* Blue Bar Chart */}
            <div className="h-44 flex items-end justify-between gap-3 pt-3 px-2">
              {REVENUE_SEMESTERS.map((s) => (
                <div key={s.term} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-600">{s.amount}</span>
                  <div
                    className="w-full bg-[#3256a8] hover:bg-[#284588] rounded-t-xl transition-all duration-500 shadow-xs"
                    style={{ height: `${s.height}%` }}
                  />
                  <span className="text-[10px] font-semibold text-slate-400 text-center">
                    {s.term}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 mt-4">
            <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Semester Target
                </span>
                <span className="text-sm font-black text-slate-800">$1.8M</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Collected
                </span>
                <span className="text-sm font-black text-emerald-600">$1.2M</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Remaining
                </span>
                <span className="text-sm font-black text-slate-800">$600k</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right card (narrower: 5 cols) — Revenue Breakdown by Type */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="mb-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Financial Composition
              </p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                Revenue Breakdown by Type
              </h3>
            </div>

            {/* Stacked Horizontal Progress Bars */}
            <div className="space-y-4 pt-1">
              {/* Tuition Fees */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Tuition Fees</span>
                  <span className="font-mono text-slate-600">
                    <span className="font-bold text-slate-900">$980k</span> of $1.5M target (65%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3256a8] rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              {/* Service & Lab Fees */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Service & Lab Fees</span>
                  <span className="font-mono text-slate-600">
                    <span className="font-bold text-slate-900">$220k</span> of $300k target (73%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3256a8] rounded-full" style={{ width: '73%' }} />
                </div>
              </div>

              {/* Outstanding Balances */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-700">Outstanding Balances</span>
                  <span className="font-mono text-rose-600 font-bold">$180k pending</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '38%' }} />
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFinanceModal(true)}
            className="w-full mt-6 py-2.5 px-4 bg-[#3256a8] hover:bg-[#284588] text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer text-center"
          >
            View Full Finance Report
          </button>
        </div>
      </section>

      {/* 3. BOTTOM SECTION: THREE CARDS SIDE BY SIDE */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* Left card — Collection Rate by Department */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Collection Rate by Dept
              </h3>
              <span className="text-[10px] font-semibold text-slate-400">Ranked</span>
            </div>

            <div className="space-y-3">
              {DEPT_COLLECTION_RATES.map((item) => (
                <div key={item.dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.dept}</span>
                    <span className="font-mono font-bold text-slate-700">{item.rate}% collected</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center mt-4">
            Benchmark target: 80% collections prior to finals
          </p>
        </div>

        {/* Center card — Scholarship Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Scholarship Summary
              </h3>
              <Award className="w-4 h-4 text-[#3256a8]" />
            </div>

            {/* 4 Labeled Values */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 mb-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Active Awards
                </span>
                <span className="text-sm font-black text-slate-900">143 students</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Total Disbursed
                </span>
                <span className="text-sm font-black text-[#3256a8]">$340k</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Full Grants
                </span>
                <span className="text-sm font-black text-slate-800">32 students</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Partial Grants
                </span>
                <span className="text-sm font-black text-slate-800">111 students</span>
              </div>
            </div>

            {/* Small Table: Top 3 Departments */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Top 3 Departments
              </span>
              <div className="space-y-1">
                {SCHOLARSHIP_TOP_DEPTS.map((d) => (
                  <div
                    key={d.dept}
                    className="p-1.5 px-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]"
                  >
                    <span className="font-semibold text-slate-800">{d.dept}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">{d.recipients} rec.</span>
                      <span className="font-bold text-slate-900">{d.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowScholarshipModal(true)}
            className="w-full mt-4 py-2 px-3 bg-[#3256a8] hover:bg-[#284588] text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer text-center"
          >
            View All Scholarships
          </button>
        </div>

        {/* Right card — Outstanding Balances Alert */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Outstanding Balances
              </h3>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                Action Alert
              </span>
            </div>

            {/* Risk Summary metrics */}
            <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 mb-3 space-y-1 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Overdue Accounts:</span>
                <span className="text-rose-600 font-black">52 students</span>
              </div>
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Total Outstanding:</span>
                <span className="text-rose-600 font-black">$180k</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>Oldest Unpaid Invoice:</span>
                <span className="font-bold text-rose-700">45 days overdue</span>
              </div>
            </div>

            {/* Top 3 Depts by Outstanding */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Top Departments by Balance
              </span>
              <div className="space-y-1">
                {OUTSTANDING_TOP_DEPTS.map((d) => (
                  <div
                    key={d.dept}
                    className="p-1.5 px-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]"
                  >
                    <span className="font-semibold text-slate-800">{d.dept}</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${d.badgeColor}`}>
                      {d.amount} outstanding
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onNavigateTab) {
                // Navigate to admin finance tab for transaction details
                onNavigateTab('finance');
              } else {
                setShowFinanceModal(true);
              }
            }}
            className="w-full mt-4 py-2 px-3 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer text-center"
          >
            View Finance Details
          </button>
        </div>
      </section>

      {/* FINANCE REPORT MODAL */}
      {showFinanceModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#3256a8]" />
                <h3 className="text-base font-bold text-slate-900">
                  Executive Fiscal Audit Brief
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFinanceModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Campus by Nilebyte has audited the university&apos;s current fiscal run-rate. Total collections have surpassed the 85% mid-semester checkpoint.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Projected Tuition:</span>
                <span className="font-bold text-slate-900">$1,500,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Net Bursar Receipts:</span>
                <span className="font-bold text-emerald-700">$1,200,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scholarship Commitments:</span>
                <span className="font-bold text-[#3256a8]">-$340,000</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-800">Net Realized Balance:</span>
                <span className="font-black text-slate-900">$860,000</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFinanceModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFinanceModal(false);
                  if (onNavigateTab) onNavigateTab('finance');
                }}
                className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold"
              >
                Go to Admin Finance Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHOLARSHIP DETAIL MODAL */}
      {showScholarshipModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#3256a8]" />
                <h3 className="text-base font-bold text-slate-900">
                  Institutional Scholarships (143 Active)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScholarshipModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
                <div>
                  <span className="font-bold text-emerald-900 block">Presidential Merit Scholars</span>
                  <span className="text-[11px] text-emerald-700">32 students · 100% Tuition Waiver</span>
                </div>
                <span className="font-black text-emerald-800">$160,000</span>
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex justify-between items-center">
                <div>
                  <span className="font-bold text-blue-900 block">Dean&apos;s Honors Fellowships</span>
                  <span className="text-[11px] text-blue-700">65 students · 50% Tuition Waiver</span>
                </div>
                <span className="font-black text-blue-800">$120,000</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">Need-Based Financial Assistance</span>
                  <span className="text-[11px] text-slate-600">46 students · Custom aid grants</span>
                </div>
                <span className="font-black text-slate-800">$60,000</span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowScholarshipModal(false)}
                className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
