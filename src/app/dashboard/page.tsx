import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import SessionRegistration from '@/models/SessionRegistration';
import User from '@/models/User';
import Link from 'next/link';

export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const user = session.user;

  // If Admin, redirect to Admin Portal
  if (user.role === 'Admin') {
    redirect('/admin');
  }

  let userBookings: any[] = [];
  let userProfile: any = null;

  try {
    await dbConnect();
    userProfile = await User.findById(user.id);

    // Search registrations by email or phone number
    const queryConditions: any[] = [];
    if (user.email) queryConditions.push({ email: user.email.toLowerCase() });
    if (userProfile?.contactNumber) queryConditions.push({ phone: userProfile.contactNumber });

    if (queryConditions.length > 0) {
      userBookings = await SessionRegistration.find({
        $or: queryConditions,
      })
        .populate('sessionId')
        .sort({ createdAt: -1 });
    }
  } catch (error) {
    console.error('Error fetching user dashboard data:', error);
  }

  return (
    <div className="min-h-screen bg-cream text-warm-charcoal font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-warm-gray p-6 rounded-2xl shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-saffron">Seeker Portal</span>
            <h1 className="text-2xl font-light text-teal-dark mt-0.5">
              Welcome, <span className="font-semibold">{user.name}</span>
            </h1>
            <p className="text-xs text-warm-charcoal/50 font-mono mt-1">
              {user.email} &bull; Role: {user.role}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/book"
              className="text-xs font-bold uppercase tracking-wider px-4 py-2.5 bg-saffron text-white hover:bg-saffron-dark transition-colors rounded-md shadow-sm"
            >
              + Book New Session
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-wider px-4 py-2.5 border border-warm-gray hover:border-saffron transition-colors rounded-md"
            >
              Home
            </Link>
          </div>
        </div>

        {/* User Bookings & Past Records */}
        <div className="bg-white border border-warm-gray rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-warm-gray pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-teal-dark">My Sessions & Booking Records</h2>
              <p className="text-xs text-warm-charcoal/50 font-light">View your upcoming and past health session appointments and consultation notes.</p>
            </div>
            <span className="text-xs font-mono bg-cream px-3 py-1 border border-warm-gray rounded-full font-semibold text-teal">
              {userBookings.length} Record(s)
            </span>
          </div>

          {userBookings.length > 0 ? (
            <div className="space-y-4">
              {userBookings.map((reg) => {
                const sessionObj = reg.sessionId;
                return (
                  <div key={reg._id.toString()} className="border border-warm-gray bg-cream rounded-xl p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-warm-gray/60 pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-saffron uppercase tracking-wider block">
                          Patient MRD: {reg.mrdNumber}
                        </span>
                        <h3 className="text-base font-semibold text-teal-dark">
                          {sessionObj?.title || 'Sahaja Yoga Health Session'}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          reg.status === 'Confirmed' ? 'bg-sage/10 text-sage border border-sage/30' : 'bg-warm-gray text-warm-charcoal'
                        }`}>
                          {reg.status}
                        </span>
                        {reg.tokenNumber && (
                          <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-teal text-white rounded-full">
                            Token: {reg.tokenNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-warm-charcoal/70">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-warm-charcoal/40 font-bold block">Stay Dates</span>
                        <span>{reg.checkInDate ? new Date(reg.checkInDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-warm-charcoal/40 font-bold block">Seekers</span>
                        <span>{1 + (reg.familyMembers?.length || 0)} Person(s)</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-warm-charcoal/40 font-bold block">Samarpan Fee</span>
                        <span>₹{reg.billing?.samarpanAmount || 0} ({reg.billing?.paymentStatus || 'Pending'})</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-warm-charcoal/40 font-bold block">Check-in Status</span>
                        <span>{reg.checkInStatus || 'Pending'}</span>
                      </div>
                    </div>

                    {/* Doctor Suggestions / Consultation Notes */}
                    {reg.consultation?.status === 'Completed' && (
                      <div className="pt-3 border-t border-warm-gray/60 space-y-1.5 bg-white p-3.5 rounded-lg border">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal block">
                          Doctor Consultation & Clearing Advice:
                        </span>
                        {reg.consultation.chiefComplaint && (
                          <p className="text-xs text-warm-charcoal/80"><strong className="font-semibold">Chief Complaint:</strong> {reg.consultation.chiefComplaint}</p>
                        )}
                        {reg.consultation.doctorNotes && (
                          <p className="text-xs text-warm-charcoal/80"><strong className="font-semibold">Doctor Guidelines:</strong> {reg.consultation.doctorNotes}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-cream rounded-xl border border-warm-gray space-y-3">
              <p className="text-sm text-warm-charcoal/50 font-light">No session booking records found for your account.</p>
              <Link
                href="/book"
                className="inline-block text-xs font-bold uppercase tracking-wider px-5 py-2.5 bg-saffron text-white rounded-md hover:bg-saffron-dark transition-colors"
              >
                Register for an Upcoming Session
              </Link>
            </div>
          )}
        </div>

        {/* Doctor Suggestions & General Vibratory Clearing Protocols */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-warm-gray rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="border-b border-warm-gray pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-saffron">Sahaja Clearance Protocol</span>
              <h3 className="text-base font-semibold text-teal-dark mt-0.5">Daily Vibratory Clearance Guidelines</h3>
            </div>
            <ul className="space-y-3 text-xs text-warm-charcoal/70 leading-relaxed font-light">
              <li className="flex items-start gap-2">
                <span className="text-saffron font-bold">•</span>
                <span><strong className="font-semibold text-warm-charcoal">Footsoaking Routine:</strong> Footsoak daily in warm salt water for 10-15 minutes before evening meditation to clear the Nadis (Left & Right channels).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-saffron font-bold">•</span>
                <span><strong className="font-semibold text-warm-charcoal">Ice Pack Treatment:</strong> Apply an ice pack to the Right Swadhisthan and Liver area to cool down right-channel overheating and mental tension.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-saffron font-bold">•</span>
                <span><strong className="font-semibold text-warm-charcoal">Three-Channel Balancing:</strong> Use left hand towards Shri Mataji's photo and right hand to Mother Earth for Left Channel clearance.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-warm-gray rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="border-b border-warm-gray pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-sage">Centre Guidelines</span>
              <h3 className="text-base font-semibold text-teal-dark mt-0.5">Health Centre Code of Conduct</h3>
            </div>
            <ul className="space-y-3 text-xs text-warm-charcoal/70 leading-relaxed font-light">
              <li className="flex items-start gap-2">
                <span className="text-sage font-bold">•</span>
                <span>Present your Patient MRD Number at the reception counter upon arrival to receive your daily OPD doctor token.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sage font-bold">•</span>
                <span>Maintain thoughtless awareness and silence inside the meditation hall during collective clearing sessions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sage font-bold">•</span>
                <span>Follow the recommended simple diet and footsoak schedule provided by the consulting physicians.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
