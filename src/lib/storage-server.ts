/**
 * Server-side S3 utilities for Liara Object Storage
 * Handles image optimization and upload
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { nanoid } from "nanoid";

// Initialize S3 client for Liara
const s3Client = new S3Client({
  endpoint: process.env.LIARA_ENDPOINT!,
  region: "us-east-1", // Liara uses default region
  credentials: {
    accessKeyId: process.env.LIARA_ACCESS_KEY!,
    secretAccessKey: process.env.LIARA_SECRET_KEY!,
  },
  forcePathStyle: true, // Required for Liara
});

const BUCKET_NAME = process.env.LIARA_BUCKET_NAME!;

/**
 * Upload buffer to S3
 */
async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: "public-read",
  });

  await s3Client.send(command);

  // Return public URL
  const baseUrl = process.env.LIARA_ENDPOINT!.replace("https://", "");
  return `https://${BUCKET_NAME}.${baseUrl}/${key}`;
}

/**
 * Upload and optimize avatar image
 * Creates both full-size (200x200) and thumbnail (40x40)
 */
export async function uploadAvatar(
  imageBuffer: Buffer,
  userId: string = "temp"
): Promise<{ url: string; thumbnailUrl: string }> {
  const timestamp = Date.now();
  const uniqueId = nanoid(8);

  // Optimize full-size avatar (200x200)
  const optimizedBuffer = await sharp(imageBuffer)
    .resize(200, 200, {
      fit: "cover",
      position: "center",
    })
    .jpeg({ quality: 90 })
    .toBuffer();

  // Create thumbnail (40x40) for header/UI
  const thumbnailBuffer = await sharp(imageBuffer)
    .resize(40, 40, {
      fit: "cover",
      position: "center",
    })
    .jpeg({ quality: 85 })
    .toBuffer();

  // Upload both versions
  const avatarKey = `avatars/${userId}/${timestamp}-${uniqueId}.jpg`;
  const thumbnailKey = `avatars/${userId}/${timestamp}-${uniqueId}-thumb.jpg`;

  const [url, thumbnailUrl] = await Promise.all([
    uploadToS3(optimizedBuffer, avatarKey, "image/jpeg"),
    uploadToS3(thumbnailBuffer, thumbnailKey, "image/jpeg"),
  ]);

  return { url, thumbnailUrl };
}

/**
 * Upload resume PDF
 */
export async function uploadResume(
  pdfBuffer: Buffer,
  userId: string = "temp",
  filename: string
): Promise<string> {
  const timestamp = Date.now();
  const uniqueId = nanoid(8);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

  const key = `resumes/${userId}/${timestamp}-${uniqueId}-${sanitizedFilename}`;

  return uploadToS3(pdfBuffer, key, "application/pdf");
}
