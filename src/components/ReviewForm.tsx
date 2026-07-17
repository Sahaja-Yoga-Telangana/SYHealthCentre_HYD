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
    <form onSubmit={handleSubmit} className="border border-neutral-200 bg-white p-6 space-y-4 max-w-xl mx-auto">
      <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-800 border-b border-neutral-100 pb-2">
        Share Your Experience
      </h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-mono">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-neutral-900 border border-neutral-900 text-white text-xs font-mono text-center">
          Thank you! Your review has been submitted and is pending moderation.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
            placeholder="e.g. Rahul Sharma"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
            Rating
          </label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            disabled={isPending}
            className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
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
        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
          Review / Experience
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isPending}
          rows={4}
          className="w-full text-xs p-2 border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-neutral-50"
          placeholder="Describe your spiritual state, vibrations felt, or general experience..."
          required
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full text-[10px] font-bold tracking-widest uppercase py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:bg-neutral-300"
      >
        {isPending ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
      </button>
    </form>
  );
}
