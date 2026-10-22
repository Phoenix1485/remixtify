import styles from "./core.css";
import layoutFixes from "./layout-fixes.css";
import type {
  PackageDefinition,
  PackageLifecycle,
  RuntimeSettings,
  ThemeDefinition,
  UpdateChannel,
  UpdateNotice,
} from "./types";

const SETTINGS_KEY = "spotify-redesign:settings:v2";
const PACKAGES_KEY = "spotify-redesign:installed-packages";
const STYLE_ID = "spotify-redesign-core-style";
const THEME_LINK_ID = "spotify-redesign-theme-style";
const CUSTOM_STYLE_ID = "spotify-redesign-custom-style";
const CUSTOM_CSS_KEY = "spotify-redesign:custom-css:v1";
const THEME_CLASS = "srd-theme-active";
const DEFAULT_PRIMARY_COLOR = "#7c3aed";
const DEFAULT_SECONDARY_COLOR = "#14b8a6";
const DEFAULT_THEME = "nocturne";
const DEFAULT_WALLPAPER = "lunar-bloom";
const MAX_CUSTOM_CSS_BYTES = 512 * 1024;
const MAX_WALLPAPER_BYTES = 32 * 1024 * 1024;
const WALLPAPER_DB = "spotify-redesign-assets";
const WALLPAPER_STORE = "wallpapers";
const CUSTOM_WALLPAPER_KEY = "custom";
const WALLPAPERS = [
  {
    id: "lunar-bloom",
    name: "Lunar Bloom",
    image:
      "radial-gradient(circle at 74% 16%, rgba(218,196,255,.92) 0 2%, transparent 24%), radial-gradient(circle at 18% 78%, rgba(45,19,92,.86), transparent 42%), linear-gradient(138deg, #090716 0%, #34235f 48%, #ba8dd8 100%)",
  },
  {
    id: "coral-dusk",
    name: "Coral Dusk",
    image:
      "radial-gradient(circle at 24% 22%, rgba(255,191,159,.76), transparent 32%), radial-gradient(circle at 82% 72%, rgba(92,24,77,.86), transparent 46%), linear-gradient(145deg, #1a1122, #a74467 58%, #ef9b86)",
  },
  {
    id: "pacific-glass",
    name: "Pacific Glass",
    image:
      "radial-gradient(ellipse at 78% 12%, rgba(117,242,229,.8), transparent 30%), radial-gradient(circle at 16% 82%, rgba(9,54,88,.94), transparent 44%), linear-gradient(132deg, #031925, #087f8c 52%, #8be8d8)",
  },
  {
    id: "ember-silk",
    name: "Ember Silk",
    image:
      "radial-gradient(circle at 68% 30%, rgba(255,186,104,.88), transparent 25%), radial-gradient(circle at 15% 88%, rgba(101,18,30,.95), transparent 40%), linear-gradient(150deg, #180b12, #98392d 58%, #f0a35e)",
  },
  {
    id: "alpine-mist",
    name: "Alpine Mist",
    image:
      "radial-gradient(ellipse at 22% 18%, rgba(219,248,238,.82), transparent 34%), radial-gradient(circle at 82% 88%, rgba(20,61,55,.92), transparent 45%), linear-gradient(130deg, #081d20, #397a6a 54%, #bad7be)",
  },
  {
    id: "violet-veil",
    name: "Violet Veil",
    image:
      "radial-gradient(circle at 82% 20%, rgba(241,168,255,.78), transparent 28%), radial-gradient(circle at 16% 72%, rgba(49,13,104,.95), transparent 42%), linear-gradient(142deg, #0c061e, #5c2aa8 55%, #db8fe8)",
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    image:
      "radial-gradient(circle at 74% 22%, rgba(255,235,169,.95), transparent 25%), radial-gradient(ellipse at 20% 84%, rgba(76,34,16,.95), transparent 42%), linear-gradient(135deg, #25120a, #b46c32 52%, #f4c67c)",
  },
  {
    id: "rosewater",
    name: "Rosewater",
    image:
      "radial-gradient(circle at 18% 20%, rgba(255,224,235,.82), transparent 31%), radial-gradient(circle at 82% 82%, rgba(102,32,68,.9), transparent 42%), linear-gradient(142deg, #210d1a, #a34e78 55%, #e8a3bd)",
  },
  {
    id: "midnight-lake",
    name: "Midnight Lake",
    image:
      "radial-gradient(ellipse at 65% 16%, rgba(105,179,255,.74), transparent 28%), radial-gradient(circle at 18% 88%, rgba(2,22,60,.98), transparent 44%), linear-gradient(140deg, #020817, #123b73 55%, #5b8bb6)",
  },
  {
    id: "sage-stone",
    name: "Sage Stone",
    image:
      "radial-gradient(circle at 78% 18%, rgba(221,232,202,.72), transparent 31%), radial-gradient(circle at 20% 78%, rgba(39,48,39,.94), transparent 43%), linear-gradient(137deg, #101713, #5d6f5c 56%, #aeb79a)",
  },
  {
    id: "neon-rain",
    name: "Neon Rain",
    image:
      "radial-gradient(ellipse at 80% 24%, rgba(0,241,255,.72), transparent 27%), radial-gradient(circle at 20% 78%, rgba(255,29,167,.66), transparent 36%), linear-gradient(145deg, #030616, #26195c 50%, #0a6e80)",
  },
  {
    id: "monochrome-cloud",
    name: "Cloud Study",
    image:
      "radial-gradient(circle at 72% 16%, rgba(255,255,255,.66), transparent 28%), radial-gradient(circle at 18% 82%, rgba(22,25,31,.96), transparent 43%), linear-gradient(135deg, #08090c, #555a63 55%, #b9bdc4)",
  },
] as const;
let activeChannel: UpdateChannel | undefined;
let activeChannelUrl = "";
let wallpaperObjectUrl = "";
let wallpaperRequest = 0;

function validColor(value: unknown, fallback: string): string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : fallback;
}

function oneOf<T extends string>(value: unknown, values: readonly T[], fallback: T): T {
  return typeof value === "string" && values.includes(value as T) ? (value as T) : fallback;
}

function numberBetween(value: unknown, minimum: number, maximum: number, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, value))
    : fallback;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readSettings(): RuntimeSettings {
  const stored = readJSON<Partial<RuntimeSettings>>(SETTINGS_KEY, {});
  return {
    enabled: stored.enabled ?? true,
    autoUpdate: window.__SpotifyRedesignBootstrap?.autoUpdate ?? true,
    primaryColor: validColor(stored.primaryColor, DEFAULT_PRIMARY_COLOR),
    secondaryColor: validColor(stored.secondaryColor, DEFAULT_SECONDARY_COLOR),
    theme: typeof stored.theme === "string" && stored.theme.trim() ? stored.theme : DEFAULT_THEME,
    wallpaper:
      typeof stored.wallpaper === "string" &&
      (stored.wallpaper === "custom" || WALLPAPERS.some((wallpaper) => wallpaper.id === stored.wallpaper))
        ? stored.wallpaper
        : DEFAULT_WALLPAPER,
    layout: oneOf(stored.layout, ["studio", "classic"] as const, "studio"),
    density: oneOf(stored.density, ["comfortable", "compact"] as const, "comfortable"),
    backgroundEffect: oneOf(stored.backgroundEffect, ["none", "ambient", "grid"] as const, "ambient"),
    motion: stored.motion ?? true,
    glassClarity: numberBetween(stored.glassClarity, 0, 100, 78),
    glassBlur: numberBetween(stored.glassBlur, 0, 48, 24),
    showSpotlight: stored.showSpotlight ?? true,
  };
}

function openWallpaperDatabase(): Promise<IDBDatabase> {
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

async function readCustomWallpaper(): Promise<Blob | undefined> {
  const database = await openWallpaperDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(WALLPAPER_STORE, "readonly");
    const request = transaction.objectStore(WALLPAPER_STORE).get(CUSTOM_WALLPAPER_KEY);
    request.addEventListener("success", () => resolve(request.result instanceof Blob ? request.result : undefined));
    request.addEventListener("error", () => reject(request.error || new Error("Could not read wallpaper")));
    transaction.addEventListener("complete", () => database.close());
  });
}

async function writeCustomWallpaper(blob: Blob): Promise<void> {
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

function setWallpaperImage(image: string): void {
  document.documentElement.style.setProperty("--srd-wallpaper-image", image);
}

function applyWallpaper(settings: RuntimeSettings): void {
  const requestId = ++wallpaperRequest;
  document.documentElement.dataset.srdWallpaper = settings.wallpaper;
  if (settings.wallpaper !== "custom") {
    const wallpaper = WALLPAPERS.find((candidate) => candidate.id === settings.wallpaper) || WALLPAPERS[0];
    if (wallpaperObjectUrl) URL.revokeObjectURL(wallpaperObjectUrl);
    wallpaperObjectUrl = "";
    setWallpaperImage(wallpaper.image);
    return;
  }
  void readCustomWallpaper()
    .then((blob) => {
      if (requestId !== wallpaperRequest) return;
      if (!blob) throw new Error("No custom wallpaper is stored");
      if (wallpaperObjectUrl) URL.revokeObjectURL(wallpaperObjectUrl);
      wallpaperObjectUrl = URL.createObjectURL(blob);
      setWallpaperImage(`url("${wallpaperObjectUrl}")`);
    })
    .catch(() => {
      if (requestId !== wallpaperRequest) return;
      const next = { ...settings, wallpaper: DEFAULT_WALLPAPER };
      writeSettings(next);
      document.documentElement.dataset.srdWallpaper = DEFAULT_WALLPAPER;
      setWallpaperImage(WALLPAPERS[0].image);
    });
}

function mountAtmosphere(): void {
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

function writeSettings(settings: RuntimeSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function readCustomCSS(): string {
  return localStorage.getItem(CUSTOM_CSS_KEY) || "";
}

function applyCustomCSS(css = readCustomCSS(), enabled = readSettings().enabled): void {
  let style = document.querySelector<HTMLStyleElement>(`#${CUSTOM_STYLE_ID}`);
  if (!style) {
    style = element("style");
    style.id = CUSTOM_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = enabled ? css : "";
  document.head.appendChild(style);
}

function themeDefinitions(channel = activeChannel): ThemeDefinition[] {
  return channel?.themes?.length
    ? channel.themes
    : [
        {
          id: DEFAULT_THEME,
          name: "Nocturne",
          description: "The built-in ultra-dark appearance.",
          entry: "",
          primaryColor: DEFAULT_PRIMARY_COLOR,
          secondaryColor: DEFAULT_SECONDARY_COLOR,
        },
      ];
}

function applyThemeStylesheet(settings: RuntimeSettings): void {
  const definitions = themeDefinitions();
  const definition = definitions.find((candidate) => candidate.id === settings.theme) || definitions[0];
  document.documentElement.dataset.srdTheme = definition.id;
  const existing = document.querySelector<HTMLLinkElement>(`#${THEME_LINK_ID}`);
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

function applyThemeState(settings: RuntimeSettings): void {
  const root = document.documentElement;
  const clarity = numberBetween(settings.glassClarity, 0, 100, 78);
  const blur = numberBetween(settings.glassBlur, 0, 48, 24);
  const alpha = (maximum: number, reduction: number, minimum: number) =>
    Math.max(minimum, maximum - clarity * reduction).toFixed(3);
  root.classList.toggle(THEME_CLASS, settings.enabled);
  root.style.setProperty("--srd-primary", validColor(settings.primaryColor, DEFAULT_PRIMARY_COLOR));
  root.style.setProperty(
    "--srd-secondary",
    validColor(settings.secondaryColor, DEFAULT_SECONDARY_COLOR),
  );
  root.style.setProperty("--srd-glass-blur", `${blur}px`);
  root.style.setProperty("--srd-glass-nav-alpha", alpha(0.54, 0.0037, 0.17));
  root.style.setProperty("--srd-glass-shell-alpha", alpha(0.5, 0.0034, 0.16));
  root.style.setProperty("--srd-glass-shelf-alpha", alpha(0.49, 0.00335, 0.15));
  root.style.setProperty("--srd-glass-card-alpha", alpha(0.16, 0.0016, 0.018));
  root.style.setProperty("--srd-glass-control-alpha", alpha(0.2, 0.0015, 0.05));
  root.style.setProperty("--srd-glass-modal-alpha", alpha(0.72, 0.0038, 0.34));
  root.style.setProperty("--srd-glass-player-alpha", alpha(0.64, 0.0033, 0.31));
  root.dataset.srdLayout = settings.layout;
  root.dataset.srdDensity = settings.density;
  root.dataset.srdEffect = settings.backgroundEffect;
  root.dataset.srdMotion = settings.motion ? "on" : "off";
  root.dataset.srdSpotlight = settings.showSpotlight ? "on" : "off";
  applyWallpaper(settings);
  applyThemeStylesheet(settings);
}

function syncSidebarLayout(shell: HTMLElement, sidebar: HTMLElement): void {
  const requestedWidth = Number.parseFloat(sidebar.style.getPropertyValue("--left-sidebar-width"));
  const libraryToggle = Array.from(sidebar.querySelectorAll<HTMLElement>('button, [role="button"]')).find((node) =>
    /your library/i.test(node.getAttribute("aria-label") || ""),
  );
  const collapsedFromToggle = /^open your library$/i.test(libraryToggle?.getAttribute("aria-label") || "");
  const collapsed = Number.isFinite(requestedWidth) ? requestedWidth <= 100 : collapsedFromToggle;
  const width = Number.isFinite(requestedWidth)
    ? Math.min(420, Math.max(72, requestedWidth))
    : collapsed
      ? 72
      : 260;
  shell.style.setProperty("--srd-library-width", `${width}px`);
  shell.classList.toggle("srd-library-collapsed", collapsed);
  shell.dataset.srdLibrary = collapsed ? "collapsed" : "expanded";
}

function syncPlayerArtwork(playerZone: HTMLElement, player: HTMLElement): void {
  const artworkCandidate = player.querySelector<HTMLElement>('[data-testid="cover-art-image"]');
  const image =
    (artworkCandidate instanceof HTMLImageElement ? artworkCandidate : artworkCandidate?.querySelector("img")) ||
    player.querySelector<HTMLImageElement>('img[src*="image"], img');
  const source = image?.currentSrc || image?.src || "";
  let backdrop = playerZone.querySelector<HTMLDivElement>(":scope > .srd-player-artwork");
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

function labelWindowControls(): void {
  const parents = new Set<HTMLElement>();
  for (const node of document.querySelectorAll<HTMLElement>('button, [role="button"]')) {
    if (node.closest(".srd-modal, .srd-backdrop")) continue;
    const signature = [
      node.getAttribute("aria-label"),
      node.getAttribute("title"),
      node.getAttribute("data-testid"),
      typeof node.className === "string" ? node.className : "",
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    let action = "";
    if (/minimi[sz]e|window[-_ ]min/.test(signature)) action = "minimize";
    else if (/maximi[sz]e|restore down|window[-_ ]max/.test(signature)) action = "maximize";
    else if (/^(close|close window)$|window[-_ ]close|caption[-_ ]close|titlebar[-_ ]close/.test(signature)) action = "close";
    if (!action) continue;
    const rect = node.getBoundingClientRect();
    if (rect.top > 80 || rect.right < window.innerWidth - 400) continue;
    node.classList.add("srd-window-control");
    node.dataset.srdWindowAction = action;
    if (node.parentElement) parents.add(node.parentElement);
  }
  for (const parent of parents) {
    if (parent.querySelectorAll(":scope > .srd-window-control").length >= 2) {
      parent.classList.add("srd-window-controls");
    }
  }
}

function labelSpotifyShell(): boolean {
  const root = document.querySelector<HTMLElement>(".Root");
  const main = document.querySelector<HTMLElement>("#main-view");
  if (!root || !main) return false;

  const shell = main.parentElement;
  if (!shell || getComputedStyle(shell).display !== "grid") return false;

  shell.classList.add("srd-app-grid");
  document.querySelector<HTMLElement>('[data-testid="global-nav-bar"]')?.classList.add("srd-global-nav");
  const sidebar = document.querySelector<HTMLElement>("#Desktop_LeftSidebar_Id");
  sidebar?.classList.add("srd-left-sidebar");
  if (sidebar) syncSidebarLayout(shell, sidebar);
  main.classList.add("srd-main-view");

  let playerZone: HTMLElement | undefined;
  for (const child of Array.from(shell.children)) {
    if (!(child instanceof HTMLElement)) continue;
    const gridArea = getComputedStyle(child).gridArea.trim();
    const isRightSidebar = Boolean(child.querySelector('[data-testid="NPV_Panel_OpenDiv"]')) || gridArea === "right-sidebar";
    const isPlayerZone =
      child.matches('[data-testid="now-playing-bar"]') || Boolean(child.querySelector('[data-testid="now-playing-bar"]'));
    child.classList.toggle("srd-right-sidebar", isRightSidebar);
    child.classList.toggle("srd-player-zone", isPlayerZone);
    if (isPlayerZone) playerZone = child;
  }
  const player = document.querySelector<HTMLElement>('[data-testid="now-playing-bar"]');
  player?.classList.add("srd-player");
  if (playerZone && player) syncPlayerArtwork(playerZone, player);
  labelWindowControls();
  return true;
}

function labelSpotifyStructure(): boolean {
  return labelSpotifyShell();
}

function mountStructureObserver(): void {
  let shellFrame: number | undefined;
  let sidebarFrame: number | undefined;
  let sidebarObserver: MutationObserver | undefined;
  let observedSidebar: HTMLElement | undefined;
  const syncShell = () => {
    if (shellFrame !== undefined) return;
    shellFrame = window.requestAnimationFrame(() => {
      shellFrame = undefined;
      labelSpotifyShell();
      observeSidebarWidth();
    });
  };
  const schedule = () => {
    syncShell();
  };
  const syncSidebarWidth = () => {
    if (sidebarFrame !== undefined) return;
    sidebarFrame = window.requestAnimationFrame(() => {
      sidebarFrame = undefined;
      const sidebar = document.querySelector<HTMLElement>("#Desktop_LeftSidebar_Id");
      const main = document.querySelector<HTMLElement>("#main-view");
      const shell = main?.parentElement;
      if (sidebar && shell instanceof HTMLElement) syncSidebarLayout(shell, sidebar);
    });
  };
  const followSidebarWidth = () => {
    const deadline = performance.now() + 1200;
    const follow = () => {
      const sidebar = document.querySelector<HTMLElement>("#Desktop_LeftSidebar_Id");
      const main = document.querySelector<HTMLElement>("#main-view");
      const shell = main?.parentElement;
      if (sidebar && shell instanceof HTMLElement) syncSidebarLayout(shell, sidebar);
      if (performance.now() < deadline) window.requestAnimationFrame(follow);
    };
    window.requestAnimationFrame(follow);
  };
  const observeSidebarWidth = () => {
    const sidebar = document.querySelector<HTMLElement>("#Desktop_LeftSidebar_Id") || undefined;
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
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest("#Desktop_LeftSidebar_Id")) return;
      followSidebarWidth();
    },
    { capture: true },
  );
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function notify(message: string, error = false): void {
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
    fontSize: "13px",
  });
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2800);
}

class PackageManager {
  private readonly definitions: Map<string, PackageDefinition>;
  private readonly lifecycles = new Map<string, PackageLifecycle>();
  private readonly active = new Set<string>();
  private readonly scripts = new Map<string, HTMLScriptElement>();
  private readonly waiters = new Map<string, (lifecycle: PackageLifecycle) => void>();
  private installed = new Set(readJSON<string[]>(PACKAGES_KEY, []));

  constructor(
    private readonly channel: UpdateChannel,
    private readonly channelUrl: string,
  ) {
    this.definitions = new Map(channel.packages.map((definition) => [definition.id, definition]));
    this.installed = new Set([...this.installed].filter((id) => this.definitions.has(id)));
    this.persist();
  }

  list(): PackageDefinition[] {
    return [...this.definitions.values()];
  }

  isInstalled(id: string): boolean {
    return this.installed.has(id);
  }

  register(id: string, lifecycle: PackageLifecycle): void {
    if (!this.definitions.has(id)) {
      console.warn(`[Remixify] Ignoring unregistered package: ${id}`);
      return;
    }
    this.lifecycles.set(id, lifecycle);
    this.waiters.get(id)?.(lifecycle);
    this.waiters.delete(id);
  }

  async activateInstalled(): Promise<void> {
    for (const id of this.installed) {
      try {
        await this.activate(id);
      } catch (error) {
        console.error(`[Remixify] Package ${id} failed`, error);
        notify(`Could not start ${this.definitions.get(id)?.name || id}`, true);
      }
    }
  }

  async install(id: string): Promise<void> {
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

  async uninstall(id: string): Promise<void> {
    await this.deactivate(id);
    this.installed.delete(id);
    this.persist();
  }

  async deactivateAll(): Promise<void> {
    for (const id of [...this.active]) await this.deactivate(id);
  }

  private persist(): void {
    localStorage.setItem(PACKAGES_KEY, JSON.stringify([...this.installed]));
  }

  private async activate(id: string): Promise<void> {
    if (this.active.has(id)) return;
    let lifecycle = this.lifecycles.get(id);
    if (!lifecycle) lifecycle = await this.load(id);
    await lifecycle.activate();
    this.active.add(id);
  }

  private async deactivate(id: string): Promise<void> {
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

  private load(id: string): Promise<PackageLifecycle> {
    const definition = this.definitions.get(id);
    if (!definition) return Promise.reject(new Error(`Unknown package: ${id}`));

    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        this.waiters.delete(id);
        reject(new Error(`Package ${id} did not register itself`));
      }, 10_000);

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
        { once: true },
      );
      this.scripts.set(id, script);
      document.body.appendChild(script);
    });
  }
}

function injectCoreStyle(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = element("style");
  style.id = STYLE_ID;
  style.textContent = `${styles}\n${layoutFixes}`;
  document.head.appendChild(style);
}

function makeToggle(value: boolean, onChange: (next: boolean) => void): HTMLButtonElement {
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

function makeColorControl(
  label: string,
  value: string,
  onInput: (color: string) => void,
): HTMLLabelElement {
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

function makeSegmentedControl<T extends string>(
  value: T,
  options: ReadonlyArray<{ value: T; label: string }>,
  onChange: (value: T) => void,
): HTMLDivElement {
  const group = element("div", "srd-segmented");
  group.role = "group";
  for (const option of options) {
    const button = element("button", "srd-segmented-option", option.label);
    button.type = "button";
    button.ariaPressed = String(option.value === value);
    button.addEventListener("click", () => {
      for (const sibling of group.querySelectorAll<HTMLButtonElement>(".srd-segmented-option")) {
        sibling.ariaPressed = String(sibling === button);
      }
      onChange(option.value);
    });
    group.appendChild(button);
  }
  return group;
}

function makeRangeControl(
  value: number,
  minimum: number,
  maximum: number,
  suffix: string,
  onInput: (value: number) => void,
): HTMLDivElement {
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

function createSettingsModal(manager: PackageManager, channel: UpdateChannel, usingFallback: boolean): HTMLElement {
  const backdrop = element("div", "srd-backdrop");
  const modal = element("section", "srd-modal");
  const header = element("header", "srd-modal-header");
  const title = element("h2", "srd-modal-title", "Remixify");
  const close = element("button", "srd-close", "\u00d7");
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
  const onKey = (event: KeyboardEvent) => {
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
    const updateAppearance = (patch: Partial<RuntimeSettings>) => {
      const next = { ...readSettings(), ...patch };
      writeSettings(next);
      applyThemeState(next);
    };

    const enabledRow = element("div", "srd-row");
    const enabledCopy = element("div");
    enabledCopy.append(
      element("h3", "", "Enable customizations"),
      element("p", "", "Turn off every installed package while keeping this settings button available."),
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
      }),
    );

    const themeSection = element("section", "srd-theme-section");
    const themeHeading = element("div", "srd-theme-heading");
    themeHeading.append(
      element("h3", "", "Visual theme"),
      element("p", "", "Themes change only the visual layer; the Studio structure stays consistent."),
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
          secondaryColor: validColor(definition.secondaryColor, DEFAULT_SECONDARY_COLOR),
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
      element("p", "", "Choose the primary accent and the secondary highlight. Changes appear immediately."),
    );
    const colorControls = element("div", "srd-color-controls");
    const updateColor = (key: "primaryColor" | "secondaryColor", color: string) => {
      const next = { ...readSettings(), [key]: color };
      writeSettings(next);
      applyThemeState(next);
    };
    const primaryControl = makeColorControl("Main", settings.primaryColor, (color) =>
      updateColor("primaryColor", color),
    );
    const secondaryControl = makeColorControl("Secondary", settings.secondaryColor, (color) =>
      updateColor("secondaryColor", color),
    );
    const resetColors = element("button", "srd-color-reset", "Reset");
    resetColors.type = "button";
    resetColors.addEventListener("click", () => {
      const next = {
        ...readSettings(),
        primaryColor: DEFAULT_PRIMARY_COLOR,
        secondaryColor: DEFAULT_SECONDARY_COLOR,
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
      element("p", "", "Liquid Glass rebuilds Spotify around translucent panes and a full-height artwork player."),
    );
    layoutRow.append(
      layoutCopy,
      makeSegmentedControl(
        settings.layout,
        [
          { value: "studio", label: "Liquid Glass" },
          { value: "classic", label: "Classic" },
        ],
        (layout) => updateAppearance({ layout }),
      ),
    );

    const clarityRow = element("div", "srd-row");
    const clarityCopy = element("div");
    clarityCopy.append(
      element("h3", "", "Glass clarity"),
      element("p", "", "Raise this to reveal more of the selected wallpaper through every glass surface."),
    );
    const clarityControl = makeRangeControl(settings.glassClarity, 0, 100, "%", (glassClarity) =>
      updateAppearance({ glassClarity }),
    );
    clarityControl.querySelector("input")?.setAttribute("aria-label", "Glass clarity");
    clarityRow.append(clarityCopy, clarityControl);

    const blurRow = element("div", "srd-row");
    const blurCopy = element("div");
    blurCopy.append(
      element("h3", "", "Glass blur"),
      element("p", "", "Use a low value for sharper wallpaper detail or a high value for frosted glass."),
    );
    const blurControl = makeRangeControl(settings.glassBlur, 0, 48, " px", (glassBlur) =>
      updateAppearance({ glassBlur }),
    );
    blurControl.querySelector("input")?.setAttribute("aria-label", "Glass blur");
    blurRow.append(blurCopy, blurControl);

    const spotlightRow = element("div", "srd-row");
    const spotlightCopy = element("div");
    spotlightCopy.append(
      element("h3", "", "Spotify spotlight"),
      element("p", "", "Show or hide the large promotional panel at the top of Home."),
    );
    spotlightRow.append(
      spotlightCopy,
      makeToggle(settings.showSpotlight, (showSpotlight) => updateAppearance({ showSpotlight })),
    );

    const densityRow = element("div", "srd-row");
    const densityCopy = element("div");
    densityCopy.append(
      element("h3", "", "Interface density"),
      element("p", "", "Compact fits more music on screen without shrinking playback controls."),
    );
    densityRow.append(
      densityCopy,
      makeSegmentedControl(
        settings.density,
        [
          { value: "comfortable", label: "Comfort" },
          { value: "compact", label: "Compact" },
        ],
        (density) => updateAppearance({ density }),
      ),
    );

    const effectRow = element("div", "srd-row");
    const effectCopy = element("div");
    effectCopy.append(
      element("h3", "", "Background effect"),
      element("p", "", "CSS-only effects add atmosphere without a canvas or continuous rendering loop."),
    );
    effectRow.append(
      effectCopy,
      makeSegmentedControl(
        settings.backgroundEffect,
        [
          { value: "none", label: "None" },
          { value: "ambient", label: "Ambient" },
          { value: "grid", label: "Grid" },
        ],
        (backgroundEffect) => updateAppearance({ backgroundEffect }),
      ),
    );

    const motionRow = element("div", "srd-row");
    const motionCopy = element("div");
    motionCopy.append(
      element("h3", "", "Subtle animations"),
      element("p", "", "Uses slow compositor-only transforms and pauses when reduced motion is requested."),
    );
    motionRow.append(
      motionCopy,
      makeToggle(settings.motion, (motion) => updateAppearance({ motion })),
    );

    const customSection = element("section", "srd-custom-css");
    const customHeading = element("div", "srd-custom-css-heading");
    customHeading.append(
      element("h3", "", "Custom CSS"),
      element(
        "p",
        "",
        "Paste CSS or import a .css file. It loads after the selected theme and is stored only on this PC.",
      ),
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
      notify(`${file.name} loaded — press Apply CSS`);
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
        settings.autoUpdate
          ? "Updates download in the background. You always choose when to install and restart Spotify."
          : "A download button appears in the top bar when a release is available.",
      ),
    );
    updateRow.append(updateCopy, element("div", "srd-meta", settings.autoUpdate ? "Enabled" : "Manual"));

    const status = element("div", "srd-row");
    const statusCopy = element("div");
    statusCopy.append(
      element("h3", "", `Runtime ${channel.version}`),
      element(
        "p",
        "",
        usingFallback ? "Offline/local runtime is active." : `Updated ${new Date(channel.publishedAt).toLocaleString()}.`,
      ),
    );
    status.appendChild(statusCopy);

    const deactivateRow = element("div", "srd-row");
    const deactivateCopy = element("div");
    deactivateCopy.append(
      element("h3", "", "Deactivate Remixify"),
      element("p", "", "Restore Spotify's original interface and turn off background maintenance."),
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
      spotlightRow,
      densityRow,
      motionRow,
      updateRow,
      status,
      deactivateRow,
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
    const updateAppearance = (patch: Partial<RuntimeSettings>) => {
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
        "Pair a liquid-glass color atmosphere with a wallpaper, tune the glow, or layer your own CSS.",
      ),
    );
    const livePreview = element("div", "srd-theme-live-preview");
    livePreview.ariaLabel = "Live theme preview";
    livePreview.append(
      element("span", "srd-preview-rail"),
      element("span", "srd-preview-header"),
      element("span", "srd-preview-card srd-preview-card--one"),
      element("span", "srd-preview-card srd-preview-card--two"),
      element("span", "srd-preview-player"),
    );
    studio.append(studioCopy, livePreview);

    const themeSection = element("section", "srd-theme-section");
    const themeHeading = element("div", "srd-theme-heading");
    themeHeading.append(
      element("h3", "", "Atmospheres"),
      element("p", "", `${definitions.length} lightweight CSS themes are included and switch instantly.`),
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
          secondaryColor: validColor(definition.secondaryColor, DEFAULT_SECONDARY_COLOR),
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
      element("p", "", "12 built-in scenes, plus your own still image or animated GIF. Custom files stay on this PC."),
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
      element("p", "", "Colors update live. Reset returns to the selected atmosphere's original palette."),
    );
    const customizerGrid = element("div", "srd-theme-customizer-grid");
    const colorControls = element("div", "srd-color-controls");
    const updateColor = (key: "primaryColor" | "secondaryColor", color: string) => {
      updateAppearance({ [key]: color });
    };
    colorControls.append(
      makeColorControl("Main", settings.primaryColor, (color) => updateColor("primaryColor", color)),
      makeColorControl("Secondary", settings.secondaryColor, (color) => updateColor("secondaryColor", color)),
    );
    const resetColors = element("button", "srd-color-reset", "Reset selected palette");
    resetColors.type = "button";
    resetColors.addEventListener("click", () => {
      const next = {
        ...readSettings(),
        primaryColor: validColor(activeDefinition?.primaryColor, DEFAULT_PRIMARY_COLOR),
        secondaryColor: validColor(activeDefinition?.secondaryColor, DEFAULT_SECONDARY_COLOR),
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
          { value: "grid", label: "Grid" },
        ],
        (backgroundEffect) => updateAppearance({ backgroundEffect }),
      ),
    );
    customizerGrid.append(colorControls, effectControl);
    customizer.append(customizerHeading, customizerGrid);

    const customSection = element("section", "srd-custom-css");
    const customHeading = element("div", "srd-custom-css-heading");
    customHeading.append(
      element("h3", "", "Custom CSS layer"),
      element("p", "", "Paste CSS or import a .css file. It loads after the selected theme and stays on this PC."),
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
      notify(`${file.name} loaded — press Apply CSS`);
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
      const icon = element("div", "srd-package-icon", definition.icon === "cat" ? "\ud83d\udc08" : "\u2726");
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
          `${definition.type || "extension"} \u00b7 ${definition.author} \u00b7 v${definition.version}`,
        ),
        button,
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
      card.append(icon, copy);
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

function createUpdateConfirmation(update: UpdateChannel): HTMLElement {
  const backdrop = element("div", "srd-backdrop");
  const modal = element("section", "srd-modal");
  const header = element("header", "srd-modal-header");
  const title = element("h2", "srd-modal-title", "Install update?");
  const close = element("button", "srd-close", "\u00d7");
  close.type = "button";
  close.ariaLabel = "Cancel update";
  header.append(title, close);

  const copy = element(
    "p",
    "srd-confirm-copy",
    `Version ${update.version} is ready. Spotify needs to close and reopen to finish installing it. Do you want to update now?`,
  );
  const actions = element("div", "srd-confirm-actions");
  const cancel = element("button", "srd-button", "Not now");
  const install = element("button", "srd-button srd-button--primary", "Update now");
  cancel.type = install.type = "button";
  actions.append(cancel, install);
  modal.append(header, copy, actions);
  backdrop.appendChild(modal);

  const dismiss = () => backdrop.remove();
  close.addEventListener("click", dismiss);
  cancel.addEventListener("click", dismiss);
  backdrop.addEventListener("mousedown", (event) => {
    if (event.target === backdrop) dismiss();
  });
  install.addEventListener("click", () => {
    install.disabled = true;
    install.textContent = "Starting update\u2026";
    const action = document.createElement("a");
    action.href = "remixify://update-now";
    action.hidden = true;
    document.body.appendChild(action);
    action.click();
    action.remove();
  });
  return backdrop;
}

function createDeactivateConfirmation(): HTMLElement {
  const backdrop = element("div", "srd-backdrop");
  const modal = element("section", "srd-modal");
  const header = element("header", "srd-modal-header");
  const title = element("h2", "srd-modal-title", "Deactivate Remixify?");
  const close = element("button", "srd-close", "\u00d7");
  close.type = "button";
  close.ariaLabel = "Cancel deactivation";
  header.append(title, close);

  const copy = element(
    "p",
    "srd-confirm-copy",
    "Spotify will close and reopen with its original interface. Background maintenance will be disabled. You can reactivate the redesign by running installer.ps1 again.",
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
    const action = document.createElement("a");
    action.href = "remixify://deactivate";
    action.hidden = true;
    document.body.appendChild(action);
    action.click();
    action.remove();
  });
  return backdrop;
}

function mountTopbarControls(
  openSettings: () => void,
  availableUpdate: UpdateChannel | undefined,
  updateReady: boolean,
  autoDownload: boolean,
): void {
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
    { capture: true },
  );
  host.appendChild(settingsButton);
  const showAvailableUpdate = (notice: UpdateNotice) => {
    host.querySelector(".srd-update-button")?.remove();
    const update = notice.update;
    if (!update) return;
    const label = notice.ready ? "Update" : autoDownload ? "Downloading\u2026" : "Download available";
    const updateButton = element("button", "srd-update-button", label);
    updateButton.type = "button";
    updateButton.title = notice.ready
      ? `Install Remixify ${update.version}`
      : `Download Remixify ${update.version}`;
    updateButton.disabled = !notice.ready && autoDownload;
    updateButton.addEventListener("click", () => {
      if (!notice.ready) {
        updateButton.disabled = true;
        updateButton.textContent = "Downloading\u2026";
        const action = document.createElement("a");
        action.href = "remixify://download-update";
        action.hidden = true;
        document.body.appendChild(action);
        action.click();
        action.remove();
        return;
      }
      document.querySelector(".srd-backdrop")?.remove();
      document.body.appendChild(createUpdateConfirmation(update));
    });
    host.appendChild(updateButton);
  };
  showAvailableUpdate({ update: availableUpdate, ready: updateReady });
  window.addEventListener("spotify-redesign:update-available", (event) => {
    showAvailableUpdate((event as CustomEvent<UpdateNotice>).detail);
  });
  document.body.appendChild(host);

  const findTopbar = (): Element | null => {
    const testedContent = document.querySelector('[data-testid="topbar-content"]');
    return (
      document.querySelector('[data-testid="global-nav-bar"]') ||
      document.querySelector(".main-topBar-topbarContent") ||
      testedContent?.parentElement ||
      document.querySelector(".main-globalNav-searchSection")?.parentElement ||
      null
    );
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
  let placementFrame: number | undefined;
  const schedulePlacement = () => {
    if (placementFrame !== undefined) return;
    placementFrame = window.requestAnimationFrame(() => {
      placementFrame = undefined;
      place();
    });
  };
  new MutationObserver(() => {
    if (!host.isConnected || host.classList.contains("srd-topbar-host--fallback")) schedulePlacement();
  }).observe(document.body, { childList: true, subtree: true });
}

async function start(): Promise<void> {
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
    openSettings,
  };

  mountTopbarControls(openSettings, bootstrap.availableUpdate, bootstrap.updateReady, bootstrap.autoUpdate);
  if (readSettings().enabled) await manager.activateInstalled();
  console.info(`[Remixify] Runtime ${bootstrap.channel.version} loaded`);
}

void start().catch((error) => console.error("[Remixify] Runtime failed", error));
