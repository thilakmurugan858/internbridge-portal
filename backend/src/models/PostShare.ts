import mongoose, { Document, Schema } from 'mongoose';

export interface IPostShare extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  caption?: string;
  createdAt: Date;
}

const PostShareSchema = new Schema<IPostShare>(
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
    caption: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

PostShareSchema.index({ postId: 1, userId: 1 });

export const PostShare = mongoose.model<IPostShare>('PostShare', PostShareSchema);
