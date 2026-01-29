import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; 

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
      type: "VIDEO", // Hardcoded based on your form context
      position: newPosition,
      isPublished: true,
      isFree: data.isFree || false,
      videoUrl: data.videoUrl,
      duration: durationInt,
    };

    // 3. Handle Attachments
    // The frontend now sends: [{ title: "My PDF", url: "https://storage.googleapis...", type: "FILE" }]
    if (data.attachments && data.attachments.length > 0) {
      createData.resources = {
        create: data.attachments.map((att: any) => ({
          title: att.title,
          url: att.url, 
          type: "FILE" // We force this type since the UI only allows files now
        }))
      };
    }

    // 4. Create in Database
    await db.lecture.create({ data: createData });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[LECTURE_CREATE_ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 

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
        isPublished: data.isPublished, // Optional: if you toggle publishing here
      };

      // 2. Handle Logic Based on Lecture Type
      if (data.type === 'VIDEO') {
        updateData.videoUrl = data.videoUrl;
        updateData.duration = durationInt;
        updateData.description = null; // Clean up potential legacy description data

        // WIPE AND REPLACE STRATEGY
        // First, remove all existing attachments for this lecture
        await tx.attachment.deleteMany({ where: { lectureId: itemId } });

        // Then, insert the new list coming from frontend (which contains Google Cloud URLs)
        if (data.attachments && data.attachments.length > 0) {
          await tx.attachment.createMany({
            data: data.attachments.map((att: any) => ({
              lectureId: itemId,
              title: att.title,
              url: att.url,
              type: "FILE" // Enforcing 'FILE' type as per your new UI logic
            }))
          });
        }
      } 
      
      // --- LIVE SESSION LOGIC ---
      else if (data.type === 'LIVE') {
        updateData.videoUrl = data.videoUrl; // Meeting Link
        updateData.duration = durationInt;
        updateData.description = data.description; // JSON string (date/time/status)
        
        await tx.attachment.deleteMany({ where: { lectureId: itemId } });
        
        if (data.attachments && data.attachments.length > 0) {
          await tx.attachment.createMany({
            data: data.attachments.map((att: any) => ({
              lectureId: itemId,
              title: att.title,
              url: att.url,
              type: att.type || "LINK" // Live sessions might still use Links
            }))
          });
        }
      }
      
      // --- TEXT ARTICLE LOGIC ---
      else if (data.type === 'TEXT') {
        updateData.textContent = data.htmlContent;
      } 
      
      // --- ASSIGNMENT LOGIC ---
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
      
      // --- QUIZ LOGIC ---
      else if (data.type === 'QUIZ') {
        // Wipe all questions and re-create (simplest way to handle reordering/edits)
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
                    text: opt.text, 
                    isCorrect: opt.isCorrect
                  }))
                }
              }
            });
          }
        }
      }

      // 3. Finalize Update on the Lecture Table
      await tx.lecture.update({ where: { id: itemId }, data: updateData });
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[LECTURE_PATCH_ERROR]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}