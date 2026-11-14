// Local admin backend for the portfolio.
// Reads/writes content/*.json and stores uploads in frontend/public/uploads,
// so every change lives in the repo and ships with the static build.
import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { spawn } from 'node:child_process';
import { mkdir, readFile, readdir, rename, writeFile, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const BACKUP_DIR = path.join(CONTENT_DIR, '.backup');
const PUBLIC_DIR = path.join(ROOT, 'frontend', 'public');
const UPLOAD_DIR = path.join(PUBLIC_DIR, 'uploads');

const PORT = Number(process.env.ADMIN_PORT || 4000);
const HOST = process.env.ADMIN_HOST || '127.0.0.1';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4321';

const COLLECTIONS = {
  site: 'object',
  projects: 'array',
  awards: 'array',
  blogs: 'array',
};
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|svg)$/i;
const SLUG = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

const app = express();
app.use(express.json({ limit: '5mb' }));

// ---------- helpers ----------
const contentFile = (name) => path.join(CONTENT_DIR, `${name}.json`);

async function readJson(name) {
  return JSON.parse(await readFile(contentFile(name), 'utf8'));
}

/** Atomic write with a timestamped backup of the previous version. */
async function writeJson(name, data) {
  const file = contentFile(name);
  await mkdir(BACKUP_DIR, { recursive: true });
  try {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    await copyFile(file, path.join(BACKUP_DIR, `${name}.${stamp}.json`));
  } catch {
    /* first write, nothing to back up */
  }
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2) + '\n');
  await rename(tmp, file);
}

function validate(name, data) {
  const kind = COLLECTIONS[name];
  if (kind === 'object') {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return 'Expected an object';
    return null;
  }
  if (!Array.isArray(data)) return 'Expected an array';
  const ids = new Set();
  for (const [i, item] of data.entries()) {
    if (!item || typeof item !== 'object') return `Item ${i + 1} is not an object`;
    if (!item.id || !SLUG.test(item.id)) return `Item ${i + 1} ("${item.title || ''}") needs an id using only letters, numbers, - and _`;
    if (ids.has(item.id)) return `Duplicate id "${item.id}"`;
    ids.add(item.id);
  }
  return null;
}

const safeSegment = (s = '') => String(s).replace(/[^A-Za-z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 60) || 'misc';

// ---------- content API ----------
app.get('/api/config', (_req, res) => res.json({ frontendUrl: FRONTEND_URL, collections: Object.keys(COLLECTIONS) }));

app.get('/api/content/:name', async (req, res) => {
  const { name } = req.params;
  if (!COLLECTIONS[name]) return res.status(404).json({ error: 'Unknown collection' });
  res.json(await readJson(name));
});

app.put('/api/content/:name', async (req, res) => {
  const { name } = req.params;
  if (!COLLECTIONS[name]) return res.status(404).json({ error: 'Unknown collection' });
  const error = validate(name, req.body);
  if (error) return res.status(400).json({ error });
  await writeJson(name, req.body);
  res.json({ ok: true, savedAt: new Date().toISOString() });
});

// ---------- uploads ----------
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

app.post('/api/upload', upload.array('files', 50), async (req, res) => {
  const folder = String(req.body.folder || 'misc')
    .split('/')
    .map(safeSegment)
    .join('/');
  const dir = path.join(UPLOAD_DIR, folder);
  await mkdir(dir, { recursive: true });

  const urls = [];
  for (const file of req.files || []) {
    const parsed = path.parse(file.originalname);
    const base = `${safeSegment(parsed.name).toLowerCase()}-${Date.now().toString(36)}`;
    let outName;
    // Raster images are resized, auto-rotated, stripped of EXIF/GPS data and converted to WebP.
    if (/^image\/(png|jpe?g|webp|avif|heic|heif|tiff)$/i.test(file.mimetype)) {
      outName = `${base}.webp`;
      await sharp(file.buffer).rotate().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(dir, outName));
    } else {
      outName = `${base}${parsed.ext.toLowerCase()}`;
      await writeFile(path.join(dir, outName), file.buffer);
    }
    urls.push(`/uploads/${folder}/${outName}`);
  }
  res.json({ urls });
});

/** List every image under frontend/public so the admin can reuse existing media. */
app.get('/api/media', async (_req, res) => {
  const out = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (IMAGE_EXT.test(entry.name)) {
        const { mtimeMs } = await stat(full);
        out.push({ url: '/' + path.relative(PUBLIC_DIR, full).split(path.sep).join('/'), mtime: mtimeMs });
      }
    }
  }
  await walk(PUBLIC_DIR);
  out.sort((a, b) => b.mtime - a.mtime);
  res.json(out.map((m) => m.url));
});

// ---------- build ----------
let building = false;
app.post('/api/build', (_req, res) => {
  if (building) return res.status(409).json({ error: 'A build is already running' });
  building = true;
  let log = '';
  const child = spawn('npm', ['run', 'build', '-w', 'frontend'], { cwd: ROOT, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
  child.stdout.on('data', (d) => (log += d));
  child.stderr.on('data', (d) => (log += d));
  child.on('close', (code) => {
    building = false;
    res.status(code === 0 ? 200 : 500).json({ ok: code === 0, log: log.replace(/\x1b\[[0-9;]*m/g, '') });
  });
});

// Serve public media so image previews work in the admin, then the admin UI itself.
app.use(express.static(PUBLIC_DIR));
app.use(express.static(path.join(ROOT, 'backend', 'admin')));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, HOST, () => {
  console.log(`Admin dashboard → http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
});
