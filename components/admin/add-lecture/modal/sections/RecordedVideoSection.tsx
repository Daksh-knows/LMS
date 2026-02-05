import React from "react";
import { Link2, UploadCloud, Loader2, Clock } from "lucide-react";

interface RecordedVideoSectionProps {
  videoMode: "URL" | "UPLOAD";
  setVideoMode: (mode: "URL" | "UPLOAD") => void;
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  duration: string;
  setDuration: (duration: string) => void;
  isUploading: boolean;
  uploadProgress: number;
  videoFileName: string;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RecordedVideoSection: React.FC<RecordedVideoSectionProps> = ({
  videoMode,
  setVideoMode,
  videoUrl,
  setVideoUrl,
  duration,
  setDuration,
  isUploading,
  uploadProgress,
  videoFileName,
  onFileSelect,
}) => {
  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {[
          { id: "URL", label: "Embed URL", icon: Link2, desc: "YouTube, Vimeo" },
          { id: "UPLOAD", label: "Direct Upload", icon: UploadCloud, desc: "MP4, MOV, WebM" },
        ].map(({ id, label, icon: Icon, desc }) => (
          <button
            key={id}
            type="button"
            onClick={() => setVideoMode(id as "URL" | "UPLOAD")}
            className={`flex-1 p-4 rounded-2xl border text-left transition-all hover:shadow-md ${
              videoMode === id
                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <Icon
              size={24}
              className={videoMode === id ? "text-blue-600" : "text-gray-400"}
            />
            <p className="font-bold text-sm mt-2">{label}</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
              {desc}
            </p>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {videoMode === "URL" ? (
          <div className="relative group">
            <input
              required
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste video URL here..."
              className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <Link2
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500"
              size={18}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Upload Area */}
            <label
              className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                isUploading
                  ? "bg-gray-50 border-gray-300"
                  : "border-gray-200 hover:bg-gray-50 hover:border-blue-300"
              }`}
            >
              {isUploading ? (
                <Loader2 size={32} className="text-blue-500 animate-spin mb-2" />
              ) : (
                <UploadCloud size={32} className="text-gray-400 mb-2" />
              )}

              <span className="text-sm font-bold text-gray-600 text-center">
                {isUploading
                  ? "Uploading in background..."
                  : videoFileName || "Select Video File"}
              </span>

              {!isUploading && (
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={onFileSelect}
                />
              )}
            </label>

            {/* Progress Bar */}
            {(isUploading || (videoUrl && !videoUrl.includes("http") && videoMode === "UPLOAD")) && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>{isUploading ? "Uploading..." : "Upload Complete"}</span>
                  <span>{isUploading ? `${uploadProgress}%` : "100%"}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isUploading ? "bg-blue-500" : "bg-green-500"
                    }`}
                    style={{ width: isUploading ? `${uploadProgress}%` : "100%" }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Duration Input */}
        <div className="relative group">
          <input
            required
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration (min)"
            className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <Clock
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500"
            size={18}
          />
        </div>
      </div>
    </div>
  );
};