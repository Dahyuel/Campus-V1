import React, { useState, useEffect } from 'react';
import { QrCode, Plus, X, Download } from 'lucide-react';
import {
  useTASections,
  useTAAttendanceSessions,
  useTAAttendanceSummary,
  useCreateTAAttendanceSession,
} from '../../hooks/useTAData';

export const TAAttendanceTab: React.FC = () => {
  const { data: sections } = useTASections();
  const sectionList: any[] = sections ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = sectionList.find((s: any) => s.courseId === activeId) ?? sectionList[0] ?? null;
  const courseId = active?.courseId ?? null;

  const { data: sessionsData } = useTAAttendanceSessions(courseId);
  const { data: summaryData } = useTAAttendanceSummary(courseId);
  const createSession = useCreateTAAttendanceSession();

  const [selectedLecture, setSelectedLecture] = useState('Lab Session 8');
  const [isQrActive, setIsQrActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [toast, setToast] = useState<string | null>(null);
  const [isManualOpen, setIsManualOpen] = useState(false);

  useEffect(() => {
    if (!isQrActive || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [isQrActive, timeLeft]);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  };

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleGenerate = async () => {
    if (!active) return;
    try {
      await createSession.mutateAsync({ courseId: active.courseId, lectureLabel: selectedLecture, sectionLabel: active.sectionLabel });
      setIsQrActive(true);
      setTimeLeft(600);
      showToast(`Generated QR for ${selectedLecture} — ${active.sectionLabel}`);
    } catch {
      showToast('Failed to generate QR.');
    }
  };

  const sessions = sessionsData ?? [];
  const summaries = summaryData ?? [];

  return (
    <div className="space-y-7">
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lab Attendance</span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">QR Attendance Session</h2>
          </div>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-slate-50/60 rounded-2xl p-5 border border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Label</label>
                <input value={selectedLecture} onChange={(e) => setSelectedLecture(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden" placeholder="Lab Session 8" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
                <input value={active?.sectionLabel ?? ''} readOnly className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-600" />
              </div>
            </div>
            <button onClick={handleGenerate} className="w-full py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2">
              <QrCode className="w-4 h-4" /> Generate QR Code
            </button>
          </div>

          <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-100 flex flex-col items-center justify-center">
            {isQrActive ? (
              <>
                <div className="w-32 h-32 bg-white rounded-2xl border-2 border-dashed border-[#3256a8]/40 flex items-center justify-center mb-3">
                  <QrCode className="w-16 h-16 text-[#3256a8]" />
                </div>
                <p className="text-2xl font-bold text-slate-900 font-mono">{fmt(timeLeft)}</p>
                <p className="text-[11px] text-slate-500 mt-1">Students scan to mark present</p>
              </>
            ) : (
              <p className="text-xs text-slate-400 text-center">No active session. Generate a QR code to open a live window.</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Session History</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Session</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Present</th>
                  <th className="py-2.5 px-3">Absent</th>
                  <th className="py-2.5 px-3">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 text-xs text-slate-700">
                {sessions.map((s: any) => (
                  <tr key={s.id}>
                    <td className="py-3 px-3 font-bold text-slate-900">{s.lectureNo}</td>
                    <td className="py-3 px-3 text-slate-500">{s.date}</td>
                    <td className="py-3 px-3 font-semibold text-emerald-700">{s.present}</td>
                    <td className="py-3 px-3 font-semibold text-rose-600">{s.absent}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{s.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => showToast('Attendance report exported to CSV')} className="mt-4 w-full py-2.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2">
              <Download className="w-3.5 h-3.5" /> Export Attendance Report
            </button>
          </div>

          <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Student Summary</h3>
              <button onClick={() => setIsManualOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Manual Mark
              </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Present</th>
                  <th className="py-2.5 px-3">Absent</th>
                  <th className="py-2.5 px-3">Rate</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 text-xs text-slate-700">
                {summaries.map((s: any) => (
                  <tr key={s.id}>
                    <td className="py-3 px-3 font-bold text-slate-900">{s.name}</td>
                    <td className="py-3 px-3 font-semibold text-emerald-700">{s.present}</td>
                    <td className="py-3 px-3 font-semibold text-rose-600">{s.absent}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{s.rate}%</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${s.status === 'GOOD' ? 'text-emerald-700 bg-emerald-100/70' : s.status === 'AT RISK' ? 'text-rose-700 bg-rose-100/70' : 'text-amber-800 bg-amber-100/70'}`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isManualOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Manual Attendance Override</h3>
              <button onClick={() => setIsManualOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-500">Use the roster table to mark students present or excused manually.</p>
            <button onClick={() => { setIsManualOpen(false); showToast('Manual override saved'); }} className="mt-4 w-full py-2.5 bg-[#3256a8] text-white text-xs font-bold rounded-xl cursor-pointer">Confirm</button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl">{toast}</div>
      )}
    </div>
  );
};
