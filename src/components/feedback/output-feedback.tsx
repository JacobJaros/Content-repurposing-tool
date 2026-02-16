"use client";

import { useState } from "react";

type FeedbackState = {
  rating: string | null;
  comment: string | null;
};

type OutputFeedbackProps = {
  outputId: string;
  initialFeedback?: FeedbackState;
};

export function OutputFeedback({ outputId, initialFeedback }: OutputFeedbackProps) {
  const [rating, setRating] = useState<string | null>(initialFeedback?.rating ?? null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState(initialFeedback?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleRate = async (newRating: string) => {
    if (newRating === rating) {
      // Deselect — delete feedback
      const prevRating = rating;
      setRating(null);
      setShowComment(false);
      setComment("");
      try {
        await fetch("/api/feedback", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ outputId }),
        });
      } catch {
        setRating(prevRating);
      }
      return;
    }

    // Optimistic update
    setRating(newRating);

    if (newRating === "THUMBS_DOWN") {
      setShowComment(true);
    } else {
      setShowComment(false);
      setComment("");
    }

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outputId, rating: newRating }),
      });
    } catch {
      setRating(null);
    }
  };

  const handleSubmitComment = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outputId, rating: "THUMBS_DOWN", comment }),
      });
      setShowComment(false);
    } catch {
      // Keep comment visible for retry
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 mr-1">Rate this output:</span>
        <button
          onClick={() => handleRate("THUMBS_UP")}
          className={`rounded-lg p-1.5 transition-colors duration-200 ${
            rating === "THUMBS_UP"
              ? "bg-green-100 text-green-600"
              : "text-gray-400 hover:text-green-500 hover:bg-green-50"
          }`}
          aria-label="Thumbs up"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
          </svg>
        </button>
        <button
          onClick={() => handleRate("THUMBS_DOWN")}
          className={`rounded-lg p-1.5 transition-colors duration-200 ${
            rating === "THUMBS_DOWN"
              ? "bg-red-100 text-red-600"
              : "text-gray-400 hover:text-red-500 hover:bg-red-50"
          }`}
          aria-label="Thumbs down"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 2h3a2 2 0 012 2v7a2 2 0 01-2 2h-3" />
          </svg>
        </button>
      </div>

      {showComment && (
        <div className="mt-2 flex gap-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What could be improved?"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            rows={2}
          />
          <button
            onClick={handleSubmitComment}
            disabled={submitting || !comment.trim()}
            className="self-end rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "..." : "Submit"}
          </button>
        </div>
      )}
    </div>
  );
}
