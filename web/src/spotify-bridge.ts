/** Small capability adapter for the desktop client's existing services.
 * Find its live registry through React context; never instantiate a second player
 * or depend on build-specific module IDs. */
export type Track = {
  uri: string;
  uid?: string | null;
  name: string;
  type?: string;
  artists?: { name: string }[];
  images?: { url: string }[];
  album?: { images?: { url: string }[] };
  duration?: { milliseconds: number };
};
export type Queue = { current?: Track | null; queued: Track[]; nextUp: Track[] };
type Events = { addListener(name: string, callback: () => void): (() => void) | void };
export type Player = {
  getQueue(): Queue;
  getState(): { item?: Track; isPaused?: boolean };
  getEvents(): Events;
  skipTo(track: Pick<Track, "uri" | "uid">): Promise<void>;
  playAsNextInQueue(tracks: Track[]): Promise<void>;
  reorderQueue(tracks: Pick<Track, "uri" | "uid">[], position: { before?: Pick<Track, "uri" | "uid">; after?: Pick<Track, "uri" | "uid"> }): Promise<void>;
};
type Registry = { resolveNoThrow(token: symbol): unknown };
export type DesktopServices = {
  player: Player;
  history?: { getContents(): Promise<{ items: Track[] }>; getEvents?(): Events };
  native?: { setWindowButtonsVisibility(visible: boolean): Promise<void> };
};
type Fiber = { child?: Fiber; sibling?: Fiber; return?: Fiber; dependencies?: { firstContext?: ContextDependency }; memoizedProps?: { value?: unknown } };
type ContextDependency = { memoizedValue?: unknown; next?: ContextDependency };
let cached: DesktopServices | undefined;

function fromRegistry(value: unknown): DesktopServices | undefined {
  if (!value || typeof (value as Registry).resolveNoThrow !== "function") return;
  const registry = value as Registry;
  try {
    const player = registry.resolveNoThrow(Symbol.for("PlayerAPI")) as Player | undefined;
    if (typeof player?.getQueue !== "function" || typeof player.reorderQueue !== "function") return;
    return {
      player,
      history: registry.resolveNoThrow(Symbol.for("PlayHistoryAPI")) as DesktopServices["history"],
      native: registry.resolveNoThrow(Symbol.for("NativeAPI")) as DesktopServices["native"],
    };
  } catch { return; }
}

export function desktopServices(): DesktopServices | undefined {
  if (cached) return cached;
  const host = document.querySelector("#main-view") || document.querySelector(".Root");
  if (!host) return;
  const key = Object.keys(host).find(key => key.startsWith("__reactFiber$"));
  if (!key) return;
  let fiber = (host as unknown as Record<string, Fiber>)[key];
  while (fiber?.return) fiber = fiber.return;
  const pending = [fiber];
  for (let visited = 0; pending.length && visited < 20_000; visited++) {
    const node = pending.pop();
    if (!node) continue;
    for (let dependency = node.dependencies?.firstContext; dependency; dependency = dependency.next) {
      const services = fromRegistry(dependency.memoizedValue);
      if (services) return cached = services;
    }
    const services = fromRegistry(node.memoizedProps?.value);
    if (services) return cached = services;
    if (node.sibling) pending.push(node.sibling);
    if (node.child) pending.push(node.child);
  }
}
