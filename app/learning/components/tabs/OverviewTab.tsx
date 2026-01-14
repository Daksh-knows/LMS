import React from "react";
import { Download, FileText, Globe, Clock, User } from "lucide-react";
import { Lecture } from "../../types";

export const OverviewTab: React.FC<{ lecture: Lecture }> = ({ lecture }) => {
  // Format the date from the DB
  const lastUpdated = new Date(lecture.updatedAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
      {/* 1. Description Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          About this lecture
        </h3>
        <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
          {/* Use 'description' from Prisma instead of 'overview' */}
          <p>
            {lecture.description || "No description provided for this lecture."}
          </p>
        </div>
      </div>

      {/* 2. Resources Section (Integrated from Attachment model) */}
      {lecture.resources && lecture.resources.length > 0 && (
        <div className="pt-6 border-t border-gray-100">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
            Resources & Attachments
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lecture.resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-purple-50 border border-gray-100 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-purple-600">
                    <FileText size={18} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                    {resource.title}
                  </span>
                </div>
                <Download
                  size={16}
                  className="text-gray-400 group-hover:text-purple-600"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 3. Database Metadata */}
      <div className="flex flex-wrap gap-8 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-full text-gray-500">
            <Clock size={16} />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-sm block">
              Duration
            </span>
            <span className="text-xs text-gray-500">
              {lecture.duration} Minutes
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-full text-gray-500">
            <Globe size={16} />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-sm block">
              Last Updated
            </span>
            <span className="text-xs text-gray-500">{lastUpdated}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-full text-gray-500">
            <User size={16} />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-sm block">
              Access
            </span>
            <span className="text-xs text-gray-500">
              {lecture.isFree ? "Free Preview" : "Premium Content"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
