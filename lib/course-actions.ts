"use server";

import { db } from "@/lib/db";

export async function getAllCourses() {
  try {
    const courses = await db.course.findMany({
      orderBy: {
        title: 'asc'
      }
    });
    return { success: true, data: courses };
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return { success: false, error: "Failed to load courses from database." };
  }
}

export async function createCourseRecord(formData: { 
  title: string; 
  description?: string; 
  imageUrl?: string; 
  price?: number; 
}, adminId: string) {
  
  const newCourse = await db.course.create({
    data: {
      title: formData.title,
      description: formData.description || "",
      imageUrl: formData.imageUrl || "https://nxtwave.imgix.net/recognized-by-patterns-card1.png",
      price: formData.price || 0,
      adminId: adminId, 
      isPublished: false, 
    },
  });

  return newCourse;
}