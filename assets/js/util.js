/* RocketLift — shared helpers */

export const qs  = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Single source of truth for whether decorative motion may run. */
export const reducedMotion = () => motionQuery.matches;

export function onMotionChange(fn) {
  motionQuery.addEventListener('change', fn);
}

/**
 * Run `enter` when the element becomes visible and `exit` when it leaves.
 * Demos use this to stay inert until seen, and to stop when scrolled away.
 */
export function observeVisibility(el, { enter, exit, threshold = 0.25, once = false } = {}) {
  if (!el || typeof IntersectionObserver === 'undefined') {
    enter?.();
    return () => {};
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        enter?.(entry);
        if (once) io.disconnect();
      } else {
        exit?.(entry);
      }
    });
  }, { threshold, rootMargin: '0px 0px -8% 0px' });

  io.observe(el);
  return () => io.disconnect();
}

/** Cancellable sleep so a running demo can be torn down mid-sequence. */
export function createTimeline() {
  let timers = [];
  let cancelled = false;

  return {
    wait(ms) {
      return new Promise((resolve, reject) => {
        if (cancelled) return reject(new Error('cancelled'));
        const id = setTimeout(() => (cancelled ? reject(new Error('cancelled')) : resolve()), ms);
        timers.push(id);
      });
    },
    cancel() {
      cancelled = true;
      timers.forEach(clearTimeout);
      timers = [];
    },
    reset() {
      this.cancel();
      cancelled = false;
    },
    get cancelled() { return cancelled; }
  };
}

/**
 * Accessible tablist: roving tabindex, Left/Right/Home/End, click.
 * `onSelect(value, index, button)` fires for every selection.
 */
export function bindTablist(container, { tabSelector, onSelect }) {
  const tabs = qsa(tabSelector, container);
  if (!tabs.length) return { select: () => {}, tabs };

  const select = (index, { focus = false } = {}) => {
    const i = (index + tabs.length) % tabs.length;
    tabs.forEach((tab, n) => {
      const on = n === i;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    if (focus) tabs[i].focus();
    onSelect?.(tabs[i], i);
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      const map = {
        ArrowRight: i + 1, ArrowDown: i + 1,
        ArrowLeft: i - 1,  ArrowUp: i - 1,
        Home: 0, End: tabs.length - 1
      };
      if (!(e.key in map)) return;
      e.preventDefault();
      select(map[e.key], { focus: true });
    });
  });

  return { select, tabs };
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
