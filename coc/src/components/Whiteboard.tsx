'use client';

import { Tldraw, Editor } from 'tldraw';
import 'tldraw/tldraw.css';
import { useCallback } from 'react';

interface WhiteboardProps {
  initialContent?: any;
  onEditorMount?: (editor: Editor) => void;
  readOnly?: boolean;
  className?: string;
}

export default function Whiteboard({ initialContent, onEditorMount, readOnly = false, className }: WhiteboardProps) {
  const handleMount = useCallback((editor: Editor) => {
    if (initialContent) {
      try {
        editor.loadSnapshot(initialContent);
      } catch (e) {
        console.error('Failed to load whiteboard content:', e);
      }
    }

    if (readOnly) {
      editor.updateInstanceState({ isReadonly: true });
    }

    if (onEditorMount) {
      onEditorMount(editor);
    }
  }, [initialContent, readOnly, onEditorMount]);

  return (
    <div className={`w-full h-full min-h-[500px] border border-gray-200 rounded-lg overflow-hidden relative ${className || ''}`}>
      <Tldraw
        onMount={handleMount}
        persistenceKey={readOnly ? undefined : "tldraw-example"} // Optional: local persistence
      />
    </div>
  );
}
