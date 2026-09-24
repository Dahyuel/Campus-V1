import React, { useState, useEffect } from 'react';
import { useDeptHeadAtRisk, useLogIntervention } from '../../hooks/useDeptHeadData';
import {
  AlertTriangle,
  Search,
  Download,
  UserCheck,
  Eye,
  Send,
  CheckCircle2,
  X,
  Clock,
  ChevronRight,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

interface DeptHeadAtRiskTabProps {
  onNavigateTab?: (tab: any) => void;
}

interface AtRiskStudent {
  id: string;
  name: string;
  studentId: string;
  year: string;
  course: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE';
  riskColor: 'red' | 'orange';
  gpa: number;
  signal: string;
  email: string;
  advisor?: string;
}

interface InterventionEntry {
  id: string;
  date: string;
  studentName: string;
  actionTaken: string;
  performer: string;
}

const MOCK_AT_RISK_STUDENTS: AtRiskStudent[] = [
  {
    id: 'ar-1',
    name: 'Sara Mahmoud',
    studentId: '202100187',
    year: 'Year 2',
    course: 'Networks',
    riskLevel: 'CRITICAL',
    riskColor: 'red',
    gpa: 2.4,
    signal: 'Attendance 58% · 4 missed assignments · Last login 9 days ago',
    email: 'sara.mahmoud@nilebyte.edu',
    advisor: 'Dr. Ahmed Dahy',
  },
  {
    id: 'ar-2',
    name: 'Dina Kamal',
    studentId: '202100391',
    year: 'Year 1',
    course: 'Mathematics',
    riskLevel: 'HIGH',
    riskColor: 'red',
    gpa: 2.1,
    signal: 'Attendance 55% · Grade declined 3 assessments · Missing 40% of deadlines',
    email: 'dina.kamal@nilebyte.edu',
  },
  {
    id: 'ar-3',
    name: 'Ahmed Tarek',
    studentId: '202100156',
    year: 'Year 2',
    course: 'Networks',
    riskLevel: 'HIGH',
    riskColor: 'red',
    gpa: 2.3,
    signal: 'Attendance 61% · Exam score 48% — significantly below class average',
    email: 'ahmed.tarek@nilebyte.edu',
  },
  {
    id: 'ar-4',
    name: 'Nour Ali',
    studentId: '202100312',
    year: 'Year 1',
    course: 'Mathematics',
    riskLevel: 'MODERATE',
    riskColor: 'orange',
    gpa: 2.9,
    signal: 'Attendance 74% — approaching threshold · 2 consecutive grade drops',
    email: 'nour.ali@nilebyte.edu',
  },
  {
    id: 'ar-5',
    name: 'Layla Ahmed',
    studentId: '202100445',
    year: 'Year 3',
    course: 'Data Structures',
    riskLevel: 'MODERATE',
    riskColor: 'orange',
    gpa: 2.6,
    signal: 'Community activity dropped to zero · Attendance 68%',
    email: 'layla.ahmed@nilebyte.edu',
  },
];

const INITIAL_LOGS: InterventionEntry[] = [
  {
    id: 'log-1',
    date: '3 Jul 2026',
    studentName: 'Sara Mahmoud',
    actionTaken: 'Academic advisor assigned — Dr. Ahmed Dahy',
    performer: 'Dept. Head',
  },
  {
    id: 'log-2',
    date: '1 Jul 2026',
    studentName: 'Ahmed Tarek',
    actionTaken: 'Warning email sent by system',
    performer: 'Campus System',
  },
  {
    id: 'log-3',
    date: '28 Jun 2026',
    studentName: 'Dina Kamal',
    actionTaken: 'Parent notified via SMS',
    performer: 'Admin',
  },
];

export const DeptHeadAtRiskTab: React.FC<DeptHeadAtRiskTabProps> = ({ onNavigateTab }) => {
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Risk Level');
  const [selectedStudent, setSelectedStudent] = useState<AtRiskStudent | null>(null);
  const [assignModalStudent, setAssignModalStudent] = useState<AtRiskStudent | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState('Dr. Ahmed Dahy');
  const [notification, setNotification] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const { data, isLoading } = useDeptHeadAtRisk();
  const logIntervention = useLogIntervention();
  const AT_RISK_STUDENTS = (data?.students as AtRiskStudent[]) ?? [];

  useEffect(() => {
    if (data?.logs) setLogs(data.logs);
  }, [data]);

  const filteredStudents = AT_RISK_STUDENTS.filter((s) => {
    if (courseFilter !== 'All' && s.course !== courseFilter) return false;
    if (riskFilter !== 'All' && s.riskLevel !== riskFilter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q) || s.course.toLowerCase().includes(q);
  }).sort((a, b) => {
    if (sortBy === 'Risk Level') {
      const order = { CRITICAL: 3, HIGH: 2, MODERATE: 1 };
      return order[b.riskLevel] - order[a.riskLevel];
    }
    if (sortBy === 'GPA') return a.gpa - b.gpa;
    return a.name.localeCompare(b.name);
  });

  const handleAssignAll = () => {
    setNotification('Batch Action: Academic advisory assignments dispatched for all 11 at-risk students.');
    const newLog: InterventionEntry = {
      id: `log-${Date.now()}`,
      date: 'Today',
      studentName: 'All 11 At-Risk Students',
      actionTaken: 'Assigned to Computer Science Faculty Advisory Committee',
      performer: 'Dept. Head',
    };
    setLogs((prev) => [newLog, ...prev]);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleConfirmAdvisor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalStudent) return;
    logIntervention.mutateAsync({
      studentId: assignModalStudent.studentId,
      action: `Academic advisor assigned — ${selectedAdvisor}`,
    }).then((entry) => {
      setLogs((prev) => [entry, ...prev]);
    });
    setNotification(`Academic Advisor ${selectedAdvisor} successfully assigned to ${assignModalStudent.name}.`);
    setAssignModalStudent(null);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleExport = () => {
    setNotification('CS At-Risk Student Cohort and Diagnostic Signals exported (Excel/PDF).');
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

      {/* 1. TOP ROW OF 3 STAT CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total At-Risk
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
              <AlertTriangle className="w-2.5 h-2.5" />
              action needed
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-rose-600 tracking-tight">11</span>
            <span className="text-xs text-slate-400 font-medium">1.2% of CS Dept</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              High / Critical
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
              urgent intervention
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-rose-600 tracking-tight">5</span>
            <span className="text-xs text-slate-400 font-medium">&lt;65% Attendance or GPA &lt;2.4</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Moderate
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              monitoring
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-600 tracking-tight">6</span>
            <span className="text-xs text-slate-400 font-medium">Warning Threshold</span>
          </div>
        </div>
      </section>

      {/* 2. FILTER BAR */}
      <section className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3256a8]"
            />
          </div>

          {/* Course filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#3256a8]"
          >
            <option value="All">All Courses</option>
            <option value="Networks">Networks</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Data Structures">Data Structures</option>
          </select>

          {/* Risk Level filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#3256a8]"
          >
            <option value="All">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
          </select>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:border-[#3256a8]"
          >
            <option value="Risk Level">Sort by: Risk Level</option>
            <option value="GPA">Sort by: GPA</option>
            <option value="Name">Sort by: Name</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end shrink-0">
          <button
            type="button"
            onClick={handleExport}
            className="flex-1 lg:flex-initial px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-2xl font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export List
          </button>
          <button
            type="button"
            onClick={handleAssignAll}
            className="flex-1 lg:flex-initial px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-2xl font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Assign All to Advisor
          </button>
        </div>
      </section>

      {/* 3. MAIN AT-RISK TABLE (EXPANDED CARD ROWS WITH 2 LINES) */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              At-Risk Student Diagnostic Queue
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated behavioral signals triggered by attendance drops and grade anomalies
            </p>
          </div>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            {filteredStudents.length} Students Pending Action
          </span>
        </div>

        <div className="space-y-3">
          {filteredStudents.map((s) => {
            const isCriticalOrHigh = s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH';
            const cardBg = isCriticalOrHigh
              ? 'bg-rose-50/40 border-rose-100 hover:bg-rose-50/70'
              : 'bg-amber-50/30 border-amber-100 hover:bg-amber-50/60';

            return (
              <div
                key={s.id}
                className={`p-4 rounded-2xl border ${cardBg} transition-all duration-200 text-xs space-y-2`}
              >
                {/* Line 1 — Main Columns */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 text-sm block">{s.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {s.studentId} · {s.year} · {s.course}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Risk Level Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        s.riskLevel === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700 border-rose-200'
                          : s.riskLevel === 'HIGH'
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {s.riskLevel}
                    </span>

                    {/* GPA */}
                    <div className="text-left font-mono">
                      <span className="text-[10px] text-slate-400 block font-sans">GPA</span>
                      <span className="font-black text-rose-600 text-xs">{s.gpa.toFixed(1)}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(s)}
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:border-[#3256a8] text-[#3256a8] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        View Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssignModalStudent(s)}
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        Assign Advisor
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onNavigateTab) onNavigateTab('messages');
                        }}
                        className="px-2.5 py-1 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                </div>

                {/* Line 2 — Signal Row (Indented, smaller gray text) */}
                <div className="pt-1 border-t border-slate-200/60 pl-2 flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>
                    <strong>Diagnostic Trigger:</strong> {s.signal}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. INTERVENTION LOG CARD */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Intervention Log</h3>
            <p className="text-xs text-slate-400">
              Timeline of advisory actions, system warnings, and parental notifications
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            {logs.length} Actions Logged
          </span>
        </div>

        <div className="space-y-2.5 pt-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-400 text-[11px] w-20 shrink-0">
                  {log.date}
                </span>
                <span className="font-bold text-slate-900 w-32 shrink-0">{log.studentName}</span>
                <span className="text-slate-700">{log.actionTaken}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-[#3256a8] border border-blue-100 shrink-0 self-start sm:self-auto">
                {log.performer}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. VIEW PROFILE MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-100 shadow-2xl relative text-xs space-y-4">
            <button
              type="button"
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-[#3256a8] uppercase tracking-wider block">
                At-Risk Student Diagnostic
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedStudent.name}</h3>
              <span className="text-slate-500 font-mono text-[11px]">
                ID: {selectedStudent.studentId} · {selectedStudent.year}
              </span>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-1">
              <strong>Flagged Signal:</strong>
              <p className="text-[11px]">{selectedStudent.signal}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Cumulative GPA</span>
                <strong className="text-rose-600 text-sm">{selectedStudent.gpa.toFixed(1)}</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Assigned Course</span>
                <strong className="text-slate-900">{selectedStudent.course}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const s = selectedStudent;
                  setSelectedStudent(null);
                  setAssignModalStudent(s);
                }}
                className="px-4 py-2 bg-[#3256a8] text-white rounded-xl font-bold"
              >
                Assign Advisor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. ASSIGN ADVISOR MODAL */}
      {assignModalStudent && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-100 shadow-2xl relative text-xs">
            <button
              type="button"
              onClick={() => setAssignModalStudent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold text-[#3256a8] uppercase tracking-wider block">
              Academic Intervention
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Assign Advisor to {assignModalStudent.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Select a Computer Science faculty advisor for targeted 1-on-1 academic counseling.
            </p>

            <form onSubmit={handleConfirmAdvisor} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Assigned Faculty Member
                </label>
                <select
                  value={selectedAdvisor}
                  onChange={(e) => setSelectedAdvisor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3256a8] font-semibold text-slate-800"
                >
                  <option value="Dr. Ahmed Dahy">Dr. Ahmed Dahy (Assistant Professor)</option>
                  <option value="Dr. Sara Nour">Dr. Sara Nour (Professor)</option>
                  <option value="Dr. Mostafa Hagras">Dr. Mostafa Hagras (Dept. Head)</option>
                  <option value="Dr. Youssef Samir">Dr. Youssef Samir (Assistant Professor)</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900">
                An automatic calendar invitation and student diagnostic file will be forwarded to the assigned advisor.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalStudent(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl font-bold shadow-xs"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
