import React, { useState } from 'react';
import {
  Pin,
  CheckCircle2,
  Check,
  Sparkles,
  ThumbsUp,
  Trash2,
  AlertTriangle,
  Settings,
  ShieldCheck,
  MessageSquare,
  Bot,
  Filter,
  X
} from 'lucide-react';
import { FacultyCommunityPost } from '../../data/facultyMockData';
import { useFacultyCommunity, useFacultyCourses } from '../../hooks/useFacultyData';
import { useEffect } from 'react';

export const FacultyCommunityTab: React.FC = () => {
  const [activeCourse, setActiveCourse] = useState('Data Structures');
  const { data: coursesData } = useFacultyCourses();
  const activeCourseId =
    coursesData?.find((c: { name: string; id: string }) => c.name === activeCourse)?.id ?? null;
  const { data: postsData, isLoading } = useFacultyCommunity(activeCourseId);
  const [posts, setPosts] = useState<FacultyCommunityPost[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (postsData) setPosts(postsData);
  }, [postsData, activeCourse]);

  // Settings state
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [autoAiResponse, setAutoAiResponse] = useState(true);
  const [postNotifications, setPostNotifications] = useState(true);

  // Moderation state
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(5);
  const [flaggedPosts, setFlaggedPosts] = useState([
    { id: 'flag-1', title: 'Unauthorized exam question sharing rumor', author: 'Anonymous' },
    { id: 'flag-2', title: 'Off-topic group study link flagged by student', author: 'Nour Ali' },
    { id: 'flag-3', title: 'Duplicate assignment clarification request', author: 'Layla Ahmed' },
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#3256a8] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const courseTabs = ['Data Structures', 'Mathematics', 'AI', 'Networks'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTogglePin = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextPin = !p.isPinned;
          showToast(nextPin ? 'Pinned thread to top of feed' : 'Unpinned thread');
          return { ...p, isPinned: nextPin };
        }
        return p;
      })
    );
  };

  const handleMarkVerified = (postId: string) => {
    showToast('Marked discussion answer as faculty-verified');
  };

  const handleApproveAi = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId && p.aiResponse) {
          showToast('Approved Campus AI answer! Citation verified for students.');
          return {
            ...p,
            aiResponse: {
              ...p.aiResponse,
              status: 'approved',
            },
          };
        }
        return p;
      })
    );
    setPendingApprovalsCount((c) => Math.max(0, c - 1));
  };

  const handleCorrectionNeeded = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId && p.aiResponse) {
          showToast('Flagged AI answer for curriculum team review.');
          return {
            ...p,
            aiResponse: {
              ...p.aiResponse,
              status: 'correction_needed',
            },
          };
        }
        return p;
      })
    );
    setPendingApprovalsCount((c) => Math.max(0, c - 1));
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast('Post removed by faculty moderator');
  };

  const handleReviewFlagged = (id: string) => {
    setFlaggedPosts((prev) => prev.filter((f) => f.id !== id));
    showToast('Flagged item resolved');
  };

  const handleReviewAllAi = () => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.aiResponse && p.aiResponse.status === 'awaiting_approval') {
          return {
            ...p,
            aiResponse: { ...p.aiResponse, status: 'approved' },
          };
        }
        return p;
      })
    );
    setPendingApprovalsCount(0);
    showToast('All pending AI responses approved');
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

      {/* Course Tab Strip */}
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4 mb-5">
          {courseTabs.map((tab) => (
            <button
              key={tab}
              id={`tab-community-${tab.toLowerCase().replace(' ', '-')}`}
              onClick={() => setActiveCourse(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCourse === tab
                  ? 'bg-[#3256a8] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stats Strip with 3 inline metrics for the active course community */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-8 p-4 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3256a8]"></span>
            <span className="font-bold text-slate-900">143 Total Posts</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">·</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-slate-900">89 AI Responses</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">·</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="font-bold text-amber-700">12 Awaiting Faculty Review</span>
          </div>
        </div>
      </section>

      {/* Two Column Layout: Feed (Left) & Moderation Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* ======================================================== */}
        {/* Left Column (Wider, col-span-8) — Community Feed         */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 space-y-5">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-white rounded-3xl p-6 border transition-all shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] ${
                post.isPinned ? 'border-blue-200/90 bg-blue-50/20' : 'border-slate-100'
              }`}
            >
              {/* Top Meta: Type badge, Course, Pinned icon, Timestamp */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      post.type === 'QUESTION'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        : post.type === 'RESOURCE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-blue-50 text-[#3256a8] border border-blue-200/60'
                    }`}
                  >
                    {post.type}
                  </span>

                  {post.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3256a8] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      <Pin className="w-3 h-3 rotate-45" />
                      <span>Pinned</span>
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 font-medium">
                  {post.timeAgo}
                </span>
              </div>

              {/* Author Row */}
              <div className="flex items-center gap-2.5 mb-3">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-8 h-8 rounded-full object-cover border border-slate-100"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-none">
                    {post.author}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {post.authorRole} · {activeCourse}
                  </span>
                </div>
              </div>

              {/* Title & Body */}
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">
                {post.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {post.content}
              </p>

              {/* AI Response Card (if present) */}
              {post.hasAiResponse && post.aiResponse && (
                <div className="mt-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#3256a8]">
                      <Bot className="w-3.5 h-3.5" />
                      <span>Campus AI Assistant</span>
                    </div>

                    {post.aiResponse.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Faculty Approved</span>
                      </span>
                    ) : post.aiResponse.status === 'correction_needed' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Correction Flagged</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        <span>Awaiting Faculty Review</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {post.aiResponse.answer}
                  </p>

                  <div className="text-[11px] text-slate-500 font-medium italic pt-1 border-t border-blue-100/60">
                    Source: {post.aiResponse.citation}
                  </div>

                  {/* AI Response Faculty Review Controls (Highlighted if awaiting review) */}
                  {post.aiResponse.status === 'awaiting_approval' && (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        id={`btn-approve-ai-${post.id}`}
                        onClick={() => handleApproveAi(post.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve AI Answer</span>
                      </button>
                      <button
                        id={`btn-correction-ai-${post.id}`}
                        onClick={() => handleCorrectionNeeded(post.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Mark Correction Needed</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Faculty Controls at Bottom of Each Card */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200/60 rounded-lg text-xs font-semibold text-slate-600">
                    <ThumbsUp className="w-3 h-3 text-slate-400" />
                    <span>{post.upvotes}</span>
                  </span>

                  <button
                    id={`btn-pin-${post.id}`}
                    onClick={() => handleTogglePin(post.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] rounded-lg text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                  >
                    <Pin className="w-3 h-3" />
                    <span>{post.isPinned ? 'Unpin' : 'Pin Post'}</span>
                  </button>

                  <button
                    id={`btn-verify-answer-${post.id}`}
                    onClick={() => handleMarkVerified(post.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:border-emerald-600 hover:text-emerald-700 rounded-lg text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Mark Answer Verified</span>
                  </button>
                </div>

                <button
                  id={`btn-delete-post-${post.id}`}
                  onClick={() => handleDeletePost(post.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Post</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ======================================================== */}
        {/* Right Column (Narrower, col-span-4) — Moderation Panel   */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Needs Your Attention */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Moderation Queue
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-4">
              Needs Your Attention
            </h3>

            {/* 3 posts flagged for review */}
            <div className="space-y-3">
              {flaggedPosts.map((flag) => (
                <div
                  key={flag.id}
                  className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {flag.title}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Author: {flag.author}
                    </span>
                  </div>
                  <button
                    id={`btn-review-${flag.id}`}
                    onClick={() => handleReviewFlagged(flag.id)}
                    className="px-2.5 py-1 bg-[#3256a8] hover:bg-[#284588] text-white text-[11px] font-bold rounded-lg transition-all shrink-0 cursor-pointer"
                  >
                    Review
                  </button>
                </div>
              ))}
              {flaggedPosts.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">No flagged items remaining</p>
              )}
            </div>

            {/* Pending AI Approvals */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">Pending AI Approvals</span>
                <p className="text-[11px] text-slate-500">{pendingApprovalsCount} responses waiting</p>
              </div>
              <button
                id="btn-review-all-ai"
                onClick={handleReviewAllAi}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#3256a8] hover:text-[#3256a8] text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Review All
              </button>
            </div>

            {/* Anonymous Posting Toggle */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">Anonymous Posting</span>
                <p className="text-[10px] text-slate-400">Allow students to post anonymously</p>
              </div>
              <button
                onClick={() => {
                  setAllowAnonymous(!allowAnonymous);
                  showToast(allowAnonymous ? 'Anonymous posting disabled' : 'Anonymous posting enabled');
                }}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  allowAnonymous ? 'bg-[#3256a8]' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    allowAnonymous ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Community Settings Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Community Settings
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Allow anonymous posting</span>
                <button
                  onClick={() => setAllowAnonymous(!allowAnonymous)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    allowAnonymous ? 'bg-[#3256a8]' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      allowAnonymous ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Auto-AI response on questions</span>
                <button
                  onClick={() => {
                    setAutoAiResponse(!autoAiResponse);
                    showToast(!autoAiResponse ? 'Auto-AI answers enabled' : 'Auto-AI answers disabled');
                  }}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    autoAiResponse ? 'bg-[#3256a8]' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      autoAiResponse ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">New post notifications</span>
                <button
                  onClick={() => {
                    setPostNotifications(!postNotifications);
                    showToast(!postNotifications ? 'Post notifications enabled' : 'Post notifications muted');
                  }}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    postNotifications ? 'bg-[#3256a8]' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      postNotifications ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
