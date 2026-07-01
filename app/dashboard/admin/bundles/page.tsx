"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";
import { showToast } from "@/utils/Toast";
import toast from "react-hot-toast";

interface Course {
  id: string;
  title: string;
}

interface Bundle {
  id: string;
  title: string;
  description: string;
  price: number;
  isPublished: boolean;
  courses: Course[];
}

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    isPublished: false,
    courseIds: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const bundlesRes = await fetch("/api/admin/bundles");
      const bundlesData = await bundlesRes.json();

      if (bundlesData.success) {
        setBundles(bundlesData.bundles);
        setCourses(bundlesData.courses || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.loading("Saving bundle...");
    
    try {
      const url = editingBundleId 
        ? `/api/admin/bundles/${editingBundleId}` 
        : `/api/admin/bundles`;
      
      const method = editingBundleId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      toast.dismiss();

      if (data.success) {
        showToast.success("Bundle saved successfully");
        setIsModalOpen(false);
        fetchData();
      } else {
        showToast.error(data.error || "Failed to save bundle");
      }
    } catch (error) {
      toast.dismiss();
      showToast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bundle?")) return;
    
    toast.loading("Deleting bundle...");
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      toast.dismiss();

      if (data.success) {
        showToast.success("Bundle deleted");
        fetchData();
      } else {
        showToast.error(data.error || "Failed to delete bundle");
      }
    } catch (error) {
      toast.dismiss();
      showToast.error("An error occurred");
    }
  };

  const openModal = (bundle?: Bundle) => {
    if (bundle) {
      setEditingBundleId(bundle.id);
      setFormData({
        title: bundle.title,
        description: bundle.description || "",
        price: bundle.price.toString(),
        isPublished: bundle.isPublished,
        courseIds: bundle.courses.map(c => c.id)
      });
    } else {
      setEditingBundleId(null);
      setFormData({
        title: "",
        description: "",
        price: "",
        isPublished: false,
        courseIds: []
      });
    }
    setIsModalOpen(true);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Manage Course Bundles</h1>
        <button 
          onClick={() => openModal()}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" /> Create Bundle
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Title</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Courses</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bundles.map(bundle => (
              <tr key={bundle.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{bundle.title}</td>
                <td className="px-6 py-4">₹{bundle.price}</td>
                <td className="px-6 py-4">{bundle.courses.length} courses</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${bundle.isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {bundle.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openModal(bundle)} className="text-blue-600 hover:text-blue-800 p-2">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(bundle.id)} className="text-red-600 hover:text-red-800 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {bundles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No bundles created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">{editingBundleId ? 'Edit' : 'Create'} Bundle</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 h-20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                <input 
                  type="number" required min="0" step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Courses</label>
                <div className="border border-slate-300 rounded-lg p-3 h-40 overflow-y-auto bg-slate-50">
                  {courses.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No courses found.</p>
                  ) : (
                    <div className="space-y-2">
                      {courses.map((course) => (
                        <label key={course.id} className="flex items-start gap-3 cursor-pointer p-1.5 hover:bg-slate-200 rounded">
                          <input
                            type="checkbox"
                            className="mt-1 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                            checked={formData.courseIds.includes(course.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, courseIds: [...formData.courseIds, course.id] });
                              } else {
                                setFormData({ ...formData, courseIds: formData.courseIds.filter(id => id !== course.id) });
                              }
                            }}
                          />
                          <span className="text-sm text-slate-700">{course.title}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" id="isPublished"
                  checked={formData.isPublished}
                  onChange={e => setFormData({...formData, isPublished: e.target.checked})}
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-slate-700">Publish Bundle</label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Bundle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
