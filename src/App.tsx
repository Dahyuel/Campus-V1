import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { HomeDashboard } from './components/HomeDashboard';
import { FacultyDashboard } from './components/dashboards/FacultyDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { DeptHeadDashboard } from './components/dashboards/DeptHeadDashboard';
import { DeanDashboard } from './components/dashboards/DeanDashboard';
import { MyCoursesTab } from './components/student/MyCoursesTab';
import { MaterialTab } from './components/student/MaterialTab';
import { ScheduleTab } from './components/student/ScheduleTab';
import { SmartScheduleTab } from './components/student/SmartScheduleTab';
import { TodoTab } from './components/student/TodoTab';
import { RecordingsTab } from './components/student/RecordingsTab';
import { FacultySmartScheduleTab } from './components/faculty/FacultySmartScheduleTab';
import { FacultyRecordingsTab } from './components/faculty/FacultyRecordingsTab';
import { GradesTab } from './components/student/GradesTab';
import { CommunityTab } from './components/student/CommunityTab';
import { AITutorTab } from './components/student/AITutorTab';
import { MessagesTab } from './components/student/MessagesTab';
import { SettingsTab } from './components/student/SettingsTab';
import { FacultyCoursesTab } from './components/faculty/FacultyCoursesTab';
import { FacultyStudentsTab } from './components/faculty/FacultyStudentsTab';
import { FacultyAttendanceTab } from './components/faculty/FacultyAttendanceTab';
import { FacultyGradeEntryTab } from './components/faculty/FacultyGradeEntryTab';
import { FacultyCommunityTab } from './components/faculty/FacultyCommunityTab';
import { FacultyMessagesTab } from './components/faculty/FacultyMessagesTab';
import { FacultySettingsTab } from './components/faculty/FacultySettingsTab';
import { AdminStudentsTab } from './components/admin/AdminStudentsTab';
import { AdminFacultyStaffTab } from './components/admin/AdminFacultyStaffTab';
import { AdminEnrollmentTab } from './components/admin/AdminEnrollmentTab';
import { AdminFinanceTab } from './components/admin/AdminFinanceTab';
import { AdminExamSchedulingTab } from './components/admin/AdminExamSchedulingTab';
import { AdminAnalyticsTab } from './components/admin/AdminAnalyticsTab';
import { AdminReportsTab } from './components/admin/AdminReportsTab';
import { AdminMessagesTab } from './components/admin/AdminMessagesTab';
import { AdminSettingsTab } from './components/admin/AdminSettingsTab';
import { DeanDepartmentsTab } from './components/dean/DeanDepartmentsTab';
import { DeanAcademicOverviewTab } from './components/dean/DeanAcademicOverviewTab';
import { DeanFinancialOverviewTab } from './components/dean/DeanFinancialOverviewTab';
import { DeanUniversityAnalyticsTab } from './components/dean/DeanUniversityAnalyticsTab';
import { DeanReportsTab } from './components/dean/DeanReportsTab';
import { DeanMessagesTab } from './components/dean/DeanMessagesTab';
import { DeanSettingsTab } from './components/dean/DeanSettingsTab';
import { DeptHeadCoursesTab } from './components/depthead/DeptHeadCoursesTab';
import { DeptHeadFacultyTab } from './components/depthead/DeptHeadFacultyTab';
import { DeptHeadStudentsTab } from './components/depthead/DeptHeadStudentsTab';
import { DeptHeadAnalyticsTab } from './components/depthead/DeptHeadAnalyticsTab';
import { DeptHeadAtRiskTab } from './components/depthead/DeptHeadAtRiskTab';
import { DeptHeadReportsTab } from './components/depthead/DeptHeadReportsTab';
import { DeptHeadMessagesTab } from './components/depthead/DeptHeadMessagesTab';
import { DeptHeadSettingsTab } from './components/depthead/DeptHeadSettingsTab';
import { EmptyTab } from './components/EmptyTab';
import { TADashboard } from './components/dashboards/TADashboard';
import { TASectionsTab } from './components/ta/TASectionsTab';
import { TAAttendanceTab } from './components/ta/TAAttendanceTab';
import { TAGradeEntryTab } from './components/ta/TAGradeEntryTab';
import { TAStudentsTab } from './components/ta/TAStudentsTab';
import { TAMaterialsTab } from './components/ta/TAMaterialsTab';
import { TAAcademicRecordTab } from './components/ta/TAAcademicRecordTab';
import { TAMessagesTab } from './components/ta/TAMessagesTab';
import { TabId, RoleType, User } from './types';
import { useAuth } from './context/AuthContext.tsx';
import { useUnreadMessageCount } from './hooks/useNotifications';

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

interface RoleViewProps {
  user: User;
  searchQuery: string;
  onNavigateTab: (tabId: any, params?: Record<string, string>) => void;
}

// Optional params become a query string, so a tab can open on the course or
// person the professor clicked (e.g. Grade Entry for Networks).
const navigateTab =
  (navigate: ReturnType<typeof useNavigate>) =>
  (tab: TabId, params?: Record<string, string>) => {
    const path = TAB_TO_PATH[tab] ?? '/Home';
    const query = params ? new URLSearchParams(params).toString() : '';
    navigate(query ? `${path}?${query}` : path);
  };

const HomeForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  const currentRole: RoleType = user.roleType ?? 'student';
  if (currentRole === 'student') {
    return <HomeDashboard onOpenAITutor={() => onNavigateTab('ai-tutor')} searchQuery={searchQuery} />;
  }
  if (currentRole === 'faculty') {
    return <FacultyDashboard searchQuery={searchQuery} onNavigateTab={onNavigateTab} />;
  }
  if (currentRole === 'admin') {
    return <AdminDashboard searchQuery={searchQuery} onNavigateTab={onNavigateTab} />;
  }
  if (currentRole === 'dept-head') {
    return <DeptHeadDashboard searchQuery={searchQuery} onNavigateTab={onNavigateTab} />;
  }
  if (currentRole === 'teaching-assistant') {
    return <TADashboard searchQuery={searchQuery} onNavigateTab={onNavigateTab} />;
  }
  return <DeanDashboard searchQuery={searchQuery} onNavigateTab={onNavigateTab} />;
};

const CoursesForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  const currentRole: RoleType = user.roleType ?? 'student';
  if (currentRole === 'student') {
    return <MyCoursesTab searchQuery={searchQuery} onNavigateTab={onNavigateTab} />;
  }
  if (currentRole === 'faculty') {
    return <FacultyCoursesTab searchQuery={searchQuery} onNavigateTab={onNavigateTab} />;
  }
  if (currentRole === 'dept-head') {
    return <DeptHeadCoursesTab searchQuery={searchQuery} onNavigateTab={onNavigateTab} />;
  }
  return <EmptyTab tabId="courses" onBackToHome={() => onNavigateTab('home')} />;
};

const MaterialsForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  if (user.roleType === 'student') {
    return <MaterialTab searchQuery={searchQuery} />;
  }
  return <EmptyTab tabId="materials" onBackToHome={() => onNavigateTab('home')} />;
};

const ScheduleForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  if (user.roleType === 'student') {
    return <ScheduleTab searchQuery={searchQuery} />;
  }
  return <EmptyTab tabId="schedule" onBackToHome={() => onNavigateTab('home')} />;
};

const SmartScheduleForRole: React.FC<RoleViewProps> = ({ user, onNavigateTab }) => {
  if (user.roleType === 'student') {
    return <SmartScheduleTab user={user} />;
  }
  if (user.roleType === 'faculty') {
    return <FacultySmartScheduleTab user={user} />;
  }
  return <EmptyTab tabId="smart-schedule" onBackToHome={() => onNavigateTab('home')} />;
};

const TodoListForRole: React.FC<RoleViewProps> = ({ user, onNavigateTab }) => {
  if (user.roleType === 'student') {
    return <TodoTab user={user} />;
  }
  return <EmptyTab tabId="todo-list" onBackToHome={() => onNavigateTab('home')} />;
};

const RecordingsForRole: React.FC<RoleViewProps> = ({ user, onNavigateTab }) => {
  if (user.roleType === 'student') {
    return <RecordingsTab user={user} />;
  }
  if (user.roleType === 'faculty') {
    return <FacultyRecordingsTab />;
  }
  return <EmptyTab tabId="recordings" onBackToHome={() => onNavigateTab('home')} />;
};

const GradesForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  if (user.roleType === 'student') {
    return <GradesTab searchQuery={searchQuery} />;
  }
  return <EmptyTab tabId="grades" onBackToHome={() => onNavigateTab('home')} />;
};

const CommunityForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  if (user.roleType === 'student') {
    return <CommunityTab searchQuery={searchQuery} />;
  }
  return <EmptyTab tabId="community" onBackToHome={() => onNavigateTab('home')} />;
};

const AITutorForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  if (user.roleType === 'student') {
    return <AITutorTab searchQuery={searchQuery} />;
  }
  return <EmptyTab tabId="ai-tutor" onBackToHome={() => onNavigateTab('home')} />;
};

const MyStudentsForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  if (user.roleType === 'faculty') {
    return <FacultyStudentsTab searchQuery={searchQuery} onNavigateTab={onNavigateTab} />;
  }
  return <EmptyTab tabId="my-students" onBackToHome={() => onNavigateTab('home')} />;
};

const AttendanceForRole: React.FC<RoleViewProps> = ({ user, onNavigateTab }) => {
  if (user.roleType === 'faculty') {
    return <FacultyAttendanceTab />;
  }
  return <EmptyTab tabId="attendance" onBackToHome={() => onNavigateTab('home')} />;
};

const GradeEntryForRole: React.FC<RoleViewProps> = ({ user, onNavigateTab }) => {
  if (user.roleType === 'faculty') {
    return <FacultyGradeEntryTab />;
  }
  return <EmptyTab tabId="grade-entry" onBackToHome={() => onNavigateTab('home')} />;
};

const CourseCommunityForRole: React.FC<RoleViewProps> = ({ user, onNavigateTab }) => {
  if (user.roleType === 'faculty') {
    return <FacultyCommunityTab />;
  }
  return <EmptyTab tabId="course-community" onBackToHome={() => onNavigateTab('home')} />;
};

const StudentsForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  if (user.roleType === 'admin') {
    return <AdminStudentsTab searchQuery={searchQuery} />;
  }
  if (user.roleType === 'dept-head') {
    return <DeptHeadStudentsTab searchQuery={searchQuery} onNavigateTab={onNavigateTab} />;
  }
  return <EmptyTab tabId="students" onBackToHome={() => onNavigateTab('home')} />;
};

const FacultyStaffForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  if (user.roleType === 'admin') {
    return <AdminFacultyStaffTab searchQuery={searchQuery} />;
  }
  if (user.roleType === 'dept-head') {
    return <DeptHeadFacultyTab searchQuery={searchQuery} onNavigateTab={onNavigateTab} />;
  }
  return <EmptyTab tabId="faculty-staff" onBackToHome={() => onNavigateTab('home')} />;
};

const EnrollmentForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  if (user.roleType === 'admin') {
    return <AdminEnrollmentTab searchQuery={searchQuery} />;
  }
  return <EmptyTab tabId="enrollment" onBackToHome={() => onNavigateTab('home')} />;
};

const FinanceForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  if (user.roleType === 'admin') {
    return <AdminFinanceTab searchQuery={searchQuery} />;
  }
  return <EmptyTab tabId="finance" onBackToHome={() => onNavigateTab('home')} />;
};

const ExamSchedulingForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  if (user.roleType === 'admin') {
    return <AdminExamSchedulingTab searchQuery={searchQuery} />;
  }
  return <EmptyTab tabId="exam-scheduling" onBackToHome={() => onNavigateTab('home')} />;
};

const AnalyticsForRole: React.FC<RoleViewProps> = ({ user, onNavigateTab }) => {
  if (user.roleType === 'admin') {
    return <AdminAnalyticsTab onNavigateTab={onNavigateTab} />;
  }
  if (user.roleType === 'dept-head') {
    return <DeptHeadAnalyticsTab onNavigateTab={onNavigateTab} />;
  }
  return <EmptyTab tabId="analytics" onBackToHome={() => onNavigateTab('home')} />;
};

const ReportsForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  if (user.roleType === 'admin') {
    return <AdminReportsTab searchQuery={searchQuery} />;
  }
  if (user.roleType === 'dept-head') {
    return <DeptHeadReportsTab searchQuery={searchQuery} onNavigateTab={onNavigateTab} />;
  }
  if (user.roleType === 'dean') {
    return <DeanReportsTab searchQuery={searchQuery} />;
  }
  return <EmptyTab tabId="reports" onBackToHome={() => onNavigateTab('home')} />;
};

const AtRiskForRole: React.FC<RoleViewProps> = ({ user, onNavigateTab }) => {
  if (user.roleType === 'dept-head') {
    return <DeptHeadAtRiskTab onNavigateTab={onNavigateTab} />;
  }
  return <EmptyTab tabId="at-risk" onBackToHome={() => onNavigateTab('home')} />;
};

const DepartmentsForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  if (user.roleType === 'dean') {
    return <DeanDepartmentsTab searchQuery={searchQuery} />;
  }
  return <EmptyTab tabId="departments" onBackToHome={() => onNavigateTab('home')} />;
};

const AcademicOverviewForRole: React.FC<RoleViewProps> = ({ user, onNavigateTab }) => {
  if (user.roleType === 'dean') {
    return <DeanAcademicOverviewTab />;
  }
  return <EmptyTab tabId="academic-overview" onBackToHome={() => onNavigateTab('home')} />;
};

const FinancialOverviewForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  if (user.roleType === 'dean') {
    return <DeanFinancialOverviewTab searchQuery={searchQuery} onNavigateTab={onNavigateTab} />;
  }
  return <EmptyTab tabId="financial-overview" onBackToHome={() => onNavigateTab('home')} />;
};

const UniversityAnalyticsForRole: React.FC<RoleViewProps> = ({ user, onNavigateTab }) => {
  if (user.roleType === 'dean') {
    return <DeanUniversityAnalyticsTab onNavigateTab={onNavigateTab} />;
  }
  return <EmptyTab tabId="university-analytics" onBackToHome={() => onNavigateTab('home')} />;
};

const MessagesForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  if (user.roleType === 'student') {
    return <MessagesTab searchQuery={searchQuery} />;
  }
  if (user.roleType === 'faculty') {
    return <FacultyMessagesTab searchQuery={searchQuery} />;
  }
  if (user.roleType === 'admin') {
    return <AdminMessagesTab searchQuery={searchQuery} />;
  }
  if (user.roleType === 'dept-head') {
    return <DeptHeadMessagesTab searchQuery={searchQuery} onNavigateTab={onNavigateTab} />;
  }
  if (user.roleType === 'dean') {
    return <DeanMessagesTab searchQuery={searchQuery} />;
  }
  if (user.roleType === 'teaching-assistant') {
    return <TAMessagesTab searchQuery={searchQuery} />;
  }
  return <EmptyTab tabId="messages" onBackToHome={() => onNavigateTab('home')} />;
};

const TASectionsForRole: React.FC<RoleViewProps> = ({ user, onNavigateTab }) => {
  if (user.roleType === 'teaching-assistant') {
    return <TASectionsTab onNavigateTab={onNavigateTab} />;
  }
  return <EmptyTab tabId="courses" onBackToHome={() => onNavigateTab('home')} />;
};

const TAAttendanceForRole: React.FC<RoleViewProps> = ({ user, onNavigateTab }) => {
  if (user.roleType === 'teaching-assistant') {
    return <TAAttendanceTab />;
  }
  return <EmptyTab tabId="attendance" onBackToHome={() => onNavigateTab('home')} />;
};

const TAGradesForRole: React.FC<RoleViewProps> = ({ user, onNavigateTab }) => {
  if (user.roleType === 'teaching-assistant') {
    return <TAGradeEntryTab />;
  }
  return <EmptyTab tabId="grade-entry" onBackToHome={() => onNavigateTab('home')} />;
};

const TAStudentsForRole: React.FC<RoleViewProps> = ({ user, onNavigateTab }) => {
  if (user.roleType === 'teaching-assistant') {
    return <TAStudentsTab />;
  }
  return <EmptyTab tabId="my-students" onBackToHome={() => onNavigateTab('home')} />;
};

const TAMaterialsForRole: React.FC<RoleViewProps> = ({ user, onNavigateTab }) => {
  if (user.roleType === 'teaching-assistant') {
    return <TAMaterialsTab />;
  }
  return <EmptyTab tabId="materials" onBackToHome={() => onNavigateTab('home')} />;
};

const TAAcademicRecordForRole: React.FC<RoleViewProps> = ({ user, onNavigateTab }) => {
  if (user.roleType === 'teaching-assistant') {
    return <TAAcademicRecordTab />;
  }
  return <EmptyTab tabId="settings" onBackToHome={() => onNavigateTab('home')} />;
};

const SettingsForRole: React.FC<RoleViewProps> = ({ user, searchQuery, onNavigateTab }) => {
  if (user.roleType === 'student') {
    return <SettingsTab searchQuery={searchQuery} />;
  }
  if (user.roleType === 'faculty') {
    return <FacultySettingsTab />;
  }
  if (user.roleType === 'admin') {
    return <AdminSettingsTab />;
  }
  if (user.roleType === 'dept-head') {
    return <DeptHeadSettingsTab onNavigateTab={onNavigateTab} />;
  }
  if (user.roleType === 'dean') {
    return <DeanSettingsTab />;
  }
  return <EmptyTab tabId="settings" onBackToHome={() => onNavigateTab('home')} />;
};

interface AuthedLayoutProps {
  user: User;
  onLogout: () => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

const AuthedLayout: React.FC<AuthedLayoutProps> = ({
  user,
  onLogout,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  searchQuery,
  setSearchQuery,
}) => {
  const currentRole: RoleType = user.roleType ?? 'student';
  const { data: unreadMessages } = useUnreadMessageCount();
  return (
    <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col xl:flex-row relative font-sans text-slate-800 selection:bg-blue-200">
      <Sidebar
        roleType={currentRole}
        onLogout={onLogout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        messageBadge={unreadMessages ?? 0}
      />
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] p-4 sm:p-6 lg:p-8 space-y-7">
        <TopBar
          user={user}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <Outlet />
      </main>
    </div>
  );
};

export default function App() {
  const { user, isRehydrating, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (isRehydrating) {
    return (
      <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-[#3256a8]/20 border-t-[#3256a8] rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Restoring your session...</p>
      </div>
    );
  }

  const go = navigateTab(navigate);

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/Home" replace /> : <Login />}
      />

      <Route
        element={
          user ? (
            <AuthedLayout
              user={user}
              onLogout={handleLogout}
              mobileSidebarOpen={mobileSidebarOpen}
              setMobileSidebarOpen={setMobileSidebarOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route path="/" element={<Navigate to="/Home" replace />} />
        {user && <Route path="/Home" element={<HomeForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/Courses" element={<CoursesForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/Materials" element={<MaterialsForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/Grades" element={<GradesForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/Schedule" element={<ScheduleForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/SmartSchedule" element={<SmartScheduleForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/TodoList" element={<TodoListForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/Recordings" element={<RecordingsForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/Community" element={<CommunityForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/AITutor" element={<AITutorForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/MyStudents" element={<MyStudentsForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/Attendance" element={<AttendanceForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/GradeEntry" element={<GradeEntryForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/CourseCommunity" element={<CourseCommunityForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/Students" element={<StudentsForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/FacultyAndStaff" element={<FacultyStaffForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/Enrollment" element={<EnrollmentForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/Finance" element={<FinanceForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/ExamScheduling" element={<ExamSchedulingForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/Analytics" element={<AnalyticsForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/Reports" element={<ReportsForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/AtRiskStudents" element={<AtRiskForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/Departments" element={<DepartmentsForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/AcademicOverview" element={<AcademicOverviewForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/FinancialOverview" element={<FinancialOverviewForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/UniversityAnalytics" element={<UniversityAnalyticsForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/TASections" element={<TASectionsForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/TAAttendance" element={<TAAttendanceForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/TAGrades" element={<TAGradesForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/TAStudents" element={<TAStudentsForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/TAMaterials" element={<TAMaterialsForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/TAAcademicRecord" element={<TAAcademicRecordForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/Messages" element={<MessagesForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/Settings" element={<SettingsForRole user={user} searchQuery={searchQuery} onNavigateTab={go} />} />}
        {user && <Route path="/Help" element={<EmptyTab tabId="help" onBackToHome={() => go('home')} />} />}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
