"use server";

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { db } from '@/lib/db';

/**
 * Fetches courses for the Admin Dashboard.
 * Maps the Database 'Category' relation to the 'tags' array expected by the UI.
 */
export async function getMyManagedCourses(adminId: string) {
  try {
    const courses = await db.course.findMany({
      where: { adminId: adminId },
      orderBy: { createdAt: "desc" },
      include: {
        category: true, // Fetch the related category
        // Get counts for the UI if needed, though your current UI doesn't explicitly show them
        _count: {
          select: { modules: true, students: true }
        }
      }
    });

    // Transform to match the UI interface: { id, title, tags[] }
    return courses.map(course => ({
      id: course.id,
      title: course.title,
      // Map the single DB Category to the "tags" array your UI expects
      tags: course.category ? [course.category.name] : ["General"],
      // Pass other fields if you update the UI later
      imageUrl: course.imageUrl,
      isPublished: course.isPublished
    }));

  } catch (error) {
    console.error("Fetch Courses Error:", error);
    return [];
  }
}

/**
 * Deletes a course and all its related content (Modules, Lectures).
 * Prisma's 'onDelete: Cascade' in the schema handles the children automatically.
 */
export async function deleteCourse(courseId: string, adminId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // 1. Verify Ownership
    const course = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!course) return { success: false, error: "Course not found" };
    if (course.adminId !== adminId) {
      return { success: false, error: "Unauthorized: You do not own this course." };
    }

    // 2. Delete Record (Cascades to Modules -> Lectures)
    await db.course.delete({
      where: { id: courseId },
    });

    revalidatePath('/dashboard/admin');
    return { success: true };
  } catch (error: any) {
    console.error("Delete Error:", error);
    return { success: false, error: "Failed to delete course." };
  }
}

/**
 * Adds a new course.
 * Handles extracting the first tag to create/link a Category.
 */
export async function addCourse(data: {
  title: string;
  subtitle: string; // Mapped to description
  image: string;    // Mapped to imageUrl
  tags: string[];   // Used to find/create Category
  totalModules?: number; // Ignored (DB calculates this dynamically)
}) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // 1. Handle Category
    // We take the first tag as the primary category.
    let categoryId = null;
    if (data.tags && data.tags.length > 0) {
      const categoryName = data.tags[0];
      
      // Upsert: Create if doesn't exist, otherwise return existing
      const category = await db.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
      categoryId = category.id;
    }

    // 2. Create Course
    const newCourse = await db.course.create({
      data: {
        title: data.title,
        description: data.subtitle, // UI calls it subtitle, DB calls it description
        imageUrl: data.image,
        adminId: session.user.id,
        categoryId: categoryId,     // Link the category
        isPublished: false,
      },
    });

    revalidatePath("/dashboard/admin");
    return { success: true, id: newCourse.id };
  } catch (error) {
    console.error("Create Course Error:", error);
    return { success: false, error: "Failed to create course in database." };
  }
}

/**
 * Updates a course.
 */
export async function updateCourse(courseId: string, updatedData: any, adminId: string) {
  try {
    // 1. Verify Ownership
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.adminId !== adminId) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Prepare update data
    const dataToUpdate: any = {
      title: updatedData.title,
      description: updatedData.description || updatedData.subtitle,
      imageUrl: updatedData.image || updatedData.imageUrl,
    };

    // 3. Handle Category Update if tags are provided
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

/**
 * Fetches course content (Modules & Lectures) for the "Edit Curriculum" page.
 * Maps 'Modules' -> 'sections' to match your UI's expectation.
 */
export async function getCourseContent(courseId: string) {
  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { position: 'asc' }, // Order modules 1, 2, 3...
          include: {
            lectures: {
              orderBy: { position: 'asc' } // Order lectures 1, 2, 3...
            }
          }
        }
      }
    });

    if (!course) {
      return { success: false, error: "Course not found." };
    }

    // Map DB structure to the JSON structure your UI expects
    // UI expects: { sections: [{ id, title, lectures: [] }] }
    const sections = course.modules.map(mod => ({
      id: mod.id,
      title: mod.title,
      lectures: mod.lectures.map(lec => ({
        id: lec.id,
        title: lec.title,
        duration: lec.duration,
        videoUrl: lec.videoUrl,
        status: "not_started" // Status is user-specific, not in Admin view usually
      }))
    }));

    return { 
      success: true, 
      courseTitle: course.title,
      sections: sections 
    };
  } catch (error: any) {
    console.error("Fetch Content Error:", error.message);
    return { success: false, error: "Failed to load course content." };
  }
}

/**
 * Adds a new Module (Section) to a course.
 */
export async function addModule(courseId: string, sectionTitle: string) {
  try {
    // 1. Find the highest position to append to the end
    const lastModule = await db.module.findFirst({
      where: { courseId },
      orderBy: { position: 'desc' }
    });
    const newPosition = (lastModule?.position || 0) + 1;

    // 2. Create Module
    await db.module.create({
      data: {
        title: sectionTitle,
        courseId: courseId,
        position: newPosition,
        isPublished: true // Default to true or draft as needed
      }
    });

    revalidatePath(`/dashboard/admin/add-module/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Adds a new Lecture to a Module (Section).
 */
export async function addLecture(
  courseId: string, 
  sectionId: string, 
  title: string, 
  videoUrl: string,
  duration: string,
  attachments: { title: string; url: string, type: string }[] = []
) {
  try {
    // 1. Parse duration (UI sends string "10", DB wants Int)
    const durationInt = parseInt(duration) || 0;

    // 2. Find highest position in this module
    const lastLecture = await db.lecture.findFirst({
      where: { moduleId: sectionId },
      orderBy: { position: 'desc' }
    });
    const newPosition = (lastLecture?.position || 0) + 1;

    // 3. Create Lecture
    await db.lecture.create({
      data: {
        title,
        videoUrl,
        duration: durationInt,
        moduleId: sectionId,
        position: newPosition,
        isPublished: true,
        resources: {
          create: attachments.map((att) => ({
            title: att.title,
            url: att.url,
            type: att.type,
          }))
        },
      },
    });

    revalidatePath(`/dashboard/admin/add-module/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Deletes a lecture.
 */
export async function deleteLecture(courseId: string, sectionId: string, lectureId: string) {
  try {
    await db.lecture.delete({
      where: { id: lectureId }
    });

    revalidatePath(`/dashboard/admin/add-module/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Deletes a Module (Section).
 * Will cascade delete all lectures inside it due to schema settings.
 */
export async function deleteSection(courseId: string, sectionId: string) {
  try {
    await db.module.delete({
      where: { id: sectionId }
    });

    revalidatePath(`/dashboard/admin/add-module/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLecture(
  lectureId: string,
  title: string,
  videoUrl: string,
  duration: string,
  isFree: boolean,
  attachments: { title: string; url: string; type: string }[] = []
) {
  try {
    const durationInt = parseInt(duration) || 0;

    // Use a transaction to update lecture details and replace resources
    await db.$transaction(async (tx) => {
      // 1. Update basic lecture details
      await tx.lecture.update({
        where: { id: lectureId },
        data: {
          title,
          videoUrl,
          duration: durationInt,
          isFree, // Updates the "Free Preview" status
        },
      });

      // 2. Sync Resources: Delete old ones and create new ones
      // This is the simplest way to ensure the DB matches the UI list exactly
      await tx.attachment.deleteMany({
        where: { lectureId: lectureId },
      });

      if (attachments.length > 0) {
        await tx.attachment.createMany({
          data: attachments.map((att) => ({
            lectureId: lectureId,
            title: att.title,
            url: att.url,
            type: att.type || "FILE",
          })),
        });
      }
    });

    // We can't easily get the courseId here without an extra query, 
    // but usually, the frontend triggers a refresh anyway.
    // Ideally, pass courseId to this function if you want strict revalidation path.
    return { success: true };
  } catch (error: any) {
    console.error("Update Lecture Error:", error);
    return { success: false, error: error.message };
  }
}