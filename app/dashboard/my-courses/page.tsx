import fs from "fs/promises";
import path from "path";
import CourseFilterList from "./ClientComp";

async function getCourses() {
  // Pointing to the Unified App Data file now
  const filePath = path.join(process.cwd(), "data", "courses.json");
  const jsonData = await fs.readFile(filePath, "utf-8");
  return JSON.parse(jsonData); // Note: Removing .courses if your JSON is just an array
}

export default async function MyCoursesPage() {
  const courses = await getCourses();

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto flex gap-8">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">My Learning</h1>
          <CourseFilterList initialCourses={courses} />
        </div>
      </div>
    </div>
  );
}
