import mongoose, { Document, Schema } from 'mongoose';
import { PostMediaType, PostPrivacy, PostStatus } from '../types';

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  authorName: string;
  username: string;
  authorAvatar?: string;
  friendCountAtPost: number;
  content: string;
  mediaUrls: string[];
  mediaType: PostMediaType;
  privacy: PostPrivacy;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  hashtags: string[];
  mentionedUserIds: mongoose.Types.ObjectId[];
  mentionedUsernames: string[];
  status: PostStatus;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    authorAvatar: {
      type: String,
      default: '',
    },
    friendCountAtPost: {
      type: Number,
      default: 0,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [3000, 'Post content cannot exceed 3000 characters'],
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    mediaType: {
      type: String,
      enum: ['text', 'image', 'video'],
      default: 'text',
      required: true,
    },
    privacy: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public',
      required: true,
      index: true,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    hashtags: {
      type: [String],
      default: [],
      index: true,
    },
    mentionedUserIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    mentionedUsernames: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'flagged', 'deleted'],
      default: 'active',
      index: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// High performance compound indexes for feed ordering & discovery
PostSchema.index({ status: 1, privacy: 1, createdAt: -1 });
PostSchema.index({ userId: 1, status: 1, createdAt: -1 });
PostSchema.index({ hashtags: 1, status: 1, createdAt: -1 });
PostSchema.index({ likesCount: -1, createdAt: -1 });

export const Post = mongoose.model<IPost>('Post', PostSchema);
