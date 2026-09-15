/* Ecosystem constellation: tabs around a hub, spokes light with the selection. */
import { qs, qsa, bindTablist } from './util.js';

export function initEcosystem() {
  const root = qs('[data-eco]');
  if (!root) return;

  const panels = qsa('.ol-eco__panel', root);
  let current = null;
  const spokes = qsa('[data-spoke]', root);

  const { select } = bindTablist(root, {
    tabSelector: '[data-eco-tab]',
    onSelect(tab) {
      const key = tab.dataset.ecoTab;
      if (key === current) return;
      current = key;

      panels.forEach((panel) => {
        const on = panel.id === `eco-panel-${key}`;
        panel.classList.toggle('is-active', on);
        panel.hidden = !on;
      });

      spokes.forEach((line) => {
        line.classList.toggle('is-active', line.dataset.spoke === key);
      });
    }
  });

  select(0);

  /*
   * Hover preview, with intent.
   *
   * Selecting on raw pointerenter made the star twitch: the nodes sit close
   * together, so simply moving the cursor across the diagram fired several
   * selections in a row and every one of them restarted the panel's entrance
   * animation. A short dwell means passing over a node does nothing and
   * stopping on one switches; leaving before the delay cancels it.
   */
  const DWELL = 140;
  let timer = null;
  const cancel = () => { clearTimeout(timer); timer = null; };

  qsa('[data-eco-tab]', root).forEach((tab, i) => {
    tab.addEventListener('pointerenter', () => {
      cancel();
      if (tab.getAttribute('aria-selected') === 'true') return;
      timer = setTimeout(() => select(i), DWELL);
    });
    tab.addEventListener('pointerleave', cancel);
    // a click should not wait for the dwell
    tab.addEventListener('pointerdown', cancel);
  });

  root.addEventListener('pointerleave', cancel);
}
