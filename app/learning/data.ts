// app/learning/data.ts

export type LectureStatus = 'watched' | 'watching' | 'remaining';

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

export const courseData: Course = {
  courseTitle: "The Complete JavaScript Course 2026: From Zero to Expert!",
  sections: [
    {
      id: "s1",
      title: "Section 1: Welcome, Welcome, Welcome!",
      lectures: [
        {
          id: "l1",
          title: "1. Course Structure and Projects",
          duration: "5min",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          resources: [{ title: "Syllabus PDF", url: "#" }],
          overview: "In this lecture, we will go over the course structure...",
          faq: [{ question: "Prerequisites?", answer: "None!" }],
          review: { average: 4.8, count: 120, userRating: null },
          status: 'watched' // Status: Watched
        },
        {
          id: "l2",
          title: "2. Read Before You Start!",
          duration: "1min",
          videoUrl: "https://www.youtube.com/embed/M7lc1UVf-VE",
          resources: [],
          overview: "Crucial information regarding software versions.",
          faq: [],
          review: { average: 4.9, count: 50, userRating: 5 },
          status: 'watching' // Status: Currently Watching
        }
      ]
    },
    {
      id: "s2",
      title: "Section 2: JavaScript Fundamentals – Part 1",
      lectures: [
        {
          id: "l3",
          title: "1. Hello World",
          duration: "10min",
          videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
          resources: [{ title: "Starter Code", url: "#" }],
          overview: "Writing your first line of JavaScript code.",
          faq: [],
          review: { average: 4.5, count: 200, userRating: null },
          status: 'remaining' // Status: Remaining
        }
      ]
    },
    {
      id: "s3",
      title: "Section 3: JavaScript Fundamentals – Part 1",
      lectures: [
        {
          id: "l4",
          title: "1. Hello World",
          duration: "10min",
          videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
          resources: [{ title: "Starter Code", url: "#" }],
          overview: "Writing your first line of JavaScript code.",
          faq: [],
          review: { average: 4.5, count: 200, userRating: null },
          status: 'remaining' // Status: Remaining
        }
      ]
    },
    {
      id: "s4",
      title: "Section 4: JavaScript Fundamentals – Part 1",
      lectures: [
        {
          id: "l5",
          title: "1. Hello World",
          duration: "10min",
          videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
          resources: [{ title: "Starter Code", url: "#" }],
          overview: "Writing your first line of JavaScript code.",
          faq: [],
          review: { average: 4.5, count: 200, userRating: null },
          status: 'remaining' // Status: Remaining
        }
      ]
    },
    {
      id: "s5",
      title: "Section 5: JavaScript Fundamentals – Part 1",
      lectures: [
        {
          id: "l6",
          title: "1. Hello World",
          duration: "10min",
          videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
          resources: [{ title: "Starter Code", url: "#" }],
          overview: "Writing your first line of JavaScript code.",
          faq: [],
          review: { average: 4.5, count: 200, userRating: null },
          status: 'remaining' // Status: Remaining
        }
      ]
    },
    {
      id: "s6",
      title: "Section 6: JavaScript Fundamentals – Part 1",
      lectures: [
        {
          id: "l7",
          title: "1. Hello World",
          duration: "10min",
          videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
          resources: [{ title: "Starter Code", url: "#" }],
          overview: "Writing your first line of JavaScript code.",
          faq: [],
          review: { average: 4.5, count: 200, userRating: null },
          status: 'remaining' // Status: Remaining
        }
      ]
    },
    {
      id: "s7",
      title: "Section 7: JavaScript Fundamentals – Part 1",
      lectures: [
        {
          id: "l8",
          title: "1. Hello World",
          duration: "10min",
          videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
          resources: [{ title: "Starter Code", url: "#" }],
          overview: "Writing your first line of JavaScript code.",
          faq: [],
          review: { average: 4.5, count: 200, userRating: null },
          status: 'remaining' // Status: Remaining
        }
      ]
    }

  ]
};