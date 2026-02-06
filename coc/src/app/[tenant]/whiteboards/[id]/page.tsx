'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Whiteboard from '@/components/Whiteboard';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Editor } from 'tldraw';

interface WhiteboardPageProps {
  params: Promise<{ tenant: string; id: string }>;
}

export default function WhiteboardPage({ params }: WhiteboardPageProps) {
  const { tenant, id } = use(params);
  const router = useRouter();
  
  const [initialContent, setInitialContent] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    const fetchWhiteboard = async () => {
      if (id === 'new') {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('whiteboards')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching whiteboard:', error);
      } else if (data) {
        setTitle(data.title || '');
        setInitialContent(data.content);
      }
      setLoading(false);
    };

    fetchWhiteboard();
  }, [id]);

  const handleSave = async () => {
    if (!editorRef.current) return;
    
    setSaving(true);
    try {
      const snapshot = editorRef.current.getSnapshot();
      
      const wbData = {
        title,
        content: snapshot,
        tenant_id: tenant,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (id === 'new') {
        const { data, error: insertError } = await supabase
          .from('whiteboards')
          .insert([wbData])
          .select()
          .single();
        
        error = insertError;
        if (data) {
          router.replace(`/${tenant}/whiteboards/${data.id}`);
        }
      } else {
        const { error: updateError } = await supabase
          .from('whiteboards')
          .update(wbData)
          .eq('id', id);
        
        error = updateError;
      }

      if (error) throw error;
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error saving whiteboard:', err);
      alert('Failed to save whiteboard');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href={`/${tenant}/whiteboards`}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Whiteboard"
            className="text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 w-64 placeholder-gray-300"
          />
        </div>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 relative">
        <Whiteboard 
          roomId={id}
          initialContent={initialContent} 
          onEditorMount={(editor) => {
            editorRef.current = editor;
          }}
          className="h-full border-none rounded-none"
          userId={`user-${Math.random().toString(36).substr(2, 9)}`}
          userName={`User ${Math.floor(Math.random() * 1000)}`}
        />
      </div>
    </div>
  );
}
