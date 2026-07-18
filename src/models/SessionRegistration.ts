import mongoose, { Schema, Document } from 'mongoose';

export interface ISessionRegistration extends Document {
  sessionId: mongoose.Types.ObjectId;
  mrdNumber: string; // Unique Patient ID
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  dob: Date;
  bloodGroup: string;
  address: string;
  phone: string;
  emergencyContact: string;
  centerAddress: string;
  coordinatorNumber: string;
  familyLinkage?: string;
  existingDiseases?: string;
  disclaimerAccepted: boolean;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  
  // EMR & Check-in additions
  checkInStatus: 'Pending' | 'Checked In' | 'Checked Out' | 'Cancelled';
  tokenNumber?: string; // Daily Token number e.g. T-01, T-02
  
  // Billing / Samarpan details (Fixed amount per person)
  billing?: {
    samarpanAmount: number;
    paymentMode: 'Cash' | 'UPI' | 'Card' | 'Pending';
    paymentStatus: 'Paid' | 'Outstanding';
    upiScreenshot?: string;
  };

  // Doctor Consultation details
  consultation?: {
    chiefComplaint?: string;
    examinationFindings?: string;
    doctorNotes?: string;
    status: 'Pending' | 'Completed';
    consultedAt?: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

const SessionRegistrationSchema = new Schema<ISessionRegistration>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    mrdNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    dob: { type: Date, required: true },
    bloodGroup: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    emergencyContact: { type: String, required: true },
    centerAddress: { type: String, required: true },
    coordinatorNumber: { type: String, required: true },
    familyLinkage: { type: String, default: '' },
    existingDiseases: { type: String, default: '' },
    disclaimerAccepted: { type: Boolean, required: true, validate: (v: boolean) => v === true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Confirmed' },
    
    // EMR & Check-in fields
    checkInStatus: { type: String, enum: ['Pending', 'Checked In', 'Checked Out', 'Cancelled'], default: 'Pending' },
    tokenNumber: { type: String, default: '' },
    
    billing: {
      samarpanAmount: { type: Number, default: 0 },
      paymentMode: { type: String, enum: ['Cash', 'UPI', 'Card', 'Pending'], default: 'Pending' },
      paymentStatus: { type: String, enum: ['Paid', 'Outstanding'], default: 'Outstanding' },
      upiScreenshot: { type: String, default: '' },
    },

    consultation: {
      chiefComplaint: { type: String, default: '' },
      examinationFindings: { type: String, default: '' },
      doctorNotes: { type: String, default: '' },
      status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
      consultedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.models.SessionRegistration || 
  mongoose.model<ISessionRegistration>('SessionRegistration', SessionRegistrationSchema);
