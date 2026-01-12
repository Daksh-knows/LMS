import fs from "fs/promises";
import path from "path";
import CourseFilterList from "./ClientComp";

async function getCourses() {
  const filePath = path.join(process.cwd(), "data", "courses.json");
  const jsonData = await fs.readFile(filePath, "utf-8");
  return JSON.parse(jsonData).courses;
}

export default async function MyCoursesPage() {
  const courses = await getCourses();

  return (
    <div className="flex-1 p-8">
      <div className="max-w-5xl mx-auto flex gap-8">
        
        {/* Main Content Area */}
        <div className="flex-1">
           <CourseFilterList initialCourses={courses} />
        </div>

        {/* Sidebar (Skills Report) */}
        {/* <div className="w-80 space-y-4">
            <h4 className="font-bold text-gray-700">Skills Report</h4>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-32 h-32 mb-4">
                    <img src="https://nxtwave.imgix.net/ccbp-website/Home/best-skill.png" alt="Coming Soon" className="opacity-40 grayscale" />
                </div>
                <p className="text-gray-400 text-sm font-medium">Something Cool is being prepared</p>
            </div>
        </div> */}

      </div>
    </div>
  );
}