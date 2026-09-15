/*
 * Pointer response on work cards.
 *
 * Writes two custom properties that a CSS radial highlight consumes. Deliberate
 * constraints, because this is exactly the kind of effect that quietly costs a
 * page its frame budget:
 *
 *   - one delegated listener on the list, not one per card
 *   - passive, so it can never block scrolling
 *   - coalesced into a single rAF, so a 1000 Hz mouse still writes once a frame
 *   - the card's box is measured on enter, not on every move, so there is no
 *     layout read in the move handler
 *   - never attached at all on touch or under reduced motion
 */
import { qs, reducedMotion } from './util.js';

export function initPointer() {
  const list = qs('[data-work]');
  if (!list) return;
  if (reducedMotion()) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let frame = 0;
  let pending = null;
  let box = null;
  let card = null;

  const write = () => {
    frame = 0;
    if (!pending || !card || !box) return;
    card.style.setProperty('--px', `${pending.x - box.left}px`);
    card.style.setProperty('--py', `${pending.y - box.top}px`);
  };

  list.addEventListener('pointerover', (e) => {
    const item = e.target.closest('.ol-work__item');
    if (!item) return;
    card = item.querySelector('.ol-work__card');
    box = card?.getBoundingClientRect() ?? null;
  }, { passive: true });

  list.addEventListener('pointermove', (e) => {
    if (!card || !box) return;
    pending = { x: e.clientX, y: e.clientY };
    if (!frame) frame = requestAnimationFrame(write);
  }, { passive: true });

  list.addEventListener('pointerleave', () => {
    if (frame) { cancelAnimationFrame(frame); frame = 0; }
    card = null; box = null; pending = null;
  }, { passive: true });
}
