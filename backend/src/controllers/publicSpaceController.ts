import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Post, IPost } from '../models/Post';
import { PostLike } from '../models/PostLike';
import { PostComment } from '../models/PostComment';
import { PostShare } from '../models/PostShare';
import { SavedPost } from '../models/SavedPost';
import { PostReport } from '../models/PostReport';
import { PostView } from '../models/PostView';
import { User } from '../models/User';
import { FriendLimitService } from '../services/friendLimitService';
import { CommunityNotificationService } from '../services/communityNotificationService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../types';

/**
 * Extracts unique hashtags (without #) from string content.
 */
export const extractHashtags = (text: string): string[] => {
  const matches = text.match(/#([a-zA-Z0-9_]+)/g);
  if (!matches) return [];
  const tags = matches.map((tag) => tag.slice(1).toLowerCase());
  return Array.from(new Set(tags));
};

/**
 * Extracts unique @mentions (without @) from string content.
 */
export const extractMentions = (text: string): string[] => {
  const matches = text.match(/@([a-zA-Z0-9_]+)/g);
  if (!matches) return [];
  const usernames = matches.map((m) => m.slice(1).toLowerCase());
  return Array.from(new Set(usernames));
};

export const getPostingAllowance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }
    const allowance = await FriendLimitService.getAllowance(req.user.userId);
    sendSuccess(res, allowance, 'Posting allowance retrieved');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to calculate allowance', 500);
  }
};

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const { content, mediaUrls = [], mediaType = 'text', privacy = 'public' } = req.body;

    // MANDATORY BUSINESS ENFORCEMENT: Recalculate friend-based posting allowance on backend
    const allowance = await FriendLimitService.getAllowance(req.user.userId);
    if (!allowance.allowed) {
      sendError(res, allowance.message || 'Daily posting limit reached or no accepted friends found', 403, {
        allowance,
      });
      return;
    }

    // Fetch user details for clean attribution
    const user = await User.findById(req.user.userId);
    if (!user) {
      sendError(res, 'User record not found', 404);
      return;
    }

    const hashtags = extractHashtags(content);
    const mentionedUsernames = extractMentions(content);

    // Resolve mentioned user IDs
    let mentionedUserIds: mongoose.Types.ObjectId[] = [];
    if (mentionedUsernames.length > 0) {
      const mentionedUsers = await User.find({
        username: { $in: mentionedUsernames },
      }).select('_id username');
      mentionedUserIds = mentionedUsers.map((u) => u._id as mongoose.Types.ObjectId);
    }

    const post = await Post.create({
      userId: user._id,
      authorName: user.name,
      username: user.username,
      authorAvatar: user.avatarUrl,
      friendCountAtPost: allowance.acceptedFriends,
      content,
      mediaUrls,
      mediaType,
      privacy,
      hashtags,
      mentionedUserIds,
      mentionedUsernames,
      status: 'active',
    });

    // Notify mentioned users
    for (const mentionedId of mentionedUserIds) {
      await CommunityNotificationService.notify({
        recipient: mentionedId,
        sender: user._id,
        type: 'mention',
        postId: post._id,
        postContentSnippet: post.content,
      });
    }

    const updatedAllowance = await FriendLimitService.getAllowance(req.user.userId);

    sendSuccess(
      res,
      {
        post,
        allowance: updatedAllowance,
      },
      'Post created successfully in Public Space',
      201
    );
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create post', 500);
  }
};

export const getFeed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.userId;
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const tab = (req.query.tab as string) || 'all'; // 'all', 'friends', 'trending', 'recent'
    const hashtag = req.query.hashtag ? String(req.query.hashtag).toLowerCase() : undefined;
    const authorUsername = req.query.username ? String(req.query.username).toLowerCase() : undefined;
    const search = req.query.search ? String(req.query.search).trim() : undefined;

    // Get friend IDs of current user
    let friendIds: string[] = [];
    if (currentUserId) {
      friendIds = await FriendLimitService.getAcceptedFriendIds(currentUserId);
    }

    // Base visibility filter
    const baseFilter: any = { status: 'active' };

    // Apply privacy permissions:
    // User can see:
    // 1. Their own posts (regardless of privacy)
    // 2. Public posts
    // 3. Friends-only posts from their accepted friends
    if (currentUserId) {
      baseFilter.$or = [
        { userId: new mongoose.Types.ObjectId(currentUserId) },
        { privacy: 'public' },
        {
          privacy: 'friends',
          userId: { $in: friendIds.map((id) => new mongoose.Types.ObjectId(id)) },
        },
      ];
    } else {
      // Guest can only see public posts
      baseFilter.privacy = 'public';
    }

    // Specific filters
    if (hashtag) {
      baseFilter.hashtags = hashtag;
    }
    if (authorUsername) {
      baseFilter.username = authorUsername;
    }
    if (search) {
      baseFilter.content = { $regex: search, $options: 'i' };
    }

    let posts: any[] = [];
    let total = 0;

    if (tab === 'friends' && currentUserId) {
      // Friends only feed
      baseFilter.userId = { $in: friendIds.map((id) => new mongoose.Types.ObjectId(id)) };
      [posts, total] = await Promise.all([
        Post.find(baseFilter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Post.countDocuments(baseFilter),
      ]);
    } else if (tab === 'trending') {
      // Trending feed: score by likes + comments + shares
      [posts, total] = await Promise.all([
        Post.find(baseFilter)
          .sort({ likesCount: -1, commentsCount: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Post.countDocuments(baseFilter),
      ]);
    } else if (tab === 'recent') {
      // Chronological feed
      [posts, total] = await Promise.all([
        Post.find(baseFilter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Post.countDocuments(baseFilter),
      ]);
    } else {
      // PERSONALIZED FEED HIERARCHY (Section 11):
      // 1. Accepted friends' posts
      // 2. Trending public posts
      // 3. Recent public posts
      if (currentUserId && friendIds.length > 0) {
        // Query friends posts and non-friends posts, then interleave/prioritize
        const friendObjectIds = friendIds.map((id) => new mongoose.Types.ObjectId(id));
        const friendsFilter = {
          ...baseFilter,
          userId: { $in: friendObjectIds },
        };
        const otherFilter = {
          ...baseFilter,
          userId: { $nin: friendObjectIds },
        };

        const [friendsPosts, trendingOtherPosts, totalCount] = await Promise.all([
          Post.find(friendsFilter).sort({ createdAt: -1 }).limit(limit).lean(),
          Post.find(otherFilter).sort({ likesCount: -1, createdAt: -1 }).limit(limit).lean(),
          Post.countDocuments(baseFilter),
        ]);

        // Prioritize friends first, then fill with trending
        const combined: any[] = [...friendsPosts];
        const seenIds = new Set(friendsPosts.map((p: any) => p._id.toString()));

        for (const p of trendingOtherPosts) {
          if (!seenIds.has(p._id.toString()) && combined.length < limit * page) {
            combined.push(p);
            seenIds.add(p._id.toString());
          }
        }

        posts = combined.slice(skip, skip + limit);
        total = totalCount;
      } else {
        // Default to trending + recent
        [posts, total] = await Promise.all([
          Post.find(baseFilter)
            .sort({ likesCount: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Post.countDocuments(baseFilter),
        ]);
      }
    }

    // Enrich posts with user interactions (isLiked, isSaved, isFriend)
    let likedPostIds = new Set<string>();
    let savedPostIds = new Set<string>();

    if (currentUserId) {
      const postIds = posts.map((p) => p._id);
      const [likes, saves] = await Promise.all([
        PostLike.find({ userId: currentUserId, postId: { $in: postIds } }).lean(),
        SavedPost.find({ userId: currentUserId, postId: { $in: postIds } }).lean(),
      ]);
      likedPostIds = new Set(likes.map((l) => l.postId.toString()));
      savedPostIds = new Set(saves.map((s) => s.postId.toString()));
    }

    const enrichedPosts = posts.map((p: any) => ({
      ...p,
      isLiked: likedPostIds.has(p._id.toString()),
      isSaved: savedPostIds.has(p._id.toString()),
      isAuthor: currentUserId ? p.userId.toString() === currentUserId : false,
    }));

    sendSuccess(res, enrichedPosts, 'Community feed retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch community feed', 500);
  }
};

export const getPostById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid post ID format', 400);
      return;
    }

    const post = await Post.findById(id).lean();
    if (!post || post.status === 'deleted') {
      sendError(res, 'Post not found', 404);
      return;
    }

    const currentUserId = req.user?.userId;

    // Check privacy permissions
    if (post.privacy === 'private' && post.userId.toString() !== currentUserId) {
      sendError(res, 'Access denied: Private post', 403);
      return;
    }
    if (post.privacy === 'friends' && post.userId.toString() !== currentUserId) {
      const friendIds = currentUserId ? await FriendLimitService.getAcceptedFriendIds(currentUserId) : [];
      if (!friendIds.includes(post.userId.toString())) {
        sendError(res, 'Access denied: Only accepted friends can view this post', 403);
        return;
      }
    }

    let isLiked = false;
    let isSaved = false;
    if (currentUserId) {
      const [like, save] = await Promise.all([
        PostLike.findOne({ userId: currentUserId, postId: post._id }).lean(),
        SavedPost.findOne({ userId: currentUserId, postId: post._id }).lean(),
      ]);
      isLiked = !!like;
      isSaved = !!save;
    }

    sendSuccess(res, {
      ...post,
      isLiked,
      isSaved,
      isAuthor: currentUserId ? post.userId.toString() === currentUserId : false,
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch post', 500);
  }
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid post ID', 400);
      return;
    }

    const post = await Post.findById(id);
    if (!post || post.status === 'deleted') {
      sendError(res, 'Post not found', 404);
      return;
    }

    // Ownership verification
    if (post.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      sendError(res, 'Access denied: You can only edit your own posts', 403);
      return;
    }

    const { content, privacy, mediaUrls, mediaType } = req.body;

    if (content !== undefined) {
      post.content = content;
      post.hashtags = extractHashtags(content);
      const mentionedUsernames = extractMentions(content);
      post.mentionedUsernames = mentionedUsernames;

      if (mentionedUsernames.length > 0) {
        const users = await User.find({ username: { $in: mentionedUsernames } }).select('_id');
        post.mentionedUserIds = users.map((u) => u._id as mongoose.Types.ObjectId);
      } else {
        post.mentionedUserIds = [];
      }
    }

    if (privacy) post.privacy = privacy;
    if (mediaUrls) post.mediaUrls = mediaUrls;
    if (mediaType) post.mediaType = mediaType;
    post.isEdited = true;

    await post.save();

    sendSuccess(res, post, 'Post updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update post', 500);
  }
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid post ID', 400);
      return;
    }

    const post = await Post.findById(id);
    if (!post || post.status === 'deleted') {
      sendError(res, 'Post not found', 404);
      return;
    }

    // Strict authorization
    if (post.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      sendError(res, 'Access denied: You can only delete your own posts', 403);
      return;
    }

    post.status = 'deleted';
    await post.save();

    sendSuccess(res, null, 'Post deleted successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to delete post', 500);
  }
};

export const likePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid post ID', 400);
      return;
    }

    const post = await Post.findById(id);
    if (!post || post.status === 'deleted') {
      sendError(res, 'Post not found', 404);
      return;
    }

    // Check if already liked to prevent duplicate counts
    const existing = await PostLike.findOne({
      postId: post._id,
      userId: req.user.userId,
    });

    if (existing) {
      sendSuccess(res, { liked: true, likesCount: post.likesCount }, 'Post already liked');
      return;
    }

    await PostLike.create({
      postId: post._id,
      userId: req.user.userId,
    });

    post.likesCount += 1;
    await post.save();

    // Notify author
    await CommunityNotificationService.notify({
      recipient: post.userId,
      sender: req.user.userId,
      type: 'like',
      postId: post._id,
      postContentSnippet: post.content,
    });

    sendSuccess(res, { liked: true, likesCount: post.likesCount }, 'Post liked');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to like post', 500);
  }
};

export const unlikePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid post ID', 400);
      return;
    }

    const post = await Post.findById(id);
    if (!post || post.status === 'deleted') {
      sendError(res, 'Post not found', 404);
      return;
    }

    const deleted = await PostLike.findOneAndDelete({
      postId: post._id,
      userId: req.user.userId,
    });

    if (deleted) {
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();
    }

    sendSuccess(res, { liked: false, likesCount: post.likesCount }, 'Post unliked');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to unlike post', 500);
  }
};

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const id = String(req.params.id);
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid post ID', 400);
      return;
    }

    const post = await Post.findById(id);
    if (!post || post.status === 'deleted') {
      sendError(res, 'Post not found', 404);
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      sendError(res, 'User record not found', 404);
      return;
    }

    const comment = await PostComment.create({
      postId: post._id,
      userId: user._id,
      authorName: user.name,
      username: user.username,
      authorAvatar: user.avatarUrl,
      content,
    });

    post.commentsCount += 1;
    await post.save();

    // Notify post author
    await CommunityNotificationService.notify({
      recipient: post.userId,
      sender: user._id,
      type: 'comment',
      postId: post._id,
      postContentSnippet: content,
    });

    sendSuccess(res, comment, 'Comment added', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to add comment', 500);
  }
};

export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid post ID', 400);
      return;
    }

    const comments = await PostComment.find({ postId: id }).sort({ createdAt: 1 }).lean();
    sendSuccess(res, comments, 'Comments retrieved');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch comments', 500);
  }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const commentId = String(req.params.commentId);
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      sendError(res, 'Invalid comment ID', 400);
      return;
    }

    const comment = await PostComment.findById(commentId);
    if (!comment) {
      sendError(res, 'Comment not found', 404);
      return;
    }

    const post = await Post.findById(comment.postId);

    // Can delete if comment owner, post owner, or admin
    const isCommentOwner = comment.userId.toString() === req.user.userId;
    const isPostOwner = post && post.userId.toString() === req.user.userId;
    const isAdmin = req.user.role === 'admin';

    if (!isCommentOwner && !isPostOwner && !isAdmin) {
      sendError(res, 'Forbidden: Not authorized to delete this comment', 403);
      return;
    }

    await PostComment.findByIdAndDelete(commentId);

    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
      await post.save();
    }

    sendSuccess(res, null, 'Comment deleted successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to delete comment', 500);
  }
};

export const sharePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const id = String(req.params.id);
    const { caption } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid post ID', 400);
      return;
    }

    const post = await Post.findById(id);
    if (!post || post.status === 'deleted') {
      sendError(res, 'Post not found', 404);
      return;
    }

    if (post.privacy === 'private') {
      sendError(res, 'Private posts cannot be shared', 400);
      return;
    }

    const share = await PostShare.create({
      postId: post._id,
      userId: req.user.userId,
      caption,
    });

    post.sharesCount += 1;
    await post.save();

    // Notify author
    await CommunityNotificationService.notify({
      recipient: post.userId,
      sender: req.user.userId,
      type: 'share',
      postId: post._id,
      postContentSnippet: post.content,
    });

    sendSuccess(res, share, 'Post shared successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to share post', 500);
  }
};

export const savePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid post ID', 400);
      return;
    }

    const post = await Post.findById(id);
    if (!post || post.status === 'deleted') {
      sendError(res, 'Post not found', 404);
      return;
    }

    await SavedPost.findOneAndUpdate(
      { postId: post._id, userId: req.user.userId },
      { postId: post._id, userId: req.user.userId },
      { upsert: true, new: true }
    );

    sendSuccess(res, { saved: true }, 'Post saved to bookmarks');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to save post', 500);
  }
};

export const unsavePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid post ID', 400);
      return;
    }

    await SavedPost.findOneAndDelete({
      postId: id,
      userId: req.user.userId,
    });

    sendSuccess(res, { saved: false }, 'Post removed from bookmarks');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to unsave post', 500);
  }
};

export const getSavedPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const saved = await SavedPost.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .populate('postId')
      .lean();

    const posts = saved
      .filter((s: any) => s.postId && s.postId.status !== 'deleted')
      .map((s: any) => ({
        ...s.postId,
        savedAt: s.createdAt,
        isSaved: true,
        isLiked: false, // populated later on client if needed
      }));

    sendSuccess(res, posts, 'Saved posts retrieved');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch saved posts', 500);
  }
};

export const reportPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const id = String(req.params.id);
    const { reason, details } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid post ID', 400);
      return;
    }

    const post = await Post.findById(id);
    if (!post || post.status === 'deleted') {
      sendError(res, 'Post not found', 404);
      return;
    }

    // Check duplicate reports
    const existing = await PostReport.findOne({
      postId: post._id,
      reportedBy: req.user.userId,
    });

    if (existing) {
      sendError(res, 'You have already submitted a report for this post', 409);
      return;
    }

    const report = await PostReport.create({
      postId: post._id,
      reportedBy: req.user.userId,
      reason,
      details,
      status: 'pending',
    });

    sendSuccess(res, report, 'Post reported to moderation team. Thank you.', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to submit report', 500);
  }
};

export const trackView = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid post ID', 400);
      return;
    }

    const viewerId = req.user?.userId;
    const viewerIp = req.ip;

    // Deduplicate view if viewer has viewed this post in last 24h
    const query: any = { postId: id };
    if (viewerId) {
      query.viewerId = viewerId;
    } else {
      query.viewerIp = viewerIp;
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    query.createdAt = { $gte: twentyFourHoursAgo };

    const existingView = await PostView.findOne(query);
    if (!existingView) {
      await PostView.create({
        postId: id,
        viewerId,
        viewerIp,
      });
      await Post.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });
    }

    sendSuccess(res, null, 'View recorded');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to record view', 500);
  }
};
