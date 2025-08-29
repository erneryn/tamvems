import Link from 'next/link'
import { Button } from 'flowbite-react'
import { signOut, useSession } from 'next-auth/react'
import { HiOutlineUser, HiMenu, HiX } from 'react-icons/hi'
import { useState, useEffect } from 'react'

export default function Header({ isUserRoute }: { isUserRoute: boolean }) {
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu on escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isMobileMenuOpen])
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              TamVems
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
              Home
            </Link>
            {isUserRoute && (
              <>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/my-request" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                Pengajuan Saya
              </Link>
              <Link href="/profile">
              <div className="flex items-center space-x-2 border-2 border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors">
                <HiOutlineUser className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-mono">
                  {status === "loading" ? "Loading..." : session?.user?.email || "User"}
                </span>
              </div>
              </Link>
              <Button color="dark" className="px-5" onClick={() => signOut({ callbackUrl: '/login' })}>
                Logout
              </Button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <HiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <HiMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
         
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div 
              className="fixed inset-0  bg-opacity-25 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-50 md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200 shadow-lg">
              
              {isUserRoute && (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/my-request" 
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Pengajuan Saya
                  </Link>
                  <Link 
                    href="/profile" 
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <HiOutlineUser className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-mono">
                        {status === "loading" ? "Loading..." : session?.user?.email || "User"}
                      </span>
                    </div>
                  </Link>
                  
                  <div className="px-3 py-2">
                    <Button 
                      color="dark" 
                      className="w-full" 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut({ callbackUrl: '/login' });
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                </>
              )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
} 