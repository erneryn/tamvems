"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  allowRoles?: string[];
}

export function AdminGuard({ 
  children, 
  fallback,
  allowRoles = ['ADMIN', 'SUPER_ADMIN'] 
}: AdminGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      console.log('🚫 AdminGuard: No session, redirecting to login');
      router.push('/login');
      return;
    }

    const userRole = session.user?.role;
    if (!allowRoles.includes(userRole || '')) {
      console.log('🚫 AdminGuard: Insufficient permissions:', userRole);
      router.push('/dashboard');
      return;
    }

    console.log('✅ AdminGuard: Access granted for role:', userRole);
  }, [session, status, router, allowRoles]);

  // Show loading state
  if (status === 'loading') {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memverifikasi akses...</p>
          </div>
        </div>
      )
    );
  }

  // Show unauthorized state
  if (!session || !allowRoles.includes(session.user?.role || '')) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="rounded-full bg-red-100 p-4 w-16 h-16 mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Akses Ditolak</h2>
            <p className="mt-2 text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      )
    );
  }

  // Render children if authorized
  return <>{children}</>;
}
