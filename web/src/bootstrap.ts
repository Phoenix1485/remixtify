import type { RuntimeSettings, UpdateChannel, UpdateNotice } from "./types";

const SETTINGS_KEY = "spotify-redesign:settings:v2";
const DEFAULT_PRIMARY_COLOR = "#7c3aed";
const DEFAULT_SECONDARY_COLOR = "#14b8a6";

function readSettings(autoUpdate: boolean): RuntimeSettings {
  try {
    const settings = {
      enabled: true,
      primaryColor: DEFAULT_PRIMARY_COLOR,
      secondaryColor: DEFAULT_SECONDARY_COLOR,
      theme: "nocturne",
      wallpaper: "lunar-bloom",
      layout: "studio",
      density: "comfortable",
      backgroundEffect: "ambient",
      motion: true,
      glassClarity: 78,
      glassBlur: 24,
      showSpotlight: true,
      ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"),
      autoUpdate,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return settings;
  } catch {
    return {
      enabled: true,
      autoUpdate,
      primaryColor: DEFAULT_PRIMARY_COLOR,
      secondaryColor: DEFAULT_SECONDARY_COLOR,
      theme: "nocturne",
      wallpaper: "lunar-bloom",
      layout: "studio",
      density: "comfortable",
      backgroundEffect: "ambient",
      motion: true,
      glassClarity: 78,
      glassBlur: 24,
      showSpotlight: true,
    };
  }
}

async function fetchChannel(url: string): Promise<UpdateChannel> {
  const separator = url.includes("?") ? "&" : "?";
  const response = await fetch(`${url}${separator}t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Update channel returned HTTP ${response.status}`);
  const channel = (await response.json()) as UpdateChannel;
  if (channel.schemaVersion !== 1 || !channel.core?.entry || !Array.isArray(channel.packages)) {
    throw new Error("Unsupported update channel");
  }
  return channel;
}

async function fetchUpdateStatus(url: string): Promise<{ ready: boolean; version?: string }> {
  const separator = url.includes("?") ? "&" : "?";
  const response = await fetch(`${url}${separator}t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) return { ready: false };
  return (await response.json()) as { ready: boolean; version?: string };
}

function injectScript(url: string, integrity?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.defer = true;
    script.dataset.spotifyRedesignCore = "true";
    if (integrity) {
      script.integrity = integrity;
      script.crossOrigin = "anonymous";
    }
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error(`Could not load ${url}`)), { once: true });
    document.body.appendChild(script);
  });
}

async function start(): Promise<void> {
  const config = window.__SpotifyRedesignConfig;
  if (!config) throw new Error("Missing runtime-config.js");

  const settings = readSettings(config.autoUpdate);
  const remoteUrl = config.channelUrl?.trim();
  const localChannelUrl = new URL(config.localChannelUrl, document.baseURI).href;
  const statusUrl = new URL("update-status.json", localChannelUrl).href;
  const localChannel = await fetchChannel(localChannelUrl);
  let availableUpdate: UpdateChannel | undefined;
  let updateReady = false;

  if (remoteUrl) {
    try {
      const remoteChannel = await fetchChannel(remoteUrl);
      if (remoteChannel.version !== localChannel.version) {
        availableUpdate = remoteChannel;
        const status = await fetchUpdateStatus(statusUrl);
        updateReady = status.ready && status.version === (remoteChannel.cli?.version || remoteChannel.version);
      }
    } catch (error) {
      console.warn("[Remixify] Remote update check unavailable.", error);
    }
  }

  window.__SpotifyRedesignBootstrap = {
    channel: localChannel,
    channelUrl: localChannelUrl,
    usingFallback: true,
    autoUpdate: settings.autoUpdate,
    availableUpdate,
    updateReady,
  };
  const coreUrl = new URL(localChannel.core.entry, localChannelUrl).href;
  const separator = coreUrl.includes("?") ? "&" : "?";
  const coreCacheKey = `${localChannel.version}-${localChannel.core.integrity || "core"}`;
  await injectScript(`${coreUrl}${separator}v=${encodeURIComponent(coreCacheKey)}`, localChannel.core.integrity);

  if (remoteUrl) {
    const publish = async (refreshChannel: boolean) => {
      try {
        if (refreshChannel) {
          const remoteChannel = await fetchChannel(remoteUrl);
          availableUpdate = remoteChannel.version !== localChannel.version ? remoteChannel : undefined;
        }
        const status = await fetchUpdateStatus(statusUrl);
        const notice: UpdateNotice = {
          update: availableUpdate,
          ready:
            Boolean(availableUpdate) &&
            status.ready &&
            status.version === (availableUpdate?.cli?.version || availableUpdate?.version),
        };
        window.dispatchEvent(new CustomEvent("spotify-redesign:update-available", { detail: notice }));
      } catch (error) {
        console.warn("[Remixify] Update check unavailable.", error);
      }
    };
    window.setInterval(() => void publish(false), 10_000);
    window.setInterval(() => void publish(true), 60_000);
  }
}

void start().catch((error) => console.error("[Remixify] Bootstrap failed", error));
