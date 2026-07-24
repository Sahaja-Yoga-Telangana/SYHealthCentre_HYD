import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
  // Feature Flags
  reviewsEnabled: boolean;
  bookingEnabled: boolean;
  
  // Contact Info (admin-editable)
  helpdeskPhone: string;
  contactEmail: string;
  
  // UPI Payment Settings
  upiId: string;
  upiQrCodeUrl: string;
  upiPayeeName: string;

  // General
  announcementBanner: string;
  
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    reviewsEnabled: { type: Boolean, default: true },
    bookingEnabled: { type: Boolean, default: true },
    helpdeskPhone: { type: String, default: '' },
    contactEmail: { type: String, default: 'syhydhealthcentre@gmail.com' },
    upiId: { type: String, default: '' },
    upiQrCodeUrl: { type: String, default: '' },
    upiPayeeName: { type: String, default: 'Sahaja Yoga Health Centre' },
    announcementBanner: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
