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
    <div className="space-y-3 pt-4 border-t border-gray-100">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
          <FileText size={14} /> Supporting Files
        </label>
        <button
          type="button"
          onClick={onAdd}
          className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors"
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
            {/* File Title */}
            <input
              required
              value={att.title}
              onChange={(e) => onUpdate(index, "title", e.target.value)}
              placeholder="Document Title"
              className="flex-2 p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-blue-300 transition-all w-full"
            />

            <div className="flex flex-3 gap-2">
              {/* Custom File Input UI */}
              <div className="relative group w-full">
                <input
                  type="file"
                  required={!att.file} // Only required if file is not already selected (or preloaded)
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    onUpdate(index, "file", file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                <div
                  className={`h-full px-4 py-3 sm:py-0 rounded-xl border border-dashed flex items-center gap-2 text-sm transition-all ${
                    att.file
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-gray-300 text-gray-400 hover:border-blue-400"
                  }`}
                >
                  <UploadCloud
                    size={16}
                    className={att.file ? "text-blue-600" : "text-gray-400"}
                  />
                  <span className="truncate max-w-37.5 sm:max-w-45">
                    {att.file ? att.file.name : "Click to select file..."}
                  </span>
                </div>
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                title="Remove file"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {attachments.length === 0 && (
          <div className="py-8 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
            <FileText size={24} className="mb-2 opacity-50" />
            <p className="text-xs font-medium">No files attached yet</p>
          </div>
        )}
      </div>
    </div>
  );
};