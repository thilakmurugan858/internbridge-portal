import mongoose, { Document, Schema } from 'mongoose';

export interface IPostLike extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PostLikeSchema = new Schema<IPostLike>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Prevent duplicate likes per user per post
PostLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const PostLike = mongoose.model<IPostLike>('PostLike', PostLikeSchema);
