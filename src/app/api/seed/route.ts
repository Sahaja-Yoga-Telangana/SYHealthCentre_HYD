import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Doctor from '@/models/Doctor';
import Room from '@/models/Room';
import Bed from '@/models/Bed';
import Appointment from '@/models/Appointment';
import StayBooking from '@/models/StayBooking';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();

    // 1. Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Room.deleteMany({});
    await Bed.deleteMany({});
    await Appointment.deleteMany({});
    await StayBooking.deleteMany({});

    // 2. Create default users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

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
        yogiExperienceMonths: 18, // Eligible for IPD (1+ year)
        nationality: 'Indian',
        contactNumber: '+919555555555',
        gender: 'Male',
      },
      {
        name: 'Yogi Sarah Brown',
        email: 'sarah@gmail.com',
        passwordHash,
        role: 'Patient',
        yogiExperienceMonths: 8, // Eligible for OPD/Day Stay (6+ months), NOT IPD (<1 year)
        nationality: 'Non-Indian',
        contactNumber: '+14155552671',
        gender: 'Female',
      },
      {
        name: 'Yogi Jean-Pierre',
        email: 'jp@gmail.com',
        passwordHash,
        role: 'Patient',
        yogiExperienceMonths: 14, // Eligible for IPD (1+ year)
        nationality: 'Non-Indian',
        contactNumber: '+33612345678',
        gender: 'Male',
      },
    ]);

    // 3. Create Doctor entries
    const drSharmaUser = users.find(u => u.email === 'dr.sharma@syhealthcentre.org');
    const drPatelUser = users.find(u => u.email === 'dr.patel@syhealthcentre.org');

    if (drSharmaUser && drPatelUser) {
      await Doctor.insertMany([
        {
          userId: drSharmaUser._id,
          specialty: 'Vibratory Diagnosis & Nadi Clearance',
          availability: [
            { dayOfWeek: 1, startTime: '10:00', endTime: '12:30' }, // Mon
            { dayOfWeek: 2, startTime: '10:00', endTime: '12:30' }, // Tue
            { dayOfWeek: 3, startTime: '10:00', endTime: '12:30' }, // Wed
            { dayOfWeek: 4, startTime: '10:00', endTime: '12:30' }, // Thu
            { dayOfWeek: 5, startTime: '10:00', endTime: '12:30' }, // Fri
            { dayOfWeek: 6, startTime: '10:00', endTime: '12:30' }, // Sat
          ],
          active: true,
        },
        {
          userId: drPatelUser._id,
          specialty: 'Chakra Therapy & Footsoaking Science',
          availability: [
            { dayOfWeek: 1, startTime: '10:00', endTime: '12:30' }, // Mon
            { dayOfWeek: 3, startTime: '10:00', endTime: '12:30' }, // Wed
            { dayOfWeek: 5, startTime: '10:00', endTime: '12:30' }, // Fri
          ],
          active: true,
        },
      ]);
    }

    // 4. Create Rooms
    const createdRooms = await Room.insertMany([
      { roomNumber: '101', category: 'Double', maxOccupancy: 2, totalBeds: 2 },
      { roomNumber: '102', category: 'Double', maxOccupancy: 2, totalBeds: 2 },
      { roomNumber: '103', category: 'Double', maxOccupancy: 1, totalBeds: 1 }, // Single use Double room
      { roomNumber: '201', category: 'Family', maxOccupancy: 4, totalBeds: 4 },
      { roomNumber: '202', category: 'Family', maxOccupancy: 4, totalBeds: 4 },
      { roomNumber: 'Dorm-L', category: 'Ladies Dormitory', maxOccupancy: 36, totalBeds: 36 },
      { roomNumber: 'Dorm-M', category: "Men's Dormitory", maxOccupancy: 25, totalBeds: 25 },
    ]);

    // 5. Create Beds
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

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      counts: {
        users: users.length,
        doctors: 2,
        rooms: createdRooms.length,
        beds: bedsToInsert.length,
      },
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Seeding failed' },
      { status: 500 }
    );
  }
}
