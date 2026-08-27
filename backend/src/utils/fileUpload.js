import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads base directory exists
const UPLOADS_BASE = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_BASE)) {
  fs.mkdirSync(UPLOADS_BASE, { recursive: true });
}

/**
 * Saves a Base64 image string to disk in backend/uploads/{subfolder}
 * Returns relative path e.g. '/uploads/products/prod_1787720000_a1b2c3.jpg'
 * If input is already a URL or path, returns it as-is.
 */
export const saveBase64Image = (base64Str, subfolder = 'general') => {
  if (!base64Str || typeof base64Str !== 'string') return base64Str || '';
  
  // If not a base64 data URI, return as-is (e.g. existing /uploads/... path or http URL)
  if (!base64Str.startsWith('data:image/')) {
    return base64Str;
  }

  try {
    const targetDir = path.join(UPLOADS_BASE, subfolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Extract mime type & extension
    const matches = base64Str.match(/^data:image\/([a-zA-Z0-9+-]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Str;
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext.includes('svg')) ext = 'svg';

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const randomHash = Math.random().toString(36).substring(2, 8);
    const filename = `${subfolder}_${Date.now()}_${randomHash}.${ext}`;
    const filePath = path.join(targetDir, filename);

    fs.writeFileSync(filePath, buffer);
    console.log(`📸 Image saved to disk: uploads/${subfolder}/${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);

    return `/uploads/${subfolder}/${filename}`;
  } catch (error) {
    console.error('❌ Error saving base64 image to disk:', error.message);
    return base64Str; // Fallback to original string if write fails
  }
};

/**
 * Processes an array of images (Base64 or URLs)
 */
export const processImagesArray = (imagesArray, subfolder = 'general') => {
  if (!Array.isArray(imagesArray)) return [];
  return imagesArray.map(img => saveBase64Image(img, subfolder)).filter(Boolean);
};
