import React, { useState } from 'react';
import {
  User,
  Lock,
  Bell,
  BookOpen,
  Globe,
  Clock,
  Camera,
  CheckCircle2,
  Save,
  X
} from 'lucide-react';
import { SHARED_AVATAR_URL } from '../../data/mockData';

export const FacultySettingsTab: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<
    'personal' | 'security' | 'notifications' | 'courses' | 'language' | 'office-hours'
  >('personal');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('Dr. Ahmed Dahy');
  const [email, setEmail] = useState('faculty@nilebyte.edu');
  const [phone, setPhone] = useState('+20 102 345 6789');
  const [rank, setRank] = useState('Associate Professor');

  // Office Hours Schedule State
  const [officeHours, setOfficeHours] = useState([
    { day: 'Saturday', start: '10:00 AM', end: '01:00 PM', closed: false },
    { day: 'Sunday', start: '02:00 PM', end: '04:30 PM', closed: false },
    { day: 'Monday', start: '11:00 AM', end: '01:30 PM', closed: false },
    { day: 'Tuesday', start: '', end: '', closed: true },
    { day: 'Wednesday', start: '01:00 PM', end: '03:00 PM', closed: false },
    { day: 'Thursday', start: '', end: '', closed: true },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Faculty settings and office hour schedule saved successfully!');
  };

  const handleToggleDayClosed = (index: number) => {
    setOfficeHours((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            closed: !item.closed,
            start: item.closed ? '10:00 AM' : '',
            end: item.closed ? '12:00 PM' : '',
          };
        }
        return item;
      })
    );
  };

  const handleTimeChange = (index: number, field: 'start' | 'end', val: string) => {
    setOfficeHours((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const categories = [
    { id: 'personal' as const, label: 'Personal Information', icon: User },
    { id: 'security' as const, label: 'Password & Security', icon: Lock },
    { id: 'notifications' as const, label: 'Notification Preferences', icon: Bell },
    { id: 'courses' as const, label: 'Course Preferences', icon: BookOpen },
    { id: 'language' as const, label: 'Language', icon: Globe },
    { id: 'office-hours' as const, label: 'Office Hours', icon: Clock },
  ];

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3256a8] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Settings Grid: Left Menu & Right Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* ======================================================== */}
        {/* Left Settings Menu (col-span-4)                          */}
        {/* ======================================================== */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-1.5">
            <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Faculty Preferences
            </div>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`btn-setting-cat-${cat.id}`}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#3256a8] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* Right Content Panel — Personal Information (default active) */}
        {/* ======================================================== */}
        <div className="lg:col-span-8">
          <form
            onSubmit={handleSaveChanges}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-8"
          >
            {/* Section 1 — Profile */}
            <div>
              <div className="border-b border-slate-100 pb-3 mb-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Section 1
                </span>
                <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                  Profile Credentials
                </h3>
              </div>

              {/* Centered avatar with "Change Photo" button */}
              <div className="flex flex-col sm:flex-row items-center gap-5 mb-6 p-4 bg-slate-50/60 rounded-2xl border border-slate-100">
                <div className="relative">
                  <img
                    src={SHARED_AVATAR_URL}
                    alt="Faculty Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => showToast('Photo selector dialog opened')}
                    className="absolute bottom-0 right-0 p-1.5 bg-[#3256a8] text-white rounded-full shadow-md hover:bg-[#284588] transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-sm font-bold text-slate-900">{fullName}</h4>
                  <p className="text-xs text-slate-500 font-medium">Department of Computer Science</p>
                  <button
                    type="button"
                    onClick={() => showToast('Photo selector dialog opened')}
                    className="mt-2 text-xs font-bold text-[#3256a8] hover:underline cursor-pointer"
                  >
                    Change Photo
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#3256a8] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Faculty ID (read-only)</label>
                  <input
                    type="text"
                    disabled
                    value="FAC-4012"
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#3256a8] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#3256a8] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department (read-only)</label>
                  <input
                    type="text"
                    disabled
                    value="Computer Science & Engineering"
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Title / Rank</label>
                  <select
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-[#3256a8] cursor-pointer"
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2 — Academic Info (read-only displayed as labeled values) */}
            <div>
              <div className="border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Section 2
                </span>
                <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                  Academic Info
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Department</span>
                  <p className="font-bold text-slate-900 mt-0.5">Computer Science</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Assigned Courses</span>
                  <p className="font-bold text-slate-900 mt-0.5">4 Courses (12 Credits)</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Total Students</span>
                  <p className="font-bold text-slate-900 mt-0.5">213 Students</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Years of Service</span>
                  <p className="font-bold text-slate-900 mt-0.5">6 Years</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Office Room Number</span>
                  <p className="font-bold text-slate-900 mt-0.5">Building C, Room 412</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Accreditation Status</span>
                  <p className="font-bold text-emerald-700 mt-0.5">Active / Certified</p>
                </div>
              </div>
            </div>

            {/* Section 3 — Office Hours Schedule Builder */}
            <div>
              <div className="border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Section 3
                </span>
                <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                  Office Hours Schedule Builder
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure your weekly consultation slots. Students can book guidance appointments during these windows.
                </p>
              </div>

              <div className="space-y-2.5">
                {officeHours.map((slot, index) => (
                  <div
                    key={slot.day}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="w-24 font-bold text-slate-800">{slot.day}</div>

                    {slot.closed ? (
                      <span className="px-3 py-1 bg-slate-200/70 text-slate-500 font-bold rounded-lg text-[11px]">
                        Closed
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={slot.start}
                          onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                          placeholder="Start (e.g. 10:00 AM)"
                          className="w-28 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                        />
                        <span className="text-slate-400">to</span>
                        <input
                          type="text"
                          value={slot.end}
                          onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                          placeholder="End (e.g. 01:00 PM)"
                          className="w-28 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleDayClosed(index)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        slot.closed
                          ? 'bg-blue-50 border-blue-200 text-[#3256a8]'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {slot.closed ? 'Open Slot' : 'Mark Closed'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Buttons: Save Changes filled blue and Cancel outlined */}
            <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => showToast('Changes discarded')}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-save-faculty-settings"
                className="px-5 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
