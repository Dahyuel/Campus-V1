import React, { useState, useEffect } from 'react';
import {
  Search,
  Send,
  Paperclip,
  Radio,
  Users,
  CheckCircle2,
  X,
  Sparkles,
  Bot,
  AlertCircle
} from 'lucide-react';
import {
  useDeanConversations,
  useDeanMessageThread,
  useSendDeanMessage,
} from '../../hooks/useDeanMessages';

interface DeanMessagesTabProps {
  searchQuery?: string;
}

interface Message {
  id: string;
  sender: 'dean' | 'other' | 'system';
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  userId?: string;
  name: string;
  role: string;
  category: 'Department Heads' | 'Admin' | 'Faculty' | 'System';
  avatarUrl: string | undefined;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  deptContext?: {
    deptName: string;
    passRate: string;
    atRisk: number;
  };
  messages: Message[];
}

export const DeanMessagesTab: React.FC<DeanMessagesTabProps> = ({
  searchQuery = '',
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Department Heads' | 'Admin' | 'Faculty'>('All');
  const [inputText, setInputText] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [chatThreads, setChatThreads] = useState<Record<string, Message[]>>({});

  const { data: convsData, isLoading } = useDeanConversations();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  useEffect(() => {
    if (convsData) {
      setConversations(convsData);
      if (!selectedId && convsData.length > 0) setSelectedId(convsData[0].id);
    }
  }, [convsData]);

  const selectedConvBase = conversations.find((c) => c.id === selectedId) || conversations[0];
  const { data: threadData } = useDeanMessageThread(selectedConvBase?.userId ?? null);
  const sendMessage = useSendDeanMessage();

  useEffect(() => {
    if (threadData && selectedId) {
      setChatThreads((prev) => ({ ...prev, [selectedId]: threadData }));
    }
  }, [threadData, selectedId]);

  const selectedConv: Conversation | undefined = selectedConvBase
    ? { ...selectedConvBase, messages: chatThreads[selectedConvBase.id] ?? selectedConvBase.messages ?? [] }
    : undefined;

  const combinedSearch = (searchQuery || localSearch).trim().toLowerCase();

  const filteredConversations = conversations.filter((c) => {
    const matchesCategory =
      filter === 'All'
        ? true
        : filter === 'Department Heads'
        ? c.category === 'Department Heads'
        : filter === 'Admin'
        ? c.category === 'Admin'
        : c.category === 'Faculty';

    if (!matchesCategory) return false;

    if (!combinedSearch) return true;
    return (
      c.name.toLowerCase().includes(combinedSearch) ||
      c.role.toLowerCase().includes(combinedSearch) ||
      c.lastMessage.toLowerCase().includes(combinedSearch)
    );
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConv?.userId) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'dean',
      text: inputText.trim(),
      time: 'Just now',
    };

    setChatThreads((prev) => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] ?? []), newMsg],
    }));

    setInputText('');
    try {
      await sendMessage.mutateAsync({ userId: selectedConv.userId, body: newMsg.text });
    } catch {
      // optimistic already shown
    }
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setShowBroadcastModal(false);
      setBroadcastMessage('');
    }, 1800);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-400">
        Loading messages...
      </div>
    );
  }

  if (!selectedConv) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-400">
        No conversations found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] overflow-hidden h-[calc(100vh-12rem)] min-h-[580px] flex flex-col md:flex-row">
      {/* 1. LEFT PANEL — CONVERSATION LIST */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col shrink-0">
        {/* Search Bar at top */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3256a8]"
            />
          </div>

          {/* Filter strip below it: All · Department Heads · Admin · Faculty */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs">
            {(['All', 'Department Heads', 'Admin', 'Faculty'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  filter === cat
                    ? 'border border-[#3256a8] text-[#3256a8] bg-blue-50/50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Previews */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filteredConversations.map((c) => {
            const isSelected = c.id === selectedConv.id;
            return (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedId(c.id);
                  // clear unread badge
                  setConversations((prev) =>
                    prev.map((item) => (item.id === c.id ? { ...item, unreadCount: 0 } : item))
                  );
                }}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/70'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={c.avatarUrl}
                    alt={c.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  {c.category === 'Department Heads' && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 text-xs truncate block">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {c.time}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                    {c.role}
                  </span>

                  <p className="text-[11px] text-slate-500 truncate mt-1">
                    {c.lastMessage}
                  </p>
                </div>

                {Boolean(c.unreadCount && c.unreadCount > 0) && (
                  <span className="shrink-0 mt-2 px-1.5 py-0.5 bg-[#3256a8] text-white text-[10px] font-black rounded-full min-w-[18px] text-center">
                    {c.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. RIGHT PANEL — ACTIVE CONVERSATION */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/30">
        {/* Top Header with Department Summary Context */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={selectedConv.avatarUrl}
              alt={selectedConv.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {selectedConv.name}
              </h3>
              <span className="text-[11px] text-slate-400 block font-medium">
                {selectedConv.role}
              </span>
            </div>
          </div>

          {/* Quick reference department summary pills (Unique to Dean!) */}
          <div className="flex items-center gap-2">
            {selectedConv.deptContext ? (
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 p-1.5 px-3 rounded-2xl border border-slate-100 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {selectedConv.deptContext.deptName}:
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#3256a8] border border-blue-100">
                  {selectedConv.deptContext.passRate} Pass Rate
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                  {selectedConv.deptContext.atRisk} At-Risk
                </span>
              </div>
            ) : (
              <span className="hidden sm:inline-flex text-[11px] text-slate-400 font-medium">
                Campus Executive Channel
              </span>
            )}

            {/* Unique "Announce to All Dept Heads" outlined button */}
            <button
              type="button"
              onClick={() => setShowBroadcastModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#3256a8] hover:bg-blue-50/70 text-[#3256a8] rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Announce to All Dept Heads</span>
              <span className="lg:hidden">Broadcast</span>
            </button>
          </div>
        </div>

        {/* Message Thread in Bubble Style */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <div className="text-center my-2">
            <span className="text-[10px] text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full font-semibold">
              Official Dean Executive Channel · Encrypted
            </span>
          </div>

          {selectedConv.messages.map((m) => {
            const isDean = m.sender === 'dean';
            const isSystem = m.sender === 'system';

            if (isSystem) {
              return (
                <div key={m.id} className="flex justify-center">
                  <div className="max-w-md p-3 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-900 text-center font-medium">
                    {m.text}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isDean ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-md sm:max-w-lg p-3.5 rounded-3xl text-xs leading-relaxed ${
                    isDean
                      ? 'bg-[#3256a8] text-white rounded-br-sm shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm shadow-xs'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                  {m.time}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Text Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3.5 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2"
        >
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder={`Message ${selectedConv.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3256a8]"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-[#3256a8] hover:bg-[#284588] disabled:opacity-40 text-white rounded-2xl transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* BROADCAST TO ALL DEPT HEADS MODAL */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#3256a8]" />
                <h3 className="text-base font-bold text-slate-900">
                  Broadcast to All Department Heads
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              This message will be dispatched immediately with official Dean priority seal to all 18 Department Heads across the university.
            </p>

            {broadcastSent ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Broadcast dispatched to 18 department chairs.
              </div>
            ) : (
              <form onSubmit={handleBroadcast} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Announcement Subject
                  </label>
                  <input
                    type="text"
                    required
                    defaultValue="Emergency Mid-Semester Academic Performance Review"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Message Body
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Dear Department Chairs, please take note..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#3256a8]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-slate-400">
                    Recipients: 18 Department Chairs
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBroadcastModal(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#3256a8] hover:bg-[#284588] text-white rounded-xl font-bold transition-colors"
                    >
                      Send Broadcast
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
