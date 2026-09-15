/*
 * AI receptionist demo.
 *
 * Scripted, clearly labelled as such in the UI. Every action shown is behaviour the
 * product performs on its own — understanding a request, qualifying, capturing details,
 * handing over to a person. No third-party tool, calendar or phone system is implied.
 */
import { qs, qsa, bindTablist, createTimeline, observeVisibility, reducedMotion } from './util.js';

const SCENARIOS = [
  {
    name: 'after-hours-booking',
    lines: [
      { who: 'AI', text: "Good evening, thanks for calling. We're closed right now, but I can help — what do you need?", step: 0 },
      { who: 'Caller', text: "My boiler's making a noise. Can someone come out?", step: 1 },
      { who: 'AI', text: "I can get that booked in. Is this for a home or a business?", step: 1 },
      { who: 'Caller', text: 'Home. In Fairview.', step: 2 },
      { who: 'AI', text: "That's inside our area. Is there any water leaking, or is it just the noise?", step: 2 },
      { who: 'Caller', text: "No leak, just noise.", step: 2 },
      { who: 'AI', text: "Then it can wait for a normal appointment. We have tomorrow morning or Thursday afternoon — which suits?", step: 3 },
      { who: 'Caller', text: 'Thursday afternoon.', step: 3 },
      { who: 'AI', text: "Booked in as a request for Thursday afternoon. You'll get a confirmation, and if anything changes we'll call you first.", step: 3 }
    ],
    capture: [
      ['Caller', 'Home owner, Fairview'],
      ['Request', 'Boiler noise, no leak'],
      ['Urgency', 'Routine — not an emergency'],
      ['Preferred', 'Thursday afternoon']
    ],
    handoff: 'Appointment request captured and passed to the team to confirm.'
  },
  {
    name: 'pricing-question',
    lines: [
      { who: 'AI', text: 'Thanks for calling. How can I help?', step: 0 },
      { who: 'Caller', text: 'How much do you charge for a full service?', step: 1 },
      { who: 'AI', text: "A standard service starts at our published rate, but the final price depends on the unit and its age. Do you know the make?", step: 1 },
      { who: 'Caller', text: "It's about eight years old, I'm not sure of the make.", step: 2 },
      { who: 'AI', text: "That's fine — at eight years it's usually a standard service. I can note the details and have someone send you an exact figure rather than guess on the phone.", step: 2 },
      { who: 'Caller', text: 'Yes, please do that.', step: 3 },
      { who: 'AI', text: "Done. Best number to reach you on is the one you're calling from?", step: 3 },
      { who: 'Caller', text: 'That one works.', step: 3 },
      { who: 'AI', text: "Noted. Someone will come back to you with a price today or first thing tomorrow.", step: 3 }
    ],
    capture: [
      ['Caller', 'Existing unit, ~8 years old'],
      ['Request', 'Price for a full service'],
      ['Callback', 'Number used for this call'],
      ['Status', 'Quote requested']
    ],
    handoff: "It quoted the published starting rate and stopped there — exact pricing goes to a person."
  },
  {
    name: 'needs-a-human',
    lines: [
      { who: 'AI', text: 'Thanks for calling. How can I help?', step: 0 },
      { who: 'Caller', text: "I had work done last month and I'm not happy with it.", step: 1 },
      { who: 'AI', text: "I'm sorry to hear that. That's something I'd rather put in front of a person than handle myself — can I take a few details?", step: 1 },
      { who: 'Caller', text: 'Yes.', step: 2 },
      { who: 'AI', text: "Roughly when was the work done, and what was it?", step: 2 },
      { who: 'Caller', text: 'Middle of last month. New radiator install.', step: 2 },
      { who: 'AI', text: "Thank you. I'm flagging this as a complaint about a recent install so it goes straight to the owner rather than the general inbox.", step: 3 },
      { who: 'AI', text: "You'll get a call back from a person — not from me — within one working day.", step: 3 }
    ],
    capture: [
      ['Caller', 'Existing customer'],
      ['Request', 'Unhappy with recent install'],
      ['Type', 'Complaint — not for AI handling'],
      ['Routed to', 'Owner, priority']
    ],
    handoff: 'It recognised what it should not handle and routed the call to a person.'
  }
];

export function initReceptionist() {
  const root = qs('[data-rec]');
  if (!root) return;

  const linesEl   = qs('[data-rec-lines]', root);
  const stepsEl   = qs('[data-rec-steps]', root);
  const captureEl = qs('[data-rec-capture]', root);
  const fieldsEl  = qs('[data-rec-fields]', root);
  const handoffEl = qs('[data-rec-handoff]', root);
  const timerEl   = qs('[data-rec-timer]', root);
  const liveEl    = qs('[data-rec-live]', root);
  const replayBtn = qs('[data-rec-replay]', root);

  const steps = qsa('.ol-rec__step', stepsEl);
  let tl = createTimeline();
  let current = 0;
  let seconds = 0;
  let clock = null;
  let hasPlayed = false;

  const setStep = (n) => {
    steps.forEach((step, i) => {
      step.classList.toggle('is-live', i === n);
      step.classList.toggle('is-done', i < n);
    });
  };

  const addLine = ({ who, text }) => {
    const li = document.createElement('li');
    li.className = `ol-rec__line ol-rec__line--${who === 'AI' ? 'ai' : 'caller'}`;
    const label = document.createElement('span');
    label.className = 'ol-rec__who';
    label.textContent = who === 'AI' ? 'Receptionist' : 'Caller';
    const bubble = document.createElement('p');
    bubble.className = 'ol-rec__bubble';
    bubble.textContent = text;
    li.append(label, bubble);
    linesEl.append(li);
    // keep the newest line in view inside the fixed-height panel
    linesEl.scrollTop = linesEl.scrollHeight;
  };

  const startClock = () => {
    stopClock();
    seconds = 0;
    clock = setInterval(() => {
      seconds += 1;
      if (timerEl) {
        timerEl.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
      }
    }, 1000);
  };

  const stopClock = () => { clearInterval(clock); clock = null; };

  const reset = () => {
    tl.cancel();
    tl = createTimeline();
    stopClock();
    linesEl.innerHTML = '';
    fieldsEl.innerHTML = '';
    handoffEl.textContent = '';
    captureEl.hidden = true;
    if (timerEl) timerEl.textContent = '00:00';
    setStep(-1);
    liveEl?.classList.remove('is-idle');
  };

  const renderCapture = (scenario) => {
    fieldsEl.innerHTML = '';
    scenario.capture.forEach(([label, value]) => {
      const wrap = document.createElement('div');
      wrap.className = 'ol-rec__field';
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      wrap.append(dt, dd);
      fieldsEl.append(wrap);
    });
    handoffEl.textContent = scenario.handoff;
    captureEl.hidden = false;
  };

  /** Render the whole call at once — used for reduced motion and as a fallback. */
  const renderStatic = (scenario) => {
    reset();
    scenario.lines.forEach(addLine);
    setStep(3);
    renderCapture(scenario);
    liveEl?.classList.add('is-idle');
  };

  const play = async (scenario) => {
    reset();
    if (reducedMotion()) { renderStatic(scenario); return; }

    hasPlayed = true;
    startClock();

    try {
      await tl.wait(320);
      for (const line of scenario.lines) {
        setStep(line.step);
        addLine(line);
        // pause roughly in proportion to how long the line takes to say
        await tl.wait(Math.min(2600, 700 + line.text.length * 26));
      }
      setStep(3);
      await tl.wait(260);
      renderCapture(scenario);
      stopClock();
      liveEl?.classList.add('is-idle');
    } catch {
      /* cancelled — a new scenario or a scroll-away took over */
    }
  };

  const { select } = bindTablist(root, {
    tabSelector: '[data-rec-tab]',
    onSelect(tab) {
      current = Number(tab.dataset.recTab);
      if (hasPlayed || reducedMotion()) play(SCENARIOS[current]);
    }
  });

  replayBtn?.addEventListener('click', () => play(SCENARIOS[current]));

  /**
   * Idle state: the greeting only, matching the server-rendered markup, so the
   * panel is never an empty box while the visitor scrolls toward it.
   */
  const primeIdle = () => {
    reset();
    addLine(SCENARIOS[current].lines[0]);
    setStep(0);
  };

  observeVisibility(root, {
    threshold: 0.3,
    enter: () => { if (!hasPlayed) play(SCENARIOS[current]); },
    exit: () => { if (!reducedMotion() && !hasPlayed) { tl.cancel(); stopClock(); primeIdle(); } }
  });

  select(0);
  if (reducedMotion()) {
    renderStatic(SCENARIOS[0]);
  } else {
    primeIdle();
  }
}
