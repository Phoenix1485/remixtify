import { desktopServices, type DesktopServices, type Track } from "./spotify-bridge";
import { icon, iconButton } from "./icons";

type Tab = "history" | "queue";
const reference = (track: Track) => ({ uri: track.uri, uid: track.uid });
const identity = (track: Track) => `${track.uri}:${track.uid || ""}`;
const playable = (track: Track) => /^spotify:(track|episode|local):/.test(track.uri);
const text = (tag: string, className: string, value: string): HTMLElement => {
  const node = document.createElement(tag); node.className = className; node.textContent = value; return node;
};

class PlaybackPanel {
  readonly root = document.createElement("section");
  private tabs = document.createElement("div");
  private list = document.createElement("ol");
  private status = text("p", "srd-queue-status", "Connecting to Spotify…");
  private hint = text("p", "srd-queue-hint", "Drag the handle to change what plays next.");
  private tab: Tab = "queue";
  private services?: DesktopServices;
  private items: Track[] = [];
  private histories: Track[] = [];
  private signature = "";
  private busy = false;
  private refreshing = false;
  private dragging?: string;
  private unsubscribes: (() => void)[] = [];
  private lastHistory = 0;
  private actionError = "";
  private restoreFocus?: string;

  constructor() {
    this.root.id = "srd-playback-panel";
    this.root.className = "srd-queue-panel";
    this.root.ariaLabel = "Playback history and upcoming songs";
    this.tabs.className = "srd-queue-tabs";
    this.tabs.setAttribute("role", "tablist");
    for (const tab of ["history", "queue"] as const) {
      const button = iconButton(tab, tab === "history" ? "Song history" : "Up next");
      button.id = `srd-${tab}-tab`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", "srd-playback-list");
      button.append(document.createTextNode(tab === "history" ? "History" : "Up next"));
      button.addEventListener("click", () => this.select(tab));
      button.addEventListener("keydown", event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault(); this.select(tab === "history" ? "queue" : "history");
        this.tabs.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
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

  select(tab: Tab): void {
    this.actionError = "";
    this.tab = tab;
    this.signature = "";
    this.list.scrollTop = 0;
    for (const button of this.tabs.querySelectorAll<HTMLButtonElement>("button")) {
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

  private connect(): boolean {
    const services = desktopServices();
    if (!services) return false;
    if (this.services === services) return true;
    this.unsubscribes.forEach(unsubscribe => unsubscribe());
    this.unsubscribes = [];
    this.services = services;
    for (const event of ["queue_update", "queue_action_complete", "update"]) {
      const unsubscribe = services.player.getEvents().addListener(event, () => void this.refresh());
      if (typeof unsubscribe === "function") this.unsubscribes.push(unsubscribe);
    }
    return true;
  }

  async refresh(forceHistory = false): Promise<void> {
    if (this.refreshing || this.busy || this.dragging || !this.root.isConnected) return;
    if (!this.connect()) { this.status.textContent = "Waiting for Spotify’s player…"; return; }
    this.refreshing = true;
    try {
      const queue = this.services!.player.getQueue();
      this.items = [...queue.queued, ...queue.nextUp].filter(playable);
      if (this.tab === "history" && this.services!.history && (forceHistory || Date.now() - this.lastHistory > 15_000)) {
        let timer: number | undefined;
        const history = await Promise.race([
          this.services!.history.getContents(),
          new Promise<never>((_, reject) => { timer = window.setTimeout(() => reject(new Error("History took too long to load. Try the History tab again.")), 10_000); }),
        ]).finally(() => window.clearTimeout(timer));
        this.histories = history.items.filter(playable).slice(0, 300);
        this.lastHistory = Date.now();
      }
      this.status.textContent = this.actionError || (this.tab === "history" && !this.services!.history ? "History is unavailable in this Spotify version." : "");
      this.render();
    } catch (error) {
      this.status.textContent = error instanceof Error ? error.message : "Could not load playback. Try again shortly.";
    } finally { this.refreshing = false; }
  }

  private async run(action: () => Promise<void>, message: string): Promise<void> {
    if (this.busy || !this.services) return;
    this.busy = true;
    this.actionError = "";
    this.root.setAttribute("aria-busy", "true");
    this.status.textContent = message;
    this.render();
    try { await action(); this.status.textContent = ""; }
    catch (error) { this.actionError = `Spotify could not apply that change. ${error instanceof Error ? error.message : "Please try again."}`; this.status.textContent = this.actionError; }
    finally {
      this.busy = false;
      this.root.setAttribute("aria-busy", "false");
      // Read back the authoritative queue. Never pretend a failed move succeeded.
      this.signature = "";
      this.render();
      void this.refresh();
    }
  }

  private move(sourceKey: string, targetKey: string, after: boolean): void {
    const source = this.items.find(track => identity(track) === sourceKey);
    const target = this.items.find(track => identity(track) === targetKey);
    if (!source || !target || source === target) return;
    void this.run(() => this.services!.player.reorderQueue([reference(source)], after ? { after: reference(target) } : { before: reference(target) }), `Moving ${source.name}…`);
  }

  private render(): void {
    const tracks = this.tab === "history" ? this.histories : this.items;
    const signature = `${this.tab}:${this.busy}:${tracks.map(track => identity(track) + track.name).join("|")}`;
    if (signature === this.signature) return;
    const focus = this.restoreFocus || (this.root.contains(document.activeElement) ? (document.activeElement as HTMLElement).dataset.focusKey : undefined);
    if (this.busy) this.restoreFocus = focus;
    const scrollTop = this.list.scrollTop;
    this.signature = signature;
    this.list.replaceChildren();
    if (!tracks.length) {
      const empty = document.createElement("li");
      empty.className = "srd-queue-empty";
      empty.append(icon(this.tab), document.createTextNode(this.tab === "history" ? "Your recent songs will appear here." : "Start playing to see what’s next."));
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
      const artwork = document.createElement("div"); artwork.className = "srd-queue-artwork";
      artwork.append(icon("music"));
      const source = (track.images || track.album?.images)?.[0]?.url;
      if (source && /^(https:\/\/|spotify:image:)/.test(source)) {
        const image = document.createElement("img"); image.src = source; image.alt = ""; image.loading = "lazy";
        image.addEventListener("error", () => image.remove(), { once: true }); artwork.append(image);
      }
      const copy = text("span", "srd-queue-copy", "");
      copy.append(text("span", "srd-queue-name", track.name), text("span", "srd-queue-artists", track.artists?.map(a => a.name).join(", ") || "Spotify"));
      play.append(artwork, copy);
      play.addEventListener("click", () => void this.run(
        () => this.tab === "history" ? this.services!.player.playAsNextInQueue([track]) : this.services!.player.skipTo(reference(track)),
        `Playing ${track.name}…`,
      ));
      row.append(play);
      if (this.tab === "queue") {
        row.draggable = !this.busy;
        const moves = document.createElement("div"); moves.className = "srd-queue-moves";
        for (const [direction, label, delta] of [["up", "Move up", -1], ["down", "Move down", 1]] as const) {
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
        handle.addEventListener("keydown", event => {
          const delta = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
          if (event.altKey && delta && tracks[index + delta]) { event.preventDefault(); this.move(key, identity(tracks[index + delta]), delta > 0); }
        });
        row.append(moves, handle);
        row.addEventListener("dragstart", event => {
          if (this.busy || !event.dataTransfer) { event.preventDefault(); return; }
          this.dragging = key;
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("application/x-remixify-queue", key);
          row.classList.add("srd-queue-row--dragging");
        });
        row.addEventListener("dragover", event => {
          if (!this.dragging || this.dragging === key || this.busy) return;
          event.preventDefault();
          if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
          const bounds = row.getBoundingClientRect();
          row.dataset.drop = event.clientY > bounds.y + bounds.height / 2 ? "after" : "before";
          const viewport = this.list.getBoundingClientRect();
          if (event.clientY < viewport.y + 35) this.list.scrollTop -= 12;
          if (event.clientY > viewport.bottom - 35) this.list.scrollTop += 12;
        });
        row.addEventListener("dragleave", event => { if (!row.contains(event.relatedTarget as Node)) delete row.dataset.drop; });
        row.addEventListener("drop", event => {
          event.preventDefault();
          const source = this.dragging;
          this.dragging = undefined;
          const after = row.dataset.drop === "after";
          delete row.dataset.drop;
          if (source) this.move(source, key, after);
        });
        row.addEventListener("dragend", () => {
          this.dragging = undefined;
          this.root.querySelectorAll<HTMLElement>('[data-drop]').forEach(node => delete node.dataset.drop);
          row.classList.remove("srd-queue-row--dragging");
        });
      }
      this.list.append(row);
    });
    this.list.scrollTop = scrollTop;
    if (focus) [...this.root.querySelectorAll<HTMLElement>('[data-focus-key]')].find(node => node.dataset.focusKey === focus)?.focus({ preventScroll: true });
    if (!this.busy) this.restoreFocus = undefined;
  }
}

let panel: PlaybackPanel | undefined;
let observedZone: HTMLElement | undefined;
let resize: ResizeObserver | undefined;

export function syncPlaybackPanel(zone: HTMLElement, player: HTMLElement): void {
  panel ||= new PlaybackPanel();
  if (panel.root.parentElement !== zone) zone.append(panel.root);
  if (observedZone !== zone) {
    observedZone = zone;
    resize?.disconnect();
    resize = new ResizeObserver(() => {
      const cover = zone.querySelector<HTMLElement>(':scope > .srd-player-artwork');
      zone.style.setProperty("--srd-now-playing-height", `${player.getBoundingClientRect().height + (cover?.getBoundingClientRect().height || 0)}px`);
    });
    resize.observe(player);
    const artwork = zone.querySelector('.srd-player-artwork');
    if (artwork) resize.observe(artwork);
  }
  void panel.refresh();
}

window.setInterval(() => { if (!document.hidden) void panel?.refresh(); }, 5_000);
