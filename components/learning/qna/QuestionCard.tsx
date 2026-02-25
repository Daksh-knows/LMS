import { MessageCircle, ThumbsUp } from "lucide-react";

const QuestionCard = ({ 
  question: q, 
  adminId, 
  onClick 
}: { 
  question: any; 
  adminId?: string; 
  onClick: () => void;
}) => {
  const isQTeacher = q.userId === adminId;

  return (
    <div 
      onClick={onClick}
      className="group bg-(--qna-card-bg) border border-(--qna-card-border) rounded-xl p-5 flex gap-4 transition-all hover:brightness-105 cursor-pointer relative theme-transition shadow-sm"
    >
      {/* Avatar with Border */}
      <div className="h-12 w-12 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-lg overflow-hidden border-2 border-[#FABD23] shadow-sm">
        {q.user?.image ? (
          <img src={q.user.image} alt="User" className="h-full w-full object-cover" />
        ) : (
          <span className="bg-gray-400 w-full h-full flex items-center justify-center">
            {q.user?.name?.charAt(0) || "U"}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <h4 className="font-bold text-(--qna-text-primary) text-base sm:text-lg leading-tight mb-1 truncate group-hover:text-(--colored-text) transition-colors">
          {q.title}
        </h4>
        <p className="text-(--qna-text-primary) opacity-60 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
          {q.description}
        </p>
        
        {/* Card Footer Metadata */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3 text-(--qna-text-primary) text-xs font-bold">
            <span className="truncate max-w-[120px]">{q.user?.name || "Anonymous"}</span>
            <span className="opacity-50 font-medium">{new Date(q.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-4 text-(--qna-text-primary) opacity-70">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <MessageCircle size={16} />
              <span className="tabular-nums">{q.replies?.length || 0} Replies</span>
            </div>
            {/* <div className="flex items-center gap-1.5 text-xs font-semibold">
              <ThumbsUp size={16} />
              <span className="tabular-nums">{q.likes || 0}</span>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;