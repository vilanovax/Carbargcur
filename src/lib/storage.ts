/**
 * Liara Object Storage Client
 * Upload files via API route to S3-compatible storage
 */

// File type validations
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
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
          ? 'فقط فایل‌های JPG، PNG و WebP مجاز هستند.'
          : 'فقط فایل‌های PDF مجاز هستند.',
    };
  }

  return { valid: true };
}

/**
 * Upload file to Liara Object Storage via API
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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'خطا در آپلود فایل' };
    }

    return { success: true, url: data.url };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'خطا در اتصال به سرور. لطفاً دوباره تلاش کنید.',
    };
  }
}

/**
 * Delete file from storage via API
 */
export async function deleteFile(url: string): Promise<void> {
  // Don't delete blob URLs
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
    return;
  }

  try {
    await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
  } catch (error) {
    console.error('Delete error:', error);
  }
}
