package patcher

import (
	"archive/zip"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestApplyAndRestore(t *testing.T) {
	root := t.TempDir()
	spotify := filepath.Join(root, "Spotify")
	apps := filepath.Join(spotify, "Apps")
	state := filepath.Join(root, "state")
	assetsRoot := filepath.Join(root, "assets")
	if err := os.MkdirAll(apps, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(assetsRoot, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(assetsRoot, "bootstrap.js"), []byte("window.bootstrap=true;"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(assetsRoot, "core.js"), []byte("window.core=true;"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(assetsRoot, "channel.json"), []byte(`{"schemaVersion":1}`), 0o644); err != nil {
		t.Fatal(err)
	}

	archive := filepath.Join(apps, "xpui.spa")
	createArchive(t, archive, map[string]string{
		"index.html": "<!doctype html><html><body><main>Spotify</main></body></html>",
		"xpui.js":    "window.spotify=true;",
	})
	original, err := os.ReadFile(archive)
	if err != nil {
		t.Fatal(err)
	}

	manager := Manager{
		SpotifyPath: spotify,
		StateDir:    state,
		ChannelURL:  "https://example.test/channel.json",
		Assets:      os.DirFS(assetsRoot),
	}
	if err := manager.Apply(); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(archive); !os.IsNotExist(err) {
		t.Fatalf("expected source archive to be inactive, got %v", err)
	}
	index, err := os.ReadFile(filepath.Join(apps, "xpui", "index.html"))
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(index), startTag) || !strings.Contains(string(index), "redesign/bootstrap.js") {
		t.Fatalf("index was not patched: %s", index)
	}
	runtimeConfig, err := os.ReadFile(filepath.Join(apps, "xpui", "redesign", "runtime-config.js"))
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(runtimeConfig), "https://example.test/channel.json") {
		t.Fatalf("runtime channel missing: %s", runtimeConfig)
	}
	if !strings.Contains(string(runtimeConfig), `"autoUpdate":false`) {
		t.Fatalf("runtime update preference missing: %s", runtimeConfig)
	}
	updateStatusPath := filepath.Join(apps, "xpui", "redesign", "update-status.json")
	updateStatus, err := os.ReadFile(updateStatusPath)
	if err != nil || !strings.Contains(string(updateStatus), `"ready":false`) {
		t.Fatalf("initial update status is invalid: %s, %v", updateStatus, err)
	}
	if err := os.WriteFile(filepath.Join(state, "pending-update.json"), []byte(`{"version":"next-version"}`), 0o600); err != nil {
		t.Fatal(err)
	}
	if err := manager.SyncUpdateStatus(); err != nil {
		t.Fatal(err)
	}
	updateStatus, err = os.ReadFile(updateStatusPath)
	if err != nil || !strings.Contains(string(updateStatus), `"ready":true`) || !strings.Contains(string(updateStatus), `"version":"next-version"`) {
		t.Fatalf("pending update status was not synchronized: %s, %v", updateStatus, err)
	}

	status, err := manager.Status()
	if err != nil {
		t.Fatal(err)
	}
	if !status.Applied || !status.ManagedDirectory || status.SpotifyArchive {
		t.Fatalf("unexpected applied status: %+v", status)
	}

	if err := manager.Restore(); err != nil {
		t.Fatal(err)
	}
	restored, err := os.ReadFile(archive)
	if err != nil {
		t.Fatal(err)
	}
	if string(restored) != string(original) {
		t.Fatal("restored archive differs from original")
	}
	if _, err := os.Stat(filepath.Join(apps, "xpui")); !os.IsNotExist(err) {
		t.Fatalf("managed directory still exists: %v", err)
	}
}

func TestStoreModeUsesWritableAppDirectory(t *testing.T) {
	root := t.TempDir()
	spotify := filepath.Join(root, "WindowsApps", "SpotifyAB.SpotifyMusic_1.2.3.0_x64__test")
	sourceApps := filepath.Join(spotify, "Apps")
	state := filepath.Join(root, "state")
	assetsRoot := filepath.Join(root, "assets")
	if err := os.MkdirAll(sourceApps, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(assetsRoot, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(assetsRoot, "bootstrap.js"), []byte("window.bootstrap=true;"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(assetsRoot, "core.js"), []byte("window.core=true;"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(assetsRoot, "channel.json"), []byte(`{"schemaVersion":1}`), 0o644); err != nil {
		t.Fatal(err)
	}
	createArchive(t, filepath.Join(sourceApps, "login.spa"), map[string]string{"index.html": "stock login"})
	if err := os.WriteFile(filepath.Join(sourceApps, "native-licenses.html"), []byte("licenses"), 0o644); err != nil {
		t.Fatal(err)
	}

	archive := filepath.Join(sourceApps, "xpui.spa")
	createArchive(t, archive, map[string]string{
		"index.html": "<!doctype html><html><body><main>Store Spotify</main></body></html>",
	})
	original, err := os.ReadFile(archive)
	if err != nil {
		t.Fatal(err)
	}

	manager := Manager{
		SpotifyPath: spotify,
		StateDir:    state,
		Assets:      os.DirFS(assetsRoot),
		StoreMode:   true,
	}
	if err := manager.Apply(); err != nil {
		t.Fatal(err)
	}
	current, err := os.ReadFile(archive)
	if err != nil {
		t.Fatal(err)
	}
	if string(current) != string(original) {
		t.Fatal("Store source archive was modified")
	}
	if _, err := os.Stat(filepath.Join(state, "AppX", "xpui", "index.html")); err != nil {
		t.Fatalf("patched Store app directory is missing: %v", err)
	}
	login, err := os.ReadFile(filepath.Join(state, "AppX", "login", "index.html"))
	if err != nil || string(login) != "stock login" {
		t.Fatalf("Store companion app was not copied: %q, %v", login, err)
	}
	licenses, err := os.ReadFile(filepath.Join(state, "AppX", "native-licenses.html"))
	if err != nil || string(licenses) != "licenses" {
		t.Fatalf("Store companion file was not copied: %q, %v", licenses, err)
	}
	status, err := manager.Status()
	if err != nil {
		t.Fatal(err)
	}
	if !status.Applied || !status.SpotifyArchive || !status.ManagedDirectory {
		t.Fatalf("unexpected Store status: %+v", status)
	}

	createArchive(t, archive, map[string]string{
		"index.html": "<!doctype html><html><body><main>Updated Store Spotify</main></body></html>",
	})
	status, err = manager.Status()
	if err != nil {
		t.Fatal(err)
	}
	if status.Applied {
		t.Fatal("updated Store archive was incorrectly reported as applied")
	}
	if err := manager.Apply(); err != nil {
		t.Fatal(err)
	}
	if err := manager.Restore(); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(state, "AppX")); !os.IsNotExist(err) {
		t.Fatalf("Store app directory still exists after restore: %v", err)
	}
	if _, err := os.Stat(archive); err != nil {
		t.Fatalf("Store source archive was removed: %v", err)
	}
}

func TestRefusesUnownedXPUIDirectory(t *testing.T) {
	root := t.TempDir()
	spotify := filepath.Join(root, "Spotify")
	apps := filepath.Join(spotify, "Apps")
	if err := os.MkdirAll(filepath.Join(apps, "xpui"), 0o755); err != nil {
		t.Fatal(err)
	}
	createArchive(t, filepath.Join(apps, "xpui.spa"), map[string]string{"index.html": "<body></body>"})
	manager := Manager{SpotifyPath: spotify, StateDir: filepath.Join(root, "state"), Assets: emptyFS{}}
	if err := manager.Apply(); err == nil || !strings.Contains(err.Error(), "not managed") {
		t.Fatalf("expected ownership error, got %v", err)
	}
}

func TestRejectsZipTraversal(t *testing.T) {
	root := t.TempDir()
	archive := filepath.Join(root, "unsafe.spa")
	createArchive(t, archive, map[string]string{"../escape.txt": "unsafe"})
	if err := extractZip(archive, filepath.Join(root, "output")); err == nil {
		t.Fatal("expected unsafe archive path to be rejected")
	}
}

func TestApplyUpgradesLegacyOwnershipAndInjectionMarkers(t *testing.T) {
	root := t.TempDir()
	spotify := filepath.Join(root, "Spotify")
	apps := filepath.Join(spotify, "Apps")
	xpui := filepath.Join(apps, "xpui")
	assetsRoot := filepath.Join(root, "assets")
	if err := os.MkdirAll(xpui, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(assetsRoot, 0o755); err != nil {
		t.Fatal(err)
	}
	for _, name := range []string{"bootstrap.js", "channel.json"} {
		if err := os.WriteFile(filepath.Join(assetsRoot, name), []byte("{}"), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	legacyIndex := "<body>" + legacyStartTag + "<script src=\"redesign/bootstrap.js\"></script>" + legacyEndTag + "</body>"
	if err := os.WriteFile(filepath.Join(xpui, "index.html"), []byte(legacyIndex), 0o644); err != nil {
		t.Fatal(err)
	}
	legacyMarker := `{"schemaVersion":1,"originalSha256":"legacy-sha","appliedAt":"2026-01-01T00:00:00Z"}`
	if err := os.WriteFile(filepath.Join(xpui, legacyMarkerName), []byte(legacyMarker), 0o600); err != nil {
		t.Fatal(err)
	}
	manager := Manager{SpotifyPath: spotify, StateDir: filepath.Join(root, "state"), Assets: os.DirFS(assetsRoot)}
	if err := manager.Apply(); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(xpui, markerName)); err != nil {
		t.Fatalf("Remixify marker was not written: %v", err)
	}
	if _, err := os.Stat(filepath.Join(xpui, legacyMarkerName)); !os.IsNotExist(err) {
		t.Fatalf("legacy marker was not removed: %v", err)
	}
	index, err := os.ReadFile(filepath.Join(xpui, "index.html"))
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(index), legacyStartTag) || !strings.Contains(string(index), startTag) {
		t.Fatalf("legacy injection was not upgraded: %s", index)
	}
}

func createArchive(t *testing.T, path string, files map[string]string) {
	t.Helper()
	file, err := os.Create(path)
	if err != nil {
		t.Fatal(err)
	}
	writer := zip.NewWriter(file)
	for name, content := range files {
		entry, err := writer.Create(name)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := entry.Write([]byte(content)); err != nil {
			t.Fatal(err)
		}
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}
	if err := file.Close(); err != nil {
		t.Fatal(err)
	}
}

type emptyFS struct{}

func (emptyFS) Open(string) (fs.File, error) { return nil, fs.ErrNotExist }
