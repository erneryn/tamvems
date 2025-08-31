import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { userModificationSchema } from "@/lib/zod";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is admin or super admin
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input data
    const validatedData = userModificationSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: 'Data tidak valid',
          details: validatedData.error.issues.map(issue => ({
            field: issue.path[0],
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    const { action } = validatedData.data;
    const userId = params.id;

    // Check if target user exists
    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        deletedAt: true,
        role: true
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Prevent self-modification
    if (targetUser.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot modify your own account' },
        { status: 403 }
      );
    }

    let updatedUser;

    if (action === 'deactivate') {
      // Set user as inactive
      updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          isActive: false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          deletedAt: true,
          updatedAt: true,
        }
      });

      return NextResponse.json({
        message: 'User berhasil dinonaktifkan',
        user: updatedUser
      });

    } else if (action === 'delete') {
      // Check if user is already deactivated
      if (targetUser.isActive) {
        return NextResponse.json(
          { error: 'User harus dinonaktifkan terlebih dahulu sebelum dihapus' },
          { status: 400 }
        );
      }

      // Check if user is already soft deleted
      if (targetUser.deletedAt) {
        return NextResponse.json(
          { error: 'User sudah dihapus' },
          { status: 400 }
        );
      }

      // Soft delete the user
      updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          deletedAt: true,
          updatedAt: true,
        }
      });

      return NextResponse.json({
        message: 'User berhasil dihapus',
        user: updatedUser
      });
    }

  } catch (error) {
    console.error('User modification error:', error);
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}