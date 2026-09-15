/* Websites: the frame demonstrates each craft dimension instead of describing it. */
import { qs, qsa, bindTablist, reducedMotion, observeVisibility } from './util.js';

const NOTES = {
  layout: 'A real grid, a real type scale. The headline earns its size; everything else steps back so the eye knows where to go first.',
  motion: 'Motion that sequences the page — content arrives in reading order. Every effect here respects a visitor’s reduced-motion setting.',
  performance: 'Built to show something useful fast, then fill in. Images sized, scripts kept small, nothing blocking the first paint.',
  conversion: 'One path through the page: the promise, the action, the fallback in the nav. Everything else is support, not competition.'
};

export function initCraft() {
  const root = qs('[data-craft]');
  if (!root) return;

  const frame = qs('[data-craft-frame]', root);
  const site = qs('[data-craft-site]', root);
  const viewport = qs('.rl-craft__viewport', root);
  const note = qs('[data-craft-note]', root);
  const url = qs('[data-craft-url]', root);
  let loadTimer = null;

  const playMode = (mode) => {
    clearTimeout(loadTimer);
    viewport.classList.remove('is-loading');
    site.classList.remove('is-playing');

    if (reducedMotion()) return;

    if (mode === 'motion') {
      // restart the entrance sequence
      void site.offsetWidth;
      site.classList.add('is-playing');
    }

    if (mode === 'performance') {
      viewport.classList.add('is-loading');
      loadTimer = setTimeout(() => viewport.classList.remove('is-loading'), 1400);
    }
  };

  bindTablist(root, {
    tabSelector: '[data-craft-tab]',
    onSelect(tab) {
      const mode = tab.dataset.craftTab;
      frame.dataset.mode = mode;
      note.textContent = NOTES[mode];
      if (url) url.textContent = `a-rocketlift-build.example / ${mode}`;
      playMode(mode);
    }
  }).select(0);

  // Viewport segmented control — a live demonstration of the responsive work.
  const segs = qsa('[data-craft-view]', root);
  segs.forEach((btn) => {
    btn.addEventListener('click', () => {
      segs.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
      });
      frame.dataset.view = btn.dataset.craftView;
    });
  });

  // Replay the current mode when the section comes back into view.
  observeVisibility(root, {
    threshold: 0.35,
    enter: () => playMode(frame.dataset.mode)
  });
}
