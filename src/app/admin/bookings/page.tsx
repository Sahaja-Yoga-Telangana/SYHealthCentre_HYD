import React from 'react';
import dbConnect from '@/lib/db';
import StayBooking from '@/models/StayBooking';
import Appointment from '@/models/Appointment';
import Bed from '@/models/Bed';
import Room from '@/models/Room'; // Required to populate Room relation
import User from '@/models/User'; // Required to populate User relation
import Doctor from '@/models/Doctor'; // Required to populate Doctor relation
import BookingsClient from './BookingsClient';

export const revalidate = 0; // Disable cache for live admission flow updates

// Utility to serialize Mongoose documents into plain JSON-safe objects.
// Mongoose docs contain ObjectId, Date, and internal getters that are
// not serializable by React Server Components when passed as client props.
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export default async function AdminBookingsPage() {
  let stays: any[] = [];
  let appointments: any[] = [];
  let availableBeds: any[] = [];
  let errorMsg = '';

  try {
    await dbConnect();

    // Fetch stays
    stays = await StayBooking.find({})
      .populate('patientId', 'name email contactNumber')
      .populate('roomId', 'roomNumber category')
      .populate('bedId', 'bedNumber')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch appointments
    appointments = await Appointment.find({})
      .populate('patientId', 'name email contactNumber')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' }
      })
      .sort({ appointmentDate: -1 })
      .lean();

    // Fetch available beds
    availableBeds = await Bed.find({ occupied: false })
      .populate('roomId', 'roomNumber category')
      .sort({ bedNumber: 1 })
      .lean();

  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    errorMsg = error.message || 'Failed to fetch bookings from the database.';
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-100 pb-4">
        <h1 className="text-2xl font-light tracking-wide text-neutral-900">BOOKING & ADMISSION RECORDS</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Perform patient check-ins, select Bed numbers, process check-outs, and toggle payment clearances.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-neutral-100 text-neutral-900 border border-neutral-300 text-xs font-mono">
          SYSTEM ERROR: {errorMsg}
        </div>
      )}

      <BookingsClient 
        initialStays={serialize(stays)} 
        initialAppointments={serialize(appointments)} 
        availableBeds={serialize(availableBeds)} 
      />
    </div>
  );
}

