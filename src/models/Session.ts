import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  type?: 'Session' | 'Event'; // Distinguish between Health Session vs Collective Event
  title: string;
  description?: string;
  date: Date;
  time: string; // e.g. "10:00 AM - 12:00 PM"
  instructor?: string; // Doctor or Coordinator Name
  imageUrl?: string; // Event / Session picture URL
  limitSeats: boolean; // Seats limit ON/OFF toggle
  maxParticipants: number; // Seat Capacity if limitSeats is true
  registeredCount: number; // Booked Seats
  stayAvailable: boolean; // Stay/Accommodation Allowed: Yes or No
  samarpanAmount?: number; // Price / Samarpan contribution fee in ₹
  upiQrCodeUrl?: string; // UPI QR code image URL / data URL
  upiId?: string; // Specific UPI ID (e.g. syhealthcentre@upi)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    type: { type: String, enum: ['Session', 'Event'], default: 'Session' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    instructor: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    limitSeats: { type: Boolean, default: true },
    maxParticipants: { type: Number, default: 45 },
    registeredCount: { type: Number, default: 0 },
    stayAvailable: { type: Boolean, default: true },
    samarpanAmount: { type: Number, default: 0 },
    upiQrCodeUrl: { type: String, default: '' },
    upiId: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
