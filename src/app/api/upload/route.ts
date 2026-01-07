import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadAvatar, uploadResume } from '@/lib/storage-server';

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

export async function POST(request: NextRequest) {
  try {
    // For MVP, skip authentication to allow onboarding
    // TODO: Add authentication after user system is ready
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'temp';

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'avatar', 'photo', or 'resume'

    if (!file) {
      return NextResponse.json(
        { error: 'فایلی انتخاب نشده است' },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = type === 'resume' ? MAX_RESUME_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `حجم فایل نباید بیشتر از ${maxSize / (1024 * 1024)} مگابایت باشد` },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = type === 'resume'
      ? ['application/pdf']
      : ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'نوع فایل مجاز نیست' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Handle different upload types
    if (type === 'avatar') {
      // Upload optimized avatar with thumbnail
      const { url, thumbnailUrl } = await uploadAvatar(buffer, userId);

      return NextResponse.json({
        success: true,
        url,
        thumbnailUrl,
      });
    } else if (type === 'resume') {
      // Upload resume PDF
      const url = await uploadResume(buffer, userId, file.name);

      return NextResponse.json({
        success: true,
        url,
        filename: file.name,
      });
    } else {
      // Legacy 'photo' type - use avatar upload
      const { url, thumbnailUrl } = await uploadAvatar(buffer, userId);

      return NextResponse.json({
        success: true,
        url,
        thumbnailUrl,
      });
    }
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
