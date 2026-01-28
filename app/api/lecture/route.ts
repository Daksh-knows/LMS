import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ItemType } from "@/app/generated/prisma/enums";
// POST: Add Course Item
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");
    const data = await req.json();

    if (!adminId) return new NextResponse("Unauthorized", { status: 401 });

    const durationInt = data.duration ? parseInt(data.duration) : 0;

    // Find current last position to append the new item
    const lastItem = await db.lecture.findFirst({
      where: { moduleId: data.moduleId },
      orderBy: { position: 'desc' }
    });
    const newPosition = (lastItem?.position || 0) + 1;

    const createData: any = {
      title: data.title,
      moduleId: data.moduleId,
      type: data.type,
      position: newPosition,
      isPublished: true,
      isFree: data.isFree || false,
    };

    // --- Handling Different Lecture Types ---

    if (data.type === 'VIDEO') {
      createData.videoUrl = data.videoUrl;
      createData.duration = durationInt;
      if (data.attachments?.length > 0) {
        createData.resources = {
          create: data.attachments.map((att: any) => ({
            title: att.title, url: att.url, type: att.type || "FILE"
          }))
        };
      }
    } 
    // --- NEW: Handling Live Sessions ---
    else if (data.type === 'LIVE') {
      createData.videoUrl = data.videoUrl; // The meeting link
      createData.duration = durationInt;   // Expected duration
      createData.description = data.description; // JSON string with date/time
      
      if (data.attachments?.length > 0) {
        createData.resources = {
          create: data.attachments.map((att: any) => ({
            title: att.title, url: att.url, type: att.type || "LINK"
          }))
        };
      }
    }
    else if (data.type === 'TEXT') {
      createData.textContent = data.htmlContent;
    } 
    else if (data.type === 'ASSIGNMENT') {
      createData.description = data.description;
      if (data.attachments?.length > 0) {
        createData.resources = {
          create: data.attachments.map((att: any) => ({
            title: att.title, url: att.url, type: "SUPPORTING_DOC"
          }))
        };
      }
    } 
    else if (data.type === 'QUIZ') {
      if (data.quizQuestions?.length > 0) {
        createData.quizQuestions = {
          create: data.quizQuestions.map((q: any, idx: number) => ({
            text: q.text,
            position: idx + 1,
            options: {
              create: q.options.map((opt: any) => ({
                text: opt.text, isCorrect: opt.isCorrect
              }))
            }
          }))
        };
      }
    }

    await db.lecture.create({ data: createData });
    return NextResponse.json({ success: true });
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

    if (!adminId || !itemId) return new NextResponse("Missing Parameters", { status: 400 });

    const durationInt = data.duration ? parseInt(data.duration) : 0;

    await db.$transaction(async (tx) => {
      const updateData: any = {
        title: data.title,
        isFree: data.isFree,
      };

      if (data.type === 'VIDEO') {
        updateData.videoUrl = data.videoUrl;
        updateData.duration = durationInt;
        updateData.description = null; // Clear any old live session JSON if converting to video
        
        await tx.attachment.deleteMany({ where: { lectureId: itemId } });
        if (data.attachments?.length > 0) {
          await tx.attachment.createMany({
            data: data.attachments.map((att: any) => ({
              lectureId: itemId, title: att.title, url: att.url, type: att.type || "FILE"
            }))
          });
        }
      } 
      // --- NEW: Handling Live Session Updates ---
      else if (data.type === 'LIVE') {
        updateData.videoUrl = data.videoUrl; // Meeting link
        updateData.duration = durationInt;
        updateData.description = data.description; // JSON string with date/time
        
        await tx.attachment.deleteMany({ where: { lectureId: itemId } });
        if (data.attachments?.length > 0) {
          await tx.attachment.createMany({
            data: data.attachments.map((att: any) => ({
              lectureId: itemId, title: att.title, url: att.url, type: att.type || "LINK"
            }))
          });
        }
      }
      else if (data.type === 'TEXT') {
        updateData.textContent = data.htmlContent;
      } else if (data.type === 'ASSIGNMENT') {
        updateData.description = data.description;
        await tx.attachment.deleteMany({ where: { lectureId: itemId } });
        if (data.attachments?.length > 0) {
          await tx.attachment.createMany({
            data: data.attachments.map((att: any) => ({
              lectureId: itemId, title: att.title, url: att.url, type: "SUPPORTING_DOC"
            }))
          });
        }
      } else if (data.type === 'QUIZ') {
        await tx.quizQuestion.deleteMany({ where: { lectureId: itemId } });
        if (data.quizQuestions?.length > 0) {
          for (const [idx, q] of data.quizQuestions.entries()) {
            await tx.quizQuestion.create({
              data: {
                lectureId: itemId,
                text: q.text,
                position: idx + 1,
                options: {
                  create: q.options.map((opt: any) => ({
                    text: opt.text, isCorrect: opt.isCorrect
                  }))
                }
              }
            });
          }
        }
      }

      await tx.lecture.update({ where: { id: itemId }, data: updateData });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[LECTURE_PATCH_ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}