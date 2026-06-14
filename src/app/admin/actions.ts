'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import Doctor, { type IAvailabilitySchedule } from '@/models/Doctor';
import Room from '@/models/Room';
import Bed from '@/models/Bed';
import Appointment from '@/models/Appointment';
import StayBooking from '@/models/StayBooking';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import {
  DAY_STAY_PRICE,
  DAY_STAY_TIME_LABEL,
  OPD_PRICE,
  OPD_TIME_SLOTS,
  calculateStayDays,
  calculateStayPricing,
  isOperationalDay,
  resolveMaxOccupancy,
  validateRoomConfig,
  type RoomCategory,
} from '@/lib/healthCentre';

// Seeding function
export async function seedDatabase() {
  try {
    await dbConnect();

    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Room.deleteMany({});
    await Bed.deleteMany({});
    await Appointment.deleteMany({});
    await StayBooking.deleteMany({});

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

    // Rooms mapping
    const createdRooms = await Room.insertMany([
      { roomNumber: '101', category: 'Double', maxOccupancy: 2, totalBeds: 2 },
      { roomNumber: '102', category: 'Double', maxOccupancy: 2, totalBeds: 2 },
      { roomNumber: '103', category: 'Double', maxOccupancy: 1, totalBeds: 1 },
      { roomNumber: '201', category: 'Family', maxOccupancy: 4, totalBeds: 4 },
      { roomNumber: '202', category: 'Family', maxOccupancy: 4, totalBeds: 4 },
      { roomNumber: 'Dorm-L', category: 'Ladies Dormitory', maxOccupancy: 36, totalBeds: 36 },
      { roomNumber: 'Dorm-M', category: "Men's Dormitory", maxOccupancy: 25, totalBeds: 25 },
    ]);

    // Beds mapping
    const bedsToInsert = [];
    for (const room of createdRooms) {
      if (room.category === 'Double' || room.category === 'Family') {
        const letters = ['A', 'B', 'C', 'D'];
        for (let i = 0; i < room.totalBeds; i++) {
          bedsToInsert.push({
            bedNumber: `Room ${room.roomNumber} - Bed ${letters[i]}`,
            roomId: room._id,
            occupied: false,
            occupiedBy: null,
            currentBookingId: null,
          });
        }
      } else if (room.category === 'Ladies Dormitory') {
        for (let i = 1; i <= 36; i++) {
          bedsToInsert.push({
            bedNumber: `Ladies Dorm - Bed ${i}`,
            roomId: room._id,
            occupied: false,
            occupiedBy: null,
            currentBookingId: null,
          });
        }
      } else if (room.category === "Men's Dormitory") {
        for (let i = 1; i <= 25; i++) {
          bedsToInsert.push({
            bedNumber: `Men's Dorm - Bed ${i}`,
            roomId: room._id,
            occupied: false,
            occupiedBy: null,
            currentBookingId: null,
          });
        }
      }
    }
    await Bed.insertMany(bedsToInsert);

    // Create a mock stay booking so dashboard has entries
    const sureshUser = users.find(u => u.email === 'suresh@gmail.com');
    const doubleRoom1 = createdRooms.find(r => r.roomNumber === '101');
    const bedA = await Bed.findOne({ bedNumber: 'Room 101 - Bed A' });

    if (sureshUser && doubleRoom1 && bedA) {
      const stay = await StayBooking.create({
        patientId: sureshUser._id,
        roomId: doubleRoom1._id,
        bedId: bedA._id,
        checkInDate: new Date(),
        checkOutDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days stay
        status: 'CheckedIn',
        pricePerDay: 1800,
        totalAmount: 9000,
        yogiExperienceMonths: sureshUser.yogiExperienceMonths,
        nationality: sureshUser.nationality,
        sharingOccupants: 2,
        paymentStatus: 'Paid',
      });

      bedA.occupied = true;
      bedA.occupiedBy = sureshUser._id;
      bedA.currentBookingId = stay._id;
      await bedA.save();
    }

    revalidatePath('/admin');
    revalidatePath('/admin/rooms');
    revalidatePath('/admin/bookings');
    return { success: true };
  } catch (error: any) {
    console.error('Seeding Action failed:', error);
    return { success: false, error: error.message };
  }
}

// Update Appointment Status
export async function updateAppointmentStatus(id: string, status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled') {
  await dbConnect();
  await Appointment.findByIdAndUpdate(id, { status });
  revalidatePath('/admin');
  revalidatePath('/admin/bookings');
}

// Update Appointment Payment Status
export async function updateAppointmentPayment(id: string, paymentStatus: 'Pending' | 'Paid') {
  await dbConnect();
  await Appointment.findByIdAndUpdate(id, { paymentStatus });
  revalidatePath('/admin');
  revalidatePath('/admin/bookings');
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

    // Create availability slots
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

// Check-In Stay Booking (assigning bed)
export async function checkInStay(bookingId: string, bedId: string) {
  try {
    await dbConnect();

    const booking = await StayBooking.findById(bookingId);
    if (!booking) throw new Error('Stay booking not found');

    const bed = await Bed.findById(bedId);
    if (!bed) throw new Error('Bed not found');
    if (bed.occupied) throw new Error('Bed is already occupied');
    if (bed.roomId.toString() !== booking.roomId.toString()) {
      throw new Error('Selected bed does not belong to the booked room.');
    }

    // Update bed
    bed.occupied = true;
    bed.occupiedBy = booking.patientId;
    bed.currentBookingId = booking._id;
    await bed.save();

    // Update booking
    booking.status = 'CheckedIn';
    booking.bedId = bed._id;
    await booking.save();

    revalidatePath('/admin');
    revalidatePath('/admin/rooms');
    revalidatePath('/admin/bookings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Check-Out Stay Booking
export async function checkOutStay(bookingId: string) {
  try {
    await dbConnect();

    const booking = await StayBooking.findById(bookingId);
    if (!booking) throw new Error('Stay booking not found');

    if (booking.bedId) {
      const bed = await Bed.findById(booking.bedId);
      if (bed) {
        bed.occupied = false;
        bed.occupiedBy = null;
        bed.currentBookingId = null;
        await bed.save();
      }
    }

    booking.status = 'CheckedOut';
    await booking.save();

    revalidatePath('/admin');
    revalidatePath('/admin/rooms');
    revalidatePath('/admin/bookings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Update Stay Booking Payment Status
export async function updateStayPayment(bookingId: string, paymentStatus: 'Pending' | 'Paid') {
  await dbConnect();
  await StayBooking.findByIdAndUpdate(bookingId, { paymentStatus });
  revalidatePath('/admin');
  revalidatePath('/admin/bookings');
}

// Add Room & Beds
export async function addRoom(
  roomNumber: string,
  category: RoomCategory,
  totalBeds: number
) {
  try {
    await dbConnect();

    const normalizedRoomNumber = roomNumber.trim();
    if (!normalizedRoomNumber) {
      throw new Error('Room number is required.');
    }

    if (!validateRoomConfig(category, totalBeds)) {
      throw new Error(`Invalid bed capacity for ${category}.`);
    }

    // Check if room number already exists
    const existing = await Room.findOne({ roomNumber: normalizedRoomNumber });
    if (existing) {
      throw new Error('Room number already exists');
    }

    const room = await Room.create({
      roomNumber: normalizedRoomNumber,
      category,
      maxOccupancy: resolveMaxOccupancy(category, totalBeds),
      totalBeds,
    });

    // Create Beds
    const beds = [];
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    for (let i = 0; i < totalBeds; i++) {
      let bedNumber = '';
      if (category === 'Double' || category === 'Family') {
        bedNumber = `Room ${roomNumber} - Bed ${letters[i] || i + 1}`;
      } else if (category === 'Ladies Dormitory') {
        bedNumber = `Ladies Dorm ${roomNumber} - Bed ${i + 1}`;
      } else {
        bedNumber = `Men's Dorm ${roomNumber} - Bed ${i + 1}`;
      }

      beds.push({
        bedNumber,
        roomId: room._id,
        occupied: false,
        occupiedBy: null,
        currentBookingId: null,
      });
    }

    await Bed.insertMany(beds);
    revalidatePath('/admin/rooms');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Create Patient Booking (handles patient user lookup/creation and booking registration)
export async function createBookingAction(data: {
  name: string;
  email: string;
  contactNumber: string;
  gender: 'Male' | 'Female';
  nationality: 'Indian' | 'Non-Indian';
  yogiExperienceMonths: number;
  bookingType: 'OPD' | 'Day Stay' | 'IPD';
  details: {
    doctorId?: string;
    appointmentDate?: string;
    timeSlot?: string;
    checkInDate?: string;
    checkOutDate?: string;
    roomCategory?: RoomCategory;
    sharingOccupants?: number;
    pricePerDay?: number;
    totalAmount?: number;
  };
}) {
  try {
    await dbConnect();

    // 1. Find or create patient user
    let user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('password123', salt);
      user = await User.create({
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: 'Patient',
        yogiExperienceMonths: data.yogiExperienceMonths,
        nationality: data.nationality,
        contactNumber: data.contactNumber,
        gender: data.gender,
      });
    } else {
      // Update experience and details
      user.yogiExperienceMonths = data.yogiExperienceMonths;
      user.nationality = data.nationality;
      user.contactNumber = data.contactNumber;
      user.gender = data.gender;
      await user.save();
    }

    // 2. Perform Eligibility Check
    if (data.bookingType === 'OPD' || data.bookingType === 'Day Stay') {
      if (data.yogiExperienceMonths < 6) {
        throw new Error('OPD and Day Stay require at least 6 months of Sahaja Yoga practice.');
      }
    } else if (data.bookingType === 'IPD') {
      if (data.yogiExperienceMonths < 12) {
        throw new Error('IPD Stay Accommodation requires at least 12 months (1 year) of Sahaja Yoga practice.');
      }
    }

    // 3. Create Bookings
    if (data.bookingType === 'OPD') {
      if (!data.details.doctorId || !data.details.appointmentDate || !data.details.timeSlot) {
        throw new Error('Missing OPD appointment details.');
      }

      if (!OPD_TIME_SLOTS.includes(data.details.timeSlot as (typeof OPD_TIME_SLOTS)[number])) {
        throw new Error('Invalid OPD time slot selected.');
      }

      const appointmentDate = new Date(data.details.appointmentDate);
      if (!isOperationalDay(appointmentDate)) {
        throw new Error('OPD bookings are available Monday through Saturday only.');
      }

      const doctor = await Doctor.findOne({ _id: data.details.doctorId, active: true });
      if (!doctor) {
        throw new Error('Selected doctor is not available.');
      }

      const appointmentDay = appointmentDate.getUTCDay();
      const matchingAvailability = doctor.availability.find(
        (slot: IAvailabilitySchedule) =>
          slot.dayOfWeek === appointmentDay &&
          slot.startTime <= data.details.timeSlot!.slice(0, 5) &&
          slot.endTime >= data.details.timeSlot!.slice(-5)
      );

      if (!matchingAvailability) {
        throw new Error('Selected doctor is not available for that date or slot.');
      }

      const existingAppointment = await Appointment.findOne({
        doctorId: data.details.doctorId,
        type: 'OPD',
        appointmentDate,
        timeSlot: data.details.timeSlot,
        status: { $in: ['Pending', 'Confirmed'] },
      });

      if (existingAppointment) {
        throw new Error('That OPD slot is already booked. Please choose another time.');
      }

      await Appointment.create({
        patientId: user._id,
        doctorId: data.details.doctorId,
        type: 'OPD',
        appointmentDate,
        timeSlot: data.details.timeSlot,
        status: 'Pending',
        paymentStatus: 'Pending',
        price: OPD_PRICE,
      });
    } else if (data.bookingType === 'Day Stay') {
      if (!data.details.appointmentDate) {
        throw new Error('Missing Day Stay date.');
      }

      const appointmentDate = new Date(data.details.appointmentDate);
      if (!isOperationalDay(appointmentDate)) {
        throw new Error('Day Stay bookings are available Monday through Saturday only.');
      }

      const existingDayStay = await Appointment.findOne({
        patientId: user._id,
        type: 'Day Stay',
        appointmentDate,
        status: { $in: ['Pending', 'Confirmed'] },
      });

      if (existingDayStay) {
        throw new Error('A Day Stay is already booked for this patient on that date.');
      }

      await Appointment.create({
        patientId: user._id,
        doctorId: null,
        type: 'Day Stay',
        appointmentDate,
        timeSlot: DAY_STAY_TIME_LABEL,
        status: 'Pending',
        paymentStatus: 'Pending',
        price: DAY_STAY_PRICE,
      });
    } else if (data.bookingType === 'IPD') {
      if (!data.details.checkInDate || !data.details.checkOutDate || !data.details.roomCategory) {
        throw new Error('Missing IPD stay details.');
      }

      const stayDays = calculateStayDays(data.details.checkInDate, data.details.checkOutDate);
      if (stayDays < 1) {
        throw new Error('Check-out date must be after check-in date.');
      }

      if (
        data.gender === 'Male' &&
        data.details.roomCategory === 'Ladies Dormitory'
      ) {
        throw new Error('Male patients cannot be assigned to the ladies dormitory.');
      }

      if (
        data.gender === 'Female' &&
        data.details.roomCategory === "Men's Dormitory"
      ) {
        throw new Error("Female patients cannot be assigned to the men's dormitory.");
      }

      const sharingOccupants = data.details.sharingOccupants || 1;
      const pricing = calculateStayPricing({
        nationality: data.nationality,
        roomCategory: data.details.roomCategory,
        sharingOccupants,
        stayDays,
      });

      const room = await Room.findOne({
        category: data.details.roomCategory,
        totalBeds: { $gte: data.details.roomCategory === 'Family' ? sharingOccupants : 1 },
      }).sort({ totalBeds: 1, roomNumber: 1 });

      if (!room) {
        throw new Error(`No rooms of category ${data.details.roomCategory} found at the health centre.`);
      }

      await StayBooking.create({
        patientId: user._id,
        roomId: room._id,
        bedId: null, // assigned by receptionist at check-in
        checkInDate: new Date(data.details.checkInDate),
        checkOutDate: new Date(data.details.checkOutDate),
        status: 'Pending',
        pricePerDay: pricing.pricePerDay,
        totalAmount: pricing.totalAmount,
        yogiExperienceMonths: data.yogiExperienceMonths,
        nationality: data.nationality,
        sharingOccupants,
        paymentStatus: 'Pending',
      });
    }

    revalidatePath('/admin');
    revalidatePath('/admin/bookings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
