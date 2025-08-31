import { NextRequest, NextResponse } from "next/server";
import { db } from '@/lib/db'
import { hashSync } from "bcryptjs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
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
        _count: {
          select: {
            vehicleRequests: true,
            createdRequests: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { enablePasswordChanges, defaultPassword } = body;

    const hashedDefaultPassword = hashSync(defaultPassword, 10);
    // Validate enablePasswordChanges is boolean
    if (typeof enablePasswordChanges !== 'boolean') {
      return NextResponse.json(
        { error: 'enablePasswordChanges harus berupa boolean' },
        { status: 400 }
      );
    }

    // Check if user exists and is not admin
    const existingUser = await db.user.findUnique({
      where: { id },
      select: { id: true, role: true, name: true }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    if (existingUser.role === 'ADMIN' || existingUser.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Tidak dapat mengubah pengaturan password admin' },
        { status: 403 }
      );
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id },
      data: { enablePasswordChanges, password: hashedDefaultPassword },
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
        _count: {
          select: {
            vehicleRequests: true,
            createdRequests: true
          }
        }
      }
    });

    return NextResponse.json({
      message: `Password changes ${enablePasswordChanges ? 'diaktifkan' : 'dinonaktifkan'} untuk ${existingUser.name}`,
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
