import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Calendar,
  BarChart2,
  BarChart3,
  Users,
  Bot,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  X,
  CheckCircle2,
  Pin,
  GraduationCap,
  UserCheck,
  ClipboardList,
  DollarSign,
  FileText,
  AlertTriangle,
  Building2,
  FolderOpen,
  Sparkles,
  CheckSquare,
  Video
} from 'lucide-react';
import { CAMPUS_LOGO_URL, ROLE_NAVIGATION } from '../data/mockData';
import { TabId, RoleType, NavItemConfig } from '../types';

const TAB_TO_PATH: Record<TabId, string> = {
  home: '/Home',
  courses: '/Courses',
  'my-courses': '/Courses',
  materials: '/Materials',
  schedule: '/Schedule',
  'smart-schedule': '/SmartSchedule',
  'todo-list': '/TodoList',
  recordings: '/Recordings',
  grades: '/Grades',
  community: '/Community',
  'ai-tutor': '/AITutor',
  'my-students': '/MyStudents',
  attendance: '/Attendance',
  'grade-entry': '/GradeEntry',
  'course-community': '/CourseCommunity',
  students: '/Students',
  'faculty-staff': '/FacultyAndStaff',
  enrollment: '/Enrollment',
  finance: '/Finance',
  'exam-scheduling': '/ExamScheduling',
  analytics: '/Analytics',
  reports: '/Reports',
  'at-risk': '/AtRiskStudents',
  departments: '/Departments',
  'academic-overview': '/AcademicOverview',
  'financial-overview': '/FinancialOverview',
  'university-analytics': '/UniversityAnalytics',
  'ta-sections': '/TASections',
  'ta-attendance': '/TAAttendance',
  'ta-grades': '/TAGrades',
  'ta-students': '/TAStudents',
  'ta-materials': '/TAMaterials',
  'ta-academic-record': '/TAAcademicRecord',
  messages: '/Messages',
  settings: '/Settings',
  help: '/Help',
};

interface SidebarProps {
  roleType: RoleType;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  messageBadge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  roleType,
  onLogout,
  mobileOpen,
  onCloseMobile,
  messageBadge = 0,
}) => {
  const navItems = ROLE_NAVIGATION[roleType] ?? ROLE_NAVIGATION.student;

  const getBadge = (item: NavItemConfig): string | number | undefined => {
    if (item.id === 'messages') {
      return messageBadge > 0 ? messageBadge : undefined;
    }
    return item.badge;
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return <Home className="w-5 h-5" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5" />;
      case 'BarChart2':
        return <BarChart2 className="w-5 h-5" />;
      case 'BarChart3':
        return <BarChart3 className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      case 'Bot':
        return <Bot className="w-5 h-5" />;
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5" />;
      case 'Settings':
        return <Settings className="w-5 h-5" />;
      case 'HelpCircle':
        return <HelpCircle className="w-5 h-5" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'Pin':
        return <Pin className="w-5 h-5" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5" />;
      case 'UserCheck':
        return <UserCheck className="w-5 h-5" />;
      case 'ClipboardList':
        return <ClipboardList className="w-5 h-5" />;
      case 'DollarSign':
        return <DollarSign className="w-5 h-5" />;
      case 'FileText':
        return <FileText className="w-5 h-5" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5" />;
      case 'Building2':
        return <Building2 className="w-5 h-5" />;
      default:
        return <Home className="w-5 h-5" />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 z-30 xl:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed xl:sticky top-0 left-0 h-screen w-[260px] bg-white border-r border-slate-100 flex flex-col justify-between p-6 shrink-0 z-40 transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full xl:translate-x-0'
        }`}
      >
        <div className="space-y-6 overflow-y-auto scrollbar-hide">
          {/* Logo Section & Mobile Close Button */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="h-24 w-auto flex items-center">
              <img
                alt="Campus Logo"
                className="h-full w-auto object-contain"
                src={CAMPUS_LOGO_URL}
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              className="xl:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav aria-label="Main Navigation" className="space-y-1.5">
            {navItems.map((item) => {
              return (
                <NavLink
                  key={item.id}
                  to={TAB_TO_PATH[item.id] ?? '/Home'}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between px-4 py-2.5 rounded-2xl font-medium text-sm transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#3256a8] text-white shadow-[0_4px_14px_0_rgba(50,86,168,0.25)] hover:bg-[#2c4c96]'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3.5">
                        {renderIcon(item.iconName)}
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : typeof item.badge === 'number'
                              ? 'bg-[#3256a8] text-white'
                              : 'bg-blue-50 text-[#3256a8]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout Section at bottom */}
        <div className="pt-4 border-t border-slate-100 mt-auto">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50/60 rounded-2xl font-medium text-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 stroke-current" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
