'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, Undo, Redo } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const buttons = [
    {
      icon: <Bold className="w-5 h-5" />,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: 'Bold',
    },
    {
      icon: <Italic className="w-5 h-5" />,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: 'Italic',
    },
    {
      icon: <Heading1 className="w-5 h-5" />,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      title: 'Heading 1',
    },
    {
      icon: <Heading2 className="w-5 h-5" />,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      title: 'Heading 2',
    },
    {
      icon: <List className="w-5 h-5" />,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      title: 'Bullet List',
    },
    {
      icon: <ListOrdered className="w-5 h-5" />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      title: 'Ordered List',
    },
    {
      icon: <Quote className="w-5 h-5" />,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      title: 'Blockquote',
    },
    {
      icon: <Undo className="w-5 h-5" />,
      action: () => editor.chain().focus().undo().run(),
      isActive: false,
      title: 'Undo',
    },
    {
      icon: <Redo className="w-5 h-5" />,
      action: () => editor.chain().focus().redo().run(),
      isActive: false,
      title: 'Redo',
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-2 mb-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      {buttons.map((btn, index) => (
        <button
          key={index}
          onClick={btn.action}
          className={cn(
            "p-2 rounded hover:bg-gray-200 transition-colors",
            btn.isActive ? "bg-gray-200 text-blue-600" : "text-gray-600"
          )}
          title={btn.title}
          type="button"
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
};

export default function Editor({ content, onChange, editable = true }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      {editable && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
