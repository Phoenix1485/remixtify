# Remixify

Remixify is an independent Spotify Desktop patcher and launcher. It installs and maintains the bundled Remixify browser UI without importing or calling Spicetify.

The CLI creates a verified backup of Spotify's `Apps/xpui.spa`, extracts that web interface, and adds two clearly marked script tags to `index.html`. For a direct Spotify installation, it activates the unpacked `Apps/xpui` directory in place. For the Microsoft Store edition, it keeps the signed `WindowsApps` package untouched and builds a writable app directory under `%LOCALAPPDATA%\Remixify\AppX`. The injected browser runtime adds a settings button to Spotify's top bar and presents the package marketplace.

> This is an unofficial personal customization project and is not affiliated with Spotify. Spotify updates can change the private desktop UI format at any time. Close Spotify completely before installing, restoring, or uninstalling.

## What is included

- A standalone Go CLI with `install`, `launch`, `apply`, `restore`, `uninstall`, `status`, `update`, and `configure` commands.
- SHA-256-addressed backups stored outside the Spotify installation.
- Ownership markers that prevent the CLI from deleting an `xpui` directory created by another tool.
- A top-bar settings button and modal implemented with browser DOM APIs only.
- Interactive top-bar controls, a master enable/disable switch, and installer-managed update behavior.
- A low-overhead redesign engine with a Liquid Glass/Classic layout, comfortable/compact density, customizable primary and secondary colors, 12 built-in wallpapers, persistent image/GIF uploads, diagonal shooting stars, and optional motion.
- Ten independently deployable color atmospheres plus a local Custom CSS editor and `.css` file importer.
- A package marketplace backed by `web/registry.json`.
- The **Progress Cat** and **Focus Panels** extensions. Progress Cat updates at 4 Hz only while Spotify is visible instead of using a permanent animation-frame loop.
- A GitHub Actions pipeline that publishes the browser channel to GitHub Pages and replaces a continuously updated Windows CLI release after each push to `main`.

## Local development

Requirements: Node.js 22+, Go 1.23+, and Spotify Desktop. Both the direct installation and Microsoft Store/MSIX edition are detected.

```powershell
npm install
npm run build
npm run check
go build -o build/remixify.exe ./cmd/remixify
```

### Product website

The React and TypeScript landing page lives in `website/` and uses the real product screenshots from this repository.

```powershell
cd website
npm install
npm run dev
```

For the production container, run from the repository root:

```powershell
docker compose up --build -d
```

The site is then available at `http://localhost:8080`, with the release catalog at `/changelogs` and its read-only API at `/api/v1/changelogs`. Set `WEB_PORT` to change the host port and `SITE_URL` to the final public origin used by social-preview metadata.

Docker Compose provisions the React/TypeScript site, a non-root Go API, and MariaDB on an internal-only network. Changelog content is normalized across releases, tags, links, media, devlogs, relationships, and public risk notes. Add or revise releases through reviewed SQL migrations in `internal/changelogapi/migrations`; the public API deliberately exposes no write methods. Arbitrary embeds are linked rather than injected as iframes, and media URLs are limited by the frontend and Content Security Policy to same-origin or HTTPS resources. Redis and MinIO are not provisioned because the current read-only workload does not need caching or object storage; they can be added when measured usage justifies them.

For a one-time local installation, run:

```powershell
.\installer.ps1
```

The installer asks one question: `Automatically download updates in the background? (y/n)`. It then closes Spotify if necessary, installs the versioned CLI, adds its stable command to your user `PATH`, registers the maintenance watcher and private update URL handler, builds the customized app directory, and creates a fallback desktop shortcut.

- Answer `y` to download verified releases automatically. When the download is ready, an **Update** control appears beside the settings button.
- Answer `n` to show **Download available** beside the settings button. Click it to download the release; it changes to **Update** when ready.

Installation is always manual in both modes. Press **Update**, then confirm the dialog; only then does Spotify close, install the release, and reopen.

## Deactivate or uninstall

Open Remixify settings and press **Deactivate** to restore Spotify's original interface and disable background maintenance. The installed files and backups remain, so running `installer.ps1` reactivates it.

To restore Spotify and completely remove Remixify's installed files, settings, updater registration, startup watcher, PATH entry, shortcut, and backups, run:

```powershell
.\uninstaller.ps1
```

After installation:

- With the direct Spotify build, keep using Spotify's original desktop, Start menu, or taskbar icon.
- With the Microsoft Store build, open Spotify normally from its original tile or pinned icon. The hidden watcher recognizes a stock launch, immediately restarts the genuine Spotify executable with the maintained app directory, and keeps the customization active after Spotify is closed and reopened.
- The generated **Remixify** desktop shortcut and `remixify launch` command remain available as direct fallback launchers.

The Store edition's tile cannot itself pass `--app-directory`, which is the limitation described in [Spicetify's current Store-mode warning](https://github.com/spicetify/cli/blob/main/src/cmd/backup.go#L18-L25). Remixify handles it through the per-user watcher instead of modifying the protected tile or signed package. A brief restart may be visible immediately after clicking the original tile.

Installation also registers a hidden per-user maintenance process under `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run`. Only while Spotify is closed, it detects changed Spotify assets or a new Store package location, rebuilds the customization when needed, and downloads verified CLI updates from the configured channel. It does not replace `Spotify.exe` or modify `WindowsApps`.

To test against a nonstandard Spotify location:

```powershell
.\build\remixify.exe install --spotify "C:\path\to\Spotify"
```

Restore the untouched archive with:

```powershell
.\build\remixify.exe restore
```

## Publish from your GitHub repository

1. Create a GitHub repository and push this project to its `main` branch.
2. In **Settings → Pages**, choose **GitHub Actions** as the source.
3. Allow Actions to create releases. The included workflow needs `contents: write` and `pages: write`, which are already declared in the workflow.
4. Wait for the `Build, release, and deploy` workflow to finish.

Your update channel will be:

```text
https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY/channel.json
```

Install the published build from PowerShell:

```powershell
& ([scriptblock]::Create((Invoke-RestMethod "https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY/main/installer.ps1"))) `
  -Repo "YOUR_GITHUB_USERNAME/YOUR_REPOSITORY"
```

The installer derives the Pages channel URL from the repository name and asks the same download-preference question. You can override the channel with `-ChannelUrl`, or supply `-AutoDownload y` / `-AutoDownload n` for unattended installation.

### Update behavior

On every push to `main`, GitHub Actions:

1. Builds and checks the browser runtime.
2. Gives the channel the current commit SHA as its version.
3. Builds the Windows CLI and records its SHA-256 in `channel.json`.
4. Replaces the `continuous` GitHub release.
5. Deploys `channel.json`, `core.js`, theme stylesheets, and package scripts to GitHub Pages.

At the next customized launch, the small locally installed bootstrap fetches `channel.json` with caching disabled. The new core and installed packages use the channel version as a cache-busting value and Subresource Integrity hashes. If GitHub is offline, it falls back to the complete runtime embedded by the last CLI installation.

## Add another marketplace package

1. Add a TypeScript entry under `web/packages/`.
2. Add its metadata to `web/registry.json`.
3. Make it register a lifecycle:

```ts
window.SpotifyRedesign?.registerPackage("my-package", {
  activate() {
    // Add UI and listeners.
  },
  deactivate() {
    // Remove everything the package added.
  },
});
```

4. Run `npm run check`, commit, and push. The build discovers registered package entries by ID and the published marketplace receives it automatically.

Only packages listed in the channel can be installed. This intentionally avoids executing arbitrary URLs entered through the Spotify UI.

## Add another visual theme

Themes change presentation only. The core runtime continues to own the Studio layout, settings button, updater, and marketplace.

1. Add a scoped stylesheet such as `web/themes/my-theme.css`. Start selectors with `html.srd-theme-active[data-srd-theme="my-theme"]` so the file affects only that theme.
2. Add the name, description, stylesheet entry, and default colors to `web/themes/registry.json`.
3. Run `npm run build`. The stylesheet is copied as its own deployable file, hashed, and added to `channel.json` automatically.

Users can also open **Settings → Custom CSS**, paste code or import a local `.css` file, and press **Apply CSS**. Custom CSS loads after the selected theme and is stored locally in Spotify's browser storage; it is never uploaded to the update channel.

## Files written outside this repository

On Windows, the application state lives under:

```text
%LOCALAPPDATA%\Remixify\
```

It contains configuration, verified `.spa` backups, versioned CLI executables, a stable command launcher, and the hidden maintenance launcher. Direct installations use `%APPDATA%\Spotify\Apps\xpui`; Store installations use `%LOCALAPPDATA%\Remixify\AppX\xpui`. New installations carry `.remixify.json` as their ownership marker; legacy `.remixtify.json` and `.spotify-redesign.json` markers remain supported for safe migration and restoration.
#   r e m i x t i f y  
 