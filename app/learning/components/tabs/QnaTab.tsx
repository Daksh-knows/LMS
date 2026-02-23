import NewQuestionForm from "@/components/learning/qna/NewQuestionForm";
import QuestionCard from "@/components/learning/qna/QuestionCard";
import QuestionDetail from "@/components/learning/qna/QuestionDetail";
import { useConfirm } from "@/context/ConfirmContext";
import { useLecture } from "@/context/LectureContext";
import Loader from "@/utils/Loader";
import { showToast } from "@/utils/Toast";
import { ChevronDown, MessageSquarePlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

interface QnaTabProps {
  courseId: string;
  adminId?: string;
}

export default function QnaTab({ courseId, adminId }: QnaTabProps) {
  const { lecture } = useLecture();
  const lectureId = lecture?.id;
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAllLectures, setIsAllLectures] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "replies">("latest");
  const [isTeacher, setIsTeacher] = useState(false);

  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { confirm } = useConfirm();

  useEffect(() => {
    if (userId && adminId) setIsTeacher(userId === adminId);
  }, [userId, adminId]);

  const sortedQuestions = [...questions].sort((a, b) => {
      const isTeacherA = a.userId === adminId;
      const isTeacherB = b.userId === adminId;
      if (isTeacherA && !isTeacherB) return -1;
      if (!isTeacherA && isTeacherB) return 1;
      if (sortBy === "latest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "replies") return (b.replies?.length || 0) - (a.replies?.length || 0);
      return 0;
  });

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = isAllLectures
      ? `/api/questions?courseId=${courseId}`
      : `/api/questions?lectureId=${lectureId}`;
      const res = await fetch(url);
      const data = await res.json();
      setQuestions(data);
      if (selectedQuestion) {
        const updated = data.find((q: any) => q.id === selectedQuestion.id);
        if (updated) setSelectedQuestion(updated);
      }
    } catch (error) {
      showToast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  }, [lectureId, courseId, isAllLectures, selectedQuestion?.id]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleNewQuestion = async (data: { title: string; description: string; images: string[] }) => {
    const res = await fetch("/api/questions", {
      method: "POST",
      body: JSON.stringify({ ...data, lectureId, userId, imageUrls: data.images }),
    });
    if (res.ok) {
      const newQuestion = await res.json();
      setQuestions((prev) => [newQuestion, ...prev]);
      setShowForm(false);
      showToast.success("Question posted!");
    } else {
      showToast.error("Something went wrong");
      throw new Error("Failed to post question");
    }
  };

  const handleNewReply = async (content: string) => {
    if (!selectedQuestion) return;
    const res = await fetch(`/api/questions/${selectedQuestion.id}/replies`, {
      method: "POST",
      body: JSON.stringify({ content, userId }),
    });
    if (res.ok) {
      const newReply = await res.json();
      const updatedQuestion = {
        ...selectedQuestion,
        replies: [...(selectedQuestion.replies || []), newReply]
      };
      setSelectedQuestion(updatedQuestion);
      setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
      showToast.success("Reply added!");
    } else {
      showToast.error("Failed to post reply");
      throw new Error("Failed to post reply");
    }
  };

  const handleDelete = async (questionId: string) => {
     confirm("Delete Question", "Are you sure you want to delete this question? This action cannot be undone.", async () => {
        try {
          const res = await fetch(`/api/questions/${questionId}`, { method: "DELETE" });
          if (res.ok) {
            showToast.delete("Deleted post successfully");
            setQuestions((prev) => prev.filter((q) => q.id !== questionId));
            if (selectedQuestion?.id === questionId) setSelectedQuestion(null);
          }
        } catch (error) {
          showToast.error("Error deleting post");
        }
      });
   };

  if (isLoading && questions.length === 0) {
    return <div className="flex justify-center py-20"><Loader message="Loading Questions ... " /></div>;
  }

  if (selectedQuestion) {
    return (
      <QuestionDetail 
        question={selectedQuestion}
        adminId={adminId}
        currentUserId={userId}
        currentUserInitials={session?.user?.name?.charAt(0) || "U"}
        onBack={() => setSelectedQuestion(null)}
        onDelete={handleDelete}
        onReply={handleNewReply}
      />
    );
  }

  return (
    <div className="py-4 md:py-6 space-y-4 md:space-y-6 w-full">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[var(--qna-banner-bg)] border border-[var(--qna-banner-border)] rounded-xl p-3 sm:px-4 sm:py-2 shadow-sm theme-transition gap-3 sm:gap-4 sm:min-h-[52px]">
        
        {/* Left Side: Title & Sort */}
        <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide">Q&A</h3>
          
          <div className="w-px h-5 sm:h-6 bg-white/30 hidden sm:block"></div>
          
          <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm">
            <span>sort :</span>
            <div className="relative group">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pr-5 text-white font-semibold bg-transparent border-none focus:ring-0 cursor-pointer outline-none"
              >
                <option value="latest" className="text-black">Latest</option>
                <option value="oldest" className="text-black">Oldest</option>
                <option value="replies" className="text-black">Most Replies</option>
              </select>
              <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-white/80 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>

        {/* Right Side: Toggle & Button */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-1 sm:mt-0 border-t border-white/10 sm:border-t-0 pt-3 sm:pt-0">
          {/* Custom Radio Toggle */}
          <button 
            onClick={() => setIsAllLectures(!isAllLectures)}
            className="flex items-center gap-1.5 sm:gap-2 text-white text-[11px] sm:text-sm font-medium hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-[1.5px] border-[var(--colored-text)] flex items-center justify-center shrink-0`}>
              {!isAllLectures && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[var(--colored-text)]" />}
            </div>
            This Lecture
          </button>

          {/* Ask Question Button */}
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-black text-white dark:bg-[var(--colored-text)] dark:text-black rounded-lg text-[11px] sm:text-sm font-bold hover:brightness-110 transition-all active:scale-95 shadow-sm whitespace-nowrap shrink-0 sm:max-h-[32px]"
          >
            <MessageSquarePlus size={14} className="sm:w-4 sm:h-4" />
            Ask Question
          </button>
        </div>
      </div>

      {showForm && (
        <NewQuestionForm 
          onSubmit={handleNewQuestion} 
          onCancel={() => setShowForm(false)} 
        />
      )}

      {/* 2. Questions List */}
      <div className="space-y-3 sm:space-y-4">
        {sortedQuestions.length === 0 ? (
          <div className="text-center py-12 sm:py-16 border border-dashed border-[var(--qna-banner-border)] rounded-xl text-[var(--text-color)] opacity-60 text-xs sm:text-sm bg-transparent">
            No questions yet. Be the first to ask!
          </div>
        ) : (
          sortedQuestions.map((q) => (
            <QuestionCard 
              key={q.id}
              question={q}
              adminId={adminId}
              onClick={() => setSelectedQuestion(q)}
            />
          ))
        )}
      </div>
    </div>
  );
}