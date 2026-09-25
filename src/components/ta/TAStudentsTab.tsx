import React, { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { useTAStudents, useFlagTAStudent, useResolveTAFlag } from '../../hooks/useTAData';

export const TAStudentsTab: React.FC = () => {
  const { data: students, isLoading } = useTAStudents();
  const flagStudent = useFlagTAStudent();
  const resolveFlag = useResolveTAFlag();
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [flagTarget, setFlagTarget] = useState<any | null>(null);
  const [reason, setReason] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#3256a8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const list = students ?? [];
  const sections = ['All', ...Array.from(new Set(list.map((s: any) => s.sectionLabel)))];
  const filtered = list.filter((s: any) => {
    if (sectionFilter !== 'All' && s.sectionLabel !== sectionFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden w-64"
          />
          <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden">
            {sections.map((s: any) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Student ID</th>
                <th className="py-2.5 px-3">Course</th>
                <th className="py-2.5 px-3">Section</th>
                <th className="py-2.5 px-3">Attend %</th>
                <th className="py-2.5 px-3">Asg Avg</th>
                <th className="py-2.5 px-3">Standing</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-xs text-slate-700">
              {filtered.map((s: any) => (
                <tr key={`${s.id}-${s.courseCode}`}>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{s.name}</td>
                  <td className="py-2.5 px-3">{s.studentId}</td>
                  <td className="py-2.5 px-3">{s.courseCode}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-amber-700 bg-amber-100/70">{s.sectionLabel}</span>
                  </td>
                  <td className="py-2.5 px-3">{s.attendancePct}%</td>
                  <td className="py-2.5 px-3">{s.assignmentAvg}%</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${s.standing === 'GOOD' ? 'text-emerald-700 bg-emerald-100/70' : s.standing === 'WARNING' ? 'text-amber-800 bg-amber-100/70' : 'text-rose-700 bg-rose-100/70'}`}>{s.standing}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {s.isFlagged ? (
                      <button onClick={() => resolveFlag.mutate({ studentId: s.id, courseId: s.courseId })} className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer">Resolve Flag</button>
                    ) : (
                      <button onClick={() => { setFlagTarget(s); setReason(''); }} className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3256a8] hover:underline cursor-pointer"><Flag className="w-3 h-3" />Flag</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {flagTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Flag {flagTarget.name}</h3>
              <button onClick={() => setFlagTarget(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden" placeholder="Reason for flagging..." />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  flagStudent.mutate({ studentId: flagTarget.id, courseId: flagTarget.courseId, sectionLabel: flagTarget.sectionLabel, reason });
                  setFlagTarget(null);
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Flag & Notify Supervisor
              </button>
              <button onClick={() => setFlagTarget(null)} className="px-4 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
