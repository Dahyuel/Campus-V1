import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  GraduationCap,
  ShieldCheck,
  Lock,
  Save,
  CheckCircle2,
  Upload,
  Plus,
  Trash2,
  Download,
  RefreshCw,
  Clock,
  KeyRound,
  FileText,
  AlertCircle
} from 'lucide-react';

interface AcademicEvent {
  id: string;
  name: string;
  semester: string;
  startDate: string;
  endDate: string;
  type: 'Term' | 'Exam' | 'Deadline' | 'Holiday';
}

const INITIAL_EVENTS: AcademicEvent[] = [
  { id: 'ev-1', name: 'Semester 1 Instruction Period', semester: 'Fall 2024', startDate: '01 Sep 2024', endDate: '15 Dec 2024', type: 'Term' },
  { id: 'ev-2', name: 'Add/Drop Course Deadline', semester: 'Fall 2024', startDate: '15 Sep 2024', endDate: '15 Sep 2024', type: 'Deadline' },
  { id: 'ev-3', name: 'Midterm Examination Week', semester: 'Fall 2024', startDate: '25 Oct 2024', endDate: '01 Nov 2024', type: 'Exam' },
  { id: 'ev-4', name: 'Semester 1 Final Examinations', semester: 'Fall 2024', startDate: '18 Dec 2024', endDate: '05 Jan 2025', type: 'Exam' },
  { id: 'ev-5', name: 'Mid-Year Winter Recess', semester: 'Winter', startDate: '06 Jan 2025', endDate: '20 Jan 2025', type: 'Holiday' },
  { id: 'ev-6', name: 'Semester 2 Instruction Period', semester: 'Spring 2025', startDate: '25 Jan 2025', endDate: '15 May 2025', type: 'Term' },
];

interface GradeScale {
  letter: string;
  minPct: number;
  maxPct: number;
  gpa: number;
  description: string;
}

const INITIAL_GRADE_SCALES: GradeScale[] = [
  { letter: 'A+', minPct: 97, maxPct: 100, gpa: 4.0, description: 'High Distinction' },
  { letter: 'A', minPct: 93, maxPct: 96, gpa: 4.0, description: 'Distinction' },
  { letter: 'A-', minPct: 90, maxPct: 92, gpa: 3.7, description: 'Excellent' },
  { letter: 'B+', minPct: 87, maxPct: 89, gpa: 3.3, description: 'Very Good' },
  { letter: 'B', minPct: 83, maxPct: 86, gpa: 3.0, description: 'Good' },
  { letter: 'C+', minPct: 77, maxPct: 79, gpa: 2.3, description: 'Satisfactory' },
  { letter: 'C', minPct: 73, maxPct: 76, gpa: 2.0, description: 'Pass' },
  { letter: 'D', minPct: 60, maxPct: 69, gpa: 1.0, description: 'Conditional Pass' },
  { letter: 'F', minPct: 0, maxPct: 59, gpa: 0.0, description: 'Fail' },
];

interface RolePermission {
  role: 'Admin' | 'Faculty' | 'Student' | 'Staff';
  viewGrades: boolean;
  editGrades: boolean;
  viewFinances: boolean;
  manageEnrollment: boolean;
  broadcastMessages: boolean;
  systemSettings: boolean;
}

const INITIAL_PERMISSIONS: RolePermission[] = [
  { role: 'Admin', viewGrades: true, editGrades: true, viewFinances: true, manageEnrollment: true, broadcastMessages: true, systemSettings: true },
  { role: 'Faculty', viewGrades: true, editGrades: true, viewFinances: false, manageEnrollment: false, broadcastMessages: true, systemSettings: false },
  { role: 'Student', viewGrades: true, editGrades: false, viewFinances: false, manageEnrollment: false, broadcastMessages: false, systemSettings: false },
  { role: 'Staff', viewGrades: false, editGrades: false, viewFinances: true, manageEnrollment: true, broadcastMessages: true, systemSettings: false },
];

export const AdminSettingsTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'university-profile' | 'academic-calendar' | 'grade-scales' | 'user-permissions' | 'security-backups'
  >('university-profile');

  // University Profile state
  const [univName, setUnivName] = useState('NileByte University of Science & Technology');
  const [chancellor, setChancellor] = useState('Prof. Dr. Magdi Yacoub');
  const [contactEmail, setContactEmail] = useState('chancellor.office@nilebyte.edu');
  const [timezone, setTimezone] = useState('Africa/Cairo (UTC+03:00)');
  const [academicYearStart, setAcademicYearStart] = useState('2024-09-01');
  const [academicYearEnd, setAcademicYearEnd] = useState('2025-06-30');

  // Academic Calendar state
  const [events, setEvents] = useState<AcademicEvent[]>(INITIAL_EVENTS);

  // Grade scales state
  const [gradeScales, setGradeScales] = useState<GradeScale[]>(INITIAL_GRADE_SCALES);

  // Permissions state
  const [permissions, setPermissions] = useState<RolePermission[]>(INITIAL_PERMISSIONS);

  // Security state
  const [lastBackup, setLastBackup] = useState('Today at 03:00 AM UTC (Automated)');
  const [twoFactorAll, setTwoFactorAll] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const navItems = [
    { id: 'university-profile' as const, label: 'University Profile', icon: Building2 },
    { id: 'academic-calendar' as const, label: 'Academic Calendar', icon: Calendar },
    { id: 'grade-scales' as const, label: 'Grade Scales & GPA', icon: GraduationCap },
    { id: 'user-permissions' as const, label: 'User Permissions', icon: ShieldCheck },
    { id: 'security-backups' as const, label: 'Security & Backups', icon: Lock },
  ];

  const handleBackupNow = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      setLastBackup('Just now (Manual Snapshot)');
      showToast('Cloud database and storage snapshot encrypted & stored.');
    }, 1200);
  };

  const handlePermissionToggle = (role: string, field: keyof Omit<RolePermission, 'role'>) => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.role === role) {
          return { ...p, [field]: !p[field] };
        }
        return p;
      })
    );
  };

  const handleGradeScaleChange = (index: number, field: 'minPct' | 'gpa', val: number) => {
    setGradeScales((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: val } : g))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3256a8] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Settings Grid: Left Nav + Right Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* ======================================================== */}
        {/* Left Vertical Navigation Tabs (col-span-4)               */}
        {/* ======================================================== */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-1.5">
            <div className="px-4 py-3 border-b border-slate-100 mb-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">System Settings</h3>
              <p className="text-xs text-slate-400 mt-0.5">Global configuration and academic policies</p>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/80 text-[#3256a8] shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#3256a8]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* Right Content Area (col-span-8)                          */}
        {/* ======================================================== */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
            {/* 1. UNIVERSITY PROFILE */}
            {activeTab === 'university-profile' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showToast('University profile settings successfully saved.');
                }}
                className="space-y-6"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900">University Profile</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Official institution credentials, seal, and contact info</p>
                </div>

                {/* Logo Upload area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">University Emblem / Seal</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-[#3256a8] flex items-center justify-center font-extrabold text-lg shadow-2xs">
                      NUST
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => showToast('Emblem file browser dialog opened.')}
                        className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Upload New Logo</span>
                      </button>
                      <span className="text-[11px] text-slate-400 block mt-1">PNG, SVG or JPG (min 512x512px)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official University Name</label>
                    <input
                      type="text"
                      required
                      value={univName}
                      onChange={(e) => setUnivName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-hidden focus:border-[#3256a8]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chancellor / President</label>
                    <input
                      type="text"
                      required
                      value={chancellor}
                      onChange={(e) => setChancellor(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden focus:border-[#3256a8]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Executive Contact Email</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden focus:border-[#3256a8]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Campus Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-hidden focus:border-[#3256a8]"
                    >
                      <option value="Africa/Cairo (UTC+03:00)">Africa/Cairo (UTC+03:00)</option>
                      <option value="Asia/Riyadh (UTC+03:00)">Asia/Riyadh (UTC+03:00)</option>
                      <option value="Europe/London (UTC+01:00)">Europe/London (UTC+01:00)</option>
                      <option value="America/New_York (UTC-04:00)">America/New_York (UTC-04:00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Academic Year Start Date</label>
                    <input
                      type="date"
                      value={academicYearStart}
                      onChange={(e) => setAcademicYearStart(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden focus:border-[#3256a8]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Academic Year End Date</label>
                    <input
                      type="date"
                      value={academicYearEnd}
                      onChange={(e) => setAcademicYearEnd(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden focus:border-[#3256a8]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            )}

            {/* 2. ACADEMIC CALENDAR */}
            {activeTab === 'academic-calendar' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Academic Calendar</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Official semester milestones, examination periods, and recess dates</p>
                  </div>
                  <button
                    onClick={() => {
                      const name = prompt('Event Title:');
                      if (name) {
                        const newEv: AcademicEvent = {
                          id: `ev-${Date.now()}`,
                          name,
                          semester: 'Fall 2024',
                          startDate: '10 Oct 2024',
                          endDate: '12 Oct 2024',
                          type: 'Exam',
                        };
                        setEvents([...events, newEv]);
                        showToast(`Added event: ${name}`);
                      }
                    }}
                    className="px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Event</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3">Event Name</th>
                        <th className="py-3 px-3">Semester</th>
                        <th className="py-3 px-3">Start Date</th>
                        <th className="py-3 px-3">End Date</th>
                        <th className="py-3 px-3">Classification</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {events.map((ev) => (
                        <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-3 font-bold text-slate-900">{ev.name}</td>
                          <td className="py-3.5 px-3 text-slate-600 font-medium">{ev.semester}</td>
                          <td className="py-3.5 px-3 text-slate-700">{ev.startDate}</td>
                          <td className="py-3.5 px-3 text-slate-700">{ev.endDate}</td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              ev.type === 'Exam'
                                ? 'bg-amber-50 text-amber-700'
                                : ev.type === 'Deadline'
                                ? 'bg-red-50 text-red-600'
                                : ev.type === 'Holiday'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-blue-50 text-[#3256a8]'
                            }`}>
                              {ev.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={() => {
                                setEvents(events.filter((e) => e.id !== ev.id));
                                showToast(`Removed ${ev.name}`);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. GRADE SCALES & GPA */}
            {activeTab === 'grade-scales' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Grade Scales & GPA Standards</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Configure 4.0 scale points, percentage brackets, and descriptors</p>
                  </div>
                  <button
                    onClick={() => showToast('Grade scales and GPA rules successfully updated.')}
                    className="px-5 py-2 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Scales</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3">Letter Grade</th>
                        <th className="py-3 px-3">Min %</th>
                        <th className="py-3 px-3">Max %</th>
                        <th className="py-3 px-3">GPA Points (4.0 Max)</th>
                        <th className="py-3 px-3">Standing Descriptor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {gradeScales.map((gs, idx) => (
                        <tr key={gs.letter} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-extrabold text-slate-900 font-mono text-sm">{gs.letter}</td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              value={gs.minPct}
                              onChange={(e) => handleGradeScaleChange(idx, 'minPct', Number(e.target.value))}
                              className="w-16 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-hidden focus:border-[#3256a8]"
                            />
                            <span className="ml-1 text-slate-400">%</span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-bold">{gs.maxPct}%</td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              step="0.1"
                              value={gs.gpa}
                              onChange={(e) => handleGradeScaleChange(idx, 'gpa', Number(e.target.value))}
                              className="w-16 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-hidden focus:border-[#3256a8]"
                            />
                          </td>
                          <td className="py-3 px-3 text-slate-700">{gs.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. USER PERMISSIONS */}
            {activeTab === 'user-permissions' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Role-Based Access Control (RBAC)</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Define platform capability boundaries for university constituencies</p>
                  </div>
                  <button
                    onClick={() => showToast('Role permissions updated across the university directory.')}
                    className="px-5 py-2 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Permissions</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3">System Role</th>
                        <th className="py-3 px-3 text-center">View Grades</th>
                        <th className="py-3 px-3 text-center">Edit Grades</th>
                        <th className="py-3 px-3 text-center">View Finances</th>
                        <th className="py-3 px-3 text-center">Manage Enrollment</th>
                        <th className="py-3 px-3 text-center">Broadcast Msg</th>
                        <th className="py-3 px-3 text-center">System Settings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {permissions.map((p) => (
                        <tr key={p.role} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-3 font-extrabold text-slate-900">{p.role}</td>
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={p.viewGrades}
                              onChange={() => handlePermissionToggle(p.role, 'viewGrades')}
                              className="w-4 h-4 rounded text-[#3256a8] accent-[#3256a8] cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={p.editGrades}
                              onChange={() => handlePermissionToggle(p.role, 'editGrades')}
                              className="w-4 h-4 rounded text-[#3256a8] accent-[#3256a8] cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={p.viewFinances}
                              onChange={() => handlePermissionToggle(p.role, 'viewFinances')}
                              className="w-4 h-4 rounded text-[#3256a8] accent-[#3256a8] cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={p.manageEnrollment}
                              onChange={() => handlePermissionToggle(p.role, 'manageEnrollment')}
                              className="w-4 h-4 rounded text-[#3256a8] accent-[#3256a8] cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={p.broadcastMessages}
                              onChange={() => handlePermissionToggle(p.role, 'broadcastMessages')}
                              className="w-4 h-4 rounded text-[#3256a8] accent-[#3256a8] cursor-pointer"
                            />
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={p.systemSettings}
                              onChange={() => handlePermissionToggle(p.role, 'systemSettings')}
                              className="w-4 h-4 rounded text-[#3256a8] accent-[#3256a8] cursor-pointer"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. SECURITY & BACKUPS */}
            {activeTab === 'security-backups' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900">Security & Automated Backups</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Database snapshot frequency, encryption keys, and authentication hardening</p>
                </div>

                {/* Backup Status Card */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Disaster Recovery & Snapshot
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm mt-1 block">
                      {lastBackup}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
                      Stored across 3 multi-region geo-redundant storage vaults
                    </span>
                  </div>

                  <button
                    onClick={handleBackupNow}
                    disabled={isBackingUp}
                    className="px-4 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
                    <span>{isBackingUp ? 'Creating Snapshot...' : 'Backup Now'}</span>
                  </button>
                </div>

                {/* Security Configurations */}
                <div className="space-y-4 text-xs">
                  {/* Two-Factor Authentication Toggle */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Enforce Two-Factor Authentication (2FA)</span>
                      <span className="text-[11px] text-slate-500">Require TOTP or hardware security keys for all faculty & administrative staff</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTwoFactorAll(!twoFactorAll)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        twoFactorAll ? 'bg-[#3256a8]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          twoFactorAll ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Session Timeout */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Admin Session Inactivity Timeout</span>
                      <span className="text-[11px] text-slate-500">Automatically logout inactive administrator portal sessions</span>
                    </div>
                    <select
                      value={sessionTimeout}
                      onChange={(e) => {
                        setSessionTimeout(e.target.value);
                        showToast(`Session timeout set to ${e.target.value} minutes.`);
                      }}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                    >
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="60">60 Minutes</option>
                      <option value="120">2 Hours</option>
                    </select>
                  </div>

                  {/* Audit Logs Download */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">System Compliance & Security Audit Trail</span>
                      <span className="text-[11px] text-slate-500">Full tamper-evident logs of logins, grade modifications, and finance transactions</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('Audit trail logs (.jsonl.gz) download initiated.')}
                      className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs text-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Download Audit Log</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
