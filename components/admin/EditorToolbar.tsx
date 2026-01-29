import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, List, ListOrdered, Heading1, Heading2, 
  Quote, Undo, Redo, Code, Trash2, Type 
} from 'lucide-react';

export const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;
    const btnClass = (active: boolean, disabled = false) => 
  `p-2 rounded-lg transition-all duration-200 ${
    active 
      ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-200' // More subtle active state
      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
  } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`;

  const Separator = () => <div className="w-[1px] h-6 bg-gray-300 mx-1 self-center" />;

  return (
    <div className="flex flex-wrap items-center gap-1 p-1.5 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
      {/* Text Styles */}
      <div className="flex items-center gap-0.5">
        <button type="button" title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}>
          <Bold size={18} />
        </button>
        <button type="button" title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}>
          <Italic size={18} />
        </button>
        <button type="button" title="Code" onClick={() => editor.chain().focus().toggleCode().run()} className={btnClass(editor.isActive('code'))}>
          <Code size={18} />
        </button>
      </div>

      <Separator />

      {/* Headings */}
      <div className="flex items-center gap-0.5">
        <button type="button" title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))}>
          <Heading1 size={18} />
        </button>
        <button type="button" title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))}>
          <Heading2 size={18} />
        </button>
      </div>

      <Separator />

      {/* Lists & Quotes */}
      <div className="flex items-center gap-0.5">
        <button type="button" title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}>
          <List size={18} />
        </button>
        <button type="button" title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}>
          <ListOrdered size={18} />
        </button>
        <button type="button" title="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))}>
          <Quote size={18} />
        </button>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex items-center gap-0.5">
        <button 
          type="button" 
          title="Clear Formatting" 
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} 
          className={btnClass(false)}
        >
          <Trash2 size={18} />
        </button>
        <button 
          type="button" 
          title="Undo" 
          onClick={() => editor.chain().focus().undo().run()} 
          disabled={!editor.can().undo()}
          className={btnClass(false, !editor.can().undo())}
        >
          <Undo size={18} />
        </button>
        <button 
          type="button" 
          title="Redo" 
          onClick={() => editor.chain().focus().redo().run()} 
          disabled={!editor.can().redo()}
          className={btnClass(false, !editor.can().redo())}
        >
          <Redo size={18} />
        </button>
      </div>
    </div>
  );
};