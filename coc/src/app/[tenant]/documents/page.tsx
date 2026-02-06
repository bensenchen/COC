'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { FileText, Plus } from 'lucide-react';

interface DocumentsPageProps {
  params: Promise<{ tenant: string }>;
}

export default function DocumentsPage({ params }: DocumentsPageProps) {
  const { tenant } = use(params);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('tenant_id', tenant)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
      } else {
        setDocuments(data || []);
      }
      setLoading(false);
    };

    fetchDocuments();
  }, [tenant]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Documents</h1>
        <Link
          href={`/${tenant}/documents/new`}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Document
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No documents yet</h3>
          <p className="mt-2 text-gray-500">Get started by creating a new document.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/${tenant}/documents/${doc.id}`}
              className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {doc.title || 'Untitled Document'}
              </h3>
              <p className="text-sm text-gray-500">
                Last updated: {new Date(doc.updated_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
