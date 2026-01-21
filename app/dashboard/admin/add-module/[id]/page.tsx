"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, PlusCircle, Layout, Plus, Trash2, Edit } from "lucide-react"; 
import Link from "next/link";
import AddModuleForm from "@/components/AddModuleForm";
import AddLectureForm from "@/components/AddLectureForm";
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

  if (!content) return <div className="p-12 text-center font-bold text-gray-400">Loading Curriculum...</div>;

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
                           <Plus size={14} /> ADD LECTURE
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
                      {section.lectures.map((lecture: any, lIdx: number) => (
                        <div 
                            key={lecture.id} 
                            className="flex justify-between items-center p-4 hover:bg-gray-50/80 rounded-2xl transition-all group border border-transparent hover:border-gray-100"
                        >
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-800">
                                {lIdx + 1}. {lecture.title}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                    Duration: {lecture.duration} min 
                                </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* EDIT BUTTON */}
                              <button
                                onClick={() => openEditModal(section.id, lecture)}
                                className="p-2.5 bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600 rounded-xl transition-all shadow-sm"
                                title="Edit Lecture"
                              >
                                <Edit size={18} strokeWidth={2.5} />
                              </button>

                              {/* DELETE BUTTON */}
                              <button
                                onClick={async (e) => {
                                  e.preventDefault();
                                  if (confirm("Delete this lecture?")) {
                                    const res = await deleteLecture(id, section.id, lecture.id);
                                    if (res.success) refreshData();
                                  }
                                }}
                                className="p-2.5 bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all shadow-sm"
                                title="Delete Lecture"
                              >
                                <Trash2 size={18} strokeWidth={2.5} />
                              </button>
                            </div>
                        </div>
                      ))}
                      {section.lectures.length === 0 && (
                        <div className="text-center p-4 text-xs text-gray-400 italic">No lectures added yet.</div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <AddLectureForm 
              courseId={id} 
              sectionId={activeSectionId} 
              initialData={editingLecture} // Pass data if editing
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