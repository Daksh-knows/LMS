import {
  Course as PrismaCourse,
  Module as PrismaModule,
  Lecture as PrismaLecture,
  Attachment,
  FAQ,
  Review,
  Note,
  UserProgress,
} from "../generated/prisma/client";

export interface Lecture extends PrismaLecture {
  resources: Attachment[];
  faqs: FAQ[];
  reviews: Review[];
  userProgress: UserProgress[];
  notes: Note[];
}

export interface Section extends PrismaModule {
  lectures: Lecture[];
}

export interface Course extends PrismaCourse {
  modules: Section[];
}

/**
 * UI-specific types for status tracking
 * Note: Duration is now an Int (minutes) in your DB
 */
export type LectureStatus = "watched" | "watching" | "remaining";

// If you still need a simple review summary object for the UI
export interface ReviewSummary {
  average: number;
  count: number;
  userRating: number | null;
}
