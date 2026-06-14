import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId | null; // Null for Day Stay bookings
  type: 'OPD' | 'Day Stay';
  appointmentDate: Date;
  timeSlot: string; // e.g. "10:00 - 10:30" or "Day Stay (10am - 5pm)"
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid';
  price: number; // INR 50 for OPD, INR 400 for Day Stay
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', default: null },
    type: { type: String, enum: ['OPD', 'Day Stay'], required: true },
    appointmentDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
