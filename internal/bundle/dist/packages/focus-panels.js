"use strict";
(() => {
  // web/packages/focus-panels.css
  var focus_panels_default = "html.srd-extension-focus-panels .Root__nav-bar,\nhtml.srd-extension-focus-panels .Root__right-sidebar {\n  opacity: 0.46;\n  filter: saturate(0.72);\n  transition: opacity 180ms ease, filter 180ms ease !important;\n}\n\nhtml.srd-extension-focus-panels .Root__nav-bar:hover,\nhtml.srd-extension-focus-panels .Root__nav-bar:focus-within,\nhtml.srd-extension-focus-panels .Root__right-sidebar:hover,\nhtml.srd-extension-focus-panels .Root__right-sidebar:focus-within {\n  opacity: 1;\n  filter: none;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  html.srd-extension-focus-panels .Root__nav-bar,\n  html.srd-extension-focus-panels .Root__right-sidebar {\n    transition: none !important;\n  }\n}\n";

  // web/packages/focus-panels.ts
  var PACKAGE_ID = "focus-panels";
  var STYLE_ID = "spotify-redesign-focus-panels-style";
  var CLASS_NAME = "srd-extension-focus-panels";
  var lifecycle = {
    activate() {
      if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = focus_panels_default;
        document.head.appendChild(style);
      }
      document.documentElement.classList.add(CLASS_NAME);
    },
    deactivate() {
      document.documentElement.classList.remove(CLASS_NAME);
      document.getElementById(STYLE_ID)?.remove();
    }
  };
  window.SpotifyRedesign?.registerPackage(PACKAGE_ID, lifecycle);
})();
//# sourceMappingURL=focus-panels.js.map
