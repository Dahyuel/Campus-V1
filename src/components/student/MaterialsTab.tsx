import React, { useState } from 'react';
import { Loader2, FileText, FileArchive, File, ExternalLink, FolderOpen } from 'lucide-react';
import { useStudentMaterials, useMaterialUrl } from '../../hooks/useStudentData';
import { User } from '../../types';

interface MaterialsTabProps {
  user: User;
}

interface Material {
  id: string;
  fileName: string;
  course: string;
  courseCode: string;
  type: string;
  uploadDate: string;
  size: string;
  fileKey: string;
}

const TYPE_FILTERS = ['All', 'PDF', 'Assignment', 'Lab Archive', 'Other'];

function iconFor(type: string) {
  const t = type.toLowerCase();
  if (t.includes('pdf')) return <FileText className="w-6 h-6 text-rose-500" />;
  if (t.includes('zip') || t.includes('archive')) return <FileArchive className="w-6 h-6 text-amber-500" />;
  return <File className="w-6 h-6 text-blue-500" />;
}

export const MaterialsTab: React.FC<MaterialsTabProps> = () => {
  const { data, isLoading } = useStudentMaterials();
  const urlMutation = useMaterialUrl();
  const [courseFilter, setCourseFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const materials: Material[] = data?.materials ?? data ?? [];

  const courses = Array.from(new Set(materials.map((m) => m.courseCode)));
  const filtered = materials.filter((m) => {
    const courseOk = courseFilter === 'All' || m.courseCode === courseFilter;
    const typeOk = typeFilter === 'All' || m.type.toLowerCase().includes(typeFilter.toLowerCase().replace(' lab archive', 'archive'));
    return courseOk && typeOk;
  });

  const handleOpen = async (id: string) => {
    const url = await urlMutation.mutateAsync(id);
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#3256a8]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FolderOpen className="w-5 h-5 text-[#3256a8]" />
        <h2 className="text-lg font-bold text-slate-800">Course Materials</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {['All Courses', ...courses].map((c) => (
          <button
            key={c}
            onClick={() => setCourseFilter(c === 'All Courses' ? 'All' : c)}
            className={courseFilter === c || (c === 'All Courses' && courseFilter === 'All') ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#3256a8] text-white' : 'px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200'}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={typeFilter === t ? 'px-3 py-1.5 rounded-full text-[11px] font-bold bg-slate-800 text-white' : 'px-3 py-1.5 rounded-full text-[11px] font-bold bg-white border border-slate-200 text-slate-500'}
          >
            {t}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-400">
          No materials uploaded yet for this course.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <div key={m.id} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                {iconFor(m.type)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate" title={m.fileName}>{m.fileName}</p>
                  <span className="inline-block text-[10px] font-bold text-[#3256a8] bg-blue-50 px-1.5 py-0.5 rounded mt-1">{m.courseCode}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 space-y-0.5">
                <p>{m.type}</p>
                <p>{m.uploadDate} · {m.size}</p>
              </div>
              <button
                onClick={() => handleOpen(m.id)}
                disabled={urlMutation.isPending}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-[#3256a8] hover:bg-[#284588] disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialsTab;
