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
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      
      const response = await fetch(`${baseUrl}/api/course/${courseId}/content?adminId=${adminId}`);
      if (!response.ok) throw new Error("Failed to fetch curriculum");
      
      const data = await response.json();
      if (data.success) {
        setSections(data.sections || []);
        setCourseTitle(data.courseTitle);
      } else {
        showToast.error(data.error);
      }
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
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      const user: any = await getSession();
      const adminId = user?.user?.id;
      
      const promises = sections.map(section => {
        const orderedLectureIds = section.lectures.map((l: any) => l.id);
        return fetch(`${baseUrl}/api/lecture/reorder`, {
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    // 2. Trigger your global confirm modal
    confirm(
      "Delete module?",
      `Are you sure you want to delete the module "${title}"? This action cannot be undone.`,
      async () => {
        try {
          const response = await fetch(
            `${baseUrl}/api/course/${id}/module/${moduleId}?adminId=${user?.user?.id}`,
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
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
            const response = await fetch(`${baseUrl}/api/lecture/${lectureId}`, { 
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
      <div className="min-h-screen pb-32 transition-colors duration-500" style={{ backgroundColor: 'var(--color-background)' }}>
        {/* Header: Uses .glass-header for the sticky effect */}
        <header className="glass-header">
          <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/admin" className="btn-ghost">
                <ArrowLeft size={20} />
              </Link>
              
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg hidden sm:flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-brand-muted)' }}
                >
                  <Layout size={16} style={{ color: 'var(--color-brand-blue)' }} />
                </div>
                <div>
                  <span 
                    className="text-[10px] font-bold uppercase tracking-widest block leading-none mb-1"
                    style={{ color: 'var(--color-brand-blue)' }}
                  >
                    Curriculum Manager
                  </span>
                  <h1 
                    className="text-lg md:text-xl font-bold leading-none truncate max-w-[200px] md:max-w-md"
                    style={{ color: 'var(--color-foreground)' }}
                  >
                    {courseTitle}
                  </h1>
                </div>
              </div>
            </div>
            
            {hasUnsavedChanges && (
              <div className="badge-unsaved">
                <div className="w-2 h-2 rounded-full bg-current" />
                <span>Unsaved Changes</span>
              </div>
            )}
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
          
          {/* Quick Add Module - Uses .card-base */}
          <section className="card-base">
            <div className="card-header">
              <PlusCircle size={18} style={{ color: 'var(--color-foreground)', opacity: 0.5 }} />
              <h2 
                className="text-sm font-bold uppercase tracking-wide"
                style={{ color: 'var(--color-foreground)', opacity: 0.7 }}
              >
                Quick Add Module
              </h2>
            </div>
            <div className="p-6">
              <AddModuleForm courseId={id} refreshData={() => loadContent(id)} />
            </div>
          </section>

          {/* Curriculum Map */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 
                className="text-xl font-bold"
                style={{ color: 'var(--color-foreground)' }}
              >
                Curriculum Map
              </h2>
              <button 
                onClick={() => setExpandedSections([])} 
                className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-colors hover:opacity-100 cursor-pointer border-1 rounded-xl"
                style={{ 
                  backgroundColor: 'var(--color-card-muted)',
                  color: 'var(--color-foreground)',
                  opacity: 0.7
                }}
              >
                Collapse All
              </button>
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
                    <div 
                      className="py-10 text-center"
                      style={{ backgroundColor: 'var(--color-card-muted)' }}
                    >
                      <p className="text-sm italic" style={{ color: 'var(--color-foreground)', opacity: 0.4 }}>
                        This module is empty. Add a lecture to get started.
                      </p>
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

        {/* Floating Save Button - Uses .btn-floating */}
        <div 
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
            hasUnsavedChanges ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-95"
          }`}
        >
          <button onClick={saveOrder} className="btn-floating">
            <div 
              className="p-1 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Save size={18} />
            </div>
            <span>Save Changes</span>
          </button>
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && activeSectionId && (
          <div 
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-300" 
            onClick={() => setIsModalOpen(false)}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
          >
            <div 
              className="mt-20 w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300 border"
              style={{ 
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
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