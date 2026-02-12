"use client";

import React, { useState, useEffect } from "react";
import { Star, Loader2, Edit2, UserCircle } from "lucide-react";
import toast from "react-hot-toast";
import { showToast } from "@/utils/Toast";

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Fetching ---
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

    if (lectureId) fetchReviews();
  }, [lectureId]);

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
      toast.error("Please select a rating.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/lecture/${lectureId}/review`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Failed to save review");

      const refreshRes = await fetch(`/api/lecture/${lectureId}/review`);
      const newData = await refreshRes.json();
      setReviews(newData.reviews || []);
      
      showToast.success("Review updated!");
    } catch(err: any){
      showToast.error(err.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  return (
    <div className="py-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-foreground">
      
      {/* 1. Header Stats - Clean Gradient */}
      <section className="bg-foreground/[0.02] dark:bg-white/[0.02] rounded-[2rem] p-8 border border-border-muted flex flex-col items-center shadow-sm">
        <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.2em] mb-3">
          Average Rating
        </span>
        <div className="text-7xl font-black tracking-tighter mb-4">
          {averageRating.toFixed(1)}
        </div>
        <div className="flex gap-2 text-yellow-400 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={24}
              fill={s <= Math.round(averageRating) ? "currentColor" : "none"}
              className="drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]"
            />
          ))}
        </div>
        <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest">
          {reviews.length} learner reviews
        </p>
      </section>

      {/* 2. My Review Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-black tracking-tight px-1">Your Feedback</h3>
        {myReview && !isEditing ? (
          <div className="bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 rounded-[1.5rem] p-6 relative group transition-all hover:bg-purple-500/[0.08]">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-3">
                <div className="flex gap-1 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      fill={s <= myReview.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <p className="text-foreground/80 leading-relaxed font-medium italic pr-8">
                  "{myReview.comment || "No comment left."}"
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2.5 hover:bg-purple-500/10 rounded-xl transition-colors text-purple-600 dark:text-purple-400"
              >
                <Edit2 size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-background border border-border-muted rounded-[2rem] p-6 shadow-xl shadow-black/5 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setRating(s)}
                    className={`p-1 transition-all hover:scale-125 ${
                      rating >= s ? "text-yellow-400" : "text-foreground/10"
                    }`}
                  >
                    <Star
                      size={36}
                      fill={rating >= s ? "currentColor" : "none"}
                      strokeWidth={2.5}
                    />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think of this lecture?"
              className="w-full p-5 text-sm bg-foreground/[0.03] dark:bg-white/5 border border-border-muted rounded-2xl focus:ring-2 focus:ring-purple-500/50 outline-none min-h-[140px] transition-all font-medium placeholder:text-foreground/20"
            />
            <div className="flex justify-end gap-3">
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="px-8 py-3.5 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : myReview ? "Update Review" : "Post Review"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. Community Reviews List */}
      <section className="space-y-6 pt-4">
        <h3 className="text-lg font-black tracking-tight px-1">
          Community Feedback
        </h3>
        {otherReviews.length === 0 ? (
          <div className="text-center py-16 bg-foreground/[0.02] rounded-[2rem] border-2 border-dashed border-border-muted">
            <p className="text-foreground/30 text-xs font-bold uppercase tracking-widest">
              Be the first to review
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {otherReviews.map((rev, idx) => (
              <div
                key={rev.id || idx}
                className="bg-white dark:bg-background border border-border-muted rounded-[1.5rem] p-5 flex gap-5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="shrink-0">
                  {rev.user?.image ? (
                    <img
                      src={rev.user.image}
                      alt={rev.user.name || "User"}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-500/10"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground/20">
                      <UserCircle size={32} />
                    </div>
                  )}
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black tracking-tight truncate">
                      {rev.user?.name || "Anonymous Learner"}
                    </span>
                    <div className="flex gap-0.5 text-yellow-400 shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={10}
                          fill={s <= rev.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/60 leading-relaxed font-medium">
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