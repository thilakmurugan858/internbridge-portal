import mongoose, { Document, Schema } from 'mongoose';
import { ApplicationStatus, OpportunityType } from '../types';

export interface IStatusHistoryItem {
  status: ApplicationStatus;
  changedAt: Date;
  note?: string;
  changedBy?: mongoose.Types.ObjectId;
}

export interface IApplication extends Document {
  opportunityId: mongoose.Types.ObjectId;
  opportunityType: OpportunityType;
  studentId: mongoose.Types.ObjectId;
  employerId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl?: string;
  screeningAnswers?: Array<{
    question: string;
    answer: string;
  }>;
  statusHistory: IStatusHistoryItem[];
  withdrawnAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    opportunityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'opportunityModel',
    },
    opportunityType: {
      type: String,
      enum: ['internship', 'job'],
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    status: {
      type: String,
      enum: ['applied', 'in_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
      default: 'applied',
      required: true,
    },
    coverLetter: {
      type: String,
      maxlength: 2000,
    },
    resumeUrl: {
      type: String,
    },
    screeningAnswers: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        note: { type: String },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    withdrawnAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL: Prevent duplicate applications per student per opportunity
ApplicationSchema.index({ opportunityId: 1, studentId: 1 }, { unique: true });
ApplicationSchema.index({ studentId: 1, createdAt: -1 });
ApplicationSchema.index({ employerId: 1, status: 1 });
ApplicationSchema.index({ opportunityId: 1, status: 1 });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
