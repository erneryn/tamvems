'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isUserRoute = ['/dashboard', '/my-request', '/request-form'].includes(pathname || '');
  if (isAdminRoute) {
    // For admin routes, only render children without header/footer
    return <>{children}</>;
  }

  // For non-admin routes, render with header and footer
  return (
    <>
      <Header isUserRoute={isUserRoute} />
      {children}
      <Footer />
    </>
  );
} 