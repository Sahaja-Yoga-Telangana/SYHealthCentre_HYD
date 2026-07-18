'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import Doctor from '@/models/Doctor';
import Session from '@/models/Session';
import SessionRegistration from '@/models/SessionRegistration';
import Review from '@/models/Review';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/mail';

// Seeding function
export async function seedDatabase() {
  try {
    await dbConnect();

    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Session.deleteMany({});
    await SessionRegistration.deleteMany({});
    await Review.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Create default users
    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@syhealthcentre.org',
        passwordHash,
        role: 'Admin',
        yogiExperienceMonths: 36,
        nationality: 'Indian',
        contactNumber: '+919999999999',
        gender: 'Male',
      },
      {
        name: 'Dr. Ramesh Sharma',
        email: 'dr.sharma@syhealthcentre.org',
        passwordHash,
        role: 'Doctor',
        yogiExperienceMonths: 120,
        nationality: 'Indian',
        contactNumber: '+919888888888',
        gender: 'Male',
      },
      {
        name: 'Dr. Jyoti Patel',
        email: 'dr.patel@syhealthcentre.org',
        passwordHash,
        role: 'Doctor',
        yogiExperienceMonths: 96,
        nationality: 'Indian',
        contactNumber: '+919777777777',
        gender: 'Female',
      },
      {
        name: 'Receptionist Lakshmi',
        email: 'receptionist@syhealthcentre.org',
        passwordHash,
        role: 'Receptionist',
        yogiExperienceMonths: 24,
        nationality: 'Indian',
        contactNumber: '+919666666666',
        gender: 'Female',
      },
      {
        name: 'Yogi Suresh Kumar',
        email: 'suresh@gmail.com',
        passwordHash,
        role: 'Patient',
        yogiExperienceMonths: 18,
        nationality: 'Indian',
        contactNumber: '+919555555555',
        gender: 'Male',
      },
      {
        name: 'Yogi Sarah Brown',
        email: 'sarah@gmail.com',
        passwordHash,
        role: 'Patient',
        yogiExperienceMonths: 8,
        nationality: 'Non-Indian',
        contactNumber: '+14155552671',
        gender: 'Female',
      },
      {
        name: 'Yogi Jean-Pierre',
        email: 'jp@gmail.com',
        passwordHash,
        role: 'Patient',
        yogiExperienceMonths: 14,
        nationality: 'Non-Indian',
        contactNumber: '+33612345678',
        gender: 'Male',
      },
    ]);

    // Doctors mapping
    const drSharmaUser = users.find(u => u.email === 'dr.sharma@syhealthcentre.org');
    const drPatelUser = users.find(u => u.email === 'dr.patel@syhealthcentre.org');

    if (drSharmaUser && drPatelUser) {
      await Doctor.insertMany([
        {
          userId: drSharmaUser._id,
          specialty: 'Vibratory Diagnosis & Nadi Clearance',
          availability: [
            { dayOfWeek: 1, startTime: '10:00', endTime: '12:30' },
            { dayOfWeek: 2, startTime: '10:00', endTime: '12:30' },
            { dayOfWeek: 3, startTime: '10:00', endTime: '12:30' },
            { dayOfWeek: 4, startTime: '10:00', endTime: '12:30' },
            { dayOfWeek: 5, startTime: '10:00', endTime: '12:30' },
            { dayOfWeek: 6, startTime: '10:00', endTime: '12:30' },
          ],
          active: true,
        },
        {
          userId: drPatelUser._id,
          specialty: 'Chakra Therapy & Footsoaking Science',
          availability: [
            { dayOfWeek: 1, startTime: '10:00', endTime: '12:30' },
            { dayOfWeek: 3, startTime: '10:00', endTime: '12:30' },
            { dayOfWeek: 5, startTime: '10:00', endTime: '12:30' },
          ],
          active: true,
        },
      ]);
    }

    // Seed Sessions
    const sessions = await Session.insertMany([
      {
        title: 'Collective Meditation & Nadi Clearance',
        description: 'A collective clearing and balancing session using vibratory diagnostic methods under doctor guidance.',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days later
        time: '10:00 AM - 11:30 AM',
        instructor: 'Dr. Ramesh Sharma',
        maxParticipants: 50,
        registeredCount: 2,
        isActive: true,
      },
      {
        title: 'Footsoaking Science & Chakra Balancing Workshop',
        description: 'Understand the elements and how footsoaking clears the subtle system channels (Ida and Pingla Nadis).',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
        time: '05:00 PM - 06:30 PM',
        instructor: 'Dr. Jyoti Patel',
        maxParticipants: 40,
        registeredCount: 1,
        isActive: true,
      },
      {
        title: 'Introduction to Thoughtless Awareness',
        description: 'Free public meditation program for absolute beginners and new seekers of truth.',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        time: '11:00 AM - 12:30 PM',
        instructor: 'Sahaja Yoga Hyderabad Team',
        maxParticipants: 100,
        registeredCount: 0,
        isActive: true,
      },
    ]);

    // Seed Reviews
    await Review.insertMany([
      {
        name: 'Suresh Kumar',
        rating: 5,
        comment: 'A heavenly sanctuary. The vibratory diagnostics helped me clear my Agnya chakra completely.',
        isApproved: true,
      },
      {
        name: 'Sarah Brown',
        rating: 5,
        comment: 'I felt deep silence and thoughtless awareness during my first footsoak session here.',
        isApproved: true,
      },
      {
        name: 'Jean-Pierre',
        rating: 4,
        comment: 'Very peaceful atmosphere, perfect for balancing the left side channels.',
        isApproved: false, // Pending moderation
      },
    ]);

    // Seed Registrations
    await SessionRegistration.insertMany([
      {
        sessionId: sessions[0]._id,
        mrdNumber: 'MRD-20260717-001',
        name: 'Yogi Suresh Kumar',
        age: 32,
        gender: 'Male',
        dob: new Date('1994-05-15'),
        bloodGroup: 'O+',
        address: 'Secunderabad, Hyderabad, India',
        phone: '+919555555555',
        emergencyContact: 'Vijay Kumar (+919555555556)',
        centerAddress: 'Secunderabad Sahaja Yoga Center',
        coordinatorNumber: '+919988776655',
        familyLinkage: 'Vijay Kumar (Brother)',
        existingDiseases: 'Migraine on right side',
        disclaimerAccepted: true,
        status: 'Confirmed',
      },
      {
        sessionId: sessions[0]._id,
        mrdNumber: 'MRD-20260717-002',
        name: 'Yogi Sarah Brown',
        age: 28,
        gender: 'Female',
        dob: new Date('1998-09-20'),
        bloodGroup: 'A-',
        address: 'San Francisco, CA, USA',
        phone: '+14155552671',
        emergencyContact: 'John Brown (+14155552672)',
        centerAddress: 'San Francisco Center',
        coordinatorNumber: '+14155550000',
        familyLinkage: '',
        existingDiseases: 'Anxiety issues',
        disclaimerAccepted: true,
        status: 'Confirmed',
      },
      {
        sessionId: sessions[1]._id,
        mrdNumber: 'MRD-20260717-003',
        name: 'Yogi Jean-Pierre',
        age: 45,
        gender: 'Male',
        dob: new Date('1981-12-05'),
        bloodGroup: 'B+',
        address: 'Paris, France',
        phone: '+33612345678',
        emergencyContact: 'Marie Pierre (+33612345679)',
        centerAddress: 'Paris Center',
        coordinatorNumber: '+33600000000',
        familyLinkage: '',
        existingDiseases: '',
        disclaimerAccepted: true,
        status: 'Pending',
      },
    ]);

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/sessions');
    revalidatePath('/admin/registrations');
    revalidatePath('/admin/reviews');
    return { success: true };
  } catch (error: any) {
    console.error('Seeding Action failed:', error);
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

// Session Actions
export async function createSessionAction(data: {
  title: string;
  description: string;
  date: string;
  time: string;
  instructor: string;
  maxParticipants: number;
}) {
  try {
    await dbConnect();
    await Session.create({
      ...data,
      date: new Date(data.date),
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
  sessionId: string;
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

    // Verify session
    const session = await Session.findById(payload.sessionId);
    if (!session) throw new Error('Session not found');
    if (!session.isActive) throw new Error('Session is no longer active');
    if (session.registeredCount >= session.maxParticipants) {
      throw new Error('This session is fully registered.');
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
      const stayDays = Math.round(computedAmount / (500 * totalPeople));

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
        <td style="padding: 6px 0; color: #737373; font-weight: 300;">Stay Date Slot:</td>
        <td style="padding: 6px 0; font-weight: 600; text-align: right;">${session.title}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f5f5f5;">
        <td style="padding: 6px 0; color: #737373; font-weight: 300;">Consulting Time:</td>
        <td style="padding: 6px 0; font-weight: 600; text-align: right;">${session.time}</td>
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
  passwordHash: string; // password from form
}) {
  try {
    await dbConnect();
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new Error('Email already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.passwordHash, salt);

    await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: 'Admin',
      yogiExperienceMonths: 36,
      nationality: 'Indian',
      gender: 'Male',
    });

    revalidatePath('/admin');
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


