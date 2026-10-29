import mongoose, { Document, Schema } from 'mongoose';

export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
  grade?: string;
}

export interface IExperience {
  title: string;
  company: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description?: string;
}

export interface IStudentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  phone?: string;
  headline?: string;
  bio?: string;
  location?: string;
  skills: string[];
  education: IEducation[];
  experience: IExperience[];
  resumeUrl?: string;
  portfolioWebsite?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    phone: { type: String, trim: true },
    headline: { type: String, trim: true, maxlength: 150 },
    bio: { type: String, trim: true, maxlength: 1000 },
    location: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: { type: String, required: true },
        startYear: { type: Number, required: true },
        endYear: { type: Number },
        grade: { type: String },
      },
    ],
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        isCurrent: { type: Boolean, default: false },
        description: { type: String },
      },
    ],
    resumeUrl: { type: String },
    portfolioWebsite: { type: String },
    githubUrl: { type: String },
    linkedinUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

StudentProfileSchema.index({ skills: 1 });

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
