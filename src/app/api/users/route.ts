import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get all non-admin users
export async function GET() {
  try {
    const users = await db.user.findMany({
      where: {
        role: 'USER',
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        employeeId: true,
        phone: true,
        role: true,
        isActive: true,
        enablePasswordChanges: true,
        createdAt: true,
        updatedAt: true,
        // Don't include password for security
        // password: false,
        _count: {
          select: {
            vehicleRequests: true,
            createdRequests: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(
      {
        users
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Get users error:', error)
    
    return NextResponse.json(
      {
        error: 'Terjadi kesalahan server'
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
