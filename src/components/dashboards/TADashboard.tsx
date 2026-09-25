import React from 'react';
import {
  Layout,
  Users,
  ClipboardList,
  Clock,
  MapPin,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { useTADashboard } from '../../hooks/useTAData';

interface TADashboardProps {
  searchQuery?: string;
  onNavigateTab?: (tabId: string) => void;
}

export const TADashboard: React.FC<TADashboardProps> = ({ onNavigateTab }) => {
  const { data, isLoading } = useTADashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#3256a8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats ?? { sectionsCount: 0, studentsCount: 0, pendingGradingCount: 0, pendingApprovalCount: 0 };
  const todaySections = data?.todaySections ?? [];
  const gradingQueue = data?.gradingQueue ?? [];
  const pendingApprovals = data?.pendingApprovals ?? [];
  const supervisors = data?.supervisors ?? [];
  const recentActivity = data?.recentActivity ?? [];

  const statCards = [
    { label: 'Sections Today', value: todaySections.length, icon: Layout, color: 'text-[#3256a8] bg-blue-50' },
    { label: 'Students Under Supervision', value: stats.studentsCount, icon: Users, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pending Grading', value: stats.pendingGradingCount, icon: ClipboardList, color: 'text-amber-600 bg-amber-50' },
    { label: 'Pending Approval', value: stats.pendingApprovalCount, icon: Clock, color: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="space-y-7">
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teaching Assistant Workspace</span>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">Your Supervision Overview</h2>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Today's Sections</h3>
        {todaySections.length === 0 ? (
          <p className="text-xs text-slate-400">No sections scheduled today.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todaySections.map((s: any) => (
              <div key={s.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white rounded-md text-slate-700 border border-slate-200/60">{s.courseCode}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-amber-700 bg-amber-100/70">{s.sectionLabel}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{s.courseName}</h4>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{s.time}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{s.room}</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab?.('ta-attendance')}
                  className="mt-3 w-full py-2 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Take Attendance
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-7">
        <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Grading Queue</h3>
          {gradingQueue.length === 0 ? (
            <p className="text-xs text-slate-400">Nothing to grade right now.</p>
          ) : (
            <div className="space-y-3">
              {gradingQueue.map((g: any) => (
                <div key={g.assessmentId} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{g.assessmentTitle}</p>
                    <p className="text-xs text-slate-500">{g.courseCode} · {g.sectionLabel} · {g.ungradedCount} ungraded</p>
                  </div>
                  <button
                    onClick={() => onNavigateTab?.('ta-grades')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer ${g.priority === 'high' ? 'bg-rose-50 text-rose-600' : g.priority === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}
                  >
                    {g.dueLabel}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Pending Professor Approvals</h3>
          {pendingApprovals.length === 0 ? (
            <p className="text-xs text-slate-400">No pending submissions.</p>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map((p: any) => (
                <div key={p.submissionId} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{p.assessmentTitle}</p>
                    <p className="text-xs text-slate-500">{p.courseCode} · {p.sectionLabel} · {p.professorName}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${p.status === 'APPROVED' ? 'text-emerald-700 bg-emerald-100/70' : p.status === 'REJECTED' ? 'text-rose-700 bg-rose-100/70' : 'text-amber-800 bg-amber-100/70'}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-7">
        <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-bold text-slate-900 mb-4">My Supervisors</h3>
          <div className="space-y-3">
            {supervisors.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
                <div>
                  <p className="text-sm font-bold text-slate-900">{s.facultyName}</p>
                  <p className="text-xs text-slate-500">{s.courseCode} · {s.sectionLabel} · {s.facultyEmail}</p>
                </div>
                <button
                  onClick={() => onNavigateTab?.('messages')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Message
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-xs text-slate-400">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="flex-1">{a.action}</span>
                  <span className="text-slate-400">{a.time}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
