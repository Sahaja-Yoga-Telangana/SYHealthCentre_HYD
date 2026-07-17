import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  title: string;
  description: string;
  date: Date;
  time: string; // e.g. "10:00 AM - 12:00 PM"
  instructor: string;
  maxParticipants: number;
  registeredCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    instructor: { type: String, required: true },
    maxParticipants: { type: Number, default: 50 },
    registeredCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
