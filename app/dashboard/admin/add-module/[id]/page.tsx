"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, PlusCircle, Layout, Plus, Trash2, Edit, 
  Video, FileText, BrainCircuit, ClipboardList, Clock, 
  TvMinimalIcon,
  SpellCheck
} from "lucide-react"; 
import Link from "next/link";
import AddModuleForm from "@/components/admin/AddModuleForm"; // Verify path matches your folder structure
import AddLectureForm from "@/components/admin/AddLectureForm"; // Verify path matches your folder structure
import { getCourseContent, deleteLecture, deleteSection } from "@/lib/admin-actions";

export default function AddModulePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");
  const [content, setContent] = useState<any>(null);
  
  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingLecture, setEditingLecture] = useState<any>(null); // Null = Adding, Object = Editing

  useEffect(() => {
    params.then(async (resolvedParams) => {
      setId(resolvedParams.id);
      loadContent(resolvedParams.id);
    });
  }, [params]);

  const loadContent = async (courseId: string) => {
    const res = await getCourseContent(courseId);
    if (res.success) setContent(res);
  };

  const refreshData = () => loadContent(id);

  // --- Handlers ---
  const openAddModal = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setEditingLecture(null); // Reset editing state
    setIsModalOpen(true);
  };

  const openEditModal = (sectionId: string, lecture: any) => {
    setActiveSectionId(sectionId);
    setEditingLecture(lecture); // Pass existing data
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveSectionId(null);
    setEditingLecture(null);
  };


  const handleDelete = async (sectionId: string, lectureId: string, lectureTitle: string) => {
    const confirmed = confirm(`Delete "${lectureTitle}"? This will also remove all associated quiz data and cloud files.`);
    
    if (!confirmed) return;

    try {
      const baseurl = process.env.NEXT_PUBLIC_APP_URL;
      // console.log(`${baseurl}/api/lecture/${lectureId}`);
      // Calling the API route instead of a Server Action
      const response = await fetch(`${baseurl}/api/lecture/${lectureId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        refreshData(); // Refresh the curriculum list
      } else {
        alert(data.error || "Failed to delete content.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      alert("An error occurred while deleting the lecture.");
    }
};
  /**
   * Helper to get distinct visual styles for each content type
   */
  const getTypeStyles = (lecture: any) => {
    switch (lecture.type) {
      case "VIDEO":
        return {
          icon: <TvMinimalIcon size={18} />,
          color: "text-blue-600 bg-blue-50",
          label: "Video Lecture",
          meta: lecture.duration ? `${lecture.duration} min` : "0 min"
        };
      case "TEXT":
        return {
          icon: <FileText size={18} />,
          color: "text-orange-600 bg-orange-50",
          label: "Article",
          meta: "Read"
        };
      case "QUIZ":
        return {
          icon: <SpellCheck size={18} />,
          color: "text-emerald-600 bg-emerald-50",
          label: "Quiz",
          // Check if questions exist and map length, fallback to 0
          meta: `${lecture.questions?.length || 0} Questions`
        };
      case "ASSIGNMENT":
        return {
          icon: <ClipboardList size={18} />,
          color: "text-purple-600 bg-purple-50",
          label: "Assignment",
          meta: "Task"
        };
      default:
        return {
          icon: <Layout size={18} />,
          color: "text-gray-600 bg-gray-50",
          label: "Unknown",
          meta: ""
        };
    }
  };

  if (!content) return <div className="p-12 text-center font-bold text-gray-400 animate-pulse">Loading Curriculum...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* --- Back Button --- */}
        <Link 
          href="/dashboard/admin" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-all group"
        >
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:bg-gray-100 border border-gray-100">
            <ArrowLeft size={18} />
          </div>
          <span className="font-semibold">Back to Dashboard</span>
        </Link>

        {/* --- Main Card --- */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
          <div className="bg-white p-8 md:p-12 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-blue-50 rounded-lg">
                 <Layout size={20} className="text-blue-600" />
               </div>
               <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Curriculum Manager</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{content.courseTitle}</h1>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            
            {/* Add Module Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <PlusCircle size={22} className="text-green-600" />
                <h2 className="text-xl font-bold text-gray-800">Add New Module (Section)</h2>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <AddModuleForm courseId={id} />
              </div>
            </section>

            {/* Curriculum List */}
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 px-2">Current Curriculum</h2>
              <div className="space-y-6">
                {content.sections?.map((section: any, idx: number) => (
                  <div key={section.id} className="border border-gray-100 rounded-3xl p-2 bg-white shadow-sm">
                    {/* Module Header */}
                    <div className="p-4 bg-gray-50/50 rounded-2xl mb-2 flex justify-between items-center">
                       <h3 className="font-bold text-blue-600 uppercase text-xs tracking-widest">
                         {idx + 1}. {section.title}
                       </h3>
                       
                       <div className="flex items-center gap-2">
                         <button 
                           onClick={() => openAddModal(section.id)}
                           className="flex items-center gap-2 text-[10px] font-black bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-95"
                         >
                           <Plus size={14} /> ADD
                         </button>

                         <button
                           onClick={async () => {
                             if (confirm(`Delete module "${section.title}"?`)) {
                               const res = await deleteSection(id, section.id);
                               if (res.success) refreshData();
                             }
                           }}
                           className="p-2 bg-white text-gray-400 hover:text-red-600 border border-gray-100 rounded-full hover:bg-red-50 transition-all shadow-sm"
                           title="Delete Module"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                    </div>

                    {/* Lecture List */}
                    <div className="space-y-1">
                      {section.lectures.map((lecture: any, lIdx: number) => {
                        // Get dynamic styles based on type
                        const style = getTypeStyles(lecture);

                        return (
                          <div 
                            key={lecture.id} 
                            className="flex justify-between items-center p-4 hover:bg-gray-50/80 rounded-2xl transition-all group border border-transparent hover:border-gray-100"
                          >
                            <div className="flex items-start gap-4">
                                {/* Type Icon */}
                                <div className={`p-2 rounded-xl ${style.color} shrink-0`}>
                                   {style.icon}
                                </div>

                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-800 text-sm leading-tight">
                                      {lIdx + 1}. {lecture.title}
                                    </span>
                                    
                                    <div className="flex items-center gap-3 mt-1.5">
                                      {/* Type Badge */}
                                      <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                        {style.label}
                                      </span>
                                      
                                      {/* Meta Info (Duration/Count) */}
                                      <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 uppercase tracking-tight">
                                        {lecture.type === "VIDEO" && <Clock size={10} />}
                                        {style.meta}
                                      </div>

                                      {/* Free Preview Badge */}
                                      {lecture.isFree && (
                                        <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                          Free
                                        </span>
                                      )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* EDIT BUTTON */}
                              <button
                                onClick={() => openEditModal(section.id, lecture)}
                                className="p-2 bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-600 rounded-xl transition-all shadow-sm"
                                title="Edit Content"
                              >
                                <Edit size={16} strokeWidth={2.5} />
                              </button>

                              {/* DELETE BUTTON */}
                              {/* <button
                                onClick={async (e) => {
                                  e.preventDefault();
                                  if (confirm("Delete this item?")) {
                                    const res = await deleteLecture(id, section.id, lecture.id);
                                    if (res.success) refreshData();
                                  }
                                }}
                                className="p-2 bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all shadow-sm"
                                title="Delete Content"
                              >
                                <Trash2 size={16} strokeWidth={2.5} />
                              </button> */}
                              {/* DELETE BUTTON */}
                              <button
                                onClick={() => handleDelete(section.id, lecture.id, lecture.title)}
                                className="p-2.5 bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all shadow-sm"
                                title="Delete Content"
                              >
                                <Trash2 size={16} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {section.lectures.length === 0 && (
                        <div className="text-center p-6 border-2 border-dashed border-gray-100 rounded-2xl m-2">
                          <p className="text-xs text-gray-400 font-medium">This module is empty.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && activeSectionId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={closeModal} // Click outside to close
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <AddLectureForm 
              courseId={id} 
              sectionId={activeSectionId} 
              initialData={editingLecture} 
              onSuccess={() => {
                closeModal();
                refreshData();
              }}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}