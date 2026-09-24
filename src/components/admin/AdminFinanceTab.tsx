import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  AlertTriangle,
  Award,
  Users,
  Download,
  Send,
  FileText,
  CheckCircle2,
  TrendingUp,
  Clock,
  Check,
  CreditCard,
  Receipt
} from 'lucide-react';
import { useAdminFinance, useSendReminder, useSendBulkReminder } from '../../hooks/useAdminData';

interface Transaction {
  id: string;
  name: string;
  studentId: string;
  invoiceNo: string;
  type: string;
  amount: string;
  dueDate: string;
  paidDate: string;
  status: 'PAID' | 'OVERDUE' | 'PARTIAL';
  reminderSent?: boolean;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', name: 'Ahmed Tarek', studentId: '202100234', invoiceNo: 'INV-3312', type: 'Tuition', amount: '$1,200', dueDate: '1 Jul 2024', paidDate: '1 Jul 2024', status: 'PAID' },
  { id: 'tx-2', name: 'Sara Mahmoud', studentId: '202100187', invoiceNo: 'INV-3301', type: 'Tuition', amount: '$1,200', dueDate: '1 Jul 2024', paidDate: '—', status: 'OVERDUE' },
  { id: 'tx-3', name: 'Nour Ali', studentId: '202100312', invoiceNo: 'INV-3289', type: 'Service Fee', amount: '$600', dueDate: '1 Jul 2024', paidDate: '3 Jul 2024', status: 'PAID' },
  { id: 'tx-4', name: 'Youssef Samir', studentId: '202100098', invoiceNo: 'INV-3276', type: 'Tuition', amount: '$1,200', dueDate: '1 Jul 2024', paidDate: '—', status: 'PARTIAL' },
  { id: 'tx-5', name: 'Layla Ahmed', studentId: '202100445', invoiceNo: 'INV-3265', type: 'Tuition', amount: '$1,200', dueDate: '1 Jul 2024', paidDate: '—', status: 'OVERDUE' },
  { id: 'tx-6', name: 'Khaled Mostafa', studentId: '202100267', invoiceNo: 'INV-3254', type: 'Tuition', amount: '$1,200', dueDate: '1 Jul 2024', paidDate: '5 Jul 2024', status: 'PAID' },
  { id: 'tx-7', name: 'Dina Kamal', studentId: '202100391', invoiceNo: 'INV-3243', type: 'Service Fee', amount: '$600', dueDate: '1 Jul 2024', paidDate: '—', status: 'OVERDUE' },
  { id: 'tx-8', name: 'Omar Hassan', studentId: '202100156', invoiceNo: 'INV-3232', type: 'Tuition', amount: '$1,200', dueDate: '1 Jul 2024', paidDate: '2 Jul 2024', status: 'PAID' },
];

const MONTHLY_COLLECTIONS = [
  { month: 'Feb', amount: 180, label: '$180k' },
  { month: 'Mar', amount: 240, label: '$240k' },
  { month: 'Apr', amount: 310, label: '$310k' },
  { month: 'May', amount: 220, label: '$220k' },
  { month: 'Jun', amount: 160, label: '$160k' },
  { month: 'Jul', amount: 90, label: '$90k' },
];

export const AdminFinanceTab: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const { data: financeData, isLoading } = useAdminFinance();
  const sendReminder = useSendReminder();
  const sendBulkReminder = useSendBulkReminder();
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const MONTHLY_COLLECTIONS = (financeData?.monthlyCollections ?? []) as any[];
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (financeData?.transactions) setTransactions(financeData.transactions);
  }, [financeData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendSingleReminder = async (id: string, name: string) => {
    try {
      await sendReminder.mutateAsync(id);
      showToast(`Payment reminder SMS & email dispatched to ${name}.`);
    } catch {
      showToast('Failed to send reminder.');
    }
  };

  const handleSendBulkReminder = async () => {
    try {
      const result = await sendBulkReminder.mutateAsync();
      showToast(`Dispatched payment reminders to all ${result.sent} overdue accounts.`);
    } catch {
      showToast('Bulk reminder failed.');
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      t.name.toLowerCase().includes(q) ||
      t.studentId.toLowerCase().includes(q) ||
      t.invoiceNo.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q)
    );
  });

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
      {/* 1. TOP STAT CARDS (4 cards)                              */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Fees Collected */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Fees Collected
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">$1.2M</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                +$84k ↑
              </span>
              <span className="text-xs text-slate-400">past 30 days</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Outstanding Balances */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Outstanding Balances
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">$180k</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600">
                overdue
              </span>
              <span className="text-xs text-slate-400">across 52 students</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Scholarships Disbursed */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Scholarships Disbursed
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">$340k</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                merit & need-based
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Overdue Students */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Overdue Students
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">52</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600">
                action needed
              </span>
              <span className="text-xs text-slate-400">exam clearance hold</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TOP SECTION: TWO CARDS SIDE BY SIDE                   */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Card: Revenue Overview Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Monthly Fee Collection</h3>
                <p className="text-xs text-slate-400 mt-0.5">Fees collected per month for current semester</p>
              </div>
              <span className="text-xs font-bold text-slate-400">Semester 2 · 2024</span>
            </div>

            {/* Custom Bar Chart matching Home tab styling */}
            <div className="pt-6 pb-2">
              <div className="h-44 flex items-end justify-between gap-3 sm:gap-4 px-2 border-b border-slate-100">
                {MONTHLY_COLLECTIONS.map((item, index) => {
                  const maxAmt = 350;
                  const heightPercent = (item.amount / maxAmt) * 100;
                  const isCurrent = item.month === 'Jul';
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <span className="text-[11px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.label}
                      </span>
                      <div
                        className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                          isCurrent
                            ? 'bg-[#3256a8] shadow-sm'
                            : 'bg-[#3256a8]/80 hover:bg-[#3256a8]'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-xs font-bold text-slate-600 mt-1">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Summary Row */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Target</span>
              <span className="font-extrabold text-slate-900 text-sm mt-0.5">$1.8M</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Collected</span>
              <span className="font-extrabold text-emerald-700 text-sm mt-0.5">$1.2M</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Remaining</span>
              <span className="font-extrabold text-amber-600 text-sm mt-0.5">$600k</span>
            </div>
          </div>
        </div>

        {/* Right Card: Financial Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Financial Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Budget allocation and collection status</p>
          </div>

          {/* Three Stacked Progress Bars */}
          <div className="space-y-5 text-xs">
            {/* Tuition Fees */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-800">Tuition Fees Collected</span>
                <span className="font-extrabold text-slate-900">$980k of $1.5M <span className="text-[#3256a8] ml-1">(65%)</span></span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#3256a8] h-full rounded-full transition-all" style={{ width: '65%' }} />
              </div>
            </div>

            {/* Service Fees */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-800">Service Fees Collected</span>
                <span className="font-extrabold text-slate-900">$220k of $300k <span className="text-[#3256a8] ml-1">(73%)</span></span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#3256a8] h-full rounded-full transition-all" style={{ width: '73%' }} />
              </div>
            </div>

            {/* Outstanding Total */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-800">Outstanding Total</span>
                <span className="font-extrabold text-red-600">$180k Overdue</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full transition-all" style={{ width: '22%' }} />
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => showToast('Financial audit report (.pdf) generated successfully.')}
            className="w-full py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Financial Report</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TRANSACTIONS TABLE (8 rows)                           */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Financial Invoices & Transactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Student billing ledger records for Semester 2</p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => showToast('Transactions ledger exported (.csv)')}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Transactions</span>
            </button>
            <button
              onClick={handleSendBulkReminder}
              className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Bulk Reminder</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Student ID</th>
                <th className="py-3 px-3">Invoice No.</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3">Paid Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTransactions.map((tx) => {
                const isOverdue = tx.status === 'OVERDUE';
                return (
                  <tr
                    key={tx.id}
                    className={`transition-colors ${
                      isOverdue
                        ? 'bg-red-50/50 hover:bg-red-50/80'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3.5 px-3 font-bold text-slate-900">{tx.name}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-600">{tx.studentId}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-700">{tx.invoiceNo}</td>
                    <td className="py-3.5 px-3 text-slate-600">{tx.type}</td>
                    <td className="py-3.5 px-3 font-extrabold text-slate-900">{tx.amount}</td>
                    <td className="py-3.5 px-3 text-slate-600">{tx.dueDate}</td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">{tx.paidDate}</td>
                    <td className="py-3.5 px-3">
                      {tx.status === 'PAID' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wide">
                          PAID
                        </span>
                      ) : tx.status === 'OVERDUE' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 uppercase tracking-wide">
                          OVERDUE
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
                          PARTIAL
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {tx.status === 'OVERDUE' ? (
                        <button
                          onClick={() => handleSendSingleReminder(tx.id, tx.name)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            tx.reminderSent
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
                          }`}
                        >
                          {tx.reminderSent ? 'Sent ✓' : 'Send Reminder'}
                        </button>
                      ) : tx.status === 'PAID' ? (
                        <button
                          onClick={() => showToast(`Receipt for ${tx.invoiceNo} generated.`)}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                        >
                          Receipt
                        </button>
                      ) : (
                        <button
                          onClick={() => showToast(`Viewing partial payment ledger for ${tx.name}.`)}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
