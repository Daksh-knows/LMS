import { Plus, Trash2, UploadCloud } from "lucide-react";

// --- Sub-Component for Attachments ---
export function AttachmentsSection({ attachments, onAdd, onRemove, onUpdate, label }: any) {
  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
           <UploadCloud size={14} /> {label}
        </label>
        <button 
          type="button"
          onClick={onAdd}
          className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="space-y-3">
        {attachments.map((att: any, index: number) => (
          <div key={index} className="flex flex-col sm:flex-row gap-2">
            <input 
              placeholder="Title"
              className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none"
              value={att.title}
              onChange={(e) => onUpdate(index, "title", e.target.value)}
            />
            <input 
              placeholder="URL"
              className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none"
              value={att.url}
              onChange={(e) => onUpdate(index, "url", e.target.value)}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {attachments.length === 0 && (
            <p className="text-center text-xs text-gray-300 italic py-2">No documents attached.</p>
        )}
      </div>
    </div>
  );
}