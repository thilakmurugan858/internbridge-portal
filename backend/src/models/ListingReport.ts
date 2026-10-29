import mongoose, { Document, Schema } from 'mongoose';
import { OpportunityType } from '../types';

export interface IListingReport extends Document {
  opportunityId: mongoose.Types.ObjectId;
  opportunityType: OpportunityType;
  reportedBy: mongoose.Types.ObjectId;
  reason: 'fraud_scam' | 'misleading_information' | 'inappropriate_content' | 'discriminatory' | 'other';
  details: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  actionTaken?: 'none' | 'warning_issued' | 'listing_removed' | 'employer_suspended';
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ListingReportSchema = new Schema<IListingReport>(
  {
    opportunityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    opportunityType: {
      type: String,
      enum: ['internship', 'job'],
      required: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      enum: ['fraud_scam', 'misleading_information', 'inappropriate_content', 'discriminatory', 'other'],
      required: true,
    },
    details: {
      type: String,
      required: [true, 'Report details are required'],
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'dismissed'],
      default: 'pending',
    },
    actionTaken: {
      type: String,
      enum: ['none', 'warning_issued', 'listing_removed', 'employer_suspended'],
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

ListingReportSchema.index({ status: 1, createdAt: -1 });
ListingReportSchema.index({ opportunityId: 1 });
ListingReportSchema.index({ reportedBy: 1 });

export const ListingReport = mongoose.model<IListingReport>('ListingReport', ListingReportSchema);
