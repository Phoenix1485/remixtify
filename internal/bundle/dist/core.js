"use strict";
(() => {
  // web/src/core.css
  var core_default = `:root {
  --srd-primary: #7c3aed;
  --srd-secondary: #14b8a6;
  --srd-accent: var(--srd-primary);
  --srd-accent-strong: color-mix(in srgb, var(--srd-primary) 72%, white);
  --srd-panel: #090a0d;
  --srd-panel-raised: #111217;
  --srd-canvas: #060709;
  --srd-border: rgba(255, 255, 255, 0.085);
  --srd-text: #f4f4f6;
  --srd-muted: #92939c;
}

.srd-topbar-host {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-inline-start: clamp(120px, 16vw, 260px);
  margin-inline-end: 8px;
  z-index: 2147483000;
  pointer-events: auto !important;
  -webkit-app-region: no-drag !important;
}

.srd-topbar-host--fallback {
  position: fixed;
  top: 10px;
  left: 16px;
  z-index: 10000;
}

.srd-settings-button,
.srd-update-button,
.srd-button {
  border: 1px solid var(--srd-border);
  background: var(--srd-panel-raised);
  color: var(--srd-text);
  border-radius: 11px;
  cursor: pointer;
  font: inherit;
  transition: background 120ms ease, transform 120ms ease, border-color 120ms ease;
  pointer-events: auto !important;
  -webkit-app-region: no-drag !important;
  touch-action: manipulation;
}

.srd-settings-button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  font-size: 17px;
}

.srd-update-button {
  height: 34px;
  padding: 0 13px;
  border-color: color-mix(in srgb, var(--srd-primary) 50%, transparent);
  background: color-mix(in srgb, var(--srd-primary) 18%, #0b0c0f);
  color: color-mix(in srgb, var(--srd-primary) 42%, white);
  font-size: 12px;
  font-weight: 750;
}

.srd-settings-button:hover,
.srd-update-button:hover,
.srd-button:hover {
  background: #303038;
  border-color: rgba(255, 255, 255, 0.2);
}

.srd-update-button:disabled {
  cursor: wait;
  opacity: 0.7;
  transform: none;
}

.srd-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20000;
  display: grid;
  place-items: center;
  padding: 32px;
  background: rgba(0, 0, 0, 0.62);
  backdrop-filter: blur(8px);
  pointer-events: auto !important;
  -webkit-app-region: no-drag !important;
}

.srd-backdrop button,
.srd-backdrop [role="switch"] {
  pointer-events: auto !important;
  -webkit-app-region: no-drag !important;
}

.srd-modal {
  width: min(920px, 94vw);
  max-height: min(720px, 88vh);
  overflow: hidden;
  border: 1px solid var(--srd-border);
  border-radius: 20px;
  background: var(--srd-panel);
  color: var(--srd-text);
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.55);
}

.srd-modal-header,
.srd-row,
.srd-package-card {
  display: flex;
  align-items: center;
}

.srd-modal-header {
  justify-content: space-between;
  padding: 20px 22px 12px;
}

.srd-modal-title {
  margin: 0;
  font-size: 22px;
}

.srd-close {
  border: 0;
  background: transparent;
  color: var(--srd-muted);
  cursor: pointer;
  font-size: 26px;
}

.srd-tabs {
  display: flex;
  gap: 8px;
  padding: 0 22px 14px;
  border-bottom: 1px solid var(--srd-border);
}

.srd-tab {
  min-width: 104px;
  padding: 9px 16px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--srd-muted);
  cursor: pointer;
  font-weight: 700;
}

.srd-tab[aria-selected="true"] {
  background: linear-gradient(135deg, var(--srd-primary), var(--srd-secondary));
  color: white;
  box-shadow: 0 8px 22px color-mix(in srgb, var(--srd-primary) 24%, transparent);
}

.srd-content {
  overflow: auto;
  max-height: 580px;
  padding: 22px;
}

.srd-theme-studio {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  align-items: center;
  gap: 28px;
  min-height: 178px;
  padding: 24px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--srd-primary) 24%, var(--srd-border));
  border-radius: 18px;
  background:
    radial-gradient(circle at 88% 20%, color-mix(in srgb, var(--srd-secondary) 18%, transparent), transparent 38%),
    linear-gradient(135deg, color-mix(in srgb, var(--srd-primary) 12%, #0b0c10), #08090c 60%);
}

.srd-theme-studio-copy h3 {
  margin: 6px 0 7px;
  font-size: 25px;
  letter-spacing: -0.035em;
}

.srd-theme-studio-copy p {
  max-width: 430px;
  margin: 0;
  color: var(--srd-muted);
  font-size: 13px;
  line-height: 1.5;
}

.srd-eyebrow {
  color: color-mix(in srgb, var(--srd-primary) 62%, white);
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.2em;
}

.srd-theme-live-preview {
  position: relative;
  height: 132px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 15px;
  background: #050608;
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.35);
}

.srd-theme-live-preview span {
  position: absolute;
  display: block;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: #101116;
}

.srd-preview-rail {
  inset: 8px auto 8px 8px;
  width: 32px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--srd-primary) 18%, #0b0c10) !important;
}

.srd-preview-header {
  top: 8px;
  right: 8px;
  left: 48px;
  height: 22px;
  border-radius: 8px;
}

.srd-preview-card {
  top: 38px;
  bottom: 34px;
  width: calc(50% - 32px);
  border-radius: 10px;
}

.srd-preview-card--one {
  left: 48px;
  background: linear-gradient(145deg, color-mix(in srgb, var(--srd-primary) 28%, #111218), #0b0c10) !important;
}

.srd-preview-card--two {
  right: 8px;
  background: linear-gradient(145deg, color-mix(in srgb, var(--srd-secondary) 24%, #111218), #0b0c10) !important;
}

.srd-preview-player {
  right: 8px;
  bottom: 8px;
  left: 48px;
  height: 18px;
  border-radius: 7px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--srd-primary) 20%, #111218), #101116) !important;
}

.srd-theme-customizer {
  padding: 20px 0;
  border-bottom: 1px solid var(--srd-border);
}

.srd-theme-customizer-grid {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) minmax(310px, 1.15fr);
  gap: 12px;
}

.srd-theme-customizer .srd-color-controls {
  width: auto;
  flex-basis: auto;
}

.srd-effect-control {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  padding: 13px;
  border: 1px solid var(--srd-border);
  border-radius: 12px;
  background: #101116;
}

.srd-control-label {
  color: var(--srd-text);
  font-size: 12px;
  font-weight: 750;
}

.srd-row {
  justify-content: space-between;
  gap: 24px;
  padding: 16px 0;
  border-bottom: 1px solid var(--srd-border);
}

.srd-row h3,
.srd-package-card h3 {
  margin: 0 0 4px;
  font-size: 15px;
}

.srd-row p,
.srd-package-card p,
.srd-meta {
  margin: 0;
  color: var(--srd-muted);
  font-size: 13px;
  line-height: 1.45;
}

.srd-toggle {
  position: relative;
  flex: 0 0 auto;
  width: 44px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: #4a4a54;
  cursor: pointer;
}

.srd-toggle::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  transition: transform 150ms ease;
}

.srd-toggle[aria-checked="true"] {
  background: var(--srd-accent);
}

.srd-toggle[aria-checked="true"]::after {
  transform: translateX(20px);
}

.srd-package-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.srd-package-card {
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border: 1px solid var(--srd-border);
  border-radius: 14px;
  background: var(--srd-panel-raised);
}

.srd-package-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--srd-primary) 18%, transparent);
  font-size: 22px;
}

.srd-package-copy {
  flex: 1;
  min-width: 0;
}

.srd-button {
  margin-top: 12px;
  padding: 7px 13px;
  font-size: 12px;
  font-weight: 700;
}

.srd-button--primary {
  border-color: var(--srd-accent);
  background: var(--srd-accent);
}

.srd-button--danger {
  border-color: #ef4444;
  background: #b91c1c;
  color: white;
}

.srd-button--danger:hover {
  border-color: #f87171;
  background: #dc2626;
}

.srd-empty {
  padding: 36px 12px;
  color: var(--srd-muted);
  text-align: center;
}

.srd-confirm-copy {
  padding: 8px 22px 4px;
  color: var(--srd-muted);
  font-size: 14px;
  line-height: 1.55;
}

.srd-confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 18px 22px 22px;
}

.srd-row--colors {
  align-items: flex-start;
}

.srd-color-copy {
  max-width: 360px;
}

.srd-color-controls {
  display: grid;
  flex: 0 0 224px;
  gap: 8px;
}

.srd-color-control {
  display: grid;
  grid-template-columns: 30px 1fr auto;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 5px 10px 5px 6px;
  border: 1px solid var(--srd-border);
  border-radius: 11px;
  background: #101116;
  cursor: pointer;
  -webkit-app-region: no-drag !important;
}

.srd-color-picker {
  width: 30px;
  height: 30px;
  padding: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  -webkit-app-region: no-drag !important;
}

.srd-color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.srd-color-picker::-webkit-color-swatch {
  border: 0;
}

.srd-color-name {
  color: var(--srd-text);
  font-size: 12px;
  font-weight: 700;
}

.srd-color-value {
  color: var(--srd-muted);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 10px;
}

.srd-color-reset {
  justify-self: end;
  padding: 5px 9px;
  border: 0;
  background: transparent;
  color: var(--srd-muted);
  cursor: pointer;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  -webkit-app-region: no-drag !important;
}

.srd-color-reset:hover {
  color: var(--srd-text);
}

.srd-segmented {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 3px;
  padding: 3px;
  border: 1px solid var(--srd-border);
  border-radius: 11px;
  background: #0d0e12;
  -webkit-app-region: no-drag !important;
}

.srd-segmented-option {
  min-height: 30px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--srd-muted);
  cursor: pointer;
  font: inherit;
  font-size: 11px;
  font-weight: 750;
  -webkit-app-region: no-drag !important;
}

.srd-segmented-option:hover {
  color: var(--srd-text);
}

.srd-segmented-option[aria-pressed="true"] {
  background: color-mix(in srgb, var(--srd-primary) 24%, #17181d);
  color: #fff;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--srd-primary) 34%, transparent);
}

.srd-theme-section,
.srd-custom-css {
  padding: 20px 0;
  border-bottom: 1px solid var(--srd-border);
}

.srd-theme-heading,
.srd-custom-css-heading {
  margin-bottom: 14px;
}

.srd-theme-heading h3,
.srd-custom-css-heading h3 {
  margin: 0 0 4px;
  font-size: 14px;
}

.srd-theme-heading p,
.srd-custom-css-heading p {
  margin: 0;
  color: var(--srd-muted);
  font-size: 12px;
  line-height: 1.45;
}

.srd-theme-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.srd-theme-choice {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  align-items: center;
  gap: 11px;
  min-width: 0;
  padding: 8px;
  border: 1px solid var(--srd-border);
  border-radius: 13px;
  background: #101115;
  color: var(--srd-text);
  cursor: pointer;
  text-align: left;
}

.srd-theme-choice:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: #15161b;
}

.srd-theme-choice[aria-pressed="true"] {
  border-color: color-mix(in srgb, var(--srd-primary) 62%, white 8%);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--srd-primary) 28%, transparent);
}

.srd-theme-preview {
  display: block;
  width: 64px;
  height: 42px;
  border-radius: 9px;
  background:
    radial-gradient(circle at 22% 20%, var(--srd-theme-primary), transparent 47%),
    radial-gradient(circle at 82% 78%, var(--srd-theme-secondary), transparent 44%),
    #07080a;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.srd-theme-choice-copy {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.srd-theme-choice-copy strong {
  font-size: 13px;
}

.srd-theme-choice-copy small {
  overflow: hidden;
  color: var(--srd-muted);
  font-size: 11px;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.srd-css-editor {
  box-sizing: border-box;
  width: 100%;
  min-height: 170px;
  resize: vertical;
  padding: 13px 14px;
  border: 1px solid var(--srd-border);
  border-radius: 12px;
  outline: 0;
  background: #050608;
  color: #d9dae2;
  font: 12px/1.55 Consolas, "Cascadia Code", monospace;
  tab-size: 2;
}

.srd-css-editor:focus {
  border-color: color-mix(in srgb, var(--srd-primary) 64%, white 8%);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--srd-primary) 15%, transparent);
}

.srd-css-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

@media (max-width: 620px) {
  .srd-row--colors {
    align-items: stretch;
    flex-direction: column;
  }

  .srd-color-controls {
    flex-basis: auto;
    width: 100%;
  }

  .srd-theme-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 840px) {
  .srd-theme-studio {
    grid-template-columns: 1fr;
  }

  .srd-theme-live-preview {
    display: none;
  }

  .srd-theme-grid,
  .srd-theme-customizer-grid {
    grid-template-columns: 1fr;
  }
}

/* Ultra Dark: restrained near-black surfaces with user-controlled accents. */
html.srd-theme-active {
  --background-base: #050506 !important;
  --background-base-min: #050506 !important;
  --background-elevated-base: #111216 !important;
  --background-elevated-highlight: #18191e !important;
  --background-tinted-base: rgba(255, 255, 255, 0.045) !important;
  --background-tinted-highlight: rgba(255, 255, 255, 0.075) !important;
  --text-base: #f4f4f6 !important;
  --text-subdued: #92939c !important;
  --essential-base: #f4f4f6 !important;
  --essential-subdued: #92939c !important;
  --decorative-subdued: rgba(255, 255, 255, 0.08) !important;
}

html.srd-theme-active body {
  background: #030304 !important;
}

html.srd-theme-active body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  background: transparent;
  transition: opacity 180ms ease;
  will-change: auto;
}

html.srd-theme-active body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease;
}

html.srd-theme-active[data-srd-effect="ambient"] body {
  background:
    radial-gradient(circle at 16% -12%, color-mix(in srgb, var(--srd-primary) 10%, transparent), transparent 36%),
    radial-gradient(circle at 88% 108%, color-mix(in srgb, var(--srd-secondary) 7%, transparent), transparent 34%),
    #030304 !important;
}

html.srd-theme-active[data-srd-effect="ambient"] body::before {
  opacity: 1;
  background:
    radial-gradient(circle at 24% 24%, color-mix(in srgb, var(--srd-primary) 7%, transparent), transparent 34%),
    radial-gradient(circle at 78% 74%, color-mix(in srgb, var(--srd-secondary) 5%, transparent), transparent 30%);
}

html.srd-theme-active[data-srd-effect="grid"] body::before {
  opacity: 0.52;
  background-image:
    linear-gradient(color-mix(in srgb, var(--srd-primary) 7%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--srd-secondary) 6%, transparent) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: linear-gradient(to bottom, black, transparent 78%);
}

html.srd-theme-active[data-srd-effect="grid"] body::after {
  opacity: 1;
  background: radial-gradient(circle at 52% -5%, color-mix(in srgb, var(--srd-primary) 8%, transparent), transparent 38%);
}

html.srd-theme-active .Root,
html.srd-theme-active .Root__top-container,
html.srd-theme-active #main {
  background: transparent !important;
}

html.srd-theme-active .Root__nav-bar,
html.srd-theme-active .Root__main-view,
html.srd-theme-active .Root__right-sidebar,
html.srd-theme-active .main-yourLibraryX-library,
html.srd-theme-active .main-nowPlayingView-nowPlayingWidget {
  border: 1px solid rgba(255, 255, 255, 0.065) !important;
  border-radius: 16px !important;
  background: rgba(7, 7, 9, 0.94) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025), 0 14px 40px rgba(0, 0, 0, 0.24) !important;
  backdrop-filter: blur(20px) !important;
}

html.srd-theme-active .main-globalNav-globalNav,
html.srd-theme-active .main-topBar-container,
html.srd-theme-active .main-topBar-topbarContent,
html.srd-theme-active [data-testid="topbar-content"] {
  background: rgba(4, 4, 5, 0.82) !important;
  backdrop-filter: blur(20px) !important;
}

html.srd-theme-active .main-globalNav-searchContainer,
html.srd-theme-active [data-testid="search-input"] {
  border-color: rgba(255, 255, 255, 0.08) !important;
  background: #101115 !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035) !important;
}

html.srd-theme-active .main-card-card,
html.srd-theme-active [data-testid="card-container"] {
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 15px !important;
  background: #0d0e11 !important;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25) !important;
  transition: transform 220ms cubic-bezier(0.2, 0.75, 0.25, 1), border-color 180ms ease, background 180ms ease, box-shadow 220ms ease !important;
}

html.srd-theme-active .main-card-card:hover,
html.srd-theme-active [data-testid="card-container"]:hover {
  border-color: color-mix(in srgb, var(--srd-primary) 42%, rgba(255, 255, 255, 0.06)) !important;
  background: color-mix(in srgb, var(--srd-primary) 8%, #111217) !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.38) !important;
}

html.srd-theme-active .main-card-imageContainer,
html.srd-theme-active .main-card-imageContainer img,
html.srd-theme-active [data-testid="card-image"] {
  border-radius: 14px !important;
}

html.srd-theme-active [data-testid="shortcut"] {
  overflow: hidden !important;
  border: 1px solid rgba(255, 255, 255, 0.065) !important;
  border-radius: 14px !important;
  background: #101115 !important;
  transition: background 160ms ease, border-color 160ms ease !important;
}

html.srd-theme-active [data-testid="shortcut"]:hover {
  border-color: color-mix(in srgb, var(--srd-secondary) 34%, rgba(255, 255, 255, 0.06)) !important;
  background: #16171b !important;
}

/* Home composition: more breathing room without replacing Spotify's modules. */
html.srd-theme-active [data-testid="home-page"] section[aria-label]:not([data-testid="component-shelf"]) {
  margin-bottom: 38px !important;
}

html.srd-theme-active [data-testid="home-page"] section[aria-label]:not([data-testid="component-shelf"]) > :first-child {
  gap: 12px !important;
}

html.srd-theme-active [data-testid="home-page"] section[aria-label]:not([data-testid="component-shelf"]) > :first-child > * {
  min-height: 56px !important;
  overflow: hidden !important;
  border: 1px solid rgba(255, 255, 255, 0.065) !important;
  border-radius: 14px !important;
  background: color-mix(in srgb, var(--srd-primary) 6%, #0d0e11) !important;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.2) !important;
  transition: transform 220ms cubic-bezier(0.2, 0.75, 0.25, 1), border-color 180ms ease, background 180ms ease, box-shadow 220ms ease !important;
}

html.srd-theme-active [data-testid="home-page"] section[aria-label]:not([data-testid="component-shelf"]) > :first-child > *:hover,
html.srd-theme-active [data-testid="home-page"] section[aria-label]:not([data-testid="component-shelf"]) > :first-child > *:focus-within {
  z-index: 2;
  border-color: color-mix(in srgb, var(--srd-primary) 40%, rgba(255, 255, 255, 0.08)) !important;
  background: color-mix(in srgb, var(--srd-primary) 12%, #111217) !important;
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.34), 0 0 24px color-mix(in srgb, var(--srd-primary) 9%, transparent) !important;
}

html.srd-theme-active [data-testid="home-page"] section[aria-label]:not([data-testid="component-shelf"]) [data-testid="shortcut-image"] {
  transition: transform 260ms cubic-bezier(0.2, 0.75, 0.25, 1), filter 220ms ease !important;
}

html.srd-theme-active [data-testid="home-page"] section[aria-label]:not([data-testid="component-shelf"]) > :first-child > *:hover [data-testid="shortcut-image"] {
  filter: saturate(1.08) contrast(1.03);
}

html.srd-theme-active [data-testid="home-page"] section[aria-label]:not([data-testid="component-shelf"]) [data-testid="play-button"] {
  display: none !important;
}

html.srd-theme-active [data-testid="home-page"] [data-testid="component-shelf"] {
  margin-bottom: 32px !important;
}

html.srd-theme-active [data-testid="home-page"] [data-testid="component-shelf"] [data-testid="rich-title-row-shelf-header"] {
  margin-bottom: 14px !important;
}

html.srd-theme-active [data-testid="home-page"] [data-testid="component-shelf"] [data-testid="grid-container"] {
  column-gap: 16px !important;
  padding-inline: 40px !important;
}

html.srd-theme-active [data-testid="carousel-scroller"] .e-10451-card {
  border-radius: 18px !important;
  transform-origin: center bottom;
  transition: transform 240ms cubic-bezier(0.2, 0.75, 0.25, 1), border-color 180ms ease, background 180ms ease, box-shadow 240ms ease !important;
}

html.srd-theme-active [data-testid="carousel-scroller"] .e-10451-card:hover,
html.srd-theme-active [data-testid="carousel-scroller"] .e-10451-card:focus-within {
  z-index: 3;
  border-color: color-mix(in srgb, var(--srd-primary) 42%, rgba(255, 255, 255, 0.08)) !important;
  background: color-mix(in srgb, var(--srd-primary) 9%, #111217) !important;
  box-shadow: 0 22px 44px rgba(0, 0, 0, 0.4), 0 0 28px color-mix(in srgb, var(--srd-primary) 7%, transparent) !important;
}

html.srd-theme-active [data-testid="carousel-scroller"] .e-10451-card [data-testid="card-image"] {
  transition: transform 300ms cubic-bezier(0.2, 0.75, 0.25, 1), filter 220ms ease !important;
}

html.srd-theme-active [data-testid="carousel-scroller"] .e-10451-card:hover [data-testid="card-image"] {
  filter: saturate(1.06) contrast(1.025);
}

html.srd-theme-active [data-testid="carousel-scroller"] .e-10451-card [data-testid="play-button"],
html.srd-theme-active .contentSpacing [data-testid="play-button"] {
  transition: transform 180ms cubic-bezier(0.2, 0.75, 0.25, 1), filter 180ms ease !important;
}

html.srd-theme-active [data-testid="carousel-scroller"] .e-10451-card [data-testid="play-button"]:hover,
html.srd-theme-active .contentSpacing [data-testid="play-button"]:hover {
  filter: brightness(1.08) drop-shadow(0 7px 14px color-mix(in srgb, var(--srd-primary) 30%, transparent));
}

html.srd-theme-active .contentSpacing button:not([data-testid="play-button"]) {
  margin-inline: 3px !important;
  transition: color 160ms ease, background 160ms ease, border-color 160ms ease, transform 180ms cubic-bezier(0.2, 0.75, 0.25, 1) !important;
}

html.srd-theme-active .contentSpacing button:not([data-testid="play-button"]):hover {
  background: color-mix(in srgb, var(--srd-primary) 10%, #111217) !important;
}

html.srd-theme-active .main-trackList-trackListRow {
  border: 1px solid transparent !important;
  border-radius: 12px !important;
  transition: background 140ms ease, border-color 140ms ease !important;
}

html.srd-theme-active .main-trackList-trackListRow:hover,
html.srd-theme-active .main-trackList-trackListRow[aria-selected="true"] {
  border-color: rgba(255, 255, 255, 0.055) !important;
  background: rgba(255, 255, 255, 0.045) !important;
}

html.srd-theme-active .Root__now-playing-bar,
html.srd-theme-active .main-nowPlayingBar-nowPlayingBar {
  border-top: 1px solid rgba(255, 255, 255, 0.07) !important;
  background: rgba(5, 5, 6, 0.98) !important;
  box-shadow: 0 -12px 36px rgba(0, 0, 0, 0.32) !important;
  backdrop-filter: blur(22px) !important;
}

html.srd-theme-active .progress-bar__fg,
html.srd-theme-active [class*="progressBar"] [class*="foreground"] {
  background: linear-gradient(90deg, var(--srd-primary), var(--srd-secondary)) !important;
}

html.srd-theme-active h1,
html.srd-theme-active h2 {
  letter-spacing: -0.035em !important;
}

html.srd-theme-active [role="dialog"],
html.srd-theme-active [role="menu"],
html.srd-theme-active .main-contextMenu-menu {
  border: 1px solid rgba(255, 255, 255, 0.075) !important;
  border-radius: 14px !important;
  background: rgba(10, 10, 12, 0.97) !important;
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.52) !important;
  backdrop-filter: blur(22px) !important;
}

html.srd-theme-active .srd-settings-button {
  border-color: color-mix(in srgb, var(--srd-primary) 48%, rgba(255, 255, 255, 0.08)) !important;
  background: color-mix(in srgb, var(--srd-primary) 24%, #0b0b0e) !important;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.025), 0 8px 24px rgba(0, 0, 0, 0.3) !important;
}

html.srd-theme-active .srd-modal {
  border-color: color-mix(in srgb, var(--srd-primary) 24%, rgba(255, 255, 255, 0.07)) !important;
  background: #090a0d !important;
  box-shadow: 0 34px 100px rgba(0, 0, 0, 0.7) !important;
}

/* Studio changes the application composition without replacing Spotify's controls. */
@media (min-width: 1200px) {
  html.srd-theme-active[data-srd-layout="studio"] .Root__top-container:has(.Root__right-sidebar) {
    grid-template-columns: minmax(82px, 6.5vw) minmax(0, 1fr) minmax(286px, 21vw) !important;
    gap: 8px !important;
    padding-inline: 8px !important;
  }
}

html.srd-theme-active[data-srd-layout="studio"] .Root__nav-bar,
html.srd-theme-active[data-srd-layout="studio"] .Root__main-view,
html.srd-theme-active[data-srd-layout="studio"] .Root__right-sidebar {
  min-width: 0 !important;
}

html.srd-theme-active[data-srd-layout="studio"] .Root__now-playing-bar {
  box-sizing: border-box !important;
  width: auto !important;
  margin: 0 8px 8px !important;
  overflow: hidden !important;
  border: 1px solid rgba(255, 255, 255, 0.075) !important;
  border-radius: 16px !important;
}

html.srd-theme-active[data-srd-layout="studio"] .main-nowPlayingBar-nowPlayingBar {
  min-height: 80px !important;
  padding-inline: 18px !important;
}

html.srd-theme-active[data-srd-layout="studio"] .main-gridContainer-gridContainer {
  gap: 18px !important;
}

html.srd-theme-active[data-srd-layout="studio"] .main-view-container__scroll-node-child {
  padding-bottom: 22px !important;
}

html.srd-theme-active[data-srd-density="compact"] .contentSpacing {
  padding-inline: 18px !important;
}

html.srd-theme-active[data-srd-density="compact"] .main-gridContainer-gridContainer {
  gap: 10px !important;
}

html.srd-theme-active[data-srd-density="compact"] .main-card-card,
html.srd-theme-active[data-srd-density="compact"] [data-testid="card-container"] {
  padding: 10px !important;
}

html.srd-theme-active[data-srd-density="compact"] .main-trackList-trackListRow {
  min-height: 48px !important;
}

/* Current Spotify structure: relabelled by core.ts from stable IDs, test IDs and grid areas. */
html.srd-theme-active[data-srd-layout="studio"] .srd-app-grid {
  box-sizing: border-box !important;
  width: 100vw !important;
  height: 100vh !important;
  padding: 10px !important;
  gap: 10px !important;
  grid-template-areas:
    "left-sidebar global-nav right-sidebar"
    "left-sidebar main-view right-sidebar"
    "left-sidebar now-playing-bar right-sidebar" !important;
  grid-template-columns: var(--srd-library-width, 260px) minmax(520px, 1fr) 420px !important;
  grid-template-rows: 62px minmax(0, 1fr) 92px !important;
  background: transparent !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-global-nav {
  grid-area: global-nav !important;
  box-sizing: border-box !important;
  min-width: 0 !important;
  width: auto !important;
  height: auto !important;
  margin: 0 !important;
  border: 1px solid rgba(255, 255, 255, 0.07) !important;
  border-radius: 18px !important;
  background: var(--srd-panel) !important;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.3) !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-global-nav > .srd-topbar-host {
  position: absolute !important;
  top: 13px !important;
  left: 142px !important;
  margin: 0 !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-left-sidebar {
  grid-area: left-sidebar !important;
  box-sizing: border-box !important;
  width: auto !important;
  height: auto !important;
  min-width: 0 !important;
  margin: 0 !important;
  overflow: hidden !important;
  border: 1px solid rgba(255, 255, 255, 0.07) !important;
  border-radius: 22px !important;
  background:
    linear-gradient(155deg, color-mix(in srgb, var(--srd-primary) 10%, transparent), transparent 26%),
    var(--srd-panel) !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.34) !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-left-sidebar::before {
  content: "SPECTRA";
  position: absolute;
  top: 22px;
  left: 22px;
  z-index: 5;
  color: #fff;
  font-size: 13px;
  font-weight: 850;
  letter-spacing: 0.22em;
  text-shadow: 0 0 22px color-mix(in srgb, var(--srd-primary) 55%, transparent);
  pointer-events: none;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-left-sidebar::after {
  content: "";
  position: absolute;
  top: 49px;
  left: 22px;
  z-index: 5;
  width: 38px;
  height: 2px;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--srd-primary), var(--srd-secondary));
  box-shadow: 0 0 14px color-mix(in srgb, var(--srd-primary) 55%, transparent);
  pointer-events: none;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-app-grid.srd-library-collapsed .srd-left-sidebar::before {
  content: "S";
  left: 50%;
  transform: translateX(-50%);
}

html.srd-theme-active[data-srd-layout="studio"] .srd-app-grid.srd-library-collapsed .srd-left-sidebar::after {
  left: 50%;
  width: 30px;
  transform: translateX(-50%);
}

html.srd-theme-active[data-srd-layout="studio"] .srd-left-sidebar > nav {
  box-sizing: border-box !important;
  width: 100% !important;
  height: 100% !important;
  padding-top: 62px !important;
  background: transparent !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-left-sidebar .YourLibraryX {
  width: 100% !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-main-view {
  grid-area: main-view !important;
  width: auto !important;
  height: auto !important;
  min-width: 0 !important;
  overflow: hidden !important;
  border: 1px solid rgba(255, 255, 255, 0.07) !important;
  border-radius: 22px !important;
  background: var(--srd-canvas) !important;
  box-shadow: 0 22px 55px rgba(0, 0, 0, 0.32) !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-main-view .main-view-container,
html.srd-theme-active[data-srd-layout="studio"] .srd-main-view .main-view-container__scroll-node,
html.srd-theme-active[data-srd-layout="studio"] .srd-main-view .main-view-container__scroll-node > div:not(.os-scrollbar) {
  width: 100% !important;
  height: 100% !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player-zone {
  grid-area: now-playing-bar !important;
  box-sizing: border-box !important;
  width: auto !important;
  height: auto !important;
  min-width: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: visible !important;
  background: transparent !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player {
  box-sizing: border-box !important;
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  margin: 0 !important;
  padding-inline: 16px !important;
  overflow: hidden !important;
  border: 1px solid color-mix(in srgb, var(--srd-primary) 25%, rgba(255, 255, 255, 0.07)) !important;
  border-radius: 22px !important;
  background:
    linear-gradient(100deg, color-mix(in srgb, var(--srd-primary) 9%, transparent), transparent 30%, color-mix(in srgb, var(--srd-secondary) 5%, transparent)),
    var(--srd-panel) !important;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.44), inset 0 1px rgba(255, 255, 255, 0.035) !important;
}

html.srd-theme-active .srd-player [data-testid="progress-bar-background"] > * {
  background: linear-gradient(90deg, var(--srd-primary), var(--srd-secondary)) !important;
}

html.srd-theme-active [data-testid="home-ad-card"] {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  background-color: #08090b !important;
}

html.srd-theme-active [data-testid="carousel-scroller"] .e-10451-card {
  overflow: hidden !important;
  border-radius: 18px !important;
  background: #0d0e12 !important;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.055), 0 12px 28px rgba(0, 0, 0, 0.2) !important;
  transition: transform 240ms cubic-bezier(0.2, 0.75, 0.25, 1), box-shadow 220ms ease, background 180ms ease, border-color 180ms ease !important;
}

html.srd-theme-active [data-testid="carousel-scroller"] .e-10451-card:hover {
  background: color-mix(in srgb, var(--srd-primary) 8%, #111218) !important;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--srd-primary) 42%, transparent), 0 16px 34px rgba(0, 0, 0, 0.3) !important;
}

html.srd-theme-active [data-testid="card-image"],
html.srd-theme-active [data-testid="cover-art-image"] {
  border-radius: 14px !important;
}

html.srd-theme-active .contentSpacing button {
  border: 1px solid rgba(255, 255, 255, 0.07) !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.22) !important;
}

/* Page action bar: replace Spotify's circle controls with a stable, even button rail. */
html.srd-theme-active [data-testid="action-bar"] {
  padding-block: 18px !important;
}

html.srd-theme-active [data-testid="action-bar-row"] {
  align-items: center !important;
  gap: 8px !important;
}

html.srd-theme-active [data-testid="action-bar-row"] button:not([role="combobox"]):not([data-testid="play-button"]) {
  box-sizing: border-box !important;
  display: grid !important;
  place-items: center !important;
  flex: 0 0 44px !important;
  width: 44px !important;
  min-width: 44px !important;
  height: 44px !important;
  min-height: 44px !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  border: 1px solid rgba(255, 255, 255, 0.09) !important;
  border-radius: 12px !important;
  color: var(--srd-text) !important;
  background: color-mix(in srgb, var(--srd-primary) 7%, #101116) !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.035), 0 8px 18px rgba(0, 0, 0, 0.22) !important;
  transform: none !important;
  transition: color 150ms ease, border-color 150ms ease, background 150ms ease, box-shadow 150ms ease !important;
}

html.srd-theme-active [data-testid="action-bar-row"] button:not([role="combobox"]):not([data-testid="play-button"]):hover,
html.srd-theme-active [data-testid="action-bar-row"] button:not([role="combobox"]):not([data-testid="play-button"]):focus-visible {
  border-color: color-mix(in srgb, var(--srd-primary) 48%, rgba(255, 255, 255, 0.1)) !important;
  background: color-mix(in srgb, var(--srd-primary) 15%, #131419) !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.05), 0 10px 24px rgba(0, 0, 0, 0.3) !important;
  transform: none !important;
}

html.srd-theme-active [data-testid="action-bar-row"] [data-testid="play-button"] {
  box-sizing: border-box !important;
  display: grid !important;
  place-items: center !important;
  flex-basis: 58px !important;
  width: 58px !important;
  min-width: 58px !important;
  height: 44px !important;
  min-height: 44px !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  border: 0 !important;
  border-radius: 14px !important;
  color: #050507 !important;
  background: linear-gradient(135deg, var(--srd-primary), var(--srd-secondary)) !important;
  box-shadow: 0 10px 26px color-mix(in srgb, var(--srd-primary) 24%, rgba(0, 0, 0, 0.35)) !important;
  transform: none !important;
  transition: filter 150ms ease, box-shadow 150ms ease !important;
}

html.srd-theme-active [data-testid="action-bar-row"] button > span {
  display: grid !important;
  width: 100% !important;
  height: 100% !important;
  place-items: center !important;
  border-radius: inherit !important;
  background: transparent !important;
  transform: none !important;
}

html.srd-theme-active [data-testid="action-bar-row"] button svg {
  color: inherit !important;
  fill: currentColor !important;
  transform: none !important;
}

html.srd-theme-active [data-testid="action-bar-row"] [data-testid="add-button"] svg,
html.srd-theme-active [data-testid="action-bar-row"] button[aria-label^="Download" i] svg {
  display: none !important;
}

html.srd-theme-active [data-testid="action-bar-row"] [data-testid="add-button"]::before {
  content: "+";
  font-size: 25px;
  font-weight: 420;
  line-height: 1;
}

html.srd-theme-active [data-testid="action-bar-row"] button[aria-label^="Download" i]::before {
  content: "\\2193";
  font-size: 23px;
  font-weight: 520;
  line-height: 1;
}

html.srd-theme-active [data-testid="action-bar-row"] button[role="combobox"] {
  height: 40px !important;
  padding-inline: 13px !important;
  border: 1px solid rgba(255, 255, 255, 0.09) !important;
  border-radius: 11px !important;
  background: #101116 !important;
  box-shadow: none !important;
  transform: none !important;
}

/* Workbench composition: detail pages become a split music workspace. */
html.srd-theme-active[data-srd-layout="studio"] :is(
  [data-testid="album-page"],
  [data-testid="playlist-page"]
) {
  isolation: isolate;
}

html.srd-theme-active[data-srd-layout="studio"] :is(
  [data-testid="album-page"],
  [data-testid="playlist-page"]
) > div:has([data-testid="action-bar"]) {
  z-index: 3 !important;
  height: auto !important;
  min-height: 0 !important;
  background: transparent !important;
}

html.srd-theme-active[data-srd-layout="studio"] [data-testid="action-bar"] {
  height: auto !important;
  min-height: 72px !important;
  padding: 14px 16px !important;
  border: 1px solid rgba(255, 255, 255, 0.07) !important;
  border-radius: 18px !important;
  background:
    linear-gradient(100deg, color-mix(in srgb, var(--srd-primary) 9%, transparent), transparent 36%),
    color-mix(in srgb, var(--srd-panel-raised) 94%, black) !important;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.26), inset 0 1px rgba(255, 255, 255, 0.025) !important;
}

html.srd-theme-active[data-srd-layout="studio"] [data-testid="action-bar-row"] {
  width: 100% !important;
  min-height: 44px !important;
}

html.srd-theme-active[data-srd-layout="studio"] :is(
  [data-testid="album-page"],
  [data-testid="playlist-page"]
) > .contentSpacing:has([data-testid="track-list"]) {
  box-sizing: border-box !important;
  padding: 16px !important;
  border: 1px solid rgba(255, 255, 255, 0.065) !important;
  border-radius: 22px !important;
  background: color-mix(in srgb, var(--srd-panel) 96%, transparent) !important;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.26) !important;
}

html.srd-theme-active[data-srd-layout="studio"] [data-testid="track-list"] {
  padding: 2px !important;
}

html.srd-theme-active[data-srd-layout="studio"] [data-testid="track-list"] > [role="presentation"]:first-child {
  margin-bottom: 10px !important;
  border-bottom: 0 !important;
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.025) !important;
}

html.srd-theme-active[data-srd-layout="studio"] [data-testid="tracklist-row"] {
  box-sizing: border-box !important;
  width: calc(100% - 8px) !important;
  min-height: 58px !important;
  margin: 5px 4px !important;
  padding-inline: 8px !important;
  border: 1px solid rgba(255, 255, 255, 0.048) !important;
  border-radius: 14px !important;
  background: color-mix(in srgb, var(--srd-panel-raised) 78%, transparent) !important;
  box-shadow: inset 3px 0 color-mix(in srgb, var(--srd-primary) 22%, transparent) !important;
  transform: none !important;
  transition: border-color 150ms ease, background 150ms ease, box-shadow 150ms ease !important;
}

html.srd-theme-active[data-srd-layout="studio"] [data-testid="tracklist-row"]:hover,
html.srd-theme-active[data-srd-layout="studio"] [data-testid="tracklist-row"][aria-selected="true"] {
  border-color: color-mix(in srgb, var(--srd-primary) 28%, rgba(255, 255, 255, 0.06)) !important;
  background: color-mix(in srgb, var(--srd-primary) 9%, var(--srd-panel-raised)) !important;
  box-shadow: inset 3px 0 var(--srd-primary), 0 8px 20px rgba(0, 0, 0, 0.2) !important;
  transform: none !important;
}

html.srd-theme-active[data-srd-layout="studio"] [data-testid="tracklist-row"] button {
  transform: none !important;
}

/* Home is a bento dashboard: pairs of independent shelves instead of one long feed. */
html.srd-theme-active[data-srd-layout="studio"] [data-testid="home-page"] > .contentSpacing {
  box-sizing: border-box !important;
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  align-items: start !important;
  gap: 18px !important;
  width: 100% !important;
  padding: 24px 28px 54px !important;
}

html.srd-theme-active[data-srd-layout="studio"] [data-testid="home-page"] > .contentSpacing > section[aria-label]:not([data-testid="component-shelf"]) {
  grid-column: 1 / -1 !important;
  margin: 0 0 4px !important;
}

html.srd-theme-active[data-srd-layout="studio"] [data-testid="home-page"] [data-testid="component-shelf"] {
  box-sizing: border-box !important;
  min-width: 0 !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 16px 0 12px !important;
  overflow: hidden !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 22px !important;
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--srd-primary) 6%, transparent), transparent 44%),
    color-mix(in srgb, var(--srd-panel) 95%, transparent) !important;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.22) !important;
}

html.srd-theme-active[data-srd-layout="studio"] [data-testid="home-page"] [data-testid="component-shelf"]:nth-of-type(3n + 1),
html.srd-theme-active[data-srd-layout="studio"] [data-testid="home-page"] [data-testid="component-shelf"]:has(> [data-testid="grid-container"]) {
  grid-column: 1 / -1 !important;
}

html.srd-theme-active[data-srd-layout="studio"] [data-testid="home-page"] [data-testid="rich-title-row-shelf-header"] {
  box-sizing: border-box !important;
  width: 100% !important;
  padding-inline: 18px !important;
}

html.srd-theme-active[data-srd-layout="studio"] [data-testid="home-page"] [data-testid="carousel-scroller"] {
  box-sizing: border-box !important;
  width: 100% !important;
  padding-inline: 10px !important;
  scroll-padding-inline: 10px !important;
}

html.srd-theme-active[data-srd-layout="studio"] [data-testid="home-page"] [data-testid="carousel-scroller"] .e-10451-card {
  min-width: 172px !important;
  max-width: 214px !important;
  border: 1px solid rgba(255, 255, 255, 0.055) !important;
  border-radius: 17px !important;
  background: color-mix(in srgb, var(--srd-panel-raised) 88%, transparent) !important;
}

/* Now Playing is its own instrument panel, not a continuation of the center feed. */
html.srd-theme-active[data-srd-layout="studio"] .srd-right-sidebar {
  padding: 7px !important;
  border-radius: 24px !important;
  background:
    linear-gradient(175deg, color-mix(in srgb, var(--srd-secondary) 7%, transparent), transparent 30%),
    var(--srd-panel) !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-right-sidebar [data-testid="NPV_Panel_OpenDiv"]::before {
  content: "NOW / PLAYING";
  display: block;
  margin: 4px 10px 12px;
  color: color-mix(in srgb, var(--srd-secondary) 58%, white);
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.18em;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-right-sidebar [data-testid="cover-art-image"],
html.srd-theme-active[data-srd-layout="studio"] .srd-right-sidebar [data-testid="npv-artist-bio-button"] {
  border-radius: 18px !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-right-sidebar [data-testid="context-item-info-title"] {
  letter-spacing: -0.025em !important;
}

@media (min-width: 1250px) {
  html.srd-theme-active[data-srd-layout="studio"] :is(
    [data-testid="album-page"],
    [data-testid="playlist-page"]
  ) {
    box-sizing: border-box !important;
    display: grid !important;
    grid-template-columns: minmax(300px, 350px) minmax(0, 1fr) !important;
    grid-template-areas:
      "identity commands"
      "identity collection"
      "recommendations recommendations" !important;
    align-items: start !important;
    gap: 16px !important;
    width: 100% !important;
    padding: 74px 18px 18px !important;
  }

  html.srd-theme-active[data-srd-layout="studio"] :is(
    [data-testid="album-page"],
    [data-testid="playlist-page"]
  ) > :first-child {
    grid-area: identity !important;
    align-self: start !important;
    position: sticky !important;
    top: 18px !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: 520px !important;
    overflow: hidden !important;
    border: 1px solid rgba(255, 255, 255, 0.07) !important;
    border-radius: 24px !important;
    background:
      radial-gradient(circle at 50% 18%, color-mix(in srgb, var(--srd-primary) 17%, transparent), transparent 42%),
      var(--srd-panel) !important;
    box-shadow: 0 22px 54px rgba(0, 0, 0, 0.32) !important;
  }

  html.srd-theme-active[data-srd-layout="studio"] :is(
    [data-testid="album-page"],
    [data-testid="playlist-page"]
  ) > :first-child > .contentSpacing {
    box-sizing: border-box !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 20px !important;
    width: 100% !important;
    height: auto !important;
    min-height: 520px !important;
    padding: 24px !important;
  }

  html.srd-theme-active[data-srd-layout="studio"] :is(
    [data-testid="album-page"],
    [data-testid="playlist-page"]
  ) > :first-child button[aria-label="View album artwork"] {
    align-self: center !important;
    width: min(100%, 260px) !important;
    height: auto !important;
    aspect-ratio: 1 !important;
    margin: 0 !important;
    overflow: hidden !important;
    border: 1px solid rgba(255, 255, 255, 0.09) !important;
    border-radius: 20px !important;
    box-shadow: 0 24px 46px rgba(0, 0, 0, 0.4) !important;
  }

  html.srd-theme-active[data-srd-layout="studio"] :is(
    [data-testid="album-page"],
    [data-testid="playlist-page"]
  ) > :first-child .contentSpacing > div:last-child {
    box-sizing: border-box !important;
    width: 100% !important;
    min-width: 0 !important;
    padding: 0 !important;
  }

  html.srd-theme-active[data-srd-layout="studio"] :is(
    [data-testid="album-page"],
    [data-testid="playlist-page"]
  ) > :first-child h1 {
    font-size: clamp(28px, 3vw, 46px) !important;
    line-height: 1.02 !important;
  }

  html.srd-theme-active[data-srd-layout="studio"] :is(
    [data-testid="album-page"],
    [data-testid="playlist-page"]
  ) > div:has([data-testid="action-bar"]) {
    grid-area: commands !important;
    position: static !important;
  }

  html.srd-theme-active[data-srd-layout="studio"] :is(
    [data-testid="album-page"],
    [data-testid="playlist-page"]
  ) > .contentSpacing:has([data-testid="track-list"]) {
    grid-area: collection !important;
  }

  html.srd-theme-active[data-srd-layout="studio"] :is(
    [data-testid="album-page"],
    [data-testid="playlist-page"]
  ) > .contentSpacing:has([data-testid="component-shelf"]) {
    grid-area: recommendations !important;
    padding-inline: 0 !important;
  }
}

@media (max-width: 1249px) {
  html.srd-theme-active[data-srd-layout="studio"] [data-testid="home-page"] > .contentSpacing {
    grid-template-columns: minmax(0, 1fr) !important;
  }

  html.srd-theme-active[data-srd-layout="studio"] [data-testid="home-page"] [data-testid="component-shelf"] {
    grid-column: 1 !important;
  }
}

@media (max-width: 1499px) {
  html.srd-theme-active[data-srd-layout="studio"] .srd-app-grid {
    grid-template-columns: var(--srd-library-width, 260px) minmax(480px, 1fr) 340px !important;
  }
}

@media (prefers-reduced-motion: no-preference) {
  html.srd-theme-active[data-srd-motion="on"][data-srd-effect="ambient"] body::before {
    will-change: transform;
    animation: srd-background-drift 28s ease-in-out infinite alternate;
  }

  html.srd-theme-active[data-srd-motion="on"] .main-card-card,
  html.srd-theme-active[data-srd-motion="on"] [data-testid="card-container"] {
    transition-duration: 180ms !important;
  }
}

html.srd-theme-active[data-srd-motion="off"] *,
html.srd-theme-active[data-srd-motion="off"] *::before,
html.srd-theme-active[data-srd-motion="off"] *::after {
  scroll-behavior: auto !important;
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
}

@keyframes srd-background-drift {
  from { transform: translate3d(-1.2%, -0.8%, 0) scale(1.02); }
  to { transform: translate3d(1.2%, 0.8%, 0) scale(1.035); }
}

/* Liquid Glass workspace --------------------------------------------------- */
:root {
  --srd-wallpaper-image: linear-gradient(138deg, #090716, #34235f 52%, #ba8dd8);
  --srd-glass: rgba(12, 13, 19, 0.52);
  --srd-glass-heavy: rgba(8, 9, 14, 0.72);
  --srd-glass-soft: rgba(255, 255, 255, 0.075);
  --srd-glass-border: rgba(255, 255, 255, 0.19);
  --srd-glass-highlight: rgba(255, 255, 255, 0.34);
  --srd-glass-shadow: 0 24px 70px rgba(0, 0, 0, 0.34), inset 0 1px rgba(255, 255, 255, 0.18);
}

html.srd-theme-active body {
  position: relative;
  isolation: isolate;
  background: #050509 !important;
}

.srd-wallpaper-layer,
.srd-starfield {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.srd-wallpaper-layer {
  z-index: -2;
  background-color: #11111a;
  background-image: var(--srd-wallpaper-image);
  background-position: center;
  background-size: cover;
  filter: saturate(1.04) contrast(1.02);
  transform: scale(1.015);
}

.srd-wallpaper-layer::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 52% 42%, transparent 16%, rgba(3, 4, 9, 0.28) 78%),
    linear-gradient(180deg, rgba(3, 4, 9, 0.08), rgba(3, 4, 9, 0.32));
}

.srd-starfield {
  z-index: -1;
  overflow: hidden;
}

.srd-shooting-star {
  --srd-star-top: 4%;
  --srd-star-right: -14%;
  position: absolute;
  top: var(--srd-star-top);
  right: var(--srd-star-right);
  width: clamp(70px, 9vw, 150px);
  height: 1px;
  border-radius: 99px;
  opacity: 0;
  background: linear-gradient(90deg, transparent, rgba(229, 241, 255, 0.92));
  box-shadow: 0 0 10px rgba(207, 225, 255, 0.7);
  transform: translate3d(0, 0, 0) rotate(-38deg);
  animation: srd-starfall 8.4s linear infinite;
  animation-delay: calc(var(--srd-star-index) * -1.73s);
}

.srd-shooting-star::after {
  content: "";
  position: absolute;
  top: 50%;
  right: -2px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 0 10px 2px rgba(226, 237, 255, 0.9);
  transform: translateY(-50%);
}

.srd-shooting-star:nth-child(2n) { --srd-star-top: 17%; animation-duration: 10.8s; }
.srd-shooting-star:nth-child(3n) { --srd-star-top: 32%; animation-duration: 12.6s; }
.srd-shooting-star:nth-child(4n) { --srd-star-top: 48%; animation-duration: 9.7s; }
.srd-shooting-star:nth-child(5n) { --srd-star-top: 9%; width: 82px; animation-duration: 14.2s; }
.srd-shooting-star:nth-child(7n) { --srd-star-top: 62%; width: 104px; }

html.srd-theme-active[data-srd-motion="off"] .srd-shooting-star {
  display: none;
}

html.srd-theme-active .Root,
html.srd-theme-active #main {
  position: relative;
  z-index: 1;
}

html.srd-theme-active :is(
  .Root__nav-bar,
  .Root__main-view,
  .Root__right-sidebar,
  .main-yourLibraryX-library,
  .main-nowPlayingView-nowPlayingWidget,
  .srd-modal,
  [role="dialog"],
  [role="menu"]
) {
  border-color: var(--srd-glass-border) !important;
  background: var(--srd-glass) !important;
  box-shadow: var(--srd-glass-shadow) !important;
  backdrop-filter: blur(30px) saturate(1.45) !important;
}

html.srd-theme-active .main-globalNav-globalNav,
html.srd-theme-active .main-topBar-container,
html.srd-theme-active .main-topBar-topbarContent,
html.srd-theme-active [data-testid="topbar-content"] {
  background: transparent !important;
  backdrop-filter: none !important;
}

html.srd-theme-active .main-card-card,
html.srd-theme-active [data-testid="card-container"],
html.srd-theme-active [data-testid="shortcut"] {
  border-color: rgba(255, 255, 255, 0.15) !important;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.045)) !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.16), 0 14px 32px rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(22px) saturate(1.35) !important;
}

html.srd-theme-active .main-card-card:hover,
html.srd-theme-active [data-testid="card-container"]:hover,
html.srd-theme-active [data-testid="shortcut"]:hover {
  border-color: color-mix(in srgb, var(--srd-primary) 44%, rgba(255, 255, 255, 0.24)) !important;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.07)) !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.22), 0 20px 46px rgba(0, 0, 0, 0.28) !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-app-grid {
  grid-template-areas:
    "global-nav global-nav now-playing-bar"
    "left-sidebar main-view now-playing-bar" !important;
  grid-template-columns: var(--srd-library-width, 252px) minmax(520px, 1fr) clamp(350px, 28vw, 470px) !important;
  grid-template-rows: 64px minmax(0, 1fr) !important;
  padding: 12px !important;
  gap: 12px !important;
}

html.srd-theme-active[data-srd-layout="studio"] body .srd-global-nav,
html.srd-theme-active[data-srd-layout="studio"] body .srd-left-sidebar,
html.srd-theme-active[data-srd-layout="studio"] body .srd-main-view {
  border: 1px solid var(--srd-glass-border) !important;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.025)),
    rgba(8, 10, 16, 0.48) !important;
  box-shadow: var(--srd-glass-shadow) !important;
  backdrop-filter: blur(30px) saturate(1.4) !important;
}

html.srd-theme-active[data-srd-layout="studio"] body .srd-global-nav {
  border-radius: 24px !important;
}

html.srd-theme-active[data-srd-layout="studio"] body .srd-left-sidebar,
html.srd-theme-active[data-srd-layout="studio"] body .srd-main-view {
  border-radius: 30px !important;
}

html.srd-theme-active[data-srd-layout="studio"] body .srd-main-view,
html.srd-theme-active[data-srd-layout="studio"] body .srd-main-view :is(.main-view-container, .main-view-container__scroll-node) {
  background: transparent !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-right-sidebar {
  display: none !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player-zone {
  position: relative !important;
  isolation: isolate;
  grid-area: now-playing-bar !important;
  overflow: hidden !important;
  border: 1px solid var(--srd-glass-border) !important;
  border-radius: 34px !important;
  background:
    radial-gradient(circle at 50% 20%, color-mix(in srgb, var(--srd-primary) 26%, transparent), transparent 44%),
    #080910 !important;
  box-shadow: var(--srd-glass-shadow) !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player-zone::before,
html.srd-theme-active[data-srd-layout="studio"] .srd-player-zone::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player-zone::before {
  background: linear-gradient(180deg, rgba(2, 3, 8, 0.02) 18%, rgba(3, 4, 9, 0.22) 48%, #07080d 82%, #07080d 100%);
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player-zone::after {
  inset: auto 10% 31% 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.44), transparent);
  box-shadow: 0 0 34px color-mix(in srgb, var(--srd-primary) 38%, transparent);
}

.srd-player-artwork {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at 28% 20%, color-mix(in srgb, var(--srd-secondary) 30%, transparent), transparent 38%),
    linear-gradient(145deg, #111224, #07080d);
}

.srd-player-artwork img {
  width: 100%;
  height: 72%;
  object-fit: cover;
  object-position: center;
  filter: saturate(1.08) contrast(1.03);
  transform: scale(1.02);
}

.srd-player-artwork::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, transparent 22%, rgba(5, 6, 11, 0.12) 45%, #07080d 72%, #07080d),
    linear-gradient(90deg, rgba(5, 6, 11, 0.1), transparent 30%, transparent 70%, rgba(5, 6, 11, 0.1));
}

html.srd-theme-active[data-srd-layout="studio"] body .srd-player {
  position: absolute !important;
  inset: auto 0 0 !important;
  z-index: 2;
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  justify-content: flex-end !important;
  gap: 14px !important;
  width: 100% !important;
  height: auto !important;
  min-height: 34% !important;
  padding: 30px 26px 26px !important;
  overflow: visible !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player > * {
  position: relative;
  z-index: 2;
  width: 100% !important;
  max-width: none !important;
  min-width: 0 !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player :is(
  [class*="nowPlayingBar-left"],
  [class*="nowPlayingBar-center"],
  [class*="nowPlayingBar-right"]
) {
  width: 100% !important;
  min-width: 0 !important;
  flex: 0 0 auto !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player [class*="nowPlayingBar-left"] {
  order: 1;
  padding: 0 !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player [class*="nowPlayingBar-center"] {
  order: 2;
  display: flex !important;
  flex-direction: column !important;
  gap: 9px !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player [class*="nowPlayingBar-right"] {
  order: 3;
  justify-content: center !important;
  opacity: 0.72;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player [data-testid="cover-art-image"] {
  display: none !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player [data-testid="context-item-info-title"] {
  font-size: clamp(22px, 2vw, 30px) !important;
  font-weight: 760 !important;
  letter-spacing: -0.035em !important;
  line-height: 1.08 !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player [data-testid="playback-controls"] {
  width: 100% !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player [data-testid="play-button"] {
  box-shadow: 0 10px 30px color-mix(in srgb, var(--srd-primary) 42%, rgba(0, 0, 0, 0.34)) !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player [data-testid="playback-progressbar"] {
  width: 100% !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player [data-testid="progress-bar-background"] {
  height: 5px !important;
  border-radius: 99px !important;
  background: rgba(255, 255, 255, 0.22) !important;
}

html.srd-theme-active[data-srd-layout="studio"] body [data-testid="carousel-scroller"] .e-10451-card,
html.srd-theme-active[data-srd-layout="studio"] body [data-testid="card-container"] {
  border-color: rgba(255, 255, 255, 0.15) !important;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.045)) !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.16), 0 14px 32px rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(22px) saturate(1.35) !important;
}

/* Wallpaper picker */
.srd-wallpaper-section,
.srd-theme-section {
  padding: 20px 0;
  border-bottom: 1px solid var(--srd-border);
}

.srd-wallpaper-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 11px;
}

.srd-wallpaper-choice {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
  padding: 8px 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 15px;
  color: var(--srd-text);
  background: rgba(255, 255, 255, 0.045);
  cursor: pointer;
  text-align: left;
  transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
}

.srd-wallpaper-choice:hover {
  border-color: rgba(255, 255, 255, 0.24);
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.srd-wallpaper-choice[aria-pressed="true"] {
  border-color: color-mix(in srgb, var(--srd-primary) 68%, white);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--srd-primary) 22%, transparent), 0 12px 28px rgba(0, 0, 0, 0.22);
}

.srd-wallpaper-choice strong {
  overflow: hidden;
  padding-inline: 2px;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.srd-wallpaper-preview {
  position: relative;
  display: block;
  height: 72px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 11px;
  background-color: #13141a;
  background-image: var(--srd-wallpaper-preview);
  background-position: center;
  background-size: cover;
}

.srd-wallpaper-preview-glass {
  position: absolute;
  right: 9px;
  bottom: 8px;
  width: 46%;
  height: 42%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.2), 0 7px 14px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(7px);
}

.srd-wallpaper-choice--custom .srd-wallpaper-preview {
  display: grid;
  place-items: center;
  background-image:
    linear-gradient(135deg, color-mix(in srgb, var(--srd-primary) 26%, transparent), transparent),
    linear-gradient(145deg, #191a22, #0b0c11);
}

html[data-srd-wallpaper="custom"] .srd-wallpaper-choice--custom .srd-wallpaper-preview {
  background-image: var(--srd-wallpaper-image);
}

.srd-wallpaper-upload-icon {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: white;
  background: rgba(5, 6, 10, 0.42);
  font-size: 21px;
  backdrop-filter: blur(8px);
}

.srd-modal {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.03)),
    rgba(9, 10, 16, 0.78) !important;
  backdrop-filter: blur(38px) saturate(1.45) !important;
}

.srd-theme-live-preview {
  background-image: var(--srd-wallpaper-image);
  background-position: center;
  background-size: cover;
}

.srd-theme-live-preview::after {
  content: "\u2726";
  position: absolute;
  top: 12px;
  right: 42%;
  color: rgba(255, 255, 255, 0.8);
  font-size: 10px;
  text-shadow: -14px 16px 0 rgba(255, 255, 255, 0.3), -30px 38px 0 rgba(255, 255, 255, 0.18);
}

.srd-theme-live-preview .srd-preview-rail,
.srd-theme-live-preview .srd-preview-header,
.srd-theme-live-preview .srd-preview-card,
.srd-theme-live-preview .srd-preview-player {
  border-color: rgba(255, 255, 255, 0.22);
  background: rgba(10, 11, 18, 0.48) !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px);
}

.srd-theme-live-preview .srd-preview-header {
  right: 39%;
}

.srd-theme-live-preview .srd-preview-card {
  width: calc(30.5% - 25px);
}

.srd-theme-live-preview .srd-preview-card--two {
  right: 39%;
}

.srd-theme-live-preview .srd-preview-player {
  top: 8px;
  right: 8px;
  bottom: 8px;
  left: auto;
  width: 34%;
  height: auto;
  border-radius: 12px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--srd-primary) 20%, transparent), transparent 42%, rgba(6, 7, 12, 0.92) 76%),
    rgba(10, 11, 18, 0.46) !important;
}

@media (max-width: 1499px) {
  html.srd-theme-active[data-srd-layout="studio"] .srd-app-grid {
    grid-template-columns: var(--srd-library-width, 230px) minmax(460px, 1fr) clamp(320px, 27vw, 390px) !important;
  }
}

@media (max-width: 1120px) {
  html.srd-theme-active[data-srd-layout="studio"] .srd-app-grid {
    grid-template-areas:
      "global-nav global-nav"
      "left-sidebar main-view"
      "now-playing-bar now-playing-bar" !important;
    grid-template-columns: var(--srd-library-width, 220px) minmax(0, 1fr) !important;
    grid-template-rows: 60px minmax(0, 1fr) 116px !important;
  }

  html.srd-theme-active[data-srd-layout="studio"] .srd-player-zone {
    border-radius: 24px !important;
  }

  html.srd-theme-active[data-srd-layout="studio"] .srd-player-artwork {
    width: 32%;
  }

  html.srd-theme-active[data-srd-layout="studio"] .srd-player-artwork img {
    height: 100%;
  }

  html.srd-theme-active[data-srd-layout="studio"] .srd-player-artwork::after {
    background: linear-gradient(90deg, transparent, #07080d 94%);
  }

  html.srd-theme-active[data-srd-layout="studio"] .srd-player-zone::before {
    background: linear-gradient(90deg, transparent 12%, rgba(7, 8, 13, 0.86) 32%, #07080d 42%);
  }

  html.srd-theme-active[data-srd-layout="studio"] .srd-player-zone::after {
    display: none;
  }

  html.srd-theme-active[data-srd-layout="studio"] .srd-player {
    position: relative !important;
    display: grid !important;
    grid-template-columns: minmax(220px, 1fr) minmax(320px, 1.4fr) !important;
    align-items: center !important;
    min-height: 100% !important;
    padding: 14px 22px 14px 34% !important;
  }

  html.srd-theme-active[data-srd-layout="studio"] .srd-player [class*="nowPlayingBar-right"] {
    display: none !important;
  }
}

@media (max-width: 840px) {
  .srd-wallpaper-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@keyframes srd-starfall {
  0%, 10% { opacity: 0; transform: translate3d(0, 0, 0) rotate(-38deg); }
  14% { opacity: 0.95; }
  42% { opacity: 0.82; }
  48%, 100% { opacity: 0; transform: translate3d(-118vw, 112vh, 0) rotate(-38deg); }
}

/* Current Spotify player DOM: rebuild the obfuscated horizontal footer into a real vertical player card. */
html.srd-theme-active[data-srd-layout="studio"] .srd-app-grid {
  grid-template-columns: var(--srd-library-width, 252px) minmax(600px, 1fr) clamp(300px, 20vw, 360px) !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player-zone {
  border-radius: 28px !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player-zone::before {
  background: linear-gradient(
    180deg,
    rgba(3, 4, 9, 0.01) 0%,
    rgba(3, 4, 9, 0.02) 34%,
    rgba(5, 6, 11, 0.36) 48%,
    #07080d 68%,
    #07080d 100%
  );
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player-zone::after {
  inset: auto 13% 42% 13%;
}

.srd-player-artwork {
  pointer-events: none;
}

.srd-player-artwork img {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: cover;
  object-position: center;
  transform: none;
}

.srd-player-artwork::after {
  background: linear-gradient(
    180deg,
    transparent 44%,
    rgba(7, 8, 13, 0.08) 58%,
    rgba(7, 8, 13, 0.78) 84%,
    #07080d 100%
  );
}

html.srd-theme-active[data-srd-layout="studio"] body .srd-player {
  min-height: 43% !important;
  padding: 52px 24px 24px !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player > :first-child {
  box-sizing: border-box !important;
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) !important;
  grid-template-rows: auto auto auto !important;
  align-items: center !important;
  gap: 16px !important;
  width: 100% !important;
  height: auto !important;
  min-width: 0 !important;
  padding: 0 !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player > :first-child > * {
  box-sizing: border-box !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: none !important;
  margin: 0 !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player > :first-child > :nth-child(1) {
  grid-row: 1;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player > :first-child > :nth-child(2) {
  grid-row: 2;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player > :first-child > :nth-child(3) {
  grid-row: 3;
  justify-content: center !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player [data-testid="now-playing-widget"] {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) auto !important;
  align-items: end !important;
  gap: 14px !important;
  width: 100% !important;
  min-width: 0 !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player :is(
  [data-testid="CoverSlotCollapsed__container"],
  [data-testid="cover-art-button"]
) {
  display: none !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player [data-testid="now-playing-widget"] > :has(
  [data-testid="context-item-info-title"]
) {
  box-sizing: border-box !important;
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) !important;
  gap: 4px !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: none !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player :is(
  [data-testid="context-item-info-title"],
  [data-testid="context-item-info-title"] > span,
  [data-testid="context-item-link"]
) {
  display: block !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player [data-testid="context-item-info-title"] {
  font-size: clamp(21px, 1.45vw, 28px) !important;
  line-height: 1.12 !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player :is(
  [data-testid="context-item-info-subtitles"],
  [data-testid="context-item-info-quality"]
) {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player [data-testid="player-controls"] {
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: none !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player [data-testid="player-controls"] > * {
  box-sizing: border-box !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: none !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player [data-testid="general-controls"] {
  display: flex !important;
  justify-content: center !important;
  gap: clamp(6px, 1vw, 13px) !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player [data-testid="general-controls"] button {
  width: 38px !important;
  min-width: 38px !important;
  height: 38px !important;
  min-height: 38px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.075) !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player [data-testid="general-controls"] button:hover {
  background: rgba(255, 255, 255, 0.15) !important;
}

html.srd-theme-active[data-srd-layout="studio"] .srd-player :is(
  [data-testid="playback-progressbar"],
  [data-testid="playback-progressbar"] > *,
  [data-testid="player-controls"] [role="slider"]
) {
  width: 100% !important;
  min-width: 0 !important;
  max-width: none !important;
}

html.srd-theme-active[data-srd-layout="studio"] #main-view [data-testid="home-page"],
html.srd-theme-active[data-srd-layout="studio"] #main-view [data-testid="home-page"] > * {
  background-color: transparent !important;
}

@media (max-width: 1499px) and (min-width: 1121px) {
  html.srd-theme-active[data-srd-layout="studio"] .srd-app-grid {
    grid-template-columns: var(--srd-library-width, 220px) minmax(500px, 1fr) clamp(290px, 23vw, 340px) !important;
  }
}

/* Unified milky glass material. Keep this block last and more specific than palette themes. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] {
  --srd-glass-blur: 24px;
  --srd-glass-nav-alpha: 0.251;
  --srd-glass-shell-alpha: 0.235;
  --srd-glass-shelf-alpha: 0.229;
  --srd-glass-card-alpha: 0.035;
  --srd-glass-control-alpha: 0.083;
  --srd-glass-modal-alpha: 0.424;
  --srd-glass-player-alpha: 0.383;
  --srd-milk: rgb(226 234 255 / var(--srd-glass-card-alpha));
  --srd-milk-soft: rgb(245 248 255 / var(--srd-glass-card-alpha));
  --srd-milk-hover: rgba(244, 248, 255, 0.145);
  --srd-milk-strong: rgba(18, 22, 34, 0.44);
  --srd-milk-deep: rgba(7, 9, 16, 0.54);
  --srd-milk-border: rgba(255, 255, 255, 0.2);
  --srd-milk-border-soft: rgba(255, 255, 255, 0.115);
  --srd-milk-shine: linear-gradient(145deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.045) 42%, rgba(255, 255, 255, 0.025));
  --srd-panel: rgb(226 234 255 / var(--srd-glass-card-alpha));
  --srd-panel-raised: rgb(235 241 255 / var(--srd-glass-control-alpha));
  --srd-canvas: transparent;
  --srd-border: var(--srd-milk-border-soft);
  --background-base: transparent !important;
  --background-base-min: transparent !important;
  --background-elevated-base: rgba(224, 233, 255, 0.1) !important;
  --background-elevated-highlight: rgba(244, 248, 255, 0.16) !important;
  --background-tinted-base: rgba(232, 239, 255, 0.08) !important;
  --background-tinted-highlight: rgba(247, 250, 255, 0.15) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body {
  background: transparent !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body::before,
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body::after {
  opacity: 0.34;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-global-nav,
  .srd-left-sidebar,
  .srd-main-view,
  .srd-right-sidebar,
  .srd-player-zone
) {
  border: 1px solid var(--srd-milk-border) !important;
  background:
    var(--srd-milk-shine),
    var(--srd-milk) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(255, 255, 255, 0.035),
    0 22px 54px rgba(2, 4, 12, 0.28) !important;
  -webkit-backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.42) !important;
  backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.42) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-global-nav {
  background:
    linear-gradient(110deg, rgba(255, 255, 255, 0.145), rgba(255, 255, 255, 0.045)),
    rgb(22 25 38 / var(--srd-glass-nav-alpha)) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-left-sidebar {
  background:
    linear-gradient(165deg, rgba(255, 255, 255, 0.135), rgba(255, 255, 255, 0.035) 38%, rgba(9, 12, 21, 0.24)),
    rgb(18 22 34 / var(--srd-glass-shell-alpha)) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-main-view {
  background:
    radial-gradient(circle at 52% -8%, color-mix(in srgb, var(--srd-secondary) 12%, transparent), transparent 42%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.115), rgba(255, 255, 255, 0.025) 45%),
    rgb(13 16 27 / var(--srd-glass-shell-alpha)) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player-zone {
  container-type: inline-size;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.135), rgba(255, 255, 255, 0.025) 35%),
    rgb(8 10 18 / var(--srd-glass-shell-alpha)) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player-zone::before {
  inset: 0 0 auto !important;
  height: min(68%, 680px);
  background: linear-gradient(
    180deg,
    transparent 28%,
    rgba(5, 7, 13, 0.18) 43%,
    rgba(5, 7, 13, 0.82) 68%,
    rgba(5, 7, 13, 0.48) 86%,
    transparent 100%
  ) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player-zone::after {
  inset: auto 12% clamp(198px, 27%, 244px) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player-artwork {
  inset: 0 0 auto !important;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  overflow: hidden;
  background: transparent !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player-artwork::after {
  background: linear-gradient(
    180deg,
    transparent 42%,
    rgba(5, 7, 13, 0.12) 57%,
    rgba(5, 7, 13, 0.76) 82%,
    rgba(5, 7, 13, 0.94) 100%
  ) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-main-view .main-view-container,
  .srd-main-view .main-view-container__scroll-node,
  .srd-main-view .main-view-container__scroll-node-child,
  .srd-main-view .main-view-container__scroll-node > div:not(.os-scrollbar),
  .srd-left-sidebar > nav,
  .srd-left-sidebar .YourLibraryX,
  [data-testid="home-page"],
  [data-testid="home-page"] > *,
  [data-testid="home-page"] > .contentSpacing
) {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
}

/* Center Spotify's Home filter chips without disturbing playback or card controls. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-main-view :has(
  > button[role="checkbox"][aria-label="All"]
) {
  box-sizing: border-box;
  display: flex !important;
  justify-content: center !important;
  width: max-content !important;
  max-width: 100% !important;
  margin-inline: auto !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-main-view .contentSpacing:has(
  [data-testid="carousel-scroller"][aria-label="Home Filters"]
) {
  justify-content: center !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-main-view .contentSpacing:has(
  [data-testid="carousel-scroller"][aria-label="Home Filters"]
) > * {
  margin-inline: auto !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme][data-srd-spotlight="off"] body [data-testid="home-ad-card"] {
  display: none !important;
}

/* Glass shelves, shortcut tiles, browse tiles and media cards. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"] [data-testid="component-shelf"] {
  border: 1px solid var(--srd-milk-border-soft) !important;
  background:
    linear-gradient(150deg, rgba(255, 255, 255, 0.115), rgba(255, 255, 255, 0.025) 52%),
    rgb(18 22 34 / var(--srd-glass-shelf-alpha)) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    0 16px 36px rgba(2, 4, 12, 0.18) !important;
  -webkit-backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.36) !important;
  backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.36) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"] :is(
  [data-testid="shortcut"],
  section[aria-label]:not([data-testid="component-shelf"]) > :first-child > *,
  [data-testid="carousel-scroller"] .e-10451-card,
  .main-card-card,
  [data-testid="card-container"]
) {
  border: 1px solid rgba(255, 255, 255, 0.13) !important;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.115), rgba(255, 255, 255, 0.025) 56%),
    rgb(231 238 255 / var(--srd-glass-card-alpha)) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.13),
    0 12px 28px rgba(2, 4, 12, 0.16) !important;
  -webkit-backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.3) !important;
  backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.3) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"] :is(
  [data-testid="shortcut"],
  section[aria-label]:not([data-testid="component-shelf"]) > :first-child > *,
  [data-testid="carousel-scroller"] .e-10451-card,
  .main-card-card,
  [data-testid="card-container"]
):is(:hover, :focus-within) {
  border-color: rgba(255, 255, 255, 0.26) !important;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.055) 56%),
    rgba(238, 243, 255, 0.105) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 18px 38px rgba(2, 4, 12, 0.24) !important;
  transform: translateY(-2px);
}

/* Rows, action bars and identity/detail panels use the same translucent material. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  [data-testid="track-list"] > [role="presentation"]:first-child,
  [data-testid="artist-entity-view"] .contentSpacing,
  [data-testid="home-ad-card"]
) {
  border-color: var(--srd-milk-border-soft) !important;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.018)),
    rgb(20 24 37 / var(--srd-glass-shelf-alpha)) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
  -webkit-backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.3) !important;
  backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.3) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  [data-testid="tracklist-row"],
  .main-trackList-trackListRow
):is(:hover, [aria-selected="true"]) {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.035)),
    color-mix(in srgb, var(--srd-primary) 11%, rgba(26, 30, 44, 0.3)) !important;
}

/* Navigation controls and Spotify popovers become compact glass, too. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .main-globalNav-searchContainer,
  [data-testid="search-input"],
  [role="dialog"],
  [role="menu"],
  .main-contextMenu-menu
) {
  border: 1px solid var(--srd-milk-border) !important;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.035)),
    rgb(14 17 28 / var(--srd-glass-modal-alpha)) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 18px 44px rgba(2, 4, 12, 0.3) !important;
  -webkit-backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.4) !important;
  backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.4) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .main-globalNav-globalNav button,
  .main-topBar-container button,
  [data-testid="action-bar-row"] button:not([data-testid="play-button"]),
  .srd-settings-button,
  .srd-update-button
) {
  border-color: rgba(255, 255, 255, 0.15) !important;
  background: rgb(242 246 255 / var(--srd-glass-control-alpha)) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.11) !important;
  -webkit-backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.25) !important;
  backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.25) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .main-globalNav-globalNav button,
  .main-topBar-container button,
  [data-testid="action-bar-row"] button:not([data-testid="play-button"]),
  .srd-settings-button,
  .srd-update-button
):hover {
  border-color: rgba(255, 255, 255, 0.27) !important;
  background: rgba(248, 250, 255, 0.15) !important;
}

/* Tall edge player: information and dependable compact controls stay anchored to the bottom. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player {
  inset: auto 0 0 !important;
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  min-height: 0 !important;
  padding: 28px 20px 18px !important;
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player > :first-child {
  gap: 11px !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player :is(
  [data-testid="general-controls"],
  [data-testid="playback-controls"]
) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player :is(
  [data-testid="general-controls"],
  [data-testid="playback-controls"]
) button {
  -webkit-appearance: none !important;
  appearance: none !important;
  forced-color-adjust: none;
  color-scheme: dark;
  display: grid !important;
  width: 38px !important;
  min-width: 38px !important;
  height: 38px !important;
  min-height: 38px !important;
  padding: 0 !important;
  border: 1px solid rgba(255, 255, 255, 0.13) !important;
  border-radius: 50% !important;
  background: rgb(244 247 255 / var(--srd-glass-control-alpha)) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
  cursor: pointer !important;
  pointer-events: auto !important;
  touch-action: manipulation;
  -webkit-app-region: no-drag;
  transition: transform 150ms ease, border-color 150ms ease, background 150ms ease, box-shadow 150ms ease !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player :is(
  [data-testid="general-controls"],
  [data-testid="playback-controls"]
) button:is(:hover, :focus-visible) {
  border-color: rgba(255, 255, 255, 0.3) !important;
  background: rgba(248, 250, 255, 0.16) !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.18), 0 8px 20px rgba(0, 0, 0, 0.22) !important;
  transform: translateY(-1px);
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player :is(
  [data-testid="general-controls"],
  [data-testid="playback-controls"]
) button:active {
  transform: translateY(0) scale(0.95);
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player [data-testid="play-button"] {
  width: 42px !important;
  min-width: 42px !important;
  height: 42px !important;
  min-height: 42px !important;
  border-color: color-mix(in srgb, var(--srd-primary) 62%, white) !important;
  background: linear-gradient(145deg, color-mix(in srgb, var(--srd-primary) 82%, white), var(--srd-primary)) !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.3), 0 8px 24px color-mix(in srgb, var(--srd-primary) 32%, transparent) !important;
}

/* Preserve Spotify's native window actions; only enlarge and modernize their hit targets. */
html.srd-theme-active body .srd-window-controls {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  padding: 4px !important;
  border: 1px solid rgba(255, 255, 255, 0.11) !important;
  border-radius: 15px !important;
  background: rgba(8, 10, 18, 0.38) !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.08), 0 10px 28px rgba(0, 0, 0, 0.24) !important;
  -webkit-backdrop-filter: blur(20px) saturate(1.3) !important;
  backdrop-filter: blur(20px) saturate(1.3) !important;
}

html.srd-theme-active body .srd-window-control {
  -webkit-appearance: none !important;
  appearance: none !important;
  forced-color-adjust: none;
  color-scheme: dark;
  position: relative !important;
  z-index: 4 !important;
  display: grid !important;
  width: 40px !important;
  min-width: 40px !important;
  height: 34px !important;
  min-height: 34px !important;
  margin-inline: 2px !important;
  padding: 0 !important;
  place-items: center !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 11px !important;
  color: rgba(248, 250, 255, 0.82) !important;
  background: rgba(241, 245, 255, 0.065) !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.09) !important;
  -webkit-backdrop-filter: blur(18px) saturate(1.25) !important;
  backdrop-filter: blur(18px) saturate(1.25) !important;
  cursor: default !important;
  pointer-events: auto !important;
  touch-action: manipulation;
  -webkit-app-region: no-drag;
  transition: color 140ms ease, background 140ms ease, border-color 140ms ease, transform 140ms ease !important;
}

html.srd-theme-active body .srd-window-control :is(svg, span) {
  width: 14px !important;
  height: 14px !important;
  pointer-events: none !important;
}

html.srd-theme-active body .srd-window-control:is(:hover, :focus-visible) {
  border-color: rgba(255, 255, 255, 0.27) !important;
  color: white !important;
  background: rgba(248, 250, 255, 0.15) !important;
  outline: none !important;
}

html.srd-theme-active body .srd-window-control:focus-visible {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--srd-primary) 58%, transparent) !important;
}

html.srd-theme-active body .srd-window-control:active {
  transform: scale(0.94);
}

html.srd-theme-active body .srd-window-control[data-srd-window-action="close"]:hover {
  border-color: rgba(255, 116, 126, 0.56) !important;
  background: rgba(224, 49, 64, 0.78) !important;
}

/* Redesign settings and Themes: no opaque utility panels remain. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-backdrop {
  background: rgba(4, 6, 12, 0.28) !important;
  -webkit-backdrop-filter: blur(14px) saturate(1.2) !important;
  backdrop-filter: blur(14px) saturate(1.2) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-modal {
  border: 1px solid rgba(255, 255, 255, 0.24) !important;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.035) 42%),
    rgb(10 12 22 / var(--srd-glass-modal-alpha)) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 34px 100px rgba(0, 0, 0, 0.45) !important;
  -webkit-backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.45) !important;
  backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.45) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-theme-studio,
  .srd-effect-control,
  .srd-color-control,
  .srd-segmented,
  .srd-theme-choice,
  .srd-wallpaper-choice,
  .srd-package-card,
  .srd-css-editor
) {
  border-color: rgba(255, 255, 255, 0.15) !important;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.022)),
    rgb(232 238 255 / var(--srd-glass-card-alpha)) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
  -webkit-backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.3) !important;
  backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.3) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-tab,
  .srd-segmented-option,
  .srd-button
) {
  border: 1px solid transparent;
  background: rgba(244, 247, 255, 0.055) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-tab[aria-selected="true"],
  .srd-segmented-option[aria-pressed="true"],
  .srd-theme-choice[aria-pressed="true"],
  .srd-wallpaper-choice[aria-pressed="true"]
) {
  border-color: color-mix(in srgb, var(--srd-primary) 52%, rgba(255, 255, 255, 0.34)) !important;
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--srd-primary) 27%, rgba(255, 255, 255, 0.11)), rgba(255, 255, 255, 0.045)),
    rgba(230, 236, 255, 0.08) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 10px 28px color-mix(in srgb, var(--srd-primary) 20%, transparent) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-theme-choice,
  .srd-wallpaper-choice,
  .srd-package-card,
  .srd-button,
  .srd-tab,
  .srd-segmented-option
):hover {
  border-color: rgba(255, 255, 255, 0.25) !important;
  background: rgba(247, 249, 255, 0.13) !important;
}

.srd-range-control {
  display: grid;
  grid-template-columns: minmax(170px, 250px) 54px;
  align-items: center;
  gap: 12px;
  min-width: 250px;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 13px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02)),
    rgb(232 238 255 / var(--srd-glass-card-alpha, 0.035));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
  -webkit-backdrop-filter: blur(var(--srd-glass-blur, 24px)) saturate(1.3);
  backdrop-filter: blur(var(--srd-glass-blur, 24px)) saturate(1.3);
}

.srd-range-input {
  width: 100%;
  height: 5px;
  margin: 0;
  border-radius: 999px;
  outline: none;
  accent-color: var(--srd-primary);
  cursor: pointer;
}

.srd-range-value {
  color: var(--srd-text);
  font: 700 11px/1.2 ui-monospace, SFMono-Regular, Consolas, monospace;
  text-align: right;
}

@media (max-width: 620px) {
  .srd-range-control {
    grid-template-columns: minmax(0, 1fr) 52px;
    width: 100%;
    min-width: 0;
  }
}

/* Home card sizing and text flow are maintained in layout-fixes.css. */

/* Dark liquid glass is intentionally limited to transport controls and page action circles. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] {
  --srd-liquid-control:
    radial-gradient(circle at 26% 16%, rgba(255, 255, 255, 0.13), transparent 34%),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--srd-primary) 10%, rgba(15, 18, 27, 0.88)),
      color-mix(in srgb, var(--srd-secondary) 5%, rgba(3, 5, 10, 0.94)) 72%
    );
  --srd-liquid-control-hover:
    radial-gradient(circle at 28% 14%, rgba(255, 255, 255, 0.2), transparent 38%),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--srd-primary) 18%, rgba(19, 23, 34, 0.91)),
      color-mix(in srgb, var(--srd-secondary) 8%, rgba(4, 6, 12, 0.96)) 76%
    );
  --srd-liquid-border: color-mix(in srgb, var(--srd-primary) 22%, rgba(255, 255, 255, 0.22));
  --srd-liquid-border-hover: color-mix(in srgb, var(--srd-primary) 48%, rgba(255, 255, 255, 0.34));
  --srd-liquid-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    inset 0 -7px 16px rgba(0, 0, 0, 0.2),
    0 9px 22px rgba(0, 0, 0, 0.3);
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-player [data-testid="playback-controls"] button,
  [data-testid="action-bar-row"] button:not([role="combobox"])
) {
  -webkit-appearance: none !important;
  appearance: none !important;
  position: relative !important;
  isolation: isolate;
  overflow: hidden !important;
  display: grid !important;
  place-items: center !important;
  box-sizing: border-box !important;
  flex: 0 0 44px !important;
  width: 44px !important;
  min-width: 44px !important;
  height: 44px !important;
  min-height: 44px !important;
  padding: 0 !important;
  border: 1px solid var(--srd-liquid-border) !important;
  border-radius: 999px !important;
  color: color-mix(in srgb, var(--srd-primary) 12%, rgba(248, 250, 255, 0.9)) !important;
  background: var(--srd-liquid-control) !important;
  box-shadow: var(--srd-liquid-shadow) !important;
  -webkit-backdrop-filter: blur(24px) saturate(1.5) contrast(1.04) !important;
  backdrop-filter: blur(24px) saturate(1.5) contrast(1.04) !important;
  cursor: pointer !important;
  pointer-events: auto !important;
  touch-action: manipulation;
  -webkit-app-region: no-drag;
  transform: translateZ(0) !important;
  transition:
    color 170ms ease,
    border-color 170ms ease,
    background 170ms ease,
    box-shadow 170ms ease,
    transform 170ms cubic-bezier(0.2, 0.75, 0.25, 1) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-player [data-testid="playback-controls"] button,
  [data-testid="action-bar-row"] button:not([role="combobox"])
)::after {
  content: "";
  position: absolute;
  z-index: 0;
  inset: 1px 4px auto;
  height: 42%;
  border-radius: 999px 999px 55% 55%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.16), transparent);
  opacity: 0.72;
  pointer-events: none;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-player [data-testid="playback-controls"] button,
  [data-testid="action-bar-row"] button:not([role="combobox"])
) > * {
  position: relative !important;
  z-index: 2 !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-player [data-testid="playback-controls"] button,
  [data-testid="action-bar-row"] button:not([role="combobox"])
):is(:hover, :focus-visible) {
  border-color: var(--srd-liquid-border-hover) !important;
  color: white !important;
  background: var(--srd-liquid-control-hover) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 -8px 18px rgba(0, 0, 0, 0.24),
    0 0 0 1px color-mix(in srgb, var(--srd-primary) 18%, transparent),
    0 12px 28px rgba(0, 0, 0, 0.38) !important;
  outline: none !important;
  transform: translateY(-2px) scale(1.025) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-player [data-testid="playback-controls"] button,
  [data-testid="action-bar-row"] button:not([role="combobox"])
):active {
  box-shadow:
    inset 0 2px 8px rgba(0, 0, 0, 0.42),
    inset 0 1px rgba(255, 255, 255, 0.08),
    0 5px 13px rgba(0, 0, 0, 0.28) !important;
  transform: translateY(0) scale(0.94) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-player [data-testid="playback-controls"] button,
  [data-testid="action-bar-row"] button:not([role="combobox"])
)[disabled] {
  cursor: default !important;
  filter: saturate(0.45) !important;
  opacity: 0.42 !important;
  transform: none !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body
  .srd-player [data-testid="playback-controls"] {
  gap: 7px !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body
  .srd-player [data-testid="playback-controls"] button {
  flex: 0 0 40px !important;
  width: 40px !important;
  min-width: 40px !important;
  height: 40px !important;
  min-height: 40px !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body
  .srd-player [data-testid="playback-controls"] [data-testid="play-button"] {
  flex: 0 0 46px !important;
  width: 46px !important;
  min-width: 46px !important;
  height: 46px !important;
  min-height: 46px !important;
  border-color: color-mix(in srgb, var(--srd-primary) 48%, rgba(255, 255, 255, 0.32)) !important;
  color: white !important;
  background:
    radial-gradient(circle at 28% 15%, rgba(255, 255, 255, 0.23), transparent 34%),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--srd-primary) 32%, rgba(16, 19, 29, 0.94)),
      color-mix(in srgb, var(--srd-secondary) 13%, rgba(3, 5, 11, 0.98)) 76%
    ) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.23),
    inset 0 -9px 18px rgba(0, 0, 0, 0.25),
    0 0 0 1px color-mix(in srgb, var(--srd-primary) 14%, transparent),
    0 12px 30px color-mix(in srgb, var(--srd-primary) 20%, rgba(0, 0, 0, 0.44)) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body
  [data-testid="action-bar-row"] button[data-testid="play-button"] {
  flex: 0 0 52px !important;
  width: 52px !important;
  min-width: 52px !important;
  height: 52px !important;
  min-height: 52px !important;
  border-color: color-mix(in srgb, var(--srd-primary) 48%, rgba(255, 255, 255, 0.32)) !important;
  color: white !important;
  background:
    radial-gradient(circle at 28% 15%, rgba(255, 255, 255, 0.23), transparent 34%),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--srd-primary) 32%, rgba(16, 19, 29, 0.94)),
      color-mix(in srgb, var(--srd-secondary) 13%, rgba(3, 5, 11, 0.98)) 76%
    ) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.23),
    inset 0 -9px 18px rgba(0, 0, 0, 0.25),
    0 0 0 1px color-mix(in srgb, var(--srd-primary) 14%, transparent),
    0 12px 30px color-mix(in srgb, var(--srd-primary) 20%, rgba(0, 0, 0, 0.44)) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="action-bar-row"]
  button:not([role="combobox"])[aria-pressed="true"] {
  border-color: color-mix(in srgb, var(--srd-primary) 68%, white) !important;
  color: color-mix(in srgb, var(--srd-primary) 36%, white) !important;
  box-shadow:
    inset 0 1px rgba(255, 255, 255, 0.2),
    0 0 0 1px color-mix(in srgb, var(--srd-primary) 28%, transparent),
    0 10px 26px color-mix(in srgb, var(--srd-primary) 18%, rgba(0, 0, 0, 0.38)) !important;
}

/* Theme-aware futuristic caption controls. Native window click handlers stay untouched. */
html.srd-theme-active[data-srd-theme] body .srd-window-controls {
  position: relative !important;
  isolation: isolate;
  display: flex !important;
  align-items: center !important;
  gap: 3px !important;
  box-sizing: border-box !important;
  min-height: 42px !important;
  padding: 4px !important;
  overflow: hidden !important;
  border: 1px solid color-mix(in srgb, var(--srd-primary) 20%, rgba(255, 255, 255, 0.14)) !important;
  border-radius: 16px !important;
  background:
    radial-gradient(circle at 18% 0%, color-mix(in srgb, var(--srd-primary) 16%, transparent), transparent 44%),
    linear-gradient(150deg, rgba(15, 18, 28, 0.86), rgba(3, 5, 10, 0.94)) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    inset 0 -10px 22px rgba(0, 0, 0, 0.2),
    0 10px 28px rgba(0, 0, 0, 0.34) !important;
  -webkit-backdrop-filter: blur(26px) saturate(1.55) !important;
  backdrop-filter: blur(26px) saturate(1.55) !important;
}

html.srd-theme-active[data-srd-theme] body .srd-window-controls::before {
  content: "";
  position: absolute;
  z-index: 0;
  inset: 0 12px auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--srd-primary) 58%, white), transparent);
  opacity: 0.72;
  pointer-events: none;
}

html.srd-theme-active[data-srd-theme] body .srd-window-control {
  -webkit-appearance: none !important;
  appearance: none !important;
  position: relative !important;
  z-index: 2 !important;
  display: grid !important;
  place-items: center !important;
  box-sizing: border-box !important;
  width: 40px !important;
  min-width: 40px !important;
  height: 32px !important;
  min-height: 32px !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 1px solid transparent !important;
  border-radius: 11px !important;
  color: color-mix(in srgb, var(--srd-primary) 8%, rgba(244, 247, 255, 0.78)) !important;
  background: rgba(255, 255, 255, 0.025) !important;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.055) !important;
  -webkit-backdrop-filter: blur(18px) saturate(1.35) !important;
  backdrop-filter: blur(18px) saturate(1.35) !important;
  cursor: default !important;
  pointer-events: auto !important;
  touch-action: manipulation;
  -webkit-app-region: no-drag;
  transition:
    color 150ms ease,
    border-color 150ms ease,
    background 150ms ease,
    box-shadow 150ms ease,
    transform 150ms cubic-bezier(0.2, 0.75, 0.25, 1) !important;
}

html.srd-theme-active[data-srd-theme] body .srd-window-control:is(:hover, :focus-visible) {
  border-color: color-mix(in srgb, var(--srd-primary) 42%, rgba(255, 255, 255, 0.2)) !important;
  color: white !important;
  background:
    radial-gradient(circle at 30% 10%, rgba(255, 255, 255, 0.14), transparent 44%),
    color-mix(in srgb, var(--srd-primary) 14%, rgba(255, 255, 255, 0.045)) !important;
  box-shadow:
    inset 0 1px rgba(255, 255, 255, 0.13),
    0 0 0 1px color-mix(in srgb, var(--srd-primary) 12%, transparent),
    0 7px 18px rgba(0, 0, 0, 0.3) !important;
  outline: none !important;
  transform: translateY(-1px) !important;
}

html.srd-theme-active[data-srd-theme] body .srd-window-control:focus-visible {
  box-shadow:
    inset 0 1px rgba(255, 255, 255, 0.13),
    0 0 0 2px color-mix(in srgb, var(--srd-primary) 54%, transparent),
    0 7px 18px rgba(0, 0, 0, 0.3) !important;
}

html.srd-theme-active[data-srd-theme] body .srd-window-control:active {
  background: color-mix(in srgb, var(--srd-primary) 10%, rgba(0, 0, 0, 0.34)) !important;
  box-shadow: inset 0 2px 7px rgba(0, 0, 0, 0.38) !important;
  transform: translateY(0) scale(0.93) !important;
}

html.srd-theme-active[data-srd-theme] body .srd-window-control[data-srd-window-action="close"]:hover {
  border-color: color-mix(in srgb, #ff5b70 70%, var(--srd-primary)) !important;
  background:
    radial-gradient(circle at 30% 10%, rgba(255, 255, 255, 0.18), transparent 42%),
    color-mix(in srgb, #d92e49 78%, var(--srd-primary)) !important;
  box-shadow:
    inset 0 1px rgba(255, 255, 255, 0.18),
    0 0 18px color-mix(in srgb, #e43d58 28%, transparent) !important;
}

@media (prefers-reduced-motion: reduce) {
  html.srd-theme-active[data-srd-theme] body :is(
    .srd-player [data-testid="playback-controls"] button,
    [data-testid="action-bar-row"] button:not([role="combobox"]),
    .srd-window-control
  ) {
    transition: none !important;
  }
}
`;

  // web/src/layout-fixes.css
  var layout_fixes_default = `/* Remixify: nach core.css laden. Die Nummern entsprechen den acht Grafik-Fixes.
   Nur das aktive Studio-Layout; Farben und Blur bleiben an die Einstellungen gekoppelt. */

/* 8. Design-System: 16/12/8 px Radien, 8/16/24 px Abst\xE4nde, ein Glas-Material. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] {
  --srd-radius-panel: 16px;
  --srd-radius-card: 12px;
  --srd-radius-button: 8px;
  --srd-space-1: 8px;
  --srd-space-2: 16px;
  --srd-space-3: 24px;
  --srd-muted: #b8c2d1;
  --srd-text: #f4f7fc;
  --srd-surface: #101923;
  /* Clarity controls opacity; brightness controls the pale tint; blur stays independent. */
  --srd-glass-surface: rgb(26 36 54 / var(--srd-material-alpha, var(--srd-glass-shell-alpha, 0.235)));
  --srd-glass-fill: linear-gradient(145deg, rgb(230 241 255 / var(--srd-glass-tint-alpha, 0.13)), rgb(230 241 255 / 3%) 65%), var(--srd-glass-surface);
  --srd-glass-control-fill: linear-gradient(145deg, rgb(240 247 255 / var(--srd-glass-tint-alpha, 0.13)), rgb(240 247 255 / 4%)), rgb(30 40 58 / var(--srd-glass-control-alpha, 0.083));
  --srd-caption-width: 138px;
  --srd-readable-accent: color-mix(in srgb, var(--srd-secondary) 55%, white);
  --text-base: var(--srd-text) !important;
  --text-subdued: var(--srd-muted) !important;
  --essential-subdued: var(--srd-muted) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme][data-srd-density="compact"] {
  --srd-space-2: 12px;
  --srd-space-3: 20px;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-global-nav, .srd-left-sidebar, .srd-main-view, .srd-player-zone,
  [data-testid="home-page"] [data-testid="component-shelf"]
) {
  box-sizing: border-box !important;
  min-width: 0 !important;
  min-height: 0 !important;
  border-radius: var(--srd-radius-panel) !important;
  background: var(--srd-glass-fill) !important;
  -webkit-backdrop-filter: blur(var(--srd-glass-blur, 24px)) saturate(1.3) !important;
  backdrop-filter: blur(var(--srd-glass-blur, 24px)) saturate(1.3) !important;
}

/* 1. Die Kopfzeile belegt die ganze Breite. Das Cover beginnt erst darunter. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-app-grid {
  grid-template-areas:
    "global-nav global-nav global-nav"
    "left-sidebar main-view now-playing-bar" !important;
  grid-template-columns: min(var(--srd-library-width, 260px), 26vw) minmax(0, 1fr) clamp(280px, 24vw, 360px) !important;
  grid-template-rows: 64px minmax(0, 1fr) !important;
  gap: var(--srd-space-2) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-global-nav {
  --srd-material-alpha: var(--srd-glass-nav-alpha);
  position: relative !important;
  z-index: 400 !important;
  isolation: isolate;
  overflow: visible !important;
  contain: none !important;
  align-items: center !important;
  padding-inline-end: var(--srd-space-1) !important;
}

/* Caption controls sit in their own panel with a 16 px gap from navigation. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme]:is([data-srd-caption="dom"], [data-srd-caption="native"]) body .srd-global-nav {
  margin-inline-end: calc(var(--srd-caption-width) + var(--srd-space-2)) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme][data-srd-caption="native"] body .srd-app-grid {
  padding-top: 0 !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme][data-srd-caption="native"] body .srd-global-nav {
  margin-inline-start: 48px !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-window-controls {
  position: absolute !important;
  inset: -1px calc(-1 * (var(--srd-caption-width) + var(--srd-space-2)) - 1px) auto auto !important;
  flex: 0 0 auto !important;
  align-self: center;
  justify-content: center !important;
  box-sizing: border-box !important;
  width: var(--srd-caption-width) !important;
  height: 64px !important;
  margin: 0 !important;
  border-radius: var(--srd-radius-card) !important;
  background: var(--srd-glass-fill) !important;
  -webkit-backdrop-filter: blur(var(--srd-glass-blur, 24px)) !important;
  backdrop-filter: blur(var(--srd-glass-blur, 24px)) !important;
  -webkit-app-region: no-drag;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-caption-owner {
  position: static !important;
  transform: none !important;
  filter: none !important;
  backdrop-filter: none !important;
}

/* Native Windows hit targets and menus keep their OS handlers. These frames are decorative. */
.srd-native-caption-frame, .srd-native-menu-frame { display: none; }

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme][data-srd-caption="native"] body :is(.srd-native-caption-frame, .srd-native-menu-frame) {
  position: fixed;
  z-index: 1000;
  display: block;
  top: 0;
  right: 0;
  width: var(--srd-caption-width);
  height: 64px;
  box-sizing: border-box;
  border: 1px solid var(--srd-milk-border);
  border-radius: var(--srd-radius-panel);
  background: var(--srd-glass-fill);
  -webkit-backdrop-filter: blur(var(--srd-glass-blur)) brightness(1.5);
  backdrop-filter: blur(var(--srd-glass-blur)) brightness(1.5);
  box-shadow: inset 0 1px rgb(255 255 255 / 18%), 0 8px 24px rgb(0 0 0 / 12%);
  pointer-events: none;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme][data-srd-caption="native"] body .srd-native-menu-frame {
  left: 0;
  right: auto;
  width: 48px;
}

/* Search creates a stacking context ABOVE the feed; no ancestor clips the dropdown. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-search-layer {
  overflow: visible !important;
  contain: none !important;
}

@media (min-width: 1121px) {
  html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-global-nav .srd-nav-search-section {
    position: relative !important;
    inset: auto !important;
    transform: none !important;
    flex: 1 1 0% !important;
    min-width: 0 !important;
    margin: 0 !important;
    justify-content: center !important;
    z-index: 1;
  }
}

/* Keep Spotify's responsive search section in normal flow so its ResizeObserver
   measures the available navigation width instead of collapsing it to an icon. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-global-nav form[role="search"],
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-global-nav .srd-search-layer:has(> [data-testid="search-input"]) {
  width: 100% !important;
  min-width: 0 !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-global-nav [data-testid="search-input"] {
  width: 100% !important;
  color: var(--srd-text) !important;
  caret-color: var(--srd-text) !important;
  padding-inline: 48px !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-global-nav [data-testid="search-input"]::placeholder {
  color: var(--srd-muted) !important;
  opacity: 1 !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-search-popover {
  z-index: 1000 !important;
  border: 1px solid var(--srd-milk-border) !important;
  border-radius: var(--srd-radius-panel) !important;
  background: linear-gradient(145deg, rgb(230 241 255 / var(--srd-glass-tint-alpha)), transparent), rgb(26 36 54 / var(--srd-glass-modal-alpha, 0.424)) !important;
  backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.3) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(.srd-main-view, .srd-left-sidebar, .srd-player-zone) {
  position: relative !important;
  z-index: 0;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-window-control, .srd-settings-button, .srd-update-button
) {
  border-radius: var(--srd-radius-button) !important;
  color: var(--srd-text) !important;
  background: var(--srd-glass-control-fill) !important;
  -webkit-backdrop-filter: blur(var(--srd-glass-blur)) !important;
  backdrop-filter: blur(var(--srd-glass-blur)) !important;
}

/* 2. Nur die Hintergrund-Layer aus Spotifys Home-CSS ersetzen, nie Inhalte maskieren.
   Der Theme-Akzent verhindert fremde Orange-T\xF6ne; Cover-Farben werden nicht erzwungen. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"] {
  isolation: isolate;
  background: linear-gradient(180deg, color-mix(in srgb, var(--srd-primary) 20%, transparent), transparent 340px) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-main-view :is(
  .Q7ciR0kAsukiCprc, /* dwp-home-header.css: dekorativer Home-Hintergrund */
  .kRkvH3JcI5sYgH6J  /* dwp-home-chips-row.css: Hintergrund der klebenden Filter */
) {
  background: linear-gradient(180deg, color-mix(in srgb, var(--srd-primary) 14%, transparent), transparent) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-main-view .kRkvH3JcI5sYgH6J {
  bottom: calc(-1 * var(--srd-space-3)) !important;
  pointer-events: none;
}

/* 3. Auch Spotifys neue verschachtelte Home-Shelves verwenden 24 px Zeilenabstand. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"] :is(
  .contentSpacing:has([data-testid="component-shelf"]), .dqY3Tbw0iFQKYoz5
) {
  gap: var(--srd-space-3) !important;
  --shelf-gap-vertical: var(--srd-space-3);
  --shelf-gap-horizontal: var(--srd-space-3);
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"] [data-testid="component-shelf"] {
  margin: 0 !important;
  padding: var(--srd-space-3) !important;
  height: auto !important;
  max-height: none !important;
  --shelf-fixed-max-height: none;
  --extracted-text-subdued: var(--srd-muted);
  --srd-material-alpha: var(--srd-glass-shelf-alpha);
}

/* Neutralize Spotify's negative carousel bleed so first/last cards retain their gutter. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"] :is(
  [data-testid="component-shelf"], [data-testid="component-shelf"] [data-shelf="carousel"]
) {
  --shelf-carousel-margin-start-mul: 0 !important;
  --shelf-carousel-margin-end-mul: 0 !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"] [data-testid="rich-title-row-shelf-header"] {
  padding-inline: 0 !important;
  margin-bottom: var(--srd-space-2) !important;
}

/* 4. Echte horizontale Scrollfl\xE4che mit sichtbarer, schmaler Scrollbar.
   Keine Maske auf Text oder Fokusrahmen; die letzte Karte ist vollst\xE4ndig erreichbar. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"]
  [data-testid="component-shelf"] [data-testid="carousel-scroller"] {
  box-sizing: border-box !important;
  min-width: 0 !important;
  max-width: 100% !important;
  width: 100% !important;
  margin-inline: 0 !important;
  padding: var(--srd-space-1) var(--srd-space-1) var(--srd-space-2) !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  scroll-padding-inline: var(--srd-space-1) !important;
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
  scrollbar-color: var(--srd-muted) transparent;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"]
  [data-testid="component-shelf"] :is([role="grid"], [data-testid="grid-container"]) {
  column-gap: var(--srd-space-2) !important;
  row-gap: var(--srd-space-2) !important;
  padding-inline: 0 !important;
  margin-inline: 0 !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"]
  [data-testid="component-shelf"] [role="row"] {
  margin-inline: 0 !important;
  column-gap: var(--srd-space-2) !important;
}

/* 4 + 5. Keine festen 276 px: Bild und zwei Textzeilen d\xFCrfen die H\xF6he bestimmen. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"]
  [data-testid="component-shelf"] [role="grid"] > [role="row"]:has(.e-10451-card),
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"]
  [data-testid="component-shelf"] [role="grid"] > [role="row"]:has(.e-10451-card) > [role="gridcell"] > [role="presentation"] {
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  align-items: stretch !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"]
  [data-testid="component-shelf"] :is(.e-10451-card, .main-card-card, [data-testid="card-container"]) {
  box-sizing: border-box !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  min-width: 0 !important;
  max-width: 214px !important;
  width: 100% !important;
  padding: var(--srd-space-2) !important;
  gap: var(--srd-space-1) !important;
  overflow: visible !important;
  border-radius: var(--srd-radius-card) !important;
  scroll-snap-align: start;
  background: var(--srd-glass-control-fill) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"]
  [data-testid="component-shelf"] :is(.e-10451-card__main, .e-10451-card__column) {
  flex: 0 0 auto !important;
  min-width: 0 !important;
  min-height: min-content !important;
  max-width: 100% !important;
  overflow: visible !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"]
  [data-testid="component-shelf"] :is(.e-10451-card, .main-card-card, [data-testid="card-container"])
  :is([data-encore-id="cardTitle"], [data-testid="card-title"], .e-10451-card-title,
      [data-encore-id="cardSubtitle"], .main-card-cardDescription) {
  --encore-line-clamp: 2 !important;
  display: -webkit-box !important;
  -webkit-box-orient: vertical !important;
  -webkit-line-clamp: 2 !important;
  min-width: 0 !important;
  max-width: 100% !important;
  max-height: none !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: normal !important;
  overflow-wrap: anywhere;
  line-height: 1.45 !important;
  padding-bottom: 2px;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"]
  [data-testid="component-shelf"] :is([data-encore-id="cardSubtitle"], .main-card-cardDescription),
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player [data-testid="context-item-info-subtitles"] {
  color: var(--srd-muted) !important;
  opacity: 1 !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"]
  [data-testid="component-shelf"] [data-encore-id="cardSubtitle"] :is(.e-10451-line-clamp, a, span) {
  --encore-line-clamp: 2 !important;
  max-height: none !important;
  white-space: normal !important;
  color: inherit !important;
}

/* 5. Bildfl\xE4che bleibt quadratisch und schrumpft nicht unter Textdruck.
   Hintergrund dient als Fallback; src/srcset, background-image und Lazy Loading bleiben erhalten. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="component-shelf"] :is(
  .e-10451-card > .e-10451-image__container, .main-card-imageContainer
) {
  flex-shrink: 0 !important;
  width: 100% !important;
  height: auto !important;
  aspect-ratio: 1;
  overflow: hidden !important;
  border-radius: var(--srd-radius-card) !important;
  background-color: var(--srd-surface) !important;
  background-image: linear-gradient(135deg, color-mix(in srgb, var(--srd-primary) 28%, var(--srd-surface)), var(--srd-surface));
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="component-shelf"] :is(
  img[data-testid="card-image"], .e-10451-image__container > img, .main-card-imageContainer > img
) {
  display: block;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  border-radius: var(--srd-radius-card) !important;
}

/* Native Platzhalter-Icons nutzen dieselbe lesbare Farbe; Ladezust\xE4nde nicht vort\xE4uschen. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .e-10451-image__placeholder-icon {
  color: var(--srd-muted) !important;
}

/* Nur das zus\xE4tzliche Liked-Songs-Badge innerhalb des Covers versetzen. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="component-shelf"]
  :is(.e-10451-card, [data-testid="card-container"]):has(a[href$="/collection/tracks"])
  .e-10451-image__container :is(.e-10451-image__container, [data-testid="liked-songs-icon"]) {
  position: absolute !important;
  inset: auto auto var(--srd-space-1) var(--srd-space-1) !important;
  width: 40px !important;
  height: 40px !important;
  margin: 0 !important;
  border: 1px solid rgb(255 255 255 / 24%);
  border-radius: var(--srd-radius-button) !important;
  overflow: hidden !important;
  box-shadow: 0 3px 12px rgb(0 0 0 / 30%);
}

/* 6. Der Bibliotheks-Viewport scrollt; die letzte Zeile bekommt 24 px Auslauf. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-left-sidebar > nav {
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  padding-top: 64px !important;
  padding-bottom: var(--srd-space-1) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-left-sidebar .YourLibraryX {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  overflow: hidden !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-left-sidebar :is(
  .main-yourLibraryX-library, .os-viewport, [data-testid="library-list"]
) {
  min-height: 0 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--srd-muted) transparent;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-left-sidebar :is(
  [role="grid"], [data-testid="library-list"]
) {
  box-sizing: border-box !important;
  padding-bottom: var(--srd-space-3) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-left-sidebar :is(
  [role="row"], .main-yourLibraryX-listItem
) {
  min-height: 64px !important;
  gap: var(--srd-space-1) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-left-sidebar :is(
  .e-10451-image__container, .e-10451-image, [data-testid="cover-art-image"],
  [data-testid="playlist-image"], .main-yourLibraryX-listItem img
) {
  box-sizing: border-box !important;
  flex: 0 0 48px !important;
  width: 48px !important;
  min-width: 48px !important;
  height: 48px !important;
  min-height: 48px !important;
  object-fit: cover !important;
  border-radius: var(--srd-radius-button) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-left-sidebar :is(
  .main-yourLibraryX-header, .main-yourLibraryX-headerContent
) {
  display: flex !important;
  align-items: center !important;
  gap: var(--srd-space-1) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-left-sidebar :is(
  .main-yourLibraryX-header, .main-yourLibraryX-headerContent
) button {
  display: grid !important;
  place-items: center !important;
  flex-shrink: 0;
  min-width: 32px;
  min-height: 32px;
  border-radius: var(--srd-radius-button) !important;
}

/* 7. Cover und Controls flie\xDFen in einer Karte. Kein absoluter Footer mit Leerraum. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player-zone {
  --srd-material-alpha: var(--srd-glass-player-alpha);
  display: flex !important;
  flex-direction: column !important;
  align-self: start;
  height: auto !important;
  max-height: 100% !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  scrollbar-width: thin;
  scrollbar-color: var(--srd-muted) transparent;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player-zone::before,
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player-zone::after,
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player-artwork::after {
  display: none !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player-artwork {
  position: relative !important;
  inset: auto !important;
  flex: 0 0 auto;
  width: 100% !important;
  height: auto !important;
  aspect-ratio: 1;
  border-radius: var(--srd-radius-panel) var(--srd-radius-panel) 0 0;
  -webkit-mask-image: linear-gradient(180deg, black 65%, transparent 100%);
  mask-image: linear-gradient(180deg, black 65%, transparent 100%);
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player-artwork img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player-artwork--empty img {
  visibility: hidden;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player-artwork--empty {
  display: none !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player {
  position: relative !important;
  inset: auto !important;
  flex: 0 0 auto !important;
  min-height: 0 !important;
  padding: var(--srd-space-2) !important;
  gap: var(--srd-space-2) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player :is(
  [data-testid="now-playing-widget"], [data-testid="now-playing-header"]
) {
  align-items: center !important;
  gap: var(--srd-space-1) !important;
  min-width: 0 !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player
  [data-testid="now-playing-widget"] > :last-child:has(button) {
  display: flex !important;
  align-items: center !important;
  gap: var(--srd-space-1) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player :is(
  [data-testid="general-controls"], [class*="nowPlayingBar-right"]
) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-wrap: wrap;
  gap: var(--srd-space-1) !important;
  opacity: 1 !important;
  color: var(--srd-muted) !important;
}

/* Spotify's current transport is general-controls, with balanced left/right groups. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player
  [data-testid="player-controls"] [data-testid="general-controls"] {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) 46px minmax(0, 1fr) !important;
  align-items: center !important;
  width: 100% !important;
  gap: var(--srd-space-1) !important;
  margin: 0 0 var(--srd-space-1) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player
  [data-testid="player-controls"] [data-testid="general-controls"] > :is(:first-child, :last-child) {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  min-width: 0 !important;
  gap: var(--srd-space-1) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player
  [data-testid="player-controls"] [data-testid="general-controls"] > :last-child {
  justify-content: flex-start !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player
  [data-testid="player-controls"] [data-testid="general-controls"] button {
  display: grid !important;
  place-items: center !important;
  padding: 0 !important;
  margin: 0 !important;
  color: var(--srd-text) !important;
  background: var(--srd-glass-control-fill) !important;
  backdrop-filter: blur(var(--srd-glass-blur)) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player
  [data-testid="player-controls"] [data-testid="control-button-playpause"] {
  width: 46px !important;
  min-width: 46px !important;
  height: 46px !important;
  min-height: 46px !important;
  border-radius: 50% !important;
  justify-self: center !important;
  color: var(--srd-text) !important;
  background: var(--srd-glass-control-fill) !important;
  border: 1px solid var(--srd-readable-accent) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / 25%), 0 5px 20px color-mix(in srgb, var(--srd-primary) 24%, transparent) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player
  [data-testid="control-button-playpause"] > span {
  display: grid !important;
  place-items: center !important;
  width: 100% !important;
  height: 100% !important;
  padding: 0 !important;
  background: transparent !important;
  color: inherit !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player
  [data-testid="control-button-playpause"] svg {
  display: block;
  width: 20px;
  height: 20px;
  margin: 0 !important;
  color: var(--srd-text) !important;
  fill: currentColor !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-player [data-testid="control-button-playpause"],
  [data-testid="action-bar-row"] [data-testid="play-button"]
) :is(span, svg, path) {
  color: var(--srd-text) !important;
  fill: currentColor !important;
}

/* Neutralize Spotify's opaque card hover and carousel edge scrims. */
/* Recent Spotify builds draw the black hover surface in ::after, above the
   themed background. Keep its hit target/focus outline and clear only the fill. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="component-shelf"] :is(.e-10451-card, .main-card-card, [data-testid="card-container"])::after {
  background: transparent !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="component-shelf"] :is(.e-10451-card, .main-card-card, [data-testid="card-container"]) {
  transition: transform 180ms cubic-bezier(0.2, 0.7, 0.25, 1), border-color 180ms ease, box-shadow 180ms ease !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"]
  [data-testid="component-shelf"] :is(.e-10451-card, .main-card-card, [data-testid="card-container"]):is(:hover, :focus-within) {
  background: var(--srd-glass-control-fill) !important;
  border-color: color-mix(in srgb, var(--srd-secondary) 35%, rgb(255 255 255 / 26%)) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / 22%), 0 8px 20px rgb(0 0 0 / 16%) !important;
  transform: translateY(-2px) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="component-shelf"] [data-testid="play-button"] {
  background: transparent !important;
  color: var(--srd-text) !important;
  border: 0 !important;
  box-shadow: none !important;
  transition: opacity 180ms ease, transform 180ms ease !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="component-shelf"] [data-testid="play-button"] > span {
  background: var(--srd-glass-control-fill) !important;
  color: var(--srd-text) !important;
  border: 1px solid var(--srd-readable-accent) !important;
  backdrop-filter: blur(var(--srd-glass-blur)) !important;
  box-shadow: 0 4px 16px rgb(0 0 0 / 18%) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="component-shelf"] [data-testid="play-button"] :is(span, svg, path) {
  color: var(--srd-text) !important;
  fill: currentColor !important;
}

.srd-update-status {
  display: grid;
  gap: 12px;
  margin: 16px 24px 24px;
  padding: 16px;
  border: 1px solid var(--srd-border);
  border-radius: 12px;
  background: rgb(255 255 255 / 5%);
}

.srd-update-status-label { color: var(--srd-text); overflow-wrap: anywhere; }
.srd-update-status--error { border-color: #fb7185; }
.srd-update-progress { width: 100%; height: 8px; border: 0; border-radius: 8px; overflow: hidden; accent-color: var(--srd-secondary); }
.srd-update-progress::-webkit-progress-bar { background: rgb(255 255 255 / 12%); border-radius: 8px; }
.srd-update-progress::-webkit-progress-value { background: linear-gradient(90deg, var(--srd-primary), var(--srd-secondary)); border-radius: 8px; }

@media (prefers-reduced-motion: reduce) {
  html.srd-theme-active body [data-testid="component-shelf"] :is(.e-10451-card, [data-testid="play-button"]) {
    transition: none !important;
    transform: none !important;
  }
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="component-shelf"] {
  --carousel-start-chevron-gradient: transparent !important;
  --carousel-end-chevron-gradient: transparent !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="component-shelf"] :is(
  .e-10451-overflow-button, [class*="overflow-button"]
) {
  background: transparent !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme][data-srd-motion="off"] body
  [data-testid="component-shelf"] :is(.e-10451-card, .main-card-card, [data-testid="card-container"]):is(:hover, :focus-within) {
  transform: none !important;
}

/* Detail pages: a horizontal identity header and a full-width track collection.
   Spotify nests the toolbar and tracks together; keep that native structure. */
/* Spotify fades the sticky header background at the page top. Hide its duplicate
   title and play target there too, so they cannot cover the identity card. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-main-view:has([data-testid="playlist-page"], [data-testid="album-page"]) > [data-testid="topbar"]:has(> [style*="opacity: 0;"]) {
  opacity: 0 !important;
  pointer-events: none !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="topbar-content"] [data-testid="play-button"] > span {
  background: var(--srd-glass-control-fill) !important;
  border: 1px solid var(--srd-readable-accent) !important;
  color: var(--srd-text) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is([data-testid="playlist-page"], [data-testid="album-page"]) {
  display: block !important;
  box-sizing: border-box !important;
  width: 100% !important;
  min-width: 0 !important;
  padding: var(--srd-space-3) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is([data-testid="playlist-page"], [data-testid="album-page"]) > :first-child {
  position: relative !important;
  top: auto !important;
  width: 100% !important;
  height: auto !important;
  min-height: 0 !important;
  padding: var(--srd-space-3) !important;
  overflow: hidden !important;
  border: 1px solid var(--srd-glass-border) !important;
  border-radius: var(--srd-radius-panel) !important;
  background: var(--srd-glass-fill) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / 12%), 0 8px 24px rgb(0 0 0 / 12%) !important;
  backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.3) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is([data-testid="playlist-page"], [data-testid="album-page"]) > :first-child > .contentSpacing {
  position: relative;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: var(--srd-space-3) !important;
  width: 100% !important;
  min-height: 0 !important;
  height: auto !important;
  padding: 0 !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is([data-testid="playlist-page"], [data-testid="album-page"]) > :first-child > .contentSpacing > :empty { display: none !important; }

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is([data-testid="playlist-page"], [data-testid="album-page"]) > :first-child > .contentSpacing > :has([data-testid="playlist-image"], button[aria-label="View album artwork"]) {
  flex: 0 0 clamp(128px, 16vw, 208px) !important;
  width: clamp(128px, 16vw, 208px) !important;
  min-width: 0 !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is([data-testid="playlist-page"], [data-testid="album-page"]) > :first-child :is([data-testid="playlist-image"], button[aria-label="View album artwork"]) {
  display: block !important;
  width: 100% !important;
  height: auto !important;
  aspect-ratio: 1 !important;
  margin: 0 !important;
  overflow: hidden !important;
  border-radius: var(--srd-radius-card) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is([data-testid="playlist-page"], [data-testid="album-page"]) > :first-child :is([data-testid="playlist-image"], button[aria-label="View album artwork"]) img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is([data-testid="playlist-page"], [data-testid="album-page"]) > :first-child .contentSpacing > :last-child {
  flex: 1 1 0 !important;
  width: auto !important;
  min-width: 0 !important;
  padding: 0 !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="album-page"] > :first-child > .contentSpacing > button[aria-label="View album artwork"] {
  flex: 0 0 clamp(128px, 16vw, 208px) !important;
  width: clamp(128px, 16vw, 208px) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="playlist-page"] > :first-child .contentSpacing > :last-child > div:has(> span > div) > span > div {
  display: -webkit-box !important;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  white-space: normal !important;
  overflow: hidden !important;
  color: var(--srd-muted) !important;
  line-height: 1.5 !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is([data-testid="playlist-page"], [data-testid="album-page"]) > :first-child h1 {
  font-size: clamp(28px, 3.2vw, 48px) !important;
  line-height: 1.12 !important;
  white-space: normal !important;
  overflow-wrap: anywhere;
  margin-block: 8px 12px !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is([data-testid="playlist-page"], [data-testid="album-page"]) > div:has([data-testid="action-bar"]) {
  position: relative !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  margin-top: var(--srd-space-2) !important;
  padding: 0 !important;
}

/* Native row heights stay intact so virtualized tracks cannot overlap. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is([data-testid="playlist-page"], [data-testid="album-page"]) .contentSpacing {
  min-width: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

/* Keep a restrained cover tint without the native rectangular colour block. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is([data-testid="playlist-page"], [data-testid="album-page"]) > :first-child > :not(.contentSpacing) {
  opacity: 0.2;
  mask-image: linear-gradient(to bottom, black, transparent);
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is([data-testid="playlist-page"], [data-testid="album-page"]) [data-testid="tracklist-row"] {
  width: 100% !important;
  min-height: 0 !important;
  margin: 0 !important;
  border: 1px solid transparent !important;
  border-radius: var(--srd-radius-button) !important;
  background: transparent !important;
  box-shadow: none !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is([data-testid="playlist-page"], [data-testid="album-page"]) [data-testid="tracklist-row"]:is(:hover, :focus-within, [aria-selected="true"]) {
  background: rgb(255 255 255 / 9%) !important;
  border-color: var(--srd-glass-border) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is([data-testid="playlist-page"], [data-testid="album-page"]) [data-testid="action-bar"] {
  min-height: 0 !important;
  padding: var(--srd-space-2) !important;
  margin-bottom: var(--srd-space-2) !important;
  border-radius: var(--srd-radius-panel) !important;
  border: 1px solid var(--srd-glass-border) !important;
  background: var(--srd-glass-fill) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / 12%) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="action-bar-row"] {
  display: flex !important;
  align-items: center !important;
  flex-wrap: wrap !important;
  gap: 12px !important;
  min-width: 0 !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="action-bar-row"] button:not([role="combobox"]) {
  width: 40px !important;
  min-width: 40px !important;
  height: 40px !important;
  min-height: 40px !important;
  padding: 0 !important;
  color: var(--srd-text) !important;
  border: 1px solid var(--srd-glass-border) !important;
  background: var(--srd-glass-control-fill) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / 12%) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="action-bar-row"] button[data-testid="play-button"] {
  width: 48px !important;
  min-width: 48px !important;
  height: 48px !important;
  min-height: 48px !important;
  border-color: var(--srd-readable-accent) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="action-bar-row"] button > span {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent !important;
  transform: none !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="action-bar-row"] button svg {
  width: 20px !important;
  height: 20px !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="action-bar-row"] [data-testid="watch-feed-entity-button"] {
  border-radius: var(--srd-radius-button) !important;
  overflow: hidden !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="action-bar-row"] [data-testid="watch-feed-entity-button"] img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}

/* Restore the native save/download SVGs instead of font-dependent pseudo-icons. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="action-bar-row"] :is([data-testid="add-button"], button[aria-label^="Download" i])::before { content: none !important; }
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="action-bar-row"] :is([data-testid="add-button"], button[aria-label^="Download" i]) svg { display: block !important; }

@media (max-width: 700px) {
  html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is([data-testid="playlist-page"], [data-testid="album-page"]) { padding: var(--srd-space-2) !important; }
  html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is([data-testid="playlist-page"], [data-testid="album-page"]) > :first-child > .contentSpacing { flex-direction: column !important; align-items: flex-start !important; }
}

/* Keep the accent states after applying the shared glass button material. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player
  [data-testid="player-controls"] [data-testid="general-controls"] :is(
    [data-testid="control-button-shuffle"], [data-testid="control-button-repeat"]
  ):is([aria-checked="true"], [aria-checked="mixed"], [aria-pressed="true"]) {
  color: var(--srd-readable-accent) !important;
  border-color: currentColor !important;
}

/* Helle inaktive Symbole statt multiplizierter Opacity; Aktivzustand bleibt eindeutig. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player :is(
  [data-testid="control-button-shuffle"], [data-testid="control-button-repeat"]
) {
  opacity: 1 !important;
  color: var(--srd-muted) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player :is(
  [data-testid="control-button-shuffle"], [data-testid="control-button-repeat"]
):is([aria-checked="true"], [aria-checked="mixed"], [aria-pressed="true"], [data-active="true"]) {
  color: var(--srd-readable-accent) !important;
  border-color: currentColor !important;
  background: color-mix(in srgb, var(--srd-secondary) 20%, var(--srd-surface)) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player :is(
  [data-testid="control-button-shuffle"], [data-testid="control-button-repeat"]
):is(:disabled, [aria-disabled="true"]) {
  opacity: 0.55 !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player :is(
  .playback-bar, :has(> [data-testid="playback-position"]),
  .main-volumeBar-volumeBar, [data-testid="volume-bar"]
) {
  display: flex !important;
  align-items: center !important;
  gap: var(--srd-space-1) !important;
  min-width: 0 !important;
  min-height: 24px;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player
  :has(> [data-testid="playback-position"]) > :has([data-testid="playback-progressbar"]) {
  flex: 1 1 auto;
  min-width: 0;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player :is(
  [data-testid="playback-position"], [data-testid="playback-duration"]
) {
  flex: 0 0 auto;
  width: auto !important;
  color: var(--srd-muted) !important;
  font-size: 11px;
  line-height: 1.5;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player :is(
  .main-volumeBar-volumeBar, [data-testid="volume-bar"]
) {
  flex: 1 1 96px;
  max-width: 128px;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player [data-testid="progress-bar-background"] {
  height: 4px !important;
  border-radius: 999px !important;
  background: rgb(184 194 209 / 30%) !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player input[type="range"] {
  margin: 0;
  min-width: 0;
  accent-color: var(--srd-readable-accent);
}

/* 8. Fokus bleibt sichtbar; Scrollbars passen auch auf \xE4lteren Chromium-Versionen. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-player, .srd-left-sidebar, [data-testid="component-shelf"]
) :is(button, a, [role="slider"]):focus-visible {
  outline: 2px solid var(--srd-readable-accent) !important;
  outline-offset: 2px;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-left-sidebar *, .srd-player-zone, [data-testid="component-shelf"] [data-testid="carousel-scroller"]
)::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(
  .srd-left-sidebar *, .srd-player-zone, [data-testid="component-shelf"] [data-testid="carousel-scroller"]
)::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: var(--srd-muted);
}

/* Kleine Fenster: Home-Shelves einspaltig, Player im normalen Fluss unter dem Inhalt. */
@container (max-width: 340px) {
  html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player
    [data-testid="player-controls"] [data-testid="general-controls"] {
    grid-template-columns: minmax(0, 1fr) 42px minmax(0, 1fr) !important;
    gap: 6px !important;
  }

  html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player
    [data-testid="player-controls"] [data-testid="general-controls"] > :is(:first-child, :last-child) {
    gap: 6px !important;
  }

  html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player
    [data-testid="player-controls"] [data-testid="general-controls"] button {
    width: 32px !important;
    min-width: 32px !important;
    height: 32px !important;
    min-height: 32px !important;
  }

  html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player
    [data-testid="player-controls"] [data-testid="general-controls"] [data-testid="control-button-playpause"] {
    width: 42px !important;
    min-width: 42px !important;
    height: 42px !important;
    min-height: 42px !important;
  }
}

@media (max-width: 1120px) {
  html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-app-grid {
    grid-template-areas: "global-nav global-nav" "left-sidebar main-view" "now-playing-bar now-playing-bar" !important;
    grid-template-columns: min(var(--srd-library-width, 220px), 30vw) minmax(0, 1fr) !important;
    grid-template-rows: 64px minmax(0, 1fr) auto !important;
  }

  html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body [data-testid="home-page"] > .contentSpacing {
    grid-template-columns: minmax(0, 1fr) !important;
    padding-inline: var(--srd-space-2) !important;
  }

  html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player-zone {
    width: 100%;
    max-height: 40vh !important;
  }

  html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player-artwork {
    display: none !important;
  }

  html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player {
    display: flex !important;
    min-width: 0 !important;
  }
}
`;

  // web/src/desktop.css
  var desktop_default = `/* Desktop chrome: one outer gutter, custom SVGs, separate button hit targets. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-app-grid {
  padding: 16px !important;
  gap: 16px !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-shell-overlay { grid-column: 1 / -1 !important; }

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme][data-srd-caption="custom"] body .srd-global-nav {
  --srd-caption-width: 136px;
  margin-inline-start: 64px !important;
  margin-inline-end: 152px !important;
  height: 64px !important;
}

.srd-custom-caption, .srd-custom-menu, .srd-desktop-menu, .srd-queue-panel { display: none; }

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(.srd-custom-caption, .srd-custom-menu) {
  position: fixed;
  top: 16px;
  height: 64px;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px;
  background: transparent;
  border: 0;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-app-region: no-drag;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-custom-caption { right: 16px; width: 136px; }
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-custom-menu { left: 16px; width: 48px; }

/* Remove the old decorative slabs, including the Windows fallback. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(.srd-native-caption-frame, .srd-native-menu-frame) { display: none !important; }

.srd-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid rgb(230 241 255 / 18%);
  border-radius: 10px;
  background: rgb(230 241 255 / 7%);
  color: var(--srd-text, #f4f7fc);
  cursor: pointer;
  -webkit-app-region: no-drag;
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
}

.srd-icon-button:hover { background: color-mix(in srgb, var(--srd-secondary) 22%, rgb(230 241 255 / 10%)); border-color: var(--srd-readable-accent); }
.srd-icon-button:active { transform: scale(.94); }
.srd-icon-button:focus-visible, .srd-queue-track:focus-visible { outline: 2px solid var(--srd-readable-accent); outline-offset: 2px; }
.srd-icon-button:disabled { opacity: .4; cursor: default; transform: none; }
.srd-custom-caption [data-srd-window-action="minimize"] { color: var(--srd-readable-accent); }
.srd-custom-caption [data-srd-window-action="close"]:hover { background: #df5364; border-color: #ffb9c2; color: white; }

.srd-icon {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex: 0 0 20px !important;
  width: 20px !important;
  min-width: 0 !important;
  height: 20px !important;
  min-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: none !important;
  box-shadow: none !important;
  transform: none !important;
  pointer-events: none;
}

.srd-icon svg { width: 20px !important; height: 20px !important; margin: 0 !important; }
body button[data-srd-icon]:not(.srd-settings-button) > .srd-icon { display: none !important; }
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body button[data-srd-icon] > .srd-icon { display: inline-flex !important; }
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-icon :is(svg, path, rect, circle, ellipse),
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body :is(.srd-global-nav, .srd-player) button[data-srd-icon] > .srd-icon :is(svg, path, rect, circle, ellipse) {
  fill: none !important;
  stroke: currentColor !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-icon[data-icon="play"] path,
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player button[data-srd-icon="play"] > .srd-icon path { fill: currentColor !important; stroke: none !important; }
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-icon:is([data-icon="menu"], [data-icon="grip"]) circle { fill: currentColor !important; stroke: none !important; }
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body button[data-srd-icon] > :not(.srd-icon) { display: none !important; }
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body button[data-srd-icon] { display: inline-flex !important; align-items: center !important; justify-content: center !important; }

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-desktop-menu {
  position: fixed;
  left: 16px;
  top: 88px;
  z-index: 1300;
  display: grid;
  gap: 4px;
  min-width: 224px;
  padding: 8px;
  border: 1px solid var(--srd-glass-border);
  border-radius: 16px;
  background: var(--srd-glass-fill);
  backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.3);
  box-shadow: 0 12px 28px rgb(0 0 0 / 24%);
}

.srd-desktop-menu .srd-icon-button { justify-content: flex-start; width: 100%; padding-inline: 12px; border-color: transparent; background: transparent; }

/* Player and queue are separate glass surfaces; keep Spotify's DOM in place. */
html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player-zone:has(.srd-queue-panel) {
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  padding: 0 !important;
  isolation: isolate;
  gap: 0 !important;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-player-zone:has(.srd-queue-panel)::before {
  content: "";
  display: block !important;
  position: absolute !important;
  inset: 0 0 auto !important;
  height: var(--srd-now-playing-height, 640px) !important;
  z-index: -1 !important;
  opacity: 1 !important;
  border: 1px solid var(--srd-glass-border) !important;
  border-radius: 16px !important;
  background: var(--srd-glass-fill) !important;
  filter: none !important;
  backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.3) !important;
  transform: none !important;
  pointer-events: none;
}

html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-queue-panel {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  box-sizing: border-box;
  height: clamp(180px, calc(100dvh - var(--srd-now-playing-height, 640px) - 128px), 400px);
  min-height: 180px;
  min-width: 0;
  margin-top: 16px;
  padding: 12px;
  border: 1px solid var(--srd-glass-border);
  border-radius: 16px;
  background: var(--srd-glass-fill);
  backdrop-filter: blur(var(--srd-glass-blur)) saturate(1.3);
  box-shadow: inset 0 1px rgb(255 255 255 / 12%);
  color: var(--srd-text);
}

.srd-queue-tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; flex-shrink: 0; }
.srd-queue-tabs .srd-icon-button { width: 100%; font-size: 13px; font-weight: 650; }
.srd-queue-tabs [aria-selected="true"] { color: var(--srd-readable-accent); background: color-mix(in srgb, var(--srd-secondary) 17%, transparent); border-color: color-mix(in srgb, var(--srd-secondary) 55%, white); }
.srd-queue-hint { margin: 10px 2px 8px; color: var(--srd-muted); font-size: 11px; line-height: 1.5; flex-shrink: 0; }
.srd-queue-list { flex: 1 1 auto; min-height: 0; min-width: 0; margin: 0; padding: 2px 4px 8px 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; scrollbar-width: thin; scrollbar-color: var(--srd-readable-accent) transparent; list-style: none; }
.srd-queue-list::-webkit-scrollbar { width: 5px; }
.srd-queue-list::-webkit-scrollbar-thumb { background: var(--srd-readable-accent); border-radius: 8px; }
.srd-queue-row { display: flex; position: relative; align-items: center; min-width: 0; gap: 4px; margin: 0 0 4px; padding: 4px; border: 1px solid transparent; border-radius: 10px; }
.srd-queue-row:hover, .srd-queue-row:focus-within { background: rgb(240 247 255 / 7%); border-color: rgb(240 247 255 / 12%); }
.srd-queue-row--dragging { opacity: .45; }
.srd-queue-row[data-drop]::after { content: ""; position: absolute; left: 0; right: 0; height: 2px; border-radius: 2px; background: var(--srd-readable-accent); box-shadow: 0 0 8px color-mix(in srgb, var(--srd-secondary) 55%, transparent); }
.srd-queue-row[data-drop="before"]::after { top: -3px; }
.srd-queue-row[data-drop="after"]::after { bottom: -3px; }
.srd-queue-track { display: flex; align-items: center; flex: 1 1 0; min-width: 0; gap: 10px; padding: 0; border: 0; border-radius: 8px; background: none; color: var(--srd-text); text-align: left; cursor: pointer; font: inherit; }
.srd-queue-track:disabled { cursor: progress; }
.srd-queue-artwork { display: grid; place-items: center; position: relative; flex: 0 0 38px; width: 38px; height: 38px; overflow: hidden; border-radius: 8px; background: linear-gradient(135deg, color-mix(in srgb, var(--srd-primary) 30%, transparent), color-mix(in srgb, var(--srd-secondary) 24%, transparent)); color: var(--srd-muted); }
.srd-queue-artwork img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.srd-queue-copy { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.srd-queue-name, .srd-queue-artists { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; line-height: 1.4; }
.srd-queue-name { color: var(--srd-text); font-size: 12px; font-weight: 650; }
.srd-queue-artists { color: var(--srd-muted); font-size: 11px; }
.srd-queue-moves { display: flex; flex-direction: column; flex: 0 0 20px; }
.srd-queue-moves .srd-icon-button { width: 20px; height: 20px; border: 0; background: transparent; }
.srd-queue-moves .srd-icon, .srd-queue-drag .srd-icon { flex-basis: 16px !important; width: 16px !important; height: 16px !important; }
.srd-queue-drag { width: 24px; height: 36px; border: 0; background: transparent; cursor: grab; color: var(--srd-muted); }
.srd-queue-drag:active { cursor: grabbing; }
.srd-queue-status { margin: 4px 2px 0; color: var(--srd-readable-accent); font-size: 11px; line-height: 1.4; flex-shrink: 0; overflow-wrap: anywhere; }
.srd-queue-status:empty { display: none; }
.srd-queue-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px 8px; text-align: center; color: var(--srd-muted); font-size: 12px; }

@media (max-width: 1120px) {
  html.srd-theme-active[data-srd-layout="studio"][data-srd-theme] body .srd-queue-panel { height: 240px; }
}

@media (prefers-reduced-motion: reduce) {
  .srd-icon-button { transition: none; transform: none; }
}
`;

  // web/src/spotify-bridge.ts
  var cached;
  function fromRegistry(value) {
    if (!value || typeof value.resolveNoThrow !== "function") return;
    const registry = value;
    try {
      const player = registry.resolveNoThrow(Symbol.for("PlayerAPI"));
      if (typeof player?.getQueue !== "function" || typeof player.reorderQueue !== "function") return;
      return {
        player,
        history: registry.resolveNoThrow(Symbol.for("PlayHistoryAPI")),
        native: registry.resolveNoThrow(Symbol.for("NativeAPI"))
      };
    } catch {
      return;
    }
  }
  function desktopServices() {
    if (cached) return cached;
    const host = document.querySelector("#main-view") || document.querySelector(".Root");
    if (!host) return;
    const key = Object.keys(host).find((key2) => key2.startsWith("__reactFiber$"));
    if (!key) return;
    let fiber = host[key];
    while (fiber?.return) fiber = fiber.return;
    const pending2 = [fiber];
    for (let visited = 0; pending2.length && visited < 2e4; visited++) {
      const node = pending2.pop();
      if (!node) continue;
      for (let dependency = node.dependencies?.firstContext; dependency; dependency = dependency.next) {
        const services2 = fromRegistry(dependency.memoizedValue);
        if (services2) return cached = services2;
      }
      const services = fromRegistry(node.memoizedProps?.value);
      if (services) return cached = services;
      if (node.sibling) pending2.push(node.sibling);
      if (node.child) pending2.push(node.child);
    }
  }

  // web/src/icons.ts
  var paths = {
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
    fullscreen: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>'
  };
  function icon(name) {
    const span = document.createElement("span");
    span.className = "srd-icon";
    span.dataset.icon = name;
    span.ariaHidden = "true";
    span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
    return span;
  }
  function iconButton(name, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "srd-icon-button";
    button.ariaLabel = button.title = label;
    button.append(icon(name));
    return button;
  }

  // web/src/desktop-client.ts
  var connection;
  var pending;
  var checkedAt = 0;
  function desktopConnected() {
    return Boolean(connection);
  }
  function connectDesktop() {
    if (pending) return pending;
    if (Date.now() - checkedAt < 4e3) return Promise.resolve(Boolean(connection));
    pending = (async () => {
      const previous = Boolean(connection);
      try {
        const channel = window.__SpotifyRedesignBootstrap?.channelUrl || new URL(window.__SpotifyRedesignConfig?.localChannelUrl || "redesign/channel.json", document.baseURI).href;
        const url = new URL("desktop-control.json", channel);
        url.searchParams.set("t", String(Date.now()));
        const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(1500) });
        if (!response.ok) throw Error("Desktop connection is unavailable");
        const descriptor = await response.json();
        const endpoint = new URL(descriptor.url);
        if (endpoint.protocol !== "http:" || endpoint.hostname !== "127.0.0.1" || !/^[a-f0-9]{64}$/.test(descriptor.token)) throw Error("Invalid desktop connection");
        const health = await fetch(`${descriptor.url}/status`, { headers: { "X-Remixify-Token": descriptor.token }, signal: AbortSignal.timeout(1500) });
        if (!health.ok) throw Error("Desktop connection is unavailable");
        connection = descriptor;
      } catch {
        connection = void 0;
      } finally {
        checkedAt = Date.now();
        pending = void 0;
        if (previous !== Boolean(connection)) window.dispatchEvent(new Event("spotify-redesign:desktop-connected"));
      }
      return Boolean(connection);
    })();
    return pending;
  }
  async function desktopAction(action) {
    if (!await connectDesktop() || !connection) throw Error("Restart Remixify to reconnect the desktop controls.");
    const response = await fetch(`${connection.url}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Remixify-Token": connection.token },
      body: JSON.stringify({ action }),
      signal: AbortSignal.timeout(5e3)
    });
    if (!response.ok) throw Error((await response.text()).trim() || "Desktop action failed");
  }
  window.setInterval(() => {
    if (!document.hidden) void connectDesktop();
  }, 5e3);

  // web/src/desktop-chrome.ts
  var hiddenNative = false;
  var changingNative = false;
  var menu;
  var dismissMenu;
  function active() {
    return document.documentElement.matches('.srd-theme-active[data-srd-layout="studio"]');
  }
  function dispatchWindowAction(action) {
    void desktopAction(`window-${action}`).catch((error) => {
      console.warn("[Remixify] Window action failed", error);
      void desktopServices()?.native?.setWindowButtonsVisibility(true);
      hiddenNative = false;
      document.getElementById("srd-custom-caption")?.remove();
    });
  }
  function showMenu(button) {
    if (menu) {
      dismissMenu?.();
      return;
    }
    menu = document.createElement("div");
    menu.className = "srd-desktop-menu";
    menu.setAttribute("role", "menu");
    const close = () => {
      menu?.remove();
      menu = void 0;
      dismissMenu = void 0;
      document.removeEventListener("pointerdown", outside, true);
      button.ariaExpanded = "false";
      button.focus();
    };
    dismissMenu = close;
    const actions = [
      ["back", "Go back", () => document.querySelector('[data-testid="global-nav-bar"] button[aria-label="Go back"], [data-testid="global-nav-bar"] button[aria-label="Back"]')?.click()],
      ["forward", "Go forward", () => document.querySelector('[data-testid="global-nav-bar"] button[aria-label="Go forward"], [data-testid="global-nav-bar"] button[aria-label="Forward"]')?.click()],
      ["history", "Song history", () => document.querySelector("#srd-history-tab")?.click()],
      ["queue", "Up next", () => document.querySelector("#srd-queue-tab")?.click()],
      ["settings", "Remixify settings", () => window.SpotifyRedesign?.openSettings()]
    ];
    for (const [name, label, action] of actions) {
      const item = iconButton(name, label);
      item.setAttribute("role", "menuitem");
      item.append(document.createTextNode(label));
      item.addEventListener("click", () => {
        close();
        action();
      });
      menu.append(item);
    }
    menu.addEventListener("keydown", (event) => {
      const items = [...menu.querySelectorAll("button")];
      const index = items.indexOf(document.activeElement);
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
      }
    });
    document.body.append(menu);
    button.ariaExpanded = "true";
    menu.querySelector("button")?.focus();
    const outside = (event) => {
      if (menu?.contains(event.target) || button.contains(event.target)) return;
      close();
      document.removeEventListener("pointerdown", outside, true);
    };
    document.addEventListener("pointerdown", outside, true);
  }
  function syncDesktopChrome() {
    const services = desktopServices();
    const nativeSupported = Boolean(window.__SpotifyRedesignConfig?.desktopWindowControls && services?.native);
    if (nativeSupported && !desktopConnected()) void connectDesktop();
    const supported = nativeSupported && desktopConnected();
    const enabled = supported && active();
    if (nativeSupported && enabled !== hiddenNative && !changingNative) {
      changingNative = true;
      void services.native.setWindowButtonsVisibility(!enabled).then(() => {
        hiddenNative = enabled;
        changingNative = false;
        syncDesktopChrome();
      }).catch((error) => {
        changingNative = false;
        console.warn("[Remixify] Native title bar is still available", error);
      });
    }
    if (!enabled || !hiddenNative) {
      document.getElementById("srd-custom-caption")?.remove();
      document.getElementById("srd-custom-menu")?.remove();
      if (!enabled) dismissMenu?.();
      return false;
    }
    document.documentElement.dataset.srdCaption = "custom";
    document.querySelectorAll(".srd-native-caption-frame, .srd-native-menu-frame").forEach((n) => n.remove());
    if (!document.getElementById("srd-custom-caption")) {
      const controls = document.createElement("div");
      controls.id = "srd-custom-caption";
      controls.className = "srd-custom-caption";
      controls.setAttribute("role", "group");
      controls.ariaLabel = "Window controls";
      for (const [action, label] of [["minimize", "Minimize"], ["maximize", "Maximize or restore"], ["close", "Close window"]]) {
        const button2 = iconButton(action, label);
        button2.dataset.srdWindowAction = action;
        button2.addEventListener("click", () => dispatchWindowAction(action));
        controls.append(button2);
      }
      document.body.append(controls);
      const menuHost = document.createElement("div");
      menuHost.id = "srd-custom-menu";
      menuHost.className = "srd-custom-menu";
      const button = iconButton("menu", "Main menu");
      button.ariaHasPopup = "menu";
      button.ariaExpanded = "false";
      button.addEventListener("click", () => showMenu(button));
      menuHost.append(button);
      document.body.append(menuHost);
    }
    return true;
  }
  window.addEventListener("spotify-redesign:desktop-connected", () => syncDesktopChrome());
  function syncCustomIcons() {
    const targets = document.querySelectorAll(".srd-global-nav button, .srd-player button");
    for (const button of targets) {
      if (button.closest(".srd-backdrop")) continue;
      const test = button.dataset.testid || "";
      const label = (button.ariaLabel || button.title || "").toLowerCase();
      let name;
      if (button.classList.contains("srd-settings-button")) name = "settings";
      else if (test === "control-button-playpause") name = label.includes("pause") ? "pause" : "play";
      else if (test.includes("shuffle") || label.includes("shuffle")) name = "shuffle";
      else if (test.includes("repeat")) name = "repeat";
      else if (test === "control-button-skip-back" || /^(previous|previous track)$/.test(label)) name = "previous";
      else if (test === "control-button-skip-forward" || /^(next|next track)$/.test(label)) name = "next";
      else if (/^(go )?back$/.test(label)) name = "back";
      else if (/^(go )?forward$/.test(label)) name = "forward";
      else if (label === "home") name = "home";
      else if (label.includes("notification")) name = "bell";
      else if (label.includes("friend")) name = "friends";
      else if (label === "search") name = "search";
      else if (label === "browse") name = "browse";
      else if (label.includes("queue")) name = "queue";
      else if (label.includes("lyrics")) name = "lyrics";
      else if (label.includes("unmute")) name = "muted";
      else if (label === "mute" || label.includes("mute volume")) name = "volume";
      else if (label.includes("connect to a device") || label.includes("now playing view")) name = "device";
      else if (test === "pip-toggle-button") name = "device";
      else if (label.includes("full screen") || label.includes("fullscreen")) name = "fullscreen";
      if (!name || button.dataset.srdIcon === name) continue;
      button.dataset.srdIcon = name;
      button.querySelector(":scope > .srd-icon")?.remove();
      if (button.classList.contains("srd-settings-button")) button.replaceChildren(icon(name));
      else button.append(icon(name));
    }
  }

  // web/src/playback-panel.ts
  var reference = (track) => ({ uri: track.uri, uid: track.uid });
  var identity = (track) => `${track.uri}:${track.uid || ""}`;
  var playable = (track) => /^spotify:(track|episode|local):/.test(track.uri);
  var text = (tag, className, value) => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = value;
    return node;
  };
  var PlaybackPanel = class {
    root = document.createElement("section");
    tabs = document.createElement("div");
    list = document.createElement("ol");
    status = text("p", "srd-queue-status", "Connecting to Spotify\u2026");
    hint = text("p", "srd-queue-hint", "Drag the handle to change what plays next.");
    tab = "queue";
    services;
    items = [];
    histories = [];
    signature = "";
    busy = false;
    refreshing = false;
    dragging;
    unsubscribes = [];
    lastHistory = 0;
    actionError = "";
    restoreFocus;
    constructor() {
      this.root.id = "srd-playback-panel";
      this.root.className = "srd-queue-panel";
      this.root.ariaLabel = "Playback history and upcoming songs";
      this.tabs.className = "srd-queue-tabs";
      this.tabs.setAttribute("role", "tablist");
      for (const tab of ["history", "queue"]) {
        const button = iconButton(tab, tab === "history" ? "Song history" : "Up next");
        button.id = `srd-${tab}-tab`;
        button.setAttribute("role", "tab");
        button.setAttribute("aria-controls", "srd-playback-list");
        button.append(document.createTextNode(tab === "history" ? "History" : "Up next"));
        button.addEventListener("click", () => this.select(tab));
        button.addEventListener("keydown", (event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          this.select(tab === "history" ? "queue" : "history");
          this.tabs.querySelector('[aria-selected="true"]')?.focus();
        });
        this.tabs.append(button);
      }
      this.list.id = "srd-playback-list";
      this.list.className = "srd-queue-list";
      this.list.setAttribute("role", "tabpanel");
      this.list.tabIndex = 0;
      this.status.setAttribute("role", "status");
      this.status.setAttribute("aria-live", "polite");
      this.root.append(this.tabs, this.hint, this.list, this.status);
      this.select("queue");
    }
    select(tab) {
      this.actionError = "";
      this.tab = tab;
      this.signature = "";
      this.list.scrollTop = 0;
      for (const button of this.tabs.querySelectorAll("button")) {
        const selected = button.id === `srd-${tab}-tab`;
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
      }
      this.list.setAttribute("aria-labelledby", `srd-${tab}-tab`);
      this.hint.textContent = tab === "history" ? "Choose a song to play it again." : "Drag the handle to change what plays next.";
      this.render();
      void this.refresh(true);
      if (tab === "history") this.root.scrollIntoView({ block: "nearest" });
    }
    connect() {
      const services = desktopServices();
      if (!services) return false;
      if (this.services === services) return true;
      this.unsubscribes.forEach((unsubscribe) => unsubscribe());
      this.unsubscribes = [];
      this.services = services;
      for (const event of ["queue_update", "queue_action_complete", "update"]) {
        const unsubscribe = services.player.getEvents().addListener(event, () => void this.refresh());
        if (typeof unsubscribe === "function") this.unsubscribes.push(unsubscribe);
      }
      return true;
    }
    async refresh(forceHistory = false) {
      if (this.refreshing || this.busy || this.dragging || !this.root.isConnected) return;
      if (!this.connect()) {
        this.status.textContent = "Waiting for Spotify\u2019s player\u2026";
        return;
      }
      this.refreshing = true;
      try {
        const queue = this.services.player.getQueue();
        this.items = [...queue.queued, ...queue.nextUp].filter(playable);
        if (this.tab === "history" && this.services.history && (forceHistory || Date.now() - this.lastHistory > 15e3)) {
          let timer;
          const history = await Promise.race([
            this.services.history.getContents(),
            new Promise((_, reject) => {
              timer = window.setTimeout(() => reject(new Error("History took too long to load. Try the History tab again.")), 1e4);
            })
          ]).finally(() => window.clearTimeout(timer));
          this.histories = history.items.filter(playable).slice(0, 300);
          this.lastHistory = Date.now();
        }
        this.status.textContent = this.actionError || (this.tab === "history" && !this.services.history ? "History is unavailable in this Spotify version." : "");
        this.render();
      } catch (error) {
        this.status.textContent = error instanceof Error ? error.message : "Could not load playback. Try again shortly.";
      } finally {
        this.refreshing = false;
      }
    }
    async run(action, message) {
      if (this.busy || !this.services) return;
      this.busy = true;
      this.actionError = "";
      this.root.setAttribute("aria-busy", "true");
      this.status.textContent = message;
      this.render();
      try {
        await action();
        this.status.textContent = "";
      } catch (error) {
        this.actionError = `Spotify could not apply that change. ${error instanceof Error ? error.message : "Please try again."}`;
        this.status.textContent = this.actionError;
      } finally {
        this.busy = false;
        this.root.setAttribute("aria-busy", "false");
        this.signature = "";
        this.render();
        void this.refresh();
      }
    }
    move(sourceKey, targetKey, after) {
      const source = this.items.find((track) => identity(track) === sourceKey);
      const target = this.items.find((track) => identity(track) === targetKey);
      if (!source || !target || source === target) return;
      void this.run(() => this.services.player.reorderQueue([reference(source)], after ? { after: reference(target) } : { before: reference(target) }), `Moving ${source.name}\u2026`);
    }
    render() {
      const tracks = this.tab === "history" ? this.histories : this.items;
      const signature = `${this.tab}:${this.busy}:${tracks.map((track) => identity(track) + track.name).join("|")}`;
      if (signature === this.signature) return;
      const focus = this.restoreFocus || (this.root.contains(document.activeElement) ? document.activeElement.dataset.focusKey : void 0);
      if (this.busy) this.restoreFocus = focus;
      const scrollTop = this.list.scrollTop;
      this.signature = signature;
      this.list.replaceChildren();
      if (!tracks.length) {
        const empty = document.createElement("li");
        empty.className = "srd-queue-empty";
        empty.append(icon(this.tab), document.createTextNode(this.tab === "history" ? "Your recent songs will appear here." : "Start playing to see what\u2019s next."));
        this.list.append(empty);
      }
      tracks.forEach((track, index) => {
        const key = identity(track);
        const row = document.createElement("li");
        row.className = "srd-queue-row";
        row.dataset.trackKey = key;
        const play = document.createElement("button");
        play.type = "button";
        play.className = "srd-queue-track";
        play.ariaLabel = `Play ${track.name}`;
        play.dataset.focusKey = `play:${key}:${index}`;
        play.disabled = this.busy;
        const artwork = document.createElement("div");
        artwork.className = "srd-queue-artwork";
        artwork.append(icon("music"));
        const source = (track.images || track.album?.images)?.[0]?.url;
        if (source && /^(https:\/\/|spotify:image:)/.test(source)) {
          const image = document.createElement("img");
          image.src = source;
          image.alt = "";
          image.loading = "lazy";
          image.addEventListener("error", () => image.remove(), { once: true });
          artwork.append(image);
        }
        const copy = text("span", "srd-queue-copy", "");
        copy.append(text("span", "srd-queue-name", track.name), text("span", "srd-queue-artists", track.artists?.map((a) => a.name).join(", ") || "Spotify"));
        play.append(artwork, copy);
        play.addEventListener("click", () => void this.run(
          () => this.tab === "history" ? this.services.player.playAsNextInQueue([track]) : this.services.player.skipTo(reference(track)),
          `Playing ${track.name}\u2026`
        ));
        row.append(play);
        if (this.tab === "queue") {
          row.draggable = !this.busy;
          const moves = document.createElement("div");
          moves.className = "srd-queue-moves";
          for (const [direction, label, delta] of [["up", "Move up", -1], ["down", "Move down", 1]]) {
            const button = iconButton(direction, `${label}: ${track.name}`);
            button.dataset.focusKey = `${direction}:${key}`;
            button.disabled = this.busy || index + delta < 0 || index + delta >= tracks.length;
            button.addEventListener("click", () => this.move(key, identity(tracks[index + delta]), delta > 0));
            moves.append(button);
          }
          const handle = iconButton("grip", `Drag to reorder: ${track.name}`);
          handle.classList.add("srd-queue-drag");
          handle.dataset.focusKey = `drag:${key}`;
          handle.title = "Drag to reorder; Alt + Arrow Up / Down also works";
          handle.disabled = this.busy;
          handle.addEventListener("keydown", (event) => {
            const delta = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
            if (event.altKey && delta && tracks[index + delta]) {
              event.preventDefault();
              this.move(key, identity(tracks[index + delta]), delta > 0);
            }
          });
          row.append(moves, handle);
          row.addEventListener("dragstart", (event) => {
            if (this.busy || !event.dataTransfer) {
              event.preventDefault();
              return;
            }
            this.dragging = key;
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("application/x-remixify-queue", key);
            row.classList.add("srd-queue-row--dragging");
          });
          row.addEventListener("dragover", (event) => {
            if (!this.dragging || this.dragging === key || this.busy) return;
            event.preventDefault();
            if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
            const bounds = row.getBoundingClientRect();
            row.dataset.drop = event.clientY > bounds.y + bounds.height / 2 ? "after" : "before";
            const viewport = this.list.getBoundingClientRect();
            if (event.clientY < viewport.y + 35) this.list.scrollTop -= 12;
            if (event.clientY > viewport.bottom - 35) this.list.scrollTop += 12;
          });
          row.addEventListener("dragleave", (event) => {
            if (!row.contains(event.relatedTarget)) delete row.dataset.drop;
          });
          row.addEventListener("drop", (event) => {
            event.preventDefault();
            const source2 = this.dragging;
            this.dragging = void 0;
            const after = row.dataset.drop === "after";
            delete row.dataset.drop;
            if (source2) this.move(source2, key, after);
          });
          row.addEventListener("dragend", () => {
            this.dragging = void 0;
            this.root.querySelectorAll("[data-drop]").forEach((node) => delete node.dataset.drop);
            row.classList.remove("srd-queue-row--dragging");
          });
        }
        this.list.append(row);
      });
      this.list.scrollTop = scrollTop;
      if (focus) [...this.root.querySelectorAll("[data-focus-key]")].find((node) => node.dataset.focusKey === focus)?.focus({ preventScroll: true });
      if (!this.busy) this.restoreFocus = void 0;
    }
  };
  var panel;
  var observedZone;
  var resize;
  function syncPlaybackPanel(zone, player) {
    panel ||= new PlaybackPanel();
    if (panel.root.parentElement !== zone) zone.append(panel.root);
    if (observedZone !== zone) {
      observedZone = zone;
      resize?.disconnect();
      resize = new ResizeObserver(() => {
        const cover = zone.querySelector(":scope > .srd-player-artwork");
        zone.style.setProperty("--srd-now-playing-height", `${player.getBoundingClientRect().height + (cover?.getBoundingClientRect().height || 0)}px`);
      });
      resize.observe(player);
      const artwork = zone.querySelector(".srd-player-artwork");
      if (artwork) resize.observe(artwork);
    }
    void panel.refresh();
  }
  window.setInterval(() => {
    if (!document.hidden) void panel?.refresh();
  }, 5e3);

  // web/src/core.ts
  var SETTINGS_KEY = "spotify-redesign:settings:v2";
  var PACKAGES_KEY = "spotify-redesign:installed-packages";
  var STYLE_ID = "spotify-redesign-core-style";
  var THEME_LINK_ID = "spotify-redesign-theme-style";
  var CUSTOM_STYLE_ID = "spotify-redesign-custom-style";
  var CUSTOM_CSS_KEY = "spotify-redesign:custom-css:v1";
  var THEME_CLASS = "srd-theme-active";
  var DEFAULT_PRIMARY_COLOR = "#7c3aed";
  var DEFAULT_SECONDARY_COLOR = "#14b8a6";
  var DEFAULT_THEME = "nocturne";
  var DEFAULT_WALLPAPER = "lunar-bloom";
  var MAX_CUSTOM_CSS_BYTES = 512 * 1024;
  var MAX_WALLPAPER_BYTES = 32 * 1024 * 1024;
  var WALLPAPER_DB = "spotify-redesign-assets";
  var WALLPAPER_STORE = "wallpapers";
  var CUSTOM_WALLPAPER_KEY = "custom";
  var WALLPAPERS = [
    {
      id: "lunar-bloom",
      name: "Lunar Bloom",
      image: "radial-gradient(circle at 74% 16%, rgba(218,196,255,.92) 0 2%, transparent 24%), radial-gradient(circle at 18% 78%, rgba(45,19,92,.86), transparent 42%), linear-gradient(138deg, #090716 0%, #34235f 48%, #ba8dd8 100%)"
    },
    {
      id: "coral-dusk",
      name: "Coral Dusk",
      image: "radial-gradient(circle at 24% 22%, rgba(255,191,159,.76), transparent 32%), radial-gradient(circle at 82% 72%, rgba(92,24,77,.86), transparent 46%), linear-gradient(145deg, #1a1122, #a74467 58%, #ef9b86)"
    },
    {
      id: "pacific-glass",
      name: "Pacific Glass",
      image: "radial-gradient(ellipse at 78% 12%, rgba(117,242,229,.8), transparent 30%), radial-gradient(circle at 16% 82%, rgba(9,54,88,.94), transparent 44%), linear-gradient(132deg, #031925, #087f8c 52%, #8be8d8)"
    },
    {
      id: "ember-silk",
      name: "Ember Silk",
      image: "radial-gradient(circle at 68% 30%, rgba(255,186,104,.88), transparent 25%), radial-gradient(circle at 15% 88%, rgba(101,18,30,.95), transparent 40%), linear-gradient(150deg, #180b12, #98392d 58%, #f0a35e)"
    },
    {
      id: "alpine-mist",
      name: "Alpine Mist",
      image: "radial-gradient(ellipse at 22% 18%, rgba(219,248,238,.82), transparent 34%), radial-gradient(circle at 82% 88%, rgba(20,61,55,.92), transparent 45%), linear-gradient(130deg, #081d20, #397a6a 54%, #bad7be)"
    },
    {
      id: "violet-veil",
      name: "Violet Veil",
      image: "radial-gradient(circle at 82% 20%, rgba(241,168,255,.78), transparent 28%), radial-gradient(circle at 16% 72%, rgba(49,13,104,.95), transparent 42%), linear-gradient(142deg, #0c061e, #5c2aa8 55%, #db8fe8)"
    },
    {
      id: "golden-hour",
      name: "Golden Hour",
      image: "radial-gradient(circle at 74% 22%, rgba(255,235,169,.95), transparent 25%), radial-gradient(ellipse at 20% 84%, rgba(76,34,16,.95), transparent 42%), linear-gradient(135deg, #25120a, #b46c32 52%, #f4c67c)"
    },
    {
      id: "rosewater",
      name: "Rosewater",
      image: "radial-gradient(circle at 18% 20%, rgba(255,224,235,.82), transparent 31%), radial-gradient(circle at 82% 82%, rgba(102,32,68,.9), transparent 42%), linear-gradient(142deg, #210d1a, #a34e78 55%, #e8a3bd)"
    },
    {
      id: "midnight-lake",
      name: "Midnight Lake",
      image: "radial-gradient(ellipse at 65% 16%, rgba(105,179,255,.74), transparent 28%), radial-gradient(circle at 18% 88%, rgba(2,22,60,.98), transparent 44%), linear-gradient(140deg, #020817, #123b73 55%, #5b8bb6)"
    },
    {
      id: "sage-stone",
      name: "Sage Stone",
      image: "radial-gradient(circle at 78% 18%, rgba(221,232,202,.72), transparent 31%), radial-gradient(circle at 20% 78%, rgba(39,48,39,.94), transparent 43%), linear-gradient(137deg, #101713, #5d6f5c 56%, #aeb79a)"
    },
    {
      id: "neon-rain",
      name: "Neon Rain",
      image: "radial-gradient(ellipse at 80% 24%, rgba(0,241,255,.72), transparent 27%), radial-gradient(circle at 20% 78%, rgba(255,29,167,.66), transparent 36%), linear-gradient(145deg, #030616, #26195c 50%, #0a6e80)"
    },
    {
      id: "monochrome-cloud",
      name: "Cloud Study",
      image: "radial-gradient(circle at 72% 16%, rgba(255,255,255,.66), transparent 28%), radial-gradient(circle at 18% 82%, rgba(22,25,31,.96), transparent 43%), linear-gradient(135deg, #08090c, #555a63 55%, #b9bdc4)"
    }
  ];
  var activeChannel;
  var activeChannelUrl = "";
  var wallpaperObjectUrl = "";
  var wallpaperRequest = 0;
  function validColor(value, fallback) {
    return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : fallback;
  }
  function oneOf(value, values, fallback) {
    return typeof value === "string" && values.includes(value) ? value : fallback;
  }
  function numberBetween(value, minimum, maximum, fallback) {
    return typeof value === "number" && Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback;
  }
  function readJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }
  function readSettings() {
    const stored = readJSON(SETTINGS_KEY, {});
    return {
      enabled: stored.enabled ?? true,
      autoUpdate: window.__SpotifyRedesignBootstrap?.autoUpdate ?? true,
      primaryColor: validColor(stored.primaryColor, DEFAULT_PRIMARY_COLOR),
      secondaryColor: validColor(stored.secondaryColor, DEFAULT_SECONDARY_COLOR),
      theme: typeof stored.theme === "string" && stored.theme.trim() ? stored.theme : DEFAULT_THEME,
      wallpaper: typeof stored.wallpaper === "string" && (stored.wallpaper === "custom" || WALLPAPERS.some((wallpaper) => wallpaper.id === stored.wallpaper)) ? stored.wallpaper : DEFAULT_WALLPAPER,
      layout: oneOf(stored.layout, ["studio", "classic"], "studio"),
      density: oneOf(stored.density, ["comfortable", "compact"], "comfortable"),
      backgroundEffect: oneOf(stored.backgroundEffect, ["none", "ambient", "grid"], "ambient"),
      motion: stored.motion ?? true,
      glassClarity: numberBetween(stored.glassClarity, 0, 100, 78),
      glassBlur: numberBetween(stored.glassBlur, 0, 48, 24),
      glassBrightness: numberBetween(stored.glassBrightness, 0, 100, 65),
      showSpotlight: stored.showSpotlight ?? true
    };
  }
  function openWallpaperDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(WALLPAPER_DB, 1);
      request.addEventListener("upgradeneeded", () => {
        if (!request.result.objectStoreNames.contains(WALLPAPER_STORE)) {
          request.result.createObjectStore(WALLPAPER_STORE);
        }
      });
      request.addEventListener("success", () => resolve(request.result));
      request.addEventListener("error", () => reject(request.error || new Error("Could not open wallpaper storage")));
    });
  }
  async function readCustomWallpaper() {
    const database = await openWallpaperDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(WALLPAPER_STORE, "readonly");
      const request = transaction.objectStore(WALLPAPER_STORE).get(CUSTOM_WALLPAPER_KEY);
      request.addEventListener("success", () => resolve(request.result instanceof Blob ? request.result : void 0));
      request.addEventListener("error", () => reject(request.error || new Error("Could not read wallpaper")));
      transaction.addEventListener("complete", () => database.close());
    });
  }
  async function writeCustomWallpaper(blob) {
    const database = await openWallpaperDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(WALLPAPER_STORE, "readwrite");
      transaction.objectStore(WALLPAPER_STORE).put(blob, CUSTOM_WALLPAPER_KEY);
      transaction.addEventListener("complete", () => {
        database.close();
        resolve();
      });
      transaction.addEventListener("error", () => reject(transaction.error || new Error("Could not save wallpaper")));
    });
  }
  function setWallpaperImage(image) {
    document.documentElement.style.setProperty("--srd-wallpaper-image", image);
  }
  function applyWallpaper(settings) {
    const requestId = ++wallpaperRequest;
    document.documentElement.dataset.srdWallpaper = settings.wallpaper;
    if (settings.wallpaper !== "custom") {
      const wallpaper = WALLPAPERS.find((candidate) => candidate.id === settings.wallpaper) || WALLPAPERS[0];
      if (wallpaperObjectUrl) URL.revokeObjectURL(wallpaperObjectUrl);
      wallpaperObjectUrl = "";
      setWallpaperImage(wallpaper.image);
      return;
    }
    void readCustomWallpaper().then((blob) => {
      if (requestId !== wallpaperRequest) return;
      if (!blob) throw new Error("No custom wallpaper is stored");
      if (wallpaperObjectUrl) URL.revokeObjectURL(wallpaperObjectUrl);
      wallpaperObjectUrl = URL.createObjectURL(blob);
      setWallpaperImage(`url("${wallpaperObjectUrl}")`);
    }).catch(() => {
      if (requestId !== wallpaperRequest) return;
      const next = { ...settings, wallpaper: DEFAULT_WALLPAPER };
      writeSettings(next);
      document.documentElement.dataset.srdWallpaper = DEFAULT_WALLPAPER;
      setWallpaperImage(WALLPAPERS[0].image);
    });
  }
  function mountAtmosphere() {
    if (!document.querySelector(".srd-wallpaper-layer")) {
      const wallpaper = element("div", "srd-wallpaper-layer");
      wallpaper.ariaHidden = "true";
      document.body.prepend(wallpaper);
    }
    if (!document.querySelector(".srd-starfield")) {
      const starfield = element("div", "srd-starfield");
      starfield.ariaHidden = "true";
      for (let index = 0; index < 16; index += 1) {
        const star = element("i", "srd-shooting-star");
        star.style.setProperty("--srd-star-index", String(index));
        starfield.appendChild(star);
      }
      document.body.prepend(starfield);
    }
  }
  function writeSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
  function readCustomCSS() {
    return localStorage.getItem(CUSTOM_CSS_KEY) || "";
  }
  function applyCustomCSS(css = readCustomCSS(), enabled = readSettings().enabled) {
    let style = document.querySelector(`#${CUSTOM_STYLE_ID}`);
    if (!style) {
      style = element("style");
      style.id = CUSTOM_STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = enabled ? css : "";
    document.head.appendChild(style);
  }
  function themeDefinitions(channel = activeChannel) {
    return channel?.themes?.length ? channel.themes : [
      {
        id: DEFAULT_THEME,
        name: "Nocturne",
        description: "The built-in ultra-dark appearance.",
        entry: "",
        primaryColor: DEFAULT_PRIMARY_COLOR,
        secondaryColor: DEFAULT_SECONDARY_COLOR
      }
    ];
  }
  function applyThemeStylesheet(settings) {
    const definitions = themeDefinitions();
    const definition = definitions.find((candidate) => candidate.id === settings.theme) || definitions[0];
    document.documentElement.dataset.srdTheme = definition.id;
    const existing = document.querySelector(`#${THEME_LINK_ID}`);
    if (!definition.entry || !activeChannelUrl) {
      existing?.remove();
      applyCustomCSS(readCustomCSS(), settings.enabled);
      return;
    }
    const entryUrl = new URL(definition.entry, activeChannelUrl).href;
    const cacheKey = `${activeChannel?.version || "dev"}-${definition.integrity || definition.id}`;
    const href = `${entryUrl}${entryUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(cacheKey)}`;
    if (existing?.dataset.themeId === definition.id && existing.href === href) {
      existing.disabled = !settings.enabled;
      applyCustomCSS(readCustomCSS(), settings.enabled);
      return;
    }
    existing?.remove();
    const link = document.createElement("link");
    link.id = THEME_LINK_ID;
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.themeId = definition.id;
    link.disabled = !settings.enabled;
    link.addEventListener("load", () => applyCustomCSS(readCustomCSS(), settings.enabled), { once: true });
    document.head.appendChild(link);
    applyCustomCSS(readCustomCSS(), settings.enabled);
  }
  function applyThemeState(settings) {
    const root = document.documentElement;
    const clarity = numberBetween(settings.glassClarity, 0, 100, 78);
    const blur = numberBetween(settings.glassBlur, 0, 48, 24);
    const alpha = (maximum, reduction, minimum) => Math.max(minimum, maximum - clarity * reduction).toFixed(3);
    root.classList.toggle(THEME_CLASS, settings.enabled);
    root.style.setProperty("--srd-primary", validColor(settings.primaryColor, DEFAULT_PRIMARY_COLOR));
    root.style.setProperty(
      "--srd-secondary",
      validColor(settings.secondaryColor, DEFAULT_SECONDARY_COLOR)
    );
    root.style.setProperty("--srd-glass-blur", `${blur}px`);
    root.style.setProperty("--srd-glass-tint-alpha", (numberBetween(settings.glassBrightness, 0, 100, 65) * 2e-3).toFixed(3));
    root.style.setProperty("--srd-glass-nav-alpha", alpha(0.54, 37e-4, 0.17));
    root.style.setProperty("--srd-glass-shell-alpha", alpha(0.5, 34e-4, 0.16));
    root.style.setProperty("--srd-glass-shelf-alpha", alpha(0.49, 335e-5, 0.15));
    root.style.setProperty("--srd-glass-card-alpha", alpha(0.16, 16e-4, 0.018));
    root.style.setProperty("--srd-glass-control-alpha", alpha(0.2, 15e-4, 0.05));
    root.style.setProperty("--srd-glass-modal-alpha", alpha(0.72, 38e-4, 0.34));
    root.style.setProperty("--srd-glass-player-alpha", alpha(0.64, 33e-4, 0.31));
    root.dataset.srdLayout = settings.layout;
    root.dataset.srdDensity = settings.density;
    root.dataset.srdEffect = settings.backgroundEffect;
    root.dataset.srdMotion = settings.motion ? "on" : "off";
    root.dataset.srdSpotlight = settings.showSpotlight ? "on" : "off";
    applyWallpaper(settings);
    applyThemeStylesheet(settings);
    syncDesktopChrome();
    syncCustomIcons();
  }
  function syncSidebarLayout(shell, sidebar) {
    const requestedWidth = Number.parseFloat(sidebar.style.getPropertyValue("--left-sidebar-width"));
    const libraryToggle = Array.from(sidebar.querySelectorAll('button, [role="button"]')).find(
      (node) => /your library/i.test(node.getAttribute("aria-label") || "")
    );
    const collapsedFromToggle = /^open your library$/i.test(libraryToggle?.getAttribute("aria-label") || "");
    const collapsed = Number.isFinite(requestedWidth) ? requestedWidth <= 100 : collapsedFromToggle;
    const width = Number.isFinite(requestedWidth) ? Math.min(420, Math.max(72, requestedWidth)) : collapsed ? 72 : 260;
    shell.style.setProperty("--srd-library-width", `${width}px`);
    shell.classList.toggle("srd-library-collapsed", collapsed);
    shell.dataset.srdLibrary = collapsed ? "collapsed" : "expanded";
  }
  function syncPlayerArtwork(playerZone, player) {
    const artworkCandidate = player.querySelector('[data-testid="cover-art-image"]');
    const image = (artworkCandidate instanceof HTMLImageElement ? artworkCandidate : artworkCandidate?.querySelector("img")) || player.querySelector('img[src*="image"], img');
    const source = image?.currentSrc || image?.src || "";
    let backdrop = playerZone.querySelector(":scope > .srd-player-artwork");
    if (!backdrop) {
      backdrop = element("div", "srd-player-artwork");
      backdrop.ariaHidden = "true";
      backdrop.appendChild(element("img"));
      playerZone.prepend(backdrop);
    }
    const backdropImage = backdrop.querySelector("img");
    if (backdropImage && source && backdropImage.src !== source) backdropImage.src = source;
    backdrop.classList.toggle("srd-player-artwork--empty", !source);
  }
  function labelWindowControls() {
    if (syncDesktopChrome()) return;
    const parents = /* @__PURE__ */ new Set();
    document.querySelectorAll('[data-testid="window-controls"]').forEach((node) => parents.add(node));
    for (const node of document.querySelectorAll('button, [role="button"]')) {
      if (node.closest(".srd-modal, .srd-backdrop")) continue;
      const signature = [
        node.getAttribute("aria-label"),
        node.getAttribute("title"),
        node.getAttribute("data-testid"),
        typeof node.className === "string" ? node.className : ""
      ].filter(Boolean).join(" ").toLowerCase();
      let action = "";
      if (/minimi[sz]e|minimieren|window[-_ ]min/.test(signature)) action = "minimize";
      else if (/maximi[sz]e|maximieren|restore down|window[-_ ]max/.test(signature)) action = "maximize";
      else if (/window[-_ ]close|caption[-_ ]close|titlebar[-_ ]close|schlie(?:ß|ss)en/.test(signature) || [node.getAttribute("aria-label"), node.getAttribute("title")].some((label) => /^(close|close window)$/i.test(label || ""))) action = "close";
      if (!action) continue;
      const rect = node.getBoundingClientRect();
      if (!node.closest('[data-testid="window-controls"]') && (rect.top > 80 || rect.right < window.innerWidth - 400)) continue;
      node.classList.add("srd-window-control");
      node.dataset.srdWindowAction = action;
      if (node.parentElement) parents.add(node.parentElement);
    }
    for (const parent of parents) {
      if (parent.querySelectorAll(":scope > .srd-window-control").length >= 2 || parent.matches('[data-testid="window-controls"]')) {
        parent.classList.add("srd-window-controls");
        let ancestor = parent.parentElement;
        while (ancestor && !ancestor.matches('[data-testid="global-nav-bar"], .Root')) {
          ancestor.classList.add("srd-caption-owner");
          ancestor = ancestor.parentElement;
        }
      }
    }
    const domControls = document.querySelector(".srd-window-controls");
    const nativeControls = !domControls && /Windows/.test(navigator.userAgent) && Boolean(window.__SpotifyRedesignConfig) && !document.fullscreenElement && !document.documentElement.classList.contains("fullscreen");
    document.documentElement.dataset.srdCaption = domControls ? "dom" : nativeControls ? "native" : "none";
    for (const [id, className, visible] of [
      ["srd-native-caption-frame", "srd-native-caption-frame", nativeControls],
      ["srd-native-menu-frame", "srd-native-menu-frame", nativeControls]
    ]) {
      let frame = document.getElementById(id);
      if (visible && !frame) {
        frame = element("div", className);
        frame.id = id;
        frame.ariaHidden = "true";
        document.body.appendChild(frame);
      } else if (!visible) frame?.remove();
    }
  }
  function labelSearchLayers() {
    const nav = document.querySelector('[data-testid="global-nav-bar"]');
    if (!nav) return;
    for (const input of nav.querySelectorAll('input, [role="combobox"]')) {
      let ancestor = input.parentElement;
      while (ancestor && ancestor !== nav) {
        ancestor.classList.add("srd-search-layer");
        if (ancestor.parentElement === nav && nav.children.length >= 3 && !ancestor.querySelector(".srd-window-controls")) {
          ancestor.classList.add("srd-nav-search-section");
        }
        ancestor = ancestor.parentElement;
      }
      for (const id of (input.getAttribute("aria-controls") || "").split(/\s+/).filter(Boolean)) {
        document.getElementById(id)?.classList.add("srd-search-popover");
      }
    }
  }
  function labelSpotifyShell() {
    const root = document.querySelector(".Root");
    const main = document.querySelector("#main-view");
    if (!root || !main) return false;
    const shell = main.parentElement;
    if (!shell || getComputedStyle(shell).display !== "grid") return false;
    shell.classList.add("srd-app-grid");
    document.querySelector('[data-testid="global-nav-bar"]')?.classList.add("srd-global-nav");
    const sidebar = document.querySelector("#Desktop_LeftSidebar_Id");
    sidebar?.classList.add("srd-left-sidebar");
    if (sidebar) syncSidebarLayout(shell, sidebar);
    main.classList.add("srd-main-view");
    let playerZone;
    for (const child of Array.from(shell.children)) {
      if (!(child instanceof HTMLElement)) continue;
      const gridArea = getComputedStyle(child).gridArea.trim();
      const isRightSidebar = Boolean(child.querySelector('[data-testid="NPV_Panel_OpenDiv"]')) || gridArea === "right-sidebar";
      const isPlayerZone = child.matches('[data-testid="now-playing-bar"]') || Boolean(child.querySelector('[data-testid="now-playing-bar"]'));
      child.classList.toggle("srd-right-sidebar", isRightSidebar);
      child.classList.toggle("srd-player-zone", isPlayerZone);
      child.classList.toggle("srd-shell-overlay", !isRightSidebar && (child.classList.contains("srd-shell-overlay") || gridArea.includes("right-sidebar")));
      if (isPlayerZone) playerZone = child;
    }
    const player = document.querySelector('[data-testid="now-playing-bar"]');
    player?.classList.add("srd-player");
    if (playerZone && player) {
      syncPlayerArtwork(playerZone, player);
      syncPlaybackPanel(playerZone, player);
    }
    labelWindowControls();
    labelSearchLayers();
    syncCustomIcons();
    return true;
  }
  function labelSpotifyStructure() {
    return labelSpotifyShell();
  }
  function mountStructureObserver() {
    let shellFrame;
    let sidebarFrame;
    let sidebarObserver;
    let observedSidebar;
    let observedShell;
    let shellClassObserver;
    let shellResizeObserver;
    const syncShell = () => {
      if (shellFrame !== void 0) return;
      shellFrame = window.setTimeout(() => {
        shellFrame = void 0;
        labelSpotifyShell();
        observeSidebarWidth();
      }, 16);
    };
    const schedule = () => {
      syncShell();
    };
    const syncSidebarWidth = () => {
      if (sidebarFrame !== void 0) return;
      sidebarFrame = window.requestAnimationFrame(() => {
        sidebarFrame = void 0;
        const sidebar = document.querySelector("#Desktop_LeftSidebar_Id");
        const main = document.querySelector("#main-view");
        const shell = main?.parentElement;
        if (sidebar && shell instanceof HTMLElement) syncSidebarLayout(shell, sidebar);
      });
    };
    const followSidebarWidth = () => {
      const deadline = performance.now() + 1200;
      const follow = () => {
        const sidebar = document.querySelector("#Desktop_LeftSidebar_Id");
        const main = document.querySelector("#main-view");
        const shell = main?.parentElement;
        if (sidebar && shell instanceof HTMLElement) syncSidebarLayout(shell, sidebar);
        if (performance.now() < deadline) window.requestAnimationFrame(follow);
      };
      window.requestAnimationFrame(follow);
    };
    const observeSidebarWidth = () => {
      const shell = document.querySelector("#main-view")?.parentElement;
      if (shell && shell !== observedShell) {
        shellClassObserver?.disconnect();
        shellResizeObserver?.disconnect();
        observedShell = shell;
        shellClassObserver = new MutationObserver(() => {
          if (!shell.classList.contains("srd-app-grid")) syncShell();
        });
        shellClassObserver.observe(shell, { attributes: true, attributeFilter: ["class"] });
        shellResizeObserver = new ResizeObserver(syncShell);
        shellResizeObserver.observe(shell);
      }
      const sidebar = document.querySelector("#Desktop_LeftSidebar_Id") || void 0;
      if (sidebar === observedSidebar) return;
      sidebarObserver?.disconnect();
      observedSidebar = sidebar;
      if (!sidebar) return;
      sidebarObserver = new MutationObserver(syncSidebarWidth);
      sidebarObserver.observe(sidebar, { attributes: true, attributeFilter: ["style"] });
    };
    labelSpotifyStructure();
    observeSidebarWidth();
    new MutationObserver(() => schedule()).observe(document.body, { childList: true, subtree: true });
    document.addEventListener("focusin", labelSearchLayers);
    document.addEventListener("fullscreenchange", labelWindowControls);
    document.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (!(target instanceof Element) || !target.closest("#Desktop_LeftSidebar_Id")) return;
        followSidebarWidth();
      },
      { capture: true }
    );
  }
  function element(tag, className, text2) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text2 !== void 0) node.textContent = text2;
    return node;
  }
  function notify(message, error = false) {
    const toast = element("div", "srd-toast", message);
    Object.assign(toast.style, {
      position: "fixed",
      right: "24px",
      bottom: "116px",
      zIndex: "30000",
      padding: "11px 15px",
      borderRadius: "10px",
      color: "white",
      background: error ? "#b91c1c" : "#292930",
      boxShadow: "0 12px 40px rgba(0,0,0,.4)",
      fontSize: "13px"
    });
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 2800);
  }
  var PackageManager = class {
    constructor(channel, channelUrl) {
      this.channel = channel;
      this.channelUrl = channelUrl;
      this.definitions = new Map(channel.packages.map((definition) => [definition.id, definition]));
      this.installed = new Set([...this.installed].filter((id) => this.definitions.has(id)));
      this.persist();
    }
    definitions;
    lifecycles = /* @__PURE__ */ new Map();
    active = /* @__PURE__ */ new Set();
    scripts = /* @__PURE__ */ new Map();
    waiters = /* @__PURE__ */ new Map();
    installed = new Set(readJSON(PACKAGES_KEY, []));
    list() {
      return [...this.definitions.values()];
    }
    isInstalled(id) {
      return this.installed.has(id);
    }
    register(id, lifecycle) {
      if (!this.definitions.has(id)) {
        console.warn(`[Remixify] Ignoring unregistered package: ${id}`);
        return;
      }
      this.lifecycles.set(id, lifecycle);
      this.waiters.get(id)?.(lifecycle);
      this.waiters.delete(id);
    }
    async activateInstalled() {
      for (const id of this.installed) {
        try {
          await this.activate(id);
        } catch (error) {
          console.error(`[Remixify] Package ${id} failed`, error);
          notify(`Could not start ${this.definitions.get(id)?.name || id}`, true);
        }
      }
    }
    async install(id) {
      if (!this.definitions.has(id)) throw new Error(`Unknown package: ${id}`);
      this.installed.add(id);
      this.persist();
      try {
        await this.activate(id);
      } catch (error) {
        this.installed.delete(id);
        this.persist();
        throw error;
      }
    }
    async uninstall(id) {
      await this.deactivate(id);
      this.installed.delete(id);
      this.persist();
    }
    async deactivateAll() {
      for (const id of [...this.active]) await this.deactivate(id);
    }
    persist() {
      localStorage.setItem(PACKAGES_KEY, JSON.stringify([...this.installed]));
    }
    async activate(id) {
      if (this.active.has(id)) return;
      let lifecycle = this.lifecycles.get(id);
      if (!lifecycle) lifecycle = await this.load(id);
      await lifecycle.activate();
      this.active.add(id);
    }
    async deactivate(id) {
      if (!this.active.has(id)) return;
      try {
        await this.lifecycles.get(id)?.deactivate();
      } finally {
        this.active.delete(id);
        this.scripts.get(id)?.remove();
        this.scripts.delete(id);
        this.lifecycles.delete(id);
      }
    }
    load(id) {
      const definition = this.definitions.get(id);
      if (!definition) return Promise.reject(new Error(`Unknown package: ${id}`));
      return new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          this.waiters.delete(id);
          reject(new Error(`Package ${id} did not register itself`));
        }, 1e4);
        this.waiters.set(id, (lifecycle) => {
          window.clearTimeout(timeout);
          resolve(lifecycle);
        });
        const script = document.createElement("script");
        const entryUrl = new URL(definition.entry, this.channelUrl).href;
        const cacheKey = `${this.channel.version}-${definition.integrity || definition.version}`;
        script.src = `${entryUrl}${entryUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(cacheKey)}`;
        script.dataset.spotifyRedesignPackage = id;
        if (definition.integrity) {
          script.integrity = definition.integrity;
          script.crossOrigin = "anonymous";
        }
        script.addEventListener(
          "error",
          () => {
            window.clearTimeout(timeout);
            this.waiters.delete(id);
            reject(new Error(`Could not download package ${id}`));
          },
          { once: true }
        );
        this.scripts.set(id, script);
        document.body.appendChild(script);
      });
    }
  };
  function injectCoreStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = element("style");
    style.id = STYLE_ID;
    style.textContent = `${core_default}
${layout_fixes_default}
${desktop_default}`;
    document.head.appendChild(style);
  }
  function makeToggle(value, onChange) {
    const toggle = element("button", "srd-toggle");
    toggle.type = "button";
    toggle.role = "switch";
    toggle.ariaChecked = String(value);
    toggle.addEventListener("click", () => {
      const next = toggle.ariaChecked !== "true";
      toggle.ariaChecked = String(next);
      onChange(next);
    });
    return toggle;
  }
  function makeColorControl(label, value, onInput) {
    const control = element("label", "srd-color-control");
    const name = element("span", "srd-color-name", label);
    const valueLabel = element("span", "srd-color-value", value.toUpperCase());
    const picker = element("input", "srd-color-picker");
    picker.type = "color";
    picker.value = value;
    picker.ariaLabel = `${label} color`;
    picker.addEventListener("input", () => {
      const color = validColor(picker.value, value);
      valueLabel.textContent = color.toUpperCase();
      onInput(color);
    });
    control.append(picker, name, valueLabel);
    return control;
  }
  function makeSegmentedControl(value, options, onChange) {
    const group = element("div", "srd-segmented");
    group.role = "group";
    for (const option of options) {
      const button = element("button", "srd-segmented-option", option.label);
      button.type = "button";
      button.ariaPressed = String(option.value === value);
      button.addEventListener("click", () => {
        for (const sibling of group.querySelectorAll(".srd-segmented-option")) {
          sibling.ariaPressed = String(sibling === button);
        }
        onChange(option.value);
      });
      group.appendChild(button);
    }
    return group;
  }
  function makeRangeControl(value, minimum, maximum, suffix, onInput) {
    const control = element("div", "srd-range-control");
    const valueLabel = element("output", "srd-range-value", `${Math.round(value)}${suffix}`);
    const slider = element("input", "srd-range-input");
    slider.type = "range";
    slider.min = String(minimum);
    slider.max = String(maximum);
    slider.step = "1";
    slider.value = String(value);
    slider.addEventListener("input", () => {
      const next = Number(slider.value);
      valueLabel.textContent = `${Math.round(next)}${suffix}`;
      onInput(next);
    });
    control.append(slider, valueLabel);
    return control;
  }
  function createSettingsModal(manager, channel, usingFallback) {
    const backdrop = element("div", "srd-backdrop");
    const modal = element("section", "srd-modal");
    const header = element("header", "srd-modal-header");
    const title = element("h2", "srd-modal-title", "Remixify");
    const close = element("button", "srd-close", "\xD7");
    close.type = "button";
    close.ariaLabel = "Close settings";
    header.append(title, close);
    const tabs = element("nav", "srd-tabs");
    const settingsTab = element("button", "srd-tab", "Settings");
    const themesTab = element("button", "srd-tab", "Themes");
    const marketplaceTab = element("button", "srd-tab", "Marketplace");
    settingsTab.type = themesTab.type = marketplaceTab.type = "button";
    const content = element("div", "srd-content");
    tabs.append(settingsTab, themesTab, marketplaceTab);
    modal.append(header, tabs, content);
    backdrop.appendChild(modal);
    const closeModal = () => {
      backdrop.remove();
      document.removeEventListener("keydown", onKey);
    };
    close.addEventListener("click", closeModal);
    backdrop.addEventListener("mousedown", (event) => {
      if (event.target === backdrop) closeModal();
    });
    const onKey = (event) => {
      if (event.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", onKey);
      }
    };
    document.addEventListener("keydown", onKey);
    const renderSettings = () => {
      settingsTab.ariaSelected = "true";
      themesTab.ariaSelected = "false";
      marketplaceTab.ariaSelected = "false";
      content.replaceChildren();
      const settings = readSettings();
      const updateAppearance = (patch) => {
        const next = { ...readSettings(), ...patch };
        writeSettings(next);
        applyThemeState(next);
      };
      const enabledRow = element("div", "srd-row");
      const enabledCopy = element("div");
      enabledCopy.append(
        element("h3", "", "Enable customizations"),
        element("p", "", "Turn off every installed package while keeping this settings button available.")
      );
      enabledRow.append(
        enabledCopy,
        makeToggle(settings.enabled, async (enabled) => {
          const next = { ...readSettings(), enabled };
          writeSettings(next);
          applyThemeState(next);
          if (enabled) await manager.activateInstalled();
          else await manager.deactivateAll();
          notify(enabled ? "Customizations enabled" : "Customizations disabled");
        })
      );
      const themeSection = element("section", "srd-theme-section");
      const themeHeading = element("div", "srd-theme-heading");
      themeHeading.append(
        element("h3", "", "Visual theme"),
        element("p", "", "Themes change only the visual layer; the Studio structure stays consistent.")
      );
      const themeGrid = element("div", "srd-theme-grid");
      for (const definition of themeDefinitions(channel)) {
        const selected = definition.id === settings.theme;
        const choice = element("button", "srd-theme-choice");
        choice.type = "button";
        choice.ariaPressed = String(selected);
        choice.style.setProperty("--srd-theme-primary", validColor(definition.primaryColor, DEFAULT_PRIMARY_COLOR));
        choice.style.setProperty("--srd-theme-secondary", validColor(definition.secondaryColor, DEFAULT_SECONDARY_COLOR));
        const preview = element("span", "srd-theme-preview");
        const copy = element("span", "srd-theme-choice-copy");
        copy.append(element("strong", "", definition.name), element("small", "", definition.description));
        choice.append(preview, copy);
        choice.addEventListener("click", () => {
          const next = {
            ...readSettings(),
            theme: definition.id,
            primaryColor: validColor(definition.primaryColor, DEFAULT_PRIMARY_COLOR),
            secondaryColor: validColor(definition.secondaryColor, DEFAULT_SECONDARY_COLOR)
          };
          writeSettings(next);
          applyThemeState(next);
          renderSettings();
        });
        themeGrid.appendChild(choice);
      }
      themeSection.append(themeHeading, themeGrid);
      const colorRow = element("div", "srd-row srd-row--colors");
      const colorCopy = element("div", "srd-color-copy");
      colorCopy.append(
        element("h3", "", "Theme colors"),
        element("p", "", "Choose the primary accent and the secondary highlight. Changes appear immediately.")
      );
      const colorControls = element("div", "srd-color-controls");
      const updateColor = (key, color) => {
        const next = { ...readSettings(), [key]: color };
        writeSettings(next);
        applyThemeState(next);
      };
      const primaryControl = makeColorControl(
        "Main",
        settings.primaryColor,
        (color) => updateColor("primaryColor", color)
      );
      const secondaryControl = makeColorControl(
        "Secondary",
        settings.secondaryColor,
        (color) => updateColor("secondaryColor", color)
      );
      const resetColors = element("button", "srd-color-reset", "Reset");
      resetColors.type = "button";
      resetColors.addEventListener("click", () => {
        const next = {
          ...readSettings(),
          primaryColor: DEFAULT_PRIMARY_COLOR,
          secondaryColor: DEFAULT_SECONDARY_COLOR
        };
        writeSettings(next);
        applyThemeState(next);
        renderSettings();
      });
      colorControls.append(primaryControl, secondaryControl, resetColors);
      colorRow.append(colorCopy, colorControls);
      const layoutRow = element("div", "srd-row");
      const layoutCopy = element("div");
      layoutCopy.append(
        element("h3", "", "Layout"),
        element("p", "", "Liquid Glass rebuilds Spotify around translucent panes and a full-height artwork player.")
      );
      layoutRow.append(
        layoutCopy,
        makeSegmentedControl(
          settings.layout,
          [
            { value: "studio", label: "Liquid Glass" },
            { value: "classic", label: "Classic" }
          ],
          (layout) => updateAppearance({ layout })
        )
      );
      const clarityRow = element("div", "srd-row");
      const clarityCopy = element("div");
      clarityCopy.append(
        element("h3", "", "Glass clarity"),
        element("p", "", "Raise this to reveal more of the selected wallpaper through every glass surface.")
      );
      const clarityControl = makeRangeControl(
        settings.glassClarity,
        0,
        100,
        "%",
        (glassClarity) => updateAppearance({ glassClarity })
      );
      clarityControl.querySelector("input")?.setAttribute("aria-label", "Glass clarity");
      clarityRow.append(clarityCopy, clarityControl);
      const blurRow = element("div", "srd-row");
      const blurCopy = element("div");
      blurCopy.append(
        element("h3", "", "Glass blur"),
        element("p", "", "Use a low value for sharper wallpaper detail or a high value for frosted glass.")
      );
      const blurControl = makeRangeControl(
        settings.glassBlur,
        0,
        48,
        " px",
        (glassBlur) => updateAppearance({ glassBlur })
      );
      blurControl.querySelector("input")?.setAttribute("aria-label", "Glass blur");
      blurRow.append(blurCopy, blurControl);
      const brightnessRow = element("div", "srd-row");
      const brightnessCopy = element("div");
      brightnessCopy.append(
        element("h3", "", "Glass brightness"),
        element("p", "", "Adjust the light tint of panels, cards and controls without changing your theme colors.")
      );
      const brightnessControl = makeRangeControl(
        settings.glassBrightness,
        0,
        100,
        "%",
        (glassBrightness) => updateAppearance({ glassBrightness })
      );
      brightnessControl.querySelector("input")?.setAttribute("aria-label", "Glass brightness");
      brightnessRow.append(brightnessCopy, brightnessControl);
      const spotlightRow = element("div", "srd-row");
      const spotlightCopy = element("div");
      spotlightCopy.append(
        element("h3", "", "Spotify spotlight"),
        element("p", "", "Show or hide the large promotional panel at the top of Home.")
      );
      spotlightRow.append(
        spotlightCopy,
        makeToggle(settings.showSpotlight, (showSpotlight) => updateAppearance({ showSpotlight }))
      );
      const densityRow = element("div", "srd-row");
      const densityCopy = element("div");
      densityCopy.append(
        element("h3", "", "Interface density"),
        element("p", "", "Compact fits more music on screen without shrinking playback controls.")
      );
      densityRow.append(
        densityCopy,
        makeSegmentedControl(
          settings.density,
          [
            { value: "comfortable", label: "Comfort" },
            { value: "compact", label: "Compact" }
          ],
          (density) => updateAppearance({ density })
        )
      );
      const effectRow = element("div", "srd-row");
      const effectCopy = element("div");
      effectCopy.append(
        element("h3", "", "Background effect"),
        element("p", "", "CSS-only effects add atmosphere without a canvas or continuous rendering loop.")
      );
      effectRow.append(
        effectCopy,
        makeSegmentedControl(
          settings.backgroundEffect,
          [
            { value: "none", label: "None" },
            { value: "ambient", label: "Ambient" },
            { value: "grid", label: "Grid" }
          ],
          (backgroundEffect) => updateAppearance({ backgroundEffect })
        )
      );
      const motionRow = element("div", "srd-row");
      const motionCopy = element("div");
      motionCopy.append(
        element("h3", "", "Subtle animations"),
        element("p", "", "Uses slow compositor-only transforms and pauses when reduced motion is requested.")
      );
      motionRow.append(
        motionCopy,
        makeToggle(settings.motion, (motion) => updateAppearance({ motion }))
      );
      const customSection = element("section", "srd-custom-css");
      const customHeading = element("div", "srd-custom-css-heading");
      customHeading.append(
        element("h3", "", "Custom CSS"),
        element(
          "p",
          "",
          "Paste CSS or import a .css file. It loads after the selected theme and is stored only on this PC."
        )
      );
      const editor = element("textarea", "srd-css-editor");
      editor.value = readCustomCSS();
      editor.placeholder = "/* Your CSS */\nhtml.srd-theme-active {\n  --srd-panel: #09090b;\n}";
      editor.spellcheck = false;
      editor.ariaLabel = "Custom CSS code";
      const cssActions = element("div", "srd-css-actions");
      const importButton = element("button", "srd-button", "Import .css");
      const applyButton = element("button", "srd-button srd-button--primary", "Apply CSS");
      const clearButton = element("button", "srd-button", "Clear");
      const fileInput = element("input");
      fileInput.type = "file";
      fileInput.accept = ".css,text/css";
      fileInput.hidden = true;
      importButton.type = applyButton.type = clearButton.type = "button";
      importButton.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", async () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        if (file.size > MAX_CUSTOM_CSS_BYTES) {
          notify("CSS file is larger than 512 KB", true);
          fileInput.value = "";
          return;
        }
        editor.value = await file.text();
        fileInput.value = "";
        notify(`${file.name} loaded \u2014 press Apply CSS`);
      });
      applyButton.addEventListener("click", () => {
        if (new Blob([editor.value]).size > MAX_CUSTOM_CSS_BYTES) {
          notify("Custom CSS is larger than 512 KB", true);
          return;
        }
        localStorage.setItem(CUSTOM_CSS_KEY, editor.value);
        applyCustomCSS(editor.value, readSettings().enabled);
        notify("Custom CSS applied");
      });
      clearButton.addEventListener("click", () => {
        editor.value = "";
        localStorage.removeItem(CUSTOM_CSS_KEY);
        applyCustomCSS("", readSettings().enabled);
        notify("Custom CSS cleared");
      });
      cssActions.append(importButton, applyButton, clearButton, fileInput);
      customSection.append(customHeading, editor, cssActions);
      const updateRow = element("div", "srd-row");
      const updateCopy = element("div");
      updateCopy.append(
        element("h3", "", "Automatic downloads"),
        element(
          "p",
          "",
          settings.autoUpdate ? "Updates download in the background. You always choose when to install and restart Spotify." : "A download button appears in the top bar when a release is available."
        )
      );
      updateRow.append(updateCopy, element("div", "srd-meta", settings.autoUpdate ? "Enabled" : "Manual"));
      const status = element("div", "srd-row");
      const statusCopy = element("div");
      statusCopy.append(
        element("h3", "", `Runtime ${channel.version}`),
        element(
          "p",
          "",
          usingFallback ? "Offline/local runtime is active." : `Updated ${new Date(channel.publishedAt).toLocaleString()}.`
        )
      );
      status.appendChild(statusCopy);
      const deactivateRow = element("div", "srd-row");
      const deactivateCopy = element("div");
      deactivateCopy.append(
        element("h3", "", "Deactivate Remixify"),
        element("p", "", "Restore Spotify's original interface and turn off background maintenance.")
      );
      const deactivateButton = element("button", "srd-button srd-button--danger", "Deactivate");
      deactivateButton.type = "button";
      deactivateButton.addEventListener("click", () => {
        closeModal();
        document.body.appendChild(createDeactivateConfirmation());
      });
      deactivateRow.append(deactivateCopy, deactivateButton);
      content.append(
        enabledRow,
        layoutRow,
        clarityRow,
        blurRow,
        brightnessRow,
        spotlightRow,
        densityRow,
        motionRow,
        updateRow,
        status,
        deactivateRow
      );
    };
    const renderThemes = () => {
      settingsTab.ariaSelected = "false";
      themesTab.ariaSelected = "true";
      marketplaceTab.ariaSelected = "false";
      content.replaceChildren();
      const settings = readSettings();
      const definitions = themeDefinitions(channel);
      const activeDefinition = definitions.find((definition) => definition.id === settings.theme) || definitions[0];
      const updateAppearance = (patch) => {
        const next = { ...readSettings(), ...patch };
        writeSettings(next);
        applyThemeState(next);
      };
      const studio = element("section", "srd-theme-studio");
      const studioCopy = element("div", "srd-theme-studio-copy");
      studioCopy.append(
        element("span", "srd-eyebrow", "THEME STUDIO"),
        element("h3", "", activeDefinition?.name || "Custom theme"),
        element(
          "p",
          "",
          "Pair a liquid-glass color atmosphere with a wallpaper, tune the glow, or layer your own CSS."
        )
      );
      const livePreview = element("div", "srd-theme-live-preview");
      livePreview.ariaLabel = "Live theme preview";
      livePreview.append(
        element("span", "srd-preview-rail"),
        element("span", "srd-preview-header"),
        element("span", "srd-preview-card srd-preview-card--one"),
        element("span", "srd-preview-card srd-preview-card--two"),
        element("span", "srd-preview-player")
      );
      studio.append(studioCopy, livePreview);
      const themeSection = element("section", "srd-theme-section");
      const themeHeading = element("div", "srd-theme-heading");
      themeHeading.append(
        element("h3", "", "Atmospheres"),
        element("p", "", `${definitions.length} lightweight CSS themes are included and switch instantly.`)
      );
      const themeGrid = element("div", "srd-theme-grid");
      for (const definition of definitions) {
        const selected = definition.id === settings.theme;
        const choice = element("button", "srd-theme-choice");
        choice.type = "button";
        choice.ariaPressed = String(selected);
        choice.style.setProperty("--srd-theme-primary", validColor(definition.primaryColor, DEFAULT_PRIMARY_COLOR));
        choice.style.setProperty("--srd-theme-secondary", validColor(definition.secondaryColor, DEFAULT_SECONDARY_COLOR));
        const preview = element("span", "srd-theme-preview");
        const copy = element("span", "srd-theme-choice-copy");
        copy.append(element("strong", "", definition.name), element("small", "", definition.description));
        choice.append(preview, copy);
        choice.addEventListener("click", () => {
          const next = {
            ...readSettings(),
            theme: definition.id,
            primaryColor: validColor(definition.primaryColor, DEFAULT_PRIMARY_COLOR),
            secondaryColor: validColor(definition.secondaryColor, DEFAULT_SECONDARY_COLOR)
          };
          writeSettings(next);
          applyThemeState(next);
          renderThemes();
        });
        themeGrid.appendChild(choice);
      }
      themeSection.append(themeHeading, themeGrid);
      const wallpaperSection = element("section", "srd-wallpaper-section");
      const wallpaperHeading = element("div", "srd-theme-heading");
      wallpaperHeading.append(
        element("h3", "", "Wallpapers"),
        element("p", "", "12 built-in scenes, plus your own still image or animated GIF. Custom files stay on this PC.")
      );
      const wallpaperGrid = element("div", "srd-wallpaper-grid");
      for (const wallpaper of WALLPAPERS) {
        const choice = element("button", "srd-wallpaper-choice");
        choice.type = "button";
        choice.ariaPressed = String(settings.wallpaper === wallpaper.id);
        choice.ariaLabel = `Use ${wallpaper.name} wallpaper`;
        choice.style.setProperty("--srd-wallpaper-preview", wallpaper.image);
        const preview = element("span", "srd-wallpaper-preview");
        preview.appendChild(element("i", "srd-wallpaper-preview-glass"));
        choice.append(preview, element("strong", "", wallpaper.name));
        choice.addEventListener("click", () => {
          const next = { ...readSettings(), wallpaper: wallpaper.id };
          writeSettings(next);
          applyThemeState(next);
          renderThemes();
        });
        wallpaperGrid.appendChild(choice);
      }
      const wallpaperInput = element("input");
      wallpaperInput.type = "file";
      wallpaperInput.accept = "image/*,.gif";
      wallpaperInput.hidden = true;
      const customChoice = element("button", "srd-wallpaper-choice srd-wallpaper-choice--custom");
      customChoice.type = "button";
      customChoice.ariaPressed = String(settings.wallpaper === "custom");
      customChoice.ariaLabel = "Use or upload a custom wallpaper";
      const customPreview = element("span", "srd-wallpaper-preview");
      customPreview.append(element("span", "srd-wallpaper-upload-icon", "+"));
      customChoice.append(customPreview, element("strong", "", "Your wallpaper"));
      customChoice.addEventListener("click", async () => {
        try {
          if (await readCustomWallpaper()) {
            const next = { ...readSettings(), wallpaper: "custom" };
            writeSettings(next);
            applyThemeState(next);
            renderThemes();
          } else {
            wallpaperInput.click();
          }
        } catch {
          wallpaperInput.click();
        }
      });
      wallpaperInput.addEventListener("change", async () => {
        const file = wallpaperInput.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
          notify("Choose an image or GIF file", true);
          wallpaperInput.value = "";
          return;
        }
        if (file.size > MAX_WALLPAPER_BYTES) {
          notify("Wallpaper is larger than 32 MB", true);
          wallpaperInput.value = "";
          return;
        }
        try {
          await writeCustomWallpaper(file);
          const next = { ...readSettings(), wallpaper: "custom" };
          writeSettings(next);
          applyThemeState(next);
          notify(`${file.name} is now your wallpaper`);
          renderThemes();
        } catch {
          notify("Could not save this wallpaper", true);
        } finally {
          wallpaperInput.value = "";
        }
      });
      wallpaperGrid.append(customChoice, wallpaperInput);
      wallpaperSection.append(wallpaperHeading, wallpaperGrid);
      const customizer = element("section", "srd-theme-customizer");
      const customizerHeading = element("div", "srd-theme-heading");
      customizerHeading.append(
        element("h3", "", "Palette & atmosphere"),
        element("p", "", "Colors update live. Reset returns to the selected atmosphere's original palette.")
      );
      const customizerGrid = element("div", "srd-theme-customizer-grid");
      const colorControls = element("div", "srd-color-controls");
      const updateColor = (key, color) => {
        updateAppearance({ [key]: color });
      };
      colorControls.append(
        makeColorControl("Main", settings.primaryColor, (color) => updateColor("primaryColor", color)),
        makeColorControl("Secondary", settings.secondaryColor, (color) => updateColor("secondaryColor", color))
      );
      const resetColors = element("button", "srd-color-reset", "Reset selected palette");
      resetColors.type = "button";
      resetColors.addEventListener("click", () => {
        const next = {
          ...readSettings(),
          primaryColor: validColor(activeDefinition?.primaryColor, DEFAULT_PRIMARY_COLOR),
          secondaryColor: validColor(activeDefinition?.secondaryColor, DEFAULT_SECONDARY_COLOR)
        };
        writeSettings(next);
        applyThemeState(next);
        renderThemes();
      });
      colorControls.append(resetColors);
      const effectControl = element("div", "srd-effect-control");
      effectControl.append(
        element("span", "srd-control-label", "Background effect"),
        makeSegmentedControl(
          settings.backgroundEffect,
          [
            { value: "none", label: "None" },
            { value: "ambient", label: "Ambient" },
            { value: "grid", label: "Grid" }
          ],
          (backgroundEffect) => updateAppearance({ backgroundEffect })
        )
      );
      customizerGrid.append(colorControls, effectControl);
      customizer.append(customizerHeading, customizerGrid);
      const customSection = element("section", "srd-custom-css");
      const customHeading = element("div", "srd-custom-css-heading");
      customHeading.append(
        element("h3", "", "Custom CSS layer"),
        element("p", "", "Paste CSS or import a .css file. It loads after the selected theme and stays on this PC.")
      );
      const editor = element("textarea", "srd-css-editor");
      editor.value = readCustomCSS();
      editor.placeholder = "/* Your CSS */\nhtml.srd-theme-active {\n  --srd-panel: #09090b;\n}";
      editor.spellcheck = false;
      editor.ariaLabel = "Custom CSS code";
      const cssActions = element("div", "srd-css-actions");
      const importButton = element("button", "srd-button", "Import .css");
      const applyButton = element("button", "srd-button srd-button--primary", "Apply CSS");
      const clearButton = element("button", "srd-button", "Clear");
      const fileInput = element("input");
      fileInput.type = "file";
      fileInput.accept = ".css,text/css";
      fileInput.hidden = true;
      importButton.type = applyButton.type = clearButton.type = "button";
      importButton.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", async () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        if (file.size > MAX_CUSTOM_CSS_BYTES) {
          notify("CSS file is larger than 512 KB", true);
          fileInput.value = "";
          return;
        }
        editor.value = await file.text();
        fileInput.value = "";
        notify(`${file.name} loaded \u2014 press Apply CSS`);
      });
      applyButton.addEventListener("click", () => {
        if (new Blob([editor.value]).size > MAX_CUSTOM_CSS_BYTES) {
          notify("Custom CSS is larger than 512 KB", true);
          return;
        }
        localStorage.setItem(CUSTOM_CSS_KEY, editor.value);
        applyCustomCSS(editor.value, readSettings().enabled);
        notify("Custom CSS applied");
      });
      clearButton.addEventListener("click", () => {
        editor.value = "";
        localStorage.removeItem(CUSTOM_CSS_KEY);
        applyCustomCSS("", readSettings().enabled);
        notify("Custom CSS cleared");
      });
      cssActions.append(importButton, applyButton, clearButton, fileInput);
      customSection.append(customHeading, editor, cssActions);
      content.append(studio, wallpaperSection, themeSection, customizer, customSection);
    };
    const renderMarketplace = () => {
      settingsTab.ariaSelected = "false";
      themesTab.ariaSelected = "false";
      marketplaceTab.ariaSelected = "true";
      content.replaceChildren();
      const grid = element("div", "srd-package-grid");
      const definitions = manager.list();
      if (!definitions.length) {
        content.appendChild(element("div", "srd-empty", "No packages are published in this channel yet."));
        return;
      }
      for (const definition of definitions) {
        const card = element("article", "srd-package-card");
        const icon2 = element("div", "srd-package-icon", definition.icon === "cat" ? "\u{1F408}" : "\u2726");
        const copy = element("div", "srd-package-copy");
        const installed = manager.isInstalled(definition.id);
        const button = element("button", installed ? "srd-button" : "srd-button srd-button--primary", installed ? "Remove" : "Install");
        button.type = "button";
        copy.append(
          element("h3", "", definition.name),
          element("p", "", definition.description),
          element(
            "div",
            "srd-meta",
            `${definition.type || "extension"} \xB7 ${definition.author} \xB7 v${definition.version}`
          ),
          button
        );
        button.addEventListener("click", async () => {
          button.disabled = true;
          try {
            if (manager.isInstalled(definition.id)) {
              await manager.uninstall(definition.id);
              notify(`${definition.name} removed`);
            } else {
              await manager.install(definition.id);
              if (!readSettings().enabled) await manager.deactivateAll();
              notify(`${definition.name} installed`);
            }
            renderMarketplace();
          } catch (error) {
            console.error(error);
            notify(`Could not change ${definition.name}`, true);
            button.disabled = false;
          }
        });
        card.append(icon2, copy);
        grid.appendChild(card);
      }
      content.appendChild(grid);
    };
    settingsTab.addEventListener("click", renderSettings);
    themesTab.addEventListener("click", renderThemes);
    marketplaceTab.addEventListener("click", renderMarketplace);
    renderSettings();
    return backdrop;
  }
  function openUpdaterAction(action) {
    void desktopAction(action).catch((error) => {
      console.warn("[Remixify] Desktop updater connection is unavailable", error);
    });
  }
  function matchingUpdateProgress(notice) {
    const progress = notice.progress;
    const version = notice.update?.cli?.version || notice.update?.version;
    return progress?.version && version && progress.version !== version ? void 0 : progress;
  }
  function updateProgressText(notice) {
    const progress = matchingUpdateProgress(notice);
    if (!progress) return notice.ready ? "Downloaded and verified \u2014 ready to install" : "Update available. Start the download when you are ready.";
    if (progress.stage === "downloading") {
      const bytes = progress.bytes || 0;
      const total = progress.totalBytes || 0;
      const size = `${(bytes / 1048576).toFixed(1)} MB`;
      return total > 0 ? `Downloading ${Math.min(100, Math.floor(bytes / total * 100))}% \xB7 ${size} / ${(total / 1048576).toFixed(1)} MB` : `Downloading \xB7 ${size}`;
    }
    const step = progress.steps ? `Step ${progress.step} of ${progress.steps}: ` : "";
    return step + (progress.message || progress.stage);
  }
  function createUpdateConfirmation(update, initial = { update, ready: true }) {
    const backdrop = element("div", "srd-backdrop");
    const modal = element("section", "srd-modal");
    const header = element("header", "srd-modal-header");
    const title = element("h2", "srd-modal-title", "Install update?");
    const close = element("button", "srd-close", "\xD7");
    close.type = "button";
    close.ariaLabel = "Cancel update";
    header.append(title, close);
    const copy = element(
      "p",
      "srd-confirm-copy",
      initial.ready ? `Version ${update.version} is ready. Spotify will close and reopen to install it.` : `Version ${update.version} is downloading in the background. You can install it once verification finishes.`
    );
    const actions = element("div", "srd-confirm-actions");
    const statusView = element("div", "srd-update-status");
    statusView.setAttribute("role", "status");
    statusView.setAttribute("aria-live", "polite");
    const statusLabel = element("div", "srd-update-status-label");
    const bar = element("progress", "srd-update-progress");
    bar.max = 100;
    bar.ariaLabel = "Update progress";
    statusView.append(statusLabel, bar);
    const cancel = element("button", "srd-button", "Not now");
    const install = element("button", "srd-button srd-button--primary", "Update now");
    cancel.type = install.type = "button";
    actions.append(cancel, install);
    modal.append(header, copy, statusView, actions);
    backdrop.appendChild(modal);
    let notice = initial;
    let requestedAt = 0;
    let busy = false;
    let acknowledgement;
    const renderProgress = () => {
      statusLabel.textContent = updateProgressText(notice);
      const progress = matchingUpdateProgress(notice);
      const complete = progress?.stage === "complete";
      const downloading = Boolean(progress && ["checking", "downloading", "verifying"].includes(progress.stage));
      if (progress?.stage === "downloading" && (progress.totalBytes || 0) > 0) bar.value = Math.min(100, (progress.bytes || 0) / progress.totalBytes * 100);
      else if (progress?.stage === "complete") bar.value = 100;
      else if (progress?.steps) bar.value = Math.max(0, ((progress.step || 1) - 1) / progress.steps * 100);
      else if (notice.ready && !busy) bar.value = 100;
      else bar.removeAttribute("value");
      statusView.classList.toggle("srd-update-status--error", progress?.stage === "error");
      title.textContent = complete ? "Update complete" : busy ? "Starting updater" : notice.ready ? "Install update?" : downloading ? "Downloading update" : "Update available";
      copy.textContent = complete ? `Version ${update.version} is installed.` : notice.ready ? `Version ${update.version} is ready. Spotify will close and reopen to install it.` : downloading ? `Version ${update.version} is downloading. You can install it once verification finishes.` : `Version ${update.version} is available to download.`;
      install.disabled = busy || downloading;
      install.textContent = complete ? "Done" : busy ? "Starting\u2026" : notice.ready ? "Update now" : progress?.stage === "error" ? "Retry download" : downloading ? "Downloading\u2026" : "Download update";
      cancel.textContent = busy ? "Hide" : "Not now";
    };
    const onProgress = (event) => {
      const next = event.detail;
      if (next.update?.version !== update.version && !(next.progress?.stage === "complete" && next.progress.version === (update.cli?.version || update.version))) return;
      const progress = matchingUpdateProgress({ ...next, update });
      if (requestedAt && (!progress || progress.updatedAt < requestedAt)) return;
      if (requestedAt && progress && progress.updatedAt >= requestedAt && ["checking", "downloading", "verifying", "ready", "starting", "stopping", "installing", "restarting", "complete", "error"].includes(progress.stage)) {
        window.clearTimeout(acknowledgement);
        if (progress.stage === "error") busy = false;
      }
      notice = { ...next, update, progress };
      if (progress && ["checking", "downloading", "verifying", "ready", "complete", "error"].includes(progress.stage)) busy = false;
      renderProgress();
    };
    window.addEventListener("spotify-redesign:update-available", onProgress);
    const dismiss = () => {
      window.clearTimeout(acknowledgement);
      window.removeEventListener("spotify-redesign:update-available", onProgress);
      backdrop.remove();
    };
    close.addEventListener("click", dismiss);
    cancel.addEventListener("click", dismiss);
    backdrop.addEventListener("mousedown", (event) => {
      if (event.target === backdrop) dismiss();
    });
    install.addEventListener("click", () => {
      if (matchingUpdateProgress(notice)?.stage === "complete") {
        dismiss();
        return;
      }
      requestedAt = Date.now();
      const downloading = !notice.ready;
      busy = true;
      notice = { ...notice, progress: { stage: "starting", message: "Waiting for Windows to start the updater\u2026", updatedAt: requestedAt } };
      renderProgress();
      openUpdaterAction(downloading ? "download-update" : "update-now");
      acknowledgement = window.setTimeout(() => {
        busy = false;
        notice = { ...notice, progress: { stage: "error", message: "Windows did not respond to the update link. Retry the update; if it still fails, restart Remixify to repair the link. Your downloaded update is still saved.", updatedAt: Date.now() } };
        renderProgress();
      }, 9e3);
    });
    renderProgress();
    return backdrop;
  }
  function createDeactivateConfirmation() {
    const backdrop = element("div", "srd-backdrop");
    const modal = element("section", "srd-modal");
    const header = element("header", "srd-modal-header");
    const title = element("h2", "srd-modal-title", "Deactivate Remixify?");
    const close = element("button", "srd-close", "\xD7");
    close.type = "button";
    close.ariaLabel = "Cancel deactivation";
    header.append(title, close);
    const copy = element(
      "p",
      "srd-confirm-copy",
      "Spotify will close and reopen with its original interface. Background maintenance will be disabled. You can reactivate the redesign by running installer.ps1 again."
    );
    const actions = element("div", "srd-confirm-actions");
    const cancel = element("button", "srd-button", "Cancel");
    const deactivate = element("button", "srd-button srd-button--danger", "Deactivate");
    cancel.type = deactivate.type = "button";
    actions.append(cancel, deactivate);
    modal.append(header, copy, actions);
    backdrop.appendChild(modal);
    const dismiss = () => backdrop.remove();
    close.addEventListener("click", dismiss);
    cancel.addEventListener("click", dismiss);
    backdrop.addEventListener("mousedown", (event) => {
      if (event.target === backdrop) dismiss();
    });
    deactivate.addEventListener("click", () => {
      deactivate.disabled = true;
      deactivate.textContent = "Deactivating\u2026";
      void desktopAction("deactivate").catch(() => {
        deactivate.disabled = false;
        deactivate.textContent = "Connection failed \u2014 retry";
      });
    });
    return backdrop;
  }
  function mountTopbarControls(openSettings, availableUpdate, updateReady, autoDownload) {
    const host = element("div", "srd-topbar-host srd-topbar-host--fallback");
    host.dataset.spotifyRedesign = "topbar";
    const settingsButton = element("button", "srd-settings-button", "\u2699");
    settingsButton.type = "button";
    settingsButton.title = "Remixify settings";
    settingsButton.ariaLabel = "Open Remixify settings";
    settingsButton.addEventListener("pointerdown", (event) => event.stopPropagation());
    settingsButton.addEventListener("mousedown", (event) => event.stopPropagation());
    settingsButton.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        openSettings();
      },
      { capture: true }
    );
    host.appendChild(settingsButton);
    const showAvailableUpdate = (notice) => {
      host.querySelector(".srd-update-button")?.remove();
      const update = notice.update;
      if (!update) return;
      const progress = matchingUpdateProgress(notice);
      if (progress?.stage === "complete") return;
      const percent = progress?.stage === "downloading" && (progress.totalBytes || 0) > 0 ? ` ${Math.min(100, Math.floor((progress.bytes || 0) / progress.totalBytes * 100))}%` : "";
      const failed = progress?.stage === "error";
      const downloading = Boolean(progress && ["checking", "downloading", "verifying"].includes(progress.stage));
      const label = notice.ready ? "Update" : failed ? "Update failed" : downloading ? `Downloading${percent}\u2026` : "Update available";
      const updateButton = element("button", "srd-update-button", label);
      updateButton.type = "button";
      updateButton.title = notice.ready ? `Install Remixify ${update.version}` : `Download Remixify ${update.version}`;
      updateButton.title = updateProgressText(notice);
      updateButton.addEventListener("click", () => {
        if (!notice.ready) {
          document.querySelector(".srd-backdrop")?.remove();
          document.body.appendChild(createUpdateConfirmation(update, notice));
          return;
        }
        document.querySelector(".srd-backdrop")?.remove();
        document.body.appendChild(createUpdateConfirmation(update, notice));
      });
      host.appendChild(updateButton);
    };
    showAvailableUpdate({ update: availableUpdate, ready: updateReady, progress: window.__SpotifyRedesignBootstrap?.updateProgress });
    window.addEventListener("spotify-redesign:update-available", (event) => {
      showAvailableUpdate(event.detail);
    });
    document.body.appendChild(host);
    const findTopbar = () => {
      const testedContent = document.querySelector('[data-testid="topbar-content"]');
      return document.querySelector('[data-testid="global-nav-bar"]') || document.querySelector(".main-topBar-topbarContent") || testedContent?.parentElement || document.querySelector(".main-globalNav-searchSection")?.parentElement || null;
    };
    const place = () => {
      const topbar = findTopbar();
      if (topbar) {
        host.classList.remove("srd-topbar-host--fallback");
        if (host.parentElement !== topbar || topbar.firstElementChild !== host) topbar.prepend(host);
      } else if (!topbar && host.parentElement !== document.body) {
        host.classList.add("srd-topbar-host--fallback");
        document.body.appendChild(host);
      }
    };
    place();
    let placementFrame;
    const schedulePlacement = () => {
      if (placementFrame !== void 0) return;
      placementFrame = window.requestAnimationFrame(() => {
        placementFrame = void 0;
        place();
      });
    };
    new MutationObserver(() => {
      if (!host.isConnected || host.classList.contains("srd-topbar-host--fallback")) schedulePlacement();
    }).observe(document.body, { childList: true, subtree: true });
  }
  async function start() {
    if (window.SpotifyRedesign) return;
    const bootstrap = window.__SpotifyRedesignBootstrap;
    if (!bootstrap) throw new Error("Bootstrap state is missing");
    activeChannel = bootstrap.channel;
    activeChannelUrl = bootstrap.channelUrl;
    injectCoreStyle();
    mountAtmosphere();
    applyThemeState(readSettings());
    mountStructureObserver();
    const manager = new PackageManager(bootstrap.channel, bootstrap.channelUrl);
    const openSettings = () => {
      document.querySelector(".srd-backdrop")?.remove();
      document.body.appendChild(createSettingsModal(manager, bootstrap.channel, bootstrap.usingFallback));
    };
    window.SpotifyRedesign = {
      version: bootstrap.channel.version,
      registerPackage: (id, lifecycle) => manager.register(id, lifecycle),
      openSettings
    };
    mountTopbarControls(openSettings, bootstrap.availableUpdate, bootstrap.updateReady, bootstrap.autoUpdate);
    if (readSettings().enabled) await manager.activateInstalled();
    console.info(`[Remixify] Runtime ${bootstrap.channel.version} loaded`);
  }
  void start().catch((error) => console.error("[Remixify] Runtime failed", error));
})();
//# sourceMappingURL=core.js.map
