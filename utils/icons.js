function svg(paths, size = 16) {
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

function starSvg(size = 16) {
  return `<svg class="icon star" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9L5.7 21l1.7-7-5.4-4.7 7.1-.6z"/></svg>`;
}

const icons = {
  tractor: svg('<circle cx="7" cy="18" r="3"/><circle cx="18" cy="18" r="2"/><path d="M4 4h4l1 7"/><path d="M9 11h5l3 3"/><path d="M13 6h3l2 5"/>', 20),
  phone: svg('<path d="M13.5 20.5C7 20.5 3.5 17 3.5 10.5c0-1 .4-3.5 2-4.5l2 4-1.5 2c1 2 2.5 3.5 4.5 4.5l2-1.5 4 2c-1 1.6-3.5 2.5-3 2.5z"/>'),
  mapPin: svg('<path d="M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  arrowUpRight: svg('<path d="M7 17 17 7"/><path d="M7 7h10v10"/>'),
  shieldCheck: svg('<path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z"/><path d="m9 12 2 2 4-4"/>', 25),
  badgeCheck: svg('<path d="M12 2l2.2 1.3 2.6-.3 1 2.4 2.4 1-.3 2.6L21 12l-1.3 2.2.3 2.6-2.4 1-1 2.4-2.6-.3L12 22l-2.2-1.3-2.6.3-1-2.4-2.4-1 .3-2.6L3 12l1.3-2.2-.3-2.6 2.4-1 1-2.4 2.6.3z"/><path d="m9 12 2 2 4-4"/>'),
  whatsapp: svg('<path d="M4 20l1.3-3.9A8 8 0 1 1 8.9 19L4 20Z"/><path d="M9 9.5c0 2.5 2.5 5 5 5 .8 0 1-.8 1-1.3 0-.3-.1-.5-.4-.7l-1.4-.9-.9.9c-1-.5-1.7-1.2-2.2-2.2l.9-.9-.9-1.4c-.2-.3-.4-.4-.7-.4-.5 0-1.3.2-1.3 1Z"/>'),
  gauge: svg('<circle cx="12" cy="13" r="8"/><path d="M12 13 15 9"/><path d="M9 5h6"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>'),
  wrench: svg('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2z"/>'),
  fuel: svg('<path d="M4 21V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v13"/><path d="M4 12h8"/><path d="M14 8l3 2v7a1.5 1.5 0 0 0 3 0v-4l-2-2"/>'),
  menu: svg('<path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/>', 22),
  close: svg('<path d="M18 6 6 18"/><path d="M6 6l12 12"/>', 22),
  calendar: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>'),
  star: starSvg(16),
  rupee: svg('<path d="M6 4h11"/><path d="M6 9h11"/><path d="M6 4c5 0 8 2 8 5s-3 5-8 5h-1l9 6"/>'),
};

module.exports = icons;
