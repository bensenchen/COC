import { ReactNode } from 'react';
import Link from 'next/link';
import { Home, Settings, Users, FileText, PenTool } from 'lucide-react';

interface TenantLayoutProps {
  children: ReactNode;
  params: Promise<{ tenant: string }>;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { tenant } = await params;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 uppercase">{tenant}</h1>
        </div>
        <nav className="mt-6">
          <Link
            href={`/${tenant}`}
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
          >
            <Home className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link
            href={`/${tenant}/documents`}
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
          >
            <FileText className="w-5 h-5 mr-3" />
            Documents
          </Link>
          <Link
            href={`/${tenant}/whiteboards`}
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
          >
            <PenTool className="w-5 h-5 mr-3" />
            Whiteboards
          </Link>
          <Link
            href={`/${tenant}/users`}
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
          >
            <Users className="w-5 h-5 mr-3" />
            Users
          </Link>
          <Link
            href={`/${tenant}/settings`}
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
