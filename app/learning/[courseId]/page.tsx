import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import LearningClient from "./LearningClient";
import { getCurrentUser } from "@/lib/auth-utils"; // Import your session helper
import { Lock, Crown, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: {
    courseId: string;
  };
}

export default async function LearningPage({ params }: PageProps) {
  const { courseId } = await params;

  // 1. Get the authenticated user from the cookie
  const sessionUser = await getCurrentUser();

  // 2. Fetch Course and User DB details in parallel for performance
  const [course, userDb] = await Promise.all([
    db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { position: "asc" },
          include: {
            lectures: {
              orderBy: { position: "asc" },
              include: {
                resources: true,
                faqs: true,
                reviews: true,
                notes: true,
                userProgress: {
                  where: {
                    userId: sessionUser?.id // Only get progress for the logged-in user
                  }
                },
              },
            },
          },
        },
      },
    }),
    sessionUser
      ? db.user.findUnique({
          where: { id: sessionUser.id },
          include: { enrollments: { where: { courseId } } },
        })
      : null,
  ]);

  // 3. Handle standard 404 (Course doesn't exist)
  if (!course) {
    return notFound();
  }

  // 4. Access Logic: Allow if Free, Admin, Premium, or specifically Enrolled
  const isEnrolled = (userDb?.enrollments?.length ?? 0) > 0;
  const hasAccess =
    userDb?.role === "ADMIN" || userDb?.hasPremium || isEnrolled;

  // 5. RESTRICTED ACCESS UI (No 404)
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={40} />
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Premium Content
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            This course is part of our{" "}
            <span className="text-purple-600 font-bold">Premium Catalog</span>.
            Upgrade your account or enroll specifically in this course to unlock
            all lectures and resources.
          </p>

          <div className="space-y-4">
            <button className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 group">
              Enroll Now{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <Link
              href="/pricing"
              className="w-full flex items-center justify-center gap-2 py-3 text-purple-600 font-bold hover:bg-purple-50 rounded-2xl transition-colors"
            >
              <Crown size={18} /> View Premium Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 6. RENDER CLIENT ENVIRONMENT (Current functionality maintained)
  return <LearningClient course={course} />;
}
