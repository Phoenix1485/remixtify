type Connection = { url: string; token: string };
let connection: Connection | undefined;
let pending: Promise<boolean> | undefined;
let checkedAt = 0;

export function desktopConnected(): boolean { return Boolean(connection); }

export function connectDesktop(): Promise<boolean> {
  if (pending) return pending;
  if (Date.now() - checkedAt < 4_000) return Promise.resolve(Boolean(connection));
  pending = (async () => {
    const previous = Boolean(connection);
    try {
      const channel = window.__SpotifyRedesignBootstrap?.channelUrl || new URL(window.__SpotifyRedesignConfig?.localChannelUrl || "redesign/channel.json", document.baseURI).href;
      const url = new URL("desktop-control.json", channel);
      url.searchParams.set("t", String(Date.now()));
      const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(1500) });
      if (!response.ok) throw Error("Desktop connection is unavailable");
      const descriptor = await response.json() as Connection;
      const endpoint = new URL(descriptor.url);
      if (endpoint.protocol !== "http:" || endpoint.hostname !== "127.0.0.1" || !/^[a-f0-9]{64}$/.test(descriptor.token)) throw Error("Invalid desktop connection");
      const health = await fetch(`${descriptor.url}/status`, { headers: { "X-Remixify-Token": descriptor.token }, signal: AbortSignal.timeout(1500) });
      if (!health.ok) throw Error("Desktop connection is unavailable");
      connection = descriptor;
    } catch { connection = undefined; }
    finally {
      checkedAt = Date.now();
      pending = undefined;
      if (previous !== Boolean(connection)) window.dispatchEvent(new Event("spotify-redesign:desktop-connected"));
    }
    return Boolean(connection);
  })();
  return pending;
}

export async function desktopAction(action: string): Promise<void> {
  if (!await connectDesktop() || !connection) throw Error("Restart Remixify to reconnect the desktop controls.");
  const response = await fetch(`${connection.url}/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Remixify-Token": connection.token },
    body: JSON.stringify({ action }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw Error((await response.text()).trim() || "Desktop action failed");
}

window.setInterval(() => { if (!document.hidden) void connectDesktop(); }, 5_000);
