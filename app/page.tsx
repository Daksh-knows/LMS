import Link from 'next/link';
import { LayoutTemplate, PlayCircle, Code2, ArrowRight } from 'lucide-react';

export default function RootGateway() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      {/* Header section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
          <Code2 size={32} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          LMS Project Portal
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Development environment navigation
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        
        {/* Card 1: Landing Page */}
        <Link href="/landing-page" className="group">
          <div className="h-full p-8 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all duration-300 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <LayoutTemplate size={28} />
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Landing Page</h2>
            <p className="text-slate-500 leading-relaxed">
              View the marketing site, hero sections, and course sales pages.
            </p>
            <div className="mt-auto pt-6 text-xs font-mono text-slate-400">
              Route: /landing-page
            </div>
          </div>
        </Link>

        {/* Card 2: Learning Page */}
        <Link href="/learning" className="group">
          <div className="h-full p-8 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-purple-500 transition-all duration-300 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <PlayCircle size={28} />
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Learning Page</h2>
            <p className="text-slate-500 leading-relaxed">
              Open the LMS player with video, notes, and sidebar navigation.
            </p>
            <div className="mt-auto pt-6 text-xs font-mono text-slate-400">
              Route: /learning
            </div>
          </div>
        </Link>

      </div>

      {/* Footer Info */}
      <footer className="mt-16 text-slate-400 text-sm">
        Next.js App Router • Tailwind CSS • TypeScript
      </footer>
    </div>
  );
}