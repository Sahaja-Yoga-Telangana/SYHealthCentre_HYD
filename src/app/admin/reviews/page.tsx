import React from 'react';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import ReviewsClient from './ReviewsClient';

export const revalidate = 0; // Fresh load for reviews list

export default async function ReviewsAdminPage() {
  let reviewsList: any[] = [];

  try {
    await dbConnect();
    const reviews = await Review.find({}).sort({ createdAt: -1 });

    reviewsList = reviews.map((rev) => ({
      id: rev._id.toString(),
      name: rev.name,
      rating: rev.rating,
      comment: rev.comment,
      isApproved: rev.isApproved,
      createdAt: rev.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching reviews in admin:', error);
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-light tracking-wide text-neutral-900">REVIEWS MODERATION</h1>
        <p className="text-xs text-neutral-400 mt-1">Approve testimonials to show them on the public home page, or delete spam/inappropriate content.</p>
      </div>

      <ReviewsClient initialReviews={reviewsList} />
    </div>
  );
}
