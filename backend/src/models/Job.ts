import mongoose, { Document, Schema } from 'mongoose';
import { WorkMode } from '../types';

export interface IJob extends Document {
  title: string;
  employerId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  companyName: string;
  category: string;
  location: string;
  workMode: WorkMode;
  jobType: 'full_time' | 'part_time' | 'contract';
  experienceYearsMin: number;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: 'year' | 'month';
  };
  openings: number;
  description: string;
  responsibilities: string[];
  skillsRequired: string[];
  eligibility: string[];
  perks: string[];
  deadline: Date;
  status: 'active' | 'closed' | 'archived' | 'flagged';
  viewsCount: number;
  applicationsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 120,
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
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    workMode: {
      type: String,
      enum: ['remote', 'in_office', 'hybrid'],
      default: 'remote',
      required: true,
    },
    jobType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract'],
      default: 'full_time',
      required: true,
    },
    experienceYearsMin: {
      type: Number,
      default: 0,
    },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      period: { type: String, enum: ['year', 'month'], default: 'year' },
    },
    openings: {
      type: Number,
      default: 1,
      min: 1,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 5000,
    },
    responsibilities: [{ type: String, trim: true }],
    skillsRequired: [{ type: String, trim: true }],
    eligibility: [{ type: String, trim: true }],
    perks: [{ type: String, trim: true }],
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'archived', 'flagged'],
      default: 'active',
      required: true,
    },
    viewsCount: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

JobSchema.index({ status: 1, category: 1, location: 1, workMode: 1, jobType: 1 });
JobSchema.index({ title: 'text', description: 'text', companyName: 'text', skillsRequired: 'text' });
JobSchema.index({ employerId: 1 });
JobSchema.index({ companyId: 1 });
JobSchema.index({ deadline: 1 });
JobSchema.index({ createdAt: -1 });

export const Job = mongoose.model<IJob>('Job', JobSchema);
