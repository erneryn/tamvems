import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { db } from '@/lib/db'
import { v2 as cloudinary } from 'cloudinary'
import { VehicleType } from '@prisma/client'
import { vehicleRegisterSchema } from '@/lib/zod'


// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/tiff'];


// Configure services
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const parseFormData = (formData: FormData) => {
  const name = formData.get('name') as string
  const plate = formData.get('plate') as string
  const type = formData.get('type') as VehicleType
  const year = formData.get('year') as string
  const image = formData.get('image') as File
  return { name, plate, type: type?.toUpperCase() as VehicleType, year, image }
}


async function handleFileUpload(file: File | null): Promise<string | null> {
  if (!file) return null;

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed types: JPEG, PNG');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size too large. Maximum size: 5MB');
  }

  const fileBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);
  
  // Resize image before upload
  const base64String = buffer.toString('base64');
  const dataURI = `data:${file.type};base64,${base64String}`;

  const uploadResponse = await cloudinary.uploader.upload(dataURI, {
    folder: 'mobildinas',
    resource_type: 'auto',
    public_id: `vehicle-${Date.now()}`,
  });

  return uploadResponse.secure_url;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const formData = await request.formData()
    const { name, plate, type, year, image } = parseFormData(formData)
    
    // Validate input with Zod schema
    vehicleRegisterSchema.parse({
      name,
      plate,
      type,
      year,
    })
    
    // Check if vehicle with same license plate already exists
    const existingVehicle = await db.vehicle.findUnique({
      where: { plate: plate.toUpperCase() }
    })
    
    if (existingVehicle) {
      return NextResponse.json(
        { 
          error: 'Plat nomor sudah terdaftar',
          field: 'plate'
        },
        { status: 400 }
      )
    }

    // Upload image to Cloudinary
    const imageUrl = await handleFileUpload(image)
    
    // Create vehicle in database
    const newVehicle = await db.vehicle.create({
      data: {
        name,
        plate: plate.toUpperCase().trim(),
        type,
        year,
        image : imageUrl,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        plate: true,
        type: true,
        year: true,
        image: true,
        isActive: true,
        createdAt: true,
      }
    })
    
    return NextResponse.json(
      {
        message: 'Kendaraan berhasil didaftarkan',
        vehicle: newVehicle
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Vehicle registration error:', error)
    
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
          error: 'Plat nomor sudah terdaftar'
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

// Get all vehicles
export async function GET() {
  try {
    const vehicles = await db.vehicle.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        plate: true,
        type: true,
        year: true,
        image: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(
      {
        vehicles
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Get vehicles error:', error)
    
    return NextResponse.json(
      {
        error: 'Terjadi kesalahan server'
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
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