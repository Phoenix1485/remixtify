export type PackageDefinition = {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  entry: string;
  integrity?: string;
  icon?: string;
  type?: "theme" | "extension" | "app";
  permissions?: string[];
};

export type ThemeDefinition = {
  id: string;
  name: string;
  description: string;
  entry: string;
  primaryColor: string;
  secondaryColor: string;
  integrity?: string;
};

export type UpdateChannel = {
  schemaVersion: 1;
  version: string;
  publishedAt: string;
  core: {
    entry: string;
    integrity?: string;
  };
  packages: PackageDefinition[];
  themes?: ThemeDefinition[];
  cli?: {
    version: string;
    downloads: Record<string, { url: string; sha256: string }>;
  };
};

export type RuntimeSettings = {
  enabled: boolean;
  autoUpdate: boolean;
  primaryColor: string;
  secondaryColor: string;
  theme: string;
  wallpaper: string;
  layout: "studio" | "classic";
  density: "comfortable" | "compact";
  backgroundEffect: "none" | "ambient" | "grid";
  motion: boolean;
  glassClarity: number;
  glassBlur: number;
  glassBrightness: number;
  showSpotlight: boolean;
};

export type UpdateProgress = {
  stage: string;
  version?: string;
  bytes?: number;
  totalBytes?: number;
  step?: number;
  steps?: number;
  message?: string;
  updatedAt: number;
};

export type UpdateNotice = {
  update?: UpdateChannel;
  ready: boolean;
  progress?: UpdateProgress;
};

export type PackageLifecycle = {
  activate(): void | Promise<void>;
  deactivate(): void | Promise<void>;
};

export type RuntimeAPI = {
  version: string;
  registerPackage(id: string, lifecycle: PackageLifecycle): void;
  openSettings(): void;
};

declare global {
  interface Window {
    __SpotifyRedesignConfig?: {
      channelUrl?: string;
      localChannelUrl: string;
      autoUpdate: boolean;
    };
    __SpotifyRedesignBootstrap?: {
      channel: UpdateChannel;
      channelUrl: string;
      usingFallback: boolean;
      autoUpdate: boolean;
      availableUpdate?: UpdateChannel;
      updateReady: boolean;
      updateProgress?: UpdateProgress;
    };
    SpotifyRedesign?: RuntimeAPI;
  }
}
