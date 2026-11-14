// Portfolio admin: a small schema-driven editor for content/*.json.
// Add a field to a schema below and it appears in the dashboard automatically.

const LINK_FIELDS = [
  { key: 'label', label: 'Button / caption text' },
  { key: 'url', label: 'URL', type: 'url', hint: 'YouTube, Vimeo, Google Drive and Figma links are converted to embeds automatically.' },
  { key: 'display', label: 'Show as', type: 'select', options: [['button', 'Button'], ['embed', 'Embedded frame'], ['both', 'Button + embed']] },
  { key: 'style', label: 'Button style', type: 'select', options: [['', 'Auto'], ['primary', 'Primary (solid)'], ['secondary', 'Secondary (outline)']] },
];
const linksField = (hint) => ({ key: 'links', label: 'Links & embeds', type: 'list', full: true, hint, fields: LINK_FIELDS, newItem: () => ({ label: '', url: '', display: 'button' }), itemLabel: (l) => l.label || l.url || 'New link' });

const SCHEMAS = {
  site: {
    label: 'Profile & SEO',
    kind: 'object',
    sitePath: () => '/',
    fields: [
      { key: 'name', label: 'Full name' },
      { key: 'brand', label: 'Logo text', hint: 'Shown in the navigation bar.' },
      { key: 'role', label: 'Role / title' },
      { key: 'eyebrow', label: 'Banner eyebrow', hint: 'Small label above your name.' },
      { key: 'headline', label: 'Banner headline', full: true },
      { key: 'bio', label: 'About / bio', type: 'textarea', full: true },
      { key: 'location', label: 'Location' },
      { key: 'email', label: 'Email' },
      { key: 'avatar', label: 'Portrait photo', type: 'image' },
      { key: 'banner', label: 'Home banner image', type: 'image', hint: 'Shown in black & white behind the hero.' },
      { key: 'resume', label: 'Résumé file', type: 'file', full: true },
      { key: 'footerBlurb', label: 'Footer blurb', type: 'textarea', full: true },
      { key: 'skills', label: 'Skills strip', type: 'tags', full: true },
      { key: 'stats', label: 'Banner stats', type: 'list', full: true, fields: [{ key: 'value', label: 'Value' }, { key: 'label', label: 'Label' }], newItem: () => ({ value: '', label: '' }), itemLabel: (s) => `${s.value} ${s.label}` },
      { key: 'socials', label: 'Social links', type: 'list', full: true, fields: [{ key: 'label', label: 'Label' }, { key: 'url', label: 'URL', type: 'url' }], newItem: () => ({ label: '', url: '' }), itemLabel: (s) => s.label || s.url },
      {
        key: 'seo', label: 'SEO', type: 'object', full: true,
        fields: [
          { key: 'siteUrl', label: 'Site URL', type: 'url', hint: 'Used for canonical URLs and the sitemap.' },
          { key: 'title', label: 'Default page title' },
          { key: 'description', label: 'Meta description', type: 'textarea', full: true, hint: 'Aim for 120–160 characters.' },
          { key: 'keywords', label: 'Keywords', full: true },
          { key: 'ogImage', label: 'Social share image', type: 'image' },
        ],
      },
    ],
  },
  projects: {
    label: 'Projects',
    kind: 'array',
    sitePath: (p) => `/projects/${p.id}/`,
    summary: (p) => [p.category, p.featured && 'featured', p.published === false && 'hidden'],
    thumb: (p) => p.cover || p.steps?.[0]?.img,
    newItem: () => ({ id: '', title: 'New project', subtitle: '', description: '', category: '', year: String(new Date().getFullYear()), cover: '', featured: false, published: false, tags: [], links: [], steps: [] }),
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'id', label: 'URL slug', type: 'slug', hint: 'Page URL: /projects/<slug>/' },
      { key: 'subtitle', label: 'Subtitle / tagline', type: 'textarea', full: true },
      { key: 'description', label: 'Overview', type: 'textarea', full: true, hint: 'Leave a blank line between paragraphs.' },
      { key: 'category', label: 'Category', hint: 'e.g. Edge AI · Assistive Tech' },
      { key: 'year', label: 'Year' },
      { key: 'cover', label: 'Cover image', type: 'image', full: true },
      { key: 'featured', label: 'Feature on home page', type: 'checkbox' },
      { key: 'published', label: 'Published', type: 'checkbox' },
      { key: 'tags', label: 'Tags', type: 'tags', full: true },
      linksField('Buttons appear in the project banner. Embeds appear below the overview.'),
      {
        key: 'steps', label: 'Build log (photos & text)', type: 'list', full: true, bulkImage: 'img',
        newItem: () => ({ label: '', desc: '', img: '' }),
        itemLabel: (s, i) => `${String(i + 1).padStart(2, '0')} · ${s.label || 'Untitled stage'}`,
        fields: [
          { key: 'label', label: 'Heading' },
          { key: 'img', label: 'Photo', type: 'image' },
          { key: 'desc', label: 'Text', type: 'textarea', full: true },
          { key: 'embed', label: 'Embed URL (replaces photo)', type: 'url', full: true, hint: 'Optional video or prototype link.' },
          { key: 'linkLabel', label: 'Button text' },
          { key: 'linkUrl', label: 'Button URL', type: 'url' },
        ],
      },
    ],
  },
  awards: {
    label: 'Awards',
    kind: 'array',
    sitePath: (a) => `/awards/${a.id}/`,
    summary: (a) => [a.year, a.placement, a.published === false && 'hidden'],
    thumb: (a) => a.image,
    newItem: () => ({ id: '', title: 'New award', organization: '', year: String(new Date().getFullYear()), placement: '', summary: '', description: '', image: '', project: '', featured: false, published: false, links: [] }),
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'id', label: 'URL slug', type: 'slug', hint: 'Page URL: /awards/<slug>/' },
      { key: 'organization', label: 'Organization' },
      { key: 'year', label: 'Year' },
      { key: 'placement', label: 'Placement', hint: 'e.g. Grand Prize, 2nd Place' },
      { key: 'project', label: 'Related project', type: 'select', options: () => [['', '— none —'], ...(state.data.projects || []).map((p) => [p.id, p.title])] },
      { key: 'summary', label: 'Summary', type: 'textarea', full: true },
      { key: 'description', label: 'Full story', type: 'textarea', full: true },
      { key: 'image', label: 'Image', type: 'image', full: true },
      { key: 'featured', label: 'Featured', type: 'checkbox' },
      { key: 'published', label: 'Published', type: 'checkbox' },
      linksField('Certificates, articles, videos…'),
    ],
  },
  blogs: {
    label: 'Journal',
    kind: 'array',
    sitePath: (b) => `/blogs/${b.id}/`,
    summary: (b) => [b.year, `${b.images?.length || 0} photos`, b.published === false && 'hidden'],
    thumb: (b) => b.cover || b.images?.[0]?.src,
    newItem: () => ({ id: '', title: 'New entry', context: '', year: String(new Date().getFullYear()), body: '', cover: '', published: false, images: [] }),
    fields: [
      { key: 'title', label: 'Title / destination' },
      { key: 'id', label: 'URL slug', type: 'slug', hint: 'Page URL: /blogs/<slug>/' },
      { key: 'context', label: 'Context', full: true },
      { key: 'year', label: 'Year' },
      { key: 'published', label: 'Published', type: 'checkbox' },
      { key: 'body', label: 'Story', type: 'textarea', full: true, hint: 'Optional text shown above the gallery.' },
      { key: 'cover', label: 'Cover image', type: 'image', full: true },
      { key: 'images', label: 'Gallery', type: 'list', full: true, bulkImage: 'src', newItem: () => ({ src: '', caption: '' }), itemLabel: (im, i) => `Photo ${i + 1}${im.caption ? ' · ' + im.caption : ''}`, fields: [{ key: 'src', label: 'Photo', type: 'image' }, { key: 'caption', label: 'Caption' }] },
    ],
  },
};

// ---------------------------------------------------------------- state
const state = { data: {}, dirty: new Set(), config: {}, route: { name: 'site', id: null }, media: null };

const $ = (sel) => document.querySelector(sel);
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k in el && k !== 'list') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}
const slugify = (s) => String(s).normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');
const clone = (o) => JSON.parse(JSON.stringify(o));

async function api(path, opts = {}) {
  const res = await fetch(path, opts);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

function toast(msg, error = false) {
  const t = h('div', { class: 'toast' + (error ? ' error' : '') }, msg);
  document.body.append(t);
  setTimeout(() => t.remove(), 3200);
}

function markDirty() {
  state.dirty.add(state.route.name);
  updateStatus();
}

function updateStatus(text) {
  const s = $('#status');
  const dirty = state.dirty.size > 0;
  s.className = 'status' + (dirty ? ' dirty' : '');
  s.textContent = text || (dirty ? '● Unsaved changes' : 'All changes saved');
  $('#save-btn').disabled = !dirty;
  renderNav();
}

// ---------------------------------------------------------------- uploads & media
function folderFor(item) {
  const { name } = state.route;
  return name === 'site' ? 'site' : `${name}/${item?.id || 'new'}`;
}

async function uploadFiles(files, folder) {
  const fd = new FormData();
  fd.append('folder', folder);
  for (const f of files) fd.append('files', f);
  updateStatus('Uploading…');
  try {
    const { urls } = await api('/api/upload', { method: 'POST', body: fd });
    state.media = null;
    return urls;
  } finally {
    updateStatus();
  }
}

function pickFiles({ multiple = false, accept = 'image/*' } = {}) {
  return new Promise((resolve) => {
    const input = h('input', { type: 'file', multiple, accept, onchange: () => resolve([...input.files]) });
    input.click();
  });
}

async function openMedia() {
  const dlg = $('#media-dialog');
  const grid = $('#media-grid');
  const filter = $('#media-filter');
  if (!state.media) state.media = await api('/api/media');
  return new Promise((resolve) => {
    const render = () => {
      const q = filter.value.toLowerCase();
      grid.replaceChildren(
        ...state.media.filter((u) => u.toLowerCase().includes(q)).map((url) =>
          h('button', { type: 'button', onclick: () => { dlg.close(); resolve(url); } }, h('img', { src: url, loading: 'lazy' }), h('small', {}, url)),
        ),
      );
    };
    filter.value = '';
    filter.oninput = render;
    render();
    dlg.onclose = () => resolve(null);
    dlg.showModal();
  });
}

// ---------------------------------------------------------------- field renderers
function renderFields(fields, obj, ctx) {
  return h('div', { class: 'fields' }, fields.map((f) => renderField(f, obj, ctx)));
}

function renderField(f, obj, ctx) {
  const type = f.type || 'text';
  const wrap = h('div', { class: 'field' + (f.full || ['list', 'object', 'tags'].includes(type) ? ' full' : '') });
  const set = (v) => { obj[f.key] = v; markDirty(); };
  const hint = f.hint && h('span', { class: 'hint' }, f.hint);

  if (type === 'checkbox') {
    wrap.append(h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: f.key === 'published' ? obj[f.key] !== false : !!obj[f.key], onchange: (e) => set(e.target.checked) }), f.label));
    return wrap;
  }

  wrap.append(h('label', {}, f.label));

  if (type === 'text' || type === 'url' || type === 'slug') {
    const input = h('input', { type: 'text', value: obj[f.key] ?? '', placeholder: type === 'url' ? 'https://' : '', spellcheck: type === 'text' });
    input.addEventListener('input', () => set(type === 'slug' ? slugify(input.value) : input.value));
    input.addEventListener('change', () => { if (type === 'slug') input.value = obj[f.key]; ctx.onLabelChange?.(); });
    wrap.append(input);
    if (type === 'slug') {
      wrap.append(h('div', { class: 'row', style: 'display:flex;gap:6px' },
        h('button', { type: 'button', class: 'btn btn-sm', onclick: () => { input.value = obj[f.key] = slugify(obj.title || ''); markDirty(); } }, 'Generate from title')));
    }
  } else if (type === 'textarea') {
    const ta = h('textarea', { value: obj[f.key] ?? '' });
    ta.addEventListener('input', () => set(ta.value));
    wrap.append(ta);
  } else if (type === 'select') {
    const opts = typeof f.options === 'function' ? f.options() : f.options;
    const sel = h('select', { onchange: (e) => set(e.target.value) }, opts.map(([v, l]) => h('option', { value: v, selected: (obj[f.key] ?? '') === v }, l)));
    wrap.append(sel);
  } else if (type === 'image' || type === 'file') {
    wrap.append(renderMedia(f, obj, ctx, type === 'image'));
  } else if (type === 'tags') {
    wrap.append(renderTags(f, obj));
  } else if (type === 'object') {
    obj[f.key] ??= {};
    wrap.append(h('div', { class: 'list-item' }, renderFields(f.fields, obj[f.key], ctx)));
  } else if (type === 'list') {
    wrap.append(renderList(f, obj, ctx));
  }
  if (hint) wrap.append(hint);
  return wrap;
}

function renderMedia(f, obj, ctx, isImage) {
  const preview = isImage ? h('img', { class: 'preview', src: obj[f.key] || '', alt: '' }) : null;
  const input = h('input', { type: 'text', value: obj[f.key] ?? '', placeholder: '/path/to/file or https://…' });
  const apply = (v) => { obj[f.key] = v; input.value = v; if (preview) preview.src = v; markDirty(); };
  input.addEventListener('input', () => apply(input.value));
  const controls = h('div', { class: 'controls' }, input, h('div', { class: 'row' },
    h('button', { type: 'button', class: 'btn btn-sm', onclick: async () => {
      const files = await pickFiles({ accept: isImage ? 'image/*' : '*/*' });
      if (!files.length) return;
      try { const [url] = await uploadFiles(files, folderFor(ctx.item)); apply(url); toast('Uploaded'); } catch (e) { toast(e.message, true); }
    } }, '↑ Upload'),
    isImage && h('button', { type: 'button', class: 'btn btn-sm', onclick: async () => { const url = await openMedia(); if (url) apply(url); } }, 'Library'),
    obj[f.key] && !isImage && h('a', { class: 'btn btn-sm', href: obj[f.key], target: '_blank' }, 'Open ↗'),
    h('button', { type: 'button', class: 'btn btn-sm btn-danger', onclick: () => apply('') }, 'Clear'),
  ));
  return isImage ? h('div', { class: 'image-field' }, preview, controls) : controls;
}

function renderTags(f, obj) {
  obj[f.key] ??= [];
  const box = h('div', { class: 'tags' });
  const render = () => {
    const input = h('input', { placeholder: 'Type and press Enter…' });
    input.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
        e.preventDefault();
        obj[f.key].push(input.value.trim());
        markDirty(); render(); box.querySelector('input').focus();
      } else if (e.key === 'Backspace' && !input.value && obj[f.key].length) {
        obj[f.key].pop(); markDirty(); render(); box.querySelector('input').focus();
      }
    });
    box.replaceChildren(...obj[f.key].map((t, i) => h('span', {}, t, h('button', { type: 'button', title: 'Remove', onclick: () => { obj[f.key].splice(i, 1); markDirty(); render(); } }, '×'))), input);
  };
  render();
  return box;
}

function renderList(f, obj, ctx) {
  obj[f.key] ??= [];
  const arr = obj[f.key];
  const container = h('div', { class: 'list' });
  const collapsed = new WeakSet();

  const render = () => {
    const items = arr.map((item, i) => {
      const fieldsEl = renderFields(f.fields, item, ctx);
      const title = h('strong', {}, f.itemLabel ? f.itemLabel(item, i) : `Item ${i + 1}`);
      fieldsEl.addEventListener('change', () => (title.textContent = f.itemLabel ? f.itemLabel(item, i) : `Item ${i + 1}`));
      const move = (d) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; markDirty(); render(); };
      const el = h('div', { class: 'list-item' + (collapsed.has(item) ? ' collapsed' : '') },
        h('header', {}, title, h('div', { class: 'tools' },
          h('button', { type: 'button', class: 'btn btn-sm', title: 'Move up', disabled: i === 0, onclick: () => move(-1) }, '↑'),
          h('button', { type: 'button', class: 'btn btn-sm', title: 'Move down', disabled: i === arr.length - 1, onclick: () => move(1) }, '↓'),
          h('button', { type: 'button', class: 'btn btn-sm', onclick: () => { collapsed.has(item) ? collapsed.delete(item) : collapsed.add(item); el.classList.toggle('collapsed'); } }, '▾'),
          h('button', { type: 'button', class: 'btn btn-sm btn-danger', title: 'Remove', onclick: () => { if (confirm('Remove this entry?')) { arr.splice(i, 1); markDirty(); render(); } } }, '✕'),
        )),
        fieldsEl,
      );
      return el;
    });
    const actions = h('div', { class: 'list-actions' },
      h('button', { type: 'button', class: 'btn btn-sm', onclick: () => { arr.push(f.newItem ? f.newItem() : {}); markDirty(); render(); } }, '+ Add'),
      f.bulkImage && h('button', { type: 'button', class: 'btn btn-sm', onclick: async () => {
        const files = await pickFiles({ multiple: true });
        if (!files.length) return;
        try {
          const urls = await uploadFiles(files, folderFor(ctx.item));
          for (const url of urls) arr.push({ ...(f.newItem ? f.newItem() : {}), [f.bulkImage]: url });
          markDirty(); render(); toast(`Added ${urls.length} photo${urls.length > 1 ? 's' : ''}`);
        } catch (e) { toast(e.message, true); }
      } }, '↑ Upload photos'),
      arr.length > 3 && h('button', { type: 'button', class: 'btn btn-sm', onclick: () => { const all = arr.every((it) => collapsed.has(it)); arr.forEach((it) => (all ? collapsed.delete(it) : collapsed.add(it))); render(); } }, 'Collapse / expand all'),
    );
    container.replaceChildren(...items, actions);
  };
  render();
  return container;
}

// ---------------------------------------------------------------- views
function renderNav() {
  const nav = $('#nav');
  nav.replaceChildren(...Object.entries(SCHEMAS).map(([name, s]) =>
    h('a', { href: `#/${name}`, class: name === state.route.name ? 'active' : '' },
      h('span', {}, s.label, state.dirty.has(name) ? ' •' : ''),
      s.kind === 'array' && h('span', { class: 'count' }, state.data[name]?.length ?? ''),
    )));
}

function siteUrl(path) {
  return (state.config.frontendUrl || '') + path;
}

function render() {
  const { name, id } = state.route;
  const schema = SCHEMAS[name];
  const data = state.data[name];
  $('#crumb').textContent = schema.kind === 'array' ? `${schema.label} · ${data.length} entries` : 'Settings';
  $('#title').textContent = schema.label;
  updateStatus();
  const view = $('#view');

  if (schema.kind === 'object') {
    view.replaceChildren(h('div', { class: 'card' },
      h('div', { class: 'card-head' }, h('h2', {}, 'Site profile'), h('div', { class: 'tools' }, h('a', { class: 'btn btn-sm', href: siteUrl('/'), target: '_blank' }, 'View site ↗'))),
      renderFields(schema.fields, data, { item: null })));
    return;
  }

  const index = data.findIndex((d) => d.id === id);
  const current = index >= 0 ? data[index] : null;

  const list = h('div', { class: 'item-list' });
  const renderList = () => list.replaceChildren(
    ...data.map((item, i) => {
      const thumb = schema.thumb?.(item);
      const tags = (schema.summary?.(item) || []).filter(Boolean);
      return h('button', { class: 'item' + (i === index ? ' active' : ''), onclick: () => (location.hash = `#/${name}/${encodeURIComponent(item.id || `__${i}`)}`) },
        thumb ? h('img', { class: 'thumb', src: thumb, alt: '' }) : h('div', { class: 'thumb' }),
        h('div', { class: 'meta' }, h('strong', {}, item.title || '(untitled)'), h('small', {}, tags.join(' · '))));
    }),
    h('div', { class: 'list-foot' }, h('button', { class: 'btn btn-sm', style: 'width:100%;justify-content:center', onclick: () => {
      const title = prompt(`Title for the new ${schema.label.toLowerCase()} entry:`);
      if (!title) return;
      let slug = slugify(title) || `item-${Date.now()}`;
      while (data.some((d) => d.id === slug)) slug += '-2';
      data.unshift({ ...schema.newItem(), title, id: slug });
      markDirty();
      location.hash = `#/${name}/${slug}`;
    } }, '+ New entry')),
  );
  renderList();

  let editor;
  if (!current) {
    editor = h('div', { class: 'card empty' }, data.length ? 'Select an entry to edit.' : 'No entries yet. Create one to get started.');
  } else {
    const move = (d) => { const j = index + d; if (j < 0 || j >= data.length) return; [data[index], data[j]] = [data[j], data[index]]; markDirty(); render(); };
    editor = h('div', {},
      h('div', { class: 'card' },
        h('div', { class: 'card-head' },
          h('h2', {}, current.title || '(untitled)'),
          h('div', { class: 'tools' },
            h('a', { class: 'btn btn-sm', href: siteUrl(schema.sitePath(current)), target: '_blank', title: 'Save first to see changes' }, 'View on site ↗'),
            h('button', { class: 'btn btn-sm', disabled: index === 0, onclick: () => move(-1) }, '↑ Move up'),
            h('button', { class: 'btn btn-sm', disabled: index === data.length - 1, onclick: () => move(1) }, '↓ Move down'),
            h('button', { class: 'btn btn-sm', onclick: () => {
              const copy = clone(current);
              copy.id = `${current.id}-copy`; copy.title = `${current.title} (copy)`; copy.published = false;
              data.splice(index + 1, 0, copy); markDirty(); location.hash = `#/${name}/${copy.id}`;
            } }, 'Duplicate'),
            h('button', { class: 'btn btn-sm btn-danger', onclick: () => {
              if (!confirm(`Delete "${current.title}"? (Uploaded files are kept.)`)) return;
              data.splice(index, 1); markDirty(); location.hash = `#/${name}`;
            } }, 'Delete'),
          ),
        ),
        renderFields(schema.fields, current, { item: current, onLabelChange: () => {
          if (current.id && current.id !== state.route.id) { state.route.id = current.id; history.replaceState(null, '', `#/${name}/${encodeURIComponent(current.id)}`); }
          renderList(); editor.querySelector('h2').textContent = current.title || '(untitled)'; } }),
      ),
    );
  }
  view.replaceChildren(h('div', { class: 'split' }, list, editor));
}

// ---------------------------------------------------------------- actions
async function save() {
  const names = [...state.dirty];
  try {
    updateStatus('Saving…');
    for (const name of names) {
      await api(`/api/content/${name}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state.data[name]) });
      state.dirty.delete(name);
    }
    updateStatus();
    toast('Saved. The dev site reloads automatically.');
  } catch (e) {
    updateStatus();
    $('#status').className = 'status error';
    $('#status').textContent = e.message;
    toast(e.message, true);
  }
}

async function build() {
  if (state.dirty.size && !confirm('You have unsaved changes. Build anyway with the saved content?')) return;
  const btn = $('#build-btn');
  btn.disabled = true; btn.textContent = 'Building…';
  try {
    const res = await fetch('/api/build', { method: 'POST' });
    const body = await res.json();
    $('#build-log').textContent = body.log || body.error;
    $('#build-dialog').showModal();
    toast(body.ok ? 'Build complete → frontend/dist' : 'Build failed', !body.ok);
  } catch (e) {
    toast(e.message, true);
  } finally {
    btn.disabled = false; btn.textContent = 'Build for deploy';
  }
}

function route() {
  const [, name = 'site', id = null] = location.hash.split('/');
  state.route = { name: SCHEMAS[name] ? name : 'site', id: id && decodeURIComponent(id) };
  render();
}

// ---------------------------------------------------------------- boot
(async function init() {
  state.config = await api('/api/config');
  await Promise.all(Object.keys(SCHEMAS).map(async (n) => (state.data[n] = await api(`/api/content/${n}`))));
  $('#site-link').href = state.config.frontendUrl;
  $('#save-btn').onclick = save;
  $('#build-btn').onclick = build;
  document.querySelectorAll('[data-close]').forEach((b) => (b.onclick = () => b.closest('dialog').close()));
  window.addEventListener('hashchange', route);
  window.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); if (state.dirty.size) save(); } });
  window.addEventListener('beforeunload', (e) => { if (state.dirty.size) e.preventDefault(); });
  route();
})().catch((e) => {
  document.body.textContent = `Failed to load admin: ${e.message}`;
});
