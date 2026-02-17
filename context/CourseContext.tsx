import React, { createContext, useContext, useState } from "react";

interface Lecture {
    id: string;
    title: string;
    position: number;
    videoUrl: string | null;
    textContent: string;
    duration: string | null;
    type: "TEXT" | "VIDEO" | "QUIZ" | "ASSIGNMENT" | "LIVE"
    userProgress: any[];
}

interface Module {
    id: string;
    title: string;
    position: number;
    lectures: Lecture[];
}

interface Course {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    language: string;
    estimatedDuration: string;
    admin: {
        name: string;
        image: string;
        bio: string | null;
    };
    modules: Module[];
}

interface CourseContextType {
    course: Course | null;
    activeLecture: Lecture | null;
    setActiveLecture: (lecture: Lecture) => void;
    completedLectures: string[]; // Array of lecture IDs
    progressPercentage: number;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);



export const CourseProvider = ({ children }: { children: React.ReactNode }) => {
    const [course , setCourse] = useState({id:"" , adminId: "" ,description: "" ,imageUrl: "" ,isCompleted: "" ,estimatedDuration:"" ,title:""}) ;
    
}