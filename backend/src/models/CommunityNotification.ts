import mongoose, { Document, Schema } from 'mongoose';
import { NotificationType } from '../types';

export interface ICommunityNotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: NotificationType;
  postId?: mongoose.Types.ObjectId;
  postContentSnippet?: string;
  relationshipId?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const CommunityNotificationSchema = new Schema<ICommunityNotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'share', 'friend_request', 'friend_accept', 'mention'],
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    postContentSnippet: {
      type: String,
      maxlength: 120,
    },
    relationshipId: {
      type: Schema.Types.ObjectId,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

CommunityNotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export const CommunityNotification = mongoose.model<ICommunityNotification>(
  'CommunityNotification',
  CommunityNotificationSchema
);
