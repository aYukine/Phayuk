// Content lives in /content/*.json at the repo root. The admin dashboard
// (backend/) writes these files; Astro reads them at build time.
import siteJson from '../../../content/site.json';
import projectsJson from '../../../content/projects.json';
import awardsJson from '../../../content/awards.json';
import blogsJson from '../../../content/blogs.json';

export interface Link {
  label: string;
  url: string;
  /** "button" renders a link button, "embed" renders an iframe, "both" renders both. */
  display?: 'button' | 'embed' | 'both';
  style?: 'primary' | 'secondary';
}

export interface Step {
  label: string;
  desc: string;
  img?: string;
  embed?: string;
  linkLabel?: string;
  linkUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  category?: string;
  year?: string;
  cover?: string;
  featured?: boolean;
  published?: boolean;
  tags?: string[];
  links?: Link[];
  steps?: Step[];
}

export interface Award {
  id: string;
  title: string;
  organization: string;
  year: string;
  placement?: string;
  summary: string;
  description?: string;
  image?: string;
  project?: string;
  featured?: boolean;
  published?: boolean;
  links?: Link[];
}

export interface Blog {
  id: string;
  title: string;
  context: string;
  year?: string;
  body?: string;
  cover?: string;
  published?: boolean;
  images?: { src: string; caption?: string }[];
}

export interface Site {
  name: string;
  brand: string;
  role: string;
  eyebrow?: string;
  headline?: string;
  bio: string;
  footerBlurb?: string;
  location?: string;
  email?: string;
  avatar?: string;
  banner?: string;
  resume?: string;
  skills?: string[];
  stats?: { value: string; label: string }[];
  socials?: { label: string; url: string }[];
  seo: { siteUrl: string; title: string; description: string; keywords?: string; ogImage?: string };
}

const visible = <T extends { published?: boolean }>(items: T[]) => items.filter((i) => i.published !== false);

export const site = siteJson as Site;
export const projects = visible(projectsJson as Project[]);
export const awards = visible(awardsJson as Award[]).sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
export const blogs = visible(blogsJson as Blog[]);

export const featured = <T extends { featured?: boolean }>(items: T[], n: number) => {
  const f = items.filter((i) => i.featured);
  return (f.length ? f : items).slice(0, n);
};

/** Split plain text into paragraphs on blank lines. */
export const paragraphs = (text = '') =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

/** Turn common share URLs (YouTube, Vimeo, Google Drive, Figma) into embeddable URLs. */
export function toEmbedUrl(raw: string): string {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname.startsWith('/embed/')) return raw;
      const id = u.searchParams.get('v') || u.pathname.split('/shorts/')[1];
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (host === 'youtu.be') return `https://www.youtube-nocookie.com/embed${u.pathname}`;
    if (host === 'vimeo.com') return `https://player.vimeo.com/video${u.pathname}`;
    if (host === 'drive.google.com') return raw.replace(/\/view.*$/, '/preview');
    if (host === 'figma.com') return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(raw)}`;
    return raw;
  } catch {
    return raw;
  }
}

export const isExternal = (url = '') => /^https?:\/\//.test(url);
