import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Welcome to COC
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A multi-tenant application foundation.
        </p>
        <Link
          href="/demo-tenant"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Demo Tenant
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
