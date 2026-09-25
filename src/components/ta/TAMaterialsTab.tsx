import React, { useState } from 'react';
import { Upload, Trash2, FileText, X } from 'lucide-react';
import { useTAMaterials, useUploadTAMaterial, useDeleteTAMaterial, useTASections } from '../../hooks/useTAData';

export const TAMaterialsTab: React.FC = () => {
  const { data: materials, isLoading } = useTAMaterials();
  const { data: sections } = useTASections();
  const upload = useUploadTAMaterial();
  const del = useDeleteTAMaterial();
  const [isOpen, setIsOpen] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [materialType, setMaterialType] = useState('Lab Sheet');
  const [file, setFile] = useState<File | null>(null);

  const sectionList = sections ?? [];
  const activeSection = sectionList.find((s: any) => s.courseId === courseId) ?? sectionList[0];

  const handleUpload = () => {
    if (!file || !activeSection) return;
    const fd = new FormData();
    fd.append('file', file as File);
    fd.append('courseId', activeSection.courseId);
    fd.append('sectionLabel', activeSection.sectionLabel);
    fd.append('materialType', materialType);
    upload.mutate(fd, { onSuccess: () => { setIsOpen(false); setFile(null); } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#3256a8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Section Materials</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Materials you upload appear in the course material list for students in your section, labeled with your section name.</p>
          </div>
          <button onClick={() => { setCourseId(sectionList[0]?.courseId ?? ''); setIsOpen(true); }} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl cursor-pointer shrink-0">
            <Upload className="w-3.5 h-3.5" /> Upload Material
          </button>
        </div>

        <div className="space-y-3">
          {(materials ?? []).map((m: any) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/60">
              <FileText className="w-5 h-5 text-[#3256a8] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{m.fileName}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                  <span className="font-mono px-1.5 py-0.5 bg-white rounded border border-slate-200/60">{m.courseCode}</span>
                  <span className="font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full text-amber-700 bg-amber-100/70">{m.sectionLabel}</span>
                  <span>{m.type}</span>
                  <span>{m.uploadedAt}</span>
                  <span>{m.size}</span>
                </div>
              </div>
              <button onClick={() => del.mutate(m.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(materials ?? []).length === 0 && <p className="text-xs text-slate-400">No materials uploaded yet.</p>}
        </div>
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Upload Material</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course & Section</label>
                <select value={activeSection?.courseId ?? ''} onChange={(e) => setCourseId(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden">
                  {sectionList.map((s: any) => <option key={s.id} value={s.courseId}>{s.courseCode} — {s.sectionLabel}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Material Type</label>
                <select value={materialType} onChange={(e) => setMaterialType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden">
                  {['Lab Sheet', 'Tutorial Notes', 'Assignment PDF', 'Solution PDF', 'Other'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">File</label>
                <input type="file" accept=".pdf,.doc,.docx,.zip,.pptx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full text-xs text-slate-600" />
              </div>
              <button onClick={handleUpload} disabled={!file} className="w-full py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50">Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};