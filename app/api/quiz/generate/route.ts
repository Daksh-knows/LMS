import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateQuizWithAI } from "@/lib/gemini";

/**
 * Background-safe quiz generation with retry + fallback model
 */
export async function POST(req: Request) {
  try {
    const {
      moduleId,
      position,
      title,
      context,
      difficulty,
      questionCount,
      releaseAt,
      prerequisiteIds,
    } = await req.json();

    if (!moduleId || !title || !context || !questionCount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    const lastItem = await db.lecture.findFirst({
      where: { moduleId: moduleId },
      orderBy: { position: 'desc' }
    });
    const newPosition = (lastItem?.position || 0) + 1;
    /**
     * 1️⃣ Create the QUIZ lecture immediately
     * (NO questions yet)
     */
    const lecture = await db.lecture.create({
      data: {
        title,
        type: "QUIZ",
        moduleId,
        position: newPosition,
        description: JSON.stringify({
          context,
          difficulty,
          questionCount,
          status: "GENERATING",
        }),
        releaseAt: releaseAt ? new Date(releaseAt) : null,
        ...(Array.isArray(prerequisiteIds) && prerequisiteIds.length > 0
          ? {
              prerequisites: {
                create: prerequisiteIds
                  .filter((id: string) => id && id !== "")
                  .map((prerequisiteId: string) => ({ prerequisiteId })),
              },
            }
          : {}),
      },
    });

    /**
     * 2️⃣ Respond immediately (fire-and-forget)
     */
    const response = NextResponse.json({
      success: true,
      lectureId: lecture.id,
    });

    /**
     * 3️⃣ Background generation (non-blocking)
     */
    setTimeout(async () => {
      const totalQuestions = questionCount * 3;
      console.log('questions to be generated:', totalQuestions );

      const MODELS = [
        "gemini-2.5-flash-lite", // fast + cheap
        "gemini-2.5-flash",        // fallback (more stable)
      ];

      let generated = false;
      let lastError: any = null;

      for (const model of MODELS) {
        try {
          console.log(
            `[QUIZ] Generating ${totalQuestions} questions using ${model}`
          );

          const aiQuestions = await generateQuizWithAI({
            context,
            difficulty,
            totalQuestions,
            model,
          });

          // Insert questions
          await db.quizQuestion.createMany({
            data: aiQuestions.map((q: any, idx: number) => ({
              text: q.question,
              position: idx,
              lectureId: lecture.id,
            })),
          });

          // Insert options
          for (let i = 0; i < aiQuestions.length; i++) {
            const question = await db.quizQuestion.findFirst({
              where: {
                lectureId: lecture.id,
                position: i,
              },
            });

            if (!question) continue;

            await db.answerOption.createMany({
              data: aiQuestions[i].options.map((o: any) => ({
                text: o.text,
                isCorrect: o.isCorrect,
                quizQuestionId: question.id,
              })),
            });
          }

          // Mark generation complete
          await db.lecture.update({
            where: { id: lecture.id },
            data: {
              description: JSON.stringify({
                context,
                difficulty,
                questionCount,
                status: "READY",
              }),
              isPublished: true,
            },
          });

          console.log(`[QUIZ] Generation complete for lecture ${lecture.id}`);
          generated = true;
          break;

        } catch (err) {
          console.error(
            `[QUIZ] Generation failed using ${model}:`,
            err
          );
          lastError = err;
        }
      }

      /**
       * 4️⃣ Final failure handling
       */
      if (!generated) {
        console.error(
          `[QUIZ] All attempts failed for lecture ${lecture.id}`,
          lastError
        );

        await db.lecture.update({
          where: { id: lecture.id },
          data: {
            description: JSON.stringify({
              context,
              difficulty,
              questionCount,
              status: "FAILED",
              error: "AI generation failed after retry",
            }),
          },
        });
      }
    }, 0);

    return response;

  } catch (error: any) {
    console.error("Quiz route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create quiz",
      },
      { status: 500 }
    );
  }
}
