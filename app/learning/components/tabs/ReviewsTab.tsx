"use client";

import React, { useState, useEffect } from "react";
import { Star, Loader2, Edit2, UserCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Review {
  id?: string;
  rating: number;
  userId: string;
  user: {
    name: string;
    image?: string | null;
  };
  comment?: string | null;
  createdAt?: Date | string;
}

interface ReviewsTabProps {
  lectureId: string;
  currentUserId: string;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({
  lectureId,
  currentUserId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // --- NEW STATE: Reviews are now internal ---
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. Fetch Reviews on Mount ---
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/lecture/${lectureId}/review`); 
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (lectureId) {
      fetchReviews();
    }
  }, [lectureId]);

  useEffect(() => {
    console.log("Reviews state updated:", reviews);
  }, [reviews]);


  // Identify the user's review and other students' reviews
  const myReview = reviews.find((r) => r.userId === currentUserId);
  const otherReviews = reviews.filter((r) => r.userId !== currentUserId);

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment || "");
      setIsEditing(false);
    } else {
        setRating(0);
        setComment("");
    }
  }, [myReview]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
      : 0;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating before submitting.");
      return;
    }
    setIsSubmitting(true);
    
    const reviewPromise = async () => {
      const response = await fetch(`/api/lecture/${lectureId}/review`, { // Use same endpoint but POST
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save review");
      }

      // Instead of router.refresh(), we manually update local state for instant feedback
      // Or you can re-fetch. Here we re-fetch to be safe.
      const refreshRes = await fetch(`/api/lecture/${lectureId}/review`);
      const newData = await refreshRes.json();
      setReviews(newData.reviews || []);

      return result;
    };

    toast.promise(reviewPromise(), {
      loading: "Saving your review...",
      success: () => {
        setIsSubmitting(false);
        setIsEditing(false);
        return "Review submitted successfully! ⭐";
      },
      error: (err) => {
        setIsSubmitting(false);
        setIsEditing(false);
        return err.message || "Failed to submit review.";
      }
    });
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
    );
  }
  return (
    <div className="py-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Header Stats */}
      <section className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 border border-gray-100 flex flex-col items-center shadow-sm">
        <span className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-2">
          Average Rating
        </span>
        <div className="text-6xl font-black text-gray-900 mb-3">
          {averageRating.toFixed(1)}
        </div>
        <div className="flex gap-1.5 text-yellow-400 mb-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={24}
              fill={s <= Math.round(averageRating) ? "currentColor" : "none"}
              strokeWidth={2}
            />
          ))}
        </div>
        <p className="text-gray-500 font-medium">
          Based on {reviews.length} learner reviews
        </p>
      </section>

      {/* 2. My Review Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 px-1">Your Feedback</h3>
        {myReview && !isEditing ? (
          <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-6 relative group">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      fill={s <= myReview.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed italic">
                  "{myReview.comment || "No comment left."}"
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-purple-100 rounded-full transition-colors text-purple-600"
              >
                <Edit2 size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setRating(s)}
                    className={`p-1 transition-transform hover:scale-125 ${
                      rating >= s ? "text-yellow-400" : "text-gray-200"
                    }`}
                  >
                    <Star
                      size={32}
                      fill={rating >= s ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other students what you thought of this lecture..."
              className="w-full p-4 text-sm bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500 outline-none min-h-[120px] transition-all"
            />
            <div className="flex justify-end gap-3">
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSubmit}
                // 'isSubmitting' is your local useState(false)
                disabled={rating === 0 || isSubmitting}
                className="px-8 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-200 transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : myReview ? (
                  "Update Review"
                ) : (
                  "Post Review"
                )}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. Community Reviews List */}
      <section className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-gray-900 px-1">
          What others are saying
        </h3>
        {otherReviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">
              Be the first to leave a community review!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {otherReviews.map((rev, idx) => (
              <div
                key={rev.id || idx}
                className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="shrink-0">
                  {rev.user?.image ? (
                    <img
                      src={rev.user.image}
                      alt={rev.user.name || "User avatar"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle size={40} className="text-gray-300" />
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">
                      {rev.user?.name || "Anonymous"}
                    </span>
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          fill={s <= rev.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {rev.comment || "Rated this lecture."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
