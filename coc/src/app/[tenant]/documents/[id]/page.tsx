'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Editor from '@/components/Editor';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface DocumentPageProps {
  params: Promise<{ tenant: string; id: string }>;
}

export default function DocumentPage({ params }: DocumentPageProps) {
  // Unwrap params using React.use()
  const { tenant, id } = use(params);
  
  const router = useRouter();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (id === 'new') {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching document:', error);
        // Handle error (e.g., redirect or show error message)
      } else if (data) {
        setTitle(data.title || '');
        setContent(data.content || '');
      }
      setLoading(false);
    };

    fetchDocument();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const docData = {
        title,
        content,
        tenant_id: tenant,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (id === 'new') {
        const { data, error: insertError } = await supabase
          .from('documents')
          .insert([docData])
          .select()
          .single();
        
        error = insertError;
        if (data) {
          router.replace(`/${tenant}/documents/${data.id}`);
        }
      } else {
        const { error: updateError } = await supabase
          .from('documents')
          .update(docData)
          .eq('id', id);
        
        error = updateError;
      }

      if (error) throw error;
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error saving document:', err);
      alert('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href={`/${tenant}`}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Document"
            className="text-3xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 w-full placeholder-gray-300"
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

      <Editor content={content} onChange={setContent} />
    </div>
  );
}
