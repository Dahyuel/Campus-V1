import React, { useState } from 'react';
import {
  User,
  Bell,
  Lock,
  Palette,
  CheckCircle2,
  Camera,
  ShieldCheck,
  Globe,
  KeyRound,
  Check,
  Smartphone
} from 'lucide-react';
import { SHARED_AVATAR_URL } from '../../data/mockData';

interface SettingsTabProps {
  searchQuery?: string;
}

export const SettingsTab: React.FC<SettingsTabProps> = () => {
  // Notification toggle states
  const [notifications, setNotifications] = useState({
    gradeRelease: true,
    scheduleChanges: true,
    communityReplies: true,
    campusAnnouncements: true,
    aiStudyReminders: false,
    marketingEvents: false,
  });

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Appearance
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar'>('en');

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      setToastMessage('New passwords do not match. Please verify.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setToastMessage('Security credentials successfully updated!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleChangePhoto = () => {
    setToastMessage('Profile image upload dialog opened');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3256a8] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Section 1: Profile Information */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#3256a8] flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Profile Information</h3>
            <p className="text-xs text-slate-400">Personal & verified academic identification</p>
          </div>
        </div>

        {/* Avatar with "Change Photo" button */}
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative">
            <img
              src={SHARED_AVATAR_URL}
              alt="Ahmed Dahy"
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={handleChangePhoto}
              className="absolute bottom-0 right-0 p-1.5 bg-[#3256a8] hover:bg-[#2c4c96] text-white rounded-full shadow-xs cursor-pointer"
              title="Change Profile Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h4 className="text-base font-bold text-slate-900">Ahmed Dahy</h4>
            <p className="text-xs text-slate-400">Student ID: STU-9921 · Computer Science</p>
            <button
              type="button"
              onClick={handleChangePhoto}
              className="mt-1 inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Camera className="w-3 h-3 text-slate-500" />
              <span>Change Photo</span>
            </button>
          </div>
        </div>

        {/* Read-only fields: Full Name, Student ID, University Email, Degree Program, Academic Year, Advisor Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Full Name
            </span>
            <span className="text-xs font-bold text-slate-800 mt-1 block">Ahmed Dahy</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Student ID (National Registrar)
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 mt-1 block">STU-9921</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              University Email
            </span>
            <span className="text-xs font-bold text-[#3256a8] mt-1 block">
              ahmed.dahy@nilebyte.edu.eg
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Degree Program
            </span>
            <span className="text-xs font-bold text-slate-800 mt-1 block">
              B.Sc. in Computer Science & AI
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Academic Year / Semester
            </span>
            <span className="text-xs font-bold text-slate-800 mt-1 block">
              Year 3 · Semester 2 (Spring 2026)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Assigned Academic Advisor
            </span>
            <span className="text-xs font-bold text-slate-800 mt-1 block">
              Dr. Ahmed Dahy (Faculty Office 402)
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Notification Preferences */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#3256a8] flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Notification Preferences</h3>
            <p className="text-xs text-slate-400">Configure alerts, announcements and smart study prompts</p>
          </div>
        </div>

        {/* Toggle switches (active: blue #3256a8, inactive: gray) */}
        <div className="divide-y divide-slate-100">
          {[
            {
              key: 'gradeRelease' as const,
              title: 'Grade Release Alerts',
              desc: 'Instant notifications when professors publish coursework or exam marks',
            },
            {
              key: 'scheduleChanges' as const,
              title: 'Class Schedule Changes & Room Reassignments',
              desc: 'SMS and push updates if lecture halls or timings change',
            },
            {
              key: 'communityReplies' as const,
              title: 'Community Replies & Mentions',
              desc: 'Alerts when peers or faculty comment on your discussion posts',
            },
            {
              key: 'campusAnnouncements' as const,
              title: 'Campus-Wide Official Announcements',
              desc: 'Critical notices from the Dean and University Registrar',
            },
            {
              key: 'aiStudyReminders' as const,
              title: 'AI Tutor Study Reminders',
              desc: 'Smart study suggestions based on upcoming assignment deadlines',
            },
            {
              key: 'marketingEvents' as const,
              title: 'Extracurricular Club & Career Fair Events',
              desc: 'Non-academic invitations and external internship highlights',
            },
          ].map((item) => {
            const isActive = notifications[item.key];

            return (
              <div
                key={item.key}
                className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleNotification(item.key)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                    isActive ? 'bg-[#3256a8]' : 'bg-slate-200'
                  }`}
                  role="switch"
                  aria-checked={isActive}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                      isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Security */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#3256a8] flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Security & Authentication</h3>
            <p className="text-xs text-slate-400">Manage portal passwords and two-factor device verification</p>
          </div>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#3256a8] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#3256a8] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#3256a8] focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            {/* "Update Password" button in filled blue */}
            <button
              type="submit"
              className="py-2.5 px-5 bg-[#3256a8] hover:bg-[#2c4c96] text-white text-xs font-bold rounded-xl shadow-[0_4px_12px_0_rgba(50,86,168,0.25)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Update Password</span>
            </button>
          </div>
        </form>

        {/* Two-Factor Authentication Status: Enabled via Nilebyte Authenticator with green checkmark */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950">
                Two-Factor Authentication: Enabled via Nilebyte Authenticator
              </h4>
              <p className="text-[11px] text-emerald-800">
                Secured hardware token linked to your registered mobile phone
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
            Active
          </span>
        </div>
      </div>

      {/* Section 4: Appearance & Language */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#3256a8] flex items-center justify-center font-bold">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Appearance & Language</h3>
            <p className="text-xs text-slate-400">Customise theme display and portal interface language</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Theme Selector: "Light" (selected, blue outline) / "Dark" (coming soon badge) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Display Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Light (selected, blue outline) */}
              <div className="p-3.5 rounded-2xl border-2 border-[#3256a8] bg-blue-50/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#3256a8] flex items-center justify-center text-white">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="text-xs font-bold text-[#3256a8]">Light Mode</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">Default</span>
              </div>

              {/* Dark (coming soon badge) */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between opacity-70">
                <span className="text-xs font-semibold text-slate-600">Dark Mode</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[9px] font-extrabold uppercase">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>

          {/* Language Selector: English (selected) / Arabic */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Portal Language
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedLanguage('en')}
                className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  selectedLanguage === 'en'
                    ? 'border-2 border-[#3256a8] bg-blue-50/30 text-[#3256a8]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>English</span>
                {selectedLanguage === 'en' && <Check className="w-3.5 h-3.5 text-[#3256a8]" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedLanguage('ar');
                  setToastMessage('واجهة اللغة العربية ستكون مفعلة قريباً بالكامل');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  selectedLanguage === 'ar'
                    ? 'border-2 border-[#3256a8] bg-blue-50/30 text-[#3256a8]'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>العربية (Arabic)</span>
                {selectedLanguage === 'ar' && <Check className="w-3.5 h-3.5 text-[#3256a8]" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
