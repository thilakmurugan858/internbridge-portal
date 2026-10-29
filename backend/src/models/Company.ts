import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  slug: string;
  description: string;
  website?: string;
  logoUrl?: string;
  industry: string;
  companySize?: string;
  headquarters?: string;
  foundedYear?: number;
  verified: boolean;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 2500,
    },
    website: { type: String, trim: true },
    logoUrl: { type: String, default: '' },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    companySize: { type: String, default: '10-50 employees' },
    headquarters: { type: String, default: 'Remote' },
    foundedYear: { type: Number },
    verified: { type: Boolean, default: false },
    socialLinks: {
      linkedin: { type: String },
      twitter: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

CompanySchema.index({ industry: 1 });
CompanySchema.index({ verified: 1 });

export const Company = mongoose.model<ICompany>('Company', CompanySchema);
