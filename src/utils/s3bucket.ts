import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME, AWS_REGION } from "../setup/s3bucket";
import path from "path";

/**
 * Upload a file buffer to S3
 * @param fileBuffer - The file buffer (from multer memory storage)
 * @param originalName - Original filename for extension
 * @param folder - S3 folder path (e.g., "invoices")
 * @returns Object with S3 key, URL, and filename
 */
export const uploadToS3 = async (
  fileBuffer: Buffer,
  originalName: string,
  folder: string = "invoices"
): Promise<{ key: string; url: string; fileName: string }> => {
  // Generate unique filename
  const timestamp = Date.now();
  const uniqueSuffix = Math.round(Math.random() * 1e9);
  const fileExt = path.extname(originalName);
  const fileName = `invoice-${timestamp}-${uniqueSuffix}${fileExt}`;

  // S3 key (path inside bucket)
  const key = `${folder}/${fileName}`;

  // Determine content type
  const contentType = getContentType(fileExt);

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Generate the public URL
  const url = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;

  return { key, url, fileName };
};

/**
 * Delete a file from S3
 * @param key - The S3 key of the file to delete
 */
export const deleteFromS3 = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
};

/**
 * Get content type based on file extension
 */
function getContentType(ext: string): string {
  const types: Record<string, string> = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  return types[ext.toLowerCase()] || "application/octet-stream";
}