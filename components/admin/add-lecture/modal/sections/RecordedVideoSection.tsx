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
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Mode Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {[
          { id: "URL", label: "Embed URL", icon: Link2, desc: "YouTube, Vimeo" },
          { id: "UPLOAD", label: "Direct Upload", icon: UploadCloud, desc: "MP4, MOV, WebM" },
        ].map(({ id, label, icon: Icon, desc }) => {
          const isActive = videoMode === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setVideoMode(id as "URL" | "UPLOAD")}
              className="flex-1 p-4 rounded-2xl border text-left transition-all duration-300 hover:shadow-md group"
              style={{ 
                backgroundColor: isActive ? 'var(--color-brand-muted)' : 'var(--color-card)',
                borderColor: isActive ? 'var(--color-brand-blue)' : 'var(--color-border-muted)'
              }}
            >
              <Icon
                size={24}
                className="transition-colors duration-300"
                style={{ 
                  color: isActive ? 'var(--color-brand-blue)' : 'var(--color-foreground)',
                  opacity: isActive ? 1 : 0.4
                }}
              />
              <p 
                className="font-bold text-sm mt-2 transition-colors"
                style={{ color: isActive ? 'var(--color-brand-blue)' : 'var(--color-foreground)' }}
              >
                {label}
              </p>
              <p 
                className="text-[10px] uppercase font-bold tracking-tighter"
                style={{ color: 'var(--color-foreground)', opacity: 0.5 }}
              >
                {desc}
              </p>
            </button>
          );
        })}
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
              className="input-field !pl-10 !py-3"
            />
            <div 
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-focus-within:!text-[var(--color-brand-blue)]"
              style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
            >
              <Link2 size={18} />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Upload Area */}
            <label
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group"
              style={{ 
                backgroundColor: isUploading ? 'var(--color-card-muted)' : 'var(--color-input-bg)',
                borderColor: isUploading ? 'var(--color-border)' : 'var(--color-border-muted)'
              }}
              onMouseEnter={(e) => {
                if (!isUploading) e.currentTarget.style.borderColor = 'var(--color-brand-blue)';
              }}
              onMouseLeave={(e) => {
                if (!isUploading) e.currentTarget.style.borderColor = 'var(--color-border-muted)';
              }}
            >
              {isUploading ? (
                <Loader2 size={32} className="animate-spin mb-3" style={{ color: 'var(--color-brand-blue)' }} />
              ) : (
                <UploadCloud 
                  size={32} 
                  className="mb-3 transition-colors duration-300 group-hover:!text-[var(--color-brand-blue)]" 
                  style={{ color: 'var(--color-foreground)', opacity: 0.3 }} 
                />
              )}

              <span 
                className="text-sm font-bold text-center transition-colors"
                style={{ color: 'var(--color-foreground)', opacity: 0.8 }}
              >
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
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs font-bold" style={{ color: 'var(--color-foreground)', opacity: 0.6 }}>
                  <span>{isUploading ? "Uploading..." : "Upload Complete"}</span>
                  <span>{isUploading ? `${uploadProgress}%` : "100%"}</span>
                </div>
                <div 
                  className="w-full rounded-full h-2 overflow-hidden"
                  style={{ backgroundColor: 'var(--color-border-muted)' }}
                >
                  <div
                    className="h-full transition-all duration-300 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                    style={{ 
                      width: isUploading ? `${uploadProgress}%` : "100%",
                      backgroundColor: isUploading ? 'var(--color-brand-blue)' : '#22c55e' // Green for success
                    }}
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
            className="input-field pl-10 py-3"
          />
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-focus-within:!text-[var(--color-brand-blue)]"
            style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
          >
            <Clock size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};