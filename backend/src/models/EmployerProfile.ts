import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  companyId?: mongoose.Types.ObjectId;
  designation: string;
  phone?: string;
  isCompanyAdmin: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmployerProfileSchema = new Schema<IEmployerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    phone: { type: String, trim: true },
    isCompanyAdmin: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

EmployerProfileSchema.index({ companyId: 1 });

export const EmployerProfile = mongoose.model<IEmployerProfile>('EmployerProfile', EmployerProfileSchema);
