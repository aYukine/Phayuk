// Shared image processing for the admin uploads and the one-time optimizer.
// Every photo becomes:  name.webp        (max 1600px, for detail pages and the lightbox)
//                       name.thumb.webp  (max 640px, for cards and phones)
// Metadata such as GPS location is stripped; EXIF rotation is applied first.
import sharp from 'sharp';

export const FULL_SIZE = 1600;
export const THUMB_SIZE = 640;

export const thumbPath = (p) => p.replace(/\.webp$/i, '.thumb.webp');
export const isThumb = (p) => /\.thumb\.webp$/i.test(p);

/** Write a full-size WebP and its thumbnail. `input` is a path or a Buffer. */
export async function writeWebp(input, outPath) {
  const base = sharp(input, { failOn: 'none' }).rotate();
  await base.clone().resize({ width: FULL_SIZE, height: FULL_SIZE, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(outPath);
  await base.clone().resize({ width: THUMB_SIZE, height: THUMB_SIZE, fit: 'inside', withoutEnlargement: true }).webp({ quality: 74 }).toFile(thumbPath(outPath));
}
