import React from "react";

interface ArticleProps {
  lecture: {
    id: string;
    title: string;
    textContent: string; 
  };
}

const ArticleComponent: React.FC<ArticleProps> = ({ lecture }) => {
    console.log("lecture:", lecture);
  return (
    <div className="min-h-full bg-white">
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        {/* Breadcrumb / Type Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
            Reading Material
          </span>
        </div>

        {/* Header Section */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            {lecture.title}
          </h1>
          <div className="h-1 w-20 bg-blue-600 rounded-full" />
        </header>

        {/* The Content Area
          We use 'prose-slate' for a neutral, professional look.
          'max-w-none' ensures it fills our container width.
        */}
        <article 
          className="prose prose-slate prose-lg max-w-none 
            /* Link Styles */
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            /* Heading Styles */
            prose-headings:font-bold prose-headings:text-gray-900
            /* Blockquote Styles */
            prose-blockquote:border-l-blue-500 prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
            /* List Styles */
            prose-li:marker:text-blue-500
            /* Code Styles */
            prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded"
        >
          <div 
            // The 'tiptap' class ensures any specific editor styles carry over
            className="prose prose-slate prose-lg max-w-none text-black"
            dangerouslySetInnerHTML={{ __html: lecture.textContent || "No content found" }} 
          />
        </article>

        {/* Footer / Completion Gap */}
        <div className="mt-20 pb-10 border-t border-gray-100 pt-8">
          <p className="text-sm text-gray-400 text-center italic">
            End of Article
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArticleComponent;