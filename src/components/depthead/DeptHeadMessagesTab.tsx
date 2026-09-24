import React, { useState, useEffect } from 'react';
import {
  Search,
  Send,
  Paperclip,
  Users,
  ShieldCheck,
  CheckCheck,
  X,
  Radio,
  CheckCircle2,
  Mail,
  User,
  GraduationCap,
  Building2,
  Bell
} from 'lucide-react';
import {
  useDeptHeadConversations,
  useDeptHeadMessageThread,
  useSendDeptHeadMessage,
} from '../../hooks/useDeptHeadMessages';

interface DeptHeadMessagesTabProps {
  searchQuery?: string;
  onNavigateTab?: (tab: any) => void;
}

interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  userId?: string;
  name: string;
  roleLabel: string;
  roleType: 'Faculty' | 'Dean' | 'Student' | 'Admin' | 'System';
  preview: string;
  time: string;
  unread?: number;
  avatar: string | undefined;
  contextHeader?: {
    title: string;
    sub: string;
    pills?: { label: string; value: string; color: string }[];
  };
  messages: Message[];
}

export const DeptHeadMessagesTab: React.FC<DeptHeadMessagesTabProps> = ({
  searchQuery = '',
  onNavigateTab,
}) => {
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<'All' | 'Faculty' | 'Students' | 'Admin' | 'Dean'>('All');
  const [inputText, setInputText] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [chatThreads, setChatThreads] = useState<Record<string, Message[]>>({});

  const { data: convsData, isLoading } = useDeptHeadConversations();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  useEffect(() => {
    if (convsData) {
      setConversations(convsData);
      if (!activeConvId && convsData.length > 0) setActiveConvId(convsData[0].id);
    }
  }, [convsData]);

  const activeConvBase = conversations.find((c) => c.id === activeConvId) || conversations[0];

  const { data: threadData } = useDeptHeadMessageThread(activeConvBase?.userId ?? null);
  const sendMessage = useSendDeptHeadMessage();

  useEffect(() => {
    if (threadData && activeConvId) {
      setChatThreads((prev) => ({ ...prev, [activeConvId]: threadData }));
    }
  }, [threadData, activeConvId]);

  const activeConv: Conversation | undefined = activeConvBase
    ? { ...activeConvBase, messages: chatThreads[activeConvBase.id] ?? activeConvBase.messages ?? [] }
    : undefined;

  const filteredConversations = conversations.filter((c) => {
    if (filterRole === 'Faculty' && c.roleType !== 'Faculty') return false;
    if (filterRole === 'Students' && c.roleType !== 'Student') return false;
    if (filterRole === 'Admin' && c.roleType !== 'Admin') return false;
    if (filterRole === 'Dean' && c.roleType !== 'Dean') return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return c.name.toLowerCase().includes(q) || c.roleLabel.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q);
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv?.userId) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: inputText.trim(),
      time: 'Just now',
    };

    setChatThreads((prev) => ({
      ...prev,
      [activeConv.id]: [...(prev[activeConv.id] ?? []), newMsg],
    }));

    setInputText('');
    try {
      await sendMessage.mutateAsync({ userId: activeConv.userId, body: newMsg.text });
    } catch {
      // optimistic already shown
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) return;
    setNotification('Administrative broadcast sent to all 24 Computer Science department faculty.');
    setShowBroadcastModal(false);
    setBroadcastSubject('');
    setBroadcastMessage('');
    setTimeout(() => setNotification(null), 3500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-400">
        Loading messages...
      </div>
    );
  }

  if (!activeConv) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-400">
        No conversations found.
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {notification}
        </div>
      )}

      {/* TWO-PANEL LAYOUT */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* ======================================================== */}
        {/* LEFT PANEL: Conversation List (4 cols)                   */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 border-r border-slate-100 flex flex-col justify-between">
          <div>
            {/* Search Bar */}
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3256a8]"
                />
              </div>
            </div>

            {/* Filter Strip: All, Faculty, Students, Admin, Dean */}
            <div className="p-3 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold">
              {(['All', 'Faculty', 'Students', 'Admin', 'Dean'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFilterRole(r)}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    filterRole === r
                      ? 'border border-[#3256a8] text-[#3256a8] bg-blue-50/50'
                      : 'border border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Conversation Items List */}
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[520px]">
              {filteredConversations.map((c) => {
                const isActive = c.id === activeConv.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveConvId(c.id);
                      setConversations((prev) =>
                        prev.map((item) => (item.id === c.id ? { ...item, unread: 0 } : item))
                      );
                    }}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                      isActive ? 'bg-blue-50/40' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <img
                      src={c.avatar}
                      alt={c.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-2xl object-cover shrink-0 border border-slate-100"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <span className="font-bold text-slate-900 text-xs truncate">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                          {c.time}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                        {c.roleLabel}
                      </span>

                      <p className="text-xs text-slate-600 truncate leading-snug">{c.preview}</p>
                    </div>

                    {c.unread && c.unread > 0 ? (
                      <span className="w-5 h-5 rounded-full bg-[#3256a8] text-white text-[10px] font-black flex items-center justify-center shrink-0 self-center">
                        {c.unread}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL: Active Conversation (8 cols)                */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full bg-slate-50/20">
          {/* Active Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={activeConv.avatar}
                alt={activeConv.name}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-2xl object-cover border border-slate-100 shrink-0"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {activeConv.contextHeader?.title || activeConv.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {activeConv.contextHeader?.sub || activeConv.roleLabel}
                </p>
              </div>
            </div>

            {/* Quick reference pills (e.g. Pass rate 82%, Students 299) */}
            {activeConv.contextHeader?.pills && (
              <div className="flex items-center gap-2">
                {activeConv.contextHeader.pills.map((pill, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${pill.color}`}
                  >
                    {pill.label}: {pill.value}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Message Thread in Bubble Style */}
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[460px] min-h-[380px]">
            {activeConv.messages.map((m) => {
              const isMe = m.sender === 'me';
              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-md rounded-2xl p-3.5 text-xs shadow-xs ${
                      isMe
                        ? 'bg-[#3256a8] text-white rounded-br-xs'
                        : 'bg-white text-slate-800 rounded-bl-xs border border-slate-100'
                    }`}
                  >
                    <p className="leading-relaxed">{m.text}</p>
                    <span
                      className={`text-[9px] block mt-1 text-right font-mono ${
                        isMe ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {m.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Text Input Bar with Broadcast Option */}
          <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-2">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                title="Attach Syllabus or Diagnostic"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder={`Message ${activeConv.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3256a8]"
              />

              <button
                type="submit"
                className="px-4 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>

            {/* Unique "Message All CS Faculty" Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">
                Logged in as Dr. Mostafa Hagras (Dept. Head)
              </span>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(true)}
                className="px-3 py-1 border border-blue-200 text-[#3256a8] hover:bg-blue-50/60 rounded-xl text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Radio className="w-3 h-3" />
                Message All CS Faculty
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BROADCAST COMPOSER MODAL */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-100 shadow-2xl relative text-xs">
            <button
              type="button"
              onClick={() => setShowBroadcastModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold text-[#3256a8] uppercase tracking-wider block">
              Department Announcement
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Broadcast to All CS Faculty (24 Members)
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Dispatch an institutional bulletin to all faculty teaching Computer Science courses.
            </p>

            <form onSubmit={handleSendBroadcast} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End of Semester Final Exam Schedule & Grade Entry"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3256a8]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Broadcast Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your announcement..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#3256a8] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
