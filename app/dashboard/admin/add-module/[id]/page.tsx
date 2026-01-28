"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, PlusCircle, Layout, Plus, Trash2, Edit, 
  Video, FileText, SpellCheck, ClipboardList, Clock, 
  TvMinimalIcon, ArrowUp, ArrowDown, Save 
} from "lucide-react"; 
import Link from "next/link";
import AddModuleForm from "@/components/admin/AddModuleForm"; 
import AddLectureForm from "@/components/admin/AddLectureForm"; 
import { toast } from "react-hot-toast";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AddModulePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState("");
  
  // Reordering State
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingLecture, setEditingLecture] = useState<any>(null);

  useEffect(() => {
    params.then(async (resolvedParams) => {
      setId(resolvedParams.id);
      loadContent(resolvedParams.id);
    });
  }, [params]);

  const loadContent = async (courseId: string) => {
    try {
      const user: any = await getSession();
      const adminId = user?.user?.id;
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      
      const response = await fetch(`${baseUrl}/api/course/${courseId}/content?adminId=${adminId}`);
      if (!response.ok) throw new Error("Failed to fetch curriculum");

      const data = await response.json();
      if (data.success) {
        setSections(data.sections || []);
        setCourseTitle(data.courseTitle);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error loading curriculum:", error);
      toast.error("Failed to load course content");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Reordering Logic ---

  const moveLecture = (sectionIndex: number, lectureIndex: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const section = newSections[sectionIndex];
    const lectures = [...section.lectures];

    const targetIndex = direction === 'up' ? lectureIndex - 1 : lectureIndex + 1;

    // Boundary checks
    if (targetIndex < 0 || targetIndex >= lectures.length) return;

    // Swap elements
    [lectures[lectureIndex], lectures[targetIndex]] = [lectures[targetIndex], lectures[lectureIndex]];
    
    // Update state
    newSections[sectionIndex] = { ...section, lectures };
    setSections(newSections);
    setHasUnsavedChanges(true);
  };

  const saveOrder = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      const user: any = await getSession();
      const adminId = user?.user?.id;

      // We need to save the order for ALL sections that might have changed.
      // We will send the entire structure or just iterate and save.
      // Ideally, create a batch update endpoint. For now, we loop through sections.
      
      const promises = sections.map(section => {
        const orderedLectureIds = section.lectures.map((l: any) => l.id);
        return fetch(`${baseUrl}/api/lecture/reorder`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lectureIds: orderedLectureIds, adminId }),
        });
      });

      await Promise.all(promises);

      toast.success("Curriculum order saved!");
      setHasUnsavedChanges(false);
      setSelectedLectureId(null);
    } catch (error) {
      console.error("Save order error:", error);
      toast.error("Failed to save order");
    }
  };

  // --- Existing Handlers ---

  const handleDeleteSection = async (moduleId: string, title: string) => {
    if (!confirm(`Delete module "${title}"?`)) return;

    const user: any = await getSession();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    toast.promise(
      fetch(`${baseUrl}/api/course/${id}/module/${moduleId}?adminId=${user?.user?.id}`, { method: "DELETE" })
        .then(res => res.json())
        .then(data => {
          if (!data.success) throw new Error(data.error);
          loadContent(id);
        }),
      {
        loading: "Deleting section...",
        success: "Section deleted",
        error: (err) => err.message,
      }
    );
  };

  const handleDeleteLecture = async (lectureId: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      const response = await fetch(`${baseUrl}/api/lecture/${lectureId}`, { method: "DELETE" });
      const data = await response.json();
      
      if (data.success) {
        toast.success("Deleted successfully");
        loadContent(id); // Reload to get fresh state
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // --- Modal Helpers ---
  const openAddModal = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setEditingLecture(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sectionId: string, lecture: any) => {
    setActiveSectionId(sectionId);
    setEditingLecture(lecture);
    setIsModalOpen(true);
  };

  const getTypeStyles = (lecture: any) => {
    switch (lecture.type) {
      case "VIDEO": return { icon: <TvMinimalIcon size={18} />, color: "text-blue-600 bg-blue-50", label: "Video" };
      case "TEXT": return { icon: <FileText size={18} />, color: "text-orange-600 bg-orange-50", label: "Article" };
      case "QUIZ": return { icon: <SpellCheck size={18} />, color: "text-emerald-600 bg-emerald-50", label: "Quiz" };
      case "ASSIGNMENT": return { icon: <ClipboardList size={18} />, color: "text-purple-600 bg-purple-50", label: "Assignment" };
      case "LIVE": return { icon: <Video size={18} />, color: "text-red-600 bg-red-50", label: "Live" };
      default: return { icon: <Layout size={18} />, color: "text-gray-600 bg-gray-50", label: "Unknown" };
    }
  };

  if (isLoading) return <div className="p-12 text-center font-bold text-gray-400 animate-pulse">Loading Curriculum...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 pb-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Navigation */}
        <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-all group">
          <div className="p-2 bg-white rounded-full shadow-sm group-hover:bg-gray-100 border border-gray-100">
            <ArrowLeft size={18} />
          </div>
          <span className="font-semibold">Back to Dashboard</span>
        </Link>

        {/* Main Content Card */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
          <div className="bg-white p-8 md:p-12 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-blue-50 rounded-lg">
                 <Layout size={20} className="text-blue-600" />
               </div>
               <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Curriculum Manager</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{courseTitle}</h1>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            
            {/* Add Module Form */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <PlusCircle size={22} className="text-green-600" />
                <h2 className="text-xl font-bold text-gray-800">Add New Module</h2>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <AddModuleForm courseId={id} refreshData={() => loadContent(id)} />
              </div>
            </section>

            {/* Curriculum List */}
            <section className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-bold text-gray-800">Current Curriculum</h2>
                {hasUnsavedChanges && (
                  <span className="text-xs font-bold text-orange-500 animate-pulse">
                    Unsaved changes...
                  </span>
                )}
              </div>

              <div className="space-y-6">
                {sections.map((section: any, sectionIndex: number) => (
                  <div key={section.id} className="border border-gray-100 rounded-3xl p-2 bg-white shadow-sm">
                    
                    {/* Section Header */}
                    <div className="p-4 bg-gray-50/50 rounded-2xl mb-2 flex justify-between items-center">
                       <h3 className="font-bold text-blue-600 uppercase text-xs tracking-widest">
                         {sectionIndex + 1}. {section.title}
                       </h3>
                       <div className="flex items-center gap-2">
                         <button onClick={() => openAddModal(section.id)} className="flex items-center gap-2 text-[10px] font-black bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-95">
                           <Plus size={14} /> ADD
                         </button>
                         <button onClick={() => handleDeleteSection(section.id, section.title)} className="p-2 bg-white text-gray-400 hover:text-red-600 border border-gray-100 rounded-full hover:bg-red-50 transition-all">
                          <Trash2 size={16} />
                        </button>
                       </div>
                    </div>

                    {/* Lectures List */}
                    <div className="space-y-1">
                      {section.lectures.map((lecture: any, lectureIndex: number) => {
                        const style = getTypeStyles(lecture);
                        const isSelected = selectedLectureId === lecture.id;

                        return (
                          <div 
                            key={lecture.id}
                            onClick={() => setSelectedLectureId(isSelected ? null : lecture.id)}
                            className={`
                              relative flex justify-between items-center p-4 rounded-2xl transition-all cursor-pointer border 
                              ${isSelected ? "bg-blue-50/50 border-blue-200 ring-1 ring-blue-200" : "bg-white hover:bg-gray-50 border-transparent hover:border-gray-100"}
                            `}
                          >
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-xl ${style.color} shrink-0`}>
                                   {style.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-800 text-sm leading-tight">
                                      {lectureIndex + 1}. {lecture.title}
                                    </span>
                                    <div className="flex items-center gap-3 mt-1.5">
                                      <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                        {style.label}
                                      </span>
                                      {lecture.isFree && <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Free</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Reorder Controls (Only visible when selected) */}
                              {isSelected && (
                                <div className="flex items-center gap-1 mr-2 bg-white rounded-lg border border-blue-100 p-1 shadow-sm">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); moveLecture(sectionIndex, lectureIndex, 'up'); }}
                                    disabled={lectureIndex === 0}
                                    className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <ArrowUp size={16} />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); moveLecture(sectionIndex, lectureIndex, 'down'); }}
                                    disabled={lectureIndex === section.lectures.length - 1}
                                    className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <ArrowDown size={16} />
                                  </button>
                                </div>
                              )}

                              <button onClick={(e) => { e.stopPropagation(); openEditModal(section.id, lecture); }} className="p-2 bg-gray-100 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50">
                                <Edit size={16} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteLecture(lecture.id, lecture.title); }} className="p-2 bg-gray-100 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {section.lectures.length === 0 && (
                        <div className="text-center p-6 border-2 border-dashed border-gray-100 rounded-2xl m-2">
                          <p className="text-xs text-gray-400">This module is empty.</p>
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

      {/* Floating Save Button */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-8 right-8 animate-in slide-in-from-bottom-4 fade-in duration-300 z-40">
          <button 
            onClick={saveOrder}
            className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform font-bold"
          >
            <Save size={20} />
            Save New Order
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && activeSectionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <AddLectureForm 
              courseId={id} 
              sectionId={activeSectionId} 
              initialData={editingLecture} 
              onSuccess={() => { setIsModalOpen(false); loadContent(id); }}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}