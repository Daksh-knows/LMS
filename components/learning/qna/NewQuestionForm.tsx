import { ImageIcon, X } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";

const NewQuestionForm = ({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (data: { title: string; description: string; images: string[] }) => Promise<void>; 
  onCancel: () => void; 
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    try {
      setIsSubmitting(true);
      await onSubmit({ title, description, images });
      // Reset form on success
      setTitle("");
      setDescription("");
      setImages([]);
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border border-gray-200 rounded-2xl bg-gray-50 space-y-3 animate-in fade-in zoom-in-95 duration-200">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What is your question?"
        rows={3}
        className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 resize-none"
        required
      />

      <div className="space-y-3">
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((url) => (
              <div key={url} className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-200">
                <button type="button" onClick={() => setImages(prev => prev.filter(i => i !== url))} className="absolute top-0.5 right-0.5 p-1 bg-black/50 text-white rounded-full z-10">
                  <X size={10} />
                </button>
                <img src={url} alt="Preview" className="object-cover h-full w-full" />
              </div>
            ))}
          </div>
        )}

        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={(result: any) => setImages((prev) => [...prev, result.info.secure_url])}
          options={{ multiple: true, maxFiles: 5, clientAllowedFormats: ["png", "jpeg", "jpg", "webp"] }}
        >
          {({ open }) => (
            <button
              type="button"
              disabled={!open}
              onClick={() => open?.()}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-600 hover:bg-gray-100 transition shadow-sm disabled:opacity-50"
            >
              <ImageIcon size={14} />
              Images ({images.length}/5)
            </button>
          )}
        </CldUploadWidget>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-3 py-2 text-[11px] font-bold text-gray-500">Cancel</button>
        <button disabled={isSubmitting} type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[11px] font-bold disabled:opacity-50 shadow-sm">
          {isSubmitting ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
};

export default NewQuestionForm;