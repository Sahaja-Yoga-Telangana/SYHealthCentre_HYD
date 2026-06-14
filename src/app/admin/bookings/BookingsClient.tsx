'use client';

import React, { useState, useTransition } from 'react';
import { 
  checkInStay, 
  checkOutStay, 
  updateStayPayment, 
  updateAppointmentStatus, 
  updateAppointmentPayment 
} from '../actions';

interface BookingsClientProps {
  initialStays: any[];
  initialAppointments: any[];
  availableBeds: any[];
}

export default function BookingsClient({
  initialStays,
  initialAppointments,
  availableBeds,
}: BookingsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedBeds, setSelectedBeds] = useState<{ [stayId: string]: string }>({});

  const handleBedChange = (stayId: string, bedId: string) => {
    setSelectedBeds({ ...selectedBeds, [stayId]: bedId });
  };

  const handleCheckIn = (stayId: string) => {
    const bedId = selectedBeds[stayId];
    if (!bedId) {
      alert('Please select a bed to assign first.');
      return;
    }

    startTransition(async () => {
      const result = await checkInStay(stayId, bedId);
      if (result.success) {
        alert('Patient checked in successfully!');
      } else {
        alert('Check-in failed: ' + result.error);
      }
    });
  };

  const handleCheckOut = (stayId: string) => {
    if (!confirm('Are you sure you want to check out this patient? This will release their bed.')) {
      return;
    }

    startTransition(async () => {
      const result = await checkOutStay(stayId);
      if (result.success) {
        alert('Patient checked out successfully!');
      } else {
        alert('Check-out failed: ' + result.error);
      }
    });
  };

  const handleToggleStayPayment = (stayId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    startTransition(async () => {
      await updateStayPayment(stayId, nextStatus);
    });
  };

  const handleToggleAppointmentPayment = (apptId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    startTransition(async () => {
      await updateAppointmentPayment(apptId, nextStatus);
    });
  };

  const handleStatusChange = (apptId: string, nextStatus: any) => {
    startTransition(async () => {
      await updateAppointmentStatus(apptId, nextStatus);
    });
  };

  return (
    <div className="space-y-12">
      {/* 1. Stay Bookings Section (IPD) */}
      <div className="border border-neutral-200 bg-white p-6 space-y-6">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2">
          IN-PATIENT ADMISSIONS (IPD stays)
        </h3>

        {initialStays.length === 0 ? (
          <p className="text-xs text-neutral-400 font-light py-6 text-center">
            No inpatient stays registered.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Patient Details</th>
                  <th className="pb-3 pr-4">Stay Config</th>
                  <th className="pb-3 pr-4">Duration</th>
                  <th className="pb-3 pr-4">Finances</th>
                  <th className="pb-3 pr-4">Admission Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-600">
                {initialStays.map((stay) => {
                  const patient = stay.patientId;
                  const room = stay.roomId;
                  
                  // Filter beds that are in the exact booked room
                  const eligibleBeds = availableBeds.filter(
                    (bed) => bed.roomId?._id?.toString() === room?._id?.toString()
                  );

                  return (
                    <tr key={stay._id.toString()} className="align-middle">
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-neutral-900">{patient?.name || 'Guest Yogi'}</p>
                        <p className="text-neutral-400 text-[10px]">{patient?.email || 'N/A'}</p>
                        <p className="text-neutral-400 text-[10px]">Contact: {patient?.contactNumber || 'N/A'}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="font-medium text-neutral-800">{room?.category} Room</p>
                        <p className="text-[10px] text-neutral-400">
                          {stay.nationality} &bull; exp: {stay.yogiExperienceMonths}m
                        </p>
                        <p className="text-[10px] text-neutral-400">Sharing Occupants: {stay.sharingOccupants}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="font-medium font-mono text-neutral-800">
                          {new Date(stay.checkInDate).toLocaleDateString()}
                        </p>
                        <p className="text-neutral-400 text-[10px] uppercase font-bold tracking-widest py-0.5">to</p>
                        <p className="font-medium font-mono text-neutral-800">
                          {new Date(stay.checkOutDate).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-4 pr-4 space-y-1">
                        <p className="font-mono font-semibold text-neutral-900">₹{stay.totalAmount}</p>
                        <p className="text-[10px] text-neutral-400">₹{stay.pricePerDay}/day</p>
                        <button
                          onClick={() => handleToggleStayPayment(stay._id.toString(), stay.paymentStatus)}
                          disabled={isPending}
                          className={`px-1.5 py-0.5 border text-[9px] font-bold uppercase tracking-wider ${
                            stay.paymentStatus === 'Paid'
                              ? 'border-neutral-900 bg-neutral-950 text-white'
                              : 'border-neutral-200 text-neutral-500 hover:border-neutral-900'
                          }`}
                        >
                          {stay.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid'}
                        </button>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-0.5 border text-[9px] font-bold tracking-wider uppercase ${
                            stay.status === 'CheckedIn'
                              ? 'border-neutral-900 bg-neutral-900 text-white'
                              : stay.status === 'CheckedOut'
                              ? 'border-neutral-200 text-neutral-400'
                              : stay.status === 'Cancelled'
                              ? 'border-red-200 text-red-500 bg-red-50'
                              : 'border-neutral-300 text-neutral-600 bg-neutral-50'
                          }`}>
                            {stay.status}
                          </span>
                          {stay.status === 'CheckedIn' && stay.bedId && (
                            <p className="text-[10px] text-neutral-500 font-mono">
                              Bed: {stay.bedId.bedNumber?.split(' - ')[1] || stay.bedId.bedNumber || 'Assigned'}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        {stay.status === 'Pending' && (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select
                              value={selectedBeds[stay._id.toString()] || ''}
                              onChange={(e) => handleBedChange(stay._id.toString(), e.target.value)}
                              disabled={isPending}
                              className="border border-neutral-200 p-1 text-[10px] focus:outline-none bg-white font-mono"
                            >
                              <option value="">Select Bed...</option>
                              {eligibleBeds.map((bed) => (
                                <option key={bed._id.toString()} value={bed._id.toString()}>
                                  {bed.roomId?.roomNumber}: {bed.bedNumber.split(' - ')[1] || bed.bedNumber}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleCheckIn(stay._id.toString())}
                              disabled={isPending}
                              className="px-2 py-1 bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 text-[10px] font-bold uppercase tracking-wider"
                            >
                              Check In
                            </button>
                          </div>
                        )}

                        {stay.status === 'CheckedIn' && (
                          <button
                            onClick={() => handleCheckOut(stay._id.toString())}
                            disabled={isPending}
                            className="px-3 py-1.5 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white disabled:opacity-50 text-[10px] font-bold uppercase tracking-wider transition-all"
                          >
                            Check Out
                          </button>
                        )}

                        {(stay.status === 'CheckedOut' || stay.status === 'Cancelled') && (
                          <span className="text-neutral-400 italic">No actions</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Appointments Section (OPD & Day Stay) */}
      <div className="border border-neutral-200 bg-white p-6 space-y-6">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2">
          OUTPATIENT & DAY STAY APPOINTMENTS (OPD / Day Stay)
        </h3>

        {initialAppointments.length === 0 ? (
          <p className="text-xs text-neutral-400 font-light py-6 text-center">
            No consultations or day stays scheduled.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Patient</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Date & Time</th>
                  <th className="pb-3 pr-4">Doctor Assign</th>
                  <th className="pb-3 pr-4">Fees & Payment</th>
                  <th className="pb-3">Status Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-600">
                {initialAppointments.map((appt) => {
                  const patient = appt.patientId;
                  const doc = appt.doctorId;
                  return (
                    <tr key={appt._id.toString()} className="align-middle">
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-neutral-900">{patient?.name || 'Yogi Patient'}</p>
                        <p className="text-neutral-400 text-[10px]">{patient?.email || 'N/A'}</p>
                      </td>
                      <td className="py-4 pr-4 font-semibold text-neutral-800">
                        {appt.type}
                      </td>
                      <td className="py-4 pr-4">
                        <p className="font-medium font-mono text-neutral-800">
                          {new Date(appt.appointmentDate).toLocaleDateString()}
                        </p>
                        <p className="text-neutral-400 text-[10px]">{appt.timeSlot}</p>
                      </td>
                      <td className="py-4 pr-4">
                        {appt.type === 'OPD' ? (
                          <p className="font-medium text-neutral-800">
                            Dr. {doc?.userId?.name || 'Assigned doctor'}
                          </p>
                        ) : (
                          <span className="text-neutral-400 italic">Day stay (no doctor required)</span>
                        )}
                      </td>
                      <td className="py-4 pr-4 space-y-1">
                        <p className="font-mono font-semibold text-neutral-900">₹{appt.price}</p>
                        <button
                          onClick={() => handleToggleAppointmentPayment(appt._id.toString(), appt.paymentStatus)}
                          disabled={isPending}
                          className={`px-1.5 py-0.5 border text-[9px] font-bold uppercase tracking-wider ${
                            appt.paymentStatus === 'Paid'
                              ? 'border-neutral-900 bg-neutral-950 text-white'
                              : 'border-neutral-200 text-neutral-500 hover:border-neutral-900'
                          }`}
                        >
                          {appt.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid'}
                        </button>
                      </td>
                      <td className="py-4">
                        <select
                          value={appt.status}
                          onChange={(e) => handleStatusChange(appt._id.toString(), e.target.value as any)}
                          disabled={isPending}
                          className="border border-neutral-200 p-1 text-[10px] focus:outline-none bg-white"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
