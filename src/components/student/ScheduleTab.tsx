import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { pageVariants, listContainer, listItem } from '../../lib/motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Video,
  Radio,
  AlertCircle,
  X,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import {
  ScheduleClassItem,
  UpcomingWeekEvent
} from '../../data/studentMockData';
import { useStudentSchedule, useStudentEvents } from '../../hooks/useStudentData';

interface ScheduleTabProps {
  searchQuery?: string;
}

const DAYS_OF_WEEK = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
] as const;

const TIME_SLOTS = [
  '8:00 AM',
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
];

export const ScheduleTab: React.FC<ScheduleTabProps> = ({ searchQuery = '' }) => {
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState<string>('Sunday');
  const [weekNumber, setWeekNumber] = useState<number>(8);
  const [liveModalOpen, setLiveModalOpen] = useState(false);
  const [activeLiveCourse, setActiveLiveCourse] = useState<ScheduleClassItem | null>(null);
  const reduce = useReducedMotion();
  const initial = reduce ? false : 'hidden';

  const { data: scheduleData, isLoading: scheduleLoading } = useStudentSchedule();
  const { data: eventsData } = useStudentEvents();

  const WEEK_SCHEDULE: ScheduleClassItem[] = scheduleData ?? [];
  const UPCOMING_WEEK_EVENTS: UpcomingWeekEvent[] = eventsData ?? [];

  const query = searchQuery.trim().toLowerCase();

  // Find class for day and time
  const getClassForSlot = (day: string, time: string): ScheduleClassItem | undefined => {
    return WEEK_SCHEDULE.find((item) => {
      const matchSlot = item.day === day && item.timeSlot === time;
      if (!matchSlot) return false;
      if (!query) return true;
      return (
        item.courseName.toLowerCase().includes(query) ||
        item.courseCode.toLowerCase().includes(query) ||
        item.room.toLowerCase().includes(query) ||
        item.faculty.toLowerCase().includes(query)
      );
    });
  };

  const handleJoinLive = (cls: ScheduleClassItem) => {
    setActiveLiveCourse(cls);
    setLiveModalOpen(true);
  };

  if (scheduleLoading) return (
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
      {/* Week Navigation Bar & View Toggles */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left / Right Arrows & Centered Week Label */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            type="button"
            onClick={() => setWeekNumber((prev) => Math.max(1, prev - 1))}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            aria-label="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center px-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center justify-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#3256a8]" />
              <span>Week {weekNumber}: 20 Sep – 26 Sep 2026</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">Egyptian Academic Calendar · Term 2</p>
          </div>

          <button
            type="button"
            onClick={() => setWeekNumber((prev) => Math.min(16, prev + 1))}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            aria-label="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* View Toggle Buttons: "Week View" (active/filled blue) & "Day View" (outlined) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'week'
                ? 'bg-[#3256a8] text-white shadow-[0_4px_12px_0_rgba(50,86,168,0.25)]'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Week View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'day'
                ? 'bg-[#3256a8] text-white shadow-[0_4px_12px_0_rgba(50,86,168,0.25)]'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Day View
          </button>
        </div>
      </div>

      {/* If Day View: Show Day Selector Pills */}
      {viewMode === 'day' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedDay === day
                  ? 'bg-[#3256a8] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {/* Timetable Grid */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          {viewMode === 'week' ? (
            /* Full Weekly Timetable Grid */
            <table className="w-full border-collapse min-w-[760px] table-fixed">
              <thead>
                <tr>
                  <th className="w-24 pb-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left pl-2">
                    Time
                  </th>
                  {DAYS_OF_WEEK.map((day) => (
                    <th
                      key={day}
                      className="pb-4 text-center text-xs font-bold text-slate-800"
                    >
                      <div className="flex flex-col items-center">
                        <span>{day}</span>
                        {day === 'Sunday' && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-blue-50 text-[10px] text-[#3256a8] font-bold">
                            Today
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot} className="group">
                    {/* Time Column */}
                    <td className="py-2.5 pl-2 text-xs font-semibold text-slate-400 align-top">
                      {slot}
                    </td>

                    {/* Day Columns */}
                    {DAYS_OF_WEEK.map((day, dayIndex) => {
                      const classItem = getClassForSlot(day, slot);

                      return (
                        <motion.td
                          key={`${day}-${slot}`}
                          variants={listItem}
                          initial={initial}
                          animate="visible"
                          transition={{ delay: Math.min(dayIndex * 0.03, 0.3) }}
                          className="p-1 align-top h-20"
                        >
                          {classItem ? (
                            /* Scheduled Class Card: Filled blue card showing course name, room number, faculty */
                            <div
                              className={`h-full w-full rounded-2xl p-2.5 transition-all flex flex-col justify-between relative text-left ${
                                classItem.isLive
                                  ? 'bg-blue-50/90 border border-blue-200/90 shadow-xs'
                                  : 'bg-blue-50/60 border border-blue-100/70 hover:bg-blue-50 hover:border-blue-200'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="text-[10px] font-extrabold text-[#3256a8] uppercase tracking-wider">
                                    {classItem.courseCode}
                                  </span>

                                  {/* Pulsing Green LIVE Badge if active live session */}
                                  {classItem.isLive && (
                                    <motion.span
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold"
                                      initial={reduce ? false : { scale: 1 }}
                                      animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
                                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      LIVE
                                    </motion.span>
                                  )}
                                </div>

                                <h4 className="text-xs font-bold text-slate-900 leading-tight line-clamp-1">
                                  {classItem.courseName}
                                </h4>
                              </div>

                              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                                <span className="truncate flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                  {classItem.room}
                                </span>

                                {classItem.isLive ? (
                                  <button
                                    type="button"
                                    onClick={() => handleJoinLive(classItem)}
                                    className="px-2 py-0.5 rounded-lg bg-[#3256a8] hover:bg-[#2c4c96] text-white text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <Radio className="w-2.5 h-2.5" />
                                    Join Now
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 truncate max-w-[85px]">
                                    {classItem.faculty.split(' ').slice(-1)[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* Empty Slot: Light gray */
                            <div className="h-full w-full rounded-2xl bg-slate-50/40 border border-dashed border-slate-100/90 flex items-center justify-center">
                              <span className="text-[10px] text-slate-300 font-medium">—</span>
                            </div>
                          )}
                        </motion.td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Day View Detailed List */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">{selectedDay} Classes</h3>
                <span className="text-xs text-slate-400 font-medium">
                  {TIME_SLOTS.filter((slot) => getClassForSlot(selectedDay, slot)).length} Scheduled Sessions
                </span>
              </div>

              <div className="space-y-2.5">
                {TIME_SLOTS.map((slot) => {
                  const classItem = getClassForSlot(selectedDay, slot);
                  if (!classItem) return null;

                  return (
                    <div
                      key={slot}
                      className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 text-center py-2 px-1 rounded-xl bg-white border border-blue-100 font-mono text-xs font-bold text-[#3256a8]">
                          {slot}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{classItem.courseName}</h4>
                            <span className="text-xs font-semibold text-slate-400">({classItem.courseCode})</span>
                            {classItem.isLive && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold animate-pulse">
                                LIVE NOW
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 font-medium">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {classItem.room}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {classItem.faculty}
                            </span>
                          </div>
                        </div>
                      </div>

                      {classItem.isLive ? (
                        <button
                          type="button"
                          onClick={() => handleJoinLive(classItem)}
                          className="py-2 px-4 rounded-xl bg-[#3256a8] hover:bg-[#2c4c96] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Join Live Stream
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Scheduled In-Person</span>
                      )}
                    </div>
                  );
                })}

                {TIME_SLOTS.filter((slot) => getClassForSlot(selectedDay, slot)).length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No classes scheduled for {selectedDay}.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* "Upcoming This Week" Section as a horizontal row of small event cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Upcoming This Week</h3>
          <span className="text-xs font-semibold text-slate-400">Next 7 Days Timeline</span>
        </div>

        <motion.div
          variants={listContainer(0.09)}
          initial={initial}
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {UPCOMING_WEEK_EVENTS.map((event) => {
            const isExam = event.type === 'EXAM';
            const isDeadline = event.type === 'DEADLINE';
            const isOffice = event.type === 'OFFICE HOURS';

            return (
              <motion.div
                key={event.id}
                variants={listItem}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    {/* Badge: blue "LECTURE" / red "EXAM" / orange "DEADLINE" / green "OFFICE HOURS" */}
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isExam
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : isDeadline
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : isOffice
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-blue-50 text-[#3256a8] border border-blue-100'
                      }`}
                    >
                      {event.type}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 font-mono">
                      {event.courseCode}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                    {event.courseName}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {event.time}
                    </span>
                    <span className="text-slate-400">{event.room}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Interactive Live Stream Modal */}
      {liveModalOpen && activeLiveCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-base font-bold text-slate-900">Active Live Lecture</h3>
              </div>
              <button
                type="button"
                onClick={() => setLiveModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white p-4 relative overflow-hidden">
                <Video className="w-10 h-10 text-white/70 mb-2" />
                <p className="text-xs font-bold text-center">{activeLiveCourse.courseName}</p>
                <span className="text-[11px] text-white/60">
                  {activeLiveCourse.faculty} · {activeLiveCourse.room}
                </span>
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-extrabold tracking-wider">
                  LIVE STREAM
                </span>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-slate-700">
                <p className="font-semibold text-[#3256a8]">Smart Attendance Verified</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Your student identity (Ahmed Dahy - STU-9921) will be registered for attendance automatically upon entering the stream.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setLiveModalOpen(false)}
                className="py-2 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setLiveModalOpen(false);
                }}
                className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-[#3256a8] hover:bg-[#2c4c96] shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" />
                Enter Classroom
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
