import mongoose, { Schema, Document } from 'mongoose';

export type RoomCategory = 'Double' | 'Family' | 'Ladies Dormitory' | 'Men\'s Dormitory';

export interface IRoom extends Document {
  roomNumber: string;
  category: RoomCategory;
  maxOccupancy: number; // e.g. 1 or 2 for Double, 4 for Family, 36 for Ladies Dormitory, 25 for Men's
  totalBeds: number;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    roomNumber: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ['Double', 'Family', 'Ladies Dormitory', "Men's Dormitory"],
      required: true,
    },
    maxOccupancy: { type: Number, required: true },
    totalBeds: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
