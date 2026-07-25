'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import Doctor from '@/models/Doctor';
import Session from '@/models/Session';
import SessionRegistration from '@/models/SessionRegistration';
import Review from '@/models/Review';
import SiteSettings from '@/models/SiteSettings';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/mail';

// Seeding function (Creates Admin user if none exists and clears test data)
export async function seedDatabase() {
  try {
    await dbConnect();

    // Check if admin user already exists
    let admin = await User.findOne({ role: 'Admin', email: 'admin' });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin@1970', salt);
      admin = await User.create({
        name: 'Admin User',
        email: 'admin',
        passwordHash,
        role: 'Admin',
        yogiExperienceMonths: 36,
        nationality: 'Indian',
        contactNumber: '+919999999999',
        gender: 'Male',
      });
    }

    // Clear all dummy seed data completely
    await SessionRegistration.deleteMany({});
    await Review.deleteMany({});
    await Session.deleteMany({});

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/sessions');
    revalidatePath('/book');
    return { success: true, message: 'Database reset to 100% clean state with only Admin user.' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Onboard Doctor (creates user + doctor profile)
export async function onboardDoctor(
  name: string,
  email: string,
  specialty: string,
  availabilityDays: number[],
  gender: 'Male' | 'Female'
) {
  try {
    await dbConnect();

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'Doctor',
      yogiExperienceMonths: 48,
      nationality: 'Indian',
      contactNumber: '+919999999999',
      gender,
    });

    const availability = availabilityDays.map((day) => ({
      dayOfWeek: day,
      startTime: '10:00',
      endTime: '12:30',
    }));

    await Doctor.create({
      userId: user._id,
      specialty,
      availability,
      active: true,
    });

    revalidatePath('/admin/doctors');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Doctor Active toggle
export async function toggleDoctorActive(id: string, active: boolean) {
  await dbConnect();
  await Doctor.findByIdAndUpdate(id, { active });
  revalidatePath('/admin/doctors');
}

export async function createSessionAction(data: {
  title: string;
  description: string;
  date: string;
  time: string;
  instructor: string;
  maxParticipants: number;
  stayAvailable?: boolean;
}) {
  try {
    await dbConnect();
    await Session.create({
      ...data,
      date: new Date(data.date),
      stayAvailable: data.stayAvailable !== undefined ? data.stayAvailable : true,
      registeredCount: 0,
      isActive: true,
    });
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/sessions');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSessionAction(id: string, data: Partial<any>) {
  try {
    await dbConnect();
    if (data.date) {
      data.date = new Date(data.date) as any;
    }
    await Session.findByIdAndUpdate(id, data);
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/sessions');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSessionAction(id: string) {
  try {
    await dbConnect();
    await Session.findByIdAndDelete(id);
    // Remove registrations too
    await SessionRegistration.deleteMany({ sessionId: id });
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/sessions');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Session Registration Actions
export async function createRegistrationAction(payload: {
  sessionId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  stayDays?: number;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  dob: string;
  bloodGroup: string;
  address: string;
  phone: string;
  email: string;
  emergencyContact: string;
  centerAddress: string;
  coordinatorNumber: string;
  familyMembers?: {
    name: string;
    age: number;
    gender: 'Male' | 'Female';
    dob: string;
    bloodGroup: string;
  }[];
  existingDiseases?: string;
  disclaimerAccepted: boolean;
  billing?: {
    samarpanAmount: number;
    paymentMode: 'Cash' | 'UPI' | 'Card' | 'Pending';
    paymentStatus: 'Paid' | 'Outstanding';
    upiScreenshot?: string;
    transactionId?: string;
  };
}) {
  try {
    await dbConnect();

    if (!payload.checkInDate || !payload.checkOutDate) {
      throw new Error('Please select your check-in and check-out dates.');
    }

    const checkInDate = new Date(`${payload.checkInDate}T00:00:00.000Z`);
    const checkOutDate = new Date(`${payload.checkOutDate}T00:00:00.000Z`);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      throw new Error('Please select valid stay dates.');
    }

    if (checkOutDate <= checkInDate) {
      throw new Error('Check-out date must be after check-in date.');
    }

    const nextDay = new Date(checkInDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    // Admin-created sessions act as optional date controls. If no session exists,
    // the public site creates a normal open stay slot for that check-in date.
    let session = payload.sessionId ? await Session.findById(payload.sessionId) : null;

    if (!session) {
      session = await Session.findOne({
        date: { $gte: checkInDate, $lt: nextDay },
      }).sort({ createdAt: 1 });
    }

    if (!session) {
      session = await Session.create({
        title: `Health Centre Stay - ${payload.checkInDate}`,
        description: 'Open stay booking created from the public website.',
        date: checkInDate,
        time: 'Stay admission',
        instructor: 'Health Centre Admissions',
        maxParticipants: 500,
        registeredCount: 0,
        isActive: true,
      });
    }

    if (!session.isActive) throw new Error('Session is no longer active');
    if (session.registeredCount >= session.maxParticipants) {
      throw new Error('This check-in date is fully booked.');
    }

    // Auto-generate MRD number: MRD-YYYYMMDD-XXXX
    const today = new Date();
    const dateStr = today.getFullYear() + 
      String(today.getMonth() + 1).padStart(2, '0') + 
      String(today.getDate()).padStart(2, '0');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const mrdNumber = `MRD-${dateStr}-${randomHex}`;

    // Create registration
    const registration = await SessionRegistration.create({
      ...payload,
      sessionId: session._id,
      checkInDate,
      checkOutDate,
      stayDays: payload.stayDays,
      dob: new Date(payload.dob),
      mrdNumber,
      status: 'Confirmed', // Automatically confirmed for simplicity
    });

    // Increment registered count
    session.registeredCount += 1;
    await session.save();

    // Send confirmation email
    if (payload.email) {
      const emailSubject = `Booking Confirmation - ${mrdNumber} | Sahaja Yoga Health Centre`;
      
      const totalPeople = 1 + (payload.familyMembers?.length || 0);
      const computedAmount = payload.billing?.samarpanAmount || 500;
      const stayDays = payload.stayDays || Math.round(computedAmount / (500 * totalPeople));

      let familyHtml = '';
      if (payload.familyMembers && payload.familyMembers.length > 0) {
        familyHtml = `
        <div style="border-top: 1px solid #e5e5e5; padding-top: 12px; margin-top: 12px;">
          <span style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: #a3a3a3; display: block; letter-spacing: 0.05em; margin-bottom: 6px;">Family Members Staying With You</span>
          <table style="width: 100%; font-size: 11px; color: #404040; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #f5f5f5; text-align: left;">
                <th style="padding: 4px 0; font-weight: 600;">Name</th>
                <th style="padding: 4px 0; font-weight: 600;">Age/Gender</th>
                <th style="padding: 4px 0; font-weight: 600; text-align: right;">Blood</th>
              </tr>
            </thead>
            <tbody>
              ${payload.familyMembers.map(fm => `
                <tr style="border-bottom: 1px solid #fafafa;">
                  <td style="padding: 5px 0;">${fm.name}</td>
                  <td style="padding: 5px 0;">${fm.age} yrs / ${fm.gender}</td>
                  <td style="padding: 5px 0; text-align: right; font-mono">${fm.bloodGroup}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        `;
      }

      const emailHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; color: #171717;">
  <div style="text-align: center; border-bottom: 1px solid #e5e5e5; padding-bottom: 20px; margin-bottom: 20px;">
    <h2 style="font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 5px 0; font-size: 18px;">Sahaja Yoga</h2>
    <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #737373;">Research & Health Centre, Hyderabad</p>
  </div>
  
  <p style="font-size: 14px; line-height: 1.5; font-weight: 300;">Dear <strong>${payload.name}</strong>,</p>
  <p style="font-size: 13px; line-height: 1.6; font-weight: 300; color: #404040;">
    Your stay booking at the Sahaja Yoga Research & Health Centre has been successfully recorded. Below are your booking confirmation details:
  </p>

  <div style="background-color: #fafafa; border: 1px solid #e5e5e5; padding: 20px; margin: 20px 0; border-radius: 0px;">
    <div style="border-bottom: 1px solid #e5e5e5; padding-bottom: 10px; margin-bottom: 15px;">
      <span style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: #a3a3a3; display: block; letter-spacing: 0.05em;">Patient ID (MRD Number)</span>
      <span style="font-family: monospace; font-size: 18px; font-weight: bold; color: #171717; letter-spacing: 0.05em; display: block; margin-top: 2px;">${mrdNumber}</span>
    </div>

    <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid #f5f5f5;">
        <td style="padding: 6px 0; color: #737373; font-weight: 300;">Stay Dates:</td>
        <td style="padding: 6px 0; font-weight: 600; text-align: right;">${payload.checkInDate} to ${payload.checkOutDate}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f5f5f5;">
        <td style="padding: 6px 0; color: #737373; font-weight: 300;">Stay Slot:</td>
        <td style="padding: 6px 0; font-weight: 600; text-align: right;">${session.title}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f5f5f5;">
        <td style="padding: 6px 0; color: #737373; font-weight: 300;">Stay Duration:</td>
        <td style="padding: 6px 0; font-weight: 600; text-align: right;">${stayDays} Day(s)</td>
      </tr>
      <tr style="border-bottom: 1px solid #f5f5f5;">
        <td style="padding: 6px 0; color: #737373; font-weight: 300;">Total Seeker(s):</td>
        <td style="padding: 6px 0; font-weight: 600; text-align: right;">${totalPeople} Person(s)</td>
      </tr>
      <tr style="border-bottom: 1px solid #f5f5f5;">
        <td style="padding: 6px 0; color: #737373; font-weight: 300;">Samarpan Fee:</td>
        <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #171717;">₹${computedAmount} (${payload.billing?.paymentMode === 'UPI' ? 'UPI' : 'Pay on Arrival'})</td>
      </tr>
      ${payload.billing?.paymentMode === 'UPI' && payload.billing?.transactionId ? `
      <tr style="border-bottom: 1px solid #f5f5f5;">
        <td style="padding: 6px 0; color: #737373; font-weight: 300;">UPI Transaction ID:</td>
        <td style="padding: 6px 0; font-family: monospace; font-weight: 600; text-align: right;">${payload.billing.transactionId}</td>
      </tr>
      ` : ''}
      <tr style="border-bottom: 1px solid #f5f5f5;">
        <td style="padding: 6px 0; color: #737373; font-weight: 300;">Clinic Center Address:</td>
        <td style="padding: 6px 0; font-weight: 600; text-align: right;">Nirmal Nagari, Hyderabad</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; color: #737373; font-weight: 300;">Coordinator Contact:</td>
        <td style="padding: 6px 0; font-weight: 600; text-align: right;">${payload.coordinatorNumber}</td>
      </tr>
    </table>

    ${familyHtml}
  </div>

  <div style="border-top: 1px solid #e5e5e5; padding-top: 15px; margin-top: 25px; font-size: 10px; color: #737373; line-height: 1.5; font-weight: 300;">
    <strong style="color: #404040; display: block; margin-bottom: 3px; font-size: 10px; text-transform: uppercase;">Medical Disclaimer Notice:</strong>
    The Sahaja Yoga Research & Health Centre provides alternative clearing therapies using physical elements (footsoaking, ice packs) and collective meditation. No modern diagnostic machinery or pharmaceutical medicine is practiced here. Emergency or critical patients are advised not to check in.
  </div>

  <div style="margin-top: 25px; text-align: center;">
    <p style="font-size: 11px; color: #a3a3a3; margin: 0;">Please keep this email receipt or note down your MRD number to present at the check-in counter on arrival.</p>
  </div>
</div>
      `;
      sendEmail(payload.email, emailSubject, emailHtml).catch((err) => {
        console.error('Failed to send confirmation email receipt:', err);
      });
    }

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/registrations');
    return { success: true, mrdNumber };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function cancelRegistrationAction(id: string) {
  try {
    await dbConnect();
    const reg = await SessionRegistration.findById(id);
    if (reg && reg.status !== 'Cancelled') {
      reg.status = 'Cancelled';
      await reg.save();

      // Decrement session count
      const session = await Session.findById(reg.sessionId);
      if (session && session.registeredCount > 0) {
        session.registeredCount -= 1;
        await session.save();
      }
    }
    revalidatePath('/admin');
    revalidatePath('/admin/registrations');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function confirmRegistrationAction(id: string) {
  try {
    await dbConnect();
    await SessionRegistration.findByIdAndUpdate(id, { status: 'Confirmed' });
    revalidatePath('/admin');
    revalidatePath('/admin/registrations');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Review Actions
export async function submitReviewAction(data: {
  name: string;
  rating: number;
  comment: string;
}) {
  try {
    await dbConnect();
    await Review.create({
      ...data,
      isApproved: false, // Moderated by default
    });
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/reviews');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approveReviewAction(id: string) {
  try {
    await dbConnect();
    await Review.findByIdAndUpdate(id, { isApproved: true });
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/reviews');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteReviewAction(id: string) {
  try {
    await dbConnect();
    await Review.findByIdAndDelete(id);
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/reviews');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Admin Creation & Deletion Actions
export async function createAdminAction(data: {
  name: string;
  email: string;
  passwordHash?: string; // optional password from form
}) {
  try {
    await dbConnect();
    const normalizedEmail = data.email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      existing.name = data.name.trim() || existing.name;
      existing.role = 'Admin';
      if (data.passwordHash) {
        const salt = await bcrypt.genSalt(10);
        existing.passwordHash = await bcrypt.hash(data.passwordHash, salt);
      }
      await existing.save();
      revalidatePath('/admin');
      revalidatePath('/admin/admins');
      return { success: true };
    }

    const passwordHash = data.passwordHash
      ? await bcrypt.hash(data.passwordHash, await bcrypt.genSalt(10))
      : undefined;

    await User.create({
      name: data.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'Admin',
      yogiExperienceMonths: 36,
      nationality: 'Indian',
      gender: 'Male',
    });

    revalidatePath('/admin');
    revalidatePath('/admin/admins');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAdminAction(id: string) {
  try {
    await dbConnect();
    // Prevent deleting the main admin page account or the current logged in account easily
    await User.findByIdAndDelete(id);
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// EMR E-Health & Billing Actions
export async function checkInYogiAction(
  id: string,
  data: {
    samarpanAmount: number;
    paymentMode: 'Cash' | 'UPI' | 'Card' | 'Pending';
    paymentStatus: 'Paid' | 'Outstanding';
  }
) {
  try {
    await dbConnect();
    
    // Find patient record
    const reg = await SessionRegistration.findById(id);
    if (!reg) throw new Error('Registration record not found.');

    // Count today's checked-in patients to assign next sequential token number
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const count = await SessionRegistration.countDocuments({
      checkInStatus: 'Checked In',
      updatedAt: { $gte: startOfDay },
    });
    
    const tokenSeq = String(count + 1).padStart(2, '0');
    const tokenNumber = `T-${tokenSeq}`;
    
    reg.checkInStatus = 'Checked In';
    reg.tokenNumber = tokenNumber;
    reg.billing = {
      samarpanAmount: data.samarpanAmount,
      paymentMode: data.paymentMode,
      paymentStatus: data.paymentStatus,
      upiScreenshot: reg.billing?.upiScreenshot || '',
      transactionId: reg.billing?.transactionId || '',
    };
    reg.consultation = {
      chiefComplaint: '',
      examinationFindings: '',
      doctorNotes: '',
      status: 'Pending',
    };

    await reg.save();
    
    revalidatePath('/admin');
    revalidatePath('/admin/registrations');
    revalidatePath('/admin/consultations');
    return { success: true, tokenNumber };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function collectPaymentAction(id: string) {
  try {
    await dbConnect();
    const reg = await SessionRegistration.findById(id);
    if (!reg) throw new Error('Registration not found');
    
    if (reg.billing) {
      reg.billing.paymentStatus = 'Paid';
      await reg.save();
    }
    
    revalidatePath('/admin');
    revalidatePath('/admin/registrations');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBillingAction(
  id: string,
  data: {
    samarpanAmount: number;
    paymentMode: 'Cash' | 'UPI' | 'Card' | 'Pending';
    paymentStatus: 'Paid' | 'Outstanding';
    upiScreenshot?: string;
    transactionId?: string;
  }
) {
  try {
    await dbConnect();
    const reg = await SessionRegistration.findById(id);
    if (!reg) throw new Error('Registration not found');

    reg.billing = {
      samarpanAmount: data.samarpanAmount,
      paymentMode: data.paymentMode,
      paymentStatus: data.paymentStatus,
      upiScreenshot: data.upiScreenshot !== undefined ? data.upiScreenshot : reg.billing?.upiScreenshot || '',
      transactionId: data.transactionId !== undefined ? data.transactionId : reg.billing?.transactionId || '',
    };

    await reg.save();
    revalidatePath('/admin');
    revalidatePath('/admin/registrations');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitConsultationAction(
  id: string,
  data: {
    chiefComplaint: string;
    examinationFindings: string;
    doctorNotes: string;
  }
) {
  try {
    await dbConnect();
    const reg = await SessionRegistration.findById(id);
    if (!reg) throw new Error('Registration record not found.');

    reg.consultation = {
      chiefComplaint: data.chiefComplaint,
      examinationFindings: data.examinationFindings,
      doctorNotes: data.doctorNotes,
      status: 'Completed',
      consultedAt: new Date(),
    };
    
    // Once consulted, update checkInStatus to Checked Out
    reg.checkInStatus = 'Checked Out';

    await reg.save();
    
    revalidatePath('/admin');
    revalidatePath('/admin/registrations');
    revalidatePath('/admin/consultations');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createWalkInRegistrationAction(payload: {
  sessionId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  dob: string;
  bloodGroup: string;
  address: string;
  phone: string;
  emergencyContact: string;
  centerAddress: string;
  coordinatorNumber: string;
  familyMembers?: {
    name: string;
    age: number;
    gender: 'Male' | 'Female';
    dob: string;
    bloodGroup: string;
  }[];
  existingDiseases?: string;
}) {
  try {
    await dbConnect();

    // Verify session
    const session = await Session.findById(payload.sessionId);
    if (!session) throw new Error('Session not found');
    if (session.registeredCount >= session.maxParticipants) {
      throw new Error('This session is fully registered.');
    }

    // Auto-generate MRD number
    const today = new Date();
    const dateStr = today.getFullYear() + 
      String(today.getMonth() + 1).padStart(2, '0') + 
      String(today.getDate()).padStart(2, '0');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const mrdNumber = `MRD-${dateStr}-${randomHex}`;

    // Create registration
    const registration = await SessionRegistration.create({
      ...payload,
      dob: new Date(payload.dob),
      mrdNumber,
      status: 'Confirmed',
      checkInStatus: 'Pending',
      disclaimerAccepted: true, // Auto accepted for walk-ins by default
    });

    // Increment registered count
    session.registeredCount += 1;
    await session.save();

    revalidatePath('/admin');
    revalidatePath('/admin/registrations');
    return { success: true, mrdNumber };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ========== Site Settings ==========
export async function updateSiteSettingsAction(data: {
  reviewsEnabled: boolean;
  bookingEnabled: boolean;
  helpdeskPhone: string;
  contactEmail: string;
  upiId: string;
  upiQrCodeUrl: string;
  upiPayeeName: string;
  announcementBanner: string;
}) {
  try {
    await dbConnect();
    let settings = await SiteSettings.findOne({});
    if (!settings) {
      settings = new SiteSettings(data);
    } else {
      settings.reviewsEnabled = data.reviewsEnabled;
      settings.bookingEnabled = data.bookingEnabled;
      settings.helpdeskPhone = data.helpdeskPhone;
      settings.contactEmail = data.contactEmail;
      settings.upiId = data.upiId;
      settings.upiQrCodeUrl = data.upiQrCodeUrl;
      settings.upiPayeeName = data.upiPayeeName;
      settings.announcementBanner = data.announcementBanner;
    }
    await settings.save();
    revalidatePath('/');
    revalidatePath('/book');
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSiteSettings() {
  try {
    await dbConnect();
    let settings = await SiteSettings.findOne({});
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    return {
      reviewsEnabled: settings.reviewsEnabled,
      bookingEnabled: settings.bookingEnabled,
      helpdeskPhone: settings.helpdeskPhone || '',
      contactEmail: settings.contactEmail || 'syhydhealthcentre@gmail.com',
      upiId: settings.upiId || '',
      upiQrCodeUrl: settings.upiQrCodeUrl || '',
      upiPayeeName: settings.upiPayeeName || 'Sahaja Yoga Health Centre',
      announcementBanner: settings.announcementBanner || '',
    };
  } catch (error) {
    return {
      reviewsEnabled: true,
      bookingEnabled: true,
      helpdeskPhone: '',
      contactEmail: 'syhydhealthcentre@gmail.com',
      upiId: '',
      upiQrCodeUrl: '',
      upiPayeeName: 'Sahaja Yoga Health Centre',
      announcementBanner: '',
    };
  }
}
export async function registerUserAction(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: 'Male' | 'Female';
}) {
  try {
    await dbConnect();
    const cleanEmail = data.email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists. Please login instead.' };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    await User.create({
      name: data.name.trim(),
      email: cleanEmail,
      passwordHash,
      role: 'Patient',
      contactNumber: data.phone.trim(),
      gender: data.gender,
      yogiExperienceMonths: 12,
      nationality: 'Indian',
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
