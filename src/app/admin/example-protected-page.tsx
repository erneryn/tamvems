"use client";

import { AdminGuard } from "@/components/AdminGuard";

// Example of how to protect individual pages
export default function ExampleAdminPage() {
  return (
    <AdminGuard>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Protected Admin Page</h1>
        <p className="mt-4 text-gray-600">
          This content is only visible to ADMIN and SUPER_ADMIN users.
        </p>
      </div>
    </AdminGuard>
  );
}

// Alternative: Protect with specific roles only
export function SuperAdminOnlyPage() {
  return (
    <AdminGuard allowRoles={['SUPER_ADMIN']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Only</h1>
        <p className="mt-4 text-gray-600">
          This content is only visible to SUPER_ADMIN users.
        </p>
      </div>
    </AdminGuard>
  );
}

// Alternative: Custom fallback
export function AdminPageWithCustomFallback() {
  return (
    <AdminGuard 
      fallback={
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600">Custom Unauthorized Message</h2>
          <p className="mt-2 text-gray-600">Contact admin for access.</p>
        </div>
      }
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Content</h1>
      </div>
    </AdminGuard>
  );
}
