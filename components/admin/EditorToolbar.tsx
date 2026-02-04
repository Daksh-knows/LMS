import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, List, ListOrdered, Heading1, Heading2, 
  Quote, Undo, Redo, Code, Trash2 
} from 'lucide-react';
import { useEffect, useState } from 'react';

export const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  // --- The Fix: Force Re-render on Editor State Change ---
  const [, setUpdate] = useState(0);

  useEffect(() => {
    if (!editor) return;

    const handler = () => {
      // Incrementing state forces the toolbar to re-render
      setUpdate((prev) => prev + 1);
    };

    // Listen for any selection or content change
    editor.on('transaction', handler);

    return () => {
      editor.off('transaction', handler);
    };
  }, [editor]);
  // -------------------------------------------------------

  if (!editor) return null;

  // Function to determine button styles dynamically
  const btnClass = (isActive: boolean, disabled = false) => 
    `p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
      isActive 
        ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-200 shadow-inner' // Active state
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900' // Inactive state
    } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`;

  const Separator = () => <div className="w-[1px] h-5 bg-gray-200 mx-1.5 self-center" />;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 bg-white sticky top-0 z-20">
      
      {/* Text Styles */}
      <div className="flex items-center gap-0.5">
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          className={btnClass(editor.isActive('bold'))}
          title="Bold (Cmd+B)"
        >
          <Bold size={18} />
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          className={btnClass(editor.isActive('italic'))}
          title="Italic (Cmd+I)"
        >
          <Italic size={18} />
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleCode().run()} 
          className={btnClass(editor.isActive('code'))}
          title="Inline Code"
        >
          <Code size={18} />
        </button>
      </div>

      <Separator />

      {/* Headings */}
      <div className="flex items-center gap-0.5">
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          className={btnClass(editor.isActive('heading', { level: 1 }))}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          className={btnClass(editor.isActive('heading', { level: 2 }))}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
      </div>

      <Separator />

      {/* Lists & Blocks */}
      <div className="flex items-center gap-0.5">
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          className={btnClass(editor.isActive('bulletList'))}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          className={btnClass(editor.isActive('orderedList'))}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          className={btnClass(editor.isActive('blockquote'))}
          title="Quote"
        >
          <Quote size={18} />
        </button>
      </div>

      <Separator />

      {/* History & Clear */}
      <div className="flex items-center gap-0.5 ml-auto">
        <button 
          type="button" 
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} 
          className={btnClass(false)}
          title="Clear Formatting"
        >
          <Trash2 size={18} />
        </button>
        
        <div className="w-[1px] h-5 bg-gray-200 mx-1.5 self-center" />

        <button 
          type="button" 
          onClick={() => editor.chain().focus().undo().run()} 
          disabled={!editor.can().undo()}
          className={btnClass(false, !editor.can().undo())}
          title="Undo (Cmd+Z)"
        >
          <Undo size={18} />
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().redo().run()} 
          disabled={!editor.can().redo()}
          className={btnClass(false, !editor.can().redo())}
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo size={18} />
        </button>
      </div>
    </div>
  );
};