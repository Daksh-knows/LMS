"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Video, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminVideoPlayer from "@/components/lecture/AdminVideoPlayer";

export default function LectureQuestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  const [lectureId, setLectureId] = useState<string>("");
  const [lecture, setLecture] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [seekTo, setSeekTo] = useState<string | null>(null);

  const handleSeekComplete = () => setSeekTo(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setLectureId(resolvedParams.id);
      fetchLecture(resolvedParams.id);
    });
  }, [params]);

  const fetchLecture = async (id: string) => {
    try {
      setIsLoading(true);
      console.log("Lecture ID " , id) ;
      const res = await fetch(`/api/admin/lecture/${id}`);
      if (!res.ok) throw new Error("Failed to fetch lecture");
      const data = await res.json();
      console.log("Fetched lecture ",lecture) ;
      setLecture(data);
    } catch (error) {
      console.error("Error loading lecture:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading video player...</p>
        </div>
      </div>
    );
  }
  console.log("LEcture " , lecture) ;
  if (!lecture || lecture.type !== "VIDEO") {
    return (
      <div className="p-8 max-w-md mx-auto text-center mt-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Lecture Type</h1>
        <p className="text-gray-500 mb-6">This separate player page is only for video lectures.</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 block leading-none mb-1">Lecture Video workspace</span>
              <h1 className="text-lg font-bold text-gray-900 leading-none truncate max-w-lg">{lecture.title}</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Video className="text-blue-600" size={20} />
            <h2 className="font-bold text-gray-900 text-base">Video Player</h2>
          </div>

          <div>
            {lecture.videoUrl ? (
              <AdminVideoPlayer
                videoUrl={lecture.videoUrl}
                lectureId={lecture.id}
                seekTo={seekTo}
                onSeekComplete={handleSeekComplete}
              />
            ) : (
              <div className="bg-black rounded-2xl overflow-hidden shadow-lg aspect-video relative flex flex-col items-center justify-center h-full text-white bg-gray-950">
                <Video size={48} className="text-gray-600 mb-2" />
                <p className="text-gray-400">No video URL found for this lecture</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
