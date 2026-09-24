import React, { useState } from 'react';
import {
  User,
  Building2,
  Sliders,
  BrainCircuit,
  Bell,
  CheckCircle2,
  Save,
  Camera,
  Info,
  ShieldCheck
} from 'lucide-react';

interface DeptHeadSettingsTabProps {
  onNavigateTab?: (tab: any) => void;
}

export const DeptHeadSettingsTab: React.FC<DeptHeadSettingsTabProps> = () => {
  // Section 1: Personal Profile
  const [name, setName] = useState('Dr. Mostafa Hagras');
  const [title, setTitle] = useState('Department Head — Computer Science');
  const [email, setEmail] = useState('mostafa.hagras@nilebyte.edu');
  const [phone, setPhone] = useState('+20 100 123 4567');
  const [office, setOffice] = useState('Building B, Room 402');
  const [officeHours, setOfficeHours] = useState('Mon/Wed 10:00–12:00');

  // Section 2: Department Configuration & Thresholds
  const [attendanceThreshold, setAttendanceThreshold] = useState(65);
  const [gpaThreshold, setGpaThreshold] = useState(2.5);
  const [missedAssignmentsThreshold, setMissedAssignmentsThreshold] = useState(3);

  // Section 3: Course Material / RAG Policy
  const [aiTutorAccess, setAiTutorAccess] = useState(true);
  const [autoIndexMaterials, setAutoIndexMaterials] = useState(true);
  const [minCoveragePct, setMinCoveragePct] = useState(70);

  // Section 4: Notification Preferences
  const [notifications, setNotifications] = useState({
    atRisk: { email: true, inApp: true },
    facultyLeave: { email: true, inApp: true },
    passRateDrop: { email: true, inApp: true },
    weeklyDigest: { email: true, inApp: false },
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-20 relative">
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Computer Science Department configurations and personal profile saved successfully.
        </div>
      )}

      {/* SECTION 1 — PERSONAL PROFILE */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-4 h-4 text-[#3256a8]" />
          <h3 className="text-base font-bold text-slate-900">Personal Profile</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar & Change Photo */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-slate-200 relative group shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
                alt="Profile"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Camera className="w-3 h-3 text-slate-500" />
              Change Photo
            </button>
          </div>

          {/* Input Fields */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs w-full">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3256a8] font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Academic Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3256a8] font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3256a8] font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Direct Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3256a8] font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Office Location</label>
              <input
                type="text"
                value={office}
                onChange={(e) => setOffice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3256a8] font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Office Hours</label>
              <input
                type="text"
                value={officeHours}
                onChange={(e) => setOfficeHours(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3256a8] font-semibold text-slate-900"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — DEPARTMENT CONFIGURATION */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Building2 className="w-4 h-4 text-[#3256a8]" />
          <h3 className="text-base font-bold text-slate-900">Department Configuration</h3>
        </div>

        {/* Display-only metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
            <strong className="block text-slate-900 text-sm mt-0.5">Computer Science</strong>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Faculty Count</span>
            <strong className="block text-slate-900 text-sm mt-0.5">24 Active Faculty</strong>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Student Enrolled</span>
            <strong className="block text-slate-900 text-sm mt-0.5">946 CS Students</strong>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active Courses</span>
            <strong className="block text-slate-900 text-sm mt-0.5">18 Modules</strong>
          </div>
        </div>

        {/* At-Risk Threshold Settings */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-slate-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              At-Risk Diagnostic Thresholds
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-700">Attendance Warning</label>
                <span className="font-mono font-black text-rose-600">&lt; {attendanceThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="80"
                step="5"
                value={attendanceThreshold}
                onChange={(e) => setAttendanceThreshold(Number(e.target.value))}
                className="w-full accent-[#3256a8]"
              />
              <span className="text-[10px] text-slate-400 block">Standard: 65%</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-700">GPA Warning Threshold</label>
                <span className="font-mono font-black text-rose-600">&lt; {gpaThreshold.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="3.0"
                step="0.1"
                value={gpaThreshold}
                onChange={(e) => setGpaThreshold(Number(e.target.value))}
                className="w-full accent-[#3256a8]"
              />
              <span className="text-[10px] text-slate-400 block">Standard: 2.5 GPA</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-700">Consecutive Missed Work</label>
                <span className="font-mono font-black text-rose-600">
                  {missedAssignmentsThreshold} tasks
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={missedAssignmentsThreshold}
                onChange={(e) => setMissedAssignmentsThreshold(Number(e.target.value))}
                className="w-full accent-[#3256a8]"
              />
              <span className="text-[10px] text-slate-400 block">Default: 3 assignments</span>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl text-[11px] text-blue-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#3256a8] shrink-0" />
            <span>
              Changing these thresholds affects which students appear in your At-Risk tab and triggers automated warning notifications.
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 3 — COURSE MATERIAL / RAG POLICY */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <BrainCircuit className="w-4 h-4 text-[#3256a8]" />
          <h3 className="text-base font-bold text-slate-900">Course Material / RAG Policy</h3>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer select-none">
            <div>
              <span className="font-bold text-slate-900 block">AI Tutor Course Access</span>
              <span className="text-slate-500 text-[11px]">
                Allow students to query Course AI Tutor on all active CS courses
              </span>
            </div>
            <input
              type="checkbox"
              checked={aiTutorAccess}
              onChange={(e) => setAiTutorAccess(e.target.checked)}
              className="w-4 h-4 text-[#3256a8] rounded border-slate-300 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer select-none">
            <div>
              <span className="font-bold text-slate-900 block">Auto-Index Uploaded Materials</span>
              <span className="text-slate-500 text-[11px]">
                Automatically vectorize and ingest faculty slide decks, syllabi, and assignment PDFs
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoIndexMaterials}
              onChange={(e) => setAutoIndexMaterials(e.target.checked)}
              className="w-4 h-4 text-[#3256a8] rounded border-slate-300 focus:ring-0"
            />
          </label>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900">Minimum Material Coverage</span>
              <span className="font-mono font-bold text-[#3256a8]">{minCoveragePct}%</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Minimum coverage percentage required before AI is enabled for a course.
            </p>
            <input
              type="range"
              min="50"
              max="90"
              step="5"
              value={minCoveragePct}
              onChange={(e) => setMinCoveragePct(Number(e.target.value))}
              className="w-full accent-[#3256a8]"
            />
          </div>
        </div>
      </section>

      {/* SECTION 4 — NOTIFICATION PREFERENCES */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Bell className="w-4 h-4 text-[#3256a8]" />
          <h3 className="text-base font-bold text-slate-900">Notification Preferences</h3>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {/* Item 1 */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">At-Risk Student Flagged</span>
              <span className="text-slate-500 text-[11px]">
                Triggered when a student drops below threshold
              </span>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={notifications.atRisk.email}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      atRisk: { ...notifications.atRisk, email: e.target.checked },
                    })
                  }
                  className="w-3.5 h-3.5 rounded text-[#3256a8] border-slate-300"
                />
                Email
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={notifications.atRisk.inApp}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      atRisk: { ...notifications.atRisk, inApp: e.target.checked },
                    })
                  }
                  className="w-3.5 h-3.5 rounded text-[#3256a8] border-slate-300"
                />
                In-App
              </label>
            </div>
          </div>

          {/* Item 2 */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Faculty Leave Request Submitted</span>
              <span className="text-slate-500 text-[11px]">
                Department member sabbatical or absence
              </span>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={notifications.facultyLeave.email}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      facultyLeave: { ...notifications.facultyLeave, email: e.target.checked },
                    })
                  }
                  className="w-3.5 h-3.5 rounded text-[#3256a8] border-slate-300"
                />
                Email
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={notifications.facultyLeave.inApp}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      facultyLeave: { ...notifications.facultyLeave, inApp: e.target.checked },
                    })
                  }
                  className="w-3.5 h-3.5 rounded text-[#3256a8] border-slate-300"
                />
                In-App
              </label>
            </div>
          </div>

          {/* Item 3 */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Course Pass Rate Drops Below Threshold</span>
              <span className="text-slate-500 text-[11px]">
                Alert when pass rate falls below 65%
              </span>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={notifications.passRateDrop.email}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      passRateDrop: { ...notifications.passRateDrop, email: e.target.checked },
                    })
                  }
                  className="w-3.5 h-3.5 rounded text-[#3256a8] border-slate-300"
                />
                Email
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={notifications.passRateDrop.inApp}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      passRateDrop: { ...notifications.passRateDrop, inApp: e.target.checked },
                    })
                  }
                  className="w-3.5 h-3.5 rounded text-[#3256a8] border-slate-300"
                />
                In-App
              </label>
            </div>
          </div>

          {/* Item 4 */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Weekly Department Summary Digest</span>
              <span className="text-slate-500 text-[11px]">
                Consolidated statistical briefing sent every Monday 8:00 AM
              </span>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={notifications.weeklyDigest.email}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      weeklyDigest: { ...notifications.weeklyDigest, email: e.target.checked },
                    })
                  }
                  className="w-3.5 h-3.5 rounded text-[#3256a8] border-slate-300"
                />
                Email only
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* STICKY SAVE BAR AT BOTTOM */}
      <div className="sticky bottom-4 z-20 flex justify-end">
        <button
          type="submit"
          className="px-6 py-3 bg-[#3256a8] hover:bg-[#284588] text-white rounded-2xl font-bold text-xs transition-colors flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </form>
  );
};
