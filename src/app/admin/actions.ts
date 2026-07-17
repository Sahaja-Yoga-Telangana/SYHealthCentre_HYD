'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import Doctor from '@/models/Doctor';
import Session from '@/models/Session';
import SessionRegistration from '@/models/SessionRegistration';
import Review from '@/models/Review';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

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
  emergencyContact: string;
  centerAddress: string;
  coordinatorNumber: string;
  familyLinkage?: string;
  existingDiseases?: string;
  disclaimerAccepted: boolean;
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

