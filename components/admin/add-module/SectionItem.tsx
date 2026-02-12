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
    <div 
      className="card-base transition-all duration-300  overflow-hidden"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div 
        onClick={onToggle}
        className={`px-4 py-4 flex items-center justify-between cursor-pointer transition-colors duration-300 ${
          isExpanded ? 'border-b' : ''
        }`}
        style={{ 
          backgroundColor: isExpanded ? 'var(--color-card-muted)' : 'var(--color-card)',
          borderColor: 'var(--color-border-muted)'
        }}
      >
        <div className="flex items-center gap-3">
          {/* Chevron: Uses opacity for a subtle look */}
          <div style={{ color: 'var(--color-foreground)', opacity: 0.4 }}>
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>

          {/* Index Badge: Uses background color to "pop" against the card */}
          <span 
            className="flex items-center justify-center w-6 h-6 rounded-md border text-xs font-bold shadow-sm"
            style={{ 
              backgroundColor: 'var(--color-background)', 
              borderColor: 'var(--color-border-muted)',
              color: 'var(--color-foreground)',
              opacity: 0.8
            }}
          >
            {index + 1}
          </span>

          <h3 
            className="font-bold text-base"
            style={{ color: 'var(--color-foreground)' }}
          >
            {section.title}
          </h3>

          <span 
            className="text-[10px] font-bold ml-2 hidden sm:inline-block"
            style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
          >
            {section.lectures.length} Items
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={onAddContent} 
            className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-all shadow-sm hover:brightness-110 active:scale-95 cursor-pointer"
            style={{ backgroundColor: 'var(--color-brand-blue)' }}
          >
            <Plus size={14} /> 
            <span className="hidden sm:inline">Add Content</span>
          </button>

          <button 
            onClick={onDelete} 
            className="p-2 rounded-lg transition-colors group cursor-pointer"
            style={{ color: 'var(--color-foreground)', opacity: 0.4 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.4";
              e.currentTarget.style.color = "var(--color-foreground)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Body (Children) */}
      {isExpanded && (
        <div 
          className="divide-y animate-in slide-in-from-top-2 duration-300"
          style={{ borderColor: 'var(--color-border-muted)' }}
        >
          {children}
        </div>
      )}
    </div>
  );
};