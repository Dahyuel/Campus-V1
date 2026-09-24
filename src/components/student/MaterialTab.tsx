import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { pageVariants, listContainer, listItem, cardHover } from '../../lib/motion';
import {
  FileText,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  FolderOpen,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { useStudentMaterials, useMaterialUrl } from '../../hooks/useStudentData';

interface MaterialTabProps {
  searchQuery?: string;
}

interface MaterialCourse {
  id: string;
  name: string;
  code: string;
  semester: string;
  status: string;
  isCurrent: boolean;
}

interface MaterialItem {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  semester: string;
  fileName: string;
  type: string;
  uploadDate: string;
  size: string;
}

interface MaterialResponse {
  courses: MaterialCourse[];
  materials: MaterialItem[];
}

export const MaterialTab: React.FC<MaterialTabProps> = ({ searchQuery = '' }) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showPrevious, setShowPrevious] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const initial = reduce ? false : 'hidden';

  const { data, isLoading } = useStudentMaterials();
  const materialUrl = useMaterialUrl();

  const response = (data ?? { courses: [], materials: [] }) as MaterialResponse;
  const allCourses = response.courses;
  const allMaterials = response.materials;

  const currentCourses = allCourses.filter((c) => c.isCurrent);
  const previousCourses = allCourses.filter((c) => !c.isCurrent);
  const visibleCourses = showPrevious ? allCourses : currentCourses;

  const query = searchQuery.trim().toLowerCase();

  const activeCourseId = selectedCourseId ?? visibleCourses[0]?.id ?? null;
  const activeCourse = visibleCourses.find((c) => c.id === activeCourseId) ?? null;

  const courseMaterials = activeCourseId
    ? allMaterials.filter((m) => m.courseId === activeCourseId)
    : [];

  const availableTypes = Array.from(new Set(courseMaterials.map((m) => m.type)));

  const filteredMaterials = courseMaterials.filter((m) => {
    const matchType = selectedType === 'ALL' || m.type === selectedType;
    const matchQuery =
      !query ||
      m.fileName.toLowerCase().includes(query) ||
      m.type.toLowerCase().includes(query) ||
      m.courseName.toLowerCase().includes(query) ||
      m.courseCode.toLowerCase().includes(query);
    return matchType && matchQuery;
  });

  const handleOpen = async (material: MaterialItem) => {
    setOpeningId(material.id);
    try {
      const url = await materialUrl.mutateAsync(material.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      // no-op
    } finally {
      setOpeningId(null);
    }
  };

  const selectCourse = (id: string) => {
    setSelectedCourseId(id);
    setSelectedType('ALL');
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
      className="space-y-6"
    >
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3256a8] flex items-center justify-center font-bold">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Course Materials</h2>
            <p className="text-xs text-slate-400">Browse and open lecture slides, assignments, and resources</p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {visibleCourses.map((course) => {
            const isActive = course.id === activeCourseId;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => selectCourse(course.id)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#3256a8] text-white border-[#3256a8]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {course.code}
              </button>
            );
          })}
          {visibleCourses.length === 0 && (
            <span className="text-xs text-slate-400 font-medium">No courses found</span>
          )}
        </div>

        {previousCourses.length > 0 && (
          <button
            type="button"
            onClick={() => setShowPrevious((p) => !p)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#3256a8] hover:text-[#28468a] transition-colors cursor-pointer"
          >
            {showPrevious ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{showPrevious ? 'Hide previous semesters' : 'See previous semesters'}</span>
          </button>
        )}
      </div>

      {activeCourse && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{activeCourse.name}</h3>
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{activeCourse.semester}</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>{courseMaterials.length} items</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedType('ALL')}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                selectedType === 'ALL'
                  ? 'bg-[#3256a8] text-white border-[#3256a8]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            {availableTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                  selectedType === type
                    ? 'bg-[#3256a8] text-white border-[#3256a8]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center text-center">
          <FileText className="w-10 h-10 text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No materials available</h3>
          <p className="text-xs text-slate-400 mt-1">
            {activeCourse ? 'Materials uploaded for this course will appear here.' : 'Select a course to view its materials.'}
          </p>
        </div>
      ) : (
        <motion.div
          variants={listContainer(0.1, 0.05)}
          initial={initial}
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filteredMaterials.map((material) => (
            <motion.button
              key={material.id}
              type="button"
              variants={listItem}
              {...cardHover}
              onClick={() => handleOpen(material)}
              disabled={openingId === material.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col justify-between text-left cursor-pointer disabled:opacity-60"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#3256a8] flex items-center justify-center shrink-0">
                  {openingId === material.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600">
                  {material.type}
                </span>
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 break-all">
                  {material.fileName}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-1.5">
                  {material.courseCode} · {material.uploadDate}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  {material.size || '—'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3256a8]">
                  Open
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
