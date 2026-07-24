'use client';

import React, { useState } from 'react';
import { updateSiteSettingsAction } from '../actions';

interface SettingsData {
  reviewsEnabled: boolean;
  bookingEnabled: boolean;
  helpdeskPhone: string;
  contactEmail: string;
  upiId: string;
  upiQrCodeUrl: string;
  upiPayeeName: string;
  announcementBanner: string;
}

export default function SettingsForm({ initial }: { initial: SettingsData }) {
  const [form, setForm] = useState<SettingsData>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const res = await updateSiteSettingsAction(form);
    setSaving(false);
    if (res.success) {
      setMessage('Settings saved successfully!');
    } else {
      setMessage(res.error || 'Failed to save settings.');
    }
  };

  const Toggle = ({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between p-4 border border-warm-gray rounded-lg bg-cream hover:bg-cream-dark transition-colors">
      <div>
        <span className="text-sm font-semibold text-warm-charcoal">{label}</span>
        <p className="text-xs text-warm-charcoal/50 font-light mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
          checked ? 'bg-teal' : 'bg-warm-gray'
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Feature Flags */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-saffron border-b border-warm-gray pb-2">Feature Flags</h3>
        <Toggle
          label="Reviews Section"
          description="Show/hide the reviews section on the public homepage"
          checked={form.reviewsEnabled}
          onChange={(v) => setForm({ ...form, reviewsEnabled: v })}
        />
        <Toggle
          label="Session Booking"
          description="Enable/disable the public booking/registration flow"
          checked={form.bookingEnabled}
          onChange={(v) => setForm({ ...form, bookingEnabled: v })}
        />
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-saffron border-b border-warm-gray pb-2">Contact Information</h3>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/50 font-semibold mb-1">Helpdesk Phone Number</label>
          <input type="text" value={form.helpdeskPhone} onChange={(e) => setForm({ ...form, helpdeskPhone: e.target.value })}
            className="w-full text-sm p-2.5 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md"
            placeholder="e.g. +91 98765 43210" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/50 font-semibold mb-1">Contact Email</label>
          <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            className="w-full text-sm p-2.5 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md"
            placeholder="syhydhealthcentre@gmail.com" />
        </div>
      </div>

      {/* UPI Payment */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-saffron border-b border-warm-gray pb-2">UPI Payment Settings</h3>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/50 font-semibold mb-1">UPI ID</label>
          <input type="text" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })}
            className="w-full text-sm p-2.5 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md font-mono"
            placeholder="e.g. syhealth@upi or 9876543210@ybl" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/50 font-semibold mb-1">UPI QR Code Image URL <span className="text-warm-charcoal/30">(paste direct link to QR image)</span></label>
          <input type="url" value={form.upiQrCodeUrl} onChange={(e) => setForm({ ...form, upiQrCodeUrl: e.target.value })}
            className="w-full text-sm p-2.5 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md"
            placeholder="https://example.com/qr-code.png (or leave empty to auto-generate)" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/50 font-semibold mb-1">UPI Payee Name</label>
          <input type="text" value={form.upiPayeeName} onChange={(e) => setForm({ ...form, upiPayeeName: e.target.value })}
            className="w-full text-sm p-2.5 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md"
            placeholder="Sahaja Yoga Health Centre" />
        </div>
      </div>

      {/* Announcement */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-saffron border-b border-warm-gray pb-2">Announcement Banner</h3>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/50 font-semibold mb-1">Banner Text <span className="text-warm-charcoal/30">(leave empty to hide)</span></label>
          <textarea value={form.announcementBanner} onChange={(e) => setForm({ ...form, announcementBanner: e.target.value })}
            rows={2}
            className="w-full text-sm p-2.5 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md"
            placeholder="e.g. Inauguration on 16th August 2026! Register now." />
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between pt-4 border-t border-warm-gray">
        {message && (
          <span className={`text-xs font-mono ${message.includes('success') ? 'text-teal' : 'text-red-500'}`}>{message}</span>
        )}
        <button type="submit" disabled={saving}
          className="ml-auto text-xs font-bold tracking-wider uppercase px-6 py-2.5 bg-saffron text-white hover:bg-saffron-dark disabled:bg-warm-gray transition-colors rounded-md">
          {saving ? 'SAVING...' : 'SAVE SETTINGS'}
        </button>
      </div>
    </form>
  );
}
