import React from 'react';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';
import Bed from '@/models/Bed';
import Doctor from '@/models/Doctor';
import Appointment from '@/models/Appointment';
import StayBooking from '@/models/StayBooking';
import User from '@/models/User';
import SeedButton from './SeedButton';

export const revalidate = 0; // Disable caching for admin dashboard to ensure real-time data

export default async function AdminDashboard() {
  let isDbEmpty = false;
  let metrics = {
    totalDoctors: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    activeStays: 0,
    opdToday: 0,
    dayStaysToday: 0,
  };

  let recentStays: any[] = [];
  let recentAppointments: any[] = [];

  try {
    await dbConnect();

    // Check if database needs seeding
    const userCount = await User.countDocuments({});
    if (userCount === 0) {
      isDbEmpty = true;
    } else {
      metrics.totalDoctors = await Doctor.countDocuments({ active: true });
      metrics.totalBeds = await Bed.countDocuments({});
      metrics.occupiedBeds = await Bed.countDocuments({ occupied: true });
      metrics.activeStays = await StayBooking.countDocuments({ status: 'CheckedIn' });
      metrics.opdToday = await Appointment.countDocuments({ type: 'OPD' });
      metrics.dayStaysToday = await Appointment.countDocuments({ type: 'Day Stay' });

      // Fetch recent stay bookings
      recentStays = await StayBooking.find({})
        .populate('patientId', 'name email nationality contactNumber')
        .populate('roomId', 'roomNumber category')
        .sort({ createdAt: -1 })
        .limit(5);

      // Fetch recent appointments
      recentAppointments = await Appointment.find({})
        .populate('patientId', 'name email')
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name' }
        })
        .sort({ appointmentDate: -1 })
        .limit(5);
    }
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
  }

  if (isDbEmpty) {
    return (
      <div className="border border-neutral-200 p-8 space-y-6 text-center bg-white">
        <h2 className="text-xl font-medium tracking-wide">Welcome to Sahaja Yoga Health Centre Admin Portal</h2>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          The database appears to be empty. Please seed the database with sample rooms, beds, doctors, and users to view the dashboard functionality.
        </p>
        <div className="pt-2">
          <SeedButton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b border-neutral-100 pb-4">
        <div>
          <h1 className="text-2xl font-light tracking-wide text-neutral-900">DASHBOARD OVERVIEW</h1>
          <p className="text-xs text-neutral-400 mt-1">Real-time occupancy, appointment registrations, and operational metrics.</p>
        </div>
        <SeedButton />
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="border border-neutral-200 p-6 bg-white space-y-2">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest block">Bed Occupancy</span>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-mono font-medium">{metrics.occupiedBeds}</span>
            <span className="text-xs text-neutral-400">of {metrics.totalBeds} beds</span>
          </div>
          <div className="w-full bg-neutral-100 h-1 mt-2">
            <div 
              className="bg-neutral-900 h-1" 
              style={{ width: `${metrics.totalBeds > 0 ? (metrics.occupiedBeds / metrics.totalBeds) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="border border-neutral-200 p-6 bg-white space-y-2">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest block">Active IPD Stays</span>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-mono font-medium">{metrics.activeStays}</span>
            <span className="text-xs text-neutral-500 font-light">Inpatients checked in</span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-2">Occupying dormitory & rooms</p>
        </div>

        <div className="border border-neutral-200 p-6 bg-white space-y-2">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest block">OPD Appointments</span>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-mono font-medium">{metrics.opdToday}</span>
            <span className="text-xs text-neutral-500 font-light">Total registered</span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-2">Outpatient doctor consultations</p>
        </div>

        <div className="border border-neutral-200 p-6 bg-white space-y-2">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest block">Day Stays</span>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-mono font-medium">{metrics.dayStaysToday}</span>
            <span className="text-xs text-neutral-500 font-light">Today</span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-2">Day-long treatment & meals</p>
        </div>
      </div>

      {/* Main Content Split Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent IPD Stays */}
        <div className="border border-neutral-200 p-6 bg-white space-y-6">
          <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800">Recent Stay Bookings</h3>
            <span className="text-[10px] bg-neutral-100 px-2 py-0.5 border text-neutral-500 font-semibold tracking-wider uppercase">IPD Admissions</span>
          </div>

          {recentStays.length === 0 ? (
            <p className="text-xs text-neutral-400 font-light py-4 text-center">No active stays registered.</p>
          ) : (
            <div className="divide-y divide-neutral-100 text-xs">
              {recentStays.map((stay) => {
                const patient = stay.patientId;
                const room = stay.roomId;
                return (
                  <div key={stay._id.toString()} className="py-3 flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="font-semibold text-neutral-900">{patient?.name || 'Unknown Patient'}</p>
                      <p className="text-neutral-500 font-light">
                        Room {room?.roomNumber} ({room?.category}) &bull; {stay.nationality}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className={`inline-block px-2 py-0.5 border text-[9px] font-bold tracking-wider uppercase ${
                        stay.status === 'CheckedIn' 
                          ? 'border-neutral-900 bg-neutral-900 text-white' 
                          : stay.status === 'Pending'
                          ? 'border-neutral-300 text-neutral-600 bg-neutral-50'
                          : 'border-neutral-200 text-neutral-400'
                      }`}>
                        {stay.status}
                      </span>
                      <p className="text-neutral-400 font-mono text-[10px]">
                        {new Date(stay.checkInDate).toLocaleDateString()} - {new Date(stay.checkOutDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Appointments */}
        <div className="border border-neutral-200 p-6 bg-white space-y-6">
          <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800">Recent Consultations</h3>
            <span className="text-[10px] bg-neutral-100 px-2 py-0.5 border text-neutral-500 font-semibold tracking-wider uppercase">OPD / Day Stay</span>
          </div>

          {recentAppointments.length === 0 ? (
            <p className="text-xs text-neutral-400 font-light py-4 text-center">No appointments registered.</p>
          ) : (
            <div className="divide-y divide-neutral-100 text-xs">
              {recentAppointments.map((appt) => {
                const patient = appt.patientId;
                const doc = appt.doctorId;
                return (
                  <div key={appt._id.toString()} className="py-3 flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="font-semibold text-neutral-900">{patient?.name || 'Unknown Patient'}</p>
                      <p className="text-neutral-500 font-light">
                        {appt.type} &bull; {doc ? `Dr. ${doc.userId?.name || 'Sharma'}` : 'Day Stay (Meals)'}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className={`inline-block px-2 py-0.5 border text-[9px] font-bold tracking-wider uppercase ${
                        appt.status === 'Confirmed' 
                          ? 'border-neutral-900 bg-neutral-900 text-white' 
                          : appt.status === 'Pending'
                          ? 'border-neutral-300 text-neutral-600 bg-neutral-50'
                          : 'border-neutral-200 text-neutral-400'
                      }`}>
                        {appt.status}
                      </span>
                      <p className="text-neutral-400 font-mono text-[10px]">
                        {new Date(appt.appointmentDate).toLocaleDateString()} &bull; {appt.timeSlot}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
