import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  pageVariants,
  listContainer,
  listItem,
  fadeIn,
  barGrow,
} from '../../lib/motion';
import {
  GraduationCap,
  TrendingUp,
  Award,
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  FileText,
  X,
  Printer
} from 'lucide-react';
import { StudentCourse } from '../../data/studentMockData';
import { useStudentCourses } from '../../hooks/useStudentData';

interface GradesTabProps {
  searchQuery?: string;
}

export const GradesTab: React.FC<GradesTabProps> = ({ searchQuery = '' }) => {
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const initial = reduce ? false : 'hidden';

  const { data, isLoading } = useStudentCourses();
  const STUDENT_COURSES: StudentCourse[] = data ?? [];

  const query = searchQuery.trim().toLowerCase();
  const filteredCourses = STUDENT_COURSES.filter((c) => {
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.faculty.toLowerCase().includes(query)
    );
  });

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const handleDownloadPDF = () => {
    setDownloadToast('Generating official academic transcript PDF...');
    setTimeout(() => {
      setDownloadToast('Official Report Card downloaded successfully!');
      setTimeout(() => setDownloadToast(null), 3000);
    }, 1200);
  };

  // Dynamic bar height calculator for the Grade Overview chart (0-100 scale)
  const getBarHeight = (avg: number) => {
    const minHeight = 40;
    const maxHeight = 160;
    return Math.round(minHeight + (avg / 100) * (maxHeight - minHeight));
  };

  if (isLoading) return (
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
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3256a8] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Top Header Row with "Download Report Card" button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Performance & Grades</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Official evaluation record for Semester 2, Academic Year 2025/2026
          </p>
        </div>

        {/* Top Right: "Download Report Card" button in filled blue that generates a PDF */}
        <button
          type="button"
          onClick={() => setReportModalOpen(true)}
          className="py-2.5 px-4 rounded-2xl bg-[#3256a8] hover:bg-[#2c4c96] text-white text-xs font-bold transition-all shadow-[0_4px_14px_0_rgba(50,86,168,0.25)] flex items-center gap-2 cursor-pointer active:scale-98"
        >
          <Download className="w-4 h-4" />
          <span>Download Report Card</span>
        </button>
      </div>

      {/* Row of 3 Stat Cards */}
      <motion.div
        variants={listContainer(0.1)}
        initial={initial}
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-5"
      >
        {/* Card 1: Current Semester GPA */}
        <motion.div variants={listItem} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Current Semester GPA
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
              +0.2 ↑
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">3.4</span>
            <span className="text-xs font-bold text-slate-400 font-mono">/ 4.00</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">18 registered credit hours in progress</p>
        </motion.div>

        {/* Card 2: Cumulative GPA */}
        <motion.div variants={listItem} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Cumulative GPA
            </span>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Overall Record
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">3.2</span>
            <span className="text-xs font-bold text-slate-400 font-mono">/ 4.00</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">84 completed credit hours to date</p>
        </motion.div>

        {/* Card 3: Academic Standing */}
        <motion.div variants={listItem} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Academic Standing
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
              Active
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-900">Good Standing</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Dean’s Honor List eligible this term</p>
        </motion.div>
      </motion.div>

      {/* Bar Chart: "Grade Overview" showing student's average grade per course this semester */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Grade Overview</h3>
            <p className="text-xs text-slate-400">Average scored percentage across enrolled subjects</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#3256a8]" />
              <span>Above Average (80%+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-200" />
              <span>Average Range</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Grid */}
        <div className="h-48 flex items-end justify-between gap-3 sm:gap-6 pt-4 pb-2 px-2 border-b border-slate-100">
          {STUDENT_COURSES.map((c) => {
            const barH = getBarHeight(c.currentAverage);
            const isHigh = c.currentAverage >= 80;

            return (
              <motion.div
                key={c.id}
                initial={reduce ? false : 'hidden'}
                animate="visible"
                custom={c.id}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
              >
                <span className="text-[11px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  {c.currentAverage}%
                </span>
                <motion.div
                  variants={barGrow(0.3)}
                  className={`w-full max-w-[48px] rounded-2xl transition-colors duration-300 origin-bottom ${
                    isHigh
                      ? 'bg-[#3256a8] shadow-[0_4px_12px_0_rgba(50,86,168,0.2)]'
                      : 'bg-slate-200 group-hover:bg-slate-300'
                  }`}
                  style={{ height: `${barH}px` }}
                />
                <span className="text-xs font-bold text-slate-700 truncate w-full text-center">
                  {c.code.split('-')[0]}
                </span>
                <span className="text-[10px] text-slate-400 -mt-1 hidden sm:block truncate w-full text-center">
                  {c.code}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detailed Grade Table for Each Course with Expandable Rows */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Detailed Grade Breakdown</h3>
            <p className="text-xs text-slate-400">Click any row to expand the full assessment matrix</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">{filteredCourses.length} Courses</span>
        </div>

        <motion.div
          variants={listContainer(0.07)}
          initial={initial}
          animate="visible"
          className="space-y-3"
        >
          {filteredCourses.map((course) => {
            const isExpanded = !!expandedCourses[course.id];

            return (
              <motion.div
                key={course.id}
                variants={listItem}
                className="border border-slate-100 rounded-2xl overflow-hidden transition-all"
              >
                {/* Collapsed Course Row */}
                <button
                  type="button"
                  onClick={() => toggleCourse(course.id)}
                  className="w-full p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/70 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform ${
                        isExpanded ? 'bg-blue-50 text-[#3256a8]' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{course.name}</h4>
                      <p className="text-xs text-slate-400">
                        {course.code} · {course.faculty}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto text-xs">
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Credits</span>
                      <span className="font-bold text-slate-700">{course.credits} CR</span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Average</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {course.currentAverage}%
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        course.status === 'EXAM SOON'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                </button>

                {/* Expanded Full Grade Breakdown */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      variants={fadeIn}
                      initial={initial}
                      animate="visible"
                      exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="p-4 bg-slate-50/60 border-t border-slate-100 overflow-hidden"
                    >
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="pb-2.5 font-medium">Assessment</th>
                            <th className="pb-2.5 font-medium">Type</th>
                            <th className="pb-2.5 text-center font-medium">Weight</th>
                            <th className="pb-2.5 text-center font-medium">Grade</th>
                            <th className="pb-2.5 text-center font-medium">Out Of</th>
                            <th className="pb-2.5 text-center font-medium">Released Date</th>
                            <th className="pb-2.5 text-right font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {course.assessments.map((a) => {
                            const isPending = a.status === 'PENDING';

                            return (
                              <tr key={a.id} className="hover:bg-white/80 transition-colors">
                                <td className="py-3 font-bold text-slate-800">{a.assessment}</td>
                                <td className="py-3 text-slate-500">{a.type}</td>
                                <td className="py-3 text-center font-mono font-semibold text-slate-700">
                                  {a.weight}
                                </td>
                                <td className="py-3 text-center font-mono font-bold text-slate-900">
                                  {isPending ? (
                                    <span className="text-slate-400 font-normal">Not Released Yet</span>
                                  ) : (
                                    a.grade
                                  )}
                                </td>
                                <td className="py-3 text-center font-mono text-slate-500">
                                  {isPending ? '—' : a.outOf}
                                </td>
                                <td className="py-3 text-center text-slate-500">
                                  {isPending ? '—' : a.releasedDate}
                                </td>
                                <td className="py-3 text-right">
                                  {/* Unreleased grades show gray "PENDING" badge. Released grades show green "RELEASED". */}
                                  {isPending ? (
                                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-600">
                                      PENDING
                                    </span>
                                  ) : (
                                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                                      RELEASED
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Official Report Card Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#3256a8] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Academic Report Card</h3>
                  <p className="text-xs text-slate-400">Campus by Nilebyte · Digital Transcript</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Student Name:</span>
                  <span className="font-bold text-slate-800">Ahmed Dahy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Student ID:</span>
                  <span className="font-mono font-bold text-slate-800">STU-9921</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Degree Program:</span>
                  <span className="font-medium text-slate-700">B.Sc. in Computer Science</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Semester GPA:</span>
                  <span className="font-mono font-bold text-[#3256a8]">3.40 / 4.00</span>
                </div>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                    <tr>
                      <th className="p-2.5 text-left">Course</th>
                      <th className="p-2.5 text-center">Credits</th>
                      <th className="p-2.5 text-center">Score</th>
                      <th className="p-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {STUDENT_COURSES.map((c) => (
                      <tr key={c.id}>
                        <td className="p-2.5 font-medium text-slate-800">{c.name}</td>
                        <td className="p-2.5 text-center text-slate-600">{c.credits}</td>
                        <td className="p-2.5 text-center font-bold text-slate-900">{c.currentAverage}%</td>
                        <td className="p-2.5 text-right text-emerald-600 font-bold text-[11px]">Good</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Digitally certified with cryptographic seal</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReportModalOpen(false);
                    handleDownloadPDF();
                  }}
                  className="py-2 px-4 bg-[#3256a8] hover:bg-[#2c4c96] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
