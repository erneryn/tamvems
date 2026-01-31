import { NextRequest, NextResponse } from "next/server";
import { db } from '@/lib/db'
import { v2 as cloudinary } from 'cloudinary'
import { VehicleType } from '@prisma/client'

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/tiff'];

async function handleFileUpload(file: File | null): Promise<string | null> {
  if (!file) return null;

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed types: JPEG, PNG, TIFF');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size too large. Maximum size: 5MB');
  }

  const fileBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);
  
  const base64String = buffer.toString('base64');
  const dataURI = `data:${file.type};base64,${base64String}`;

  const uploadResponse = await cloudinary.uploader.upload(dataURI, {
    folder: 'mobildinas',
    resource_type: 'auto',
    public_id: `vehicle-${Date.now()}`,
  });

  return uploadResponse.secure_url;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await db.vehicle.findUnique({
    where: { id },
  });

  return NextResponse.json(vehicle);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check content type to determine how to parse the request
    const contentType = request.headers.get('content-type') || '';
    let name: string, plate: string, type: VehicleType, year: string, image: string | null = null;

    let description: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (file upload)
      const formData = await request.formData();
      name = formData.get('name') as string;
      plate = formData.get('plate') as string;
      type = (formData.get('type') as string).toUpperCase() as VehicleType;
      year = formData.get('year') as string;
      const desc = formData.get('description') as string | null;
      description = desc?.trim() || null;
      const imageFile = formData.get('image') as File | null;
      
      // Upload new image if provided
      if (imageFile && imageFile.size > 0) {
        image = await handleFileUpload(imageFile);
      }
    } else {
      // Handle JSON data (no file upload)
      const body = await request.json();
      name = body.name;
      plate = body.plate;
      type = body.type;
      year = body.year;
      description = body.description?.trim() ?? null;
      image = body.image;
    }

    // Update vehicle in database
    const updateData: {
      name: string;
      plate: string;
      type: VehicleType;
      year: string;
      description?: string | null;
      image?: string;
    } = {
      name,
      plate: plate.toUpperCase().trim(),
      type,
      year,
      description,
    };

    // Only update image if a new one was provided
    if (image !== null) {
      updateData.image = image;
    }

    const vehicle = await db.vehicle.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Vehicle update error:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update vehicle'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await db.vehicle.update({
    where: { id },
    data: { isActive: false },
  });
  return NextResponse.json(vehicle);
}