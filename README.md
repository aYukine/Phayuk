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

## Deploy

One-time setup on a VPS that already runs nginx:

```bash
cp deploy/deploy.env.example deploy/deploy.env   # set DEPLOY_HOST, DEPLOY_USER, DOMAIN
deploy/deploy.sh --setup      # installs the nginx site for DOMAIN only, uploads the site
deploy/deploy.sh --ssl        # Let's Encrypt certificate + HTTPS redirect (needs certbot on the server)
```

After that, every update is:

```bash
./start.sh deploy             # build, upload a new release, reload nginx
deploy/deploy.sh --rollback   # if something looks wrong
```

Releases live in `/var/www/<site>/releases/`, and `current` points at the live one. The last five are kept. Other sites on the same nginx are not touched. If `nginx -t` fails, the new site is disabled again. Add `--dry-run` to see the server commands without running them.

## Config

| Env var | Default | Purpose |
| --- | --- | --- |
| `ADMIN_PORT` | `4000` | Admin dashboard port |
| `ADMIN_HOST` | `127.0.0.1` | Admin bind address |
| `FRONTEND_URL` | `http://localhost:4321` | Where "View on site" links point |
