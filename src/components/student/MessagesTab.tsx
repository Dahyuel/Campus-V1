import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { pageVariants, listContainer, listItem } from '../../lib/motion';
import {
  Search,
  Paperclip,
  Send,
  CheckCircle2,
  X,
  User,
  MoreVertical,
  Phone,
  Video
} from 'lucide-react';
import {
  useStudentConversations,
  useStudentMessageThread,
  useSendStudentMessage,
} from '../../hooks/useStudentMessages';
import { ChatConversation } from '../../data/studentMockData';

interface MessagesTabProps {
  searchQuery?: string;
}

export const MessagesTab: React.FC<MessagesTabProps> = ({ searchQuery = '' }) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [chatThreads, setChatThreads] = useState<Record<string, any[]>>({});
  const reduce = useReducedMotion();
  const initial = reduce ? false : 'hidden';

  const { data: conversationsData, isLoading } = useStudentConversations();
  const conversations: ChatConversation[] = conversationsData ?? [];

  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  const activeConvBase = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const activeConv: ChatConversation | undefined = activeConvBase
    ? { ...activeConvBase, thread: chatThreads[activeConvBase.id] ?? activeConvBase.thread ?? [] }
    : undefined;

  const { data: threadData } = useStudentMessageThread(activeConvBase?.userId ?? null);
  const sendMessage = useSendStudentMessage();

  useEffect(() => {
    if (threadData && activeConversationId) {
      setChatThreads((prev) => ({ ...prev, [activeConversationId]: threadData }));
    }
  }, [threadData, activeConversationId]);

  const query = (searchQuery || searchTerm).trim().toLowerCase();

  const filteredConversations = conversations.filter((c) => {
    if (!query) return true;
    return (
      c.senderName.toLowerCase().includes(query) ||
      c.lastMessage.toLowerCase().includes(query) ||
      c.senderRole.toLowerCase().includes(query)
    );
  });

  const handleSelectConv = (id: string) => {
    setActiveConversationId(id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv?.userId) return;
    const optimistic = {
      id: Date.now().toString(),
      sender: 'me',
      text: inputText.trim(),
      time: 'Just now',
    };
    setChatThreads((prev) => ({
      ...prev,
      [activeConv.id]: [...(prev[activeConv.id] ?? []), optimistic],
    }));
    setInputText('');
    try {
      await sendMessage.mutateAsync({ userId: activeConv.userId, body: optimistic.text });
    } catch {
      // optimistic already shown
    }
  };

  const handleAttach = () => {
    setToastMsg('Attachment file dialog opened');
    setTimeout(() => setToastMsg(null), 2500);
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
    <motion.div
      variants={pageVariants}
      initial={initial}
      animate="visible"
      className="space-y-6"
    >
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3256a8] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Two Panels Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel — Conversation List (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Direct Messages</h3>
            <p className="text-xs text-slate-400">Faculty & campus administration communications</p>
          </div>

          {/* Search Bar at Top */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#3256a8] focus:bg-white transition-all"
            />
          </div>

          {/* List of 5 Conversation Previews */}
          <div className="space-y-2">
            {filteredConversations.map((conv) => {
              const isActive = conv.id === activeConv.id;

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleSelectConv(conv.id)}
                  className={`w-full p-3 rounded-2xl flex items-start gap-3 text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/80 border border-blue-200/90 shadow-2xs'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={conv.avatarUrl}
                      alt={conv.senderName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    {conv.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4
                        className={`text-xs font-bold truncate ${
                          isActive ? 'text-[#3256a8]' : 'text-slate-900'
                        }`}
                      >
                        {conv.senderName}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                        {conv.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                      {conv.lastMessage}
                    </p>
                  </div>

                  {/* Unread Count Badge in Blue */}
                  {conv.unreadCount > 0 && (
                    <span className="ml-1 shrink-0 px-1.5 py-0.5 rounded-full bg-[#3256a8] text-white text-[10px] font-bold">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel — Active Conversation (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] flex flex-col min-h-[580px] overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={activeConv.avatarUrl}
                  alt={activeConv.senderName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                {activeConv.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {activeConv.senderName}
                  </h3>
                  {activeConv.isOnline && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Online
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-medium">{activeConv.senderRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <button
                type="button"
                onClick={() => setToastMsg('Voice call initiated')}
                className="p-2 rounded-xl hover:bg-slate-100 hover:text-slate-600 cursor-pointer transition-colors"
                title="Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setToastMsg('Video consultation initiated')}
                className="p-2 rounded-xl hover:bg-slate-100 hover:text-slate-600 cursor-pointer transition-colors"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Message Thread (same bubble style) */}
          <div className="flex-1 p-5 space-y-3.5 overflow-y-auto max-h-[440px] scrollbar-hide">
            {activeConv.thread.map((msg) => {
              const isMe = msg.sender === 'me';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-3 rounded-2xl shadow-2xs ${
                      isMe
                        ? 'bg-[#3256a8] text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    <p className="text-xs sm:text-sm leading-relaxed">{msg.text}</p>
                    <span
                      className={`text-[10px] mt-1 block ${
                        isMe ? 'text-blue-200 text-right' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Text Input Bar with send button in filled blue and attachment icon on the left */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAttach}
                className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
                title="Attach Document"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message to faculty or advisor..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#3256a8] focus:bg-white transition-all"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="py-2.5 px-4 bg-[#3256a8] hover:bg-[#2c4c96] text-white rounded-2xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
