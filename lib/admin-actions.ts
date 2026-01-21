"use server"

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth-utils';
import { createCourseRecord } from './course-actions';

const coursesPath = path.join(process.cwd(), 'data', 'courses.json');
const usersPath = path.join(process.cwd(), 'data', 'user.json');
const courseDataPath = path.join(process.cwd(), 'data', 'courseData.json');

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

export async function addCourse(formData: { 
  title: string; 
  description?: string; 
  imageUrl?: string; 
  price?: number; 
}) {
  try {
    // 1. Get user from secure session
    const user = await getCurrentUser();
    console.log("Current User in addCourse:", user);
    // 2. Security Check (Role-based access)
    if (!user || user.role !== 'ADMIN') { // Matches @default("STUDENT") in your schema
      throw new Error("Unauthorized: Only admins can create courses.");
    }

    // 3. Create the entry in PostgreSQL via Prisma
    const newCourse = await createCourseRecord(formData, user.id);

    // 4. Refresh the Admin Dashboard
    revalidatePath('/dashboard/admin');

    return { success: true, course: newCourse };
  } catch (error: any) {
    console.error("Prisma Create Error:", error.message);
    return { 
      success: false, 
      error: error.message || "Failed to create course in database." 
    };
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


export async function getCourseContent(courseId: string) {
  try {
    // 1. Read the courseData.json file
    const fileData = await fs.readFile(courseDataPath, 'utf8');
    const allCourses = JSON.parse(fileData);

    // 2. Find the course that matches the courseId from the URL
    // Note: We use string comparison because URL params are always strings
    const targetCourse = allCourses.find((c: any) => c.courseId === courseId);

    if (!targetCourse) {
      return { success: false, error: "Course content not found." };
    }

    // 3. Return the sections (which contain the modules/lectures)
    return { 
      success: true, 
      courseTitle: targetCourse.courseTitle,
      sections: targetCourse.sections 
    };
  } catch (error: any) {
    console.error("Fetch Content Error:", error.message);
    return { success: false, error: "Failed to load course content." };
  }
}

export async function addModule(courseId: string, sectionTitle: string) {
  try {
    // 1. Update courses.json (Increment total count)
    const coursesRaw = await fs.readFile(coursesPath, 'utf8');
    const courses = JSON.parse(coursesRaw);
    const courseIndex = courses.findIndex((c: any) => c.id === courseId);

    if (courseIndex !== -1) {
      courses[courseIndex].totalModules += 1;
      courses[courseIndex].subtitle = `New Section: ${sectionTitle}`;
      await fs.writeFile(coursesPath, JSON.stringify(courses, null, 2));
    }

    // 2. Update courseData.json (Add as a NEW SECTION)
    const detailRaw = await fs.readFile(courseDataPath, 'utf8');
    const details = JSON.parse(detailRaw);
    const detailIndex = details.findIndex((d: any) => d.courseId === courseId);

    if (detailIndex !== -1) {
      // Create a new section object instead of a lecture
      const newSection = {
        id: `s${Date.now()}`, 
        title: sectionTitle, // This will now appear in blue
        lectures: []        // Starts with an empty list of lectures
      };

      // Push to the sections array
      details[detailIndex].sections.push(newSection);
      await fs.writeFile(courseDataPath, JSON.stringify(details, null, 2));
    }

    revalidatePath(`/dashboard/admin/add-module/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addLecture(
  courseId: string, 
  sectionId: string, 
  title: string, 
  videoUrl: string,
  duration: string // Now passed from the UI
) {
  try {
    const detailRaw = await fs.readFile(courseDataPath, 'utf8');
    const details = JSON.parse(detailRaw);
    
    const courseIndex = details.findIndex((d: any) => d.courseId === courseId);
    if (courseIndex === -1) throw new Error("Course not found");

    const sectionIndex = details[courseIndex].sections.findIndex((s: any) => s.id === sectionId);
    if (sectionIndex === -1) throw new Error("Section not found");

    const newLecture = {
      id: `l${Date.now()}`,
      title: title,
      duration: duration, // Custom input value
      videoUrl: videoUrl,
      status: "not_started" 
    };

    details[courseIndex].sections[sectionIndex].lectures.push(newLecture);
    
    await fs.writeFile(courseDataPath, JSON.stringify(details, null, 2));
    revalidatePath(`/dashboard/admin/add-module/${courseId}`);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLecture(courseId: string, sectionId: string, lectureId: string) {
  try {
    // 1. Update courseData.json (Remove the lecture)
    const detailRaw = await fs.readFile(courseDataPath, 'utf8');
    const details = JSON.parse(detailRaw);
    
    const courseIndex = details.findIndex((d: any) => d.courseId === courseId);
    if (courseIndex === -1) throw new Error("Course not found");

    const sectionIndex = details[courseIndex].sections.findIndex((s: any) => s.id === sectionId);
    if (sectionIndex === -1) throw new Error("Section not found");

    // Filter out the specific lecture
    details[courseIndex].sections[sectionIndex].lectures = 
      details[courseIndex].sections[sectionIndex].lectures.filter((l: any) => l.id !== lectureId);
    
    await fs.writeFile(courseDataPath, JSON.stringify(details, null, 2));

    // 2. Update courses.json (Decrement totalModules count)
    const coursesRaw = await fs.readFile(coursesPath, 'utf8');
    const courses = JSON.parse(coursesRaw);
    const mainCourseIndex = courses.findIndex((c: any) => c.id === courseId);

    if (mainCourseIndex !== -1 && courses[mainCourseIndex].totalModules > 0) {
      courses[mainCourseIndex].totalModules -= 1;
      await fs.writeFile(coursesPath, JSON.stringify(courses, null, 2));
    }

    revalidatePath(`/dashboard/admin/add-module/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function deleteSection(courseId: string, sectionId: string) {
  try {
    // 1. Update courseData.json
    const detailRaw = await fs.readFile(courseDataPath, 'utf8');
    const details = JSON.parse(detailRaw);
    
    const courseIndex = details.findIndex((d: any) => d.courseId === courseId);
    if (courseIndex === -1) throw new Error("Course not found");

    // Find the section to know how many lectures we are removing
    const sectionToDelete = details[courseIndex].sections.find((s: any) => s.id === sectionId);
    const lectureCountToRemove = sectionToDelete?.lectures?.length || 0;

    // Filter out the section
    details[courseIndex].sections = details[courseIndex].sections.filter((s: any) => s.id !== sectionId);
    
    await fs.writeFile(courseDataPath, JSON.stringify(details, null, 2));

    // 2. Update courses.json (Subtract all lectures in that section from totalModules)
    const coursesRaw = await fs.readFile(coursesPath, 'utf8');
    const courses = JSON.parse(coursesRaw);
    const mainCourseIndex = courses.findIndex((c: any) => c.id === courseId);

    if (mainCourseIndex !== -1) {
      courses[mainCourseIndex].totalModules = Math.max(0, courses[mainCourseIndex].totalModules - lectureCountToRemove);
      await fs.writeFile(coursesPath, JSON.stringify(courses, null, 2));
    }

    revalidatePath(`/dashboard/admin/add-module/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}