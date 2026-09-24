import React, { useState } from 'react';
import {
  Search,
  Send,
  Paperclip,
  CheckCheck,
  CheckCircle2,
  Users,
  Shield,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { FacultyMessageConversation } from '../../data/facultyMockData';
import { useFacultyMessages, useFacultyMessageThread, useSendMessage } from '../../hooks/useFacultyData';
import { useEffect } from 'react';

interface FacultyMessagesTabProps {
  searchQuery?: string;
}

export const FacultyMessagesTab: React.FC<FacultyMessagesTabProps> = ({
  searchQuery = '',
}) => {
  const { data: conversationsData, isLoading } = useFacultyMessages();
  const conversations: FacultyMessageConversation[] = conversationsData ?? [];
  const [activeFilter, setActiveFilter] = useState<'All' | 'Students' | 'Faculty' | 'Admin'>('All');
  const [selectedConvId, setSelectedConvId] = useState<string>('conv-1');
  const [localSearch, setLocalSearch] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);
  const { data: threadData } = useFacultyMessageThread(selectedConv?.userId ?? null);
  const sendMessage = useSendMessage();

  const [chatThreads, setChatThreads] = useState<Record<string, Array<{ id: string; sender: 'me' | 'them'; text: string; time: string }>>>({});

  useEffect(() => {
    if (threadData && selectedConvId) {
      setChatThreads((prev) => ({ ...prev, [selectedConvId]: threadData }));
    }
  }, [threadData, selectedConvId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#3256a8] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const handleSelectConv = (id: string) => {
    setSelectedConvId(id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConv?.userId) return;

    const text = messageInput.trim();
    const optimistic = {
      id: `msg-${Date.now()}`,
      sender: 'me' as const,
      text,
      time: 'Just now',
    };

    setChatThreads((prev) => ({
      ...prev,
      [activeConv.id]: [...(prev[activeConv.id] || []), optimistic],
    }));
    setMessageInput('');

    try {
      await sendMessage.mutateAsync({ userId: activeConv.userId, body: text });
    } catch {
      showToast('Message failed to send.');
    }
  };

  const handleAttachFile = () => {
    showToast('Document attachment dialogue opened');
  };

  const effectiveSearch = (localSearch || searchQuery).trim().toLowerCase();

  const filteredConversations = conversations.filter((c) => {
    if (activeFilter !== 'All') {
      if (activeFilter === 'Students' && c.role !== 'Student') return false;
      if (activeFilter === 'Faculty' && c.role !== 'Faculty') return false;
      if (activeFilter === 'Admin' && c.role !== 'Admin') return false;
    }
    if (effectiveSearch) {
      return (
        c.name.toLowerCase().includes(effectiveSearch) ||
        c.lastMessage.toLowerCase().includes(effectiveSearch) ||
        c.role.toLowerCase().includes(effectiveSearch)
      );
    }
    return true;
  });

  const filters: Array<'All' | 'Students' | 'Faculty' | 'Admin'> = ['All', 'Students', 'Faculty', 'Admin'];

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3256a8] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Two-Panel Layout */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
        {/* ======================================================== */}
        {/* Left Panel — Conversation List (col-span-5 / 12)         */}
        {/* ======================================================== */}
        <div className="md:col-span-5 border-r border-slate-100 flex flex-col bg-slate-50/30">
          {/* Search Bar at the top */}
          <div className="p-4 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search messages or senders..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#3256a8] focus:bg-white transition-all"
              />
            </div>

            {/* Filter Strip: All · Students · Faculty · Admin */}
            <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-0.5">
              {filters.map((f) => (
                <button
                  key={f}
                  id={`btn-filter-${f.toLowerCase()}`}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === f
                      ? 'border border-[#3256a8] text-[#3256a8] bg-blue-50/60'
                      : 'border border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Previews List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              return (
                <div
                  key={conv.id}
                  id={`conv-item-${conv.id}`}
                  onClick={() => handleSelectConv(conv.id)}
                  className={`p-4 flex items-start gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/60 border-l-4 border-l-[#3256a8]'
                      : 'hover:bg-slate-100/60'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={conv.avatar}
                      alt={conv.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    {conv.online && (
                      <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full absolute bottom-0 right-0"></span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {conv.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {conv.time}
                      </span>
                    </div>

                    {/* Role label in gray */}
                    <div className="text-[10px] text-slate-500 font-semibold mb-1">
                      {conv.role}
                      {conv.courseTag && ` · ${conv.courseTag}`}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-500 truncate leading-snug">
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount && conv.unreadCount > 0 ? (
                        <span className="px-1.5 py-0.5 bg-[#3256a8] text-white text-[10px] font-extrabold rounded-full shrink-0">
                          {conv.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* Right Panel — Active Conversation (col-span-7 / 12)      */}
        {/* ======================================================== */}
        <div className="md:col-span-7 flex flex-col h-full bg-white">
          {/* Header with Student Context summary pills */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={activeConv.avatar}
                alt={activeConv.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {activeConv.name}
                </h3>
                <span className="text-xs text-slate-500">
                  {activeConv.role}
                  {activeConv.courseTag ? ` — ${activeConv.courseTag}` : ''}
                </span>
              </div>
            </div>

            {/* Quick reference student pills (unique to faculty messages for context) */}
            {activeConv.studentAttendance && activeConv.studentGrade && (
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded-full">
                  Attendance: {activeConv.studentAttendance}%
                </span>
                <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-[#3256a8] text-[11px] font-bold rounded-full">
                  Grade: {activeConv.studentGrade}
                </span>
              </div>
            )}
          </div>

          {/* Message Thread in Bubble Style */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
            {(chatThreads[activeConv.id] || []).map((msg) => {
              const isMe = msg.sender === 'me';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#3256a8] text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-medium px-1">
                    <span>{msg.time}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-[#3256a8]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Text Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-slate-100 bg-white flex items-center gap-2.5"
          >
            <button
              type="button"
              id="btn-attach-file"
              onClick={handleAttachFile}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder={`Reply to ${activeConv.name}...`}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#3256a8] focus:bg-white transition-all"
            />

            <button
              type="submit"
              id="btn-send-faculty-message"
              className="px-4 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
