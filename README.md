# RocketLift

The RocketLift website: a static, dependency-free site covering the five capabilities —
custom websites, AI receptionists, AI chatbots, SEO and business automation.

`DESIGN.md` holds the information architecture, visual direction, motion system and copy
strategy the build follows. Read it before changing anything structural.

## Running it

There is no build step and no dependencies. Serve the folder over HTTP (the pages use
root-relative paths and ES modules, so `file://` will not work):

```bash
npm run serve      # http://localhost:5173
```

## Structure

```
index.html            The full system experience (12 sections)
work.html             Selected work
about.html            How RocketLift works
404.html
sitemap.xml  robots.txt  site.webmanifest

assets/css/           fonts → tokens → base → layout → components → sections (in that order)
assets/fonts/         self-hosted variable fonts, latin subset (~107 KB total)
assets/js/            main.js boots one module per interactive system
assets/data/          projects.json — the only content expected to change often
scripts/              build-work.mjs — renders projects.json into the Work sections
```

Navigation and footer markup is duplicated across the four pages. That is deliberate — it
keeps the site buildless — but it does mean a nav change has to be made in all four files.

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

## Things to set before launch

- `hello@rocketlift.com` appears in the footer and both CTA buttons — swap for the real
  address or point the CTA at a form.
- Canonical URLs, `og:url` and `sitemap.xml` assume `https://rocketlift.com`. Update if the
  domain differs.
- `Organization` JSON-LD in `index.html` has no address or `areaServed`. Add real values if
  RocketLift serves a defined area — it is the main local-SEO hook on the page.

## Browser support and accessibility

Modern evergreen browsers. The site degrades sensibly without JavaScript: all copy, the
capability panels and the Work sections are in the HTML; only the demos need JS.

`prefers-reduced-motion: reduce` disables every decorative animation, stops the auto-playing
demos and renders the receptionist transcript in full immediately. All demos are keyboard
operable, and the tab groups implement arrow-key navigation.
