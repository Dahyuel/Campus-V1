import React, { useState } from 'react';
import { MapPin, Users, Calendar, X, Flag, CheckCircle2 } from 'lucide-react';
import { useTASections, useTASectionStudents, useFlagTAStudent, useResolveTAFlag } from '../../hooks/useTAData';

interface TASectionsTabProps {
  onNavigateTab?: (tabId: string) => void;
}

export const TASectionsTab: React.FC<TASectionsTabProps> = ({ onNavigateTab }) => {
  const { data: sections, isLoading } = useTASections();
  const [rosterSection, setRosterSection] = useState<any | null>(null);
  const { data: roster } = useTASectionStudents(rosterSection?.courseId ?? null, rosterSection?.sectionLabel ?? null);
  const flagStudent = useFlagTAStudent();
  const resolveFlag = useResolveTAFlag();
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#3256a8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(sections ?? []).map((s: any) => (
        <section key={s.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 rounded-md text-slate-700">{s.courseCode}</span>
            <h3 className="text-sm font-bold text-slate-900">{s.courseName}</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-amber-700 bg-amber-100/70">{s.sectionLabel}</span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500"><MapPin className="w-3.5 h-3.5" />{s.room}</span>
            <span className="text-xs text-slate-500 ml-auto">Supervisor: {s.facultyName}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Schedule</p>
              {s.schedule.length === 0 ? (
                <p className="text-xs text-slate-400">TBA</p>
              ) : (
                s.schedule.map((x: any, i: number) => (
                  <p key={i} className="text-xs text-slate-700 inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{x.day} · {x.timeSlot}</p>
                ))
              )}
            </div>
            <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Students</p>
              <p className="text-sm font-bold text-slate-900">{s.studentsCount}</p>
            </div>
            <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance Rate</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3256a8]" style={{ width: `${s.attendanceRate}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-800">{s.attendanceRate}%</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto mb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2 px-3">Assessment</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Weight</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 text-xs text-slate-700">
                {s.assessments.map((a: any) => (
                  <tr key={a.id}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{a.title}</td>
                    <td className="py-2.5 px-3">{a.type}</td>
                    <td className="py-2.5 px-3">{a.weight}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${a.submissionStatus === 'APPROVED' ? 'text-emerald-700 bg-emerald-100/70' : a.submissionStatus === 'PENDING' ? 'text-amber-800 bg-amber-100/70' : 'text-slate-500 bg-slate-100'}`}>
                        {a.submissionStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => onNavigateTab?.('ta-attendance')} className="px-3.5 py-1.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl cursor-pointer">Take Attendance</button>
            <button onClick={() => onNavigateTab?.('ta-grades')} className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Grade Entry</button>
            <button onClick={() => setRosterSection(s)} className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 text-xs font-bold rounded-xl cursor-pointer">View Students</button>
          </div>
        </section>
      ))}

      {rosterSection && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-100 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">{rosterSection.courseCode} — {rosterSection.sectionLabel} Roster</h3>
              <button onClick={() => { setRosterSection(null); setFlaggingId(null); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Student ID</th>
                  <th className="py-2 px-3">Attend %</th>
                  <th className="py-2 px-3">Asg Avg</th>
                  <th className="py-2 px-3">Standing</th>
                  <th className="py-2 px-3 text-right">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 text-xs text-slate-700">
                {(roster ?? []).map((stu: any) => (
                  <tr key={stu.id}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{stu.name}</td>
                    <td className="py-2.5 px-3">{stu.studentId}</td>
                    <td className="py-2.5 px-3">{stu.attendancePct}%</td>
                    <td className="py-2.5 px-3">{stu.assignmentAvg}%</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${stu.standing === 'GOOD' ? 'text-emerald-700 bg-emerald-100/70' : stu.standing === 'WARNING' ? 'text-amber-800 bg-amber-100/70' : 'text-rose-700 bg-rose-100/70'}`}>{stu.standing}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {stu.isFlagged ? (
                        <button onClick={() => resolveFlag.mutate({ studentId: stu.id, courseId: rosterSection.courseId })} className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer">Resolve</button>
                      ) : (
                        <button onClick={() => { setFlaggingId(stu.id); setReason(''); }} className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3256a8] hover:underline cursor-pointer"><Flag className="w-3 h-3" />Flag</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {flaggingId && (
              <div className="mt-4 p-4 rounded-2xl border border-amber-200 bg-amber-50">
                <p className="text-xs font-bold text-amber-800 mb-2">Reason for flagging</p>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs text-slate-800 focus:outline-hidden" placeholder="e.g. Failed Lab 6 and missed 3 sessions" />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      flagStudent.mutate({ studentId: flaggingId, courseId: rosterSection.courseId, sectionLabel: rosterSection.sectionLabel, reason });
                      setFlaggingId(null);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Flag & Notify Supervisor
                  </button>
                  <button onClick={() => setFlaggingId(null)} className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Flags notify your supervising professor only.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
