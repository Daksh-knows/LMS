import NewQuestionForm from "@/components/learning/qna/NewQuestionForm";
import QuestionCard from "@/components/learning/qna/QuestionCard";
import QuestionDetail from "@/components/learning/qna/QuestionDetail";
import { useConfirm } from "@/context/ConfirmContext";
import { useLecture } from "@/context/LectureContext";
import Loader from "@/utils/Loader";
import { showToast } from "@/utils/Toast";
import { ChevronDown, Globe, MessageSquarePlus } from "lucide-react";
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
    return <div className="flex justify-center py-10"><Loader message="Loading questions..." /></div>;
  }

  // View 1: Single Question Details
  if (selectedQuestion) {
    return (
      <QuestionDetail
        question={selectedQuestion}
        adminId={adminId}
        currentUserId={userId}
        currentUserInitials={session?.user?.name?.charAt(0) || "Y"}
        onBack={() => setSelectedQuestion(null)}
        onDelete={handleDelete}
        onReply={handleNewReply}
      />
    );
  }

  // View 2: Main Questions List
  return (
    <div className="py-4 md:py-6 space-y-4 md:space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Q&A</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Sort:</span>
            <div className="relative inline-block">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pr-6 text-xs font-medium text-gray-600 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-gray-900"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="replies">Most Replies</option>
              </select>
              <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAllLectures(!isAllLectures)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all border ${
              isAllLectures ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-white text-gray-600 border-gray-200 shadow-sm"
            }`}
          >
            <Globe size={13} />
            {isAllLectures ? "All Lectures" : "This Lecture"}
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-lg text-[11px] font-bold hover:bg-black transition-all shadow-md active:scale-95"
          >
            <MessageSquarePlus size={13} />
            {isTeacher ? "Announcement" : "Ask Question"}
          </button>
        </div>
      </div>

      {showForm && (
        <NewQuestionForm
          onSubmit={handleNewQuestion} 
          onCancel={() => setShowForm(false)} 
        />
      )}

      <div className="space-y-3 md:space-y-4">
        {sortedQuestions.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-2xl text-gray-400 text-xs md:text-sm bg-gray-50/50">
            No questions yet.
          </div>
        ) : (
          sortedQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              adminId={adminId}
              sortBy={sortBy}
              onClick={() => setSelectedQuestion(q)}
            />
          ))
        )}
      </div>
    </div>
  );
}