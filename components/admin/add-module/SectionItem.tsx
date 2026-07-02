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
    <div className="bg-(--sidebar-background) rounded-2xl border border-(--course-sidebar-border) shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md theme-transition">
      {/* Header */}
      <div 
        onClick={onToggle}
        className={`px-4 py-4 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-(--sidebar-background)/50 border-b border-(--course-sidebar-border)' : 'bg-(--sidebar-background) hover:bg-(--sidebar-nav-bg-hover)'}`}
      >
        <div className="flex items-center gap-3">
          <div className="text-(--text-color) opacity-60">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-(--sidebar-background) border border-(--course-sidebar-border) text-xs font-bold text-(--text-color) opacity-80 shadow-sm theme-transition">
            {index + 1}
          </span>
          <h3 className="font-bold text-(--text-color) text-base theme-transition">{section.title}</h3>
          <span className="text-[10px] font-bold text-(--text-color) opacity-50 ml-2 hidden sm:inline-block">
            {section.lectures.length} Items
          </span>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={onAddContent} 
            className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus size={14} /> <span className="hidden sm:inline">Add Content</span>
          </button>
          <button 
            onClick={onDelete} 
            className="p-2 text-(--text-color) opacity-60 hover:text-red-600 hover:bg-red-50/20 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="divide-y divide-(--course-sidebar-border) animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};