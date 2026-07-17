'use client';

import React, { useState, useTransition } from 'react';
import { approveReviewAction, deleteReviewAction } from '../actions';

interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

interface ReviewsClientProps {
  initialReviews: ReviewItem[];
}

export default function ReviewsClient({ initialReviews }: ReviewsClientProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isPending, startTransition] = useTransition();

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const res = await approveReviewAction(id);
      if (res.success) {
        setReviews((prev) =>
          prev.map((rev) => (rev.id === id ? { ...rev, isApproved: true } : rev))
        );
      } else {
        alert(res.error || 'Failed to approve review');
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    startTransition(async () => {
      const res = await deleteReviewAction(id);
      if (res.success) {
        setReviews((prev) => prev.filter((rev) => rev.id !== id));
      } else {
        alert(res.error || 'Failed to delete review');
      }
    });
  };

  // Group into pending and approved
  const pendingReviews = reviews.filter((r) => !r.isApproved);
  const approvedReviews = reviews.filter((r) => r.isApproved);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Pending Reviews Moderation */}
      <div className="border border-neutral-200 bg-white p-6 space-y-6">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2 flex justify-between items-center">
          <span>Pending Moderation</span>
          <span className="text-[10px] bg-amber-50 border border-amber-200 px-2 py-0.5 text-amber-700 font-bold font-mono">
            {pendingReviews.length} Reviews
          </span>
        </h3>

        {pendingReviews.length === 0 ? (
          <p className="text-xs text-neutral-400 font-light py-8 text-center border border-dashed border-neutral-200">
            No reviews pending moderation.
          </p>
        ) : (
          <div className="space-y-4">
            {pendingReviews.map((review) => (
              <div key={review.id} className="border border-neutral-200 p-4 bg-neutral-50/50 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-neutral-900">{review.name}</span>
                  <span className="text-amber-500 font-mono">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                <p className="text-xs text-neutral-600 font-light italic leading-relaxed">
                  &quot;{review.comment}&quot;
                </p>
                <div className="text-[9px] text-neutral-400 font-mono flex justify-between items-center pt-2 border-t border-neutral-100">
                  <span>Submitted: {new Date(review.createdAt).toLocaleDateString()}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={isPending}
                      className="text-[9px] font-bold text-neutral-900 hover:underline tracking-wider uppercase disabled:text-neutral-300"
                    >
                      APPROVE ✓
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={isPending}
                      className="text-[9px] font-bold text-red-500 hover:underline tracking-wider uppercase disabled:text-neutral-300"
                    >
                      DELETE ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Reviews List */}
      <div className="border border-neutral-200 bg-white p-6 space-y-6">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2 flex justify-between items-center">
          <span>Approved Testimonials</span>
          <span className="text-[10px] bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-neutral-600 font-bold font-mono">
            {approvedReviews.length} Active
          </span>
        </h3>

        {approvedReviews.length === 0 ? (
          <p className="text-xs text-neutral-400 font-light py-8 text-center border border-dashed border-neutral-200">
            No approved reviews live on the home page yet.
          </p>
        ) : (
          <div className="space-y-4">
            {approvedReviews.map((review) => (
              <div key={review.id} className="border border-neutral-200 p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-neutral-900">{review.name}</span>
                  <span className="text-amber-500 font-mono">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                <p className="text-xs text-neutral-600 font-light italic leading-relaxed">
                  &quot;{review.comment}&quot;
                </p>
                <div className="text-[9px] text-neutral-400 font-mono flex justify-between items-center pt-2 border-t border-neutral-100">
                  <span>Approved: {new Date(review.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={isPending}
                    className="text-[9px] font-bold text-red-500 hover:underline tracking-wider uppercase"
                  >
                    DELETE FROM SITE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
