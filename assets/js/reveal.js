/* Scroll reveals — one observer for the whole page, elements unobserved once shown. */
import { qsa, reducedMotion } from './util.js';

export function initReveal() {
  const targets = qsa('[data-reveal]');
  if (!targets.length) return;

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
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  targets.forEach((el) => io.observe(el));
}
