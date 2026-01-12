import React, { useState, useEffect } from 'react';
import { Lecture } from '../../data';
import { Save, Image as ImageIcon, Type, List, Bold } from 'lucide-react';

export const NotesTab: React.FC<{ lecture: Lecture }> = ({ lecture }) => {
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedNote = localStorage.getItem(`note-${lecture.id}`);
    setNoteContent(savedNote || '');
  }, [lecture.id]);

  const handleSaveNote = () => {
    setIsSaving(true);
    localStorage.setItem(`note-${lecture.id}`, noteContent);
    
    // Simulate network delay for better UX feel
    setTimeout(() => {
        setIsSaving(false);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Editor Toolbar (Mock) */}
      <div className="flex items-center justify-between border border-gray-200 border-b-0 rounded-t-xl bg-gray-50 p-2">
        <div className="flex items-center gap-1">
           <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500"><Bold size={16}/></button>
           <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500"><Type size={16}/></button>
           <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
           <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500"><List size={16}/></button>
           <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500"><ImageIcon size={16}/></button>
        </div>
        
        <button 
            onClick={handleSaveNote}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                isSaving 
                ? 'bg-green-100 text-green-700' 
                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm hover:shadow'
            }`}
        >
            <Save size={14} />
            {isSaving ? 'Saved!' : 'Save Note'}
        </button>
      </div>

      {/* Editor Area */}
      <textarea
        className="w-full min-h-[300px] p-6 border border-gray-200 rounded-b-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none resize-y font-mono text-sm leading-relaxed text-gray-700"
        placeholder={`Start typing your notes for "${lecture.title}"...`}
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
      />
      
      <p className="text-xs text-gray-400 mt-2 text-right">
        {noteContent.length} characters
      </p>
    </div>
  );
};