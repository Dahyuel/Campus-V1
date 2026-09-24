import React, { useState, useEffect } from 'react';
import {
  Search,
  Send,
  Paperclip,
  CheckCheck,
  CheckCircle2,
  Users,
  Shield,
  GraduationCap,
  Sparkles,
  Radio,
  Plus,
  Bell,
  MessageSquare,
  AlertTriangle,
  UserCheck,
  Building
} from 'lucide-react';
import {
  useAdminChannels,
  useAdminDirectConversations,
  useAdminMessageThread,
  useSendBroadcast,
  useSendAdminDirectMessage,
} from '../../hooks/useAdminMessages';

interface ChannelItem {
  id: string;
  name: string;
  recipients: string;
  count: number;
  lastBroadcast: string;
  time: string;
  iconType: 'students' | 'faculty' | 'heads' | 'at-risk';
}

interface DirectContact {
  id: string;
  userId?: string;
  name: string;
  role: string;
  department: string;
  avatar: string | undefined;
  online: boolean;
  lastMessage: string;
  time: string;
}

const CHANNEL_TYPE_MAP: Record<string, string> = {
  'ch-students': 'all_students',
  'ch-faculty': 'all_faculty',
  'ch-heads': 'dept_heads',
  'ch-at-risk': 'at_risk',
};

export const AdminMessagesTab: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const [activeTab, setActiveTab] = useState<'broadcasts' | 'direct'>('broadcasts');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('ch-students');
  const [selectedDirectId, setSelectedDirectId] = useState<string | null>(null);

  // Search
  const [localSearch, setLocalSearch] = useState('');

  // Broadcast composer state
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');

  // Direct chat input
  const [directInput, setDirectInput] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const { data: channelsData, isLoading: channelsLoading } = useAdminChannels();
  const { data: directData } = useAdminDirectConversations();
  const sendBroadcast = useSendBroadcast();
  const sendDirect = useSendAdminDirectMessage();

  const CHANNELS: ChannelItem[] = channelsData ?? [];
  const DIRECT_CONTACTS: DirectContact[] = directData ?? [];

  useEffect(() => {
    if (DIRECT_CONTACTS.length > 0 && !selectedDirectId) {
      setSelectedDirectId(DIRECT_CONTACTS[0].id);
    }
  }, [DIRECT_CONTACTS, selectedDirectId]);

  // Broadcast threads history (kept local; no history API)
  const [broadcastHistory, setBroadcastHistory] = useState<Record<string, Array<{ id: string; subject: string; body: string; time: string; author: string }>>>({});

  // Direct chat threads
  const [directThreads, setDirectThreads] = useState<Record<string, Array<{ id: string; sender: 'me' | 'them'; text: string; time: string }>>>({});

  const activeChannel = CHANNELS.find((c) => c.id === selectedChannelId) || CHANNELS[0];
  const activeDirect = DIRECT_CONTACTS.find((d) => d.id === selectedDirectId) || DIRECT_CONTACTS[0] || {
    id: 'dir-none',
    name: 'No contacts',
    role: '',
    department: '',
    avatar: '',
    online: false,
    lastMessage: '',
    time: '',
  };

  const { data: threadData } = useAdminMessageThread(activeDirect?.userId ?? null);

  useEffect(() => {
    if (threadData && selectedDirectId) {
      setDirectThreads((prev) => ({ ...prev, [selectedDirectId]: threadData }));
    }
  }, [threadData, selectedDirectId]);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastBody.trim() || !activeChannel) return;

    const channelType = CHANNEL_TYPE_MAP[activeChannel.id];
    if (!channelType) return;

    const newBroadcast = {
      id: `bc-${Date.now()}`,
      subject: broadcastSubject.trim() || 'Announcement',
      body: broadcastBody.trim(),
      time: 'Just now',
      author: 'University Admin',
    };

    setBroadcastHistory((prev) => ({
      ...prev,
      [activeChannel.id]: [newBroadcast, ...(prev[activeChannel.id] || [])],
    }));

    try {
      const result = await sendBroadcast.mutateAsync({ channelType, body: broadcastBody.trim() });
      showToast(`Broadcast sent to ${result.sent} recipients.`);
      setBroadcastSubject('');
      setBroadcastBody('');
    } catch {
      showToast('Broadcast failed.');
    }
  };

  const handleSendDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directInput.trim() || !activeDirect?.userId) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'me' as const,
      text: directInput.trim(),
      time: 'Just now',
    };

    setDirectThreads((prev) => ({
      ...prev,
      [activeDirect.id]: [...(prev[activeDirect.id] || []), newMsg],
    }));

    setDirectInput('');
    try {
      await sendDirect.mutateAsync({ userId: activeDirect.userId, body: newMsg.text });
    } catch {
      // optimistic already shown
    }
  };

  if (channelsLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-400">
        Loading admin messages...
      </div>
    );
  }

  if (!activeChannel) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-400">
        No broadcast channels available.
      </div>
    );
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'students':
        return <GraduationCap className="w-5 h-5 text-[#3256a8]" />;
      case 'faculty':
        return <Users className="w-5 h-5 text-indigo-600" />;
      case 'heads':
        return <Building className="w-5 h-5 text-purple-600" />;
      case 'at-risk':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:
        return <Radio className="w-5 h-5 text-[#3256a8]" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3256a8] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* ======================================================== */}
        {/* Left Column (col-span-4 or 5) — Channel & Direct List    */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 border-r border-slate-100 flex flex-col justify-between bg-slate-50/40">
          <div>
            {/* Top Bar with New Announcement button */}
            <div className="p-4 border-b border-slate-100 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Communications</h3>
                <button
                  onClick={() => {
                    setActiveTab('broadcasts');
                    setBroadcastSubject('Urgent Announcement: ');
                  }}
                  className="px-3 py-1.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Announcement</span>
                </button>
              </div>

              {/* Toggle Pills: Broadcasts / Direct Messages */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setActiveTab('broadcasts')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'broadcasts'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Broadcasts</span>
                </button>
                <button
                  onClick={() => setActiveTab('direct')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'direct'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Direct Messages</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search channels or contacts..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#3256a8] focus:bg-white"
                />
              </div>
            </div>

            {/* List Content */}
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[500px]">
              {activeTab === 'broadcasts' ? (
                // Broadcast Channels List
                CHANNELS.map((ch) => {
                  const isSelected = selectedChannelId === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChannelId(ch.id)}
                      className={`w-full text-left p-4 transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/70 border-r-4 border-r-[#3256a8]'
                          : 'hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-2xs">
                        {getChannelIcon(ch.iconType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs truncate">{ch.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{ch.time}</span>
                        </div>
                        <span className="text-[11px] text-[#3256a8] font-bold block mt-0.5">
                          {ch.recipients}
                        </span>
                        <p className="text-xs text-slate-500 truncate mt-1">
                          {ch.lastBroadcast}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                // Direct Messages List
                DIRECT_CONTACTS.map((dc) => {
                  const isSelected = selectedDirectId === dc.id;
                  return (
                    <button
                      key={dc.id}
                      onClick={() => setSelectedDirectId(dc.id)}
                      className={`w-full text-left p-4 transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/70 border-r-4 border-r-[#3256a8]'
                          : 'hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={dc.avatar}
                          alt={dc.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-100"
                        />
                        {dc.online && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs truncate">{dc.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{dc.time}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium block">
                          {dc.role} · {dc.department}
                        </span>
                        <p className="text-xs text-slate-600 truncate mt-1">
                          {dc.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* Right Column (col-span-8) — Active Thread / Composer     */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-white">
          {activeTab === 'broadcasts' ? (
            /* Broadcast View & Composer */
            <div className="flex flex-col h-full justify-between">
              {/* Channel Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                    {getChannelIcon(activeChannel.iconType)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{activeChannel.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">Official University Broadcast Stream · {activeChannel.recipients}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                  Active Channel
                </span>
              </div>

              {/* Broadcast Stream History */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 max-h-[380px] bg-slate-50/30">
                <div className="text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-slate-100 shadow-2xs">
                    Broadcast History
                  </span>
                </div>

                {(broadcastHistory[activeChannel.id] || []).map((bc) => (
                  <div
                    key={bc.id}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <div className="flex items-center gap-2">
                        <Radio className="w-3.5 h-3.5 text-[#3256a8]" />
                        <span className="font-extrabold text-slate-900 text-xs">{bc.subject}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{bc.time}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{bc.body}</p>
                    <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 font-medium">
                      <span>Sender: <strong className="text-slate-600">{bc.author}</strong></span>
                      <span className="text-emerald-700 flex items-center gap-1 font-bold">
                        <CheckCheck className="w-3.5 h-3.5" /> Delivered to {activeChannel.count} accounts
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Broadcast Composer */}
              <form onSubmit={handleSendBroadcast} className="p-4 sm:p-5 border-t border-slate-100 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#3256a8]" />
                    Compose Broadcast to {activeChannel.name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Instant SMS, Email, & Portal Push</span>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Subject Line (e.g. Schedule Update, Emergency Notice)..."
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#3256a8]"
                />

                <textarea
                  required
                  rows={3}
                  placeholder="Type broadcast announcement message..."
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#3256a8] resize-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => showToast('File attachment dialogue opened.')}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                    title="Attach PDF or document"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Broadcast</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Direct 1-on-1 Chat */
            <div className="flex flex-col h-full justify-between">
              {/* Direct Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={activeDirect.avatar}
                      alt={activeDirect.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-100"
                    />
                    {activeDirect.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{activeDirect.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">{activeDirect.role} · {activeDirect.department}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {activeDirect.online ? 'Active now' : 'Away'}
                </span>
              </div>

              {/* Chat Thread */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 max-h-[380px] bg-slate-50/30">
                {(directThreads[activeDirect.id] || []).map((m) => {
                  const isMe = m.sender === 'me';
                  return (
                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed ${
                          isMe
                            ? 'bg-[#3256a8] text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendDirect} className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast('Attachment options opened.')}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer shrink-0"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder={`Write a message to ${activeDirect.name}...`}
                  value={directInput}
                  onChange={(e) => setDirectInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#3256a8] focus:bg-white"
                />

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#3256a8] hover:bg-[#284588] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
