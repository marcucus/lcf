'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['agendaManager', 'admin']}>
      <div className="flex min-h-[calc(100vh-200px)]">
        <AdminSidebar />
        <main className="flex-1 bg-gray-50 dark:bg-dark-bg">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
