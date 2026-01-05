import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import sharp from 'sharp';

// Initialize S3 Client
const s3Client = new S3Client({
  region: 'default',
  endpoint: process.env.LIARA_ENDPOINT,
  credentials: {
    accessKeyId: process.env.LIARA_ACCESS_KEY || '',
    secretAccessKey: process.env.LIARA_SECRET_KEY || '',
  },
});

const BUCKET_NAME = process.env.LIARA_BUCKET_NAME || '';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10MB
const OPTIMIZED_IMAGE_SIZE = 800;
const IMAGE_QUALITY = 85;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'احراز هویت لازم است' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'photo' or 'resume'

    if (!file) {
      return NextResponse.json(
        { error: 'فایلی انتخاب نشده است' },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = type === 'photo' ? MAX_IMAGE_SIZE : MAX_RESUME_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `حجم فایل نباید بیشتر از ${maxSize / (1024 * 1024)} مگابایت باشد` },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = type === 'photo'
      ? ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
      : ['application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'نوع فایل مجاز نیست' },
        { status: 400 }
      );
    }

    // Generate filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = type === 'photo' ? 'jpg' : 'pdf';
    const prefix = type === 'photo' ? 'profile-photos' : 'resumes';
    const filename = `${prefix}/${session.user.id}-${timestamp}-${random}.${ext}`;

    let buffer: Buffer;
    let contentType: string;

    if (type === 'photo') {
      // Optimize image with sharp
      const arrayBuffer = await file.arrayBuffer();
      buffer = await sharp(arrayBuffer)
        .resize(OPTIMIZED_IMAGE_SIZE, OPTIMIZED_IMAGE_SIZE, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: IMAGE_QUALITY })
        .toBuffer();

      contentType = 'image/jpeg';
    } else {
      // Upload PDF as-is
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      contentType = 'application/pdf';
    }

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    // Construct public URL
    const url = `${process.env.LIARA_ENDPOINT}/${BUCKET_NAME}/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'خطا در آپلود فایل' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'احراز هویت لازم است' },
        { status: 401 }
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'آدرس فایل مشخص نشده است' },
        { status: 400 }
      );
    }

    // Extract filename from URL
    const urlObj = new URL(url);
    const filename = urlObj.pathname.replace(`/${BUCKET_NAME}/`, '');

    // Delete from S3
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'خطا در حذف فایل' },
      { status: 500 }
    );
  }
}
