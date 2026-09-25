import React, { useState } from 'react';
import { Video, Loader2, Play, FileText, Download, X } from 'lucide-react';
import {
  useStudentRecordings,
  useRecordingStreamUrl,
  useStudentTranscript,
  StudentRecording,
} from '../../hooks/useRecordings';
import { User } from '../../types';

interface RecordingsTabProps {
  user: User;
}

const ACCESS_STYLES: Record<string, string> = {
  attended: 'bg-emerald-100 text-emerald-700',
  excuse: 'bg-amber-100 text-amber-700',
};

export const RecordingsTab: React.FC<RecordingsTabProps> = () => {
  const { data: recordings, isLoading } = useStudentRecordings();
  const streamUrl = useRecordingStreamUrl();
  const [courseFilter, setCourseFilter] = useState('All');
  const [transcriptId, setTranscriptId] = useState<string | null>(null);

  const { data: transcript } = useStudentTranscript(transcriptId);

  const courses = Array.from(new Set((recordings ?? []).map((r) => r.courseCode)));
  const filtered = (recordings ?? []).filter(
    (r) => courseFilter === 'All' || r.courseCode === courseFilter
  );

  const handleWatch = async (rec: StudentRecording) => {
    const res = await streamUrl.mutateAsync(rec.id);
    window.open(res.url, '_blank');
  };

  const handleDownloadTranscript = () => {
    if (!transcript) return;
    const blob = new Blob([transcript.fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
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
        <Video className="w-5 h-5 text-[#3256a8]" />
        <h2 className="text-lg font-bold text-slate-800">Lecture Recordings</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {['All', ...courses].map((c) => (
          <button
            key={c}
            onClick={() => setCourseFilter(c)}
            className={courseFilter === c ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#3256a8] text-white' : 'px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200'}
          >
            {c}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-400">
          No recordings available for you yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((rec) => (
            <div key={rec.id} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-[#3256a8] bg-blue-50 px-2 py-0.5 rounded">{rec.courseCode}</span>
                  <p className="text-sm font-bold text-slate-800 mt-1.5">{rec.lectureLabel}</p>
                  <p className="text-[11px] text-slate-400">{rec.courseName} · {rec.uploadedAt}</p>
                </div>
                <span className={ACCESS_STYLES[rec.accessType] ?? 'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500'}>
                  {rec.accessType === 'attended' ? 'Attended' : 'Excused Access'}
                </span>
              </div>
              {rec.status === 'PROCESSING' ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Transcript being generated...
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleWatch(rec)}
                    disabled={streamUrl.isPending}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-[#3256a8] hover:bg-[#284588] disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    <Play className="w-3.5 h-3.5" /> Watch Recording
                  </button>
                  {rec.hasTranscript && (
                    <button
                      onClick={() => setTranscriptId(rec.id)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" /> Transcript
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {transcriptId && (
        <div className="fixed inset-0 bg-black/30 z-40 flex justify-end" onClick={() => setTranscriptId(null)}>
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Transcript</h3>
              <div className="flex items-center gap-2">
                <button onClick={handleDownloadTranscript} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3256a8]">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button onClick={() => setTranscriptId(null)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {(transcript?.segments ?? []).map((seg) => (
                <div key={seg.index} className="flex gap-3">
                  <span className="text-[10px] font-mono font-bold text-[#3256a8] shrink-0 pt-0.5">{seg.startTime}</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{seg.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingsTab;
