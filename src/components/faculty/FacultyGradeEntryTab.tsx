import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  HelpCircle,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { GradeEntryRow } from '../../data/facultyMockData';
import {
  useFacultyCourses,
  useFacultyAssessments,
  useFacultyGrades,
  useSaveGrades,
  useReleaseGrades,
} from '../../hooks/useFacultyData';
import { useEffect } from 'react';

interface FacultyCourse {
  id: string;
  name: string;
  code: string;
  section: string;
}

interface FacultyAssessment {
  id: string;
  title: string;
  type: string;
  weight: string;
  outOf: number;
}

export const FacultyGradeEntryTab: React.FC = () => {
  const { data: coursesData } = useFacultyCourses();
  const courses: FacultyCourse[] = coursesData ?? [];
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const activeCourse = courses.find((c) => c.id === selectedCourseId) ?? courses[0] ?? null;
  const activeCourseId = activeCourse?.id ?? null;

  const { data: assessmentsData } = useFacultyAssessments(activeCourseId);
  const assessments: FacultyAssessment[] = assessmentsData ?? [];
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const currentAssessment =
    assessments.find((a) => a.title === selectedAssessment) ?? assessments[0] ?? null;
  const activeAssessment = currentAssessment?.title ?? '';

  const { data: gradesData } = useFacultyGrades(activeAssessment ? activeCourseId : null, activeAssessment);
  const saveGrades = useSaveGrades();
  const releaseGrades = useReleaseGrades();
  const [gradeRows, setGradeRows] = useState<GradeEntryRow[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setGradeRows(gradesData?.entries ?? []);
  }, [gradesData, activeCourseId, activeAssessment]);
  const [showTooltip, setShowTooltip] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleGradeChange = (studentId: string, valueStr: string) => {
    setGradeRows((prev) =>
      prev.map((row) => {
        if (row.studentId === studentId) {
          if (valueStr.trim() === '') {
            return {
              ...row,
              grade: null,
              percentage: null,
              status: 'MISSING',
            };
          }
          const num = parseFloat(valueStr);
          if (isNaN(num)) return row;
          const clamped = Math.max(0, Math.min(row.outOf, num));
          const pct = Math.round((clamped / row.outOf) * 100);
          return {
            ...row,
            grade: clamped,
            percentage: pct,
            status: 'ENTERED',
          };
        }
        return row;
      })
    );
  };

  // Calculations for summary strip
  const enteredCount = gradeRows.filter((r) => r.status === 'ENTERED').length;
  const missingCount = gradeRows.filter((r) => r.status === 'MISSING').length;
  const validPcts = gradeRows
    .filter((r) => r.percentage !== null)
    .map((r) => r.percentage as number);

  const classAvg = validPcts.length > 0
    ? Math.round(validPcts.reduce((a, b) => a + b, 0) / validPcts.length)
    : 0;
  const highest = validPcts.length > 0 ? Math.max(...validPcts) : 0;
  const lowest = validPcts.length > 0 ? Math.min(...validPcts) : 0;

  const handleSaveDraft = async () => {
    if (!activeCourseId) return;
    const entries = gradeRows
      .filter((r) => r.grade !== null)
      .map((r) => ({ studentId: r.studentId, grade: r.grade as number }));
    try {
      await saveGrades.mutateAsync({ courseId: activeCourseId, assessmentTitle: activeAssessment, entries });
      showToast('Grade draft saved successfully.');
    } catch {
      showToast('Save failed. Please try again.');
    }
  };

  const handleReleaseGrades = async () => {
    if (!activeCourseId) return;
    try {
      const result = await releaseGrades.mutateAsync({ courseId: activeCourseId, assessmentTitle: activeAssessment });
      showToast(`Grades released! Notifications dispatched to ${result.released} students.`);
    } catch {
      showToast('Release failed. Please try again.');
    }
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3256a8] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container Card */}
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        {/* Course Tab Strip */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4 mb-5">
          {courses.map((course) => (
            <button
              key={course.id}
              id={`tab-grade-${course.code.toLowerCase()}`}
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

        {/* Assessment Selector Row + Assessment Details in small gray text */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50/70 rounded-2xl border border-slate-100 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {assessments.length === 0 && (
              <span className="text-xs text-slate-500">No assessments defined for this course.</span>
            )}
            {assessments.map((ass) => (
              <button
                key={ass.id}
                id={`btn-assessment-${ass.id}`}
                onClick={() => setSelectedAssessment(ass.title)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeAssessment === ass.title
                    ? 'bg-[#3256a8] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {ass.title}
              </button>
            ))}
          </div>

          {currentAssessment && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>
                {currentAssessment.type} · Weight: {currentAssessment.weight} · Max Grade: {currentAssessment.outOf}
              </span>
            </div>
          )}
        </div>

        {/* Main Grade Entry Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Grade (editable)</th>
                <th className="py-3 px-4">Out Of</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {gradeRows.map((row) => (
                <tr key={row.studentId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {row.studentName}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                    {row.studentId}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max={row.outOf}
                        value={row.grade !== null ? row.grade : ''}
                        onChange={(e) => handleGradeChange(row.studentId, e.target.value)}
                        placeholder="—"
                        className="w-16 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center focus:outline-hidden focus:border-[#3256a8] focus:ring-1 focus:ring-[#3256a8] transition-all"
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-500">
                    /{row.outOf}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {row.percentage !== null ? `${row.percentage}%` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        row.status === 'ENTERED'
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                          : 'text-rose-700 bg-rose-50 border border-rose-200/60'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Strip */}
        <div className="mt-6 p-4 bg-slate-50/70 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-600">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <span>
              Entered: <strong className="text-emerald-700 font-bold">{enteredCount}</strong>
            </span>
            <span className="text-slate-300">·</span>
            <span>
              Missing: <strong className="text-rose-600 font-bold">{missingCount}</strong>
            </span>
            <span className="text-slate-300">·</span>
            <span>
              Class Average: <strong className="text-slate-900 font-bold">{classAvg}%</strong>
            </span>
            <span className="text-slate-300">·</span>
            <span>
              Highest: <strong className="text-emerald-700 font-bold">{highest}%</strong>
            </span>
            <span className="text-slate-300">·</span>
            <span>
              Lowest: <strong className="text-rose-600 font-bold">{lowest}%</strong>
            </span>
          </div>

          {activeCourse && (
            <span className="text-[11px] text-slate-400">
              {activeCourse.code} · {activeCourse.section} Roster
            </span>
          )}
        </div>

        {/* Action Buttons at Bottom Right */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-slate-100">
          <button
            id="btn-save-grades-draft"
            onClick={handleSaveDraft}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          {/* Release Button with Warning Tooltip on Hover */}
          <div className="relative inline-block">
            <button
              id="btn-release-grades-students"
              onClick={handleReleaseGrades}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="px-5 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Release Grades to Students</span>
            </button>

            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute right-0 bottom-full mb-2 w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl z-20 animate-in fade-in zoom-in-95 pointer-events-none">
                <div className="font-bold flex items-center gap-1 text-amber-300 mb-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Important Release Notice</span>
                </div>
                <p className="text-slate-300 leading-tight">
                  This will notify all students immediately and cannot be undone.
                </p>
                <div className="absolute right-6 top-full w-2 h-2 bg-slate-900 rotate-45 -translate-y-1"></div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
