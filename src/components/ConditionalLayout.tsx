'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Same output on server and first client render to avoid hydration mismatch
  if (!mounted) {
    return (
      <>
        <Header isUserRoute={false} />
        {children}
        <Footer />
      </>
    );
  }

  const isAdminRoute = pathname?.startsWith('/admin');
  const isUserRoute = ['/dashboard', '/my-request', '/request-form', '/profile'].includes(pathname || '');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header isUserRoute={isUserRoute} />
      {children}
      <Footer />
    </>
  );
} 