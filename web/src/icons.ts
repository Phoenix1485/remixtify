const paths = {
  minimize: '<path d="M5 12h14"/>',
  maximize: '<rect x="5" y="5" width="14" height="14" rx="3"/>',
  restore: '<path d="M9 5h8a2 2 0 0 1 2 2v8"/><rect x="5" y="9" width="10" height="10" rx="2"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  menu: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  back: '<path d="m14 5-7 7 7 7"/>',
  forward: '<path d="m10 5 7 7-7 7"/>',
  home: '<path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  settings: '<path d="m9 3-.6 3-2.8 1-2.6-1.5-2 3.5 2.3 2v2L1 15l2 3.5L5.6 17l2.8 1L9 21h4l.6-3 2.8-1 2.6 1.5 2-3.5-2.3-2v-2L21 9l-2-3.5L16.4 7l-2.8-1L13 3z"/><circle cx="11" cy="12" r="3"/>',
  bell: '<path d="M5 16h14l-2-3V9a5 5 0 0 0-10 0v4zM10 20h4"/>',
  friends: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 4v2"/>',
  browse: '<path d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM3 4h18M9 12h6"/>',
  play: '<path d="m8 5 11 7-11 7z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  previous: '<path d="M5 5v14m14-1L8 12l11-6z"/>',
  next: '<path d="M19 5v14M5 18l11-6L5 6z"/>',
  shuffle: '<path d="M3 6h2c5 0 9 12 14 12h2m-4-4 4 4-4 4M3 18h2c2 0 4-3 6-6m3-4 3-2h4m-4-4 4 4-4 4"/>',
  repeat: '<path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3"/>',
  history: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7m2-4v5l3 2"/>',
  queue: '<path d="M4 5h13M4 11h13M4 17h7m5-2 5 3-5 3z"/>',
  grip: '<circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/>',
  up: '<path d="m5 14 7-7 7 7"/>',
  down: '<path d="m5 10 7 7 7-7"/>',
  music: '<path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="17" cy="16" rx="3" ry="3"/>',
  volume: '<path d="M3 9h4l5-5v16l-5-5H3zM16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  muted: '<path d="M3 9h4l5-5v16l-5-5H3zM17 9l5 6m0-6-5 6"/>',
  lyrics: '<path d="m5 19 7-7m-1-7 1-1a4 4 0 0 1 6 6l-1 1zM3 21h6"/>',
  device: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M9 21h6m-3-4v4"/>',
  fullscreen: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
} as const;
export type IconName = keyof typeof paths;

export function icon(name: IconName): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = "srd-icon";
  span.dataset.icon = name;
  span.ariaHidden = "true";
  // Paths are static application assets, never track metadata or remote HTML.
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
  return span;
}

export function iconButton(name: IconName, label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "srd-icon-button";
  button.ariaLabel = button.title = label;
  button.append(icon(name));
  return button;
}
