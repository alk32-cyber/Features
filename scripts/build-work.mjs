#!/usr/bin/env node
/*
 * Renders assets/data/projects.json into the static Work markup in index.html and
 * work.html, between the <!-- work:start --> / <!-- work:end --> markers.
 *
 * The output is plain HTML on purpose: the case studies are the most SEO-relevant
 * content on the site, so they ship in the document rather than being fetched.
 *
 * Usage: node scripts/build-work.mjs
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
    placeholder ? '<span class="rl-badge rl-badge--ember">Placeholder</span>' : '',
    caps ? `<span class="rl-mono rl-muted">${caps}</span>` : ''
  ].filter(Boolean).join('\n              ');

  const title = project.url
    ? `<a href="${escape(project.url)}" rel="noopener">${escape(project.title)}</a>`
    : escape(project.title);

  const outcome = project.outcome
    ? `<strong>Outcome.</strong> ${escape(project.outcome)}`
    : NEUTRAL_OUTCOME;

  return `      <li class="rl-work__item${placeholder ? ' is-placeholder' : ''}${index === 0 ? ' rl-work__item--lead' : ''}">
        <article class="rl-work__card">
          <div class="rl-work__visual" aria-hidden="true"><span class="rl-work__glyph"></span></div>
          <div class="rl-work__body">
            <p class="rl-work__tags">
              ${tags}
            </p>
            <h3 class="rl-h3">${title}</h3>
            <p class="rl-work__need"><strong>The need.</strong> ${escape(project.need)}</p>
            <p class="rl-work__built"><strong>What we built.</strong> ${escape(project.built)}</p>
            <p class="rl-work__outcome rl-small rl-muted">${outcome}</p>
          </div>
        </article>
      </li>`;
}

function renderList(projects) {
  if (!projects.length) {
    return `    <p class="rl-work-empty rl-lead rl-muted">Case studies are being written up. In the meantime, ask us what we've built.</p>`;
  }
  return `    <ul class="rl-work" data-work data-reveal="seq">\n${projects.map(renderProject).join('\n')}\n    </ul>`;
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

await inject('index.html', projects.slice(0, 3));
await inject('work.html', projects);
