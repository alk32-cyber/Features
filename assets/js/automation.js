/*
 * Automation workflows.
 * Deliberately tool-agnostic: these describe steps, never named integrations,
 * because what gets wired up depends on what a business already runs.
 */
import { qs, bindTablist } from './util.js';

const FLOWS = [
  {
    name: 'workflow / new-enquiry',
    nodes: [
      { kind: 'Trigger', title: 'Enquiry arrives', desc: 'From the site form, the chatbot, or a call the receptionist took.' },
      { kind: 'Sort', title: 'Read and categorise', desc: 'Service type, location and urgency pulled out of what they actually wrote.' },
      { kind: 'Action', title: 'Route to the right person', desc: 'Sent where it belongs instead of into one shared inbox nobody owns.' },
      { kind: 'Follow-up', title: 'Chase if it goes quiet', desc: 'A reminder fires if nothing has happened by the time you said it would.' }
    ],
    outcome: 'Nothing sits unanswered because one person was on site all day.'
  },
  {
    name: 'workflow / missed-call',
    nodes: [
      { kind: 'Trigger', title: 'Call not answered', desc: 'Outside hours, or while everyone is already on a job.' },
      { kind: 'Capture', title: 'Receptionist takes it', desc: 'The caller gets answers and the details get written down properly.' },
      { kind: 'Action', title: 'Summary to the team', desc: 'Who called, what they need, how urgent, and the callback number.' },
      { kind: 'Follow-up', title: 'Callback reminder', desc: 'Stays on the list until someone has actually called back.' }
    ],
    outcome: 'A missed call stops being a lost customer.'
  },
  {
    name: 'workflow / quote-follow-up',
    nodes: [
      { kind: 'Trigger', title: 'Quote sent', desc: 'The clock starts the moment the number goes out.' },
      { kind: 'Wait', title: 'Give them room', desc: 'A set gap — long enough to consider it, short enough to still be in mind.' },
      { kind: 'Action', title: 'One useful nudge', desc: 'A check-in that offers to answer questions rather than just asking again.' },
      { kind: 'Close', title: 'Mark the outcome', desc: 'Won, lost or gone cold — so you can see which quotes actually convert.' }
    ],
    outcome: 'Quotes get followed up the same way every time, without anyone remembering to.'
  }
];

export function initAutomation() {
  const root = qs('[data-auto]');
  if (!root) return;

  const listEl = qs('[data-auto-nodes]', root);
  const nameEl = qs('[data-auto-name]', root);
  const outcomeEl = qs('[data-auto-outcome]', root);

  const render = (flow) => {
    nameEl.textContent = flow.name;
    outcomeEl.textContent = flow.outcome;
    listEl.innerHTML = '';

    flow.nodes.forEach((node, i) => {
      const li = document.createElement('li');
      li.className = 'ol-wf__step';

      const card = document.createElement('div');
      card.className = 'ol-wf__node';
      card.innerHTML = `
        <span class="ol-wf__kind">${node.kind}</span>
        <span class="ol-wf__title">${node.title}</span>
        <span class="ol-wf__desc">${node.desc}</span>`;
      li.append(card);

      if (i < flow.nodes.length - 1) {
        const wire = document.createElement('span');
        wire.className = 'ol-wf__wire';
        wire.style.setProperty('--d', `${i * 0.85}s`);
        wire.setAttribute('aria-hidden', 'true');
        li.append(wire);
      }

      listEl.append(li);
    });
  };

  bindTablist(root, {
    tabSelector: '[data-auto-tab]',
    onSelect(tab) { render(FLOWS[Number(tab.dataset.autoTab)]); }
  }).select(0);
}
