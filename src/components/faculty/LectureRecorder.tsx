import React, { useState, useRef } from 'react';

export const LectureRecorder: React.FC<{
  courseId: string;
  sessionId?: string;
  lectureLabel: string;
  onComplete: (blob: Blob) => void;
  onCancel: () => void;
}> = ({ lectureLabel, onComplete, onCancel }) => {
  const [state, setState] = useState<'idle' | 'recording' | 'stopped' | 'uploading'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [audioOnly, setAudioOnly] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        audioOnly ? { audio: true } : { audio: true, video: true }
      );
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';
      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        onComplete(blob);
      };

      mr.start(1000);
      setState('recording');
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch {
      alert('Microphone/camera access denied. Please allow permissions and try again.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    if (timerRef.current) clearInterval(timerRef.current);
    setState('stopped');
  };

  const formatTime = (secs: number) =>
    `${String(Math.floor(secs / 3600)).padStart(2, '0')}:${String(
      Math.floor((secs % 3600) / 60)
    ).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="w-24 h-24 rounded-full bg-rose-100 flex items-center justify-center">
        {state === 'recording' ? (
          <div className="w-8 h-8 rounded-sm bg-rose-500 animate-pulse" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-300" />
        )}
      </div>
      <p className="text-3xl font-mono font-bold text-slate-800">{formatTime(elapsed)}</p>
      <p className="text-sm text-slate-500">{lectureLabel}</p>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={audioOnly}
          onChange={(e) => setAudioOnly(e.target.checked)}
          disabled={state === 'recording'}
        />
        Audio only (smaller file)
      </label>
      <div className="flex gap-3">
        {state === 'idle' && (
          <button
            onClick={startRecording}
            className="px-6 py-3 bg-rose-500 text-white rounded-lg font-medium"
          >
            Start Recording
          </button>
        )}
        {state === 'recording' && (
          <button
            onClick={stopRecording}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg font-medium"
          >
            Stop & Upload
          </button>
        )}
        <button onClick={onCancel} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-lg">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LectureRecorder;