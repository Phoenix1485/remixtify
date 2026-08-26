//go:build windows

package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadDefaultsAutomaticUpdatesToEnabled(t *testing.T) {
	t.Setenv("LOCALAPPDATA", t.TempDir())
	cfg, err := Load()
	if err != nil {
		t.Fatal(err)
	}
	if !cfg.AutoUpdate {
		t.Fatal("automatic downloads should default to enabled")
	}
	cfg.AutoUpdate = false
	if err := cfg.Save(); err != nil {
		t.Fatal(err)
	}
	reloaded, err := Load()
	if err != nil {
		t.Fatal(err)
	}
	if reloaded.AutoUpdate {
		t.Fatal("saved manual-update preference was not preserved")
	}
}

func TestIsMicrosoftStorePath(t *testing.T) {
	if !IsMicrosoftStorePath(`C:\Program Files\WindowsApps\SpotifyAB.SpotifyMusic_1.2.3.0_x64__zpdnekdrzrea0`) {
		t.Fatal("Microsoft Store package path was not recognized")
	}
}

func TestClassicPathIsNotMicrosoftStore(t *testing.T) {
	if IsMicrosoftStorePath(`C:\Users\listener\AppData\Roaming\Spotify`) {
		t.Fatal("direct Spotify path was classified as Microsoft Store")
	}
}

func TestLoadKeepsLegacyStateAvailableForReadOnlyCommands(t *testing.T) {
	base := t.TempDir()
	t.Setenv("LOCALAPPDATA", base)
	legacy := filepath.Join(base, "SpotifyRedesign")
	if err := os.MkdirAll(legacy, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(legacy, "config.json"), []byte(`{"spotifyPath":"legacy","autoUpdate":false}`), 0o600); err != nil {
		t.Fatal(err)
	}
	cfg, err := Load()
	if err != nil {
		t.Fatal(err)
	}
	if cfg.StateDir != legacy || cfg.SpotifyPath != "legacy" {
		t.Fatalf("legacy state was not loaded: %#v", cfg)
	}
}

func TestInstallMigrationMovesLegacyStateToRemixify(t *testing.T) {
	base := t.TempDir()
	t.Setenv("LOCALAPPDATA", base)
	legacy := filepath.Join(base, "SpotifyRedesign")
	if err := os.MkdirAll(legacy, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(legacy, "config.json"), []byte(`{"spotifyPath":"legacy","autoUpdate":true}`), 0o600); err != nil {
		t.Fatal(err)
	}
	if err := MigrateLegacyState(); err != nil {
		t.Fatal(err)
	}
	expected := filepath.Join(base, "Remixify")
	if _, err := os.Stat(filepath.Join(expected, "config.json")); err != nil {
		t.Fatalf("migrated config is missing: %v", err)
	}
	if _, err := os.Stat(legacy); !os.IsNotExist(err) {
		t.Fatalf("legacy state still exists: %v", err)
	}
}

func TestInstallMigrationMovesFormerRemixtifyStateToRemixify(t *testing.T) {
	base := t.TempDir()
	t.Setenv("LOCALAPPDATA", base)
	former := filepath.Join(base, "Remixtify")
	if err := os.MkdirAll(former, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(former, "config.json"), []byte(`{"spotifyPath":"former","autoUpdate":true}`), 0o600); err != nil {
		t.Fatal(err)
	}
	if err := MigrateLegacyState(); err != nil {
		t.Fatal(err)
	}
	expected := filepath.Join(base, "Remixify")
	if _, err := os.Stat(filepath.Join(expected, "config.json")); err != nil {
		t.Fatalf("migrated former config is missing: %v", err)
	}
	if _, err := os.Stat(former); !os.IsNotExist(err) {
		t.Fatalf("former state still exists: %v", err)
	}
}
