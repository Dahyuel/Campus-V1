import React, { useState, useRef } from 'react';
import {
  Users,
  AlertCircle,
  CheckCircle2,
  FileText,
  Upload,
  Eye,
  X,
  ExternalLink,
  Trash2
} from 'lucide-react';
import {
  FacultyCourseItem,
  CourseMaterialRow
} from '../../data/facultyMockData';
import {
  useFacultyCourses,
  useFacultyMaterials,
  useUploadMaterial,
  useDeleteMaterial,
  getMaterialUrl,
} from '../../hooks/useFacultyData';
import { TabId } from '../../types';

// Must match ALLOWED_MATERIAL_TYPES / ALLOWED_FILE_EXTENSIONS in server/routes/faculty.ts
const MATERIAL_TYPES = ['PDF Lecture Slides', 'Assignment PDF', 'Lab Archive Code', 'Video Lecture', 'Other'];
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.zip', '.mp4'];
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

interface FacultyCoursesTabProps {
  searchQuery?: string;
  onNavigateTab: (tab: TabId, params?: Record<string, string>) => void;
}

export const FacultyCoursesTab: React.FC<FacultyCoursesTabProps> = ({
  searchQuery = '',
  onNavigateTab,
}) => {
  const { data: coursesData, isLoading } = useFacultyCourses();
  const { data: materialsData } = useFacultyMaterials();
  const uploadMutation = useUploadMaterial();
  const deleteMutation = useDeleteMaterial();
  const FACULTY_COURSES: FacultyCourseItem[] = coursesData ?? [];
  const materials: CourseMaterialRow[] = materialsData ?? [];
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterialRow | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  // Upload form state
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newType, setNewType] = useState(MATERIAL_TYPES[0]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#3256a8] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const query = searchQuery.trim().toLowerCase();
  const filteredCourses = FACULTY_COURSES.filter((c) => {
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.section.toLowerCase().includes(query) ||
      c.room.toLowerCase().includes(query)
    );
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openUploadModal = () => {
    setNewFile(null);
    setNewCourseCode(FACULTY_COURSES[0]?.code ?? '');
    setNewType(MATERIAL_TYPES[0]);
    setUploadError(null);
    setIsUploadModalOpen(true);
  };

  const pickFile = (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setUploadError(`Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError('File is larger than 50 MB.');
      return;
    }
    setUploadError(null);
    setNewFile(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFile || !newCourseCode) {
      setUploadError('Choose a file to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('courseCode', newCourseCode);
    formData.append('materialType', newType);
    formData.append('file', newFile);
    try {
      await uploadMutation.mutateAsync(formData);
      setIsUploadModalOpen(false);
      showToast('Material uploaded successfully!');
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setUploadError(msg ?? 'Upload failed. Please try again.');
    }
  };

  const handleOpenMaterial = async (mat: CourseMaterialRow) => {
    // Open the tab synchronously so pop-up blockers allow it, then point it at the file
    const tab = window.open('', '_blank');
    setIsOpening(true);
    try {
      const url = await getMaterialUrl(mat.id);
      if (tab) tab.location.href = url;
      else window.location.href = url;
    } catch {
      tab?.close();
      showToast('Could not open the file. File storage may be unavailable.');
    } finally {
      setIsOpening(false);
    }
  };

  const handleDeleteMaterial = async (mat: CourseMaterialRow) => {
    if (!window.confirm(`Delete "${mat.fileName}"? Students will no longer be able to access it.`)) return;
    try {
      await deleteMutation.mutateAsync(mat.id);
      setSelectedMaterial(null);
      showToast('Material deleted.');
    } catch {
      showToast('Delete failed. Please try again.');
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

      {/* Slim Summary Strip with 3 inline stats */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3256a8]"></span>
            <span className="font-bold text-slate-900">4 Active Courses</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">·</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-slate-900">213 Total Students</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">·</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="font-bold text-amber-700">2 Courses Need Attention</span>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-full text-slate-600">
          Fall 2024 / 2025 Semester
        </span>
      </section>

      {/* 2-Column Grid of Course Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredCourses.map((course) => {
          // Progress bar color logic: blue fills normally, turns orange if below 75%
          const isAttendanceLow = course.attendanceRate < 75;
          const attendanceBarColor = isAttendanceLow ? 'bg-amber-500' : 'bg-[#3256a8]';

          // Grade completion progress bar: turns red if overdue
          const isGradesOverdue = course.status === 'OVERDUE';
          const gradeBarColor = isGradesOverdue ? 'bg-rose-500' : 'bg-[#3256a8]';
          const gradePercent = Math.round((course.gradesEntered / course.gradesTotal) * 100);

          return (
            <div
              key={course.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Status badge top left, Credit hours pill badge top right */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                      course.status === 'ON TRACK'
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                        : course.status === 'ATTENTION NEEDED'
                        ? 'text-amber-800 bg-amber-50 border border-amber-200/60'
                        : 'text-rose-700 bg-rose-50 border border-rose-200/60'
                    }`}
                  >
                    {course.status}
                  </span>

                  <span className="text-xs font-bold text-slate-600 px-2.5 py-0.5 bg-slate-100 rounded-full border border-slate-200/60">
                    {course.creditHours} CR
                  </span>
                </div>

                {/* Course Name + Code */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {course.name}
                  </h3>
                  <div className="font-mono text-xs font-bold text-[#3256a8] mt-0.5">
                    {course.code}
                  </div>
                </div>

                {/* Section + Room labels + Total enrolled count */}
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                  <span className="px-2 py-0.5 bg-slate-50 border border-slate-200/60 rounded-md font-medium">
                    {course.section}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-50 border border-slate-200/60 rounded-md font-medium">
                    {course.room}
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700 ml-auto">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {course.studentsCount} students
                  </span>
                </div>

                {/* Metrics / Progress Bars */}
                <div className="mt-5 space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  {/* Attendance Rate */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-600">Avg. Attendance</span>
                      <span
                        className={`font-bold ${
                          isAttendanceLow ? 'text-amber-600' : 'text-slate-800'
                        }`}
                      >
                        {course.attendanceRate}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${attendanceBarColor}`}
                        style={{ width: `${course.attendanceRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Grade Completion */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-600">
                        Grades Entered: {course.gradesEntered} of {course.gradesTotal} assessments
                      </span>
                      <span
                        className={`font-bold ${
                          isGradesOverdue ? 'text-rose-600' : 'text-slate-800'
                        }`}
                      >
                        {gradePercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${gradeBarColor}`}
                        style={{ width: `${gradePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Four Action Buttons at bottom in a row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-4 border-t border-slate-100">
                <button
                  id={`btn-attendance-${course.id}`}
                  onClick={() => onNavigateTab('attendance', { courseId: course.id })}
                  className="w-full py-2 px-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs text-center truncate cursor-pointer"
                >
                  Start Attendance
                </button>
                <button
                  id={`btn-grades-${course.id}`}
                  onClick={() => onNavigateTab('grade-entry', { courseId: course.id })}
                  className="w-full py-2 px-2.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 text-xs font-bold rounded-xl transition-all text-center truncate cursor-pointer"
                >
                  Enter Grades
                </button>
                <button
                  id={`btn-community-${course.id}`}
                  onClick={() => onNavigateTab('course-community', { courseId: course.id })}
                  className="w-full py-2 px-2.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 text-xs font-bold rounded-xl transition-all text-center truncate cursor-pointer"
                >
                  Community
                </button>
                <button
                  id={`btn-materials-${course.id}`}
                  onClick={() => {
                    const el = document.getElementById('faculty-materials-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-2 px-2.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 text-xs font-bold rounded-xl transition-all text-center truncate cursor-pointer"
                >
                  Materials
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Course Materials Section */}
      <section
        id="faculty-materials-section"
        className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Curriculum & Resources
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
              Course Materials
            </h2>
          </div>

          <button
            id="btn-upload-new-material"
            onClick={openUploadModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New Material</span>
          </button>
        </div>

        {/* Table of recently uploaded materials */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Upload Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {materials.map((mat) => (
                <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#3256a8] shrink-0" />
                    <span className="truncate max-w-xs">{mat.fileName}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">{mat.course}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-[#3256a8] font-bold rounded-lg text-[10px]">
                      {mat.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{mat.uploadDate}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      id={`btn-view-mat-${mat.id}`}
                      onClick={() => setSelectedMaterial(mat)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] rounded-lg font-bold text-xs transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* View Material Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#3256a8]" />
                <h3 className="font-bold text-slate-900 text-sm">Material Details</h3>
              </div>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Filename</span>
                <p className="font-bold text-slate-900 break-all">{selectedMaterial.fileName}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-400 font-medium">Course</span>
                  <p className="font-bold text-slate-800">{selectedMaterial.course}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Type</span>
                  <p className="font-bold text-slate-800">{selectedMaterial.type}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Uploaded</span>
                  <p className="font-bold text-slate-800">{selectedMaterial.uploadDate}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">File Size</span>
                  <p className="font-bold text-slate-800">{selectedMaterial.size}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => handleOpenMaterial(selectedMaterial)}
                disabled={isOpening}
                className="flex-1 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Document</span>
              </button>
              <button
                onClick={() => handleDeleteMaterial(selectedMaterial)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload New Material Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#3256a8]" />
                <h3 className="font-bold text-slate-900 text-base">Upload Course Material</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course Target
                  </label>
                  <select
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#3256a8]"
                  >
                    {FACULTY_COURSES.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Resource Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#3256a8]"
                  >
                    {MATERIAL_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_EXTENSIONS.join(',')}
                className="hidden"
                onChange={(e) => {
                  pickFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  pickFile(e.dataTransfer.files?.[0]);
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${
                  isDragging ? 'border-[#3256a8] bg-blue-50/60' : 'border-slate-200 hover:border-[#3256a8] bg-slate-50/50'
                }`}
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                {newFile ? (
                  <>
                    <p className="text-xs font-bold text-slate-900 break-all">{newFile.name}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {(newFile.size / (1024 * 1024)).toFixed(1)} MB · click to choose a different file
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold text-slate-700">Drag and drop file here, or click to browse</p>
                    <p className="text-[11px] text-slate-400 mt-1">PDF, DOCX, PPTX, ZIP or MP4 up to 50MB</p>
                  </>
                )}
              </div>

              {uploadError && (
                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{uploadError}</span>
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!newFile || uploadMutation.isPending}
                  className="flex-1 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadMutation.isPending ? 'Uploading…' : 'Publish Material'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
