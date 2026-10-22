import { desktopServices } from "./spotify-bridge";
import { icon, iconButton, type IconName } from "./icons";
import { connectDesktop, desktopAction, desktopConnected } from "./desktop-client";

let hiddenNative = false;
let changingNative = false;
let menu: HTMLDivElement | undefined;
let dismissMenu: (() => void) | undefined;

function active(): boolean {
  return document.documentElement.matches('.srd-theme-active[data-srd-layout="studio"]');
}

function dispatchWindowAction(action: string): void {
  void desktopAction(`window-${action}`).catch(error => {
    console.warn("[Remixify] Window action failed", error);
    void desktopServices()?.native?.setWindowButtonsVisibility(true);
    hiddenNative = false;
    document.getElementById("srd-custom-caption")?.remove();
  });
}

function showMenu(button: HTMLButtonElement): void {
  if (menu) { dismissMenu?.(); return; }
  menu = document.createElement("div");
  menu.className = "srd-desktop-menu";
  menu.setAttribute("role", "menu");
  const close = () => { menu?.remove(); menu = undefined; dismissMenu = undefined; document.removeEventListener("pointerdown", outside, true); button.ariaExpanded = "false"; button.focus(); };
  dismissMenu = close;
  const actions: [IconName, string, () => void][] = [
    ["back", "Go back", () => document.querySelector<HTMLButtonElement>('[data-testid="global-nav-bar"] button[aria-label="Go back"], [data-testid="global-nav-bar"] button[aria-label="Back"]')?.click()],
    ["forward", "Go forward", () => document.querySelector<HTMLButtonElement>('[data-testid="global-nav-bar"] button[aria-label="Go forward"], [data-testid="global-nav-bar"] button[aria-label="Forward"]')?.click()],
    ["history", "Song history", () => document.querySelector<HTMLButtonElement>('#srd-history-tab')?.click()],
    ["queue", "Up next", () => document.querySelector<HTMLButtonElement>('#srd-queue-tab')?.click()],
    ["settings", "Remixify settings", () => window.SpotifyRedesign?.openSettings()],
  ];
  for (const [name, label, action] of actions) {
    const item = iconButton(name, label);
    item.setAttribute("role", "menuitem");
    item.append(document.createTextNode(label));
    item.addEventListener("click", () => { close(); action(); });
    menu.append(item);
  }
  menu.addEventListener("keydown", event => {
    const items = [...menu!.querySelectorAll<HTMLButtonElement>('button')];
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "Escape") { event.preventDefault(); close(); }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault(); items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
    }
  });
  document.body.append(menu);
  button.ariaExpanded = "true";
  menu.querySelector<HTMLButtonElement>('button')?.focus();
  const outside = (event: PointerEvent) => {
    if (menu?.contains(event.target as Node) || button.contains(event.target as Node)) return;
    close(); document.removeEventListener("pointerdown", outside, true);
  };
  document.addEventListener("pointerdown", outside, true);
}

/** Only hide the real OS buttons after the installed CLI advertises the matching
 * window commands. A stale web runtime must never leave a window without controls. */
export function syncDesktopChrome(): boolean {
  const services = desktopServices();
  const nativeSupported = Boolean(window.__SpotifyRedesignConfig?.desktopWindowControls && services?.native);
  if (nativeSupported && !desktopConnected()) void connectDesktop();
  const supported = nativeSupported && desktopConnected();
  const enabled = supported && active();
  if (nativeSupported && enabled !== hiddenNative && !changingNative) {
    changingNative = true;
    void services!.native!.setWindowButtonsVisibility(!enabled).then(() => {
      hiddenNative = enabled;
      changingNative = false;
      syncDesktopChrome();
    }).catch(error => { changingNative = false; console.warn("[Remixify] Native title bar is still available", error); });
  }
  if (!enabled || !hiddenNative) {
    document.getElementById("srd-custom-caption")?.remove();
    document.getElementById("srd-custom-menu")?.remove();
    if (!enabled) dismissMenu?.();
    return false;
  }
  document.documentElement.dataset.srdCaption = "custom";
  document.querySelectorAll('.srd-native-caption-frame, .srd-native-menu-frame').forEach(n => n.remove());
  if (!document.getElementById("srd-custom-caption")) {
    const controls = document.createElement("div");
    controls.id = "srd-custom-caption";
    controls.className = "srd-custom-caption";
    controls.setAttribute("role", "group");
    controls.ariaLabel = "Window controls";
    for (const [action, label] of [["minimize", "Minimize"], ["maximize", "Maximize or restore"], ["close", "Close window"]] as const) {
      const button = iconButton(action, label);
      button.dataset.srdWindowAction = action;
      button.addEventListener("click", () => dispatchWindowAction(action));
      controls.append(button);
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

/** Keep Spotify's own buttons and listeners; replace their visual icon only. */
export function syncCustomIcons(): void {
  const targets = document.querySelectorAll<HTMLButtonElement>('.srd-global-nav button, .srd-player button');
  for (const button of targets) {
    if (button.closest('.srd-backdrop')) continue;
    const test = button.dataset.testid || "";
    const label = (button.ariaLabel || button.title || "").toLowerCase();
    let name: IconName | undefined;
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
    button.querySelector(':scope > .srd-icon')?.remove();
    if (button.classList.contains("srd-settings-button")) button.replaceChildren(icon(name));
    else button.append(icon(name));
  }
}
