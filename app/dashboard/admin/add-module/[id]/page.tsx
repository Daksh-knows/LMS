"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, PlusCircle, Layout, Save, X } from "lucide-react"; 
import Link from "next/link";
import AddModuleForm from "@/components/admin/AddModuleForm"; 
import AddLectureForm from "@/components/admin/add-lecture/AddLectureForm"; 
import { getSession } from "next-auth/react";
import { LectureItem } from "@/components/admin/add-module/LectureItem"; 
import { SectionItem } from "@/components/admin/add-module/SectionItem"; 
import { useConfirm } from "@/context/ConfirmContext";
import { showToast } from "@/utils/Toast";
import { BackgroundUploadProvider } from "@/context/BackgroundUploadContext";

export default function AddModulePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState("");
  const {confirm} = useConfirm();
  const [courseType, setCourseType] = useState<string | null>(null);
  // UI State
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingLecture, setEditingLecture] = useState<any>(null);
  
  // --- 1. Initialization ---
  useEffect(() => {
    params.then(async (resolvedParams) => {
      setId(resolvedParams.id);
      loadContent(resolvedParams.id);
    });
  }, [params]);
  
  // --- 2. Expand/Collapse Logic ---
  useEffect(() => {
    if (sections.length > 0) {
      // For this requirement: "initially everything closed other than last"
      // We check if expandedSections is empty to avoid overriding user interaction during reorders
      if (expandedSections.length === 0) {
        setExpandedSections([sections[sections.length - 1].id]);
      }
    }
  }, [sections.length]); // Dependency on length detects new modules
  
  const loadContent = async (courseId: string) => {
    try {
      const user: any = await getSession();
      const adminId = user?.user?.id;
      
      // Fetch Course Type and Content
      const [contentRes, typeRes] = await Promise.all([
        fetch(`/api/course/${courseId}/content?adminId=${adminId}`),
        fetch(`/api/course/${courseId}/type`) 
      ]);

      const data = await contentRes.json();
      const typeData = await typeRes.json();
      console.log("Sections " , data.sections) ;
      if (data.success) {
        setSections(data.sections || []);
        setCourseTitle(data.courseTitle);
      }
      setCourseType(typeData.type); // Store the type (CRASH or PREMIUM)

    } catch (error) {
      console.error("Error loading curriculum:", error);
      showToast.error("Failed to load content");
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- 3. Actions ---
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
    );
  };
  
  const moveLecture = (sectionIndex: number, lectureIndex: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const section = newSections[sectionIndex];
    const lectures = [...section.lectures];
    const targetIndex = direction === 'up' ? lectureIndex - 1 : lectureIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= lectures.length) return;
    
    [lectures[lectureIndex], lectures[targetIndex]] = [lectures[targetIndex], lectures[lectureIndex]];
    newSections[sectionIndex] = { ...section, lectures };
    
    setSections(newSections);
    setHasUnsavedChanges(true);
  };
  
  const saveOrder = async () => {
    try {
      const user: any = await getSession();
      const adminId = user?.user?.id;
      
      const promises = sections.map(section => {
        const orderedLectureIds = section.lectures.map((l: any) => l.id);
        return fetch(`/api/lecture/reorder`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lectureIds: orderedLectureIds, adminId }),
        });
      });
      
      await Promise.all(promises);
      showToast.success("Order saved successfully");
      setHasUnsavedChanges(false);
      setSelectedLectureId(null);
    } catch (error) {
      showToast.error("Failed to save order");
    }
  };
  
  const handleDeleteSection = async (moduleId : any, title : string) => {
    // 1. Get user/session info first
    const user = await getSession();
    
    // 2. Trigger your global confirm modal
    confirm(
      "Delete module?",
      `Are you sure you want to delete the module "${title}"? This action cannot be undone.`,
      async () => {
        try {
          const response = await fetch(
            `/api/course/${id}/module/${moduleId}?adminId=${user?.user?.id}`,
            { method: "DELETE" }
          );
          
          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.error || "Failed to delete");
          }

          showToast.delete("Module deleted successfully");
          loadContent(id);
        } catch (err : any) {
          showToast.error(err.message || "Failed to delete module");
          throw err; 
        }
      }
    );
  };

  const handleDeleteLecture = (lectureId: string, title: string , type: string) => {
    const label = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      confirm(
        "Delete Lecture",
        `Are you sure you want to delete "${title}"? This will permanently remove the ${label} item and all related materials.`,
        async () => {
          try {
            console.log("Attempting to delete lecture with ID:", lectureId);
            const response = await fetch(`/api/lecture/${lectureId}`, { 
              method: "DELETE" 
            });
            
            const data = await response.json();

            if (!data.success) {
              throw new Error(data.error || "Failed to delete lecture");
            }
            console.log('--------------------------------------------');
            console.log("Lecture deleted successfully:", data);
            console.log('--------------------------------------------');
            showToast.delete(`${label} deleted successfully`);
            loadContent(id);
          } catch (error: any) {
            console.error("LECTURE_DELETE_ERROR", error);
            showToast.error(error.message || "Delete failed. Please try again.");
            
            throw error; 
          }
        }
      );
  };


  if (isLoading) return <div className="p-12 text-center text-gray-400 animate-pulse">Loading...</div>;

  return (
    <BackgroundUploadProvider>
      <div className="min-h-screen bg-transparent pb-32">
        {/* Header */}
        <header className="bg-(--sidebar-background) border-b border-(--course-sidebar-border) sticky top-0 z-30 theme-transition">
          <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/admin" className="p-2 text-(--text-color) opacity-70 hover:opacity-100 hover:bg-(--sidebar-nav-bg-hover) rounded-full transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50/20 rounded-md hidden sm:block">
                  <Layout size={16} className="text-blue-600" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 block leading-none mb-0.5 animate-pulse">Curriculum Manager</span>
                  <h1 className="text-lg md:text-xl font-bold text-(--text-color) leading-none truncate max-w-50 md:max-w-md theme-transition">{courseTitle}</h1>
                </div>
              </div>
            </div>
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full border border-orange-100 animate-pulse">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xs font-bold whitespace-nowrap">Unsaved Changes</span>
              </div>
            )}
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
          
          {/* Quick Add Module */}
          <section className="bg-(--sidebar-background) rounded-2xl border border-(--course-sidebar-border) shadow-sm overflow-hidden theme-transition">
            <div className="px-6 py-4 border-b border-(--course-sidebar-border) bg-(--sidebar-background)/50 flex items-center justify-between theme-transition">
              <div className="flex items-center gap-2">
                <PlusCircle size={18} className="text-(--text-color) opacity-70" />
                <h2 className="text-sm font-bold text-(--text-color) uppercase tracking-wide theme-transition">
                  {courseType === "CRASH" ? "Crash Course Modules (Max 2)" : "Quick Add Module"}
                </h2>
              </div>
              {courseType === "CRASH" && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sections.length >= 2 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                  {sections.length} / 2 Used
                </span>
              )}
            </div>
            
            <div className="p-6">
              {courseType === "CRASH" && sections.length >= 2 ? (
                <div className="flex flex-col items-center justify-center py-4 px-6 bg-amber-50 border border-amber-100 rounded-xl text-center">
                  <p className="text-sm text-amber-800 font-medium">
                    Module limit reached for Crash Course.
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Crash courses are designed to be concise and are limited to 2 modules only.
                  </p>
                </div>
              ) : (
                <AddModuleForm courseId={id} refreshData={() => loadContent(id)} />
              )}
            </div>
          </section>

          {/* Curriculum Map */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-bold text-(--text-color) theme-transition">Curriculum Map</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setExpandedSections([])} 
                  className="text-[10px] font-bold text-(--text-color) opacity-80 hover:opacity-100 uppercase tracking-wider bg-(--sidebar-nav-bg-hover) px-2 py-1 rounded cursor-pointer theme-transition"
                >
                  Collapse All
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {sections.map((section: any, sectionIndex: number) => (
                <SectionItem
                  key={section.id}
                  section={section}
                  index={sectionIndex}
                  isExpanded={expandedSections.includes(section.id)}
                  onToggle={() => toggleSection(section.id)}
                  onAddContent={() => { setActiveSectionId(section.id); setEditingLecture(null); setIsModalOpen(true); }}
                  onDelete={() => handleDeleteSection(section.id, section.title)}
                >
                  {section.lectures.length === 0 ? (
                    <div className="py-8 text-center bg-gray-50/30">
                      <p className="text-xs text-gray-400 italic">No content in this module.</p>
                    </div>
                  ) : (
                    section.lectures.map((lecture: any, lectureIndex: number) => (
                      <LectureItem
                        key={lecture.id}
                        lecture={lecture}
                        index={lectureIndex}
                        isSelected={selectedLectureId === lecture.id}
                        isFirst={lectureIndex === 0}
                        isLast={lectureIndex === section.lectures.length - 1}
                        onSelect={() => setSelectedLectureId(selectedLectureId === lecture.id ? null : lecture.id)}
                        onMove={(dir) => moveLecture(sectionIndex, lectureIndex, dir)}
                        onEdit={() => { setActiveSectionId(section.id); setEditingLecture(lecture); setIsModalOpen(true); }}
                        onDelete={() => handleDeleteLecture(lecture.id, lecture.title , lecture.type)}
                        onCancel={() => loadContent(id)}
                      />
                    ))
                  )}
                </SectionItem>
              ))}
            </div>
          </section>
        </main>

        {/* Floating Save Button */}
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${hasUnsavedChanges ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
          <button 
            onClick={saveOrder}
            className="flex items-center gap-3 bg-gray-900 text-white pl-6 pr-8 py-3.5 rounded-full shadow-2xl hover:bg-black hover:scale-105 active:scale-95 transition-all font-bold border border-gray-700"
          >
            <div className="bg-white/20 p-1 rounded-full"><Save size={18} /></div>
            <span>Save Changes</span>
          </button>
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && activeSectionId && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/60 backdrop-blur-sm p-0 sm:p-4 transition-opacity" onClick={() => setIsModalOpen(false)}>
            <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
              {/* <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-900">{editingLecture ? "Edit Content" : "Add New Content"}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                    <X size={20} />
                  </button>
              </div> */}
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <AddLectureForm 
                  courseId={id} 
                  sectionId={activeSectionId} 
                  initialData={editingLecture} 
                  onSuccess={() => { setIsModalOpen(false); loadContent(id); }}
                  onCancel={() => setIsModalOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </BackgroundUploadProvider>
  );
}