import mongoose from 'mongoose';
import { Friendship } from '../models/Friendship';
import { Post } from '../models/Post';

export interface PostingAllowance {
  acceptedFriends: number;
  dailyLimit: number; // 0, 1, 2, 5, or Infinity
  usedToday: number;
  remaining: number;
  allowed: boolean;
  message?: string;
  isUnlimited: boolean;
}

export class FriendLimitService {
  /**
   * Calculates the start and end of the current day in Indian Standard Time (IST, UTC+05:30).
   */
  static getISTDayBounds(referenceDate = new Date()): { startOfDay: Date; endOfDay: Date } {
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(referenceDate.getTime() + istOffsetMs);

    const year = istTime.getUTCFullYear();
    const month = istTime.getUTCMonth();
    const date = istTime.getUTCDate();

    const startOfDay = new Date(Date.UTC(year, month, date, 0, 0, 0, 0) - istOffsetMs);
    const endOfDay = new Date(Date.UTC(year, month, date, 23, 59, 59, 999) - istOffsetMs);

    return { startOfDay, endOfDay };
  }

  /**
   * Retrieves array of unique user IDs who are accepted friends of the given user.
   */
  static async getAcceptedFriendIds(userId: string | mongoose.Types.ObjectId): Promise<string[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId.toString());

    const friendships = await Friendship.find({
      $or: [{ requester: userObjectId }, { recipient: userObjectId }],
      status: 'accepted',
    }).lean();

    const friendIdSet = new Set<string>();
    for (const f of friendships) {
      const requesterId = f.requester.toString();
      const recipientId = f.recipient.toString();
      if (requesterId === userObjectId.toString()) {
        friendIdSet.add(recipientId);
      } else {
        friendIdSet.add(requesterId);
      }
    }

    return Array.from(friendIdSet);
  }

  /**
   * Computes the daily posting limit based strictly on accepted friends count.
   * Business rule:
   * 0 friends -> 0 posts
   * 1 friend -> 1 post
   * 2-5 friends -> 2 posts
   * 6-10 friends -> 5 posts
   * >10 friends -> Unlimited (represented by 999999)
   */
  static calculateDailyLimit(acceptedFriendsCount: number): number {
    if (acceptedFriendsCount === 0) return 0;
    if (acceptedFriendsCount === 1) return 1;
    if (acceptedFriendsCount >= 2 && acceptedFriendsCount <= 5) return 2;
    if (acceptedFriendsCount >= 6 && acceptedFriendsCount <= 10) return 5;
    return 999999; // Unlimited
  }

  /**
   * Counts how many non-deleted posts the user has published today in IST.
   */
  static async getTodayPostsCount(
    userId: string | mongoose.Types.ObjectId,
    referenceDate = new Date()
  ): Promise<number> {
    const userObjectId = new mongoose.Types.ObjectId(userId.toString());
    const { startOfDay, endOfDay } = this.getISTDayBounds(referenceDate);

    const count = await Post.countDocuments({
      userId: userObjectId,
      status: { $ne: 'deleted' },
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    return count;
  }

  /**
   * Computes complete real-time posting allowance with user-facing messages.
   */
  static async getAllowance(
    userId: string | mongoose.Types.ObjectId,
    referenceDate = new Date()
  ): Promise<PostingAllowance> {
    const friendIds = await this.getAcceptedFriendIds(userId);
    const acceptedFriends = friendIds.length;
    const dailyLimit = this.calculateDailyLimit(acceptedFriends);
    const isUnlimited = acceptedFriends > 10;
    const usedToday = await this.getTodayPostsCount(userId, referenceDate);

    if (dailyLimit === 0) {
      return {
        acceptedFriends: 0,
        dailyLimit: 0,
        usedToday: 0,
        remaining: 0,
        allowed: false,
        isUnlimited: false,
        message: 'No accepted friends found. Add at least one friend to create a post.',
      };
    }

    const remaining = isUnlimited ? 999999 : Math.max(0, dailyLimit - usedToday);
    const allowed = isUnlimited || remaining > 0;

    let message: string | undefined;
    if (!allowed) {
      message = 'You have reached your daily posting limit. Try again tomorrow.';
    } else if (isUnlimited) {
      message = 'You have more than 10 accepted friends. You have unlimited daily posts!';
    } else {
      message = `You can create ${remaining} more post${remaining === 1 ? '' : 's'} today.`;
    }

    return {
      acceptedFriends,
      dailyLimit,
      usedToday,
      remaining,
      allowed,
      isUnlimited,
      message,
    };
  }
}
