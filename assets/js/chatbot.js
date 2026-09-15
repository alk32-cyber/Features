/*
 * Chatbot demo — a real branching conversation the visitor drives.
 * Content is illustrative; a deployed bot answers from the client's own information.
 */
import { qs, observeVisibility, reducedMotion, createTimeline } from './util.js';

const TREE = {
  start: {
    bot: ["Hi — I'm the assistant for this business. What can I help with?"],
    replies: [
      { label: 'Do you cover my area?', next: 'area' },
      { label: 'How much does it cost?', next: 'cost' },
      { label: 'How soon can you start?', next: 'timing' }
    ]
  },
  area: {
    bot: [
      'We cover the city and everywhere within about 25 miles of it.',
      'Tell me your postcode or area and I can confirm it exactly.'
    ],
    replies: [
      { label: "I'm in Fairview", next: 'areaYes' },
      { label: "I'm further out than that", next: 'areaNo' }
    ]
  },
  areaYes: {
    bot: ["Fairview is well inside the area — no travel charge.", 'Want to get something booked in?'],
    replies: [
      { label: 'Yes, book me in', next: 'book' },
      { label: 'What does it cost first?', next: 'cost' }
    ]
  },
  areaNo: {
    bot: [
      "Outside the usual radius we still take jobs, but there may be a travel charge — and that's a judgement call rather than a fixed rule.",
      "I'd rather have someone confirm than quote you something wrong."
    ],
    replies: [
      { label: 'Get someone to check', next: 'human' },
      { label: 'Ask something else', next: 'start' }
    ]
  },
  cost: {
    bot: [
      'Most jobs are quoted after a quick look at what you need, because the range is genuinely wide.',
      'I can give you the starting rate, or get you an exact figure — which is more useful?'
    ],
    replies: [
      { label: 'Just the starting rate', next: 'rate' },
      { label: 'An exact figure', next: 'quote' }
    ]
  },
  rate: {
    bot: ['Standard jobs start at the published rate on the pricing page. Anything unusual is quoted before work begins — no surprise invoices.'],
    replies: [
      { label: 'That works, book me in', next: 'book' },
      { label: 'How soon can you start?', next: 'timing' }
    ]
  },
  quote: {
    bot: ["For an exact figure I'll take a few details and pass them to the team — you'll get a real number, not a range."],
    replies: [
      { label: 'Go ahead', next: 'book' },
      { label: 'Ask something else', next: 'start' }
    ]
  },
  timing: {
    bot: ['Routine work is usually within the same week. Urgent jobs get looked at the same day where we can.'],
    replies: [
      { label: "It's urgent", next: 'human' },
      { label: "It can wait — book me in", next: 'book' }
    ]
  },
  book: {
    bot: ['Good. I just need a name, a number and roughly what you need — then someone confirms the time with you.'],
    note: 'In a live deployment this is where the visitor becomes an enquiry in your system.',
    replies: [
      { label: 'Start over', next: 'start', restart: true }
    ]
  },
  human: {
    bot: ["That's one for a person rather than me. I'll flag it as urgent and get someone to call you."],
    note: 'It hands over rather than guessing — every bot we build has a line it will not cross.',
    replies: [
      { label: 'Start over', next: 'start', restart: true }
    ]
  }
};

export function initChatbot() {
  const root = qs('[data-bot]');
  if (!root) return;

  const log = qs('[data-bot-log]', root);
  const repliesEl = qs('[data-bot-replies]', root);
  const resetBtn = qs('[data-bot-reset]', root);

  let tl = createTimeline();
  let started = false;

  const scrollLog = () => {
    log.scrollTo({ top: log.scrollHeight, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  const append = (cls, text) => {
    const el = document.createElement('div');
    el.className = `ol-bot__msg ol-bot__msg--${cls}`;
    el.textContent = text;
    log.append(el);
    scrollLog();
    return el;
  };

  const showTyping = () => {
    const el = document.createElement('div');
    el.className = 'ol-bot__typing';
    el.innerHTML = '<i></i><i></i><i></i>';
    el.setAttribute('aria-hidden', 'true');
    log.append(el);
    scrollLog();
    return el;
  };

  const renderReplies = (replies) => {
    repliesEl.innerHTML = '';
    replies.forEach((reply, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `ol-bot__reply${reply.restart ? '' : i === 0 && reply.next === 'book' ? ' ol-bot__reply--cta' : ''}`;
      btn.textContent = reply.label;
      btn.style.animationDelay = `${i * 60}ms`;
      btn.addEventListener('click', () => {
        append('user', reply.label);
        if (reply.restart) { log.innerHTML = ''; }
        goto(reply.next);
      });
      repliesEl.append(btn);
    });
  };

  async function goto(key) {
    const node = TREE[key];
    if (!node) return;

    tl.cancel();
    tl = createTimeline();
    repliesEl.innerHTML = '';

    try {
      for (const message of node.bot) {
        if (reducedMotion()) {
          append('bot', message);
        } else {
          const typing = showTyping();
          await tl.wait(Math.min(1100, 380 + message.length * 11));
          typing.remove();
          append('bot', message);
          await tl.wait(160);
        }
      }
      if (node.note) append('note', node.note);
      renderReplies(node.replies);
      scrollLog();
    } catch {
      /* cancelled by a newer selection */
    }
  }

  resetBtn?.addEventListener('click', () => {
    log.innerHTML = '';
    goto('start');
  });

  observeVisibility(root, {
    threshold: 0.3,
    once: true,
    enter: () => { if (!started) { started = true; log.innerHTML = ''; goto('start'); } }
  });

  // If the section is already in view on load the observer fires immediately;
  // this guarantees content even if IntersectionObserver is unavailable.
  if (!started && typeof IntersectionObserver === 'undefined') { started = true; log.innerHTML = ''; goto('start'); }
}
