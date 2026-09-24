import React from 'react';
import { ArrowLeft, Inbox } from 'lucide-react';
import { TabId } from '../types';

interface EmptyTabProps {
  tabId: TabId;
  onBackToHome: () => void;
}

const TAB_TITLES: Partial<Record<TabId, string>> = {
  home: 'Home',
  courses: 'My Courses',
  schedule: 'Schedule',
  grades: 'Grades',
  community: 'Community',
  'ai-tutor': 'AI Tutor',
  'my-students': 'My Students',
  attendance: 'Attendance',
  'grade-entry': 'Grade Entry',
  'course-community': 'Course Community',
  students: 'Students',
  'faculty-staff': 'Faculty & Staff',
  enrollment: 'Enrollment',
  finance: 'Finance',
  'exam-scheduling': 'Exam Scheduling',
  analytics: 'Analytics',
  reports: 'Reports',
  'at-risk': 'At-Risk Students',
  departments: 'Departments',
  'academic-overview': 'Academic Overview',
  'financial-overview': 'Financial Overview',
  'university-analytics': 'University Analytics',
  messages: 'Messages',
  settings: 'Settings',
  help: 'Help',
};

export const EmptyTab: React.FC<EmptyTabProps> = ({ tabId, onBackToHome }) => {
  const title = TAB_TITLES[tabId] || tabId.replace('-', ' ');

  return (
    <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] min-h-[460px] flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-xs">
        <Inbox className="w-8 h-8 stroke-[1.5]" />
      </div>

      <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
        {title}
      </h2>

      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
        This section is currently empty. More details and tools for {title.toLowerCase()} will appear here soon.
      </p>

      <button
        type="button"
        onClick={onBackToHome}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#3256a8] hover:bg-[#2c4c96] text-white text-xs font-bold transition-all shadow-[0_4px_14px_0_rgba(50,86,168,0.25)] active:scale-98 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home Dashboard</span>
      </button>
    </div>
  );
};
