/*
 * Theme toggle.
 *
 * Three states, not two: the stored preference can be "dark", "light", or
 * absent — and absent means follow the operating system, which is the default
 * and stays live if the system flips while the page is open.
 *
 * The <html> attribute is set by a tiny inline script in the document head, not
 * here, so the correct theme is painted on the first frame. This module only
 * handles the control.
 */
import { qs, qsa } from './util.js';

const KEY = 'ol-theme';
const system = window.matchMedia('(prefers-color-scheme: light)');

const stored = () => {
  try { return localStorage.getItem(KEY); } catch { return null; }
};

const resolved = () => stored() || (system.matches ? 'light' : 'dark');

export function initTheme() {
  const buttons = qsa('[data-theme-toggle]');
  if (!buttons.length) return;

  const paint = (theme) => {
    document.documentElement.dataset.theme = theme;
    buttons.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(theme === 'light'));
      btn.setAttribute('aria-label',
        theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
      const label = qs('[data-theme-label]', btn);
      if (label) label.textContent = theme === 'light' ? 'Light' : 'Dark';
    });
  };

  paint(resolved());

  buttons.forEach((btn) => btn.addEventListener('click', () => {
    const next = resolved() === 'light' ? 'dark' : 'light';
    // Choosing the theme the system already reports clears the override, so the
    // page goes back to following the system rather than pinning a value.
    try {
      if (next === (system.matches ? 'light' : 'dark')) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch { /* private mode: the choice just will not persist */ }
    paint(next);
  }));

  system.addEventListener('change', () => { if (!stored()) paint(resolved()); });
}
