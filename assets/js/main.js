/*
 * RocketLift — entry point.
 * Every module is defensive: if its section isn't on the page, it returns immediately,
 * so the same bundle serves every page.
 */
import { qs } from './util.js';
import { initReveal } from './reveal.js';
import { initNav } from './nav.js';
import { initAtmosphere } from './atmos.js';
import { initHeroChain } from './hero-chain.js';
import { initEcosystem } from './ecosystem.js';
import { initReceptionist } from './receptionist.js';
import { initChatbot } from './chatbot.js';
import { initSeo } from './seo.js';
import { initCraft } from './craft.js';
import { initAutomation } from './automation.js';
import { initFinder } from './finder.js';

const boot = () => {
  const year = qs('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  [
    initNav, initReveal, initAtmosphere, initHeroChain, initEcosystem,
    initReceptionist, initChatbot, initSeo, initCraft, initAutomation, initFinder
  ].forEach((init) => {
    try {
      init();
    } catch (error) {
      // One broken demo must never take the rest of the page down with it.
      console.error(`[RocketLift] ${init.name} failed`, error);
    }
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
