import React from 'react';
import dbConnect from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import SettingsForm from './SettingsForm';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  let settings: any = null;

  try {
    await dbConnect();
    settings = await SiteSettings.findOne({});
    if (!settings) {
      // Create default settings if none exist
      settings = await SiteSettings.create({});
    }
  } catch (error: any) {
    console.error('Error loading site settings:', error);
  }

  const settingsData = settings ? {
    reviewsEnabled: settings.reviewsEnabled ?? true,
    bookingEnabled: settings.bookingEnabled ?? true,
    helpdeskPhone: settings.helpdeskPhone || '',
    contactEmail: settings.contactEmail || 'syhydhealthcentre@gmail.com',
    upiId: settings.upiId || '',
    upiQrCodeUrl: settings.upiQrCodeUrl || '',
    upiPayeeName: settings.upiPayeeName || 'Sahaja Yoga Health Centre',
    announcementBanner: settings.announcementBanner || '',
  } : {
    reviewsEnabled: true,
    bookingEnabled: true,
    helpdeskPhone: '',
    contactEmail: 'syhydhealthcentre@gmail.com',
    upiId: '',
    upiQrCodeUrl: '',
    upiPayeeName: 'Sahaja Yoga Health Centre',
    announcementBanner: '',
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-warm-gray pb-4">
        <h1 className="text-2xl font-light tracking-wide text-teal-dark">SITE SETTINGS</h1>
        <p className="text-xs text-warm-charcoal/50 mt-1">
          Configure feature flags, contact information, UPI payment details, and announcements. Changes take effect immediately on the public website.
        </p>
      </div>

      <div className="max-w-2xl">
        <SettingsForm initial={settingsData} />
      </div>
    </div>
  );
}
