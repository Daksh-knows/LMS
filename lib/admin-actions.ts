"use server";

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { ItemType } from '@/app/generated/prisma/enums'; 


export async function getMyManagedCourses(adminId: string) {
  try {
    const courses = await db.course.findMany({
      where: { adminId: adminId },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        _count: {
          select: { modules: true, students: true }
        }
      }
    });

    return courses.map(course => ({
      id: course.id,
      title: course.title,
      tags: course.category ? [course.category.name] : ["General"],
      imageUrl: course.imageUrl,
      isPublished: course.isPublished
    }));
  } catch (error) {
    console.error("Fetch Courses Error:", error);
    return [];
  }
}

export async function deleteCourse(courseId: string, adminId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) return { success: false, error: "Course not found" };
    if (course.adminId !== adminId) {
      return { success: false, error: "Unauthorized" };
    }

    await db.course.delete({ where: { id: courseId } });
    revalidatePath('/dashboard/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to delete course." };
  }
}

export async function addCourse(data: {
  title: string;
  subtitle: string;
  image: string;
  tags: string[];
}) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    let categoryId = null;
    if (data.tags && data.tags.length > 0) {
      const categoryName = data.tags[0];
      const category = await db.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
      categoryId = category.id;
    }

    const newCourse = await db.course.create({
      data: {
        title: data.title,
        description: data.subtitle,
        imageUrl: data.image,
        adminId: session.user.id,
        categoryId: categoryId,
        isPublished: false,
      },
    });

    revalidatePath("/dashboard/admin");
    return { success: true, id: newCourse.id };
  } catch (error) {
    return { success: false, error: "Failed to create course." };
  }
}

export async function updateCourse(courseId: string, updatedData: any, adminId: string) {
  try {
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.adminId !== adminId) {
      return { success: false, error: "Unauthorized" };
    }

    const dataToUpdate: any = {
      title: updatedData.title,
      description: updatedData.description || updatedData.subtitle,
      imageUrl: updatedData.image || updatedData.imageUrl,
    };

    if (updatedData.tags && updatedData.tags.length > 0) {
      const categoryName = updatedData.tags[0];
      const category = await db.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
      dataToUpdate.categoryId = category.id;
    }

    await db.course.update({
      where: { id: courseId },
      data: dataToUpdate,
    });

    revalidatePath('/dashboard/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- MODULE & CONTENT FETCHING ---

export async function getCourseContent(courseId: string) {
  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { position: 'asc' },
          include: {
            // Fetch Lectures (now acting as CourseItems)
            lectures: {
              orderBy: { position: 'asc' },
              include: {
                resources: true,      // Attachments
                quizQuestions: {      // Quiz Data
                  include: { options: true },
                  orderBy: { position: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    if (!course) return { success: false, error: "Course not found." };

    // Map DB structure to UI structure
    const sections = course.modules.map(mod => ({
      id: mod.id,
      title: mod.title,
      lectures: mod.lectures.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type, 
        isPublished: item.isPublished,
        isFree: item.isFree,
        
        // Mapped Fields
        videoUrl: item.videoUrl,
        duration: item.duration,
        htmlContent: item.textContent, // Map DB 'textContent' to UI 'htmlContent'
        description: item.description, // Used for assignment instructions
        
        attachments: item.resources,   // Map DB 'resources' to UI 'attachments'
        questions: item.quizQuestions,
      }))
    }));

    return { 
      success: true, 
      courseTitle: course.title, 
      sections: sections 
    };
  } catch (error: any) {
    console.error("Fetch Content Error:", error);
    return { success: false, error: "Failed to load content." };
  }
}

export async function addModule(courseId: string, sectionTitle: string) {
  try {
    const lastModule = await db.module.findFirst({
      where: { courseId },
      orderBy: { position: 'desc' }
    });
    const newPosition = (lastModule?.position || 0) + 1;

    await db.module.create({
      data: {
        title: sectionTitle,
        courseId: courseId,
        position: newPosition,
        isPublished: true
      }
    });

    revalidatePath(`/dashboard/admin/add-module/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSection(courseId: string, sectionId: string) {
  try {
    await db.module.delete({ where: { id: sectionId } });
    revalidatePath(`/dashboard/admin/add-module/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- POLYMORPHIC ITEM ACTIONS (Add/Update/Delete) ---

// This type helps TS understand what the UI sends
type CourseItemInput = {
  courseId: string;
  moduleId: string;
  title: string;
  type: ItemType; 
  isFree?: boolean;
  videoUrl?: string;
  duration?: string;
  htmlContent?: string;
  description?: string;
  attachments?: { title: string; url: string; type: string }[];
  quizQuestions?: {
    text: string;
    options: { text: string; isCorrect: boolean }[];
  }[];
}

// Named "addCourseItem" to match your UI Import
export async function addCourseItem(data: CourseItemInput) {
  try {
    const durationInt = data.duration ? parseInt(data.duration) : 0;

    // Find position
    const lastItem = await db.lecture.findFirst({
      where: { moduleId: data.moduleId },
      orderBy: { position: 'desc' }
    });
    const newPosition = (lastItem?.position || 0) + 1;

    // Construct Base Data for "Lecture" table
    const createData: any = {
      title: data.title,
      moduleId: data.moduleId,
      type: data.type,
      position: newPosition,
      isPublished: true,
      isFree: data.isFree || false,
    };

    // 1. VIDEO
    if (data.type === 'VIDEO') {
      createData.videoUrl = data.videoUrl;
      createData.duration = durationInt;
      if (data.attachments && data.attachments.length > 0) {
        createData.resources = { // DB Relation is 'resources'
          create: data.attachments.map(att => ({
            title: att.title,
            url: att.url,
            type: att.type || "FILE"
          }))
        };
      }
    } 
    // 2. TEXT
    else if (data.type === 'TEXT') {
      createData.textContent = data.htmlContent; // DB Field is 'textContent'
    } 
    // 3. ASSIGNMENT
    else if (data.type === 'ASSIGNMENT') {
      createData.description = data.description;
      if (data.attachments && data.attachments.length > 0) {
        createData.resources = {
          create: data.attachments.map(att => ({
            title: att.title,
            url: att.url,
            type: "SUPPORTING_DOC"
          }))
        };
      }
    } 
    // 4. QUIZ
    else if (data.type === 'QUIZ') {
      if (data.quizQuestions && data.quizQuestions.length > 0) {
        createData.quizQuestions = {
          create: data.quizQuestions.map((q, idx) => ({
            text: q.text,
            position: idx + 1,
            options: {
              create: q.options.map(opt => ({
                text: opt.text,
                isCorrect: opt.isCorrect
              }))
            }
          }))
        };
      }
    }

    await db.lecture.create({ data: createData });

    revalidatePath(`/dashboard/admin/add-module/${data.courseId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Add Item Error:", error);
    return { success: false, error: error.message };
  }
}

// Named "updateCourseItem" to match your UI Import
export async function updateCourseItem(itemId: string, data: CourseItemInput) {
  try {
    const durationInt = data.duration ? parseInt(data.duration) : 0;

    await db.$transaction(async (tx) => {
      // 1. Base Update
      const updateData: any = {
        title: data.title,
        isFree: data.isFree,
      };

      // 2. Handle Types
      if (data.type === 'VIDEO') {
        updateData.videoUrl = data.videoUrl;
        updateData.duration = durationInt;

        // Sync Attachments
        await tx.attachment.deleteMany({ where: { lectureId: itemId } });
        if (data.attachments && data.attachments.length > 0) {
          await tx.attachment.createMany({
            data: data.attachments.map(att => ({
              lectureId: itemId,
              title: att.title,
              url: att.url,
              type: att.type || "FILE"
            }))
          });
        }
      } 
      else if (data.type === 'TEXT') {
        updateData.textContent = data.htmlContent;
      } 
      else if (data.type === 'ASSIGNMENT') {
        updateData.description = data.description;

        await tx.attachment.deleteMany({ where: { lectureId: itemId } });
        if (data.attachments && data.attachments.length > 0) {
          await tx.attachment.createMany({
            data: data.attachments.map(att => ({
              lectureId: itemId,
              title: att.title,
              url: att.url,
              type: "SUPPORTING_DOC"
            }))
          });
        }
      } 
      else if (data.type === 'QUIZ') {
        // Simple strategy: delete existing questions (cascades options) and recreate
        await tx.quizQuestion.deleteMany({ where: { lectureId: itemId } });
        
        if (data.quizQuestions && data.quizQuestions.length > 0) {
          for (const [idx, q] of data.quizQuestions.entries()) {
             await tx.quizQuestion.create({
               data: {
                 lectureId: itemId,
                 text: q.text,
                 position: idx + 1,
                 options: {
                   create: q.options.map(opt => ({
                     text: opt.text,
                     isCorrect: opt.isCorrect
                   }))
                 }
               }
             });
          }
        }
      }

      await tx.lecture.update({
        where: { id: itemId },
        data: updateData,
      });
    });

    revalidatePath(`/dashboard/admin/add-module/${data.courseId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Update Item Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteLecture(courseId: string, sectionId: string, lectureId: string) {
  try {
    await db.lecture.delete({ where: { id: lectureId } });
    revalidatePath(`/dashboard/admin/add-module/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}