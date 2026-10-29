import mongoose, { Document, Schema } from 'mongoose';
import { WorkMode } from '../types';

export interface IInternship extends Document {
  title: string;
  employerId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  companyName: string;
  category: string;
  location: string;
  workMode: WorkMode;
  durationWeeks: number;
  stipend: {
    amount: number;
    currency: string;
    type: 'fixed' | 'negotiable' | 'unpaid' | 'performance_based';
    period: 'month' | 'lump_sum' | 'week';
  };
  openings: number;
  description: string;
  responsibilities: string[];
  skillsRequired: string[];
  eligibility: string[];
  perks: string[];
  deadline: Date;
  startDate: string;
  status: 'active' | 'closed' | 'archived' | 'flagged';
  viewsCount: number;
  applicationsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const InternshipSchema = new Schema<IInternship>(
  {
    title: {
      type: String,
      required: [true, 'Internship title is required'],
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
    durationWeeks: {
      type: Number,
      required: [true, 'Duration in weeks is required'],
      min: 1,
      max: 52,
    },
    stipend: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      type: {
        type: String,
        enum: ['fixed', 'negotiable', 'unpaid', 'performance_based'],
        default: 'fixed',
      },
      period: {
        type: String,
        enum: ['month', 'lump_sum', 'week'],
        default: 'month',
      },
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
    startDate: {
      type: String,
      default: 'Immediately',
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

// Indexes for high performance filtering & searching
InternshipSchema.index({ status: 1, category: 1, location: 1, workMode: 1 });
InternshipSchema.index({ title: 'text', description: 'text', companyName: 'text', skillsRequired: 'text' });
InternshipSchema.index({ employerId: 1 });
InternshipSchema.index({ companyId: 1 });
InternshipSchema.index({ deadline: 1 });
InternshipSchema.index({ createdAt: -1 });

export const Internship = mongoose.model<IInternship>('Internship', InternshipSchema);
