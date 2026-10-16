// ==UserScript==
// @name         OpTime – Google Naptár gomb
// @namespace    https://secure.myoptime.eu/
// @version      1.3.0
// @description  Google Naptár eseményt készít az OpTime jelentkezéseidből.
// @match        https://secure.myoptime.eu/fit/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const BUTTON_CLASS = 'optime-google-calendar-button';
  const EVENT_LOCATION = 'B Bros 3-as terem, Budapest, Szegedi út 48, 1135';
  const DATE_RE = /(20\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})/;
  const TIME_RE = /(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/;

  function visibleText(element) {
    return (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function elementDepth(element) {
    let depth = 0;
    while (element && element.parentElement) {
      depth += 1;
      element = element.parentElement;
    }
    return depth;
  }

  function findCards() {
    const candidates = [...document.querySelectorAll('div, section, article, li')]
      .filter((element) => {
        const text = visibleText(element);
        return DATE_RE.test(text) && TIME_RE.test(text);
      })
      .sort((a, b) => elementDepth(b) - elementDepth(a));

    const cards = [];
    for (const candidate of candidates) {
      const text = visibleText(candidate);
      const date = text.match(DATE_RE);
      const time = text.match(TIME_RE);
      if (!date || !time) continue;

      // A parent that groups several bookings is not a single event card.
      const dates = text.match(new RegExp(DATE_RE.source, 'g')) || [];
      if (dates.length !== 1) continue;

      const childHasSameEvent = [...candidate.children].some((child) => {
        const childText = visibleText(child);
        return DATE_RE.test(childText) && TIME_RE.test(childText);
      });
      if (childHasSameEvent) continue;

      cards.push({ element: candidate, text, date, time });
    }
    return cards;
  }

  function eventFor(card) {
    const { text, date, time } = card;
    let title = text.slice(0, time.index).trim();
    if (!title) {
      const siblingTitle = [...(card.element.parentElement?.children || [])]
        .filter((sibling) => sibling !== card.element)
        .map(visibleText)
        .find((siblingText) => siblingText && !DATE_RE.test(siblingText) && !TIME_RE.test(siblingText));
      title = siblingTitle || 'Edzés';
    }
    const [, year, month, day] = date;
    const [, startHour, startMinute, endHour, endMinute] = time;
    const compactDate = `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;
    const start = `${compactDate}T${startHour.padStart(2, '0')}${startMinute}00`;
    const end = `${compactDate}T${endHour.padStart(2, '0')}${endMinute}00`;

    // Keep all visible booking details, including the coach when shown, in the description.
    const details = text.replace(/\s+/g, ' ').trim();
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${start}/${end}`,
      ctz: 'Europe/Budapest',
      location: EVENT_LOCATION,
      details,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  function findInlineTarget(card) {
    const candidates = [...card.element.querySelectorAll('span, div, p, td, li, small')]
      .filter((element) => {
        const text = visibleText(element);
        return text &&
          !DATE_RE.test(text) &&
          !TIME_RE.test(text) &&
          !/^(nagyterem|open gym)$/i.test(text) &&
          !element.querySelector(`.${BUTTON_CLASS}`) &&
          ![...element.children].some((child) => visibleText(child) === text);
      });

    // In the booking cards, the coach is shown after the date and room.
    return candidates[candidates.length - 1] || card.element;
  }

  function hasStarted(card) {
    const [, year, month, day] = card.date;
    const [, hour, minute] = card.time;
    const start = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    );
    return start.getTime() <= Date.now();
  }

  function isCancelled(card) {
    return /elmarad(?:t|ás)?/i.test(card.text);
  }

  function addButtons() {
    for (const card of findCards()) {
      if (hasStarted(card) || isCancelled(card)) {
        card.element.querySelectorAll(`.${BUTTON_CLASS}`).forEach((button) => button.remove());
        continue;
      }
      if (card.element.querySelector(`.${BUTTON_CLASS}`)) continue;

      const button = document.createElement('a');
      button.className = BUTTON_CLASS;
      button.href = eventFor(card);
      button.target = '_blank';
      button.rel = 'noopener noreferrer';
      button.textContent = '＋ Naptár';
      const target = findInlineTarget(card);
      button.style.cssText = [
        'display:inline-block',
        'margin:0 0 0 6px',
        'padding:2px 6px',
        'border-radius:4px',
        'background:#4285f4',
        'color:#fff',
        'font:12px/1.2 Arial,sans-serif',
        'text-decoration:none',
        'vertical-align:middle',
        'white-space:nowrap',
      ].join(';');
      target.appendChild(button);
    }
  }

  addButtons();
  new MutationObserver(addButtons).observe(document.body, { childList: true, subtree: true });
})();
