# phayuk.com

Personal portfolio. The public site is a static [Astro](https://astro.build) build that nginx serves. A local admin dashboard edits the content.

```
content/            ← all site data (JSON). Edited by the admin, committed to git.
frontend/           ← Astro site (pages, components, styles)
  public/           ← images and files served as-is (uploads land in public/uploads/)
backend/            ← local admin server (Express) + dashboard UI in backend/admin/
deploy/nginx.conf   ← example nginx config
start.sh            ← one command to run everything
```

## Run locally

```bash
./start.sh            # site → http://localhost:4321, admin → http://localhost:4000
```

Edit content in the admin and click **Save**. The JSON in `content/` and any uploaded files are written straight into the repo. The dev site reloads by itself.

Uploaded photos are resized to at most 2000px, converted to WebP and stripped of EXIF/GPS metadata.

Project entries support:
- **Text**: title, subtitle, overview (blank line = new paragraph), tags.
- **Photos**: cover image plus a build log of photo + text stages (bulk upload supported).
- **Links**: each link can show as a button, an embedded frame (YouTube, Vimeo, Drive and Figma links are converted automatically) or both. Each build-log stage can also have its own button or embed.

## Deploy (on the VPS)

Needs nginx, git and Node.js 22.23+ on the server. Other nginx sites are not touched.

```bash
# Install Node (skip if `node -v` already shows 22.23+)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs

git clone git@github.com:aYukine/Phayuk.git ~/phayuk && cd ~/phayuk
./deploy/install.sh          # build, publish to /var/www/phayuk, add the nginx site
./deploy/install.sh --ssl    # HTTPS (needs: sudo apt install -y certbot python3-certbot-nginx)
```

Update after pushing changes:

```bash
cd ~/phayuk && git pull && ./deploy/install.sh
```

Each run publishes a new release under `/var/www/phayuk/releases/` and points `current` at it. The last five are kept. To roll back, point `current` at an older release and reload nginx.

## Config

| Env var | Default | Purpose |
| --- | --- | --- |
| `ADMIN_PORT` | `4000` | Admin dashboard port |
| `ADMIN_HOST` | `127.0.0.1` | Admin bind address |
| `FRONTEND_URL` | `http://localhost:4321` | Where "View on site" links point |
