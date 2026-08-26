CREATE TABLE IF NOT EXISTS changelogs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id VARCHAR(40) NOT NULL,
  slug VARCHAR(96) NOT NULL,
  version VARCHAR(32) NOT NULL,
  title VARCHAR(180) NOT NULL,
  summary VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'draft',
  category VARCHAR(48) NOT NULL DEFAULT 'release',
  release_date DATE NOT NULL,
  published_at DATETIME(6) NULL,
  is_breaking BOOLEAN NOT NULL DEFAULT FALSE,
  is_security_release BOOLEAN NOT NULL DEFAULT FALSE,
  source_url VARCHAR(2048) NULL,
  seo_title VARCHAR(180) NULL,
  seo_description VARCHAR(320) NULL,
  metadata_json JSON NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_changelogs_public_id (public_id),
  UNIQUE KEY uq_changelogs_slug (slug),
  KEY idx_changelogs_publication (status, published_at, release_date),
  CONSTRAINT chk_changelog_status CHECK (status IN ('draft', 'scheduled', 'published', 'archived'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- migrate:split
CREATE TABLE IF NOT EXISTS changelog_tags (
  changelog_id BIGINT UNSIGNED NOT NULL,
  tag VARCHAR(64) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (changelog_id, tag),
  KEY idx_changelog_tags_tag (tag),
  CONSTRAINT fk_changelog_tags_changelog FOREIGN KEY (changelog_id) REFERENCES changelogs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- migrate:split
CREATE TABLE IF NOT EXISTS changelog_links (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  changelog_id BIGINT UNSIGNED NOT NULL,
  kind VARCHAR(32) NOT NULL DEFAULT 'reference',
  label VARCHAR(140) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  description VARCHAR(500) NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_changelog_links_parent (changelog_id, sort_order),
  CONSTRAINT fk_changelog_links_changelog FOREIGN KEY (changelog_id) REFERENCES changelogs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- migrate:split
CREATE TABLE IF NOT EXISTS changelog_media (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  changelog_id BIGINT UNSIGNED NOT NULL,
  kind VARCHAR(24) NOT NULL,
  title VARCHAR(180) NULL,
  url VARCHAR(2048) NOT NULL,
  thumbnail_url VARCHAR(2048) NULL,
  alt_text VARCHAR(500) NULL,
  caption VARCHAR(1000) NULL,
  mime_type VARCHAR(120) NULL,
  width_px INT UNSIGNED NULL,
  height_px INT UNSIGNED NULL,
  duration_seconds DECIMAL(10,3) NULL,
  transcript_url VARCHAR(2048) NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_changelog_media_parent (changelog_id, sort_order),
  CONSTRAINT fk_changelog_media_changelog FOREIGN KEY (changelog_id) REFERENCES changelogs(id) ON DELETE CASCADE,
  CONSTRAINT chk_changelog_media_kind CHECK (kind IN ('image', 'video', 'audio', 'embed', 'file'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- migrate:split
CREATE TABLE IF NOT EXISTS changelog_devlogs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  changelog_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  summary VARCHAR(500) NULL,
  body TEXT NULL,
  author_name VARCHAR(120) NULL,
  url VARCHAR(2048) NULL,
  published_at DATETIME(6) NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_changelog_devlogs_parent (changelog_id, sort_order),
  CONSTRAINT fk_changelog_devlogs_changelog FOREIGN KEY (changelog_id) REFERENCES changelogs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- migrate:split
CREATE TABLE IF NOT EXISTS changelog_relations (
  source_changelog_id BIGINT UNSIGNED NOT NULL,
  target_changelog_id BIGINT UNSIGNED NOT NULL,
  relation_type VARCHAR(32) NOT NULL,
  label VARCHAR(140) NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (source_changelog_id, target_changelog_id, relation_type),
  KEY idx_changelog_relations_target (target_changelog_id),
  CONSTRAINT fk_changelog_relations_source FOREIGN KEY (source_changelog_id) REFERENCES changelogs(id) ON DELETE CASCADE,
  CONSTRAINT fk_changelog_relations_target FOREIGN KEY (target_changelog_id) REFERENCES changelogs(id) ON DELETE CASCADE,
  CONSTRAINT chk_changelog_relation_self CHECK (source_changelog_id <> target_changelog_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- migrate:split
CREATE TABLE IF NOT EXISTS changelog_risks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  changelog_id BIGINT UNSIGNED NOT NULL,
  severity VARCHAR(16) NOT NULL,
  category VARCHAR(48) NOT NULL,
  title VARCHAR(180) NOT NULL,
  summary VARCHAR(1000) NOT NULL,
  mitigation TEXT NULL,
  affected_versions VARCHAR(255) NULL,
  resolved_in_version VARCHAR(32) NULL,
  advisory_url VARCHAR(2048) NULL,
  cve_id VARCHAR(32) NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_changelog_risks_parent (changelog_id, is_public, sort_order),
  CONSTRAINT fk_changelog_risks_changelog FOREIGN KEY (changelog_id) REFERENCES changelogs(id) ON DELETE CASCADE,
  CONSTRAINT chk_changelog_risk_severity CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- migrate:split
INSERT IGNORE INTO changelogs (id, public_id, slug, version, title, summary, body, status, category, release_date, published_at, is_breaking, is_security_release, seo_title, seo_description, metadata_json)
VALUES
  (1, 'chg_0_2_2_foundation', '0-2-2-foundation', '0.2.2', 'Foundation release', 'A stable workbench, ten themes, local wallpaper controls, two optional extensions, and a deliberate path back to the original interface.', 'Version 0.2.2 established the complete customization runtime: Workbench and Classic layouts, Comfort and Compact density, local themes and wallpaper storage, verified backups, the package registry, and user-confirmed updates.', 'published', 'release', '2026-08-26', '2026-08-26 12:00:00.000000', FALSE, FALSE, 'Remixtify 0.2.2 — Foundation release', 'The foundation release for the reversible Spotify Desktop customization.', JSON_OBJECT('runtime', 'browser-injected', 'cli', 'go-1.23')),
  (2, 'chg_0_3_0_stage', '0-3-0-stage-release', '0.3.0', 'The Stage release', 'A new Remixtify identity, cinematic motion, a public changelog catalog, and a security-hardened read-only release API.', 'Remixtify now presents every release as a story. The landing page gains scroll-aware side rails, staged reveals, and a calmer three-line hero composition. A normalized MariaDB catalog now connects releases to devlogs, media, references, related changes, tags, and public risk notes through a read-only Go API.', 'published', 'release', '2026-08-27', '2026-08-27 00:00:00.000000', FALSE, TRUE, 'Remixtify 0.3.0 — The Stage release', 'Cinematic motion, changelog storytelling, and a hardened public release API.', JSON_OBJECT('codename', 'Stage', 'api_version', 'v1'));

-- migrate:split
INSERT IGNORE INTO changelog_tags (changelog_id, tag, sort_order) VALUES
  (1, 'workbench', 1), (1, 'themes', 2), (1, 'extensions', 3),
  (2, 'rebrand', 1), (2, 'motion', 2), (2, 'changelogs', 3), (2, 'security', 4), (2, 'api', 5);

-- migrate:split
INSERT IGNORE INTO changelog_links (id, changelog_id, kind, label, url, description, sort_order) VALUES
  (1, 1, 'documentation', 'Installation and recovery notes', '/downloads/README.md', 'Complete local installation, restoration, and update behavior.', 1),
  (2, 2, 'documentation', 'API contract', '/api/openapi.yaml', 'The versioned read-only changelog API contract.', 1),
  (3, 2, 'documentation', 'Installation notes', '/downloads/README.md', 'Requirements and local installation guidance.', 2);

-- migrate:split
INSERT IGNORE INTO changelog_media (id, changelog_id, kind, title, url, alt_text, caption, mime_type, width_px, height_px, sort_order) VALUES
  (1, 1, 'image', 'Workbench overview', '/screenshots/01-main-redesign.png', 'A violet glass Spotify workbench with navigation, content, and now-playing panels.', 'The original Workbench surface introduced in 0.2.2.', 'image/png', 1440, 805, 1),
  (2, 2, 'image', 'Theme Studio', '/screenshots/03-theme-studio.png', 'The Remixtify Theme Studio with Nocturne wallpaper selections.', 'Theme Studio remains local-first while the website gains a new cinematic stage.', 'image/png', 1440, 805, 1);

-- migrate:split
INSERT IGNORE INTO changelog_devlogs (id, changelog_id, title, summary, body, author_name, published_at, sort_order) VALUES
  (1, 1, 'Building the reversible foundation', 'Why backups, ownership markers, and complete teardown came before visual expansion.', 'The customization never replaces Spotify.exe. Recovery, package lifecycle cleanup, and offline fallback were treated as product features rather than afterthoughts.', 'Remixtify team', '2026-08-26 12:00:00.000000', 1),
  (2, 2, 'Designing the Stage', 'Turning release notes into a focused, cinematic product narrative.', 'The new motion system uses IntersectionObserver and compositor-only transforms. It pauses with the page, respects reduced-motion preferences, and avoids scroll hijacking.', 'Remixtify team', '2026-08-27 00:00:00.000000', 1);

-- migrate:split
INSERT IGNORE INTO changelog_relations (source_changelog_id, target_changelog_id, relation_type, label, sort_order) VALUES
  (2, 1, 'builds_on', 'Built on the 0.2.2 foundation', 1);

-- migrate:split
INSERT IGNORE INTO changelog_risks (id, changelog_id, severity, category, title, summary, mitigation, affected_versions, resolved_in_version, is_public, sort_order) VALUES
  (1, 1, 'medium', 'compatibility', 'Private interface dependency', 'Spotify can change its private desktop interface after an update.', 'The maintenance watcher rebuilds only while Spotify is closed, and the verified original interface remains restorable.', '0.2.x', NULL, TRUE, 1),
  (2, 2, 'info', 'api', 'Public API is intentionally read-only', 'No public create, update, or delete route is exposed for changelog content.', 'New releases are applied through reviewed database migrations. Queries are parameterized, paginated, time-bounded, and served behind same-origin rate limiting.', '0.3.0', '0.3.0', TRUE, 1),
  (3, 2, 'low', 'extensions', 'Extension isolation remains a roadmap item', 'Published extensions still execute in the same injected browser context.', 'Only registry-declared packages can load; arbitrary remote URLs and eval are not accepted. Per-extension isolation remains planned.', '0.2.x-0.3.0', NULL, TRUE, 2);
