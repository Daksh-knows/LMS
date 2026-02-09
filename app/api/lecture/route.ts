import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendLectureNotification } from "@/lib/mail";


export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");
    const data = await req.json();

    if (!adminId) return new NextResponse("Unauthorized", { status: 401 });

    const durationInt = data.duration ? parseInt(data.duration) : 0;

    // 1. Calculate Position
    const lastItem = await db.lecture.findFirst({
      where: { moduleId: data.moduleId },
      orderBy: { position: 'desc' }
    });
    const newPosition = (lastItem?.position || 0) + 1;

    // 2. Prepare Base Data
    const createData: any = {
      title: data.title,
      moduleId: data.moduleId,
      type: data.type, // Dynamic Type
      position: newPosition,
      isPublished: true,
      isFree: data.isFree || false,
    };

    // 3. Handle Specific Types
    if (data.type === 'VIDEO') {
      createData.videoUrl = data.videoUrl;
      createData.duration = durationInt;
      
      // Handle File Attachments (e.g. PDFs uploaded to GCS)
      if (data.attachments && data.attachments.length > 0) {
        createData.resources = {
          create: data.attachments.map((att: any) => ({
            title: att.title,
            url: att.url,
            type: "FILE" // Enforce 'FILE' for video resources
          }))
        };
      }
    } 
    else if (data.type === 'LIVE') {
      createData.videoUrl = data.videoUrl; // Meeting link
      createData.duration = durationInt;
      createData.description = data.description; // JSON with date/time
      
      if (data.attachments && data.attachments.length > 0) {
        createData.resources = {
          create: data.attachments.map((att: any) => ({
            title: att.title,
            url: att.url,
            type: att.type || "LINK"
          }))
        };
      }
    }
    else if (data.type === 'TEXT') {
      createData.textContent = data.htmlContent;
    } 
    else if (data.type === 'ASSIGNMENT') {
      createData.description = data.description;
      
      // Assignments usually have supporting docs (PDFs)
      if (data.attachments && data.attachments.length > 0) {
        createData.resources = {
          create: data.attachments.map((att: any) => ({
            title: att.title,
            url: att.url,
            type: "SUPPORTING_DOC"
          }))
        };
      }
    } 
    else if (data.type === 'QUIZ') {
      if (data.quizQuestions && data.quizQuestions.length > 0) {
        createData.quizQuestions = {
          create: data.quizQuestions.map((q: any, idx: number) => ({
            text: q.text,
            position: idx + 1,
            options: {
              create: q.options.map((opt: any) => ({
                text: opt.text, 
                isCorrect: opt.isCorrect
              }))
            }
          }))
        };
      }
    }

    // 4. Create in Database
    const lecture = await db.lecture.create({
      data: createData,
      include: {
        module: {
          include: {
            course: {
              include: {
                students: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const course = lecture.module.course;
    const enrollments = course.students;

    if (enrollments.length > 0 && ( data.type !== 'VIDEO')) {
      // Use Promise.allSettled so one failed email doesn't crash the API response
      const emailPromises = enrollments.map((en) => {
        if (en.user.email) {
          return sendLectureNotification(
            en.user.email,
            course.title,
            lecture.title,
            lecture.type
          );
        }
      });

      // Execute emails in the background
      Promise.allSettled(emailPromises).catch((err) => 
        console.error("Background Email Error:", err)
      );
    }
    return NextResponse.json({ success: true, lectureId: lecture.id });
  } catch (error: any) {
    console.error("[LECTURE_CREATE_ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Update Course Item
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");
    const itemId = searchParams.get("itemId");
    const data = await req.json();

    if (!adminId || !itemId) {
      return new NextResponse("Missing Parameters", { status: 400 });
    }

    const durationInt = data.duration ? parseInt(data.duration) : 0;

    await db.$transaction(async (tx) => {
      // 1. Prepare Base Update Data
      const updateData: any = {
        title: data.title,
        isFree: data.isFree,
        isPublished: data.isPublished,
      };

      // 2. Handle Logic Based on Lecture Type
      if (data.type === 'VIDEO') {
        updateData.videoUrl = data.videoUrl;
        updateData.duration = durationInt;
        updateData.description = null; // Clean up legacy data if switching types

        // Wipe and Replace Attachments (Handles GCS URLs cleanly)
        await tx.attachment.deleteMany({ where: { lectureId: itemId } });
        
        if (data.attachments && data.attachments.length > 0) {
          await tx.attachment.createMany({
            data: data.attachments.map((att: any) => ({
              lectureId: itemId,
              title: att.title,
              url: att.url,
              type: "FILE" // Enforce 'FILE' type
            }))
          });
        }
      } 
      else if (data.type === 'LIVE') {
        updateData.videoUrl = data.videoUrl;
        updateData.duration = durationInt;
        updateData.description = data.description;
        
        await tx.attachment.deleteMany({ where: { lectureId: itemId } });
        
        if (data.attachments && data.attachments.length > 0) {
          await tx.attachment.createMany({
            data: data.attachments.map((att: any) => ({
              lectureId: itemId,
              title: att.title,
              url: att.url,
              type: att.type || "LINK"
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
            data: data.attachments.map((att: any) => ({
              lectureId: itemId,
              title: att.title,
              url: att.url,
              type: "SUPPORTING_DOC"
            }))
          });
        }
      } 
      else if (data.type === 'QUIZ') {
        // Wipe and Replace Strategy for Quiz Questions
        await tx.quizQuestion.deleteMany({ where: { lectureId: itemId } });
        
        if (data.quizQuestions && data.quizQuestions.length > 0) {
          for (const [idx, q] of data.quizQuestions.entries()) {
            await tx.quizQuestion.create({
              data: {
                lectureId: itemId,
                text: q.text,
                position: idx + 1,
                options: {
                  create: q.options.map((opt: any) => ({
                    text: opt.text, 
                    isCorrect: opt.isCorrect
                  }))
                }
              }
            });
          }
        }
      }

      // 3. Finalize Update
      await tx.lecture.update({ where: { id: itemId }, data: updateData });
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[LECTURE_PATCH_ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}