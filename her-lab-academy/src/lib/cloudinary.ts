import { v2 as cloudinary } from 'cloudinary';

function ensureConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_* env variables.');
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
}

export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export async function uploadToCloudinary(
  file: Buffer,
  options: {
    folder: string;
    resourceType?: 'auto' | 'image' | 'raw' | 'video';
    filename?: string;
  }
): Promise<{ url: string; publicId: string; bytes: number }> {
  ensureConfig();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `her-lab-academy/${options.folder}`,
        resource_type: options.resourceType ?? 'auto',
        public_id: options.filename,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Upload failed'));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
        });
      }
    );
    stream.end(file);
  });
}
