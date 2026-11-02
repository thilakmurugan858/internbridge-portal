import { Router } from 'express';
import {
  getPostingAllowance,
  createPost,
  getFeed,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getComments,
  deleteComment,
  sharePost,
  savePost,
  unsavePost,
  getSavedPosts,
  reportPost,
  trackView,
} from '../controllers/publicSpaceController';
import {
  sendFriendRequest,
  respondFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getFriendsList,
  getPendingRequests,
  followUser,
  unfollowUser,
  getUserCommunityProfile,
} from '../controllers/friendFollowController';
import {
  searchUsers,
  getTrendingHashtags,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/discoveryNotificationController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  createPostSchema,
  updatePostSchema,
  addCommentSchema,
  sharePostSchema,
  postReportSchema,
} from '../validators/schemas';

const router = Router();

// Post Allowance & Creation
router.get('/allowance', authenticate, getPostingAllowance);
router.get('/feed', optionalAuth, getFeed);
router.post('/posts', authenticate, validateRequest(createPostSchema), createPost);
router.get('/posts/:id', optionalAuth, getPostById);
router.patch('/posts/:id', authenticate, validateRequest(updatePostSchema), updatePost);
router.delete('/posts/:id', authenticate, deletePost);

// Post Interactions
router.post('/posts/:id/like', authenticate, likePost);
router.delete('/posts/:id/like', authenticate, unlikePost);
router.post('/posts/:id/comments', authenticate, validateRequest(addCommentSchema), addComment);
router.get('/posts/:id/comments', getComments);
router.delete('/posts/:id/comments/:commentId', authenticate, deleteComment);
router.post('/posts/:id/share', authenticate, validateRequest(sharePostSchema), sharePost);
router.post('/posts/:id/save', authenticate, savePost);
router.delete('/posts/:id/save', authenticate, unsavePost);
router.get('/saved-posts', authenticate, getSavedPosts);
router.post('/posts/:id/report', authenticate, validateRequest(postReportSchema), reportPost);
router.post('/posts/:id/view', optionalAuth, trackView);

// Friend System
router.post('/friends/request', authenticate, sendFriendRequest);
router.post('/friends/request/:id/respond', authenticate, respondFriendRequest);
router.delete('/friends/request/:targetUserId/cancel', authenticate, cancelFriendRequest);
router.delete('/friends/:targetUserId', authenticate, removeFriend);
router.get('/friends', authenticate, getFriendsList);
router.get('/friends/pending', authenticate, getPendingRequests);

// Follow System & Profiles
router.post('/users/:targetUserId/follow', authenticate, followUser);
router.delete('/users/:targetUserId/follow', authenticate, unfollowUser);
router.get('/users/:identifier/profile', optionalAuth, getUserCommunityProfile);

// Discovery & Notifications
router.get('/users/search', optionalAuth, searchUsers);
router.get('/trending-hashtags', getTrendingHashtags);
router.get('/notifications', authenticate, getNotifications);
router.patch('/notifications/read-all', authenticate, markAllNotificationsRead);
router.patch('/notifications/:id/read', authenticate, markNotificationRead);

export default router;
