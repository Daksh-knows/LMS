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
      setTitle("");
      setDescription("");
      setImages([]);
    } catch (error) {
      // Handled by parent toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-5 border border-(--qna-card-border) rounded-xl bg-(--qna-card-bg) space-y-4 animate-in fade-in zoom-in-95 duration-200 theme-transition">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Question Title"
        className="w-full px-4 py-3 text-sm bg-transparent border border-(--qna-banner-border) text-(--text-color) placeholder:text-(--text-color) placeholder:opacity-50 rounded-lg outline-none focus:border-(--colored-text) transition-colors"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What is your question about?"
        rows={4}
        className="w-full px-4 py-3 text-sm bg-transparent border border-(--qna-banner-border) text-(--text-color) placeholder:text-(--text-color) placeholder:opacity-50 rounded-lg outline-none focus:border-(--colored-text) resize-none transition-colors"
        required
      />

      <div className="space-y-3">
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((url) => (
              <div key={url} className="relative h-16 w-16 rounded-lg overflow-hidden border border-(--qna-banner-border)">
                <button type="button" onClick={() => setImages(prev => prev.filter(i => i !== url))} className="absolute top-0.5 right-0.5 p-1 bg-black/60 text-white rounded-full z-10 hover:bg-black transition-colors">
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
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-(--qna-banner-border) rounded-lg text-xs font-bold text-(--text-color) opacity-80 hover:opacity-100 hover:border-(--colored-text) transition-all disabled:opacity-50"
            >
              <ImageIcon size={14} />
              Attach Image ({images.length}/5)
            </button>
          )}
        </CldUploadWidget>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-bold text-(--text-color) opacity-60 hover:opacity-100 transition-opacity">
          Cancel
        </button>
        <button disabled={isSubmitting} type="submit" className="px-6 py-2 bg-(--colored-text) text-black rounded-lg text-xs font-bold disabled:opacity-50 hover:brightness-110 active:scale-95 transition-all">
          {isSubmitting ? "Posting..." : "Post Question"}
        </button>
      </div>
    </form>
  );
};

export default NewQuestionForm;