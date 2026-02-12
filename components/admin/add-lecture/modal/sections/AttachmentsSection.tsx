import React from "react";
import { FileText, UploadCloud, Trash2 } from "lucide-react";

export interface FileAttachment {
  title: string;
  file: File | null;
}

interface AttachmentsSectionProps {
  attachments: FileAttachment[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof FileAttachment, value: any) => void;
}

export const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
  attachments,
  onAdd,
  onRemove,
  onUpdate,
}) => {
  return (
    <div 
      className="space-y-3 pt-4 border-t"
      style={{ borderColor: 'var(--color-border-muted)' }}
    >
      {/* Section Header */}
      <div className="flex justify-between items-center">
        <label 
          className="text-xs font-bold uppercase flex items-center gap-2"
          style={{ color: 'var(--color-foreground)', opacity: 0.6 }}
        >
          <FileText size={14} /> Supporting Files
        </label>
        
        <button
          type="button"
          onClick={onAdd}
          className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all hover:brightness-95 active:scale-95"
          style={{ 
            backgroundColor: 'var(--color-brand-muted)', 
            color: 'var(--color-brand-blue)' 
          }}
        >
          + Add File
        </button>
      </div>

      <div className="space-y-2">
        {attachments.map((att, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row gap-2 animate-in fade-in slide-in-from-left-4 duration-300"
          >
            {/* File Title Input: Uses .input-field but overrides padding for compactness */}
            <input
              required
              value={att.title}
              onChange={(e) => onUpdate(index, "title", e.target.value)}
              placeholder="Document Title"
              className="input-field !p-3 flex-2 text-sm" 
            />

            <div className="flex flex-3 gap-2">
              {/* Custom File Input UI */}
              <div className="relative group w-full">
                <input
                  type="file"
                  required={!att.file}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    onUpdate(index, "file", file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                <div
                  className={`h-full px-4 py-3 sm:py-0 rounded-xl border border-dashed flex items-center gap-2 text-sm transition-all group-hover:border-blue-400`}
                  style={{
                    backgroundColor: att.file ? 'var(--color-brand-muted)' : 'var(--color-input-bg)',
                    borderColor: att.file ? 'transparent' : 'var(--color-border-muted)',
                    color: att.file ? 'var(--color-brand-blue)' : 'var(--color-foreground)',
                    // Opacity manipulation for placeholder text color
                    opacity: att.file ? 1 : 0.6 
                  }}
                >
                  <UploadCloud
                    size={16}
                    style={{ 
                      color: att.file ? 'var(--color-brand-blue)' : 'var(--color-foreground)',
                      opacity: att.file ? 1 : 0.5
                    }}
                  />
                  <span className="truncate max-w-[150px] sm:max-w-[200px] font-medium">
                    {att.file ? att.file.name : "Click to select file..."}
                  </span>
                </div>
              </div>

              {/* Delete Button: Uses .btn-ghost logic */}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="btn-ghost p-3 hover:bg-red-500/10 hover:text-red-500 transition-colors border border-transparent"
                title="Remove file"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {attachments.length === 0 && (
          <div 
            className="py-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors"
            style={{ 
              borderColor: 'var(--color-border-muted)',
              backgroundColor: 'var(--color-card-muted)',
              color: 'var(--color-foreground)'
            }}
          >
            <FileText size={24} className="mb-2" style={{ opacity: 0.3 }} />
            <p className="text-xs font-medium" style={{ opacity: 0.5 }}>
              No files attached yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};