import mongoose, { Schema } from 'mongoose';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  passwordHash?: string; // Optional for Google OAuth users
  role: 'Admin' | 'Doctor' | 'Receptionist' | 'Patient';
  yogiExperienceMonths: number; // For eligibility checks
  nationality: 'Indian' | 'Non-Indian';
  contactNumber?: string; // Optional for Google OAuth users
  gender: 'Male' | 'Female';
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false },
    role: { type: String, enum: ['Admin', 'Doctor', 'Receptionist', 'Patient'], default: 'Patient' },
    yogiExperienceMonths: { type: Number, default: 0 },
    nationality: { type: String, enum: ['Indian', 'Non-Indian'], default: 'Indian' },
    contactNumber: { type: String, required: false, default: '' },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

