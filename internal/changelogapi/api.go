package changelogapi

import (
	"context"
	"crypto/rand"
	"database/sql"
	"embed"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"log/slog"
	"net/http"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

var validSlug = regexp.MustCompile(`^[a-z0-9][a-z0-9-]{0,95}$`)

type API struct {
	db     *sql.DB
	logger *slog.Logger
}

type Changelog struct {
	PublicID        string          `json:"id"`
	Slug            string          `json:"slug"`
	Version         string          `json:"version"`
	Title           string          `json:"title"`
	Summary         string          `json:"summary"`
	Body            string          `json:"body"`
	Status          string          `json:"status"`
	Category        string          `json:"category"`
	ReleaseDate     string          `json:"release_date"`
	PublishedAt     *time.Time      `json:"published_at,omitempty"`
	Breaking        bool            `json:"is_breaking"`
	SecurityRelease bool            `json:"is_security_release"`
	SourceURL       string          `json:"source_url,omitempty"`
	SEOTitle        string          `json:"seo_title,omitempty"`
	SEODescription  string          `json:"seo_description,omitempty"`
	Metadata        json.RawMessage `json:"metadata,omitempty"`
	Tags            []string        `json:"tags"`
	Links           []Link          `json:"links"`
	Media           []Media         `json:"media"`
	Devlogs         []Devlog        `json:"devlogs"`
	Related         []Relation      `json:"related"`
	Risks           []Risk          `json:"risks"`
	internalID      int64
}

type Link struct {
	Kind        string `json:"kind"`
	Label       string `json:"label"`
	URL         string `json:"url"`
	Description string `json:"description,omitempty"`
}

type Media struct {
	Kind            string   `json:"kind"`
	Title           string   `json:"title,omitempty"`
	URL             string   `json:"url"`
	ThumbnailURL    string   `json:"thumbnail_url,omitempty"`
	AltText         string   `json:"alt_text,omitempty"`
	Caption         string   `json:"caption,omitempty"`
	MIMEType        string   `json:"mime_type,omitempty"`
	Width           *int     `json:"width,omitempty"`
	Height          *int     `json:"height,omitempty"`
	DurationSeconds *float64 `json:"duration_seconds,omitempty"`
	TranscriptURL   string   `json:"transcript_url,omitempty"`
}

type Devlog struct {
	Title       string     `json:"title"`
	Summary     string     `json:"summary,omitempty"`
	Body        string     `json:"body,omitempty"`
	AuthorName  string     `json:"author_name,omitempty"`
	URL         string     `json:"url,omitempty"`
	PublishedAt *time.Time `json:"published_at,omitempty"`
}

type Relation struct {
	Type    string `json:"type"`
	Label   string `json:"label,omitempty"`
	Slug    string `json:"slug"`
	Version string `json:"version"`
	Title   string `json:"title"`
}

type Risk struct {
	Severity          string `json:"severity"`
	Category          string `json:"category"`
	Title             string `json:"title"`
	Summary           string `json:"summary"`
	Mitigation        string `json:"mitigation,omitempty"`
	AffectedVersions  string `json:"affected_versions,omitempty"`
	ResolvedInVersion string `json:"resolved_in_version,omitempty"`
	AdvisoryURL       string `json:"advisory_url,omitempty"`
	CVEID             string `json:"cve_id,omitempty"`
}

func New(db *sql.DB, logger *slog.Logger) *API {
	if logger == nil {
		logger = slog.Default()
	}
	return &API{db: db, logger: logger}
}

func (a *API) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", a.health)
	mux.HandleFunc("GET /api/v1/changelogs", a.list)
	mux.HandleFunc("GET /api/v1/changelogs/{slug}", a.detail)
	return a.middleware(mux)
}

func (a *API) middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := make([]byte, 12)
		if _, err := rand.Read(requestID); err != nil {
			copy(requestID, []byte(strconv.FormatInt(time.Now().UnixNano(), 16)))
		}
		id := hex.EncodeToString(requestID)
		w.Header().Set("X-Request-ID", id)
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Cache-Control", "no-store")
		defer func() {
			if recovered := recover(); recovered != nil {
				a.logger.Error("request panic", "request_id", id, "method", r.Method, "path", r.URL.Path)
				writeError(w, http.StatusInternalServerError, "internal_error", "The request could not be completed.")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func (a *API) health(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), time.Second)
	defer cancel()
	if a.db == nil || a.db.PingContext(ctx) != nil {
		writeError(w, http.StatusServiceUnavailable, "database_unavailable", "Service is not ready.")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (a *API) list(w http.ResponseWriter, r *http.Request) {
	limit, offset, err := pagination(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_pagination", err.Error())
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 4*time.Second)
	defer cancel()
	rows, err := a.db.QueryContext(ctx, `
		SELECT id, public_id, slug, version, title, summary, body, status, category,
		       release_date, published_at, is_breaking, is_security_release, source_url,
		       seo_title, seo_description, metadata_json
		FROM changelogs
		WHERE status = 'published' AND published_at IS NOT NULL AND published_at <= UTC_TIMESTAMP(6)
		ORDER BY release_date DESC, id DESC
		LIMIT ? OFFSET ?`, limit, offset)
	if err != nil {
		a.fail(w, r, err)
		return
	}
	defer rows.Close()
	items := make([]Changelog, 0, limit)
	for rows.Next() {
		item, scanErr := scanChangelog(rows)
		if scanErr != nil {
			a.fail(w, r, scanErr)
			return
		}
		if scanErr = a.loadChildren(ctx, &item); scanErr != nil {
			a.fail(w, r, scanErr)
			return
		}
		items = append(items, item)
	}
	if err = rows.Err(); err != nil {
		a.fail(w, r, err)
		return
	}
	w.Header().Set("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "limit": limit, "offset": offset})
}

func (a *API) detail(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	if !validSlug.MatchString(slug) {
		writeError(w, http.StatusBadRequest, "invalid_slug", "The changelog slug is invalid.")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 4*time.Second)
	defer cancel()
	row := a.db.QueryRowContext(ctx, `
		SELECT id, public_id, slug, version, title, summary, body, status, category,
		       release_date, published_at, is_breaking, is_security_release, source_url,
		       seo_title, seo_description, metadata_json
		FROM changelogs
		WHERE slug = ? AND status = 'published' AND published_at IS NOT NULL AND published_at <= UTC_TIMESTAMP(6)
		LIMIT 1`, slug)
	item, err := scanChangelog(row)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "not_found", "Changelog not found.")
		return
	}
	if err != nil {
		a.fail(w, r, err)
		return
	}
	if err = a.loadChildren(ctx, &item); err != nil {
		a.fail(w, r, err)
		return
	}
	w.Header().Set("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
	writeJSON(w, http.StatusOK, item)
}

type scanner interface{ Scan(...any) error }

func scanChangelog(row scanner) (Changelog, error) {
	var item Changelog
	var releaseDate time.Time
	var published sql.NullTime
	var source, seoTitle, seoDescription, metadata sql.NullString
	err := row.Scan(&item.internalID, &item.PublicID, &item.Slug, &item.Version, &item.Title, &item.Summary,
		&item.Body, &item.Status, &item.Category, &releaseDate, &published, &item.Breaking,
		&item.SecurityRelease, &source, &seoTitle, &seoDescription, &metadata)
	if err != nil {
		return item, err
	}
	item.ReleaseDate = releaseDate.Format("2006-01-02")
	if published.Valid {
		item.PublishedAt = &published.Time
	}
	item.SourceURL, item.SEOTitle, item.SEODescription = source.String, seoTitle.String, seoDescription.String
	if metadata.Valid && json.Valid([]byte(metadata.String)) {
		item.Metadata = json.RawMessage(metadata.String)
	}
	item.Tags = []string{}
	item.Links = []Link{}
	item.Media = []Media{}
	item.Devlogs = []Devlog{}
	item.Related = []Relation{}
	item.Risks = []Risk{}
	return item, nil
}

func (a *API) loadChildren(ctx context.Context, item *Changelog) error {
	loaders := []func(context.Context, *Changelog) error{a.loadTags, a.loadLinks, a.loadMedia, a.loadDevlogs, a.loadRelations, a.loadRisks}
	for _, load := range loaders {
		if err := load(ctx, item); err != nil {
			return err
		}
	}
	return nil
}

func (a *API) loadTags(ctx context.Context, item *Changelog) error {
	rows, err := a.db.QueryContext(ctx, `SELECT tag FROM changelog_tags WHERE changelog_id = ? ORDER BY sort_order, tag`, item.internalID)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var value string
		if err = rows.Scan(&value); err != nil {
			return err
		}
		item.Tags = append(item.Tags, value)
	}
	return rows.Err()
}

func (a *API) loadLinks(ctx context.Context, item *Changelog) error {
	rows, err := a.db.QueryContext(ctx, `SELECT kind, label, url, description FROM changelog_links WHERE changelog_id = ? ORDER BY sort_order, id`, item.internalID)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var value Link
		var description sql.NullString
		if err = rows.Scan(&value.Kind, &value.Label, &value.URL, &description); err != nil {
			return err
		}
		value.Description = description.String
		item.Links = append(item.Links, value)
	}
	return rows.Err()
}

func (a *API) loadMedia(ctx context.Context, item *Changelog) error {
	rows, err := a.db.QueryContext(ctx, `SELECT kind, title, url, thumbnail_url, alt_text, caption, mime_type, width_px, height_px, duration_seconds, transcript_url FROM changelog_media WHERE changelog_id = ? ORDER BY sort_order, id`, item.internalID)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var value Media
		var title, thumb, alt, caption, mime, transcript sql.NullString
		var width, height sql.NullInt64
		var duration sql.NullFloat64
		if err = rows.Scan(&value.Kind, &title, &value.URL, &thumb, &alt, &caption, &mime, &width, &height, &duration, &transcript); err != nil {
			return err
		}
		value.Title, value.ThumbnailURL, value.AltText, value.Caption, value.MIMEType, value.TranscriptURL = title.String, thumb.String, alt.String, caption.String, mime.String, transcript.String
		if width.Valid {
			v := int(width.Int64)
			value.Width = &v
		}
		if height.Valid {
			v := int(height.Int64)
			value.Height = &v
		}
		if duration.Valid {
			v := duration.Float64
			value.DurationSeconds = &v
		}
		item.Media = append(item.Media, value)
	}
	return rows.Err()
}

func (a *API) loadDevlogs(ctx context.Context, item *Changelog) error {
	rows, err := a.db.QueryContext(ctx, `SELECT title, summary, body, author_name, url, published_at FROM changelog_devlogs WHERE changelog_id = ? ORDER BY sort_order, id`, item.internalID)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var value Devlog
		var summary, body, author, url sql.NullString
		var published sql.NullTime
		if err = rows.Scan(&value.Title, &summary, &body, &author, &url, &published); err != nil {
			return err
		}
		value.Summary, value.Body, value.AuthorName, value.URL = summary.String, body.String, author.String, url.String
		if published.Valid {
			value.PublishedAt = &published.Time
		}
		item.Devlogs = append(item.Devlogs, value)
	}
	return rows.Err()
}

func (a *API) loadRelations(ctx context.Context, item *Changelog) error {
	rows, err := a.db.QueryContext(ctx, `SELECT r.relation_type, r.label, c.slug, c.version, c.title FROM changelog_relations r JOIN changelogs c ON c.id = r.target_changelog_id WHERE r.source_changelog_id = ? AND c.status = 'published' ORDER BY r.sort_order, c.release_date DESC`, item.internalID)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var value Relation
		var label sql.NullString
		if err = rows.Scan(&value.Type, &label, &value.Slug, &value.Version, &value.Title); err != nil {
			return err
		}
		value.Label = label.String
		item.Related = append(item.Related, value)
	}
	return rows.Err()
}

func (a *API) loadRisks(ctx context.Context, item *Changelog) error {
	rows, err := a.db.QueryContext(ctx, `SELECT severity, category, title, summary, mitigation, affected_versions, resolved_in_version, advisory_url, cve_id FROM changelog_risks WHERE changelog_id = ? AND is_public = TRUE ORDER BY sort_order, id`, item.internalID)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var value Risk
		var mitigation, affected, resolved, advisory, cve sql.NullString
		if err = rows.Scan(&value.Severity, &value.Category, &value.Title, &value.Summary, &mitigation, &affected, &resolved, &advisory, &cve); err != nil {
			return err
		}
		value.Mitigation, value.AffectedVersions, value.ResolvedInVersion, value.AdvisoryURL, value.CVEID = mitigation.String, affected.String, resolved.String, advisory.String, cve.String
		item.Risks = append(item.Risks, value)
	}
	return rows.Err()
}

func (a *API) fail(w http.ResponseWriter, r *http.Request, err error) {
	a.logger.Error("database request failed", "method", r.Method, "path", r.URL.Path, "error", err)
	writeError(w, http.StatusInternalServerError, "internal_error", "The request could not be completed.")
}

func pagination(r *http.Request) (int, int, error) {
	limit, offset := 20, 0
	var err error
	if raw := r.URL.Query().Get("limit"); raw != "" {
		limit, err = strconv.Atoi(raw)
		if err != nil || limit < 1 || limit > 50 {
			return 0, 0, fmt.Errorf("limit must be between 1 and 50")
		}
	}
	if raw := r.URL.Query().Get("offset"); raw != "" {
		offset, err = strconv.Atoi(raw)
		if err != nil || offset < 0 || offset > 10000 {
			return 0, 0, fmt.Errorf("offset must be between 0 and 10000")
		}
	}
	return limit, offset, nil
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, map[string]any{"error": map[string]string{"code": code, "message": message}})
}

func Migrate(ctx context.Context, db *sql.DB) error {
	if _, err := db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(255) PRIMARY KEY, applied_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`); err != nil {
		return fmt.Errorf("create migration catalog: %w", err)
	}
	entries, err := fs.Glob(migrationFiles, "migrations/*.sql")
	if err != nil {
		return err
	}
	sort.Strings(entries)
	for _, name := range entries {
		var applied int
		if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM schema_migrations WHERE name = ?`, name).Scan(&applied); err != nil {
			return err
		}
		if applied > 0 {
			continue
		}
		body, readErr := migrationFiles.ReadFile(name)
		if readErr != nil {
			return readErr
		}
		tx, beginErr := db.BeginTx(ctx, nil)
		if beginErr != nil {
			return beginErr
		}
		for _, statement := range strings.Split(string(body), "-- migrate:split") {
			if strings.TrimSpace(statement) == "" {
				continue
			}
			if _, err = tx.ExecContext(ctx, statement); err != nil {
				_ = tx.Rollback()
				return fmt.Errorf("migration %s: %w", name, err)
			}
		}
		if _, err = tx.ExecContext(ctx, `INSERT INTO schema_migrations (name) VALUES (?)`, name); err != nil {
			_ = tx.Rollback()
			return err
		}
		if err = tx.Commit(); err != nil {
			return err
		}
	}
	return nil
}
