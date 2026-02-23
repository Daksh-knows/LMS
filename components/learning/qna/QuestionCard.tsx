import { Send } from "lucide-react";

const QuestionCard = ({ 
  question: q, 
  adminId, 
  sortBy, 
  onClick 
}: { 
  question: any; 
  adminId?: string; 
  sortBy: string; 
  onClick: () => void;
}) => {
  const isNew = new Date().getTime() - new Date(q.createdAt).getTime() < 24 * 60 * 60 * 1000;
  const isQTeacher = q.userId === adminId;

  return (
    <div 
      onClick={onClick}
      className={`group relative border rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.98] ${
        isQTeacher 
          ? "bg-blue-50/40 border-blue-100 hover:border-blue-300" 
          : "bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
      }`}
    >
      {isQTeacher && (
        <div className="absolute top-3 right-4 flex items-center gap-1 text-blue-600">
          <span className="text-[8px] font-black uppercase tracking-widest hidden xs:block">Pinned</span>
        </div>
      )}

      <div className="flex items-start gap-3 md:gap-4">
        <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-teal-600 shrink-0 flex items-center justify-center text-white font-bold text-base md:text-lg overflow-hidden shadow-inner border border-white">
          {q.user?.image ? (
            <img src={q.user.image} alt="User" className="h-full w-full object-cover" />
          ) : (
            <span>{q.user?.name?.charAt(0) || "U"}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
            <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate">
              {q.title}
            </h4>
            {isNew && !isQTeacher && sortBy === "latest" && (
              <span className="bg-blue-100 text-blue-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase shrink-0">New</span>
            )}
          </div>
          
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
            <span className="text-[10px] md:text-[11px] font-bold text-blue-600 flex items-center gap-1">
              {q.user?.name}
              {isQTeacher && <span className="bg-blue-600 text-white text-[7px] px-1 rounded-sm font-black uppercase">Teacher</span>}
            </span>
            <span className="text-gray-300 text-[10px] hidden xs:inline">•</span>
            <span className="text-[10px] md:text-[11px] text-gray-500">{new Date(q.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-3 mt-3">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] md:text-[10px] font-black uppercase tracking-tighter ${
              isQTeacher ? "bg-blue-100/50 text-blue-700 border-blue-200" : "text-gray-500 bg-gray-50 border-gray-100"
            }`}>
              <Send size={9} className="rotate-45" />
              {q.replies?.length || 0} Replies
            </div>
            {q.replies?.length > 5 && (
              <span className="text-[9px] md:text-[10px] text-amber-600 font-black uppercase tracking-tighter flex items-center gap-1">
                🔥 Trending
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;