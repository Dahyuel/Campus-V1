import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Video,
  Mic,
  FileText,
  Users,
  X,
  CheckCircle2,
  UserPlus,
  Trash2,
  Loader2,
} from 'lucide-react';
import { LectureRecorder } from './LectureRecorder';
import { useFacultyCourses, useFacultyStudents } from '../../hooks/useFacultyData';
import {
  useFacultyRecordings,
  useRecordingAccess,
  useFacultyTranscript,
  useUploadRecording,
  useGrantRecordingAccess,
  useRevokeRecordingAccess,
  FacultyRecording,
} from '../../hooks/useRecordings';

interface FacultyCourse {
  id: string;
  name: string;
  code: string;
}

interface AccessRow {
  id: string;
  userId: string;
  name: string;
  studentId: string;
  accessType: string;
  grantedAt: string;
  grantedBy?: string;
}

export const FacultyRecordingsTab: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { data: coursesData } = useFacultyCourses();
  const courses: FacultyCourse[] = coursesData ?? [];
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(searchParams.get('courseId'));
  const activeCourse = courses.find((c) => c.id === selectedCourseId) ?? courses[0] ?? null;
  const activeCourseId = activeCourse?.id ?? null;

  const { data: recordingsData, isLoading } = useFacultyRecordings(activeCourseId);
  const recordings: FacultyRecording[] = recordingsData ?? [];
  const uploadRecording = useUploadRecording();

  const [isRecording, setIsRecording] = useState(false);
  const [lectureLabel, setLectureLabel] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [accessFor, setAccessFor] = useState<FacultyRecording | null>(null);
  const [transcriptFor, setTranscriptFor] = useState<FacultyRecording | null>(null);

  const { data: accessData } = useRecordingAccess(accessFor?.id ?? null);
  const accessRows: AccessRow[] = accessData ?? [];
  const { data: transcriptData, isLoading: transcriptLoading } = useFacultyTranscript(
    transcriptFor?.id ?? null
  );
  const { data: studentsData } = useFacultyStudents();
  const grantAccess = useGrantRecordingAccess();
  const revokeAccess = useRevokeRecordingAccess();

  // Students in this course who don't already have access
  const courseStudents = (studentsData ?? []).filter(
    (s: { courseId?: string }) => s.courseId === activeCourseId
  );
  const grantable = courseStudents.filter(
    (s: { id: string }) => !accessRows.some((a) => a.userId === s.id)
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleRecordingComplete = async (blob: Blob) => {
    if (!activeCourseId) return;
    const label = lectureLabel.trim() || 'Untitled lecture';
    const formData = new FormData();
    formData.append('courseId', activeCourseId);
    formData.append('lectureLabel', label);
    formData.append('file', blob, `${label.replace(/[^a-zA-Z0-9._-]/g, '_')}.webm`);
    setIsRecording(false);
    try {
      await uploadRecording.mutateAsync(formData);
      setLectureLabel('');
      showToast('Recording uploaded. Transcription runs in the background.');
    } catch {
      showToast('Upload failed. The recording was not saved.');
    }
  };

  const handleGrant = async (studentId: string, studentName: string) => {
    if (!accessFor) return;
    try {
      await grantAccess.mutateAsync({ recordingId: accessFor.id, studentId });
      showToast(`${studentName} can now watch this recording.`);
    } catch {
      showToast('Could not grant access.');
    }
  };

  const handleRevoke = async (studentId: string, studentName: string) => {
    if (!accessFor) return;
    try {
      await revokeAccess.mutateAsync({ recordingId: accessFor.id, studentId });
      showToast(`Access removed for ${studentName}.`);
    } catch {
      showToast('Could not remove access.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#3256a8] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3256a8] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}

      {/* Record a lecture */}
      <section className="bg-blue-50/70 border border-blue-200/80 rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-bold text-[#3256a8] uppercase tracking-wider">
            Lecture Capture
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Record This Lecture
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Records from this device. Students who missed the lecture can be granted access, and a
            transcript is generated automatically.
          </p>

          {isRecording && activeCourse ? (
            <div className="mt-5 bg-white rounded-2xl border border-slate-200">
              <LectureRecorder
                courseId={activeCourse.id}
                lectureLabel={`${activeCourse.code} · ${lectureLabel.trim() || 'Untitled lecture'}`}
                onComplete={handleRecordingComplete}
                onCancel={() => setIsRecording(false)}
              />
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
              <select
                value={activeCourse?.id ?? ''}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-xs focus:outline-hidden focus:border-[#3256a8] cursor-pointer"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={lectureLabel}
                onChange={(e) => setLectureLabel(e.target.value)}
                placeholder="Lecture label, e.g. Lecture 12"
                className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-xs focus:outline-hidden focus:border-[#3256a8]"
              />

              <button
                id="btn-start-recording"
                onClick={() => setIsRecording(true)}
                disabled={!activeCourse || uploadRecording.isPending}
                className="px-5 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadRecording.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading…</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Start Recording</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Recordings list */}
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4 mb-5">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCourseId === course.id
                  ? 'bg-[#3256a8] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {course.name}
            </button>
          ))}
        </div>

        {recordings.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">
            No recordings for this course yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Lecture</th>
                  <th className="py-3 px-4">Recorded</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Students With Access</th>
                  <th className="py-3 px-4 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {recordings.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#3256a8] shrink-0" />
                      <span>{rec.lectureLabel}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{rec.uploadedAt}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          rec.status.toUpperCase() === 'READY'
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                            : rec.status.toUpperCase() === 'FAILED'
                            ? 'text-rose-700 bg-rose-50 border border-rose-200/60'
                            : 'text-amber-700 bg-amber-50 border border-amber-200/60'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {rec.accessCount}
                      {rec.excuseCount > 0 && (
                        <span className="text-slate-400 font-medium"> ({rec.excuseCount} excused)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setAccessFor(rec)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] rounded-lg font-bold text-xs transition-all cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Access</span>
                        </button>
                        <button
                          onClick={() => setTranscriptFor(rec)}
                          disabled={rec.transcriptSegments === 0}
                          title={rec.transcriptSegments === 0 ? 'No transcript yet' : undefined}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] rounded-lg font-bold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Transcript</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Access management */}
      {accessFor && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900 text-sm">Who can watch this recording</h3>
              <button
                onClick={() => setAccessFor(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">{accessFor.lectureLabel}</p>

            <div className="max-h-44 overflow-y-auto mb-4">
              {accessRows.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No one has access yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {accessRows.map((row) => (
                    <div key={row.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{row.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {row.studentId} · {row.accessType} · {row.grantedAt}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRevoke(row.userId, row.name)}
                        disabled={revokeAccess.isPending}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-700 mb-2">Grant access to a student</p>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
                {grantable.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No students found for this course.</p>
                ) : (
                  grantable.map((s: { id: string; name: string; studentId: string }) => (
                    <button
                      key={s.id}
                      onClick={() => handleGrant(s.id, s.name)}
                      disabled={grantAccess.isPending}
                      className="w-full flex items-center justify-between py-2 px-1 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <span className="text-xs font-semibold text-slate-800">
                        {s.name} <span className="text-slate-400 font-normal">{s.studentId}</span>
                      </span>
                      <UserPlus className="w-3.5 h-3.5 text-[#3256a8]" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transcript */}
      {transcriptFor && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900 text-sm">Transcript</h3>
              <button
                onClick={() => setTranscriptFor(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">{transcriptFor.lectureLabel}</p>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {transcriptLoading ? (
                <p className="text-xs text-slate-500 py-4">Loading transcript…</p>
              ) : (transcriptData?.segments ?? []).length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No transcript available yet.</p>
              ) : (
                (transcriptData?.segments ?? []).map((seg) => (
                  <div key={seg.index} className="flex gap-3 text-xs">
                    <span className="font-mono text-slate-400 shrink-0">{seg.startTime}</span>
                    <p className="text-slate-700 leading-relaxed">{seg.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyRecordingsTab;
