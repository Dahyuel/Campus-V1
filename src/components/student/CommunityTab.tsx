import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  pageVariants,
  listContainer,
  listItem,
  cardHover,
  fadeIn,
} from '../../lib/motion';
import {
  Pin,
  ThumbsUp,
  MessageSquare,
  Share2,
  Plus,
  Bot,
  CheckCircle2,
  ShieldCheck,
  User,
  X,
  FileText,
  HelpCircle,
  Sparkles,
  Search
} from 'lucide-react';
import { CommunityPost } from '../../data/studentMockData';
import { SHARED_AVATAR_URL } from '../../data/mockData';
import {
  useStudentCommunityPosts,
  useCreateCommunityPost,
  useUpvotePost,
} from '../../hooks/useStudentCommunity';
import { useStudentCourses } from '../../hooks/useStudentData';
import { Portal } from '../ui/Portal';

interface CommunityTabProps {
  searchQuery?: string;
}

interface CoursePill {
  id: string;
  label: string;
  code?: string;
}

export const CommunityTab: React.FC<CommunityTabProps> = ({ searchQuery = '' }) => {
  const { data: coursesData } = useStudentCourses();
  const COURSE_PILLS: CoursePill[] = [
    { id: 'all', label: 'All Courses', code: undefined },
    ...(coursesData ?? []).map((c: { name: string; code: string }) => ({
      id: c.name,
      label: c.name,
      code: c.code,
    })),
  ];

  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [expandedBodyPosts, setExpandedBodyPosts] = useState<Record<string, boolean>>({});
  const [newPostModalOpen, setNewPostModalOpen] = useState<boolean>(false);
  const [upvotedMap, setUpvotedMap] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const initial = reduce ? false : 'hidden';

  const activeCourseCode = COURSE_PILLS.find((p) => p.label === selectedCourse)?.code;
  const { data: postsData, isLoading } = useStudentCommunityPosts(activeCourseCode);
  const createPost = useCreateCommunityPost();
  const upvotePost = useUpvotePost();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  useEffect(() => {
    if (postsData) setPosts(postsData);
  }, [postsData, selectedCourse]);

  // New Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newType, setNewType] = useState<'QUESTION' | 'RESOURCE' | 'DISCUSSION'>('QUESTION');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const query = searchQuery.trim().toLowerCase();

  // Filter posts based on course pill & search query
  const filteredPosts = posts.filter((post) => {
    const matchesCourse =
      selectedCourse === 'all' ||
      post.course.toLowerCase().includes(selectedCourse.toLowerCase());
    if (!matchesCourse) return false;

    if (!query) return true;
    return (
      post.title.toLowerCase().includes(query) ||
      post.body.toLowerCase().includes(query) ||
      post.course.toLowerCase().includes(query)
    );
  });

  const toggleExpandBody = (id: string) => {
    setExpandedBodyPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpvote = async (id: string) => {
    const result = await upvotePost.mutateAsync(id);
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, upvotes: result.upvotes } : p)));
  };

  const handleShare = (postTitle: string) => {
    setToastMessage(`Link to "${postTitle.substring(0, 30)}..." copied to clipboard!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    try {
      await createPost.mutateAsync({
        courseCode: COURSE_PILLS.find((p) => p.label === newCourse)?.code ?? 'CS-301',
        type: newType,
        title: newTitle.trim(),
        body: newBody.trim(),
        isAnonymous,
      });
      setNewPostModalOpen(false);
      setNewTitle('');
      setNewBody('');
      setIsAnonymous(false);
      setToastMessage('Your post has been published to the community feed!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch {
      // handle error
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-xs text-slate-400">
        Loading community posts...
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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3256a8] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Filter Pills & "New Post" Button */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Horizontal Row of Course Filter Pills */}
        <motion.div
          variants={listContainer(0.06)}
          initial={initial}
          animate="visible"
          className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full"
        >
          {COURSE_PILLS.map((pill) => {
            const isActive = selectedCourse === pill.id;
            return (
              <motion.button
                key={pill.id}
                variants={listItem}
                type="button"
                onClick={() => setSelectedCourse(pill.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#3256a8] text-white shadow-[0_2px_8px_0_rgba(50,86,168,0.3)]'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {pill.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* "New Post" Button on Right Side — Filled Blue */}
        <button
          type="button"
          onClick={() => setNewPostModalOpen(true)}
          className="py-2.5 px-4 rounded-2xl bg-[#3256a8] hover:bg-[#2c4c96] text-white text-xs font-bold transition-all shadow-[0_4px_14px_0_rgba(50,86,168,0.25)] flex items-center gap-2 shrink-0 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </button>
      </div>

      {/* Main Content: Feed of Posts in a Single Column */}
      <motion.div
        variants={listContainer(0.09)}
        initial={initial}
        animate="visible"
        className="space-y-4 max-w-4xl mx-auto"
      >
        {filteredPosts.map((post) => {
          const isUpvoted = !!upvotedMap[post.id];
          const isBodyExpanded = !!expandedBodyPosts[post.id];

          return (
            <motion.div
              key={post.id}
              variants={listItem}
              {...cardHover}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] relative transition-shadow"
            >
              {/* Faculty Pinned Icon if pinned */}
              {post.isPinned && (
                <div
                  className="absolute top-6 right-6 flex items-center gap-1.5 text-xs font-bold text-[#3256a8] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100"
                  title="Pinned by Faculty"
                >
                  <Pin className="w-3.5 h-3.5 fill-[#3256a8] rotate-45" />
                  <span className="text-[10px] uppercase">Pinned</span>
                </div>
              )}

              {/* Top Row: post type badge + course name pill + time posted + avatar */}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                {/* Post Type Badge */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    post.type === 'QUESTION'
                      ? 'bg-blue-50 text-[#3256a8] border border-blue-100'
                      : post.type === 'RESOURCE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {post.type}
                </span>

                {/* Course Name Pill */}
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                  {post.course}
                </span>

                {/* Author Avatar & Name */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  {post.isAnonymous ? (
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
                      <User className="w-3 h-3" />
                    </div>
                  ) : (
                    <img
                      src={post.authorAvatar}
                      alt={post.author}
                      className="w-5 h-5 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span className="font-semibold text-slate-700">{post.author}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-400">{post.timePosted}</span>
                </div>
              </div>

              {/* Post Title in Bold */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug tracking-tight mb-2 pr-16">
                {post.title}
              </h3>

              {/* Post Body Text (truncated to 3 lines with "Read more" toggle) */}
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p className={isBodyExpanded ? '' : 'line-clamp-3'}>{post.body}</p>
                {post.body.length > 120 && (
                  <button
                    type="button"
                    onClick={() => toggleExpandBody(post.id)}
                    className="text-xs font-bold text-[#3256a8] mt-1 hover:underline cursor-pointer"
                  >
                    {isBodyExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>

              {/* If QUESTION and AI responded: Blue "Campus AI" Reply Card */}
              {post.type === 'QUESTION' && post.aiResponse && (
                <div className="mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-100/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#3256a8] text-white flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[#3256a8] uppercase tracking-wider">
                        Campus AI
                      </span>
                    </div>

                    {/* Faculty Approved Green Badge */}
                    {post.aiResponse.isFacultyApproved && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Faculty Approved
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    {post.aiResponse.answer}
                  </p>

                  {/* Citation Tag */}
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <Sparkles className="w-3 h-3 text-[#3256a8]" />
                    <span>{post.aiResponse.citation}</span>
                  </div>
                </div>
              )}

              {/* Bottom Row: Upvote Count · Reply Count · "Reply" button · "Share" button */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {/* Upvote Button */}
                  <button
                    type="button"
                    onClick={() => handleUpvote(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      isUpvoted
                        ? 'bg-blue-50 text-[#3256a8] border border-blue-200'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-[#3256a8]' : ''}`} />
                    <span>{post.upvotes}</span>
                  </button>

                  {/* Reply Count Button */}
                  <button
                    type="button"
                    onClick={() => setToastMessage(`Replying to "${post.title.substring(0, 25)}..."`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>{post.repliesCount} Replies</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setToastMessage(`Replying to "${post.title.substring(0, 25)}..."`)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#3256a8] hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(post.title)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Share Post"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredPosts.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 text-slate-400 text-xs">
            No community posts found matching your search. Be the first to start a discussion!
          </div>
        )}
      </motion.div>

      {/* New Post Modal */}
      <AnimatePresence>
      {newPostModalOpen && (
        <Portal>
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-slate-100 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create New Community Post</h3>
              <button
                type="button"
                onClick={() => setNewPostModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="py-4 space-y-4">
              {/* Course Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Course
                </label>
                <select
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#3256a8]"
                >
                  {COURSE_PILLS.filter((p) => p.code).map((p) => (
                    <option key={p.id} value={p.label}>
                      {p.label} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Post Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Post Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['QUESTION', 'RESOURCE', 'DISCUSSION'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewType(type)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        newType === type
                          ? 'bg-[#3256a8] text-white border-[#3256a8]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Post Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Question or Topic Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Can someone explain heap sift-down logic?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#3256a8] focus:bg-white"
                  required
                />
              </div>

              {/* Post Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Explanation or Details
                </label>
                <textarea
                  rows={4}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Describe your question or share course notes with your peers..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#3256a8] focus:bg-white resize-none"
                  required
                />
              </div>

              {/* Toggle for "Post Anonymously" */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Post Anonymously</span>
                  <span className="text-[11px] text-slate-400">
                    Hide your name and student ID from public feed
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-[#3256a8] focus:ring-[#3256a8]/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewPostModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-[#3256a8] hover:bg-[#2c4c96] shadow-xs cursor-pointer"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
        </Portal>
      )}
      </AnimatePresence>
    </motion.div>
  );
};
