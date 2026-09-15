/* Ecosystem constellation: tabs around a hub, spokes light with the selection. */
import { qs, qsa, bindTablist } from './util.js';

export function initEcosystem() {
  const root = qs('[data-eco]');
  if (!root) return;

  const panels = qsa('.rl-eco__panel', root);
  const spokes = qsa('[data-spoke]', root);

  const { select } = bindTablist(root, {
    tabSelector: '[data-eco-tab]',
    onSelect(tab) {
      const key = tab.dataset.ecoTab;

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

  // Hovering a node previews it without stealing keyboard focus order.
  qsa('[data-eco-tab]', root).forEach((tab, i) => {
    tab.addEventListener('pointerenter', () => select(i));
  });
}
