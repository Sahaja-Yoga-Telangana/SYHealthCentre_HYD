'use client';

import React, { useState, useTransition } from 'react';
import { submitReviewAction } from '@/app/admin/actions';

export default function ReviewForm() {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name.trim() || !comment.trim()) {
      setError('Please fill in both name and review comment.');
      return;
    }

    startTransition(async () => {
      const res = await submitReviewAction({ name, rating, comment });
      if (res.success) {
        setSuccess(true);
        setName('');
        setComment('');
        setRating(5);
      } else {
        setError(res.error || 'Failed to submit review. Please try again.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border border-warm-gray bg-white p-6 sm:p-8 space-y-4 max-w-xl mx-auto rounded-2xl shadow-sm">
      <h3 className="text-sm font-semibold tracking-wider uppercase text-teal-dark border-b border-warm-gray pb-2">
        Share Your Experience
      </h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-mono rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-teal text-white text-xs font-mono text-center rounded-md">
          Thank you! Your experience has been submitted and is pending admin review.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/50 font-semibold mb-1">
            Your Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            className="w-full text-xs p-2.5 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/50 font-semibold mb-1">
            Rating *
          </label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            disabled={isPending}
            className="w-full text-xs p-2.5 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md"
          >
            <option value="5">5 Stars (Excellent)</option>
            <option value="4">4 Stars (Good)</option>
            <option value="3">3 Stars (Average)</option>
            <option value="2">2 Stars (Fair)</option>
            <option value="1">1 Star (Poor)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-widest text-warm-charcoal/50 font-semibold mb-1">
          Review / Experience *
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isPending}
          rows={4}
          className="w-full text-xs p-2.5 border border-warm-gray focus:border-saffron focus:outline-none bg-cream rounded-md"
          required
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full text-[10px] font-bold tracking-widest uppercase py-3 bg-saffron text-white hover:bg-saffron-dark transition-colors rounded-md shadow-sm disabled:bg-warm-gray"
      >
        {isPending ? 'SUBMITTING...' : 'SUBMIT EXPERIENCE'}
      </button>
    </form>
  );
}
