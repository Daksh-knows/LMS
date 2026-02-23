import { ArrowLeft, Search, Send, Trash2 } from "lucide-react";
import { useState } from "react";

const QuestionDetail = ({ 
  question, 
  adminId, 
  currentUserId, 
  currentUserInitials,
  onBack, 
  onDelete, 
  onReply 
}: { 
  question: any; 
  adminId?: string; 
  currentUserId?: string; 
  currentUserInitials: string;
  onBack: () => void; 
  onDelete: (id: string) => void; 
  onReply: (content: string) => Promise<void>;
}) => {
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedReplies = [...(question.replies || [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const isQuestionTeacher = question.userId === adminId;

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent) return;
    try {
      setIsSubmitting(true);
      await onReply(replyContent);
      setReplyContent("");
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-4 md:py-6 space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-xs md:text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2 group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to questions
      </button>

      <div className={`border rounded-xl p-4 md:p-6 shadow-sm ${isQuestionTeacher ? "bg-blue-50/30 border-blue-200" : "bg-white border-gray-200"}`}>
        <div className="flex justify-between items-start gap-3 mb-4">
          <div className="flex gap-3 md:gap-4">
            <div 
              style={{ backgroundColor: isQuestionTeacher ? "#2563eb" : "#0d9488" }} 
              className="h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 text-sm md:text-base"
            >
              {question.user?.image ? <img src={question.user.image} alt="User" className="h-full w-full rounded-full object-cover" /> : <span>{question.user?.name?.charAt(0) || "U"}</span>}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                <h2 className="text-base md:text-lg font-bold text-gray-900 leading-tight truncate">
                  {question.title}
                </h2>
                {isQuestionTeacher && (
                  <span className="bg-blue-600 text-white text-[7px] md:text-[8px] px-1.5 py-0.5 rounded font-black uppercase shrink-0">Teacher</span>
                )}
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                {question.user?.name} • {new Date(question.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {currentUserId === question.userId && (
            <button onClick={() => onDelete(question.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0">
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed border-b pb-6">
          {question.description}
        </p>

        {question.images && question.images.length > 0 && (
          <div className={`p-1 my-6 ${question.images.length === 1 ? "flex justify-start" : "grid gap-2 grid-cols-2 sm:grid-cols-3"}`}>
            {question.images.map((image: any) => (
              <div 
                key={image.id} 
                className={`relative group cursor-zoom-in overflow-hidden rounded-lg border border-gray-100 bg-gray-50 transition-all ${
                  question.images.length === 1 ? "w-full max-w-[280px] md:max-w-[350px] aspect-square" : "aspect-square md:aspect-video"
                }`}
                onClick={() => window.open(image.url, '_blank')}
              >
                <img src={image.url} alt="Attachment" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Search className="text-white" size={20} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Replies Section */}
        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Replies</h4>
            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {question.replies?.length || 0}
            </span>
          </div>
          
          <div className="space-y-4">
            {sortedReplies.map((reply: any) => {
              const isReplyTeacher = reply.userId === adminId;
              return (
                <div key={reply.id} className="flex gap-2 md:gap-3">
                  <div 
                    style={{ backgroundColor: isReplyTeacher ? "#2563eb" : "#9ca3af" }}
                    className="h-7 w-7 md:h-8 md:w-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                  >
                    {reply.user?.name?.charAt(0)}
                  </div>
                  <div className={`flex-1 p-3 rounded-xl md:rounded-2xl border ${isReplyTeacher ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-100"}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] md:text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        {reply.user?.name}
                        {isReplyTeacher && <span className="bg-blue-600 text-white text-[7px] px-1.5 py-0.5 rounded font-black uppercase">Teacher</span>}
                      </span>
                      <span className="text-[9px] text-gray-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 leading-normal">{reply.content}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleReplySubmit} className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-start gap-2 md:gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {currentUserInitials}
              </div>
              <div className="flex-1 flex gap-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none min-h-[45px] max-h-[120px]"
                  required
                />
                <button 
                  disabled={isSubmitting || !replyContent.trim()}
                  type="submit"
                  className="bg-gray-900 text-white rounded-xl hover:bg-black disabled:bg-gray-200 transition-all p-3 shadow-sm h-[45px] w-[45px] flex items-center justify-center shrink-0"
                >
                  <Send size={18} className={isSubmitting ? "animate-pulse" : ""} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;