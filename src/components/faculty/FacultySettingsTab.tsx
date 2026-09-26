import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { SHARED_AVATAR_URL } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  useFacultyProfile,
  useSaveFacultyProfile,
  useSaveFacultyPreferences,
  useUploadAvatar,
  useChangePassword,
  useFacultyCourses,
  OfficeHourSlot,
  MutableNotificationType,
} from '../../hooks/useFacultyData';

type Category = 'personal' | 'security' | 'notifications' | 'courses' | 'language' | 'office-hours';

const apiError = (err: unknown, fallback: string): string =>
  (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? fallback;

const NOTIFICATION_OPTIONS: { type: MutableNotificationType; label: string; description: string }[] = [
  {
    type: 'grade',
    label: 'TA grade submissions',
    description: 'When a teaching assistant submits grades for you to review and release.',
  },
  {
    type: 'alert',
    label: 'Student attention alerts',
    description: 'When a teaching assistant flags a student in one of your sections.',
  },
];

const cardClass =
  'bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-8';
const inputClass =
  'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#3256a8] focus:bg-white';
const primaryButtonClass =
  'px-5 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50';

const SectionHeader: React.FC<{ eyebrow: string; title: string; description?: string }> = ({
  eyebrow,
  title,
  description,
}) => (
  <div className="border-b border-slate-100 pb-3 mb-4">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{eyebrow}</span>
    <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">{title}</h3>
    {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
  </div>
);

export const FacultySettingsTab: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('personal');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { refreshUser } = useAuth();
  const { data: profile, isLoading } = useFacultyProfile();
  const { data: coursesData } = useFacultyCourses();
  const courses: { id: string; name: string; code: string }[] = coursesData ?? [];
  const saveProfile = useSaveFacultyProfile();
  const savePreferences = useSaveFacultyPreferences();
  const uploadAvatar = useUploadAvatar();
  const changePassword = useChangePassword();
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Profile + office hours form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rank, setRank] = useState('');
  const [officeHours, setOfficeHours] = useState<OfficeHourSlot[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Preferences form state
  const [mutedTypes, setMutedTypes] = useState<MutableNotificationType[]>([]);
  const [defaultCourseId, setDefaultCourseId] = useState('');
  const [prefsError, setPrefsError] = useState<string | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [photoError, setPhotoError] = useState<string | null>(null);

  // Load the signed-in professor's saved profile into the form
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setRank(profile.rank);
    setOfficeHours(profile.officeHours);
    setMutedTypes(profile.preferences.mutedNotificationTypes);
    setDefaultCourseId(profile.preferences.defaultCourseId ?? '');
  }, [profile]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const resetForm = () => {
    if (!profile) return;
    setFullName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setRank(profile.rank);
    setOfficeHours(profile.officeHours);
    setSaveError(null);
    showToast('Changes discarded');
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    try {
      await saveProfile.mutateAsync({ name: fullName, email, phone, rank, officeHours });
      await refreshUser();
      showToast('Profile and office hours saved.');
    } catch (err) {
      setSaveError(apiError(err, 'Could not save. Please try again.'));
    }
  };

  const handleSavePreferences = async (successMessage: string) => {
    setPrefsError(null);
    try {
      await savePreferences.mutateAsync({
        mutedNotificationTypes: mutedTypes,
        defaultCourseId: defaultCourseId || null,
      });
      showToast(successMessage);
    } catch (err) {
      setPrefsError(apiError(err, 'Could not save. Please try again.'));
    }
  };

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoError(null);
    try {
      await uploadAvatar.mutateAsync(file);
      await refreshUser();
      showToast('Profile photo updated.');
    } catch (err) {
      setPhotoError(apiError(err, 'Could not upload the photo. Please try again.'));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError('The new passwords do not match.');
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated.');
    } catch (err) {
      setPasswordError(apiError(err, 'Could not change the password. Please try again.'));
    }
  };

  const handleToggleDayClosed = (index: number) => {
    setOfficeHours((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            isClosed: !item.isClosed,
            start: item.isClosed ? '10:00 AM' : '',
            end: item.isClosed ? '12:00 PM' : '',
          };
        }
        return item;
      })
    );
  };

  const handleSlotChange = (index: number, field: 'start' | 'end' | 'location', val: string) => {
    setOfficeHours((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const toggleMuted = (type: MutableNotificationType) => {
    setMutedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#3256a8] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const categories = [
    { id: 'personal' as const, label: 'Personal Information', icon: User },
    { id: 'security' as const, label: 'Password & Security', icon: Lock },
    { id: 'notifications' as const, label: 'Notification Preferences', icon: Bell },
    { id: 'courses' as const, label: 'Course Preferences', icon: BookOpen },
    { id: 'language' as const, label: 'Language', icon: Globe },
    { id: 'office-hours' as const, label: 'Office Hours', icon: Clock },
  ];

  const department = profile?.department ?? '—';

  const profileFooter = (
    <div className="pt-5 border-t border-slate-100">
      {saveError && <p className="text-xs font-semibold text-rose-600 mb-3 text-right">{saveError}</p>}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={resetForm}
          className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          id="btn-save-faculty-settings"
          disabled={saveProfile.isPending}
          className={primaryButtonClass}
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saveProfile.isPending ? 'Saving…' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );

  const preferencesFooter = (successMessage: string) => (
    <div className="pt-5 border-t border-slate-100">
      {prefsError && <p className="text-xs font-semibold text-rose-600 mb-3 text-right">{prefsError}</p>}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => handleSavePreferences(successMessage)}
          disabled={savePreferences.isPending}
          className={primaryButtonClass}
        >
          <Save className="w-3.5 h-3.5" />
          <span>{savePreferences.isPending ? 'Saving…' : 'Save Preferences'}</span>
        </button>
      </div>
    </div>
  );

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
        {/* Left Settings Menu (col-span-4) */}
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
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setPrefsError(null);
                  }}
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

        {/* Right Content Panel */}
        <div className="lg:col-span-8">
          {activeCategory === 'personal' && (
            <form onSubmit={handleSaveChanges} className={cardClass}>
              {/* Profile */}
              <div>
                <SectionHeader eyebrow="Section 1" title="Profile Credentials" />

                <div className="flex flex-col sm:flex-row items-center gap-5 mb-6 p-4 bg-slate-50/60 rounded-2xl border border-slate-100">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoSelected}
                  />
                  <div className="relative">
                    <img
                      src={profile?.avatarUrl ?? SHARED_AVATAR_URL}
                      alt="Faculty Avatar"
                      className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <button
                      type="button"
                      aria-label="Change photo"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadAvatar.isPending}
                      className="absolute bottom-0 right-0 p-1.5 bg-[#3256a8] text-white rounded-full shadow-md hover:bg-[#284588] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-sm font-bold text-slate-900">{fullName}</h4>
                    <p className="text-xs text-slate-500 font-medium">{department}</p>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadAvatar.isPending}
                      className="mt-2 text-xs font-bold text-[#3256a8] hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {uploadAvatar.isPending ? 'Uploading…' : 'Change Photo'}
                    </button>
                    <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG or WebP, up to 2 MB.</p>
                    {photoError && <p className="text-xs font-semibold text-rose-600 mt-1">{photoError}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Faculty ID (read-only)</label>
                    <input
                      type="text"
                      disabled
                      value={profile?.codeId ?? ''}
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Department (read-only)</label>
                    <input
                      type="text"
                      disabled
                      value={department}
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

              {/* Academic Info (read-only, from the faculty's course assignments) */}
              <div>
                <SectionHeader eyebrow="Section 2" title="Academic Info" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Department</span>
                    <p className="font-bold text-slate-900 mt-0.5">{department}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Assigned Courses</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {profile?.courseCount ?? 0} {profile?.courseCount === 1 ? 'Course' : 'Courses'} (
                      {profile?.creditHours ?? 0} Credits)
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Total Students</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {profile?.studentCount ?? 0} {profile?.studentCount === 1 ? 'Student' : 'Students'}
                    </p>
                  </div>
                </div>
              </div>

              {profileFooter}
            </form>
          )}

          {activeCategory === 'office-hours' && (
            <form onSubmit={handleSaveChanges} className={cardClass}>
              <div>
                <SectionHeader
                  eyebrow="Office Hours"
                  title="Office Hours Schedule Builder"
                  description="Configure your weekly consultation slots. Students can book guidance appointments during these windows."
                />

                <div className="space-y-2.5">
                  {officeHours.map((slot, index) => (
                    <div
                      key={slot.day}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div className="w-24 font-bold text-slate-800">{slot.day}</div>

                      {slot.isClosed ? (
                        <span className="px-3 py-1 bg-slate-200/70 text-slate-500 font-bold rounded-lg text-[11px]">
                          Closed
                        </span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={slot.start}
                            onChange={(e) => handleSlotChange(index, 'start', e.target.value)}
                            placeholder="Start (e.g. 10:00 AM)"
                            className="w-28 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                          />
                          <span className="text-slate-400">to</span>
                          <input
                            type="text"
                            value={slot.end}
                            onChange={(e) => handleSlotChange(index, 'end', e.target.value)}
                            placeholder="End (e.g. 01:00 PM)"
                            className="w-28 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                          />
                          <input
                            type="text"
                            value={slot.location}
                            onChange={(e) => handleSlotChange(index, 'location', e.target.value)}
                            placeholder="Room (optional)"
                            className="w-32 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleDayClosed(index)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          slot.isClosed
                            ? 'bg-blue-50 border-blue-200 text-[#3256a8]'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {slot.isClosed ? 'Open Slot' : 'Mark Closed'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {profileFooter}
            </form>
          )}

          {activeCategory === 'security' && (
            <form onSubmit={handleChangePassword} className={cardClass}>
              <div>
                <SectionHeader
                  eyebrow="Password & Security"
                  title="Change Password"
                  description="Use at least 12 characters with upper and lower case letters, a digit and a symbol."
                />
                <div className="grid grid-cols-1 gap-4 text-xs max-w-md">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      autoComplete="current-password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={12}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100">
                {passwordError && (
                  <p className="text-xs font-semibold text-rose-600 mb-3 text-right">{passwordError}</p>
                )}
                <div className="flex items-center justify-end">
                  <button type="submit" disabled={changePassword.isPending} className={primaryButtonClass}>
                    <Lock className="w-3.5 h-3.5" />
                    <span>{changePassword.isPending ? 'Updating…' : 'Update Password'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeCategory === 'notifications' && (
            <div className={cardClass}>
              <div>
                <SectionHeader
                  eyebrow="Notification Preferences"
                  title="What shows in your notifications"
                  description="Turned-off notifications are still recorded, just hidden from your bell and unread count."
                />
                <div className="space-y-2.5">
                  {NOTIFICATION_OPTIONS.map((opt) => {
                    const enabled = !mutedTypes.includes(opt.type);
                    return (
                      <label
                        key={opt.type}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 text-xs cursor-pointer"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{opt.label}</p>
                          <p className="text-slate-500 mt-0.5">{opt.description}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleMuted(opt.type)}
                          className="w-4 h-4 accent-[#3256a8] cursor-pointer shrink-0"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
              {preferencesFooter('Notification preferences saved.')}
            </div>
          )}

          {activeCategory === 'courses' && (
            <div className={cardClass}>
              <div>
                <SectionHeader
                  eyebrow="Course Preferences"
                  title="Default course"
                  description="Grade Entry and Attendance open on this course unless you pick another one."
                />
                <div className="text-xs max-w-md">
                  <label className="block font-bold text-slate-700 mb-1">Open first</label>
                  <select
                    value={defaultCourseId}
                    onChange={(e) => setDefaultCourseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-[#3256a8] cursor-pointer"
                  >
                    <option value="">First course in the list</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {preferencesFooter('Course preferences saved.')}
            </div>
          )}

          {activeCategory === 'language' && (
            <div className={cardClass}>
              <div>
                <SectionHeader eyebrow="Language" title="Display language" />
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <p className="font-bold text-slate-800">English</p>
                  <p className="text-slate-500 mt-0.5">
                    Campus is currently available in English only. More languages will appear here once the
                    interface is translated.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
