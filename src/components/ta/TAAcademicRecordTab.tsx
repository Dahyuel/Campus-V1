import React, { useState } from 'react';
import { Pencil, Plus, Trash2, X, GraduationCap } from 'lucide-react';
import {
  useTAAcademicRecord,
  useUpdateTAAcademicRecord,
  useAddPostgradCourse,
  useUpdatePostgradCourse,
  useDeletePostgradCourse,
} from '../../hooks/useTAData';

export const TAAcademicRecordTab: React.FC = () => {
  const { data, isLoading } = useTAAcademicRecord();
  const updateRecord = useUpdateTAAcademicRecord();
  const addCourse = useAddPostgradCourse();
  const updateCourse = useUpdatePostgradCourse();
  const deleteCourse = useDeletePostgradCourse();

  const record = data?.record;
  const courses = data?.postgradCourses ?? [];
  const timeline = data?.stageTimeline ?? [];

  const [editInfo, setEditInfo] = useState(false);
  const [form, setForm] = useState<any>({});
  const [editStage, setEditStage] = useState(false);
  const [stageForm, setStageForm] = useState({ currentStage: '', stageProgress: 0 });
  const [courseModal, setCourseModal] = useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#3256a8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const gpa = record?.gpa ?? null;

  return (
    <div className="space-y-7">
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thesis & Research</span>
          <button
            onClick={() => { setForm(record ?? {}); setEditInfo(true); }}
            className="p-2 text-slate-400 hover:text-[#3256a8] hover:bg-blue-50 rounded-lg cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        {record ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full text-[#3256a8] bg-blue-50">
                <GraduationCap className="w-3 h-3" />{record.degreeType}
              </span>
              <span className="text-xs text-slate-500">{record.researchField}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">{record.thesisTitle}</h3>
            <p className="text-xs text-slate-600">Supervisor: <span className="font-semibold">{record.thesisSupervisor}</span></p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60"><p className="text-[10px] font-bold text-slate-400 uppercase">Enrolled</p><p className="text-sm font-bold text-slate-900">{record.enrollmentYear}</p></div>
              <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60"><p className="text-[10px] font-bold text-slate-400 uppercase">Expected Grad</p><p className="text-sm font-bold text-slate-900">{record.expectedGrad}</p></div>
              <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60"><p className="text-[10px] font-bold text-slate-400 uppercase">Stage</p><p className="text-sm font-bold text-slate-900">{record.currentStage}</p></div>
              <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60"><p className="text-[10px] font-bold text-slate-400 uppercase">GPA</p><p className="text-sm font-bold text-slate-900">{gpa !== null ? `${gpa} / 4.0` : '—'}</p></div>
            </div>
            {record.notes && <p className="text-xs text-slate-500 italic">{record.notes}</p>}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No academic record yet. Click the pencil to add your thesis details.</p>
        )}
      </section>

      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-slate-900">Research Stage Timeline</h3>
          <button onClick={() => { setStageForm({ currentStage: record?.currentStage ?? '', stageProgress: record?.stageProgress ?? 0 }); setEditStage(true); }} className="text-xs font-bold text-[#3256a8] hover:underline cursor-pointer">Update Stage</button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {timeline.map((st: any, i: number) => (
            <React.Fragment key={st.stage}>
              <div className="flex flex-col items-center gap-2 min-w-[110px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${st.done ? 'bg-emerald-500 text-white' : st.active ? 'bg-[#3256a8] text-white ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400'}`}>
                  {st.done ? '✓' : i + 1}
                </div>
                <span className={`text-[11px] font-semibold text-center ${st.active ? 'text-[#3256a8]' : 'text-slate-500'}`}>{st.stage}</span>
                {st.active && (
                  <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3256a8]" style={{ width: `${st.progress ?? 0}%` }} />
                  </div>
                )}
              </div>
              {i < timeline.length - 1 && <span className="text-slate-300">→</span>}
            </React.Fragment>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Postgrad Courses</h3>
          <button onClick={() => setCourseModal({})} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl cursor-pointer"><Plus className="w-3.5 h-3.5" />Add Course</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Course</th>
                <th className="py-2.5 px-3">Semester</th>
                <th className="py-2.5 px-3">Credits</th>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-xs text-slate-700">
              {courses.map((c: any) => (
                <tr key={c.id}>
                  <td className="py-2.5 px-3 font-mono">{c.courseCode}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{c.courseName}</td>
                  <td className="py-2.5 px-3">{c.semester}</td>
                  <td className="py-2.5 px-3">{c.credits}</td>
                  <td className="py-2.5 px-3">{c.grade ?? '—'}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${c.status === 'COMPLETED' ? 'text-emerald-700 bg-emerald-100/70' : c.status === 'FAILED' ? 'text-rose-700 bg-rose-100/70' : 'text-amber-800 bg-amber-100/70'}`}>{c.status}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button onClick={() => setCourseModal(c)} className="p-1.5 text-slate-400 hover:text-[#3256a8] cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteCourse.mutate(c.id)} className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editInfo && (
        <Modal title="Edit Academic Record" onClose={() => setEditInfo(false)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Degree Type"><select value={form.degreeType ?? "Master's"} onChange={(e) => setForm({ ...form, degreeType: e.target.value })} className="input"><option value="Master's">Master's</option><option value="PhD">PhD</option></select></Field>
            <Field label="Research Field"><input value={form.researchField ?? ''} onChange={(e) => setForm({ ...form, researchField: e.target.value })} className="input" /></Field>
            <Field label="Thesis Title" full><input value={form.thesisTitle ?? ''} onChange={(e) => setForm({ ...form, thesisTitle: e.target.value })} className="input" /></Field>
            <Field label="Supervisor"><input value={form.thesisSupervisor ?? ''} onChange={(e) => setForm({ ...form, thesisSupervisor: e.target.value })} className="input" /></Field>
            <Field label="Enrollment Year"><input type="number" value={form.enrollmentYear ?? ''} onChange={(e) => setForm({ ...form, enrollmentYear: Number(e.target.value) })} className="input" /></Field>
            <Field label="Expected Graduation"><input type="number" value={form.expectedGrad ?? ''} onChange={(e) => setForm({ ...form, expectedGrad: Number(e.target.value) })} className="input" /></Field>
            <Field label="GPA"><input type="number" step="0.1" value={form.gpa ?? ''} onChange={(e) => setForm({ ...form, gpa: Number(e.target.value) })} className="input" /></Field>
            <Field label="Notes" full><textarea value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input" /></Field>
          </div>
          <button onClick={() => { updateRecord.mutate(form); setEditInfo(false); }} className="mt-4 w-full py-2.5 bg-[#3256a8] text-white text-xs font-bold rounded-xl cursor-pointer">Save</button>
        </Modal>
      )}

      {editStage && (
        <Modal title="Update Research Stage" onClose={() => setEditStage(false)}>
          <Field label="Current Stage">
            <select value={stageForm.currentStage} onChange={(e) => setStageForm({ ...stageForm, currentStage: e.target.value })} className="input">
              {['Coursework', 'Research Proposal', 'Data Collection', 'Writing', 'Defense'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label={`Stage Progress: ${stageForm.stageProgress}%`}>
            <input type="range" min={0} max={100} value={stageForm.stageProgress} onChange={(e) => setStageForm({ ...stageForm, stageProgress: Number(e.target.value) })} className="w-full" />
          </Field>
          <button onClick={() => { updateRecord.mutate({ ...record, ...stageForm }); setEditStage(false); }} className="mt-4 w-full py-2.5 bg-[#3256a8] text-white text-xs font-bold rounded-xl cursor-pointer">Save</button>
        </Modal>
      )}

      {courseModal && (
        <Modal title={courseModal.id ? 'Edit Course' : 'Add Postgrad Course'} onClose={() => setCourseModal(null)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Course Name" full><input value={courseModal.courseName ?? ''} onChange={(e) => setCourseModal({ ...courseModal, courseName: e.target.value })} className="input" /></Field>
            <Field label="Course Code"><input value={courseModal.courseCode ?? ''} onChange={(e) => setCourseModal({ ...courseModal, courseCode: e.target.value })} className="input" /></Field>
            <Field label="Semester"><input value={courseModal.semester ?? ''} onChange={(e) => setCourseModal({ ...courseModal, semester: e.target.value })} className="input" /></Field>
            <Field label="Credits"><input type="number" value={courseModal.credits ?? 3} onChange={(e) => setCourseModal({ ...courseModal, credits: Number(e.target.value) })} className="input" /></Field>
            <Field label="Grade"><input value={courseModal.grade ?? ''} onChange={(e) => setCourseModal({ ...courseModal, grade: e.target.value })} className="input" /></Field>
            <Field label="Status">
              <select value={courseModal.status ?? 'IN PROGRESS'} onChange={(e) => setCourseModal({ ...courseModal, status: e.target.value })} className="input">
                <option value="IN PROGRESS">IN PROGRESS</option><option value="COMPLETED">COMPLETED</option><option value="FAILED">FAILED</option>
              </select>
            </Field>
          </div>
          <button
            onClick={() => {
              const { id, ...data } = courseModal;
              if (id) updateCourse.mutate({ id, data });
              else addCourse.mutate(data);
              setCourseModal(null);
            }}
            className="mt-4 w-full py-2.5 bg-[#3256a8] text-white text-xs font-bold rounded-xl cursor-pointer"
          >Save</button>
        </Modal>
      )}
    </div>
  );
};

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-100 shadow-2xl max-h-[85vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button>
      </div>
      {children}
    </div>
  </div>
);

const Field: React.FC<{ label: string; full?: boolean; children: React.ReactNode }> = ({ label, full, children }) => (
  <div className={full ? 'sm:col-span-2' : ''}>
    <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
    {children}
  </div>
);
