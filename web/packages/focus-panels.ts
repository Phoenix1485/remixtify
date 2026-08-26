import type { PackageLifecycle } from "../src/types";
import styles from "./focus-panels.css";

const PACKAGE_ID = "focus-panels";
const STYLE_ID = "spotify-redesign-focus-panels-style";
const CLASS_NAME = "srd-extension-focus-panels";

const lifecycle: PackageLifecycle = {
  activate() {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = styles;
      document.head.appendChild(style);
    }
    document.documentElement.classList.add(CLASS_NAME);
  },
  deactivate() {
    document.documentElement.classList.remove(CLASS_NAME);
    document.getElementById(STYLE_ID)?.remove();
  },
};

window.SpotifyRedesign?.registerPackage(PACKAGE_ID, lifecycle);
