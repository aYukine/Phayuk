// One-time (and re-runnable) optimizer for images already in frontend/public.
//   npm run optimize-images            convert PNG/JPEG to WebP + thumbnails, update content/*.json, delete originals
//   npm run optimize-images -- --keep  same, but keep the original files
//   npm run optimize-images -- --dry   only report what would change
import { readdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeWebp, thumbPath, isThumb } from './images.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'frontend', 'public');
const CONTENT = path.join(ROOT, 'content');
const KEEP = process.argv.includes('--keep');
const DRY = process.argv.includes('--dry');

const toUrl = (f) => '/' + path.relative(PUBLIC, f).split(path.sep).join('/');
const mb = (n) => (n / 1048576).toFixed(1) + ' MB';

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) await walk(f, out);
    else out.push(f);
  }
  return out;
}

const files = (await walk(PUBLIC)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !isThumb(f));
const renames = new Map();
let before = 0, after = 0, converted = 0, thumbs = 0;

for (const file of files) {
  const size = (await stat(file)).size;
  if (/\.webp$/i.test(file)) {
    // Already WebP (e.g. an admin upload): only make sure it has a thumbnail.
    if (!existsSync(thumbPath(file))) {
      thumbs++;
      if (!DRY) {
        const tmp = file + '.tmp.webp';
        await writeWebp(file, tmp);
        await rename(tmp, file);
        await rename(thumbPath(tmp), thumbPath(file));
      }
    }
    continue;
  }
  let out = file.replace(/\.(png|jpe?g)$/i, '.webp');
  if (existsSync(out)) out = file.replace(/\.(png|jpe?g)$/i, '-img.webp');
  before += size;
  converted++;
  renames.set(toUrl(file), toUrl(out));
  if (DRY) continue;
  await writeWebp(file, out);
  after += (await stat(out)).size + (await stat(thumbPath(out))).size;
  if (!KEEP) await unlink(file);
}

// Point every content reference at the new files.
let refs = 0;
const swap = (v) => {
  if (typeof v === 'string') { if (renames.has(v)) { refs++; return renames.get(v); } return v; }
  if (Array.isArray(v)) return v.map(swap);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, swap(x)]));
  return v;
};
for (const name of await readdir(CONTENT)) {
  if (!name.endsWith('.json')) continue;
  const file = path.join(CONTENT, name);
  const data = JSON.parse(await readFile(file, 'utf8'));
  const next = swap(data);
  if (!DRY) await writeFile(file, JSON.stringify(next, null, 2) + '\n');
}

console.log(`Converted ${converted} images${DRY ? ' (dry run)' : ''}: ${mb(before)} → ${DRY ? '?' : mb(after)} (including thumbnails)`);
if (thumbs) console.log(`Added thumbnails for ${thumbs} existing WebP images`);
console.log(`Updated ${refs} references in content/*.json`);
if (!KEEP && !DRY && converted) console.log('Originals deleted (they remain in git history).');
