import React from "react";
import { db } from "@/lib/db";
import { CheckoutButton } from "@/components/ecommerce/CheckoutButton";
import { BookOpen, Layers } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const [courses, bundles] = await Promise.all([
    db.course.findMany({
      where: { isPublished: true, price: { not: null } },
      include: { category: true },
      orderBy: { createdAt: "desc" }
    }),
    db.courseBundle.findMany({
      where: { isPublished: true },
      include: { courses: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <div className="min-h-screen bg-(--background) theme-transition py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-(--text-color) tracking-tight">E-Commerce Portal</h1>
          <p className="mt-4 text-lg opacity-70 text-(--text-color)">Purchase individual courses or get better value with course bundles.</p>
        </div>

        {bundles.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-(--background-shade) rounded-xl text-(--colored-text) shadow-sm">
                <Layers className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-(--text-color) tracking-tight">Course Bundles</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              {bundles.map((bundle) => (
                <div key={bundle.id} className="bg-(--dashboard-card-bg) rounded-[1.5rem] overflow-hidden shadow-sm border border-[var(--input-border)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative">
                  {/* Decorative accent top border */}
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-(--colored-text) to-(--background-shade)" />
                  
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-(--text-color) mb-3 leading-tight">{bundle.title}</h3>
                    <p className="text-(--text-color) opacity-70 text-[0.95rem] mb-8 leading-relaxed line-clamp-3">{bundle.description}</p>
                    
                    <div className="mb-8 p-6 bg-(--background)/50 rounded-2xl border border-[var(--input-border)]/30">
                      <p className="text-xs font-bold text-(--text-color) opacity-50 uppercase tracking-widest mb-4">Includes {bundle.courses.length} Courses</p>
                      <ul className="space-y-3">
                        {bundle.courses.slice(0, 4).map(c => (
                          <li key={c.id} className="text-sm font-medium text-(--text-color) opacity-80 flex items-start gap-3">
                            <BookOpen className="w-4 h-4 text-(--colored-text) mt-0.5 shrink-0" />
                            <span className="leading-snug">{c.title}</span>
                          </li>
                        ))}
                        {bundle.courses.length > 4 && (
                          <li className="text-sm font-medium text-(--text-color) opacity-40 italic pl-7 pt-1">+{bundle.courses.length - 4} more courses included...</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="mt-auto pt-6 border-t border-[var(--input-border)]/50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-(--text-color) opacity-50 tracking-wider mb-0.5">Bundle Price</span>
                        <div className="text-3xl font-black text-(--text-color)">₹{bundle.price}</div>
                      </div>
                      <CheckoutButton itemId={bundle.id} itemType="BUNDLE" price={bundle.price} className="shadow-lg hover:shadow-xl px-7 py-3 rounded-xl font-bold" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-(--background-shade) rounded-xl text-(--colored-text) shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-(--text-color) tracking-tight">Individual Courses</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
            {courses.map((course) => (
              <div key={course.id} className="bg-(--dashboard-card-bg) rounded-[1.5rem] overflow-hidden shadow-sm border border-[var(--input-border)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                <div className="aspect-video w-full bg-(--background-shade) relative overflow-hidden">
                  {course.imageUrl ? (
                    <Image src={course.imageUrl} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-40 text-(--text-color)">
                      <BookOpen className="w-12 h-12" />
                    </div>
                  )}
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-4">
                    {course.category ? (
                      <span className="inline-flex items-center px-3 py-1.5 bg-(--background-shade) text-(--colored-text) text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                        {course.category.name}
                      </span>
                    ) : (
                      <span className="inline-block h-6" /> // Placeholder to maintain consistent height
                    )}
                  </div>
                  <h3 className="text-[1.35rem] leading-tight font-bold text-(--text-color) mb-6 line-clamp-2">{course.title}</h3>
                  
                  <div className="mt-auto pt-6 border-t border-[var(--input-border)]/50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-(--text-color) opacity-50 tracking-wider mb-0.5">Price</span>
                      <div className="text-2xl font-black text-(--text-color)">₹{course.price}</div>
                    </div>
                    <CheckoutButton itemId={course.id} itemType="COURSE" price={course.price!} className="shadow-lg hover:shadow-xl px-6 py-2.5 rounded-xl font-bold" />
                  </div>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-(--text-color) opacity-50 bg-(--dashboard-card-bg) border border-[var(--input-border)] border-dashed rounded-3xl">
                <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg">No individual courses available right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
