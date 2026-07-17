import React from 'react';
import dbConnect from '@/lib/db';
import Doctor from '@/models/Doctor';
import Session from '@/models/Session';
import SessionRegistration from '@/models/SessionRegistration';
import Review from '@/models/Review';
import User from '@/models/User';
import SeedButton from './SeedButton';
import Link from 'next/link';

export const revalidate = 0; // Disable caching to ensure real-time data

export default async function AdminDashboard() {
  let isDbEmpty = false;
  let metrics = {
    totalDoctors: 0,
    activeSessions: 0,
    totalRegistrations: 0,
    pendingReviews: 0,
  };

  let recentRegistrations: any[] = [];
  let pendingReviewsList: any[] = [];

  try {
    await dbConnect();

    // Check if database needs seeding
    const userCount = await User.countDocuments({});
    if (userCount === 0) {
      isDbEmpty = true;
    } else {
      metrics.totalDoctors = await Doctor.countDocuments({ active: true });
      metrics.activeSessions = await Session.countDocuments({ isActive: true });
      metrics.totalRegistrations = await SessionRegistration.countDocuments({});
      metrics.pendingReviews = await Review.countDocuments({ isApproved: false });

      // Fetch recent registrations
      recentRegistrations = await SessionRegistration.find({})
        .populate('sessionId', 'title date')
        .sort({ createdAt: -1 })
        .limit(5);

      // Fetch pending reviews
      pendingReviewsList = await Review.find({ isApproved: false })
        .sort({ createdAt: -1 })
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
          The database appears to be empty. Please seed the database with sample sessions, registrations, reviews, doctors, and users to view the dashboard functionality.
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
          <p className="text-xs text-neutral-400 mt-1">Real-time registrations, upcoming sessions, and review moderation metrics.</p>
        </div>
        <SeedButton />
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="border border-neutral-200 p-6 bg-white space-y-2">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest block">Active Sessions</span>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-mono font-medium">{metrics.activeSessions}</span>
            <span className="text-xs text-neutral-500 font-light">Meditation & Workshops</span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-2">Currently scheduled</p>
        </div>

        <div className="border border-neutral-200 p-6 bg-white space-y-2">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest block">Total Registrations</span>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-mono font-medium">{metrics.totalRegistrations}</span>
            <span className="text-xs text-neutral-500 font-light">Seekers registered</span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-2">Across all scheduled sessions</p>
        </div>

        <div className="border border-neutral-200 p-6 bg-white space-y-2">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest block">Pending Reviews</span>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-mono font-medium text-amber-600">{metrics.pendingReviews}</span>
            <span className="text-xs text-neutral-500 font-light">Awaiting moderation</span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-2">Submitted by public seekers</p>
        </div>

        <div className="border border-neutral-200 p-6 bg-white space-y-2">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest block">Active Doctors</span>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-mono font-medium">{metrics.totalDoctors}</span>
            <span className="text-xs text-neutral-500 font-light font-mono">Verified Instructors</span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-2">Conducting clearing sessions</p>
        </div>
      </div>

      {/* Main Content Split Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Session Registrations */}
        <div className="border border-neutral-200 p-6 bg-white space-y-6">
          <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800">Recent Registrations</h3>
            <Link 
              href="/admin/registrations"
              className="text-[9px] border hover:border-neutral-900 px-2 py-0.5 text-neutral-500 font-semibold tracking-wider uppercase"
            >
              View All
            </Link>
          </div>

          {recentRegistrations.length === 0 ? (
            <p className="text-xs text-neutral-400 font-light py-4 text-center">No registrations logged.</p>
          ) : (
            <div className="divide-y divide-neutral-100 text-xs">
              {recentRegistrations.map((reg) => {
                return (
                  <div key={reg._id.toString()} className="py-3 flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="font-semibold text-neutral-900">{reg.name}</p>
                      <p className="text-neutral-500 font-light">
                        {reg.sessionId?.title || 'Unknown Session'} &bull; {reg.mrdNumber}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className={`inline-block px-2 py-0.5 border text-[9px] font-bold tracking-wider uppercase ${
                        reg.status === 'Confirmed' 
                          ? 'border-neutral-900 bg-neutral-900 text-white' 
                          : reg.status === 'Pending'
                          ? 'border-neutral-300 text-neutral-600 bg-neutral-50'
                          : 'border-red-200 text-red-600 bg-red-50'
                      }`}>
                        {reg.status}
                      </span>
                      <p className="text-neutral-400 font-mono text-[9px]">
                        {reg.sessionId?.date ? new Date(reg.sessionId.date).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Reviews Moderation */}
        <div className="border border-neutral-200 p-6 bg-white space-y-6">
          <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800">Pending Reviews</h3>
            <Link
              href="/admin/reviews"
              className="text-[9px] border hover:border-neutral-900 px-2 py-0.5 text-neutral-500 font-semibold tracking-wider uppercase"
            >
              Moderate
            </Link>
          </div>

          {pendingReviewsList.length === 0 ? (
            <p className="text-xs text-neutral-400 font-light py-4 text-center">No reviews pending moderation.</p>
          ) : (
            <div className="divide-y divide-neutral-100 text-xs">
              {pendingReviewsList.map((review) => {
                return (
                  <div key={review._id.toString()} className="py-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-neutral-900">{review.name}</span>
                      <span className="text-amber-500 font-mono">{'★'.repeat(review.rating)}</span>
                    </div>
                    <p className="text-neutral-500 font-light leading-relaxed italic">
                      &quot;{review.comment.length > 80 ? review.comment.slice(0, 80) + '...' : review.comment}&quot;
                    </p>
                    <div className="text-[9px] text-neutral-400 font-mono flex justify-between">
                      <span>Submitted: {new Date(review.createdAt).toLocaleDateString()}</span>
                      <Link href="/admin/reviews" className="text-neutral-900 font-bold hover:underline">MODERATE →</Link>
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
