/* SEO: the step in view lights its layer in the stacked diagram. */
import { qs, qsa, reducedMotion } from './util.js';

export function initSeo() {
  const root = qs('[data-seo]');
  if (!root) return;

  const steps = qsa('[data-seo-step]', root);
  const planes = qsa('[data-plane]', root);
  if (!steps.length || !planes.length) return;

  const setActive = (n) => {
    steps.forEach((step, i) => step.classList.toggle('is-active', i === n));
    planes.forEach((plane, i) => {
      plane.classList.toggle('is-active', i === n);
      plane.classList.toggle('is-below', i < n);
    });
  };

  if (reducedMotion() || typeof IntersectionObserver === 'undefined') {
    planes.forEach((p) => p.classList.add('is-active'));
    steps.forEach((s) => s.classList.add('is-active'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    // Pick the entry closest to the middle of the viewport so scrolling reads cleanly
    // in both directions.
    const visible = entries.filter((e) => e.isIntersecting);
    if (!visible.length) return;
    const best = visible.reduce((a, b) => (b.intersectionRatio > a.intersectionRatio ? b : a));
    setActive(Number(best.target.dataset.seoStep));
  }, { threshold: [0.4, 0.75], rootMargin: '-25% 0px -25% 0px' });

  steps.forEach((step) => io.observe(step));
  setActive(0);
}
