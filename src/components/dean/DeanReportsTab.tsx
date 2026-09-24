import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Search,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  FileCheck,
  ChevronRight,
  Printer
} from 'lucide-react';

interface DeanReportsTabProps {
  searchQuery?: string;
}

interface ReportItem {
  id: string;
  name: string;
  type: string;
  generatedDate: string;
  generatedBy: string;
  isAI: boolean;
  format: 'PDF' | 'Word';
  contentSnippet: string;
}

const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep-1',
    name: 'Semester 2 Executive Summary',
    type: 'Academic',
    generatedDate: '7 Jul 2024',
    generatedBy: 'Campus AI',
    isAI: true,
    format: 'PDF',
    contentSnippet: 'Comprehensive academic evaluation of 18 faculties, 4,821 active students, and overall university pass rate of 74%. Key findings include Medicine at 81% and Law at 58%.',
  },
  {
    id: 'rep-2',
    name: 'Board Meeting Brief — Jul 2024',
    type: 'Executive',
    generatedDate: '5 Jul 2024',
    generatedBy: 'Campus AI',
    isAI: true,
    format: 'PDF',
    contentSnippet: 'Strategic governance brief for the University Board of Trustees. Summarizes fiscal revenue (+7% over budget), campus accreditation milestones, and scholarship disbursements.',
  },
  {
    id: 'rep-3',
    name: 'University Financial Report — Semester 2',
    type: 'Finance',
    generatedDate: '3 Jul 2024',
    generatedBy: 'Campus AI',
    isAI: true,
    format: 'PDF',
    contentSnippet: 'Fiscal audit analyzing $1.2M collected tuition, $340k distributed in merit and need-based scholarships, and collection rates across all 6 key academic faculties.',
  },
  {
    id: 'rep-4',
    name: 'Department Performance Report',
    type: 'Academic',
    generatedDate: '1 Jul 2024',
    generatedBy: 'Campus AI',
    isAI: true,
    format: 'PDF',
    contentSnippet: 'Comparative departmental metrics reviewing pass rates, faculty headcounts, attendance averages, and course-level performance disparity across all curricula.',
  },
  {
    id: 'rep-5',
    name: 'Accreditation Progress Report',
    type: 'Compliance',
    generatedDate: '28 Jun 2024',
    generatedBy: 'Admin',
    isAI: false,
    format: 'PDF',
    contentSnippet: 'Official institutional compliance audit verifying 100% faculty degree accreditation, laboratory safety certifications, and curriculum hour adherence.',
  },
  {
    id: 'rep-6',
    name: 'At-Risk Intervention Summary',
    type: 'Academic',
    generatedDate: '25 Jun 2024',
    generatedBy: 'Campus AI',
    isAI: true,
    format: 'PDF',
    contentSnippet: 'Intervention tracking for 27 students flagged by early-warning attendance and quiz algorithms. 84% are currently participating in mandatory academic coaching.',
  },
];

export const DeanReportsTab: React.FC<DeanReportsTabProps> = ({
  searchQuery = '',
}) => {
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [localSearch, setLocalSearch] = useState('');
  const [viewingReport, setViewingReport] = useState<ReportItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form states
  const [reportType, setReportType] = useState('Executive Summary');
  const [semester, setSemester] = useState('Semester 2, 2026');
  const [scope, setScope] = useState('All University');
  const [format, setFormat] = useState<'PDF' | 'Word'>('PDF');
  const [includeAI, setIncludeAI] = useState(true);
  const [includeViz, setIncludeViz] = useState(true);
  const [generating, setGenerating] = useState(false);

  const combinedSearch = (searchQuery || localSearch).trim().toLowerCase();

  const filteredReports = reports.filter((r) => {
    if (!combinedSearch) return true;
    return (
      r.name.toLowerCase().includes(combinedSearch) ||
      r.type.toLowerCase().includes(combinedSearch) ||
      r.generatedBy.toLowerCase().includes(combinedSearch)
    );
  });

  const handleDownload = (report: ReportItem) => {
    setNotification(`Downloading "${report.name}.${report.format.toLowerCase()}"...`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    setTimeout(() => {
      const newRep: ReportItem = {
        id: `rep-${Date.now()}`,
        name: `${reportType} — ${semester}`,
        type: reportType.includes('Board') ? 'Executive' : reportType.includes('Financial') ? 'Finance' : 'Academic',
        generatedDate: 'Today',
        generatedBy: includeAI ? 'Campus AI' : 'Dean Office',
        isAI: includeAI,
        format: format,
        contentSnippet: `Automated executive analysis covering ${scope} for ${semester}. Visualizations included: ${includeViz ? 'Yes' : 'No'}. Generated with verified university registrar data.`,
      };

      setReports((prev) => [newRep, ...prev]);
      setGenerating(false);
      setNotification(`Report "${newRep.name}" compiled successfully.`);
      setTimeout(() => setNotification(null), 3500);
    }, 1200);
  };

  return (
    <div className="space-y-7">
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {notification}
        </div>
      )}

      {/* TWO SECTIONS SIDE BY SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left section (wider: 7 cols) — Reports Library */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Reports Library
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Executive summaries and board briefs prepared for leadership review
              </p>
            </div>

            {/* Search Input at top right */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reports..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3256a8]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-3">Report Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Generated Date</th>
                  <th className="py-3 px-3">Generated By</th>
                  <th className="py-3 px-3">Format</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{r.name}</span>
                        {r.isAI && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-blue-50 text-[#3256a8] border border-blue-200 rounded text-[9px] font-black">
                            <Sparkles className="w-2.5 h-2.5" /> AI
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">{r.type}</td>
                    <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                      {r.generatedDate}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-semibold">{r.generatedBy}</td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold text-[10px]">
                        {r.format}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDownload(r)}
                          className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewingReport(r)}
                          className="px-2.5 py-1 border border-slate-200 hover:border-[#3256a8] text-[#3256a8] rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right section (narrower: 5 cols) — Generate New Report */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card: Generate an Executive Report */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Generate an Executive Report
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Compile institutional data into a polished board briefing
              </p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                >
                  <option>Executive Summary</option>
                  <option>Board Brief</option>
                  <option>Academic Performance</option>
                  <option>Financial Overview</option>
                  <option>Accreditation Report</option>
                  <option>Department Comparison</option>
                  <option>Custom</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                >
                  <option>Semester 2, 2026 (Current)</option>
                  <option>Semester 1, 2026</option>
                  <option>Academic Year 2025–2026</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Scope</label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                >
                  <option>All University (18 Departments)</option>
                  <option>Computer Science</option>
                  <option>Medicine</option>
                  <option>Law</option>
                  <option>Business</option>
                  <option>Engineering</option>
                  <option>Arts & Humanities</option>
                </select>
              </div>

              {/* Format Selector: PDF and Word toggle buttons */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('PDF')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer ${
                      format === 'PDF'
                        ? 'bg-[#3256a8] border-[#3256a8] text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    PDF Document
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('Word')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer ${
                      format === 'Word'
                        ? 'bg-[#3256a8] border-[#3256a8] text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Word (.docx)
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Include AI narrative summary</span>
                  <button
                    type="button"
                    onClick={() => setIncludeAI(!includeAI)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      includeAI ? 'bg-[#3256a8]' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        includeAI ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Include data visualizations</span>
                  <button
                    type="button"
                    onClick={() => setIncludeViz(!includeViz)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      includeViz ? 'bg-[#3256a8]' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        includeViz ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full mt-2 py-3 px-4 bg-[#3256a8] hover:bg-[#284588] text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Compiling Live Data...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate Report
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Premium Blue-Bordered Info Card */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-3xl p-5 text-xs text-blue-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#3256a8]">
              <Sparkles className="w-4 h-4" />
              <span>Campus AI Standard Assurance</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800">
              All executive reports are compiled by the Campus AI from live university data and formatted to your institution&apos;s standard report structure. Average generation time: 45 seconds.
            </p>
          </div>

          {/* Scheduled Reports Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Scheduled Reports</h4>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Board Brief</span>
                  <span className="text-[11px] text-slate-500">
                    Auto-generates every month · Next: <span className="font-bold text-slate-700">Aug 1</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNotification('Schedule configuration opened for Board Brief.');
                    setTimeout(() => setNotification(null), 2500);
                  }}
                  className="text-[#3256a8] font-bold hover:underline cursor-pointer text-xs"
                >
                  Edit Schedule
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Semester Summary</span>
                  <span className="text-[11px] text-slate-500">
                    Auto-generates end of semester · Next: <span className="font-bold text-slate-700">Sep 15</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNotification('Schedule configuration opened for Semester Summary.');
                    setTimeout(() => setNotification(null), 2500);
                  }}
                  className="text-[#3256a8] font-bold hover:underline cursor-pointer text-xs"
                >
                  Edit Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW REPORT PREVIEW MODAL */}
      {viewingReport && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-slate-100 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#3256a8] uppercase">
                    {viewingReport.type} Report
                  </span>
                  {viewingReport.isAI && (
                    <span className="px-1.5 py-0.2 bg-blue-50 text-[#3256a8] border border-blue-200 rounded text-[9px] font-bold">
                      Campus AI
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  {viewingReport.name}
                </h3>
                <span className="text-xs text-slate-400">
                  Compiled {viewingReport.generatedDate} by {viewingReport.generatedBy}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingReport(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed overflow-y-auto flex-1 space-y-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Executive Summary</span>
                <p>{viewingReport.contentSnippet}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Key Performance Metrics</span>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Total Institutional Student Headcount: 4,821 active students</li>
                  <li>Aggregate University Pass Rate: 74% (Benchmark target: 75%)</li>
                  <li>Early Warning Advising Cases: 27 active students flagged</li>
                  <li>Bursar Collection Progress: $1.2M of $1.5M target (87% collection rate)</li>
                </ul>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Office of the Dean Endorsement</span>
                <p className="text-[11px] text-slate-500">
                  Approved for distribution to the Academic Council and Board of Trustees under Presidential decree No. 2026/04.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] font-mono text-slate-400">
                Format: {viewingReport.format}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewingReport(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownload(viewingReport);
                    setViewingReport(null);
                  }}
                  className="px-5 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
