"use client";

import React, { useState } from "react";
import { User, X, Reply } from "lucide-react";
import { createReply } from "@/lib/question-actions";

interface ReplyProps {
  reply: any;
  questionId: string;
  courseId: string;
}

export function ReplyItem({ reply, questionId, courseId }: ReplyProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showChildren, setShowChildren] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log("Rendering reply: ", reply);
  const hasChildren = reply.childReplies && reply.childReplies.length > 0;

  const handleReply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    await createReply({
      content: formData.get("content") as string,
      questionId,
      parentReplyId: reply.id,
      courseId,
    });

    setLoading(false);
    setShowReplyForm(false);
    setShowChildren(true);
  };

  return (
    <div className="mt-4 relative">
      {/* Thread Line: Clickable to collapse */}
      {showChildren && hasChildren && (
        <div 
          onClick={() => setShowChildren(false)}
          className="absolute left-[14px] top-10 bottom-0 w-0.5 bg-slate-100 hover:bg-blue-300 cursor-pointer transition-colors"
          title="Collapse thread"
        />
      )}

      <div className="flex gap-3 items-start">
        <div className="shrink-0 z-10">
          {reply.user?.image ? (
            <img src={reply.user.image} className="w-8 h-8 rounded-full border border-white shadow-sm" alt="" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-white">
              <User size={14} />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">{reply.user?.name || "Student"}</span>
            <span className="text-[10px] text-slate-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{reply.content}</p>

          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-tighter"
            >
              Reply
            </button>
            
            {hasChildren && (
              <button
                onClick={() => setShowChildren(!showChildren)}
                className="text-[10px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-tighter flex items-center gap-1"
              >
                {showChildren ? (
                  <span className="flex items-center gap-1 text-red-500"><X size={12}/> Close Replies</span>
                ) : (
                  `View ${reply.childReplies.length} replies`
                )}
              </button>
            )}
          </div>

          {showReplyForm && (
            <form onSubmit={handleReply} className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-1">
              <input
                autoFocus
                name="content"
                required
                placeholder="Write a reply..."
                className="flex-1 text-xs p-2 rounded-lg bg-slate-50 border-none ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                disabled={loading}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-700 disabled:bg-slate-300"
              >
                {loading ? "..." : "Send"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* RECURSIVE RENDER */}
      {showChildren && hasChildren && (
        <div className="pl-4 space-y-2 animate-in fade-in slide-in-from-left-1">
          {reply.childReplies.map((child: any) => (
            <ReplyItem key={child.id} reply={child} questionId={questionId} courseId={courseId} />
          ))}
        </div>
      )}
    </div>
  );
}