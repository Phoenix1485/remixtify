import type { PackageLifecycle } from "../src/types";
import styles from "./progress-cat.css";

const PACKAGE_ID = "progress-cat";
const STYLE_ID = "spotify-redesign-progress-cat-style";
const CAT_ID = "spotify-redesign-progress-cat";
const BAR_SELECTORS = [
  '[data-testid="playback-progressbar"]',
  ".playback-progressbar",
  ".progress-bar",
  '[class*="playback-progressbar"]',
];

let timer: number | undefined;
let cat: HTMLDivElement | undefined;

function locateBar(): HTMLElement | null {
  const playbackBar = document.querySelector<HTMLElement>(".playback-bar, .main-nowPlayingBar-nowPlayingBar");
  if (playbackBar) {
    for (const selector of BAR_SELECTORS) {
      const candidate = playbackBar.querySelector<HTMLElement>(selector);
      if (candidate) return candidate;
    }
  }
  for (const selector of BAR_SELECTORS) {
    const candidate = document.querySelector<HTMLElement>(selector);
    if (candidate) return candidate;
  }
  return null;
}

function readPercent(bar: HTMLElement): number {
  const slider = bar.matches('input[type="range"]')
    ? (bar as HTMLInputElement)
    : bar.querySelector<HTMLInputElement>('input[type="range"]');
  if (slider) {
    const value = Number(slider.value);
    const max = Number(slider.max || 100);
    if (Number.isFinite(value) && Number.isFinite(max) && max > 0) return Math.max(0, Math.min(1, value / max));
  }

  const range = bar.querySelector<HTMLElement>('[role="slider"]') || (bar.getAttribute("role") === "slider" ? bar : null);
  if (range) {
    const value = Number(range.getAttribute("aria-valuenow"));
    const max = Number(range.getAttribute("aria-valuemax") || 100);
    if (Number.isFinite(value) && Number.isFinite(max) && max > 0) return Math.max(0, Math.min(1, value / max));
  }

  const fill = bar.querySelector<HTMLElement>('[class*="progressFill"], [class*="foreground"]');
  if (fill) {
    const transform = getComputedStyle(fill).transform;
    const match = transform.match(/^matrix\(([^,]+),/);
    if (match) return Math.max(0, Math.min(1, Number(match[1])));
    const width = parseFloat(getComputedStyle(fill).width);
    if (Number.isFinite(width) && bar.clientWidth > 0) return Math.max(0, Math.min(1, width / bar.clientWidth));
  }
  return 0;
}

function attach(): void {
  const bar = locateBar();
  if (!bar) return;
  if (cat?.parentElement === bar) return;
  cat?.remove();
  cat = document.createElement("div");
  cat.id = CAT_ID;
  cat.textContent = "🐈";
  cat.title = "Progress Cat";
  bar.classList.add("srd-cat-track");
  bar.appendChild(cat);
}

function tick(): void {
  attach();
  const bar = cat?.parentElement as HTMLElement | undefined;
  if (cat && bar) cat.style.setProperty("--srd-cat-progress", String(readPercent(bar)));
}

function updateTimer(): void {
  if (timer !== undefined) {
    window.clearInterval(timer);
    timer = undefined;
  }
  if (document.visibilityState === "visible") {
    tick();
    timer = window.setInterval(tick, 250);
  }
}

const lifecycle: PackageLifecycle = {
  activate() {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = styles;
      document.head.appendChild(style);
    }
    document.addEventListener("visibilitychange", updateTimer);
    updateTimer();
  },
  deactivate() {
    document.removeEventListener("visibilitychange", updateTimer);
    if (timer !== undefined) window.clearInterval(timer);
    timer = undefined;
    cat?.parentElement?.classList.remove("srd-cat-track");
    cat?.remove();
    cat = undefined;
    document.getElementById(STYLE_ID)?.remove();
  },
};

window.SpotifyRedesign?.registerPackage(PACKAGE_ID, lifecycle);
