import mongoose, { Document, Schema } from 'mongoose';

export interface IPostView extends Document {
  postId: mongoose.Types.ObjectId;
  viewerId?: mongoose.Types.ObjectId;
  viewerIp?: string;
  createdAt: Date;
}

const PostViewSchema = new Schema<IPostView>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    viewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    viewerIp: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

PostViewSchema.index({ postId: 1, viewerId: 1 });
PostViewSchema.index({ postId: 1, viewerIp: 1 });

export const PostView = mongoose.model<IPostView>('PostView', PostViewSchema);
