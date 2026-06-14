import mongoose, { Schema, Document } from 'mongoose';

export interface IStayBooking extends Document {
  patientId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  bedId: mongoose.Types.ObjectId | null; // Assigned upon booking or check-in
  checkInDate: Date;
  checkOutDate: Date;
  status: 'Pending' | 'CheckedIn' | 'CheckedOut' | 'Cancelled';
  pricePerDay: number;
  totalAmount: number;
  yogiExperienceMonths: number;
  nationality: 'Indian' | 'Non-Indian';
  sharingOccupants: number; // 1 or 2 for Double Room, up to 4 for Family Room
  paymentStatus: 'Pending' | 'Paid';
  createdAt: Date;
  updatedAt: Date;
}

const StayBookingSchema = new Schema<IStayBooking>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    bedId: { type: Schema.Types.ObjectId, ref: 'Bed', default: null },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Pending', 'CheckedIn', 'CheckedOut', 'Cancelled'],
      default: 'Pending',
    },
    pricePerDay: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    yogiExperienceMonths: { type: Number, required: true },
    nationality: { type: String, enum: ['Indian', 'Non-Indian'], required: true },
    sharingOccupants: { type: Number, default: 1 },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  },
  { timestamps: true }
);

export default mongoose.models.StayBooking || mongoose.model<IStayBooking>('StayBooking', StayBookingSchema);
