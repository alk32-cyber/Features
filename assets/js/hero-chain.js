/* Hero: the active station cycles down the chain, mirroring the travelling light. */
import { qs, qsa, reducedMotion, observeVisibility } from './util.js';

export function initHeroChain() {
  const chain = qs('[data-chain]');
  if (!chain) return;

  const nodes = qsa('[data-chain-node]', chain);
  if (!nodes.length) return;

  let index = 0;
  let timer = null;

  const paint = () => nodes.forEach((n, i) => n.classList.toggle('is-active', i === index));

  const advance = () => {
    index = (index + 1) % nodes.length;
    paint();
  };

  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => {
    if (timer || reducedMotion()) return;
    timer = setInterval(advance, 2200);
  };

  // Hovering or focusing takes manual control; leaving resumes the cycle.
  nodes.forEach((node, i) => {
    const take = () => { stop(); index = i; paint(); };
    node.addEventListener('pointerenter', take);
    node.addEventListener('focus', take);
    node.addEventListener('pointerleave', start);
    node.addEventListener('blur', start);
  });

  paint();
  observeVisibility(chain, { enter: start, exit: stop, threshold: 0.2 });
}
