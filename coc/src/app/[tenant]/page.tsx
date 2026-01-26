interface TenantPageProps {
  params: Promise<{ tenant: string }>;
}

export default async function TenantDashboard({ params }: TenantPageProps) {
  const { tenant } = await params;

  return (
    <div>
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-medium text-gray-700">Welcome back!</h3>
          <p className="mt-2 text-gray-600">
            You are currently viewing the dashboard for <strong>{tenant}</strong>.
          </p>
        </div>
        {/* Add more dashboard widgets here */}
      </div>
    </div>
  );
}
