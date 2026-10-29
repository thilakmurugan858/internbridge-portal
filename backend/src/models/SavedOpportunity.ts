import mongoose, { Document, Schema } from 'mongoose';
import { OpportunityType } from '../types';

export interface ISavedOpportunity extends Document {
  studentId: mongoose.Types.ObjectId;
  opportunityId: mongoose.Types.ObjectId;
  opportunityType: OpportunityType;
  createdAt: Date;
}

const SavedOpportunitySchema = new Schema<ISavedOpportunity>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    opportunityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    opportunityType: {
      type: String,
      enum: ['internship', 'job'],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

SavedOpportunitySchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });
SavedOpportunitySchema.index({ studentId: 1, createdAt: -1 });

export const SavedOpportunity = mongoose.model<ISavedOpportunity>('SavedOpportunity', SavedOpportunitySchema);
