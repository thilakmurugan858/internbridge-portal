import { Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { CommunityNotification } from '../models/CommunityNotification';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      sendSuccess(res, [], 'Empty query');
      return;
    }

    const regex = new RegExp(query, 'i');
    const users = await User.find({
      $or: [{ username: regex }, { name: regex }],
    })
      .select('name username avatarUrl role isVerified bio')
      .limit(15)
      .lean();

    sendSuccess(res, users, 'Users search results');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to search users', 500);
  }
};

export const getTrendingHashtags = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Look at posts from the last 14 days
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const result = await Post.aggregate([
      {
        $match: {
          status: 'active',
          privacy: 'public',
          createdAt: { $gte: fourteenDaysAgo },
          hashtags: { $exists: true, $ne: [] },
        },
      },
      { $unwind: '$hashtags' },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const formatted = result.map((r) => ({
      tag: r._id,
      count: r.count,
    }));

    sendSuccess(res, formatted, 'Trending hashtags retrieved');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch trending hashtags', 500);
  }
};

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const limit = Math.min(50, parseInt(req.query.limit as string, 10) || 20);

    const [notifications, unreadCount] = await Promise.all([
      CommunityNotification.find({ recipient: req.user.userId })
        .populate('sender', 'name username avatarUrl role')
        .populate('postId', 'content')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      CommunityNotification.countDocuments({ recipient: req.user.userId, read: false }),
    ]);

    sendSuccess(
      res,
      {
        notifications,
        unreadCount,
      },
      'Notifications retrieved'
    );
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch notifications', 500);
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid notification ID', 400);
      return;
    }

    const updated = await CommunityNotification.findOneAndUpdate(
      { _id: id, recipient: req.user.userId },
      { read: true },
      { new: true }
    );

    if (!updated) {
      sendError(res, 'Notification not found', 404);
      return;
    }

    sendSuccess(res, updated, 'Notification marked as read');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update notification', 500);
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    await CommunityNotification.updateMany(
      { recipient: req.user.userId, read: false },
      { read: true }
    );

    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to mark all as read', 500);
  }
};
