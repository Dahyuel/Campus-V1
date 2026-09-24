import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { pageVariants, listContainer, listItem } from '../../lib/motion';
import {
  Bot,
  Plus,
  Send,
  Sparkles,
  BookOpen,
  Info,
  Clock,
  ChevronDown,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';
import { useAITutorSessions, useCreateAISession } from '../../hooks/useAITutor';
import { useStudentCourses } from '../../hooks/useStudentData';
import { streamAIMessage } from '../../lib/api';
import { TutorSession, TutorMessage } from '../../data/studentMockData';

interface AITutorTabProps {
  searchQuery?: string;
}

export const AITutorTab: React.FC<AITutorTabProps> = ({ searchQuery = '' }) => {
  const { data: coursesData } = useStudentCourses();
  const COURSES_LIST: { id: string; name: string; code: string }[] = (coursesData ?? []).map((c: { name: string; code: string }) => ({
    id: c.code,
    name: c.name,
    code: c.code,
  }));

  const [selectedCourse, setSelectedCourse] = useState('');
  const [sessions, setSessions] = useState<TutorSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const reduce = useReducedMotion();
  const initial = reduce ? false : 'hidden';

  const { data: sessionsData, isLoading } = useAITutorSessions();
  const createSession = useCreateAISession();

  useEffect(() => {
    if (sessionsData && sessionsData.length > 0) {
      setSessions(sessionsData);
      if (!activeSessionId) setActiveSessionId(sessionsData[0].id);
    }
  }, [sessionsData]);

  useEffect(() => {
    if (!selectedCourse && COURSES_LIST.length > 0) {
      setSelectedCourse(COURSES_LIST[0].name);
    }
  }, [coursesData]);

  // Find currently active session
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-400">
        Loading AI Tutor...
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-400">
        No tutoring sessions yet. Start a new session above.
      </div>
    );
  }

  const handleStartNewSession = async () => {
    const courseItem = COURSES_LIST.find((c) => c.name === selectedCourse);
    if (!courseItem) return;
    try {
      const newSession = await createSession.mutateAsync(courseItem.code);
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
    } catch {
      // fallback: keep existing UX
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeSession) return;

    const userMsgText = inputText.trim();
    setInputText('');

    const studentMsg: TutorMessage = {
      id: `usr-${Date.now()}`,
      sender: 'student',
      text: userMsgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? { ...s, messages: [...s.messages, studentMsg], exchangesCount: s.exchangesCount + 1, preview: userMsgText }
          : s
      )
    );

    const aiPlaceholderId = `ai-stream-${Date.now()}`;
    const aiPlaceholder: TutorMessage = {
      id: aiPlaceholderId,
      sender: 'ai',
      text: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? { ...s, messages: [...s.messages, aiPlaceholder] }
          : s
      )
    );

    setIsTyping(true);

    await streamAIMessage(
      activeSession.id,
      userMsgText,
      (token) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSession.id
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === aiPlaceholderId ? { ...m, text: m.text + token } : m
                  ),
                }
              : s
          )
        );
      },
      (realMessageId, citation) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSession.id
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === aiPlaceholderId ? { ...m, id: realMessageId, citation } : m
                  ),
                  exchangesCount: s.exchangesCount + 1,
                }
              : s
          )
        );
        setIsTyping(false);
      },
      (_err) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSession.id
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === aiPlaceholderId
                      ? { ...m, text: 'I encountered an issue connecting to the tutor. Please try again.' }
                      : m
                  ),
                }
              : s
          )
        );
        setIsTyping(false);
      }
    );
  };

  return (
    <motion.div
      variants={pageVariants}
      initial={initial}
      animate="visible"
      className="space-y-6"
    >
      {/* Two Panels Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel (Narrower) — Session Sidebar (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-5">
          {/* Course Selector Dropdown labeled "Tutoring for:" */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tutoring for:
            </label>
            <div className="relative">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-[#3256a8] focus:bg-white appearance-none cursor-pointer"
              >
                {COURSES_LIST.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* "New Session" button in filled blue */}
          <button
            type="button"
            onClick={handleStartNewSession}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#3256a8] hover:bg-[#2c4c96] text-white text-xs font-bold transition-all shadow-[0_4px_14px_0_rgba(50,86,168,0.25)] flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Session</span>
          </button>

          {/* List of Past Tutor Sessions for this course */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              Past Tutor Sessions
            </span>

            <div className="space-y-2">
              {sessions.map((sess) => {
                const isActive = sess.id === activeSession.id;

                return (
                  <button
                    key={sess.id}
                    type="button"
                    onClick={() => setActiveSessionId(sess.id)}
                    className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50/70 border-blue-200 shadow-xs'
                        : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`text-xs font-bold ${
                          isActive ? 'text-[#3256a8]' : 'text-slate-800'
                        }`}
                      >
                        {sess.dateLabel}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {sess.exchangesCount} exchanges
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 leading-snug">
                      {sess.preview}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel (Wider) — Chat Interface (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col min-h-[580px] overflow-hidden">
          {/* Header with Course Name & Small Light Blue Info Banner */}
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#3256a8] flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {selectedCourse} AI Tutor
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Private 1-on-1 Guidance Session
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase border border-emerald-100">
                Course Scoped
              </span>
            </div>

            {/* Small Info Banner in Light Blue */}
            <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100/70 text-xs text-slate-700 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#3256a8] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                This tutor will never give you the answer directly. It will guide you to discover it
                yourself — sourced from your course material only.
              </p>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[440px] scrollbar-hide">
            {activeSession.messages.map((msg) => {
              const isStudent = msg.sender === 'student';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
                >
                  {isStudent ? (
                    /* Student Message: Blue bubble on the right */
                    <div className="max-w-md bg-[#3256a8] text-white px-4 py-3 rounded-2xl rounded-tr-xs shadow-xs">
                      <p className="text-xs sm:text-sm leading-relaxed">{msg.text}</p>
                      <span className="text-[10px] text-blue-200 mt-1 block text-right">
                        {msg.time}
                      </span>
                    </div>
                  ) : (
                    /* AI Tutor Message: White card with subtle border on left */
                    <div className="max-w-lg bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-4 shadow-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#3256a8]">
                        <Bot className="w-3.5 h-3.5" />
                        <span>Campus AI</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                        {msg.text}
                      </p>

                      {/* Citation Tag */}
                      {msg.citation && (
                        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                          <Sparkles className="w-3 h-3 text-[#3256a8]" />
                          <span>{msg.citation}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl w-fit text-xs text-slate-500">
                <Bot className="w-3.5 h-3.5 text-[#3256a8] animate-spin" />
                <span>Campus AI is referencing course materials...</span>
              </div>
            )}
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask a question or explain your reasoning..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#3256a8] focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 bg-[#3256a8] hover:bg-[#2c4c96] text-white rounded-2xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Sub-label */}
            <p className="text-[11px] text-slate-400 text-center mt-2.5">
              Powered by Campus SmartLearn Engine · Scoped to your course material only.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
