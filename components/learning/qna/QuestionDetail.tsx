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
      // Handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-2 animate-in fade-in slide-in-from-right-4 duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-[var(--text-color)] opacity-60 hover:opacity-100 transition-opacity mb-4 group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Q&A
      </button>

      <div className="border border-[var(--qna-card-border)] bg-[var(--qna-card-bg)] rounded-xl p-5 md:p-6 theme-transition">
        {/* Header */}
        <div className="flex justify-between items-start gap-3 mb-4">
          <div className="flex gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-lg overflow-hidden border border-[var(--qna-banner-border)] bg-[var(--banner-color)]">
              {question.user?.image ? <img src={question.user.image} alt="User" className="h-full w-full object-cover" /> : <span>{question.user?.name?.charAt(0) || "U"}</span>}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base md:text-lg font-bold text-[var(--text-color)] leading-tight">
                  {question.title}
                </h2>
                {isQuestionTeacher && (
                  <span className="bg-[var(--colored-text)] text-black text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Instructor</span>
                )}
              </div>
              <p className="text-[11px] md:text-xs text-[var(--text-color)] opacity-60 mt-1">
                {question.user?.name} • {new Date(question.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {currentUserId === question.userId && (
            <button onClick={() => onDelete(question.id)} className="p-2 text-[var(--text-color)] opacity-50 hover:opacity-100 hover:text-red-500 transition-colors shrink-0">
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Description */}
        <p className="text-[var(--text-color)] opacity-90 whitespace-pre-wrap text-sm leading-relaxed border-b border-[var(--qna-banner-border)] pb-6">
          {question.description}
        </p>

        {/* Images */}
        {question.images && question.images.length > 0 && (
          <div className="flex flex-wrap gap-2 py-4">
            {question.images.map((image: any) => (
              <div 
                key={image.id} 
                className="relative group cursor-zoom-in overflow-hidden rounded-lg border border-[var(--qna-banner-border)] h-24 w-24 md:h-32 md:w-32"
                onClick={() => window.open(image.url, '_blank')}
              >
                <img src={image.url} alt="Attachment" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Search className="text-white" size={20} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Replies Section */}
        <div className="mt-6 space-y-5">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-[var(--text-color)] uppercase tracking-widest opacity-60">Replies</h4>
            <span className="bg-[var(--qna-banner-border)] text-[var(--text-color)] px-2 py-0.5 rounded text-[10px] font-bold">
              {question.replies?.length || 0}
            </span>
          </div>
          
          <div className="space-y-4">
            {sortedReplies.map((reply: any) => {
              const isReplyTeacher = reply.userId === adminId;
              return (
                <div key={reply.id} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white bg-[var(--banner-color)] border border-[var(--qna-banner-border)]">
                    {reply.user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 p-4 rounded-xl border border-[var(--qna-banner-border)] bg-transparent">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] md:text-xs font-bold text-[var(--text-color)] flex items-center gap-2">
                        {reply.user?.name}
                        {isReplyTeacher && <span className="bg-[var(--colored-text)] text-black text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Instructor</span>}
                      </span>
                      <span className="text-[10px] text-[var(--text-color)] opacity-50">{new Date(reply.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-[var(--text-color)] opacity-80 leading-relaxed">{reply.content}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleReplySubmit} className="mt-6 pt-6 border-t border-[var(--qna-banner-border)]">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-white bg-[var(--banner-color)] text-sm font-bold shrink-0 border border-[var(--qna-banner-border)]">
                {currentUserInitials}
              </div>
              <div className="flex-1 flex gap-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full p-3 text-sm bg-transparent border border-[var(--qna-banner-border)] text-[var(--text-color)] placeholder:text-[var(--text-color)] placeholder:opacity-50 rounded-xl focus:border-[var(--colored-text)] outline-none transition-colors resize-none min-h-[50px] max-h-[120px]"
                  required
                />
                <button 
                  disabled={isSubmitting || !replyContent.trim()}
                  type="submit"
                  className="bg-[var(--colored-text)] text-black rounded-xl hover:brightness-110 disabled:opacity-50 transition-all p-3 shadow-sm h-[50px] w-[50px] flex items-center justify-center shrink-0 active:scale-95"
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