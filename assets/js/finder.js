/*
 * Solution finder.
 * Weighted scoring rather than a lookup table, so overlapping problems produce a
 * sensible order instead of a pile of everything.
 */
import { qs, qsa } from './util.js';

// `phrase` is the prose form used in the summary sentence, so it reads as English
// rather than as a lowercased label.
const CAPS = {
  websites:      { name: 'Custom website',  phrase: 'a custom website',   icon: 'i-web',   href: '#websites' },
  seo:           { name: 'SEO',             phrase: 'SEO',                icon: 'i-seo',   href: '#seo' },
  chatbots:      { name: 'AI chatbot',      phrase: 'a chatbot',          icon: 'i-chat',  href: '#chatbots' },
  receptionists: { name: 'AI receptionist', phrase: 'an AI receptionist', icon: 'i-phone', href: '#receptionists' },
  automation:    { name: 'Automation',      phrase: 'automation',         icon: 'i-auto',  href: '#automation' }
};

const NEEDS = {
  found: {
    label: 'not enough people find you',
    weights: { seo: 3, websites: 2 },
    reasons: {
      seo: 'Fixes the foundations and structure search engines actually read.',
      websites: 'A site built to be indexed properly gives SEO something to work with.'
    }
  },
  site: {
    label: 'your website is dated',
    weights: { websites: 3, seo: 1 },
    reasons: {
      websites: 'A rebuild designed around how you sell, not a category template.',
      seo: 'A rebuild is the cheapest time to get the technical SEO right.'
    }
  },
  leads: {
    label: 'traffic arrives but enquiries don’t',
    weights: { websites: 3, chatbots: 2, seo: 1 },
    reasons: {
      websites: 'The page isn’t making the next step obvious enough to take.',
      chatbots: 'Catches the visitors who leave over one unanswered question.',
      seo: 'Worth checking the traffic you get is the traffic you want.'
    }
  },
  calls: {
    label: 'calls and messages get missed',
    weights: { receptionists: 3, chatbots: 1, automation: 1 },
    reasons: {
      receptionists: 'Answers out of hours and mid-job, and captures the details properly.',
      chatbots: 'Takes the questions that never needed a phone call.',
      automation: 'Makes sure a missed call turns into a callback nobody forgets.'
    }
  },
  questions: {
    label: 'you answer the same questions all day',
    weights: { chatbots: 3, receptionists: 2 },
    reasons: {
      chatbots: 'Answers the repeat questions on the site, in your own words.',
      receptionists: 'Does the same on the phone, and knows when to pass one on.'
    }
  },
  manual: {
    label: 'too much admin is manual',
    weights: { automation: 3, receptionists: 1 },
    reasons: {
      automation: 'The steps that repeat identically every time are the ones to build.',
      receptionists: 'Removes the message-taking and note-writing at the front of it.'
    }
  }
};

export function initFinder() {
  const root = qs('[data-finder]');
  if (!root) return;

  const inputs = qsa('input[type="checkbox"]', root);
  const emptyEl = qs('[data-finder-empty]', root);
  const resultEl = qs('[data-finder-result]', root);
  const recsEl = qs('[data-finder-recs]', root);
  const summaryEl = qs('[data-finder-summary]', root);
  const clearBtn = qs('[data-finder-clear]', root);

  const listPhrase = (items) => {
    if (items.length <= 1) return items[0] ?? '';
    return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
  };

  const update = () => {
    const selected = inputs.filter((i) => i.checked).map((i) => i.value);

    clearBtn.hidden = selected.length === 0;

    if (!selected.length) {
      emptyEl.hidden = false;
      resultEl.hidden = true;
      return;
    }

    const scores = {};
    const reasons = {};

    selected.forEach((key) => {
      const need = NEEDS[key];
      Object.entries(need.weights).forEach(([cap, weight]) => {
        scores[cap] = (scores[cap] || 0) + weight;
        // keep the reason attached to the need that weighted this capability most
        if (!reasons[cap] || weight > reasons[cap].weight) {
          reasons[cap] = { weight, text: need.reasons[cap] };
        }
      });
    });

    const ranked = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, selected.length >= 3 ? 4 : 3);

    recsEl.innerHTML = '';
    ranked.forEach(([cap], i) => {
      const meta = CAPS[cap];
      const li = document.createElement('li');
      li.className = `rl-finder__rec${i === 0 ? ' rl-finder__rec--lead' : ''}`;
      li.style.animationDelay = `${i * 70}ms`;
      li.innerHTML = `
        <span class="rl-finder__rec-icon">
          <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true"><use href="#${meta.icon}"/></svg>
        </span>
        <span>
          <a class="rl-finder__rec-name" href="${meta.href}">${meta.name}</a>
          <span class="rl-finder__rec-why">${reasons[cap].text}</span>
        </span>
        <span class="rl-finder__rec-tag">${i === 0 ? 'Start here' : `0${i + 1}`}</span>`;
      recsEl.append(li);
    });

    const needLabels = selected.map((k) => NEEDS[k].label);
    const lead = CAPS[ranked[0][0]].phrase;
    summaryEl.textContent =
      `Start with ${lead} — given that ${listPhrase(needLabels)}, it's the piece that changes the most. `
      + `The rest can follow once it's working. You don't have to buy the whole system at once.`;

    emptyEl.hidden = true;
    resultEl.hidden = false;
  };

  inputs.forEach((input) => input.addEventListener('change', update));

  clearBtn.addEventListener('click', () => {
    inputs.forEach((i) => { i.checked = false; });
    update();
  });

  update();
}
