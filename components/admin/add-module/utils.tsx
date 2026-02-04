import { 
  TvMinimalIcon, FileText, SpellCheck, ClipboardList, Video, Layout 
} from "lucide-react";
import React from "react";

export const getTypeStyles = (type: string) => {
  switch (type) {
    case "VIDEO": return { icon: <TvMinimalIcon size={18} />, color: "text-blue-600 bg-blue-50", label: "Video" };
    case "TEXT": return { icon: <FileText size={18} />, color: "text-orange-600 bg-orange-50", label: "Article" };
    case "QUIZ": return { icon: <SpellCheck size={18} />, color: "text-emerald-600 bg-emerald-50", label: "Quiz" };
    case "ASSIGNMENT": return { icon: <ClipboardList size={18} />, color: "text-purple-600 bg-purple-50", label: "Assignment" };
    case "LIVE": return { icon: <Video size={18} />, color: "text-red-600 bg-red-50", label: "Live" };
    default: return { icon: <Layout size={18} />, color: "text-gray-600 bg-gray-50", label: "Unknown" };
  }
};