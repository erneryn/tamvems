import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { passwordChangeSchema } from "@/lib/zod";
import { hashSync } from "bcrypt-ts";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input data
    const validatedData = passwordChangeSchema.safeParse(body);
    
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

    const { newPassword } = validatedData.data;

    // Get user with password and enablePasswordChanges flag
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
        enablePasswordChanges: true,
        role: true,
        name: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if password changes are enabled for this user
    if (!user.enablePasswordChanges && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Fitur ubah password belum diaktifkan untuk akun Anda. Hubungi administrator.' },
        { status: 403 }
      );
    }


    // Hash new password
    const hashedNewPassword = hashSync(newPassword, 12);

    // Update password in database
    await db.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedNewPassword,
        enablePasswordChanges: false
      }
    });

    return NextResponse.json({
      message: 'Password berhasil diubah'
    });

  } catch (error) {
    console.error('Change password error:', error);
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
