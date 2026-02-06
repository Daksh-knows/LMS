import React from "react";
import { ArrowUp, ArrowDown, Edit, Trash2, Loader2 } from "lucide-react";
import { getTypeStyles } from "./utils"; // Import from above
import { useBackgroundUpload } from "@/context/BackgroundUploadContext";

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
}

export const LectureItem = ({ 
  lecture, index, isSelected, isFirst, isLast, onSelect, onMove, onEdit, onDelete 
}: LectureItemProps) => {
  const style = getTypeStyles(lecture.type);
  const { uploads } = useBackgroundUpload();

  const  activeUpload = uploads[lecture.id];
  console.log('--------------------------------------------------')
  console.log("Active Upload for Lecture", lecture.id, activeUpload);
  console.log('--------------------------------------------------')

  const meta = lecture.description ? JSON.parse(lecture.description) : {};
  const isProcessing = activeUpload?.status === "UPLOADING" || meta.status === "UPLOADING";
  const progress = activeUpload?.progress || 0;

  if (isProcessing) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl mb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={18} />
            <span className="text-sm font-bold text-blue-900">Processing Video...</span>
          </div>
          <span className="text-xs font-bold text-blue-600">{progress}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-blue-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onSelect}
      className={`group/lecture relative flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer transition-colors duration-200 ${isSelected ? "bg-blue-50/60" : "bg-white hover:bg-gray-50/50"}`}
    >
      {/* Icon & Title */}
      <div className="flex items-start gap-4 flex-1">
        <div className={`mt-1 p-2 rounded-lg ${style.color} shrink-0`}>
           {style.icon}
        </div>
        <div className="flex flex-col gap-1">
          <span className={`text-sm font-medium transition-colors ${isSelected ? "text-blue-900" : "text-gray-700"}`}>
            {index + 1}. {lecture.title}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 uppercase tracking-wider">
              {style.label}
            </span>
            {lecture.isFree && (
              <span className="text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                Free Preview
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={`flex items-center gap-1 mt-3 sm:mt-0 self-end sm:self-auto transition-opacity duration-200 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
        {isSelected && (
          <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm mr-2 overflow-hidden">
            <button 
              onClick={(e) => { e.stopPropagation(); onMove('up'); }} 
              disabled={isFirst} 
              className="p-1.5 hover:bg-gray-50 text-gray-500 hover:text-blue-600 disabled:opacity-30 border-r border-gray-100"
            >
              <ArrowUp size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onMove('down'); }} 
              disabled={isLast} 
              className="p-1.5 hover:bg-gray-50 text-gray-500 hover:text-blue-600 disabled:opacity-30"
            >
              <ArrowDown size={14} />
            </button>
          </div>
        )}
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <Edit size={16} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};