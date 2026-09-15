/* Navigation: sticky state, Features mega-menu, mobile drawer. */
import { qs, qsa } from './util.js';

export function initNav() {
  const nav = qs('[data-nav]');
  if (!nav) return;

  /* --- sticky background, rAF-batched so scrolling stays cheap ----------- */
  let ticking = false;
  const applyStuck = () => {
    nav.classList.toggle('is-stuck', window.scrollY > 12);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(applyStuck);
  }, { passive: true });
  applyStuck();

  /* --- mega-menu --------------------------------------------------------- */
  const root = qs('[data-mega-root]', nav);
  const trigger = qs('[data-mega-trigger]', nav);
  const panel = qs('[data-mega-panel]', nav);

  if (root && trigger && panel) {
    let closeTimer;

    const setOpen = (open) => {
      clearTimeout(closeTimer);
      trigger.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
    };

    trigger.addEventListener('click', () => {
      setOpen(trigger.getAttribute('aria-expanded') !== 'true');
    });

    root.addEventListener('pointerenter', () => {
      if (window.matchMedia('(hover: hover)').matches) setOpen(true);
    });

    root.addEventListener('pointerleave', () => {
      if (!window.matchMedia('(hover: hover)').matches) return;
      closeTimer = setTimeout(() => setOpen(false), 140);
    });

    root.addEventListener('focusout', (e) => {
      if (!root.contains(e.relatedTarget)) setOpen(false);
    });

    qsa('a', panel).forEach((link) => link.addEventListener('click', () => setOpen(false)));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        trigger.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (!root.contains(e.target)) setOpen(false);
    });
  }

  /* --- mobile drawer ----------------------------------------------------- */
  const toggle = qs('[data-drawer-toggle]', nav);
  const drawer = qs('[data-drawer]', nav);

  if (toggle && drawer) {
    const setDrawer = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      drawer.hidden = false;
      drawer.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (!open) {
        // keep it out of the a11y tree once the transition has finished
        setTimeout(() => { if (!drawer.classList.contains('is-open')) drawer.hidden = true; }, 320);
      }
    };

    drawer.hidden = true;
    toggle.addEventListener('click', () => setDrawer(toggle.getAttribute('aria-expanded') !== 'true'));
    qsa('a', drawer).forEach((link) => link.addEventListener('click', () => setDrawer(false)));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setDrawer(false);
        toggle.focus();
      }
    });

    window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
      if (e.matches) setDrawer(false);
    });
  }
}
