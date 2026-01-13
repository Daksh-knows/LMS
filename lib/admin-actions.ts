"use server"

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

const coursesPath = path.join(process.cwd(), 'data', 'courses.json');
const usersPath = path.join(process.cwd(), 'data', 'user.json');

export async function getMyManagedCourses(adminId: string) {
  try {
    const userData = await fs.readFile(usersPath, 'utf8');
    const parsedData = JSON.parse(userData);

    // FIX: Ensure 'users' is always an array so .find() works
    const users = Array.isArray(parsedData) ? parsedData : [parsedData];

    // Now .find() will work even if there is only 1 user in the file
    const activeUser = users.find((u: any) => u.id === adminId);

    if (!activeUser || activeUser.role !== 'admin') {
      console.error(`Unauthorized: ID ${adminId} is not an admin.`);
      return [];
    }

    const courseData = await fs.readFile(coursesPath, 'utf8');
    const allCourses = JSON.parse(courseData);
    
    // Safety check for courses as well
    const coursesArray = Array.isArray(allCourses) ? allCourses : [];

    return coursesArray.filter((course: any) => course.creator === adminId);

  } catch (error) {
    // This logs the error to your terminal (server-side)
    console.error("Server Error in getMyManagedCourses:", error);
    return [];
  }
}

export async function deleteCourse(courseId: string, adminId: string) {
  try {
    // 1. Read the existing courses
    const fileData = await fs.readFile(coursesPath, 'utf8');
    const courses = JSON.parse(fileData);
    
    // Ensure it's an array
    const coursesArray = Array.isArray(courses) ? courses : [];

    // 2. Find the course to verify ownership before deleting
    const courseToDelete = coursesArray.find((c: any) => c.id === courseId);

    if (!courseToDelete) {
      throw new Error("Course not found.");
    }

    // 3. Security Check: Does the admin own this course?
    if (courseToDelete.creator !== adminId) {
      throw new Error("Unauthorized: You can only delete your own courses.");
    }

    // 4. Filter out the deleted course
    const updatedCourses = coursesArray.filter((c: any) => c.id !== courseId);

    // 5. Write the updated array back to courses.json
    // null, 2 keeps the JSON file readable with proper indentation
    await fs.writeFile(coursesPath, JSON.stringify(updatedCourses, null, 2));

    // 6. Refresh the page data
    revalidatePath('/dashboard/admin');

    return { success: true };
  } catch (error: any) {
    console.error("Delete Error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function addCourse(
  formData: { 
    title: string; 
    subtitle?: string; 
    image?: string; 
    totalModules?: number; 
    tags: string[] 
  }, 
  adminId: string
) {
  try {
    // 1. Fetch current courses
    const fileData = await fs.readFile(coursesPath, 'utf8');
    const courses = JSON.parse(fileData);
    const coursesArray = Array.isArray(courses) ? courses : [];

    // 2. Security Check: Is the requester an admin?
    const userData = await fs.readFile(usersPath, 'utf8');
    const users = JSON.parse(userData);
    const usersArray = Array.isArray(users) ? users : [users];
    const isAdmin = usersArray.find(u => u.id === adminId && u.role === 'admin');

    if (!isAdmin) throw new Error("Unauthorized: Only admins can add courses.");

    // 3. Generate New Course Object
    const lastId = coursesArray.length > 0 
      ? Math.max(...coursesArray.map((c: any) => parseInt(c.id))) 
      : 100;

    const newCourse = {
      id: (lastId + 1).toString(),
      title: formData.title,
      // Use provided subtitle or a default
      subtitle: formData.subtitle || "New Course - Get Started",
      // LOGIC: Use provided image URL if it exists, otherwise use default
      image: formData.image && formData.image.trim() !== "" 
        ? formData.image 
        : "https://nxtwave.imgix.net/ccbp-website/nxtwave-intensive-2.0/recognized-by-patterns-card1.png",
      modulesCompleted: 0,
      totalModules: formData.totalModules || 10,
      status: "Not Started",
      tags: formData.tags,
      creator: adminId
    };

    // 4. Update the array and save
    const updatedCourses = [...coursesArray, newCourse];
    await fs.writeFile(coursesPath, JSON.stringify(updatedCourses, null, 2));

    // 5. Revalidate cache
    revalidatePath('/dashboard/admin');

    return { success: true, course: newCourse };
  } catch (error: any) {
    console.error("Add Course Error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function updateCourse(courseId: string, updatedData: any, adminId: string) {
  try {
    // 1. Read existing courses
    const fileData = await fs.readFile(coursesPath, 'utf8');
    const courses = JSON.parse(fileData);
    const coursesArray = Array.isArray(courses) ? courses : [];

    // 2. Find the index of the course to update
    const courseIndex = coursesArray.findIndex((c: any) => c.id === courseId);

    if (courseIndex === -1) {
      throw new Error("Course not found.");
    }

    // 3. Security Check: Does the admin own this course?
    if (coursesArray[courseIndex].creator !== adminId) {
      throw new Error("Unauthorized: You can only edit your own courses.");
    }

    // 4. Update the course while preserving fields like 'id', 'creator', and 'modulesCompleted'
    // unless you specifically want to change them.
    coursesArray[courseIndex] = {
      ...coursesArray[courseIndex], // Keep old data (id, creator, etc.)
      ...updatedData,               // Overwrite with new form data
      // Handle the image logic specifically
      image: updatedData.image && updatedData.image.trim() !== "" 
        ? updatedData.image 
        : "https://nxtwave.imgix.net/ccbp-website/nxtwave-intensive-2.0/recognized-by-patterns-card1.png"
    };

    // 5. Write updated array back to JSON
    await fs.writeFile(coursesPath, JSON.stringify(coursesArray, null, 2));

    // 6. Refresh the cache
    revalidatePath('/dashboard/admin');

    return { success: true };
  } catch (error: any) {
    console.error("Update Error:", error.message);
    return { success: false, error: error.message };
  }
}