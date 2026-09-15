/*
 * Ambient motion control.
 *
 * The page has a handful of small looping animations that belong to specific
 * UI — the current travelling down the hero chain, the token moving along a
 * workflow wire, the live-call heartbeat. They are meaningful where they are
 * visible and pure waste where they are not.
 *
 * This is the only thing keeping them honest: one observer marks any ambient
 * region that leaves the viewport as idle, and CSS pauses its animations. There
 * is no scroll handler and no rAF loop anywhere in this file.
 *
 * Scroll-linked motion (the atmosphere drift, the hero card's parallax, the
 * current running beside the capability sections) is handled entirely in CSS by
 * native scroll() and view() timelines, which the compositor drives and which
 * are inert when the page is still. Browsers without those timelines simply get
 * the static composition, which is a complete design on its own.
 */
import { qsa, reducedMotion } from './util.js';

export function initAmbient() {
  const regions = qsa('[data-ambient]');
  if (!regions.length) return;

  if (reducedMotion()) {
    regions.forEach((el) => el.classList.add('is-idle'));
    return;
  }

  if (typeof IntersectionObserver === 'undefined') return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-idle', !entry.isIntersecting);
    });
  }, { rootMargin: '10% 0px' });

  regions.forEach((el) => {
    el.classList.add('is-idle');
    io.observe(el);
  });
}
