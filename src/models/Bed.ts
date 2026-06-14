import mongoose, { Schema, Document } from 'mongoose';

export interface IBed extends Document {
  bedNumber: string; // e.g. "Dorm-L-Bed1" or "Room-101-Bed-A"
  roomId: mongoose.Types.ObjectId;
  occupied: boolean;
  occupiedBy: mongoose.Types.ObjectId | null; // Ref User
  currentBookingId: mongoose.Types.ObjectId | null; // Ref StayBooking
  createdAt: Date;
  updatedAt: Date;
}

const BedSchema = new Schema<IBed>(
  {
    bedNumber: { type: String, required: true, unique: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    occupied: { type: Boolean, default: false },
    occupiedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    currentBookingId: { type: Schema.Types.ObjectId, ref: 'StayBooking', default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Bed || mongoose.model<IBed>('Bed', BedSchema);
