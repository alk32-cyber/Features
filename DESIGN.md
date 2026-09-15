# OrbitLift — Design & Content Strategy

The strategy document behind `index.html`. Written before implementation; kept as the
reference for anyone extending the site.

---

## 1. Positioning

**One idea the site must land:**
> OrbitLift builds the digital systems businesses use to attract, convert, and serve customers.

OrbitLift is not "a website agency that also does AI." It is one connected system with five
parts. Every design and copy decision below serves that single argument.

**The argument, in page order:**

| Stage | Visitor question | Section |
|---|---|---|
| Hook | What is this? | 1 — Hero |
| Frame | How do the pieces fit? | 2 — Ecosystem |
| Proof of capability | What does it actually *do*? | 3–7 — the five product demos |
| Proof of process | How do we work together? | 8 — How it works |
| Proof of craft | Have you done this? | 9 — Work |
| Differentiation | Why you? | 10 — Why OrbitLift |
| Self-qualification | What do *I* need? | 11 — Solution finder |
| Action | What now? | 12 — Final CTA |

Sections 3–7 are demonstrations, not descriptions. The visitor should understand each
capability without reading a paragraph. Copy supports the demo; it does not replace it.

---

## 2. Information architecture

```
/                 index.html    The full system experience (12 sections)
/work.html        Selected work, project detail
/about.html       How OrbitLift works, who it's for, contact
/404.html
```

Navigation is deliberately small:

```
OrbitLift   Features ▾   Work   About            [Start a project]
             └ mega-menu: the five capabilities, each with a one-line
               descriptor, anchored to its section on the homepage
```

The Features mega-menu doubles as the site's internal-linking spine: it is the only place
every capability is named in one view, and it appears on every page.

**Internal linking:** hero → capability anchors; ecosystem nodes → capability anchors;
solution finder results → capability anchors; footer → every page and capability.

---

## 3. User journey

Three entry intents, all served from the hero:

1. **"I need a website."** → Websites section reachable in one click from the nav and from
   the hero visual. Ends at the same CTA.
2. **"I'm drowning in calls/messages."** → AI Receptionist and Chatbot demos.
3. **"I don't know what I need."** → The solution finder (§11) is the fallback path, and the
   hero's secondary CTA points at it.

Conversion is never a wall. A CTA appears at the end of each demo section as a quiet inline
link ("Talk through your setup →"), with full CTA blocks only in the hero, the solution
finder, and the final CTA. Three loud asks, not twelve.

---

## 4. Visual direction

**Feeling:** dark, futuristic, energetic, premium, technical.
**Metaphor:** *energy flowing through a connected system.*

### The Flow

The site's signature device. A single luminous current runs the length of the page,
threading between sections. It is one continuous idea rendered three ways:

- **The spine** — an SVG path in the background layer with a travelling light pulse. It
  connects sections visually so the page reads as one system, not twelve blocks.
- **Atmosphere** — large, soft, slowly-drifting purple fields behind content. Built from
  pre-blurred radial gradients (no runtime `filter: blur()`), so they cost nothing.
- **Activation** — when a section enters the viewport, its orange indicator lights. Orange
  is the moment of action; purple is the medium it travels through.

### Colour hierarchy — Black → Purple → Orange

Black establishes the environment. Purple carries the identity. Orange marks action.
Orange is reserved for: primary CTAs, active states, live indicators, key numerals, and the
single accent in each product UI. If orange appears more than twice in one viewport,
something is wrong.

Near-black is used everywhere instead of pure black (`#07060A`, a violet-cast black) so
surfaces keep depth and the purple never looks pasted on.

### Typography

Type carries most of the visual identity, so the pairing is doing real work:

- **Schibsted Grotesk** — display and headings. A sharp Scandinavian grotesque with real
  character in its curves; set very tight (-0.035em) at large sizes.
- **Instrument Sans** — body and UI. Refined, quiet, highly legible at small sizes.
- **JetBrains Mono** — eyebrows, step numbers, product-UI chrome, data labels. This is what
  makes the interfaces read as *product* rather than *marketing illustration*.

Contrast between levels is aggressive: a `clamp()` fluid scale runs from 0.75rem labels to
7rem display. Nothing sits in the middle.

### What this must never look like

No stock photography. No robot imagery. No glassmorphism panels. No rounded-card grids. No
gradient text as decoration. No evenly-distributed rainbow. Gradients are **lighting**, not
surface decoration.

---

## 5. Motion system

Every animation answers "what does this explain?" If the answer is "nothing," it is cut.
That test removed a cursor-following glow and three drifting background orbs from an
earlier revision of this build.

### Choreography, not one reveal

There is no single fade-up applied to everything — that uniformity is the most reliable
tell of a generated page. Four variants exist, each belonging to a kind of content:

| Variant | Used for | Behaviour |
|---|---|---|
| `mask` | Section headings | The line wipes up from behind its own baseline |
| `rise` (default) | Body copy, supporting text | Short, quiet, quick |
| `edge` | Product demo surfaces | Heavier, slight scale — software with mass |
| `seq` | Ordered lists and steps | Stagger derived from the item's real index |

Stagger for `seq` comes from each child's DOM index, written once as `--i` at init, and
tightens automatically past six items. There are no hand-typed per-element delays anywhere.

Reveals are one-shot and observer-driven, deliberately **not** scroll-scrubbed: a scrubbed
reveal reverses when the reader scrolls back, which reads as the page fighting them.

The hero does not use any of this. It plays a one-time entrance in reading order, because a
scroll reveal on content already in view is motion for its own sake.

### Scroll-linked motion

Three effects are tied to scroll position rather than to a clock — the atmosphere's drift,
the hero card's parallax, and the current that fills down the side of the capability
sections. All three are native CSS `scroll()` / `view()` timelines: the compositor drives
them, they cannot desynchronise from fast scrolling, and they are completely inert when the
page is still. Browsers without scroll timelines get the static composition, which is a
finished design on its own.

### Performance rules, enforced in the code

- Animate `transform` and `opacity` only. A `box-shadow` pulse on the live indicator was
  measured costing one style recalculation per frame and was rebuilt as a scaled pseudo.
- No scroll handlers doing layout work. The only `scroll` listener on the site toggles one
  class on the nav, rAF-batched.
- Pointer effects are delegated, passive, and coalesced into a single rAF; the element's box
  is measured on enter, never during the move.
- Decorative loops pause when their region leaves the viewport (`[data-ambient]`).
  `animation-play-state` does not inherit into pseudo-elements, so descendants' `::before`
  and `::after` are named explicitly — without that the workflow token kept running
  off-screen.
- Anything animating a container's height is a layout shift. The SEO layer stack reserves
  its tallest state and hangs from the top of that box; the call transcript is a
  fixed-height panel that scrolls internally rather than a box that grows.
- `prefers-reduced-motion: reduce` disables all decorative motion and stops autoplay. The
  hero entrance is neutralised explicitly rather than by shortening its duration, because it
  is delay-driven and a zero duration alone would leave it invisible until the delay elapsed.

## 6. Copy strategy

**Voice:** confident, plain, specific. Written like an engineer who can sell, not a marketer
who read about AI.

**Rules:**

- Say what the thing does. "Answers the phone when you can't" beats "AI-powered
  communication solutions."
- Ban list: *transform, unlock, leverage, seamless, cutting-edge, revolutionise, supercharge,
  empower, harness the power of.*
- No statistic that isn't sourced. No testimonial that wasn't given. No client name that
  isn't a client. No integration that hasn't been built.
- Every demo caption is one sentence. If a section needs a paragraph to be understood, the
  demo has failed.
- CTAs describe what happens next: "Start a project", "Find what you need" — not "Learn more".

**Honesty constraints applied in this build:**

- The product demos show *behaviour* (understanding a request, qualifying, capturing a
  booking, routing to a person). They never name a third-party tool, calendar, CRM, or
  phone system, because no such integration is documented.
- The Work section renders from `assets/data/projects.json`. It ships with entries flagged
  `"placeholder": true`, which render with a visible placeholder marker. Replace them with
  real projects and the marker disappears. Nothing is invented.
- No numbers appear anywhere on the site that describe results.

---

## 7. Technical approach

Static, dependency-free, no build step: hand-written semantic HTML, layered CSS, ES modules.

Rationale — the page is content-heavy and SEO-critical, so the content ships in the HTML
rather than being rendered by JavaScript; the interactions are bespoke enough that a
framework would add weight without saving work; and the whole site deploys to any static
host with no toolchain to maintain.

```
assets/css/  tokens.css → base.css → layout.css → components.css → sections.css
assets/js/   main.js orchestrates; one module per interactive system
assets/data/ projects.json (the only content that is expected to change often)
```

**SEO/technical baseline:** one `h1` per page with a strict heading hierarchy, landmark
elements, descriptive `title`/`meta description`/canonical/OG/Twitter tags per page,
`Organization` + `Service` + `FAQPage` + `BreadcrumbList` JSON-LD, `sitemap.xml`,
`robots.txt`, self-hosted variable fonts (latin subset, preloaded, `display: swap`),
no render-blocking JavaScript
(`type="module"` is deferred by default), and local-SEO-ready `Organization` markup with
`areaServed` left for real data.

**Accessibility baseline:** visible focus rings on every interactive element, keyboard
operation for every demo (tabs are real tab widgets with arrow-key support), `aria-live` on
regions that update, `prefers-reduced-motion` honoured, and a colour system checked to at
least 4.5:1 for body text and 3:1 for large text and UI borders.
