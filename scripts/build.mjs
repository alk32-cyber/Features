#!/usr/bin/env node
/*
 * Static page builder.
 *
 * The site has nine pages that share a head, an icon sprite, a navigation bar
 * and a footer, and five interactive demo sections that appear both on the
 * homepage and on their own feature page. Hand-duplicating that shell across
 * nine files was not maintainable, so the pages are assembled here instead.
 *
 * The OUTPUT is still plain static HTML committed to the repository — nothing
 * is built at request time and the site still deploys to any static host with
 * no toolchain. This step only removes the copy-paste.
 *
 *   src/partials/*.html   shared fragments, {{token}} placeholders
 *   src/pages/**.html     one file per page: a metadata header, then the body
 *   scripts/build.mjs     assembles them into the final HTML at the repo root
 *
 * Usage: node scripts/build.mjs   (or npm run build)
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, relative } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://orbitlift.com';

const read = (p) => readFile(resolve(root, p), 'utf8');

/** Pages declare metadata in an HTML comment at the top of the file. */
function parsePage(source) {
  const match = source.match(/^<!--\s*meta\s*([\s\S]*?)-->\s*/);
  if (!match) throw new Error('page is missing its meta block');
  const meta = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^\s*([a-zA-Z]+):\s*(.*)$/);
    if (m) meta[m[1]] = m[2].trim();
  }
  return { meta, body: source.slice(match[0].length) };
}

/** Meta values land in attributes and in <title>, so they must be escaped. */
const esc = (v = '') => String(v)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

function fill(template, values) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? '');
}

/** Breadcrumb JSON-LD for anything below the root. */
function breadcrumbs(meta) {
  if (!meta.crumb) return null;
  const parts = meta.crumb.split('|').map((p) => p.trim());
  const items = [{ name: 'Home', item: `${ORIGIN}/` }];
  if (parts.length > 1) items.push({ name: parts[0], item: `${ORIGIN}/features.html` });
  items.push({ name: parts[parts.length - 1], item: `${ORIGIN}${meta.path}` });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.name, item: it.item
    }))
  };
}

async function collectPages(dir, base = '') {
  const out = [];
  for (const entry of await readdir(resolve(root, dir), { withFileTypes: true })) {
    const rel = join(base, entry.name);
    if (entry.isDirectory()) out.push(...await collectPages(join(dir, entry.name), rel));
    else if (entry.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

const partials = {};
for (const name of ['sprite', 'atmos', 'nav', 'footer']) {
  partials[name] = (await read(`src/partials/${name}.html`)).trim();
}

const head = await read('src/partials/head.html');
const tail = await read('src/partials/tail.html');

const pageFiles = await collectPages('src/pages');
const built = [];

for (const file of pageFiles) {
  const source = await read(join('src/pages', file));
  const { meta, body } = parsePage(source);

  // A page pulls in partials with {{> name }}. Partials may include other
  // partials — the homepage's marketing sections wrap the same demo widgets the
  // feature pages use — so this resolves until nothing is left, with a depth
  // guard so a partial that includes itself fails loudly instead of hanging.
  let resolvedBody = body;
  for (let depth = 0; /\{\{>\s*[\w-]+\s*\}\}/.test(resolvedBody); depth++) {
    if (depth > 10) throw new Error(`${file}: include nesting too deep (circular partial?)`);
    const pending = [...resolvedBody.matchAll(/\{\{>\s*([\w-]+)\s*\}\}/g)];
    for (const [token, name] of pending) {
      const fragment = (await read(`src/partials/${name}.html`)).trim();
      resolvedBody = resolvedBody.replace(token, fragment);
    }
  }

  const schemas = [];
  if (meta.schema) schemas.push(JSON.parse(await read(`src/schema/${meta.schema}.json`)));
  const crumb = breadcrumbs(meta);
  if (crumb) schemas.push(crumb);

  const jsonld = schemas
    .map((s) => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>\n`)
    .join('');

  const html =
    fill(head, {
      ...meta,
      title: esc(meta.title),
      description: esc(meta.description),
      origin: ORIGIN,
      ogTitle: esc(meta.ogTitle || meta.title),
      ogDescription: esc(meta.ogDescription || meta.description),
      robots: meta.robots ? `<meta name="robots" content="${meta.robots}">\n` : '',
      jsonld,
      sprite: partials.sprite,
      atmos: partials.atmos,
      nav: partials.nav
    }) +
    '\n' + resolvedBody.trim() + '\n\n' +
    fill(tail, { footer: partials.footer });

  const outPath = resolve(root, file);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, html, 'utf8');
  built.push({ file, path: meta.path, indexable: meta.robots !== 'noindex' });
  console.log(`  ${file.padEnd(34)} -> ${meta.path}`);
}

/* sitemap is generated from what was actually built, so it cannot drift */
const urls = built
  .filter((p) => p.indexable)
  .sort((a, b) => a.path.length - b.path.length)
  .map((p) => {
    const priority = p.path === '/' ? '1.0' : p.path.startsWith('/features/') ? '0.9' : '0.7';
    return `  <url>\n    <loc>${ORIGIN}${p.path}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  })
  .join('\n');

await writeFile(
  resolve(root, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  'utf8'
);
console.log(`\n  sitemap.xml regenerated (${built.filter((p) => p.indexable).length} urls)`);
