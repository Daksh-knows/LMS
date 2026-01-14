"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, PlusCircle, Layout, Plus, Video, X, Trash2 } from "lucide-react";
import Link from "next/link";
import AddModuleForm from "@/components/AddModuleForm";
import AddLectureForm from "@/components/AddLectureForm";
import { getCourseContent, deleteLecture, deleteSection } from "@/lib/admin-actions";

export default function AddModulePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");
  const [content, setContent] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<{ id: string; title: string } | null>(null);

  // Load data on mount
  useEffect(() => {
    params.then(async (resolvedParams) => {
      setId(resolvedParams.id);
      const res = await getCourseContent(resolvedParams.id);
      if (res.success) setContent(res);
    });
  }, [params]);

  const refreshData = async () => {
    const res = await getCourseContent(id);
    if (res.success) setContent(res);
  };

  if (!content) return <div className="p-12 text-center font-bold text-gray-400">Loading Curriculum...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto transition-all duration-500">
        
        {/* --- BACK BUTTON --- */}
        <Link 
          href="/dashboard/admin" 
          className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-all group w-fit"
        >
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:bg-gray-100 border border-gray-100">
            <ArrowLeft size={18} />
          </div>
          <span className="font-semibold">Back to Dashboard</span>
        </Link>

        <div className={`grid gap-10 items-start transition-all duration-500 ${
          activeSection ? "lg:grid-cols-12" : "grid-cols-1"}`}>
          
          {/* --- LEFT: MAIN CONTENT --- */}
          <div className={`transition-all duration-500 ease-in-out ${
            activeSection ? "lg:col-span-7" : "w-full max-w-4xl mx-auto"
          }`}>
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
                <section className="space-y-6">
                  <div className="flex items-center gap-2">
                    <PlusCircle size={22} className="text-green-600" />
                    <h2 className="text-xl font-bold text-gray-800">Add New Module (Section)</h2>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <AddModuleForm courseId={id} />
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-800 px-2">Current Curriculum</h2>
                  <div className="space-y-6">
                    {content.sections?.map((section: any, idx: number) => (
                      <div key={section.id} className="border border-gray-100 rounded-3xl p-2 bg-white shadow-sm">
                        <div className="p-4 bg-gray-50/50 rounded-2xl mb-2 flex justify-between items-center">
                           <h3 className="font-bold text-blue-600 uppercase text-xs tracking-widest">
                             {idx + 1}. {section.title}
                           </h3>
                           
                           {/* --- SECTION ACTIONS --- */}
                           <div className="flex items-center gap-2">
                             <button 
                               onClick={() => setActiveSection({ id: section.id, title: section.title })}
                               className="flex items-center gap-2 text-[10px] font-black bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-95"
                             >
                               <Plus size={14} /> ADD LECTURE
                             </button>

                             {/* DELETE MODULE BUTTON */}
                             <button
                               onClick={async () => {
                                 if (confirm(`Are you sure you want to delete the entire module "${section.title}"? All lectures inside will be lost.`)) {
                                   const res = await deleteSection(id, section.id);
                                   if (res.success) {
                                     if (activeSection?.id === section.id) setActiveSection(null);
                                     refreshData();
                                   }
                                 }
                               }}
                               className="p-2 bg-white text-gray-400 hover:text-red-600 border border-gray-100 rounded-full hover:bg-red-50 transition-all shadow-sm"
                               title="Delete Module"
                             >
                               <Trash2 size={16} />
                             </button>
                           </div>
                        </div>

                        <div className="space-y-1">
                          {section.lectures.map((lecture: any, lIdx: number) => (
                            <div 
                                key={lecture.id} 
                                className="flex justify-between items-center p-4 hover:bg-gray-50/80 rounded-2xl transition-all group border border-transparent hover:border-gray-100"
                            >
                                <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-800">
                                    {lIdx + 1}. {lecture.title}
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                        Duration: {lecture.duration}
                                    </span>
                                    </div>
                                </div>
                                </div>

                                <button
                                  onClick={async (e) => {
                                      e.preventDefault();
                                      if (confirm("Delete this lecture?")) {
                                        const res = await deleteLecture(id, section.id, lecture.id);
                                        if (res.success) refreshData();
                                      }
                                  }}
                                  className="flex items-center justify-center p-2.5 bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all shadow-sm active:scale-90"
                                  title="Delete Lecture"
                                >
                                  <Trash2 size={18} strokeWidth={2.5} />
                                </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* --- RIGHT: LECTURE FORM SIDEBAR --- */}
          {activeSection && (
            <div className="lg:col-span-5 sticky top-12 animate-in slide-in-from-right duration-300">
               <div className="bg-white rounded-[2.5rem] border-2 border-blue-600 shadow-2xl p-8 relative">
                 <button 
                   onClick={() => setActiveSection(null)}
                   className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 transition-colors"
                 >
                   <X size={24} />
                 </button>

                 <div className="mb-8">
                   <div className="flex items-center gap-2 text-blue-600 mb-2">
                     <Video size={20} />
                     <span className="text-xs font-black uppercase tracking-widest">Add Content</span>
                   </div>
                   <h2 className="text-xl font-bold text-gray-900 leading-tight">
                     Adding to: <span className="text-blue-600">{activeSection.title}</span>
                   </h2>
                 </div>

                 <AddLectureForm 
                   courseId={id} 
                   sectionId={activeSection.id} 
                   onSuccess={() => {
                     setActiveSection(null);
                     refreshData();
                   }} 
                 />
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}