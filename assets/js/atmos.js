/* Cursor-following violet light. One rAF loop, fine pointers only. */
import { qs, reducedMotion } from './util.js';

export function initAtmosphere() {
  const glow = qs('[data-cursor-glow]');
  if (!glow) return;
  if (reducedMotion()) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let x = targetX;
  let y = targetY;
  let running = false;

  const loop = () => {
    // easing toward the pointer keeps the light feeling like a field, not a cursor
    x += (targetX - x) * 0.07;
    y += (targetY - y) * 0.07;
    glow.style.setProperty('--rl-cx', `${x.toFixed(1)}px`);
    glow.style.setProperty('--rl-cy', `${y.toFixed(1)}px`);

    if (Math.abs(targetX - x) < 0.4 && Math.abs(targetY - y) < 0.4) {
      running = false;
      return;
    }
    requestAnimationFrame(loop);
  };

  const start = () => {
    if (running) return;
    running = true;
    requestAnimationFrame(loop);
  };

  window.addEventListener('pointermove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    glow.classList.add('is-live');
    start();
  }, { passive: true });

  document.addEventListener('pointerleave', () => glow.classList.remove('is-live'));
}
