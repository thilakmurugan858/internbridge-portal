import mongoose, { Document, Schema } from 'mongoose';
import { PostReportReason } from '../types';

export interface IPostReport extends Document {
  postId: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  reason: PostReportReason;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  actionTaken?: 'none' | 'warning_issued' | 'post_flagged' | 'post_deleted';
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostReportSchema = new Schema<IPostReport>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'harassment', 'hate_speech', 'false_info', 'other'],
      required: true,
    },
    details: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    actionTaken: {
      type: String,
      enum: ['none', 'warning_issued', 'post_flagged', 'post_deleted'],
      default: 'none',
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
    resolutionNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reports per user per post
PostReportSchema.index({ postId: 1, reportedBy: 1 }, { unique: true });
PostReportSchema.index({ status: 1, createdAt: -1 });

export const PostReport = mongoose.model<IPostReport>('PostReport', PostReportSchema);
