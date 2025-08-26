import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl
  const session = await auth()

  // Redirect authenticated users from homepage to their appropriate dashboard
  if (pathname === '/') {
    if (session) {
      console.log('🔄 Authenticated user visiting homepage, redirecting to dashboard')
      const redirectPath = session.user?.role === 'ADMIN' || session.user?.role === 'SUPER_ADMIN'
        ? '/admin/dashboard'
        : '/dashboard'
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
  }

  if(pathname === '/dashboard') {
    if (!session) {
      console.log('❌ No session, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if user is an admin
    const userRole = session.user?.role
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      console.log('❌ Admin accessing user dashboard, redirecting to admin dashboard')
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    console.log('✅ User dashboard access granted for:', session.user?.email)
  }

  // Check if the path starts with /admin
  if (pathname.startsWith('/admin')) {
    // Get the session

    console.log('🛡️ Admin route protection check')
    console.log('Path:', pathname)
    console.log('User:', session?.user?.email)
    console.log('Role:', session?.user?.role)

    // If no session, redirect to login
    if (!session) {
      console.log('❌ No session, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if user has admin role
    const userRole = session.user?.role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      console.log('❌ Insufficient permissions, redirecting to dashboard')
      // Redirect to regular dashboard or unauthorized page
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    console.log('✅ Admin access granted')
  }

  // Continue to the requested page
  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Homepage protection
    '/',
    '/dashboard',
    // Protect all /admin routes
    '/admin/:path*',
    // You can add other protected routes here
    // '/profile/:path*',
  ]
}
