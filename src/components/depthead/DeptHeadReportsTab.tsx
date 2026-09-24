import React, { useState, useEffect } from 'react';
import { useDeptHeadReports } from '../../hooks/useDeptHeadData';
import {
  FileText,
  Search,
  Download,
  Eye,
  Sparkles,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Info,
  Calendar,
  Layers,
  Filter
} from 'lucide-react';

interface DeptHeadReportsTabProps {
  searchQuery?: string;
  onNavigateTab?: (tab: any) => void;
}

interface ReportItem {
  id: string;
  name: string;
  type: string;
  date: string;
  generatedBy: string;
  isAi: boolean;
  format: 'PDF' | 'Excel';
  summary?: string;
}

const MOCK_INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep-1',
    name: 'CS Department Performance Report',
    type: 'Academic',
    date: '7 Jul 2026',
    generatedBy: 'Campus AI',
    isAi: true,
    format: 'PDF',
    summary: 'Comprehensive review of 18 courses, 946 students, and 24 faculty members. Highlights Artificial Intelligence and Algorithms high performance alongside Networks intervention signals.',
  },
  {
    id: 'rep-2',
    name: 'Faculty Load Report — CS Dept',
    type: 'HR',
    date: '5 Jul 2026',
    generatedBy: 'Dept. Head',
    isAi: false,
    format: 'Excel',
    summary: 'Detailed workload balance across 24 faculty instructors. Confirms all members abide by the 16 hours/week maximum teaching cap with two members on approved sabbatical/leave.',
  },
  {
    id: 'rep-3',
    name: 'At-Risk Intervention Report — CS',
    type: 'Academic',
    date: '3 Jul 2026',
    generatedBy: 'Campus AI',
    isAi: true,
    format: 'PDF',
    summary: 'Behavioral analytics of 11 flagged at-risk students, tracking attendance drops below 65% and consecutive assessment declines.',
  },
  {
    id: 'rep-4',
    name: 'Course Pass Rate Analysis — Semester 2',
    type: 'Academic',
    date: '1 Jul 2026',
    generatedBy: 'Campus AI',
    isAi: true,
    format: 'PDF',
    summary: 'Comparative course pass rates between Semester 1 and Semester 2, identifying a department average of 76.4%.',
  },
  {
    id: 'rep-5',
    name: 'Community Activity Report — CS',
    type: 'Engagement',
    date: '28 Jun 2026',
    generatedBy: 'Campus AI',
    isAi: true,
    format: 'PDF',
    summary: 'Course discussion board engagement metrics, student peer responses, and AI Tutor query volume in Computer Science subjects.',
  },
];

export const DeptHeadReportsTab: React.FC<DeptHeadReportsTabProps> = ({
  searchQuery = '',
  onNavigateTab,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const { data: reportsData, isLoading } = useDeptHeadReports();

  useEffect(() => {
    if (reportsData) setReports(reportsData);
  }, [reportsData]);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [reportType, setReportType] = useState('Department Performance');
  const [semester, setSemester] = useState('Semester 2 (2026)');
  const [courseScope, setCourseScope] = useState('All CS Courses');
  const [format, setFormat] = useState<'PDF' | 'Excel'>('PDF');
  const [includeAiSummary, setIncludeAiSummary] = useState(true);
  const [includeBreakdown, setIncludeBreakdown] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const combinedSearch = (searchQuery || localSearch).trim().toLowerCase();

  const filteredReports = reports.filter((r) => {
    if (!combinedSearch) return true;
    return (
      r.name.toLowerCase().includes(combinedSearch) ||
      r.type.toLowerCase().includes(combinedSearch) ||
      r.generatedBy.toLowerCase().includes(combinedSearch)
    );
  });

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      const newRep: ReportItem = {
        id: `rep-${Date.now()}`,
        name: `${reportType} — CS Dept (${semester.split(' ')[0]})`,
        type: 'Academic',
        date: 'Today',
        generatedBy: includeAiSummary ? 'Campus AI' : 'Dept. Head',
        isAi: includeAiSummary,
        format: format,
        summary: `Live synthesized report generated for ${courseScope} during ${semester}. Compiled automatically from database metrics.`,
      };

      setReports((prev) => [newRep, ...prev]);
      setIsGenerating(false);
      setNotification(`Report "${newRep.name}" compiled and saved to library.`);
      setTimeout(() => setNotification(null), 3500);
    }, 800);
  };

  const handleDownload = (rep: ReportItem) => {
    setNotification(`Downloaded "${rep.name}.${rep.format.toLowerCase()}".`);
    setTimeout(() => setNotification(null), 3000);
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

      {/* TWO SECTIONS SIDE BY SIDE (Left: Reports Library, Right: Generate New Report) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* ======================================================== */}
        {/* LEFT SECTION: Reports Library (Wider: 7 cols)            */}
        {/* ======================================================== */}
        <section className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Reports Library</h3>
              <p className="text-xs text-slate-400">
                Archived departmental evaluations and accreditation reports
              </p>
            </div>

            {/* Search Input on Top Right */}
            <div className="relative min-w-[200px]">
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
                  <th className="py-3 px-2">Report Name</th>
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Generated By</th>
                  <th className="py-3 px-2">Format</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 line-clamp-1">{rep.name}</span>
                        {rep.isAi && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#3256a8] text-[9px] font-black tracking-wide shrink-0 border border-blue-100 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            AI
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-slate-600">{rep.type}</td>
                    <td className="py-3.5 px-2 font-mono text-slate-500 whitespace-nowrap">
                      {rep.date}
                    </td>
                    <td className="py-3.5 px-2 text-slate-700">{rep.generatedBy}</td>
                    <td className="py-3.5 px-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {rep.format}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedReport(rep)}
                          className="px-2 py-1 bg-white border border-slate-200 hover:border-[#3256a8] text-[#3256a8] rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(rep)}
                          className="p-1 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ======================================================== */}
        {/* RIGHT SECTION: Generate New Report (Narrower: 5 cols)    */}
        {/* ======================================================== */}
        <section className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
            <span className="text-[10px] font-bold text-[#3256a8] uppercase tracking-wider block">
              Document Synthesizer
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5 mb-4">
              Generate a Department Report
            </h3>

            <form onSubmit={handleGenerateReport} className="space-y-4 text-xs">
              {/* Report Type */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                >
                  <option value="Department Performance">Department Performance</option>
                  <option value="Faculty Load">Faculty Load</option>
                  <option value="At-Risk Summary">At-Risk Summary</option>
                  <option value="Course Analysis">Course Analysis</option>
                  <option value="Community Engagement">Community Engagement</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                >
                  <option value="Semester 2 (2026)">Semester 2 (2026)</option>
                  <option value="Semester 1 (2026)">Semester 1 (2026)</option>
                  <option value="Academic Year 2025/2026">Academic Year 2025/2026</option>
                </select>
              </div>

              {/* Course Scope */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Course Scope</label>
                <select
                  value={courseScope}
                  onChange={(e) => setCourseScope(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                >
                  <option value="All CS Courses">All CS Courses (18 modules)</option>
                  <option value="CS-301 (Data Structures)">CS-301 (Data Structures)</option>
                  <option value="CS-303 (Networks)">CS-303 (Networks)</option>
                  <option value="CS-401 (Artificial Intelligence)">CS-401 (Artificial Intelligence)</option>
                  <option value="MATH-201 (Mathematics)">MATH-201 (Mathematics)</option>
                </select>
              </div>

              {/* Format selector toggle buttons */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Output Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('PDF')}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      format === 'PDF'
                        ? 'bg-[#3256a8] text-white border-[#3256a8] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    PDF Document
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('Excel')}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      format === 'Excel'
                        ? 'bg-[#3256a8] text-white border-[#3256a8] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Excel Spreadsheet
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 pt-1">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#3256a8]" />
                    Include AI narrative summary
                  </span>
                  <input
                    type="checkbox"
                    checked={includeAiSummary}
                    onChange={(e) => setIncludeAiSummary(e.target.checked)}
                    className="w-4 h-4 text-[#3256a8] rounded border-slate-300 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer select-none">
                  <span className="font-semibold text-slate-800">
                    Include course-by-course breakdown
                  </span>
                  <input
                    type="checkbox"
                    checked={includeBreakdown}
                    onChange={(e) => setIncludeBreakdown(e.target.checked)}
                    className="w-4 h-4 text-[#3256a8] rounded border-slate-300 focus:ring-0"
                  />
                </label>
              </div>

              {/* Large Generate Report Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 mt-2"
              >
                {isGenerating ? (
                  <span>Compiling Live Metrics...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Report
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Blue-bordered Info Card */}
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-3xl text-xs space-y-1.5 text-blue-900">
            <div className="flex items-center gap-2 font-bold text-blue-950">
              <Info className="w-4 h-4 text-[#3256a8]" />
              <span>Computer Science Scope</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800">
              Reports are scoped to the Computer Science department only. Data is pulled live from the platform and compiled instantly.
            </p>
          </div>
        </section>
      </div>

      {/* VIEW REPORT PREVIEW MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-100 shadow-2xl relative text-xs space-y-4">
            <button
              type="button"
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-[#3256a8] uppercase tracking-wider block">
                {selectedReport.type} Report · {selectedReport.format}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedReport.name}</h3>
              <span className="text-slate-500 font-mono text-[11px]">
                Generated by {selectedReport.generatedBy} on {selectedReport.date}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-slate-700 leading-relaxed">
              <strong>Executive Synthesis:</strong>
              <p className="text-[11px]">{selectedReport.summary}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownload(selectedReport);
                  setSelectedReport(null);
                }}
                className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
