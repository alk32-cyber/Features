/*
 * Reveal choreography.
 *
 * One observer for the whole page. Elements are unobserved the moment they
 * play, so a long page does not accumulate observer work, and scrolling back up
 * never replays or re-queues anything.
 *
 * Stagger for [data-reveal="seq"] is derived from each child's real index and
 * written once, at init, as a custom property. No per-element inline delays and
 * no work during scroll.
 */
import { qsa, reducedMotion } from './util.js';

/** Long lists tighten their stagger so the last item never feels abandoned. */
function applySequenceIndices(container) {
  const children = Array.from(container.children);
  const stagger = children.length > 6 ? 45 : 70;
  container.style.setProperty('--rl-stagger', `${stagger}ms`);
  children.forEach((child, i) => child.style.setProperty('--i', String(i)));
}

export function initReveal() {
  const targets = qsa('[data-reveal]');
  if (!targets.length) return;

  targets
    .filter((el) => el.dataset.reveal === 'seq')
    .forEach(applySequenceIndices);

  if (reducedMotion() || typeof IntersectionObserver === 'undefined') {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

  targets.forEach((el) => io.observe(el));
}
