import React from "react";
import { ArrowUp, ArrowDown, Edit, Trash2, Loader2, X } from "lucide-react";
import { getTypeStyles } from "./utils"; 
import { useBackgroundUpload } from "@/context/BackgroundUploadContext";
import { useConfirm } from "@/context/ConfirmContext";

interface LectureItemProps {
  lecture: any;
  index: number;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void; 
}

export const LectureItem = ({ 
  lecture, index, isSelected, isFirst, isLast, onSelect, onMove, onEdit, onDelete, onCancel
}: LectureItemProps) => {
  const style = getTypeStyles(lecture.type);
  
  // Get cancel function from context
  const { uploads, cancelUpload } = useBackgroundUpload(); 
  const { confirm } = useConfirm(); // Assuming you have a confirm hook for modals

  const activeUpload = uploads[lecture.id];

  const getMeta = (description: string) => {
    if (!description) return {};
    try {
      return JSON.parse(description);
    } catch (e) {
      // If it's not JSON, return an empty object or handle as raw text
      return { rawDescription: description };
    }
  };

  const meta = getMeta(lecture.description);

  const isProcessing = activeUpload?.status === "UPLOADING" || meta.status === "UPLOADING";
  const progress = activeUpload?.progress || 0;

  // --- HANDLER FOR CANCELLATION ---
  const handleCancelUpload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    confirm(
        "Stop Uploading?",
        `Are you sure you want to stop the upload? This will delete the lecture and all uploaded materials.`,
        async () => {
          // 1. Abort and Delete via Context
          await cancelUpload(lecture.id);
          // 2. Tell Parent to refresh the list
          if(onCancel) {
            onCancel();
          }
        }
    )
  };

  if (isProcessing) {
    return (
      <div 
  className="p-4 rounded-2xl mb-2 relative group border animate-in fade-in duration-500"
  style={{ 
    backgroundColor: 'var(--color-brand-muted)', 
    borderColor: 'rgba(59, 130, 246, 0.2)' // Subtle blue border
  }}
>
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-3">
      <Loader2 
        className="animate-spin" 
        size={18} 
        style={{ color: 'var(--color-brand-blue)' }} 
      />
      <span 
        className="text-sm font-bold"
        style={{ color: 'var(--color-brand-blue)' }}
      >
         {activeUpload?.currentTask || "Processing..."}
      </span>
    </div>
    
    <div className="flex items-center gap-3">
      <span 
        className="text-xs font-black tracking-tighter"
        style={{ color: 'var(--color-brand-blue)' }}
      >
        {progress}%
      </span>
      
      {/* CANCEL BUTTON */}
      <button 
        onClick={handleCancelUpload}
        className="p-1 rounded-full transition-all hover:bg-red-500/20 text-red-500/60 hover:text-red-500"
        title="Cancel Upload"
      >
        <X size={16} />
      </button>
    </div>
  </div>
  
  {/* Progress Track */}
  <div 
    className="h-1.5 w-full rounded-full overflow-hidden"
    style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
  >
    <div 
      className="h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
      style={{ 
        width: `${progress}%`,
        backgroundColor: 'var(--color-brand-blue)' 
      }} 
    />
  </div>
</div>
    );
  }

  return (
    <div 
  onClick={onSelect}
  className={`group/lecture relative flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer transition-all duration-300 border-b last:border-b-0`}
  style={{ 
    backgroundColor: isSelected ? 'var(--color-brand-muted)' : 'var(--color-listitem-bg)',
    borderColor: 'var(--color-border-muted)'
  }}
>
  {/* Icon & Title */}
  <div className="flex items-start gap-4 flex-1">
    <div 
      className={`mt-1 p-2 rounded-lg shrink-0 transition-colors`}
      style={{ 
        backgroundColor: isSelected ? 'var(--color-brand-blue)' : 'var(--color-background)',
        color: isSelected ? 'var(--color-brand-contrast)' : 'var(--color-brand-blue)'
      }}
    >
       {style.icon}
    </div>
    <div className="flex flex-col gap-1">
      <span 
        className={`text-sm font-semibold transition-colors`}
        style={{ color: isSelected ? 'var(--color-brand-blue)' : 'var(--color-foreground)' }}
      >
        {index + 1}. {lecture.title}
      </span>
      <div className="flex items-center gap-2">
        {/* Style Label Badge */}
        <span 
          className="text-[10px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider transition-colors"
          style={{ 
            backgroundColor: 'var(--color-background)', 
            borderColor: 'var(--color-border-muted)',
            color: 'var(--color-foreground)',
            opacity: 0.6
          }}
        >
          {style.label}
        </span>
        {lecture.isFree && (
          <span className="text-[10px] font-black text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
            Free Preview
          </span>
        )}
      </div>
    </div>
  </div>

  {/* Actions */}
  <div className={`flex items-center gap-1 mt-3 sm:mt-0 self-end sm:self-auto transition-opacity duration-300 ${isSelected ? "opacity-100" : "opacity-0 group-hover/lecture:opacity-100"}`}>
    {isSelected && (
      <div 
        className="flex items-center rounded-lg border shadow-sm mr-2 overflow-hidden"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); onMove('up'); }} 
          disabled={isFirst} 
          className="p-1.5 transition-colors disabled:opacity-20 border-r cursor-pointer"
          style={{ borderColor: 'var(--color-border-muted)', color: 'var(--color-foreground)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-blue)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-foreground)')}
        >
          <ArrowUp size={14} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onMove('down'); }} 
          disabled={isLast} 
          className="p-1.5 transition-colors disabled:opacity-20 cursor-pointer"
          style={{ color: 'var(--color-foreground)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-brand-blue)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-foreground)')}
        >
          <ArrowDown size={14} />
        </button>
      </div>
    )}
    
    {/* Edit & Delete: Using btn-ghost pattern */}
    <button 
      onClick={(e) => { e.stopPropagation(); onEdit(); }} 
      className="btn-ghost"
    >
      <Edit size={16} />
    </button>
    <button 
      onClick={(e) => { e.stopPropagation(); onDelete(); }} 
      className="btn-ghost hover:!bg-red-500/10 hover:!text-red-500"
    >
      <Trash2 size={16} />
    </button>
  </div>
</div>
  );
};