// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const contentDir = fileURLToPath(new URL('../content/', import.meta.url));
const site = JSON.parse(readFileSync(contentDir + 'site.json', 'utf8'));

/** Reload the browser whenever the admin dashboard writes a content file. */
function contentReload() {
  return {
    name: 'content-reload',
    /** @param {import('vite').ViteDevServer} server */
    configureServer(server) {
      server.watcher.add(contentDir);
      server.watcher.on('change', (file) => {
        if (file.startsWith(contentDir)) server.ws.send({ type: 'full-reload' });
      });
    },
  };
}

export default defineConfig({
  site: site.seo?.siteUrl || 'https://phayuk.com',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss(), contentReload()],
    server: { fs: { allow: ['..'] } },
  },
});
