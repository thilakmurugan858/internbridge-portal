'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../services/api';
import { Post, PostComment } from '../../types';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  Flag,
  Trash2,
  Globe,
  Users,
  Lock,
  Eye,
  CheckCircle,
  Send,
  X,
  ExternalLink,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onPostDeleted?: (postId: string) => void;
  onHashtagClick?: (tag: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onPostDeleted,
  onHashtagClick,
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isSaved, setIsSaved] = useState(post.isSaved ?? false);
  const [sharesCount, setSharesCount] = useState(post.sharesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [viewsCount, setViewsCount] = useState(post.viewsCount || 0);

  // Comments drawer
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Menu & Modals
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Share modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCommentary, setShareCommentary] = useState('');
  const [sharing, setSharing] = useState(false);

  // Active image preview modal
  const [activeMediaPreview, setActiveMediaPreview] = useState<string | null>(null);

  // Post author comparison
  const postAuthorId =
    typeof post.userId === 'object' && post.userId !== null
      ? (post.userId as any)._id
      : post.userId;
  const isAuthor = currentUserId ? postAuthorId === currentUserId : post.isAuthor;

  // Track view once
  useEffect(() => {
    let unmounted = false;
    api.trackPostView(post._id).then((res) => {
      if (!unmounted && res.success && res.data?.viewsCount) {
        setViewsCount(res.data.viewsCount);
      }
    }).catch(() => {});
    return () => {
      unmounted = true;
    };
  }, [post._id]);

  // Handle Like
  const handleToggleLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (nextState) {
        const res = await api.likePost(post._id);
        if (res.success && res.data) setLikesCount(res.data.likesCount);
      } else {
        const res = await api.unlikePost(post._id);
        if (res.success && res.data) setLikesCount(res.data.likesCount);
      }
    } catch {
      // Revert on failure
      setIsLiked(!nextState);
      setLikesCount((prev) => (nextState ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  // Handle Save
  const handleToggleSave = async () => {
    const nextState = !isSaved;
    setIsSaved(nextState);

    try {
      if (nextState) {
        await api.savePost(post._id);
      } else {
        await api.unsavePost(post._id);
      }
    } catch {
      setIsSaved(!nextState);
    }
  };

  // Toggle comments
  const handleToggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);
    if (nextState && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await api.getPostComments(post._id);
        if (res.success && res.data) {
          setComments(res.data);
        }
      } finally {
        setLoadingComments(false);
      }
    }
  };

  // Submit comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.addPostComment(post._id, newComment.trim());
      if (res.success && res.data) {
        setComments([...comments, res.data]);
        setCommentsCount((prev) => prev + 1);
        setNewComment('');
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await api.deletePostComment(post._id, commentId);
      if (res.success) {
        setComments(comments.filter((c) => c._id !== commentId));
        setCommentsCount((prev) => Math.max(0, prev - 1));
      }
    } catch {}
  };

  // Handle share
  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await api.sharePost(post._id, shareCommentary.trim() || undefined);
      if (res.success) {
        setSharesCount((prev) => prev + 1);
        setShowShareModal(false);
        setShareCommentary('');
      }
    } finally {
      setSharing(false);
    }
  };

  // Handle report
  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReporting(true);
    try {
      const res = await api.reportPost(post._id, {
        reason: reportReason,
        details: reportDetails.trim() || undefined,
      });
      if (res.success) {
        setReportSuccess(true);
        setTimeout(() => {
          setShowReportModal(false);
          setReportSuccess(false);
        }, 1500);
      }
    } finally {
      setReporting(false);
    }
  };

  // Handle delete post
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await api.deletePost(post._id);
      if (res.success && onPostDeleted) {
        onPostDeleted(post._id);
      }
    } catch {}
  };

  // Render clickable hashtags & mentions in post text
  const renderFormattedContent = (text: string) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith('#') && part.length > 1) {
        const cleanTag = part.slice(1).replace(/[^\w]/g, '');
        return (
          <button
            key={index}
            onClick={() => onHashtagClick && onHashtagClick(cleanTag)}
            className="text-primary-600 hover:text-primary-700 font-semibold hover:underline cursor-pointer inline"
          >
            {part}
          </button>
        );
      }
      if (part.startsWith('@') && part.length > 1) {
        const cleanUsername = part.slice(1).replace(/[^\w]/g, '');
        return (
          <Link
            key={index}
            href={`/public-space/profile/${cleanUsername}`}
            className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline inline"
          >
            {part}
          </Link>
        );
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4 hover:border-slate-300/80 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/public-space/profile/${post.username}`}>
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm overflow-hidden hover:opacity-90 transition">
              {post.authorAvatar ? (
                <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
              ) : (
                (post.authorName || 'U')[0].toUpperCase()
              )}
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/public-space/profile/${post.username}`}
                className="text-sm font-bold text-navy-900 hover:text-primary-600 transition"
              >
                {post.authorName}
              </Link>
              <span className="text-xs text-slate-500 font-medium">@{post.username}</span>
              <span className="inline-flex items-center text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                {post.friendCountAtPost || 0} friends
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{formattedDate}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                {post.privacy === 'public' && (
                  <span className="inline-flex items-center gap-1" title="Public">
                    <Globe className="w-3 h-3 text-slate-400" /> Public
                  </span>
                )}
                {post.privacy === 'friends' && (
                  <span className="inline-flex items-center gap-1 text-primary-600" title="Friends Only">
                    <Users className="w-3 h-3" /> Friends
                  </span>
                )}
                {post.privacy === 'private' && (
                  <span className="inline-flex items-center gap-1 text-slate-400" title="Only Me">
                    <Lock className="w-3 h-3" /> Only Me
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 text-xs">
              {isAuthor ? (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleDeletePost();
                  }}
                  className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Post
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowReportModal(true);
                  }}
                  className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Flag className="w-3.5 h-3.5 text-slate-400" /> Report Content
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content */}
      <div className="text-sm text-navy-900 leading-relaxed whitespace-pre-line break-words">
        {renderFormattedContent(post.content)}
      </div>

      {/* Media Rendering */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          {post.mediaType === 'video' ? (
            <video
              src={post.mediaUrls[0]}
              controls
              className="w-full max-h-[450px] object-contain bg-black"
            />
          ) : post.mediaUrls.length === 1 ? (
            <img
              src={post.mediaUrls[0]}
              alt="Post image"
              onClick={() => setActiveMediaPreview(post.mediaUrls[0])}
              className="w-full max-h-[480px] object-cover cursor-pointer hover:opacity-95 transition"
            />
          ) : (
            <div
              className={`grid gap-1.5 p-1 ${
                post.mediaUrls.length === 2
                  ? 'grid-cols-2'
                  : post.mediaUrls.length === 3
                  ? 'grid-cols-3'
                  : 'grid-cols-2'
              }`}
            >
              {post.mediaUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Post image ${i + 1}`}
                  onClick={() => setActiveMediaPreview(url)}
                  className="w-full h-44 object-cover rounded-lg cursor-pointer hover:opacity-95 transition"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Counters & Analytics Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span>{likesCount} like{likesCount === 1 ? '' : 's'}</span>
          <span>•</span>
          <span>{commentsCount} comment{commentsCount === 1 ? '' : 's'}</span>
          <span>•</span>
          <span>{sharesCount} share{sharesCount === 1 ? '' : 's'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>{viewsCount} view{viewsCount === 1 ? '' : 's'}</span>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-100 text-xs">
        {/* Like */}
        <button
          onClick={handleToggleLike}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-medium transition ${
            isLiked
              ? 'text-rose-600 bg-rose-50/70 hover:bg-rose-50'
              : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
          <span className="hidden sm:inline">Like</span>
        </button>

        {/* Comment */}
        <button
          onClick={handleToggleComments}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-medium transition ${
            showComments
              ? 'text-primary-600 bg-primary-50/70 hover:bg-primary-50'
              : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Comment</span>
        </button>

        {/* Share */}
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Save */}
        <button
          onClick={handleToggleSave}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-medium transition ${
            isSaved
              ? 'text-amber-600 bg-amber-50/70 hover:bg-amber-50'
              : 'text-slate-600 hover:text-amber-600 hover:bg-slate-50'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a constructive comment..."
              maxLength={1000}
              className="flex-1 text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submittingComment}
              className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold transition disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Comments List */}
          {loadingComments ? (
            <div className="text-center py-3 text-xs text-slate-400">Loading discussion...</div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-2">
              No comments yet. Start the conversation!
            </p>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div key={comment._id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <Link href={`/public-space/profile/${comment.username}`}>
                    <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden shrink-0">
                      {comment.authorAvatar ? (
                        <img src={comment.authorAvatar} alt={comment.authorName} className="w-full h-full object-cover" />
                      ) : (
                        (comment.authorName || 'U')[0].toUpperCase()
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/public-space/profile/${comment.username}`}
                        className="font-semibold text-navy-900 hover:underline"
                      >
                        {comment.authorName}
                      </Link>
                      {currentUserId === comment.userId && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-slate-400 hover:text-rose-600 transition"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-navy-900">Share Post to Community</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Add your own thoughts or commentary before re-sharing this post to your network:
            </p>

            <textarea
              value={shareCommentary}
              onChange={(e) => setShareCommentary(e.target.value)}
              placeholder="Why are you sharing this? Add context..."
              rows={3}
              maxLength={500}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
            />

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
              <p className="font-semibold text-navy-900">Original post by {post.authorName}:</p>
              <p className="line-clamp-2 mt-1 italic text-slate-500">"{post.content}"</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={sharing}
                className="px-4 py-1.5 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {sharing ? 'Sharing...' : 'Share Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-rose-600" /> Report Content
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-sm font-semibold text-navy-900">Report Submitted</p>
                <p className="text-xs text-slate-500">Thank you for helping keep InternBridge safe.</p>
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-3">
                <p className="text-xs text-slate-500">
                  Select why this post violates community guidelines:
                </p>

                <div className="space-y-1.5 text-xs">
                  {[
                    { id: 'spam', label: 'Spam, scams, or repetitive promotional links' },
                    { id: 'harassment', label: 'Harassment, hate speech, or bullying' },
                    { id: 'inappropriate', label: 'Inappropriate or sexually explicit material' },
                    { id: 'misinformation', label: 'False or misleading career/opportunity claims' },
                    { id: 'other', label: 'Other violation' },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={option.id}
                        checked={reportReason === option.id}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>

                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Additional context or details (optional)..."
                  rows={2}
                  maxLength={500}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reporting}
                    className="px-4 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition disabled:opacity-50"
                  >
                    {reporting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Preview */}
      {activeMediaPreview && (
        <div
          onClick={() => setActiveMediaPreview(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={activeMediaPreview}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </article>
  );
};
