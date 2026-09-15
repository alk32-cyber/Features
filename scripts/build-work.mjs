#!/usr/bin/env node
/*
 * Renders assets/data/projects.json into the Work markup in the page sources
 * (src/pages/index.html and src/pages/work.html), between the
 * <!-- work:start --> / <!-- work:end --> markers. scripts/build.mjs then
 * assembles those sources into the HTML served at the repo root.
 *
 * The output is plain HTML on purpose: the case studies are the most SEO-relevant
 * content on the site, so they ship in the document rather than being fetched.
 *
 * Usage: npm run build:work   (runs this, then the page build)
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const escape = (value = '') => String(value).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const NEUTRAL_OUTCOME = 'Outcomes are only listed where they have been verified.';

function renderProject(project, index) {
  const placeholder = Boolean(project.placeholder);
  const caps = (project.capabilities || []).map(escape).join(' · ');

  const tags = [
    placeholder ? '<span class="ol-badge ol-badge--ember">Placeholder</span>' : '',
    caps ? `<span class="ol-mono ol-muted">${caps}</span>` : ''
  ].filter(Boolean).join('\n              ');

  const title = project.url
    ? `<a href="${escape(project.url)}" rel="noopener">${escape(project.title)}</a>`
    : escape(project.title);

  const outcome = project.outcome
    ? `<strong>Outcome.</strong> ${escape(project.outcome)}`
    : NEUTRAL_OUTCOME;

  return `      <li class="ol-work__item${placeholder ? ' is-placeholder' : ''}${index === 0 ? ' ol-work__item--lead' : ''}">
        <article class="ol-work__card">
          <div class="ol-work__visual" aria-hidden="true"><span class="ol-work__glyph"></span></div>
          <div class="ol-work__body">
            <p class="ol-work__tags">
              ${tags}
            </p>
            <h3 class="ol-h3">${title}</h3>
            <p class="ol-work__need"><strong>The need.</strong> ${escape(project.need)}</p>
            <p class="ol-work__built"><strong>What we built.</strong> ${escape(project.built)}</p>
            <p class="ol-work__outcome ol-small ol-muted">${outcome}</p>
          </div>
        </article>
      </li>`;
}

function renderList(projects) {
  if (!projects.length) {
    return `    <p class="ol-work-empty ol-lead ol-muted">Case studies are being written up. In the meantime, ask us what we've built.</p>`;
  }
  return `    <ul class="ol-work" data-work data-reveal="seq">\n${projects.map(renderProject).join('\n')}\n    </ul>`;
}

async function inject(file, projects) {
  const path = resolve(root, file);
  const html = await readFile(path, 'utf8');
  const start = '<!-- work:start · generated from assets/data/projects.json by scripts/build-work.mjs -->';
  const end = '<!-- work:end -->';

  const from = html.indexOf(start);
  const to = html.indexOf(end);

  if (from === -1 || to === -1) {
    console.warn(`  skipped ${file} — markers not found`);
    return;
  }

  const next = `${html.slice(0, from + start.length)}\n${renderList(projects)}\n    ${html.slice(to)}`;
  await writeFile(path, next, 'utf8');
  console.log(`  wrote ${file} (${projects.length} project${projects.length === 1 ? '' : 's'})`);
}

const data = JSON.parse(await readFile(resolve(root, 'assets/data/projects.json'), 'utf8'));
const projects = Array.isArray(data.projects) ? data.projects : [];

const placeholders = projects.filter((p) => p.placeholder).length;
if (placeholders) {
  console.warn(`\n  ⚠  ${placeholders} placeholder project${placeholders === 1 ? '' : 's'} still in projects.json.`);
  console.warn('     They render with a visible "Placeholder" tag. Replace them with real work before launch.\n');
}

// Writes into the page SOURCES, not the built output — scripts/build.mjs
// assembles those into the HTML at the repo root afterwards.
await inject('src/pages/index.html', projects.slice(0, 3));
await inject('src/pages/work.html', projects);

console.log('\n  now run: node scripts/build.mjs');
