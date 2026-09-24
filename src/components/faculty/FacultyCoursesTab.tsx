import React, { useState } from 'react';
import {
  Users,
  AlertCircle,
  CheckCircle2,
  FileText,
  Upload,
  Eye,
  X,
  ExternalLink
} from 'lucide-react';
import {
  FacultyCourseItem,
  CourseMaterialRow
} from '../../data/facultyMockData';
import { useFacultyCourses, useFacultyMaterials, useUploadMaterial } from '../../hooks/useFacultyData';
import { TabId } from '../../types';

interface FacultyCoursesTabProps {
  searchQuery?: string;
  onNavigateTab: (tab: TabId) => void;
}

export const FacultyCoursesTab: React.FC<FacultyCoursesTabProps> = ({
  searchQuery = '',
  onNavigateTab,
}) => {
  const { data: coursesData, isLoading } = useFacultyCourses();
  const { data: materialsData } = useFacultyMaterials();
  const uploadMutation = useUploadMaterial();
  const FACULTY_COURSES: FacultyCourseItem[] = coursesData ?? [];
  const [materials, setMaterials] = useState<CourseMaterialRow[]>([]);
  React.useEffect(() => {
    if (materialsData) setMaterials(materialsData);
  }, [materialsData]);
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterialRow | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload form state
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('Data Structures');
  const [newType, setNewType] = useState('PDF Lecture Slides');

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

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const formData = new FormData();
    formData.append('courseCode', newCourse === 'Data Structures' ? 'CS-301' : newCourse);
    formData.append('materialType', newType);
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (fileInput?.files?.[0]) {
      formData.append('file', fileInput.files[0]);
    } else {
      formData.append('file', new Blob([newTitle], { type: 'application/pdf' }), newTitle.endsWith('.pdf') ? newTitle : `${newTitle}.pdf`);
    }
    try {
      await uploadMutation.mutateAsync(formData);
      setIsUploadModalOpen(false);
      setNewTitle('');
      showToast('Material uploaded successfully!');
    } catch {
      showToast('Upload failed. Please try again.');
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
                  onClick={() => onNavigateTab('attendance')}
                  className="w-full py-2 px-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs text-center truncate cursor-pointer"
                >
                  Start Attendance
                </button>
                <button
                  id={`btn-grades-${course.id}`}
                  onClick={() => onNavigateTab('grade-entry')}
                  className="w-full py-2 px-2.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-slate-700 text-xs font-bold rounded-xl transition-all text-center truncate cursor-pointer"
                >
                  Enter Grades
                </button>
                <button
                  id={`btn-community-${course.id}`}
                  onClick={() => onNavigateTab('course-community')}
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
            onClick={() => setIsUploadModalOpen(true)}
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
                onClick={() => {
                  showToast(`Opened ${selectedMaterial.fileName} in viewer`);
                  setSelectedMaterial(null);
                }}
                className="flex-1 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Document</span>
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
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Title / File Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS301_Lecture09_GraphTraversal.pdf"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#3256a8] focus:ring-1 focus:ring-[#3256a8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course Target
                  </label>
                  <select
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#3256a8]"
                  >
                    <option value="Data Structures">Data Structures (CS-301)</option>
                    <option value="Mathematics">Mathematics (MATH-201)</option>
                    <option value="Artificial Intelligence">Artificial Intelligence (CS-401)</option>
                    <option value="Networks">Networks (CS-303)</option>
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
                    <option value="PDF Lecture Slides">PDF Lecture Slides</option>
                    <option value="Assignment PDF">Assignment PDF</option>
                    <option value="Lab Archive Code">Lab Archive Code</option>
                    <option value="Syllabus & Guide">Syllabus & Guide</option>
                  </select>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-[#3256a8] transition-colors cursor-pointer bg-slate-50/50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Drag and drop file here, or browse</p>
                <p className="text-[11px] text-slate-400 mt-1">Supports PDF, PPTX, ZIP up to 50MB</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Publish Material
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
