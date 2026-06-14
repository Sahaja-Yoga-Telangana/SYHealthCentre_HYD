import mongoose, { Schema, Document } from 'mongoose';

export interface IAvailabilitySchedule {
  dayOfWeek: number; // 0 for Sunday, 1 for Monday, etc.
  startTime: string; // e.g. "10:00"
  endTime: string; // e.g. "12:30"
}

export interface IDoctor extends Document {
  userId: mongoose.Types.ObjectId;
  specialty: string;
  availability: IAvailabilitySchedule[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specialty: { type: String, required: true },
    availability: [
      {
        dayOfWeek: { type: Number, required: true }, // 0 = Sunday, 1 = Monday, etc.
        startTime: { type: String, required: true }, // HH:MM format
        endTime: { type: String, required: true }, // HH:MM format
      },
    ],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);
