/**
 * Liara Object Storage Client
 *
 * This module provides utilities for uploading and managing files
 * in Liara Object Storage (S3-compatible).
 *
 * For MVP, we're using client-side uploads with pre-signed URLs.
 * In production, this should be handled server-side for security.
 */

// File type validations
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const ALLOWED_RESUME_TYPES = ['application/pdf'];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10MB

export type UploadType = 'photo' | 'resume';

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  type: UploadType
): { valid: boolean; error?: string } {
  // Check file size
  const maxSize = type === 'photo' ? MAX_IMAGE_SIZE : MAX_RESUME_SIZE;
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `حجم فایل نباید بیشتر از ${maxSizeMB} مگابایت باشد.`,
    };
  }

  // Check file type
  const allowedTypes = type === 'photo' ? ALLOWED_IMAGE_TYPES : ALLOWED_RESUME_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error:
        type === 'photo'
          ? 'فقط فایل‌های JPG و PNG مجاز هستند.'
          : 'فقط فایل‌های PDF مجاز هستند.',
    };
  }

  return { valid: true };
}

/**
 * Upload file to Liara Object Storage
 *
 * For MVP: Simulates upload by creating a local URL
 * In production: This should call an API route that handles S3 upload
 */
export async function uploadFile(
  file: File,
  type: UploadType,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  // Validate file
  const validation = validateFile(file, type);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    // For MVP: Create a local object URL
    // In production: Upload to Liara Object Storage via API
    const objectUrl = URL.createObjectURL(file);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // TODO: In production, implement actual S3 upload:
    // const formData = new FormData();
    // formData.append('file', file);
    // formData.append('type', type);
    // const response = await fetch('/api/upload', {
    //   method: 'POST',
    //   body: formData,
    // });
    // const data = await response.json();
    // return { success: true, url: data.url };

    return { success: true, url: objectUrl };
  } catch (error) {
    return {
      success: false,
      error: 'خطا در آپلود فایل. لطفاً دوباره تلاش کنید.',
    };
  }
}

/**
 * Delete file from storage
 *
 * For MVP: Revokes object URL
 * In production: Deletes from S3
 */
export function deleteFile(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }

  // TODO: In production, call API to delete from S3
  // await fetch('/api/upload', {
  //   method: 'DELETE',
  //   body: JSON.stringify({ url }),
  // });
}

/**
 * Generate unique filename
 */
export function generateFilename(originalName: string, userId: string): string {
  const ext = originalName.split('.').pop();
  const timestamp = Date.now();
  return `${userId}-${timestamp}.${ext}`;
}
