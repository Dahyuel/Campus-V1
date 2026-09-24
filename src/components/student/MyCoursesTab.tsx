import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  pageVariants,
  listContainer,
  listItem,
  cardHover,
  fadeIn,
} from '../../lib/motion';
import {
  BookOpen,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bot,
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  X,
  ExternalLink,
  Layers,
  GraduationCap
} from 'lucide-react';
import { StudentCourse, CompletedCourse } from '../../data/studentMockData';
import { useStudentCourses, useStudentTranscript } from '../../hooks/useStudentData';
import { TabId } from '../../types';

interface MyCoursesTabProps {
  searchQuery?: string;
  onNavigateTab: (tab: TabId) => void;
}

export const MyCoursesTab: React.FC<MyCoursesTabProps> = ({
  searchQuery = '',
  onNavigateTab,
}) => {
  const [showPreviousSemesters, setShowPreviousSemesters] = useState(false);
  const [selectedMaterialsCourse, setSelectedMaterialsCourse] = useState<StudentCourse | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const initial = reduce ? false : 'hidden';

  const { data: coursesData, isLoading: coursesLoading } = useStudentCourses();
  const { data: transcriptData } = useStudentTranscript();

  const STUDENT_COURSES: StudentCourse[] = coursesData ?? [];
  const PREVIOUS_SEMESTERS_COURSES: CompletedCourse[] = transcriptData ?? [];

  const query = searchQuery.trim().toLowerCase();
  const filteredCourses = STUDENT_COURSES.filter((c) => {
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.faculty.toLowerCase().includes(query) ||
      c.status.toLowerCase().includes(query)
    );
  });

  const handleDownload = (fileName: string) => {
    setDownloadToast(`Downloading ${fileName}...`);
    setTimeout(() => {
      setDownloadToast(null);
    }, 2500);
  };

  if (coursesLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-[#3256a8]/20 border-t-[#3256a8] rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div
      variants={pageVariants}
      initial={initial}
      animate="visible"
      className="space-y-7"
    >
      {/* Download toast */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3256a8] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Slim Summary Strip at Top */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3256a8] flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Enrolled Academic Courses</h2>
            <p className="text-xs text-slate-400">Semester 2 · Academic Year 2025/2026</p>
          </div>
        </div>

        {/* 3 inline stats: 6 Enrolled Courses · 18 Credit Hours · 4 In Progress */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/80 text-[#3256a8] border border-blue-100/60">
            <span className="w-2 h-2 rounded-full bg-[#3256a8]" />
            <span>6 Enrolled Courses</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>18 Credit Hours</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>4 In Progress</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Grid of Course Cards */}
      <motion.div
        variants={listContainer(0.1, 0.08)}
        initial={initial}
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {filteredCourses.map((course) => {
          const isExamSoon = course.status === 'EXAM SOON';
          const isCompleted = course.status === 'COMPLETED';
          const gradePct = Math.round((course.gradesReleased / course.totalGrades) * 100);

          return (
            <motion.div
              key={course.id}
              variants={listItem}
              {...cardHover}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Top Row: Status Badge (top left) & Credit Hours Pill Badge (top right) */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      isExamSoon
                        ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                        : isCompleted
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    }`}
                  >
                    {course.status}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {course.credits}CR
                  </span>
                </div>

                {/* Course Name (bold) + Course Code below */}
                <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                  {course.name}
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">{course.code}</p>

                {/* Faculty Name with Small Avatar */}
                <div className="flex items-center gap-2.5 mt-3.5 pt-3.5 border-t border-slate-100/80">
                  <img
                    src={course.facultyAvatar}
                    alt={course.faculty}
                    className="w-7 h-7 rounded-full object-cover bg-slate-100 border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-xs font-medium text-slate-600 truncate">{course.faculty}</span>
                </div>

                {/* Progress Indicators */}
                <div className="mt-5 space-y-3.5">
                  {/* Attendance Progress Bar with percentage label */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Attendance Rate</span>
                      <span
                        className={`font-bold ${
                          course.attendancePct < 75 ? 'text-rose-600' : 'text-slate-800'
                        }`}
                      >
                        {course.attendancePct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={reduce ? false : { scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
                        style={{ width: `${course.attendancePct}%`, originX: 0 }}
                        className={`h-full rounded-full ${
                          course.attendancePct < 75 ? 'bg-rose-500' : 'bg-[#3256a8]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Grade Release Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Grade Assessment</span>
                      <span className="font-bold text-slate-700">
                        {course.gradesReleased} of {course.totalGrades} grades released
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full transition-all"
                        style={{ width: `${gradePct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Three Buttons at Bottom: "Materials" (filled blue) · "AI Tutor" (outlined) · "Community" (outlined) */}
              <div className="pt-6 mt-6 border-t border-slate-100 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMaterialsCourse(course)}
                  className="w-full py-2 px-2.5 rounded-xl bg-[#3256a8] hover:bg-[#2c4c96] text-white text-xs font-bold transition-all shadow-[0_3px_10px_0_rgba(50,86,168,0.2)] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Materials</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('ai-tutor')}
                  className="w-full py-2 px-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#3256a8] text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-[#3256a8]" />
                  <span>AI Tutor</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('community')}
                  className="w-full py-2 px-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#3256a8] text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Community</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom Collapsible Section: "Previous Semesters" */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => setShowPreviousSemesters(!showPreviousSemesters)}
          className="w-full flex items-center justify-between cursor-pointer py-1 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-[#3256a8] flex items-center justify-center transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#3256a8] transition-colors">
                Previous Semesters
              </h3>
              <p className="text-xs text-slate-400">Completed courses, transcripts & grade records</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 group-hover:text-[#3256a8]">
            <span>{showPreviousSemesters ? 'Hide Record' : 'View Past Records (5 Courses)'}</span>
            {showPreviousSemesters ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </button>

        {showPreviousSemesters && (
          <motion.div variants={fadeIn} initial={initial} animate="visible" className="mt-5 pt-5 border-t border-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-medium">Course</th>
                  <th className="pb-3 font-medium">Code</th>
                  <th className="pb-3 text-center font-medium">Grade</th>
                  <th className="pb-3 text-right font-medium">GPA Points</th>
                  <th className="pb-3 text-right font-medium">Semester</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {PREVIOUS_SEMESTERS_COURSES.map((course: { id: string; course: string; code: string; grade: string; gpaPoints: string; semester: string }) => (
                  <tr key={course.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900">{course.course}</td>
                    <td className="py-3.5 text-slate-500 font-mono">{course.code}</td>
                    <td className="py-3.5 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {course.grade}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-mono font-bold text-slate-800">
                      {course.gpaPoints}
                    </td>
                    <td className="py-3.5 text-right text-slate-500 font-medium">
                      {course.semester}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      {/* Materials Modal */}
      {selectedMaterialsCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#3256a8] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedMaterialsCourse.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedMaterialsCourse.code} · {selectedMaterialsCourse.faculty}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMaterialsCourse(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Official Course Syllabus & Grading Matrix</h4>
                    <span className="text-[11px] text-slate-400">Updated 15 Sep 2026 · 1.4 MB</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload('Course_Syllabus.pdf')}
                  className="p-2 text-[#3256a8] hover:bg-blue-50 rounded-xl cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                    ZIP
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Lecture Slides (Weeks 1 to 7)</h4>
                    <span className="text-[11px] text-slate-400">Chapters 1-5 Slides & Diagrams · 18.2 MB</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload('Lecture_Slides_W1-7.zip')}
                  className="p-2 text-[#3256a8] hover:bg-blue-50 rounded-xl cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Lab Workbook & Benchmark Specifications</h4>
                    <span className="text-[11px] text-slate-400">Practical guide for lab sessions · 3.8 MB</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload('Lab_Workbook.pdf')}
                  className="p-2 text-[#3256a8] hover:bg-blue-50 rounded-xl cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMaterialsCourse(null)}
                className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
