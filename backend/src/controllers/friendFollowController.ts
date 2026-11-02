import { Response } from 'express';
import mongoose from 'mongoose';
import { Friendship } from '../models/Friendship';
import { Follow } from '../models/Follow';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { FriendLimitService } from '../services/friendLimitService';
import { CommunityNotificationService } from '../services/communityNotificationService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export const sendFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const { targetUserId } = req.body;
    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      sendError(res, 'Valid target user ID is required', 400);
      return;
    }

    if (req.user.userId === targetUserId) {
      sendError(res, 'You cannot send a friend request to yourself', 400);
      return;
    }

    const recipient = await User.findById(targetUserId);
    if (!recipient) {
      sendError(res, 'Recipient user not found', 404);
      return;
    }

    // Check if relationship already exists
    const existing = await Friendship.findOne({
      $or: [
        { requester: req.user.userId, recipient: targetUserId },
        { requester: targetUserId, recipient: req.user.userId },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') {
        sendError(res, 'You are already friends with this user', 400);
        return;
      }
      if (existing.status === 'pending') {
        sendError(res, 'A friend request is already pending between you two', 400);
        return;
      }
      // If previously rejected, allow re-requesting by updating requester & recipient
      existing.requester = new mongoose.Types.ObjectId(req.user.userId);
      existing.recipient = new mongoose.Types.ObjectId(targetUserId);
      existing.status = 'pending';
      await existing.save();

      await CommunityNotificationService.notify({
        recipient: targetUserId,
        sender: req.user.userId,
        type: 'friend_request',
        relationshipId: existing._id,
      });

      sendSuccess(res, existing, 'Friend request sent', 201);
      return;
    }

    const friendship = await Friendship.create({
      requester: req.user.userId,
      recipient: targetUserId,
      status: 'pending',
    });

    await CommunityNotificationService.notify({
      recipient: targetUserId,
      sender: req.user.userId,
      type: 'friend_request',
      relationshipId: friendship._id,
    });

    sendSuccess(res, friendship, 'Friend request sent successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to send friend request', 500);
  }
};

export const respondFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const requestId = String(req.params.id);
    const { action } = req.body; // 'accept' | 'reject'

    if (!['accept', 'reject'].includes(action)) {
      sendError(res, 'Action must be either "accept" or "reject"', 400);
      return;
    }

    let friendship: any = null;
    if (mongoose.Types.ObjectId.isValid(requestId)) {
      friendship = await Friendship.findById(requestId);
    }

    // If ID is targetUserId instead of friendship ID, find by requester & recipient
    if (!friendship && mongoose.Types.ObjectId.isValid(requestId)) {
      friendship = await Friendship.findOne({
        requester: requestId,
        recipient: req.user.userId,
        status: 'pending',
      });
    }

    if (!friendship) {
      sendError(res, 'Friend request not found', 404);
      return;
    }

    // Must be the recipient responding
    if (friendship.recipient.toString() !== req.user.userId) {
      sendError(res, 'Only the recipient can respond to this friend request', 403);
      return;
    }

    if (action === 'accept') {
      friendship.status = 'accepted';
      await friendship.save();

      // Notify requester that request was accepted
      await CommunityNotificationService.notify({
        recipient: friendship.requester,
        sender: req.user.userId,
        type: 'friend_accept',
        relationshipId: friendship._id,
      });

      sendSuccess(res, friendship, 'Friend request accepted! You are now friends.');
    } else {
      friendship.status = 'rejected';
      await friendship.save();
      sendSuccess(res, friendship, 'Friend request rejected.');
    }
  } catch (error: any) {
    sendError(res, error.message || 'Failed to respond to friend request', 500);
  }
};

export const cancelFriendRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const targetUserId = String(req.params.targetUserId);
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      sendError(res, 'Invalid target user ID', 400);
      return;
    }

    await Friendship.findOneAndDelete({
      requester: req.user.userId,
      recipient: targetUserId,
      status: 'pending',
    });

    sendSuccess(res, null, 'Friend request canceled');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to cancel request', 500);
  }
};

export const removeFriend = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const targetUserId = String(req.params.targetUserId);
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      sendError(res, 'Invalid user ID', 400);
      return;
    }

    await Friendship.findOneAndDelete({
      $or: [
        { requester: req.user.userId, recipient: targetUserId, status: 'accepted' },
        { requester: targetUserId, recipient: req.user.userId, status: 'accepted' },
      ],
    });

    sendSuccess(res, null, 'Friend removed');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to remove friend', 500);
  }
};

export const getFriendsList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawUserId = req.params.userId || req.user?.userId;
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      sendError(res, 'Invalid user ID', 400);
      return;
    }

    const friendIds = await FriendLimitService.getAcceptedFriendIds(userId);
    const friends = await User.find({ _id: { $in: friendIds } })
      .select('name username avatarUrl role isVerified bio')
      .lean();

    sendSuccess(res, friends, 'Friends list retrieved');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch friends', 500);
  }
};

export const getPendingRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const incoming = await Friendship.find({
      recipient: req.user.userId,
      status: 'pending',
    })
      .populate('requester', 'name username avatarUrl role isVerified bio')
      .sort({ createdAt: -1 })
      .lean();

    sendSuccess(res, incoming, 'Incoming friend requests retrieved');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch pending requests', 500);
  }
};

export const followUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const targetUserId = String(req.params.targetUserId);
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      sendError(res, 'Invalid target user ID', 400);
      return;
    }

    if (req.user.userId === targetUserId) {
      sendError(res, 'You cannot follow yourself', 400);
      return;
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      sendError(res, 'Target user not found', 404);
      return;
    }

    await Follow.findOneAndUpdate(
      { follower: req.user.userId, following: targetUserId },
      { follower: req.user.userId, following: targetUserId },
      { upsert: true, new: true }
    );

    sendSuccess(res, { following: true }, `Now following ${targetUser.name}`);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to follow user', 500);
  }
};

export const unfollowUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const targetUserId = String(req.params.targetUserId);
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      sendError(res, 'Invalid target user ID', 400);
      return;
    }

    await Follow.findOneAndDelete({
      follower: req.user.userId,
      following: targetUserId,
    });

    sendSuccess(res, { following: false }, 'Unfollowed user');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to unfollow user', 500);
  }
};

export const getUserCommunityProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const identifier = String(req.params.identifier);
    let targetUser: any = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      targetUser = await User.findById(identifier).lean();
    }
    if (!targetUser) {
      targetUser = await User.findOne({ username: identifier.toLowerCase() }).lean();
    }

    if (!targetUser) {
      sendError(res, 'User profile not found', 404);
      return;
    }

    const currentUserId = req.user?.userId;
    const isSelf = currentUserId === targetUser._id.toString();

    // Aggregations
    const friendIds = await FriendLimitService.getAcceptedFriendIds(targetUser._id);
    const [followersCount, followingCount, postsCount] = await Promise.all([
      Follow.countDocuments({ following: targetUser._id }),
      Follow.countDocuments({ follower: targetUser._id }),
      Post.countDocuments({ userId: targetUser._id, status: { $ne: 'deleted' } }),
    ]);

    // Relationship status with current requester
    let friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected' = 'none';
    let isFollowing = false;

    if (currentUserId && !isSelf) {
      const [friendship, followRecord] = await Promise.all([
        Friendship.findOne({
          $or: [
            { requester: currentUserId, recipient: targetUser._id },
            { requester: targetUser._id, recipient: currentUserId },
          ],
        }).lean(),
        Follow.findOne({ follower: currentUserId, following: targetUser._id }).lean(),
      ]);

      if (friendship) {
        if (friendship.status === 'accepted') {
          friendshipStatus = 'accepted';
        } else if (friendship.status === 'pending') {
          friendshipStatus = friendship.requester.toString() === currentUserId ? 'pending_sent' : 'pending_received';
        } else {
          friendshipStatus = 'rejected';
        }
      }

      isFollowing = !!followRecord;
    }

    sendSuccess(res, {
      user: {
        id: targetUser._id,
        name: targetUser.name,
        username: targetUser.username,
        avatarUrl: targetUser.avatarUrl,
        bio: targetUser.bio,
        location: targetUser.location,
        role: targetUser.role,
        isVerified: targetUser.isVerified,
        createdAt: targetUser.createdAt,
      },
      stats: {
        acceptedFriendCount: friendIds.length,
        followersCount,
        followingCount,
        postsCount,
      },
      relationship: {
        isSelf,
        friendshipStatus,
        isFollowing,
      },
    }, 'User community profile retrieved');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch user community profile', 500);
  }
};
