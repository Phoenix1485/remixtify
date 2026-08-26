"use strict";
(() => {
  // web/packages/progress-cat.css
  var progress_cat_default = ".srd-cat-track {\n  position: relative !important;\n  overflow: visible !important;\n}\n\n#spotify-redesign-progress-cat {\n  --srd-cat-progress: 0;\n  position: absolute;\n  left: calc(var(--srd-cat-progress) * (100% - 18px));\n  top: -16px;\n  z-index: 8;\n  width: 18px;\n  height: 18px;\n  pointer-events: none;\n  font-size: 16px;\n  line-height: 18px;\n  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.55));\n  transform: translateX(-2px);\n  transition: left 160ms linear;\n  user-select: none;\n}\n\n";

  // web/packages/progress-cat.ts
  var PACKAGE_ID = "progress-cat";
  var STYLE_ID = "spotify-redesign-progress-cat-style";
  var CAT_ID = "spotify-redesign-progress-cat";
  var BAR_SELECTORS = [
    '[data-testid="playback-progressbar"]',
    ".playback-progressbar",
    ".progress-bar",
    '[class*="playback-progressbar"]'
  ];
  var timer;
  var cat;
  function locateBar() {
    const playbackBar = document.querySelector(".playback-bar, .main-nowPlayingBar-nowPlayingBar");
    if (playbackBar) {
      for (const selector of BAR_SELECTORS) {
        const candidate = playbackBar.querySelector(selector);
        if (candidate) return candidate;
      }
    }
    for (const selector of BAR_SELECTORS) {
      const candidate = document.querySelector(selector);
      if (candidate) return candidate;
    }
    return null;
  }
  function readPercent(bar) {
    const slider = bar.matches('input[type="range"]') ? bar : bar.querySelector('input[type="range"]');
    if (slider) {
      const value = Number(slider.value);
      const max = Number(slider.max || 100);
      if (Number.isFinite(value) && Number.isFinite(max) && max > 0) return Math.max(0, Math.min(1, value / max));
    }
    const range = bar.querySelector('[role="slider"]') || (bar.getAttribute("role") === "slider" ? bar : null);
    if (range) {
      const value = Number(range.getAttribute("aria-valuenow"));
      const max = Number(range.getAttribute("aria-valuemax") || 100);
      if (Number.isFinite(value) && Number.isFinite(max) && max > 0) return Math.max(0, Math.min(1, value / max));
    }
    const fill = bar.querySelector('[class*="progressFill"], [class*="foreground"]');
    if (fill) {
      const transform = getComputedStyle(fill).transform;
      const match = transform.match(/^matrix\(([^,]+),/);
      if (match) return Math.max(0, Math.min(1, Number(match[1])));
      const width = parseFloat(getComputedStyle(fill).width);
      if (Number.isFinite(width) && bar.clientWidth > 0) return Math.max(0, Math.min(1, width / bar.clientWidth));
    }
    return 0;
  }
  function attach() {
    const bar = locateBar();
    if (!bar) return;
    if (cat?.parentElement === bar) return;
    cat?.remove();
    cat = document.createElement("div");
    cat.id = CAT_ID;
    cat.textContent = "\u{1F408}";
    cat.title = "Progress Cat";
    bar.classList.add("srd-cat-track");
    bar.appendChild(cat);
  }
  function tick() {
    attach();
    const bar = cat?.parentElement;
    if (cat && bar) cat.style.setProperty("--srd-cat-progress", String(readPercent(bar)));
  }
  function updateTimer() {
    if (timer !== void 0) {
      window.clearInterval(timer);
      timer = void 0;
    }
    if (document.visibilityState === "visible") {
      tick();
      timer = window.setInterval(tick, 250);
    }
  }
  var lifecycle = {
    activate() {
      if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = progress_cat_default;
        document.head.appendChild(style);
      }
      document.addEventListener("visibilitychange", updateTimer);
      updateTimer();
    },
    deactivate() {
      document.removeEventListener("visibilitychange", updateTimer);
      if (timer !== void 0) window.clearInterval(timer);
      timer = void 0;
      cat?.parentElement?.classList.remove("srd-cat-track");
      cat?.remove();
      cat = void 0;
      document.getElementById(STYLE_ID)?.remove();
    }
  };
  window.SpotifyRedesign?.registerPackage(PACKAGE_ID, lifecycle);
})();
//# sourceMappingURL=progress-cat.js.map
