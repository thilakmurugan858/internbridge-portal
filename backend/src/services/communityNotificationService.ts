import mongoose from 'mongoose';
import { CommunityNotification } from '../models/CommunityNotification';
import { NotificationType } from '../types';

export class CommunityNotificationService {
  static async notify(params: {
    recipient: string | mongoose.Types.ObjectId;
    sender: string | mongoose.Types.ObjectId;
    type: NotificationType;
    postId?: string | mongoose.Types.ObjectId;
    postContentSnippet?: string;
    relationshipId?: string | mongoose.Types.ObjectId;
  }): Promise<void> {
    try {
      const recipientId = new mongoose.Types.ObjectId(params.recipient.toString());
      const senderId = new mongoose.Types.ObjectId(params.sender.toString());

      // Never notify oneself
      if (recipientId.equals(senderId)) return;

      const postId = params.postId ? new mongoose.Types.ObjectId(params.postId.toString()) : undefined;
      const relationshipId = params.relationshipId
        ? new mongoose.Types.ObjectId(params.relationshipId.toString())
        : undefined;

      // Deduplicate recent unread notifications of the same type for the same target
      const existing = await CommunityNotification.findOne({
        recipient: recipientId,
        sender: senderId,
        type: params.type,
        ...(postId ? { postId } : {}),
        read: false,
      });

      if (existing) {
        // Already notified and still unread; avoid spamming
        return;
      }

      await CommunityNotification.create({
        recipient: recipientId,
        sender: senderId,
        type: params.type,
        postId,
        postContentSnippet: params.postContentSnippet?.slice(0, 100),
        relationshipId,
        read: false,
      });
    } catch (error) {
      console.error('[CommunityNotificationService] Failed to record notification:', error);
    }
  }
}
