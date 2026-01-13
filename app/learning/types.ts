// app/learning/data.ts

export type LectureStatus = "watched" | "watching" | "remaining";

export interface Resource {
  title: string;
  url: string;
}

export interface ReviewData {
  average: number;
  count: number;
  userRating: number | null;
}

export interface Lecture {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  resources: Resource[];
  overview: string;
  faq: { question: string; answer: string }[];
  review: ReviewData;
  status: LectureStatus; // New field
}

export interface Section {
  id: string;
  title: string;
  lectures: Lecture[];
}

export interface Course {
  courseTitle: string;
  sections: Section[];
}
