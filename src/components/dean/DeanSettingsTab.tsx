import React, { useState } from 'react';
import {
  Sliders,
  Building,
  GraduationCap,
  Bell,
  ShieldCheck,
  Sparkles,
  Calendar,
  CheckCircle2,
  Save,
  AlertTriangle,
  Lock,
  Layers
} from 'lucide-react';

interface DeanSettingsTabProps {}

type SettingsCategory =
  | 'policy'
  | 'departments'
  | 'grading'
  | 'notifications'
  | 'security'
  | 'ai';

export const DeanSettingsTab: React.FC<DeanSettingsTabProps> = () => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('policy');
  const [notification, setNotification] = useState<string | null>(null);

  // Policy States
  const [minPassGrade, setMinPassGrade] = useState('60%');
  const [minGpaGoodStanding, setMinGpaGoodStanding] = useState('2.0');
  const [probationThreshold, setProbationThreshold] = useState('1.8');

  // Attendance Policy States
  const [mandatoryAttendance, setMandatoryAttendance] = useState('75%');
  const [attendanceWarningThreshold, setAttendanceWarningThreshold] = useState('80%');
  const [autoGenerateAbsenceWarning, setAutoGenerateAbsenceWarning] = useState(true);
  const [notifyDeptHeadThreshold, setNotifyDeptHeadThreshold] = useState(true);

  // Early Intervention States
  const [autoFlagGpa, setAutoFlagGpa] = useState(true);
  const [autoFlagAttendance, setAutoFlagAttendance] = useState(true);
  const [autoInterventionPlan, setAutoInterventionPlan] = useState(true);

  // Calendar States
  const [currentSemester, setCurrentSemester] = useState('Semester 2, 2026');
  const [semesterStart, setSemesterStart] = useState('2026-02-01');
  const [midTermWeek, setMidTermWeek] = useState('2026-03-25');
  const [finalExamsWeek, setFinalExamsWeek] = useState('2026-05-15');
  const [semesterEnd, setSemesterEnd] = useState('2026-05-30');

  // AI Feature States
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true);
  const [aiAutomatedGradingAudit, setAiAutomatedGradingAudit] = useState(true);
  const [aiBoardBriefSynthesis, setAiBoardBriefSynthesis] = useState(true);

  const handleSave = (sectionName: string) => {
    setNotification(`${sectionName} configurations saved and applied across all departments.`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-7">
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {notification}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 1. LEFT-HAND NAVIGATION LIST */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
            Institutional Settings
          </span>

          {[
            { id: 'policy', label: 'Academic Policy', icon: Sliders },
            { id: 'departments', label: 'Department Settings', icon: Building },
            { id: 'grading', label: 'Grading Scale & GPA', icon: GraduationCap },
            { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
            { id: 'security', label: 'Security & Access', icon: ShieldCheck },
            { id: 'ai', label: 'AI Features Configuration', icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveCategory(item.id as SettingsCategory)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#3256a8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* 2. RIGHT-HAND CONTENT PANELS */}
        <div className="lg:col-span-8 space-y-6">
          {/* PANEL 1: ACADEMIC POLICY (ACTIVE DEFAULT) */}
          {activeCategory === 'policy' && (
            <div className="space-y-6">
              {/* Card 1 — Pass/Fail Thresholds */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Pass/Fail Thresholds
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Define university-wide benchmark standards for course completion
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Minimum Passing Grade
                    </label>
                    <input
                      type="text"
                      value={minPassGrade}
                      onChange={(e) => setMinPassGrade(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#3256a8]"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Normally 60%</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Min GPA for Good Standing
                    </label>
                    <input
                      type="text"
                      value={minGpaGoodStanding}
                      onChange={(e) => setMinGpaGoodStanding(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#3256a8]"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Normally 2.0 / 4.0</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Probation Threshold
                    </label>
                    <input
                      type="text"
                      value={probationThreshold}
                      onChange={(e) => setProbationThreshold(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#3256a8]"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Triggers academic warning</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSave('Pass/Fail Thresholds')}
                    className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Card 2 — Attendance Policy */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Attendance Policy
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Standard institutional presence policies and automated registrar triggers
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Mandatory Attendance %
                    </label>
                    <input
                      type="text"
                      value={mandatoryAttendance}
                      onChange={(e) => setMandatoryAttendance(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#3256a8]"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Below this bars from final exam</span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Warning Threshold
                    </label>
                    <input
                      type="text"
                      value={attendanceWarningThreshold}
                      onChange={(e) => setAttendanceWarningThreshold(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#3256a8]"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Dispatches early warning notice</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">
                      Auto-generate absence warnings to students
                    </span>
                    <button
                      type="button"
                      onClick={() => setAutoGenerateAbsenceWarning(!autoGenerateAbsenceWarning)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        autoGenerateAbsenceWarning ? 'bg-[#3256a8]' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          autoGenerateAbsenceWarning ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">
                      Notify department head when student falls below threshold
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotifyDeptHeadThreshold(!notifyDeptHeadThreshold)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        notifyDeptHeadThreshold ? 'bg-[#3256a8]' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          notifyDeptHeadThreshold ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSave('Attendance Policy')}
                    className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Card 3 — Early Intervention & At-Risk Automation */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Early Intervention & At-Risk Automation
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Automated flagging protocols to prevent academic dismissal
                  </p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">
                      Auto-flag students with GPA below threshold
                    </span>
                    <button
                      type="button"
                      onClick={() => setAutoFlagGpa(!autoFlagGpa)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        autoFlagGpa ? 'bg-[#3256a8]' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          autoFlagGpa ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">
                      Auto-flag students with attendance below threshold
                    </span>
                    <button
                      type="button"
                      onClick={() => setAutoFlagAttendance(!autoFlagAttendance)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        autoFlagAttendance ? 'bg-[#3256a8]' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          autoFlagAttendance ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">
                      Auto-generate recommended intervention plan
                    </span>
                    <button
                      type="button"
                      onClick={() => setAutoInterventionPlan(!autoInterventionPlan)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        autoInterventionPlan ? 'bg-[#3256a8]' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          autoInterventionPlan ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSave('At-Risk Automation')}
                    className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Card 4 — Semester & Academic Calendar */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Semester & Academic Calendar
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure dates and milestones synchronized across student & faculty dashboards
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Current Active Semester
                    </label>
                    <input
                      type="text"
                      value={currentSemester}
                      onChange={(e) => setCurrentSemester(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#3256a8]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Semester Start Date
                    </label>
                    <input
                      type="date"
                      value={semesterStart}
                      onChange={(e) => setSemesterStart(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Mid-term Exams Week
                    </label>
                    <input
                      type="date"
                      value={midTermWeek}
                      onChange={(e) => setMidTermWeek(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Final Exams Week
                    </label>
                    <input
                      type="date"
                      value={finalExamsWeek}
                      onChange={(e) => setFinalExamsWeek(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Semester End Date
                    </label>
                    <input
                      type="date"
                      value={semesterEnd}
                      onChange={(e) => setSemesterEnd(e.target.value)}
                      className="w-full sm:w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSave('Academic Calendar')}
                    className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Update Academic Calendar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PANEL 2: DEPARTMENT SETTINGS */}
          {activeCategory === 'departments' && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Department Governance Settings
              </h3>
              <p className="text-xs text-slate-400">
                Department chair appointment authorizations and curriculum modification locks.
              </p>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    Require Dean approval for new course offerings
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-bold text-[10px]">
                    Enforced
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    Allow department chairs to modify course prerequisites
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold text-[10px]">
                    Disabled
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PANEL 3: GRADING SCALE & GPA */}
          {activeCategory === 'grading' && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                University 4.0 Grading System
              </h3>
              <p className="text-xs text-slate-400">
                Official institutional scale applied to transcript generation.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-black text-slate-900 block text-base">A+ / A</span>
                  <span className="text-slate-500 text-[11px]">90–100% · 4.00</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-black text-slate-900 block text-base">B+ / B</span>
                  <span className="text-slate-500 text-[11px]">80–89% · 3.00</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-black text-slate-900 block text-base">C+ / C</span>
                  <span className="text-slate-500 text-[11px]">70–79% · 2.00</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-black text-slate-900 block text-base">D / F</span>
                  <span className="text-rose-600 text-[11px]">&lt;70% · Warning</span>
                </div>
              </div>
            </div>
          )}

          {/* PANEL 4: NOTIFICATIONS */}
          {activeCategory === 'notifications' && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Executive Alert Protocols
              </h3>
              <p className="text-xs text-slate-400">
                Configure immediate push alerts for critical university metrics.
              </p>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    Instant SMS alert when department pass rate drops below 60%
                  </span>
                  <span className="text-emerald-700 font-bold">Enabled</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    Weekly Bursar collection digest emailed every Monday 8:00 AM
                  </span>
                  <span className="text-emerald-700 font-bold">Enabled</span>
                </div>
              </div>
            </div>
          )}

          {/* PANEL 5: SECURITY */}
          {activeCategory === 'security' && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Security & Role-Based Access Control
              </h3>
              <p className="text-xs text-slate-400">
                Authentication standards and registrar grade modification audits.
              </p>
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs space-y-2 text-blue-900">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#3256a8]" />
                  <span>Two-Factor Authentication Enforced</span>
                </div>
                <p className="text-[11px] text-blue-800">
                  All 18 Department Heads and System Administrators are bound to mandatory hardware or biometric 2FA for grade submissions.
                </p>
              </div>
            </div>
          )}

          {/* PANEL 6: AI FEATURES CONFIGURATION */}
          {activeCategory === 'ai' && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Campus AI Configuration
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage intelligent agent assistants and predictive analytics models
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      AI Tutor & Student Study Companion
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Permits 24/7 intelligent tutoring grounded in departmental course syllabi
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiAssistantEnabled(!aiAssistantEnabled)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      aiAssistantEnabled ? 'bg-[#3256a8]' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        aiAssistantEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Automated Grading Anomaly Audit
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Flags exam grading variances exceeding 15% between sections
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiAutomatedGradingAudit(!aiAutomatedGradingAudit)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      aiAutomatedGradingAudit ? 'bg-[#3256a8]' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        aiAutomatedGradingAudit ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      Board Brief Narrative Synthesis
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Allows one-click generation of narrative executive reports for trustees
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiBoardBriefSynthesis(!aiBoardBriefSynthesis)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      aiBoardBriefSynthesis ? 'bg-[#3256a8]' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        aiBoardBriefSynthesis ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleSave('AI Configuration')}
                  className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Save AI Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
