-- CreateEnum
CREATE TYPE "VideoQuestionType" AS ENUM ('MCQ');

-- AlterTable
ALTER TABLE "AssignmentSubmission" ADD COLUMN     "rubricScores" JSONB;

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "skipCredits" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "Lecture" ADD COLUMN     "releaseAt" TIMESTAMP(3),
ADD COLUMN     "rubric" JSONB;

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "releaseAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "bundleId" TEXT,
ADD COLUMN     "courseId" TEXT;

-- CreateTable
CREATE TABLE "LecturePrerequisite" (
    "id" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,

    CONSTRAINT "LecturePrerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseBundle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoQuestion" (
    "id" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "timestamp" DOUBLE PRECISION NOT NULL,
    "type" "VideoQuestionType" NOT NULL DEFAULT 'MCQ',
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "options" TEXT[],
    "correctAnswer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoQuestionResponse" (
    "id" TEXT NOT NULL,
    "videoQuestionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoQuestionResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CourseToCourseBundle" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseToCourseBundle_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "LecturePrerequisite_lectureId_idx" ON "LecturePrerequisite"("lectureId");

-- CreateIndex
CREATE UNIQUE INDEX "LecturePrerequisite_lectureId_prerequisiteId_key" ON "LecturePrerequisite"("lectureId", "prerequisiteId");

-- CreateIndex
CREATE INDEX "VideoQuestion_lectureId_idx" ON "VideoQuestion"("lectureId");

-- CreateIndex
CREATE INDEX "VideoQuestionResponse_userId_idx" ON "VideoQuestionResponse"("userId");

-- CreateIndex
CREATE INDEX "VideoQuestionResponse_videoQuestionId_idx" ON "VideoQuestionResponse"("videoQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoQuestionResponse_userId_videoQuestionId_key" ON "VideoQuestionResponse"("userId", "videoQuestionId");

-- CreateIndex
CREATE INDEX "_CourseToCourseBundle_B_index" ON "_CourseToCourseBundle"("B");

-- AddForeignKey
ALTER TABLE "LecturePrerequisite" ADD CONSTRAINT "LecturePrerequisite_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LecturePrerequisite" ADD CONSTRAINT "LecturePrerequisite_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "CourseBundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseBundle" ADD CONSTRAINT "CourseBundle_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoQuestion" ADD CONSTRAINT "VideoQuestion_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoQuestionResponse" ADD CONSTRAINT "VideoQuestionResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoQuestionResponse" ADD CONSTRAINT "VideoQuestionResponse_videoQuestionId_fkey" FOREIGN KEY ("videoQuestionId") REFERENCES "VideoQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToCourseBundle" ADD CONSTRAINT "_CourseToCourseBundle_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToCourseBundle" ADD CONSTRAINT "_CourseToCourseBundle_B_fkey" FOREIGN KEY ("B") REFERENCES "CourseBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

