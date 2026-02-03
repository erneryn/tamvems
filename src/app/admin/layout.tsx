'use client';

import { useState, ReactNode, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  HiHome, 
  HiUserAdd, 
  HiUsers,
  HiClipboardList, 
  HiTruck, 
  HiChartBar, 
  HiCog,
  HiMenu,
  HiX,
  HiLogout,
  HiUserCircle
} from "react-icons/hi";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  href: string;
  labelKey: keyof typeof translations.id.admin.nav;
  icon: React.ComponentType<{ className?: string }>;
}

const navItemKeys: NavItem[] = [
  { href: "/admin/dashboard", labelKey: "dashboard", icon: HiHome },
  { href: "/admin/users", labelKey: "users", icon: HiUsers },
  { href: "/admin/requests", labelKey: "requests", icon: HiClipboardList },
  { href: "/admin/vehicles", labelKey: "vehicles", icon: HiTruck },
  { href: "/admin/report", labelKey: "report", icon: HiChartBar },
  { href: "/admin/settings", labelKey: "settings", icon: HiCog },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { locale } = useLanguage();
  const t = translations[locale].admin;
  const navItems = useMemo(
    () => navItemKeys.map((item) => ({ ...item, label: t.nav[item.labelKey] })),
    [t]
  );

  const { data: session, status } = useSession();

  // Protect admin routes
  useEffect(() => {
    const checkSession = async () => {
      if (status === 'loading') return; // Still loading

      if (!session) {
        console.log('🚫 No session, redirecting to login');
        window.location.href = '/login';
        return;
      }

      const userRole = session.user?.role;
      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        console.log('🚫 Insufficient permissions, redirecting to dashboard');
        window.location.href = '/dashboard';
        return;
      }

      console.log('✅ Admin access granted for:', session.user?.email);
    };

    checkSession();
  }, [session, status]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.verifyingAccess}</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-red-600">{t.pleaseWait}</p>
        </div>
      </div>
    );
  }

  const isActivePath = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col`}>
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600">
          <h1 className="text-xl font-bold text-white">{t.layout.appTitle}</h1>
          <button
            className="text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-blue-100 p-2">
              <HiUserCircle className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {t.admin}
              </p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href);
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
       
        {/* Logout Section */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
          >
            <HiLogout className="mr-3 h-5 w-5 text-gray-400" />
            {translations[locale].common.logout}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <HiMenu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{t.layout.mobileTitle}</h1>
            <div></div> {/* Spacer */}
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
} 