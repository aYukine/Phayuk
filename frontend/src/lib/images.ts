// Build-time helper: looks up a public image's size and its .thumb.webp variant
// so pages can ship width/height (no layout shift) and a srcset (small files on phones).
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { imageSize } from 'image-size';

const PUBLIC_DIR = [path.resolve('public'), path.resolve('frontend/public')].find((p) => existsSync(p)) ?? path.resolve('public');

export interface ImageInfo {
  src: string;
  srcset?: string;
  width?: number;
  height?: number;
}

const cache = new Map<string, ImageInfo>();

function dims(file: string) {
  try {
    const { width, height } = imageSize(readFileSync(file));
    return width && height ? { width, height } : undefined;
  } catch {
    return undefined;
  }
}

export function imageInfo(src?: string): ImageInfo {
  if (!src) return { src: '' };
  if (!src.startsWith('/')) return { src }; // external URL
  const hit = cache.get(src);
  if (hit) return hit;

  const file = path.join(PUBLIC_DIR, decodeURI(src));
  const info: ImageInfo = { src, ...dims(file) };
  const thumbSrc = src.replace(/\.webp$/i, '.thumb.webp');
  if (thumbSrc !== src) {
    const t = dims(path.join(PUBLIC_DIR, decodeURI(thumbSrc)));
    if (t && info.width && t.width < info.width) info.srcset = `${thumbSrc} ${t.width}w, ${src} ${info.width}w`;
  }
  cache.set(src, info);
  return info;
}
