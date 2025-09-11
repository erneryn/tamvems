import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { db } from '@/lib/db'
import { adminRegisterSchema, registerSchema } from '@/lib/zod'
import { hashSync } from 'bcrypt-ts'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    if(body.role === 'ADMIN') {
      const validatedData = adminRegisterSchema.parse(body)
      const { name, email, employeeId, phone, password, secretKey } = validatedData
      if(secretKey !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json(
          { error: 'Secret key tidak valid' },
          { status: 400 }
        )
      }
        
      const existingUserByEmail = await db.user.findUnique({
        where: { email }
      })

      if(existingUserByEmail) {
        return NextResponse.json(
          { error: 'Email sudah terdaftar' },
          { status: 400 }
        )
      }
      
      // Check if user already exists by employee ID (only if employeeId is provided)
      if (employeeId) {
        const existingUserByEmployeeId = await db.user.findFirst({
          where: { employeeId }
        })
        
        if(existingUserByEmployeeId) {
          return NextResponse.json(
            { error: 'Employee ID sudah terdaftar' },
            { status: 400 }
          )
        }
      }
      
      const hashedPassword = hashSync(password, 10)
      
      const newUser = await db.user.create({
        data: {
          name,
          email,
          employeeId: employeeId || null,
          phone: phone || null,
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        }
      })

      return NextResponse.json(
        {
          message: 'User berhasil didaftarkan',
          user: newUser
        },
        { status: 201 }
      )
    }
    
    // Validate input with Zod schema
    const validatedData = registerSchema.parse(body)
    
    const { name, email, employeeId, phone, password } = validatedData
    const division = body.division
    // Check if user already exists by email
    const existingUserByEmail = await db.user.findUnique({
      where: { email }
    })
    
    if (existingUserByEmail) {
      return NextResponse.json(
        { 
          error: 'Email sudah terdaftar',
          field: 'email'
        },
        { status: 400 }
      )
    }
    
    // Check if user already exists by employee ID (only if employeeId is provided)
    if (employeeId) {
      const existingUserByEmployeeId = await db.user.findFirst({
        where: { employeeId }
      })
      
      if (existingUserByEmployeeId) {
        return NextResponse.json(
          { 
            error: 'Employee ID sudah terdaftar',
            field: 'employeeId'
          },
          { status: 400 }
        )
      }
    }
    
    // Hash password
    const hashedPassword = hashSync(password, 10)
    
    // Create user in database
    const newUser = await db.user.create({
      data: {
        name,
        email,
        employeeId: employeeId || null,
        phone: phone || null,
        password: hashedPassword,
        role: 'USER', // Default role
        isActive: true, // Default active status
        division: division || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    })
    
    return NextResponse.json(
      {
        message: 'User berhasil didaftarkan',
        user: newUser
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const fieldErrors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
      
      return NextResponse.json(
        {
          error: 'Data tidak valid',
          details: fieldErrors
        },
        { status: 400 }
      )
    }
    
    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        {
          error: 'Email atau Employee ID sudah terdaftar'
        },
        { status: 400 }
      )
    }
    
    // Handle other database errors
    if (error instanceof Error && error.message.includes('Database')) {
      return NextResponse.json(
        {
          error: 'Terjadi kesalahan database'
        },
        { status: 500 }
      )
    }
    
    // Handle unknown errors
    return NextResponse.json(
      {
        error: 'Terjadi kesalahan server'
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
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
