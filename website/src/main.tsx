import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle, AppWindow, ArrowDown, ArrowRight, BadgeCheck, BookOpen, CalendarDays,
  Cat, Check, ChevronRight, CirclePower, Code2, Copy, Download, ExternalLink, FileArchive,
  Focus, Github, HardDrive, Layers3, Link2, LockKeyhole, Monitor, PackageOpen, Palette,
  RefreshCw, RotateCcw, ShieldCheck, Sparkles, Video, WandSparkles, Zap,
} from "lucide-react";
import "./styles.css";

const themes = [
  { name: "Nocturne", primary: "#8a4dff", secondary: "#2ac7bf" },
  { name: "Carbon", primary: "#f59e0b", secondary: "#f97316" },
  { name: "Aurora", primary: "#22d3ee", secondary: "#8b5cf6" },
  { name: "Crimson", primary: "#ef4444", secondary: "#f43f5e" },
  { name: "Glacier", primary: "#38bdf8", secondary: "#a5f3fc" },
  { name: "Ultraviolet", primary: "#c026d3", secondary: "#8b5cf6" },
  { name: "Ember", primary: "#fb7185", secondary: "#f59e0b" },
  { name: "Moss", primary: "#84cc16", secondary: "#2dd4bf" },
  { name: "Monochrome", primary: "#e5e7eb", secondary: "#71717a" },
  { name: "Synthwave", primary: "#f472b6", secondary: "#22d3ee" },
];

const chapters = [
  { id: "top", number: "01", label: "Intro" },
  { id: "product", number: "02", label: "Workbench" },
  { id: "themes", number: "03", label: "Atmosphere" },
  { id: "extensions", number: "04", label: "Extensions" },
  { id: "safety", number: "05", label: "Safety" },
  { id: "install", number: "06", label: "Install" },
];

const faqs = [
  ["Is this affiliated with Spotify?", "No. Remixtify is an independent personal customization project and is not affiliated with, endorsed by, or sponsored by Spotify."],
  ["Does it use Spicetify?", "No. It is its own Go-based patcher, launcher, settings surface, and small extension runtime."],
  ["Can I restore the original interface?", "Yes. Deactivate restores Spotify's original interface and turns off maintenance. Uninstall also removes Remixtify's local files, settings, and backups."],
  ["Does it support the Microsoft Store edition?", "Yes. The signed WindowsApps package stays untouched. Remixtify builds a writable app directory under your local app data instead."],
  ["Where are custom wallpapers and CSS stored?", "On your PC. Custom wallpaper and CSS data stays in local Spotify browser storage and is never uploaded to the update channel."],
  ["What happens after Spotify updates?", "A per-user maintenance watcher can rebuild the customization while Spotify is closed. Because the project depends on Spotify's private desktop interface, compatibility can occasionally require a project update."],
  ["Are updates installed automatically?", "No. Downloads can happen automatically if you opt in, but installation always waits for you to choose Update and confirm."],
];

function ProductWindow({ src, alt, label, eager = false }: { src: string; alt: string; label: string; eager?: boolean }) {
  return (
    <figure className="product-window">
      <figcaption className="window-chrome">
        <span className="chrome-dots"><i /><i /><i /></span>
        <span>{label}</span>
        <span className="status"><i /> Live preview</span>
      </figcaption>
      <img src={src} width="1440" height="805" alt={alt} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} />
    </figure>
  );
}

type ChangelogLink = { kind: string; label: string; url: string; description?: string };
type ChangelogMedia = { kind: string; title?: string; url: string; thumbnail_url?: string; alt_text?: string; caption?: string; mime_type?: string; width?: number; height?: number };
type ChangelogDevlog = { title: string; summary?: string; body?: string; author_name?: string; url?: string; published_at?: string };
type ChangelogRelation = { type: string; label?: string; slug: string; version: string; title: string };
type ChangelogRisk = { severity: string; category: string; title: string; summary: string; mitigation?: string; affected_versions?: string; resolved_in_version?: string; advisory_url?: string; cve_id?: string };
type Changelog = {
  id: string; slug: string; version: string; title: string; summary: string; body: string;
  category: string; release_date: string; is_breaking: boolean; is_security_release: boolean;
  tags: string[]; links: ChangelogLink[]; media: ChangelogMedia[]; devlogs: ChangelogDevlog[];
  related: ChangelogRelation[]; risks: ChangelogRisk[];
};

function safeURL(value?: string) {
  if (!value) return undefined;
  try {
    const parsed = new URL(value, window.location.origin);
    if (parsed.origin === window.location.origin || parsed.protocol === "https:") return parsed.href;
  } catch { return undefined; }
  return undefined;
}

function ChangelogPage() {
  const [items, setItems] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/changelogs?limit=50", { signal: controller.signal, headers: { Accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Release service returned ${response.status}`);
        return response.json() as Promise<{ items: Changelog[] }>;
      })
      .then((catalog) => setItems(catalog.items))
      .catch((reason: Error) => { if (reason.name !== "AbortError") setError("The release catalog is temporarily unavailable."); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  return (
    <div className="changelog-page">
      <section className="changelog-hero">
        <div className="changelog-hero-copy">
          <a className="back-link" href="/"><ArrowRight /> Back to Remixtify</a>
          <p className="eyebrow"><span /> Release intelligence</p>
          <h1><span>Every remix.</span><em>Documented.</em></h1>
          <p className="lede">Release notes with the full context: product changes, engineering logs, media, references, related releases, and transparent risk notes.</p>
        </div>
        <div className="catalog-status" aria-label="Catalog system status">
          <span className="catalog-pulse"><i /></span>
          <div><strong>Catalog online</strong><small>MariaDB · Read-only API v1</small></div>
          <BadgeCheck />
        </div>
      </section>

      <section className="catalog-shell" aria-labelledby="catalog-title">
        <header className="catalog-heading">
          <div><p className="kicker"><BookOpen /> Changelog catalog</p><h2 id="catalog-title">The complete release story.</h2></div>
          <span>{loading ? "Syncing…" : `${items.length} releases`}</span>
        </header>

        {loading && <div className="catalog-loading" role="status"><i /><span>Loading signed release history…</span></div>}
        {error && <div className="catalog-error" role="alert"><AlertTriangle /><div><strong>Could not load changelogs</strong><p>{error}</p></div><button type="button" onClick={() => window.location.reload()}>Retry</button></div>}

        <div className="changelog-list">
          {items.map((item, index) => (
            <article id={item.slug} className="changelog-entry" key={item.id} style={{ "--entry-delay": `${Math.min(index * 110, 440)}ms` } as React.CSSProperties}>
              <header className="entry-header">
                <div className="entry-version"><span>v{item.version}</span>{index === 0 && <strong>Latest release</strong>}{item.is_security_release && <strong className="security-release"><ShieldCheck /> Security reviewed</strong>}</div>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <div className="entry-meta"><span><CalendarDays /> {new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(`${item.release_date}T00:00:00Z`))}</span><span>{item.category}</span>{item.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
              </header>

              <div className="entry-body"><p>{item.body}</p></div>

              {item.media.length > 0 && <div className="entry-media">
                {item.media.map((media) => {
                  const src = safeURL(media.url);
                  if (!src) return null;
                  const isExternal = new URL(src).origin !== window.location.origin;
                  return <figure className={`media-${media.kind}`} key={`${media.kind}-${media.url}`}>
                    {media.kind === "image" && <img src={src} alt={media.alt_text || media.title || "Release media"} width={media.width} height={media.height} loading="lazy" />}
                    {media.kind === "video" && <video controls preload="metadata" poster={safeURL(media.thumbnail_url)}><source src={src} type={media.mime_type} /></video>}
                    {media.kind === "audio" && <audio controls preload="none"><source src={src} type={media.mime_type} /></audio>}
                    {(media.kind === "embed" || media.kind === "file") && <a className="media-file-link" href={src} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noreferrer" : undefined}><FileArchive /><span><strong>{media.title || "Open release attachment"}</strong><small>Open the verified {media.kind}</small></span><ExternalLink /></a>}
                    {(media.title || media.caption) && <figcaption><strong>{media.title}</strong><span>{media.caption}</span>{media.kind === "video" && <Video />}</figcaption>}
                  </figure>;
                })}
              </div>}

              <div className="entry-detail-grid">
                {item.devlogs.length > 0 && <section className="entry-panel"><p className="tiny-label"><BookOpen /> Devlog</p>{item.devlogs.map((log) => <div className="devlog" key={log.title}><h3>{log.title}</h3><p>{log.summary}</p>{log.body && <small>{log.body}</small>}{safeURL(log.url) && <a href={safeURL(log.url)} target="_blank" rel="noreferrer">Read devlog <ExternalLink /></a>}</div>)}</section>}
                {item.risks.length > 0 && <section className="entry-panel risk-panel"><p className="tiny-label"><ShieldCheck /> Risk notes</p>{item.risks.map((risk) => <div className={`risk-note severity-${risk.severity}`} key={`${risk.category}-${risk.title}`}><span>{risk.severity}</span><h3>{risk.title}</h3><p>{risk.summary}</p>{risk.mitigation && <small><strong>Mitigation:</strong> {risk.mitigation}</small>}</div>)}</section>}
              </div>

              {(item.related.length > 0 || item.links.length > 0) && <footer className="entry-resources">
                <p><Link2 /> Connected context</p>
                <div>{item.related.map((relation) => <a href={`/changelogs#${relation.slug}`} key={`${relation.type}-${relation.slug}`}><span>{relation.label || relation.type}</span><strong>v{relation.version} · {relation.title}</strong><ChevronRight /></a>)}
                {item.links.map((link) => { const href = safeURL(link.url); if (!href) return null; const external = new URL(href).origin !== window.location.origin; return <a href={href} key={`${link.kind}-${link.url}`} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}><span>{link.kind}</span><strong>{link.label}</strong>{external ? <ExternalLink /> : <ChevronRight />}</a>; })}</div>
              </footer>}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function App() {
  const isChangelogPage = window.location.pathname.startsWith("/changelogs");
  const [activeTheme, setActiveTheme] = useState(themes[0]);
  const [copied, setCopied] = useState(false);
  const [activeChapter, setActiveChapter] = useState("top");

  useEffect(() => {
    const root = document.documentElement;
    const pause = () => root.classList.add("page-inactive");
    const resume = () => { if (!document.hidden) root.classList.remove("page-inactive"); };
    const visibility = () => (document.hidden ? pause() : resume());
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", pause);
    window.addEventListener("focus", resume);

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8%" });
    document.querySelectorAll("[data-reveal]").forEach((node) => revealObserver.observe(node));

    const chapterObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveChapter(visible.target.id);
    }, { threshold: [0.2, 0.45, 0.7], rootMargin: "-20% 0px -55%" });
    document.querySelectorAll("[data-chapter]").forEach((node) => chapterObserver.observe(node));

    return () => {
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", pause);
      window.removeEventListener("focus", resume);
      revealObserver.disconnect();
      chapterObserver.disconnect();
    };
  }, []);

  const copyCommand = async () => {
    await navigator.clipboard.writeText(".\\installer.ps1");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="app-shell" style={{ "--active-primary": activeTheme.primary, "--active-secondary": activeTheme.secondary } as React.CSSProperties}>
      <a className="skip-link" href="#content">Skip to content</a>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      {!isChangelogPage && <><aside className="motion-rail motion-rail-left" aria-hidden="true">
        <span className="rail-beacon"><i /></span>
        <span className="rail-wordmark">REMIXTIFY / DESKTOP ATMOSPHERE</span>
        <span className="rail-index">© 2026</span>
      </aside>
      <aside className="motion-rail motion-rail-right" aria-label="Page chapters" style={{ "--rail-offset": `${Math.max(0, chapters.findIndex((chapter) => chapter.id === activeChapter)) * 58}px` } as React.CSSProperties}>
        <span className="rail-progress" aria-hidden="true"><i /></span>
        <nav>
          {chapters.map((chapter) => (
            <a key={chapter.id} href={`#${chapter.id}`} className={activeChapter === chapter.id ? "active" : ""} aria-current={activeChapter === chapter.id ? "location" : undefined}>
              <span>{chapter.number}</span><strong>{chapter.label}</strong>
            </a>
          ))}
        </nav>
      </aside></>}

      <header className="site-header">
        <a className="brand" href="/" aria-label="Remixtify home">
          <span className="brand-mark">RX</span><span>Remixtify</span><span className="version">v0.3.0</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="/#product">Product</a><a href="/#themes">Themes</a><a className="nav-changelog" href="/changelogs">Changelogs</a><a href="/#safety">Safety</a><a href="/#faq">FAQ</a>
          <a className="nav-source" href="/#install"><Github size={17} aria-hidden="true" /> Get the source</a>
        </nav>
      </header>

      <main id="content">
        {isChangelogPage ? <ChangelogPage /> : <><section className="hero" id="top" data-chapter>
          <div className="hero-copy">
            <p className="eyebrow"><span /> Unofficial Spotify Desktop customization for Windows</p>
            <h1><span>Make Spotify</span><span>feel like</span><em>your space.</em></h1>
            <p className="lede">Rebuild Spotify Desktop with atmospheric themes, flexible layouts, local wallpapers, and optional extensions — with verified backups and a clear way back.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#install">Install Remixtify <ArrowRight size={18} /></a>
              <a className="button button-secondary" href="#themes">Explore the themes <ArrowDown size={17} /></a>
            </div>
            <p className="hero-note"><ShieldCheck size={17} /> Reversible by design. Spotify's original executable stays untouched.</p>
          </div>
          <div className="hero-visual">
            <ProductWindow src="/screenshots/01-main-redesign.png" alt="Remixtify workbench with a violet glass interface" label="Remixtify · Workbench" eager />
            <span className="keynote-tag keynote-tag-top" aria-hidden="true"><i /> LIVE WORKBENCH</span>
            <span className="keynote-tag keynote-tag-bottom" aria-hidden="true">LOCAL FIRST <i /></span>
          </div>
        </section>

        <div className="disclaimer-bar" data-reveal="up">
          <span>Independent project</span><p>Not affiliated with, endorsed by, or sponsored by Spotify.</p>
          <a href="#faq">Read the disclaimer <ArrowRight size={15} /></a>
        </div>

        <section className="proof" aria-label="Product facts" data-reveal="up">
          <div><strong>10</strong><span>visual themes</span><small>registry-driven</small></div>
          <div><strong>12</strong><span>built-in wallpapers</span><small>plus local files</small></div>
          <div><strong>2</strong><span>optional extensions</span><small>and room to grow</small></div>
          <div><RotateCcw size={27} /><span>reversible install</span><small>restore anytime</small></div>
        </section>

        <section className="section feature-section" id="product" data-chapter>
          <div className="section-heading split-heading" data-reveal="up">
            <div><p className="kicker"><Layers3 size={15} /> The workbench</p><h2>More than a coat of paint.</h2></div>
            <p>One controlled customization layer brings layout, motion, updates, packages, and recovery into the same calm settings surface.</p>
          </div>
          <div className="feature-stage" data-reveal="right">
            <ProductWindow src="/screenshots/02-settings-panel.png" alt="Remixtify settings panel showing layout, density, motion, update, and deactivation controls" label="Settings · Control center" />
            <div className="feature-callouts" aria-label="Settings features">
              <div className="callout"><AppWindow /><span><strong>Two layouts</strong>Workbench for a new spatial flow, Classic for familiar ground.</span></div>
              <div className="callout"><Monitor /><span><strong>Flexible density</strong>Choose Comfort or Compact without shrinking playback controls.</span></div>
              <div className="callout"><Sparkles /><span><strong>Quiet motion</strong>Compositor-friendly and automatically paused out of focus.</span></div>
              <div className="callout"><CirclePower /><span><strong>Clear way back</strong>Deactivate from the same place you customize.</span></div>
            </div>
          </div>
        </section>

        <section className="section theme-section" id="themes" data-chapter>
          <div className="theme-copy" data-reveal="left">
            <p className="kicker"><Palette size={15} /> Theme studio</p><h2>Atmosphere,<br />under your control.</h2>
            <p>Start with one of ten visual atmospheres. Pair it with a built-in scene, tune two live colors, choose Ambient or Grid, then layer your own local CSS if you want to go further.</p>
            <ul className="check-list"><li><Check /> 12 lightweight wallpaper scenes</li><li><Check /> Local still image and GIF support</li><li><Check /> Custom files never leave your PC</li></ul>
            <div className="theme-picker" aria-label="Preview color atmospheres">
              {themes.map((theme) => (
                <button type="button" key={theme.name} className={activeTheme.name === theme.name ? "active" : ""} onClick={() => setActiveTheme(theme)} aria-label={`Preview ${theme.name} atmosphere`} aria-pressed={activeTheme.name === theme.name} title={theme.name} style={{ "--swatch-a": theme.primary, "--swatch-b": theme.secondary } as React.CSSProperties} />
              ))}
              <span>{activeTheme.name}</span>
            </div>
          </div>
          <div className="theme-visual" data-reveal="right">
            <div className="theme-glow" aria-hidden="true" />
            <ProductWindow src="/screenshots/03-theme-studio.png" alt="Theme Studio with Nocturne theme and wallpaper choices" label={`${activeTheme.name} · Theme Studio`} />
            <div className="floating-chip chip-one"><WandSparkles /> Live palette</div><div className="floating-chip chip-two"><Code2 /> Local CSS</div>
          </div>
        </section>

        <section className="section extensions-section" id="extensions" data-chapter>
          <div className="section-heading split-heading" data-reveal="up">
            <div><p className="kicker"><PackageOpen size={15} /> Optional extensions</p><h2>Small ideas. Clean lifecycles.</h2></div>
            <p>Install only packages declared by the published registry. Every extension can activate and fully tear itself down without leaving orphaned listeners or styles behind.</p>
          </div>
          <div className="extensions-layout">
            <div className="package-stack" data-reveal="left">
              <article className="package-card"><span className="package-icon cat-icon"><Cat /></span><div><span className="tiny-label">Playback detail</span><h3>Progress Cat</h3><p>A tiny cat follows the current song's progress bar — and only updates while Spotify is visible.</p></div><span className="package-state"><BadgeCheck /> Published</span></article>
              <article className="package-card"><span className="package-icon focus-icon"><Focus /></span><div><span className="tiny-label">Visual focus</span><h3>Focus Panels</h3><p>Side panels fade into the background until you hover or focus them.</p></div><span className="package-state"><BadgeCheck /> Published</span></article>
            </div>
            <div data-reveal="right"><ProductWindow src="/screenshots/04-package-marketplace.png" alt="Remixtify marketplace with Progress Cat and Focus Panels" label="Marketplace · Published registry" /></div>
          </div>
        </section>

        <section className="section how-section" id="how">
          <div className="section-heading centered" data-reveal="up"><p className="kicker"><RefreshCw size={15} /> How it works</p><h2>Three steps. Zero lock-in.</h2><p>The original interface is protected before the redesign ever loads.</p></div>
          <div className="steps" data-reveal="up">
            <article><span className="step-number">01</span><FileArchive /><h3>Back up</h3><p>The CLI verifies and stores Spotify's original interface archive by SHA-256.</p></article><span className="step-line" aria-hidden="true" />
            <article><span className="step-number">02</span><Zap /><h3>Redesign</h3><p>Two clearly marked scripts load the local or integrity-checked customization runtime.</p></article><span className="step-line" aria-hidden="true" />
            <article><span className="step-number">03</span><RotateCcw /><h3>Restore anytime</h3><p>Deactivate or uninstall to return to Spotify's original interface.</p></article>
          </div>
          <div className="store-note" data-reveal="up"><Monitor /><p><strong>Microsoft Store edition?</strong> The signed package stays untouched. Remixtify uses a writable app directory in your local app data.</p></div>
        </section>

        <section className="section safety-section" id="safety" data-chapter>
          <div className="safety-intro" data-reveal="left">
            <p className="kicker"><ShieldCheck size={15} /> Safety and updates</p><h2>Trust should be visible.</h2>
            <p>Patching a desktop interface deserves more than a promise. The recovery and update path is built around verifiable files, deliberate user actions, and a complete local fallback.</p>
            <div className="safety-badge"><LockKeyhole /><span><strong>No arbitrary remote code</strong>Packages come from the published registry only.</span></div>
          </div>
          <div className="safety-grid" data-reveal="right">
            <article><span><FileArchive /></span><h3>Addressed backups</h3><p>Original archives are stored by SHA-256 outside the Spotify installation.</p></article>
            <article><span><BadgeCheck /></span><h3>Ownership markers</h3><p>The CLI will not remove an interface directory managed by another tool.</p></article>
            <article><span><LockKeyhole /></span><h3>Integrity checked</h3><p>Browser resources use SRI and CLI downloads are verified before activation.</p></article>
            <article><span><HardDrive /></span><h3>Offline fallback</h3><p>The last complete runtime embedded by the CLI stays ready when the channel is offline.</p></article>
            <article className="wide"><span><CirclePower /></span><h3>You confirm installation</h3><p>Updates may download in the background only if you opt in. Spotify closes, installs, and restarts only after you choose Update and confirm.</p></article>
          </div>
        </section>

        <section className="section install-section" id="install" data-chapter>
          <div className="install-card" data-reveal="up">
            <div className="install-copy"><p className="kicker"><Download size={15} /> Installation</p><h2>Ready when your desktop is.</h2><p>Remixtify is for Windows enthusiasts comfortable running an unofficial desktop customization. Close Spotify completely before installing, restoring, or uninstalling.</p>
              <div className="requirements"><span><Check /> Windows</span><span><Check /> Spotify Desktop</span><span><Check /> PowerShell 5.1+</span><span><Check /> Direct or Store edition</span></div>
            </div>
            <div className="terminal-card" aria-label="PowerShell installation command">
              <div className="terminal-title"><span>PowerShell</span><i>Run as your normal Windows user</i></div>
              <div className="terminal-line"><span className="prompt">PS</span><code>.\installer.ps1</code><button type="button" onClick={copyCommand} aria-label="Copy installation command">{copied ? <Check /> : <Copy />}</button></div>
              <p>From a cloned or downloaded project folder with a built release.</p><a href="/downloads/README.md" download>Open complete installation notes <ChevronRight /></a>
            </div>
          </div>
        </section>

        <section className="section faq-section" id="faq">
          <div className="section-heading centered" data-reveal="up"><p className="kicker">FAQ</p><h2>The honest answers.</h2></div>
          <div className="faq-list" data-reveal="up">{faqs.map(([question, answer]) => (<details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>))}</div>
        </section>

        <section className="final-cta" data-reveal="up">
          <div className="final-orbit" aria-hidden="true" /><p className="kicker">Your Spotify. Your atmosphere.</p><h2>Make the familiar feel personal again.</h2><p>Ten themes, a flexible workbench, and one clear way back.</p><a className="button button-primary" href="#install">See installation <ArrowRight /></a>
        </section>
        </>}
      </main>

      <footer><a className="brand" href="/"><span className="brand-mark">RX</span><span>Remixtify</span></a><p>Unofficial Windows desktop customization. Spotify updates can change the private desktop interface at any time.</p><div><a href="/changelogs">Changelogs</a><a href="/#safety">Safety</a><a href="/#faq">FAQ</a><a href="#top">Back to top ↑</a></div></footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
