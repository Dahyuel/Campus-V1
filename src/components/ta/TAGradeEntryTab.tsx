import React, { useState, useEffect } from 'react';
import { Lock, Send } from 'lucide-react';
import {
  useTASections,
  useTAGrades,
  useSaveTAGrades,
  useSubmitTAGrades,
  useTAGradeSubmissions,
} from '../../hooks/useTAData';

export const TAGradeEntryTab: React.FC = () => {
  const { data: sections } = useTASections();
  const sectionList = sections ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = sectionList.find((s: any) => s.courseId === activeId) ?? sectionList[0] ?? null;
  const courseId = active?.courseId ?? null;

  const assessments = active?.assessments ?? [];
  const [assessmentTitle, setAssessmentTitle] = useState('');
  useEffect(() => {
    if (assessments.length && !assessments.some((a: any) => a.title === assessmentTitle)) {
      setAssessmentTitle(assessments[0].title);
    }
  }, [assessments, assessmentTitle]);

  const { data: gradesData } = useTAGrades(courseId, assessmentTitle);
  const { data: submissions } = useTAGradeSubmissions();
  const saveGrades = useSaveTAGrades();
  const submitGrades = useSubmitTAGrades();

  const [entries, setEntries] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const rows = gradesData ?? [];
  useEffect(() => {
    const next: Record<string, string> = {};
    rows.forEach((r: any) => {
      next[r.studentId] = r.grade === null ? '' : String(r.grade);
    });
    setEntries(next);
  }, [gradesData]);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  };

  const currentAssessment = assessments.find((a: any) => a.title === assessmentTitle);
  const submissionStatus = currentAssessment?.submissionStatus ?? 'NOT SUBMITTED';
  const isLocked = submissionStatus === 'PENDING' || submissionStatus === 'APPROVED';

  const handleSave = () => {
    if (!courseId || !assessmentTitle) return;
    const payload = Object.entries(entries)
      .filter(([, v]) => v !== '')
      .map(([studentId, grade]) => ({ studentId, grade: Number(grade) }));
    saveGrades.mutate(
      { courseId, assessmentTitle, entries: payload },
      { onSuccess: () => showToast('Draft saved') }
    );
  };

  const handleSubmit = () => {
    if (!courseId || !assessmentTitle || !active) return;
    submitGrades.mutate(
      { courseId, assessmentTitle, sectionLabel: active.sectionLabel },
      { onSuccess: () => showToast('Submitted to professor for approval') }
    );
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap gap-2 mb-4">
          {sectionList.map((s: any) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.courseId)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${active?.courseId === s.courseId ? 'bg-[#3256a8] text-white' : 'bg-slate-50 text-slate-600 border border-slate-200/60'}`}
            >
              {s.courseCode} · {s.sectionLabel}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Assessment</label>
          <select
            value={assessmentTitle}
            onChange={(e) => setAssessmentTitle(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden"
          >
            {assessments.map((a: any) => (
              <option key={a.id} value={a.title}>{a.title} ({a.type})</option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
          <Lock className="w-3.5 h-3.5" />
          <span>Midterm and Final assessments are managed by the supervising professor.</span>
        </div>
      </section>

      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">%</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-xs text-slate-700">
              {rows.map((r: any) => (
                <tr key={r.studentId}>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{r.studentName}</td>
                  <td className="py-2.5 px-3">{r.studentId}</td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      value={entries[r.studentId] ?? ''}
                      disabled={isLocked}
                      onChange={(e) => setEntries((p) => ({ ...p, [r.studentId]: e.target.value }))}
                      className="w-20 px-2 py-1 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-hidden disabled:bg-slate-100"
                    />
                    <span className="text-slate-400 ml-1">/ {r.outOf}</span>
                  </td>
                  <td className="py-2.5 px-3">{r.percentage === null ? '—' : `${r.percentage}%`}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full text-slate-500 bg-slate-100">{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          <button onClick={handleSave} disabled={isLocked} className="px-4 py-2 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50">
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLocked}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 ${isLocked ? 'bg-amber-100 text-amber-700 cursor-not-allowed' : 'bg-[#3256a8] hover:bg-[#284588] text-white'}`}
          >
            <Send className="w-3.5 h-3.5" />
            {isLocked ? 'Awaiting Professor Approval' : 'Submit to Professor for Approval'}
          </button>
        </div>
      </section>

      <section className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
        <p className="text-xs font-medium text-amber-700 mb-2">Submission History</p>
        {(submissions ?? []).length === 0 ? (
          <p className="text-xs text-amber-600/70">No submissions yet.</p>
        ) : (
          (submissions ?? []).map((s: any) => (
            <div key={s.id} className="flex items-center justify-between text-xs text-amber-600 mt-1">
              <span>{s.assessmentTitle} — {s.sectionLabel}</span>
              <span className={s.status === 'APPROVED' ? 'text-emerald-600 font-medium' : s.status === 'REJECTED' ? 'text-rose-600 font-medium' : 'text-amber-600'}>
                {s.status}
              </span>
            </div>
          ))
        )}
      </section>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl">{toast}</div>
      )}
    </div>
  );
};