import React from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";

interface SectionItemProps {
  section: any;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onAddContent: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}

export const SectionItem = ({ 
  section, index, isExpanded, onToggle, onAddContent, onDelete, children 
}: SectionItemProps) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Header */}
      <div 
        onClick={onToggle}
        className={`px-4 py-4 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50 border-b border-gray-200' : 'bg-white hover:bg-gray-50'}`}
      >
        <div className="flex items-center gap-3">
          <div className="text-gray-400">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-white border border-gray-200 text-xs font-bold text-gray-500 shadow-sm">
            {index + 1}
          </span>
          <h3 className="font-bold text-gray-800 text-base">{section.title}</h3>
          <span className="text-[10px] font-bold text-gray-400 ml-2 hidden sm:inline-block">
            {section.lectures.length} Items
          </span>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={onAddContent} 
            className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
          >
            <Plus size={14} /> <span className="hidden sm:inline">Add Content</span>
          </button>
          <button 
            onClick={onDelete} 
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="divide-y divide-gray-100 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};