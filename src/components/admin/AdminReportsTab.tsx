import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Download,
  Eye,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  Info,
  Calendar,
  Layers,
  Building2,
  X
} from 'lucide-react';
import { useAdminReports, useGenerateReport } from '../../hooks/useAdminData';

interface ReportItem {
  id: string;
  name: string;
  type: string;
  generatedDate: string;
  generatedBy: string;
  isAi: boolean;
  format: 'PDF' | 'Excel';
  summary?: string;
}

const INITIAL_REPORTS: ReportItem[] = [
  { id: 'rep-1', name: 'Semester 2 Academic Report', type: 'Academic', generatedDate: '7 Jul 2024', generatedBy: 'Campus AI', isAi: true, format: 'PDF', summary: 'Comprehensive audit of final grades, GPA distributions, and departmental performance indices.' },
  { id: 'rep-2', name: 'Faculty Load Report — Jul 2024', type: 'HR', generatedDate: '5 Jul 2024', generatedBy: 'Admin', isAi: false, format: 'Excel', summary: 'Teaching credit allocations, weekly load hours, and overtime stipends across faculties.' },
  { id: 'rep-3', name: 'Fee Collection Report — Semester 2', type: 'Finance', generatedDate: '3 Jul 2024', generatedBy: 'Admin', isAi: false, format: 'PDF', summary: 'Tuition revenue, outstanding ledger balances, and payment gateway settlement reports.' },
  { id: 'rep-4', name: 'At-Risk Students Report', type: 'Academic', generatedDate: '1 Jul 2024', generatedBy: 'Campus AI', isAi: true, format: 'PDF', summary: 'Risk matrix detailing 27 flagged students, attendance dropoffs, and intervention plans.' },
  { id: 'rep-5', name: 'Enrollment Summary — Semester 2', type: 'Enrollment', generatedDate: '28 Jun 2024', generatedBy: 'Admin', isAi: false, format: 'Excel', summary: 'Census count of 4,821 active students, waitlists, and capacity ceilings.' },
  { id: 'rep-6', name: 'Board Meeting Brief — Jul 2024', type: 'Executive', generatedDate: '25 Jun 2024', generatedBy: 'Campus AI', isAi: true, format: 'PDF', summary: 'Executive summary briefing prepared for Chancellor and Board of Trustees.' },
];

export const AdminReportsTab: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const { data: reportsData, isLoading } = useAdminReports();
  const generateReport = useGenerateReport();
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [reportSearch, setReportSearch] = useState(searchQuery);

  useEffect(() => { if (reportsData) setReports(reportsData); }, [reportsData]);

  // Form state
  const [reportType, setReportType] = useState('Academic Performance');
  const [semester, setSemester] = useState('Fall 2024');
  const [department, setDepartment] = useState('All Departments');
  const [format, setFormat] = useState<'PDF' | 'Excel'>('PDF');
  const [useAi, setUseAi] = useState(true);

  // Selected report for preview modal
  const [previewReport, setPreviewReport] = useState<ReportItem | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: ReportItem = {
      id: `rep-${Date.now()}`,
      name: `${reportType} — ${semester}`,
      type: reportType.split(' ')[0],
      generatedDate: 'Today',
      generatedBy: useAi ? 'Campus AI' : 'Admin',
      isAi: useAi,
      format,
      summary: `Automated report for ${department} compiled on demand.`,
    };

    setReports([newReport, ...reports]);
    showToast(`Generated "${newReport.name}" successfully!`);
  };

  const filteredReports = reports.filter((r) => {
    const q = (reportSearch || searchQuery).toLowerCase().trim();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.generatedBy.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading reports...</div>;
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

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* ======================================================== */}
        {/* Left Section (col-span-8) — Generated Reports Library    */}
        {/* ======================================================== */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Generated Reports Library</h3>
                <p className="text-xs text-slate-400 mt-0.5">Historical archive of official institutional documents</p>
              </div>

              {/* Search bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search reports by name..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#3256a8] focus:bg-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Report Name</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Generated Date</th>
                    <th className="py-3 px-3">Generated By</th>
                    <th className="py-3 px-3">Format</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          {r.format === 'PDF' ? (
                            <FileText className="w-4 h-4 text-red-500 shrink-0" />
                          ) : (
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          <span className="font-bold text-slate-900">{r.name}</span>
                          {r.isAi && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-[#3256a8] font-bold text-[10px] rounded-md flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> AI
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md text-[11px]">
                          {r.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">{r.generatedDate}</td>
                      <td className="py-3.5 px-3 text-slate-700 font-medium">{r.generatedBy}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 font-mono font-bold rounded-md text-[11px] ${
                          r.format === 'PDF' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {r.format}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewReport(r)}
                            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 font-bold rounded-lg transition-all cursor-pointer text-[11px] flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => showToast(`Downloaded ${r.name}.${r.format.toLowerCase()}`)}
                            className="px-2.5 py-1 bg-[#3256a8] hover:bg-[#284588] text-white font-bold rounded-lg transition-all cursor-pointer text-[11px] flex items-center gap-1 shadow-2xs"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* Right Section (col-span-4) — Generate New Report         */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Generate a New Report</h3>
              <p className="text-xs text-slate-400 mt-0.5">Produce customized administrative reports</p>
            </div>

            <form onSubmit={handleGenerateReport} className="space-y-3.5 text-xs">
              {/* Report Type */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-[#3256a8]"
                >
                  <option value="Academic Performance">Academic Performance</option>
                  <option value="Financial">Financial Audit</option>
                  <option value="Enrollment">Enrollment Census</option>
                  <option value="Faculty Load">Faculty Load & HR</option>
                  <option value="At-Risk Students">At-Risk Students Matrix</option>
                  <option value="Board Brief">Board Meeting Brief</option>
                  <option value="Custom">Custom Data Query</option>
                </select>
              </div>

              {/* Semester Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-[#3256a8]"
                >
                  <option value="Fall 2024">Fall 2024 (Current)</option>
                  <option value="Spring 2024">Spring 2024</option>
                  <option value="Summer 2024">Summer 2024</option>
                  <option value="Full Academic Year">Full Academic Year 2023–2024</option>
                </select>
              </div>

              {/* Department Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-[#3256a8]"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business Admin">Business Admin</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Law">Law</option>
                </select>
              </div>

              {/* Format Selector: PDF & Excel toggle buttons */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Export Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('PDF')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      format === 'PDF'
                        ? 'bg-[#3256a8] border-[#3256a8] text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF Document</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('Excel')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      format === 'Excel'
                        ? 'bg-[#3256a8] border-[#3256a8] text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Excel (.xlsx)</span>
                  </button>
                </div>
              </div>

              {/* AI Narrative Toggle (ON by default) */}
              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#3256a8]" />
                    AI Narrative Summary
                  </span>
                  <span className="text-[11px] text-slate-500">Draft executive findings with Campus AI</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseAi(!useAi)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    useAi ? 'bg-[#3256a8]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      useAi ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Report</span>
              </button>
            </form>
          </div>

          {/* Small info card with blue left border */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 border-l-4 border-l-[#3256a8] shadow-xs text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Info className="w-3.5 h-3.5 text-[#3256a8]" />
              <span>Standard Institutional Compliance</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              AI-generated reports are compiled automatically from live platform data and written in your university's standard report format. Review before submitting.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PREVIEW MODAL                                            */}
      {/* ======================================================== */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-100 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {previewReport.type} · {previewReport.format}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{previewReport.name}</h3>
              </div>
              <button
                onClick={() => setPreviewReport(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-bold">Generated Date:</span>
                  <span>{previewReport.generatedDate}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-bold">Author / Engine:</span>
                  <span className="flex items-center gap-1">
                    {previewReport.isAi && <Sparkles className="w-3 h-3 text-[#3256a8]" />}
                    {previewReport.generatedBy}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-bold">Security Classification:</span>
                  <span className="text-emerald-700 font-bold">University Internal (Strict)</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Executive Summary</h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  {previewReport.summary}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  showToast(`Downloaded ${previewReport.name}.${previewReport.format.toLowerCase()}`);
                  setPreviewReport(null);
                }}
                className="px-5 py-2 bg-[#3256a8] hover:bg-[#284588] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
