import Link from 'next/link'
import { Button } from 'flowbite-react'
import { signOut } from 'next-auth/react'

export default function Header({ isUserRoute }: { isUserRoute: boolean }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              TamVems
            </Link>
          </div>
          
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
              <Button color="dark" className="px-5" onClick={() => signOut({ callbackUrl: '/login' })}>
                Logout
              </Button>
              </>
            )}
          </nav>

         
        </div>
      </div>
    </header>
  )
} 