# OrbitLift

The OrbitLift website: a static, dependency-free site covering the five capabilities —
custom websites, AI receptionists, AI chatbots, SEO and business automation.

`DESIGN.md` holds the information architecture, visual direction, motion system and copy
strategy the build follows. Read it before changing anything structural.

## Running it

```bash
npm run build      # assemble the pages from src/
npm run serve      # http://localhost:5173
```

There are no dependencies. The build step only assembles static HTML, which is committed —
the served site is plain files and deploys to any static host with no toolchain.

## Structure

```
src/partials/         shared fragments: head, nav, footer, sprite, and the five demo
                      widgets that appear on both the homepage and a feature page
src/pages/            one file per page — a metadata header, then the body
src/schema/           JSON-LD fed into pages by name
scripts/build.mjs     assembles src/ into the HTML at the repo root, regenerates sitemap.xml
scripts/build-work.mjs renders projects.json into the Work sections

index.html            The full system experience
features.html         Feature index
features/*.html       One page per capability
work.html  about.html  404.html
assets/css/           fonts → tokens → base → layout → components → sections (in that order)
assets/fonts/         self-hosted variable fonts, latin subset (~107 KB total)
assets/js/            main.js boots one module per interactive system
assets/data/          projects.json — the only content expected to change often
```

**Edit `src/`, never the HTML at the root** — the root files are build output and will be
overwritten. Run `npm run build` after any change to `src/`.

## Theming

Dark is the brand default. `[data-theme="light"]` in `tokens.css` defines a designed light
counterpart rather than an inversion, and every translucent surface overlay resolves through
`--ol-tint-rgb` so one value flips the whole set. A tiny inline script in the head applies
the stored or system theme before first paint, so there is no flash. With no stored choice
the page follows the operating system and keeps following it live.

## Editing the Work sections

`assets/data/projects.json` is the source of truth. After editing it:

```bash
npm run build:work
```

This regenerates the static markup between the `<!-- work:start -->` and `<!-- work:end -->`
markers in `index.html` (first three projects) and `work.html` (all of them). The HTML is
generated rather than fetched at runtime because the case studies are the most
SEO-relevant content on the site.

### Content rules

These are enforced by the copy, not by the code, and they matter:

- **`"placeholder": true`** renders a visible orange *Placeholder* tag. The repository
  ships with three placeholder entries because no real project data was available at build
  time. **Replace them before launch** — the build script warns on every run while any
  remain.
- **Never add an `outcome` that has not been verified with the client.** Leave it empty and
  the card falls back to a neutral line instead of a number.
- No invented statistics, testimonials, client names, logos or integrations anywhere on the
  site. The product demos show behaviour only and name no third-party tool.
- No guaranteed search rankings. The SEO copy is written to describe practice, not promise
  position.

## Deploying

The site is static with no build step, so any static host works. `vercel.json` is
included and configures long-lived immutable caching for fonts and images, short
`stale-while-revalidate` caching for CSS/JS, and a strict Content-Security-Policy
(`default-src 'self'`) that the site satisfies with no exceptions — there are no
third-party scripts, fonts or images.

```bash
vercel deploy            # preview
vercel deploy --prod     # production
```

## Things to set before launch

- `hello@orbitlift.com` appears in the footer and both CTA buttons — swap for the real
  address or point the CTA at a form.
- Canonical URLs, `og:url` and `sitemap.xml` assume `https://orbitlift.com`. Update if the
  domain differs.
- `Organization` JSON-LD in `index.html` has no address or `areaServed`. Add real values if
  OrbitLift serves a defined area — it is the main local-SEO hook on the page.

## Browser support and accessibility

Modern evergreen browsers. The site degrades sensibly without JavaScript: all copy, the
capability panels and the Work sections are in the HTML; only the demos need JS.

`prefers-reduced-motion: reduce` disables every decorative animation, stops the auto-playing
demos and renders the receptionist transcript in full immediately. All demos are keyboard
operable, and the tab groups implement arrow-key navigation.
