"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Star, Loader2, Edit2, UserCircle } from "lucide-react";
import toast from "react-hot-toast";
import { showToast } from "@/utils/Toast";
import Dropdown from "@/components/ui/Dropdown";

interface Review {
  id?: string;
  rating: number;
  userId: string;
  user: {
    name: string;
    image?: string | null;
  };
  comment?: string | null;
  createdAt?: Date | string | undefined;
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

  // --- NEW STATE: Reviews are now internal ---
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortFilter, setSortFilter] = useState<string>("recent");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortOptions = [
    { value: "recent", label: "Most Recent" },
    { value: "highest", label: "Highest Rated" },
    { value: "lowest", label: "Lowest Rated" },
  ];

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
  
  
  const sortedOtherReviews = useMemo(() => {
    // 1. Filter out the current user's review first
    const others = reviews.filter((r) => r.userId !== currentUserId);

    // 2. Sort the remaining list based on the active filter
    return [...others].sort((a, b) => {
      if (sortFilter === "highest") {
        return b.rating - a.rating; // Descending
      }
      if (sortFilter === "lowest") {
        return a.rating - b.rating; // Ascending
      }
      // Default: "recent" - Newest dates first
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    });
  }, [reviews, sortFilter, currentUserId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      showToast.error("Please select a rating before submitting.");
      return;
    }
    setIsSubmitting(true);
    
    const reviewPromise = async () => {
      const response = await fetch(`/api/lecture/${lectureId}/review`, { 
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

    try{
      toast.loading("Saving your review...");
      await reviewPromise();
      toast.dismiss();
      showToast.success("Review submitted successfully!");
    }catch(err: any){
      toast.dismiss();
      showToast.error(err.message || "Failed to submit review.");
      
    }finally{
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
    );
  }
  return(
    <div className="py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[332fr_376fr] gap-[52px] max-w-[760px]">
        
        {/* ========================================== */}
        {/* LEFT COLUMN: Stats & Input Form */}
        {/* ========================================== */}
        <div className="space-y-4">
          
          {/* 1. Overall Stats Card */}
          <div className="bg-(--rev-overall-bg) border border-(--rev-overall-border) rounded-2xl p-5 sm:p-6 flex flex-col theme-transition shadow-sm">
            <div className="flex items-end justify-between w-full mb-2">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black text-(--text-color) leading-none">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-(--text-color) opacity-60 font-bold">
                  /5.0
                </span>
              </div>
              <span className="text-xs sm:text-sm text-(--text-color) opacity-60 font-medium pb-1">
                {reviews.length} Total Reviews
              </span>
            </div>
            
            <div className="flex gap-1 text-(--colored-text)">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={20}
                  fill={s <= Math.round(averageRating) ? "currentColor" : "none"}
                  color="currentColor"
                  strokeWidth={2}
                />
              ))}
            </div>
          </div>

          {/* 2. Add / Edit Review Card */}
          <div className="bg-(--rev-form-bg) border border-(--rev-overall-border) rounded-2xl p-5 sm:p-6 shadow-sm theme-transition">
            <h3 className="text-center text-base sm:text-lg font-bold text-(--text-color) mb-4">
              Share Your Learning Experience
            </h3>

            {myReview && !isEditing ? (
              // View My Existing Review State
              <div className="space-y-4">
                <div className="flex justify-center text-(--colored-text) gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={24}
                      fill={s <= myReview.rating ? "currentColor" : "none"}
                      color="currentColor"
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <div className="bg-(--rev-input-bg) border border-(--rev-input-border) rounded-xl p-4 relative group">
                  <p className="text-(--text-color) opacity-80 text-sm leading-relaxed italic">
                    "{myReview.comment || "No comment left."}"
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-3 right-3 p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors text-(--text-color) opacity-50 hover:opacity-100"
                    title="Edit Review"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              // Form Input State
              <div className="space-y-5">
                {/* Interactive Stars */}
                <div className="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRating(s)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        size={28}
                        fill={rating >= s ? "var(--colored-text)" : "none"}
                        color="var(--colored-text)"
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe your learning journey, the curriculum depth & what you enjoyed..."
                  className="w-full p-4 text-sm bg-(--rev-input-bg) border border-(--rev-input-border) text-(--text-color) placeholder:text-(--text-color) placeholder:opacity-50 rounded-xl focus:ring-1 focus:ring-(--colored-text) outline-none min-h-[120px] transition-colors resize-none theme-transition"
                />

                <div className="flex gap-3">
                  {isEditing && (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-3 text-sm font-bold text-(--text-color) opacity-60 hover:opacity-100 transition-opacity"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || isSubmitting}
                    className="flex-1 py-3 bg-(--colored-text) text-black rounded-xl font-bold text-sm hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
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
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: Reviews List */}
        {/* ========================================== */}
        <div className="flex flex-col h-full">
          
          {/* Header & Filter */}
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xl sm:text-2xl font-bold text-(--text-color) tracking-tight">
              Latest Reviews
            </h3>
            <Dropdown 
              options={sortOptions}
              selectedValue={sortFilter}
              onSelect={(val) => setSortFilter(val)}
            />
          </div>

          {/* Scrollable Reviews List */}
          <div className="space-y-4 overflow-y-auto review-scrollbar pr-2 max-h-[600px] lg:max-h-[calc(100vh-200px)]">
            {sortedOtherReviews.length === 0 ? (
              <div className="text-center py-16 bg-transparent border border-dashed border-(--rev-overall-border) rounded-2xl">
                <p className="text-(--text-color) opacity-50 text-sm font-medium">
                  No reviews yet. Be the first to share your thoughts!
                </p>
              </div>
            ) : (
              sortedOtherReviews.map((rev: any, idx: number) => (
                <div
                  key={rev.id || idx}
                  className="bg-(--rev-card-bg) border border-(--rev-overall-border) rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow theme-transition"
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className="shrink-0">
                      {rev.user?.image ? (
                        <img
                          src={rev.user.image}
                          alt={rev.user.name || "User"}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-sm border border-(--rev-overall-border)"
                        />
                      ) : (
                        <UserCircle size={48} className="text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-(--text-color) leading-tight">
                            {rev.user?.name || "Anonymous"}
                          </h4>
                          <span className="text-[11px] sm:text-xs text-(--text-color) opacity-50 font-medium">
                            {/* Assuming you have a formatted date, fallback to standard text */}
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "2 months ago"}
                          </span>
                        </div>
                        
                        {/* Review Stars */}
                        <div className="flex gap-0.5 text-(--colored-text)">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              fill={s <= rev.rating ? "currentColor" : "none"}
                              color="currentColor"
                              strokeWidth={2}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-(--text-color) opacity-80 leading-relaxed italic mb-4">
                    "{rev.comment || "Rated this lecture."}"
                  </p>

                  {/* Actions footer (Helpful / Reply placeholders) */}
                  {/* <div className="flex items-center gap-5 pt-4 border-t border-(--text-color) border-opacity-10">
                    <button className="flex items-center gap-1.5 text-xs font-bold text-(--text-color) opacity-60 hover:opacity-100 transition-opacity">
                      <ThumbsUp size={14} /> Helpful (0)
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-(--text-color) opacity-60 hover:opacity-100 transition-opacity">
                      <CornerUpLeft size={14} /> Reply
                    </button>
                  </div> */}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}