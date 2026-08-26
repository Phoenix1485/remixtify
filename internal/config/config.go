package config

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

type Config struct {
	SpotifyPath string `json:"spotifyPath"`
	ChannelURL  string `json:"channelUrl,omitempty"`
	AutoUpdate  bool   `json:"autoUpdate"`
	StateDir    string `json:"-"`
}

func DefaultStateDir() (string, error) {
	switch runtime.GOOS {
	case "windows":
		base := os.Getenv("LOCALAPPDATA")
		if base == "" {
			return "", errors.New("LOCALAPPDATA is not set")
		}
		return filepath.Join(base, "Remixify"), nil
	case "darwin":
		home, err := os.UserHomeDir()
		if err != nil {
			return "", err
		}
		return filepath.Join(home, "Library", "Application Support", "Remixify"), nil
	default:
		base := os.Getenv("XDG_STATE_HOME")
		if base == "" {
			home, err := os.UserHomeDir()
			if err != nil {
				return "", err
			}
			base = filepath.Join(home, ".local", "state")
		}
		return filepath.Join(base, "remixify"), nil
	}
}

func legacyStateDirs() ([]string, error) {
	switch runtime.GOOS {
	case "windows":
		base := os.Getenv("LOCALAPPDATA")
		if base == "" {
			return nil, errors.New("LOCALAPPDATA is not set")
		}
		return []string{filepath.Join(base, "Remixtify"), filepath.Join(base, "SpotifyRedesign")}, nil
	case "darwin":
		home, err := os.UserHomeDir()
		if err != nil {
			return nil, err
		}
		return []string{
			filepath.Join(home, "Library", "Application Support", "Remixtify"),
			filepath.Join(home, "Library", "Application Support", "SpotifyRedesign"),
		}, nil
	default:
		base := os.Getenv("XDG_STATE_HOME")
		if base == "" {
			home, err := os.UserHomeDir()
			if err != nil {
				return nil, err
			}
			base = filepath.Join(home, ".local", "state")
		}
		return []string{filepath.Join(base, "remixtify"), filepath.Join(base, "spotify-redesign")}, nil
	}
}

// MigrateLegacyState moves an existing Remixtify or Spotify Redesign CLI state
// directory to the Remixify location. It is called only by install, not by
// read-only commands.
func MigrateLegacyState() error {
	stateDir, err := DefaultStateDir()
	if err != nil {
		return err
	}
	if _, err := os.Stat(stateDir); err == nil {
		return nil
	} else if !errors.Is(err, os.ErrNotExist) {
		return err
	}
	legacyDirs, err := legacyStateDirs()
	if err != nil {
		return err
	}
	legacyDir := ""
	for _, candidate := range legacyDirs {
		if _, statErr := os.Stat(candidate); statErr == nil {
			legacyDir = candidate
			break
		} else if !errors.Is(statErr, os.ErrNotExist) {
			return statErr
		}
	}
	if legacyDir == "" {
		return nil
	}
	if err := os.MkdirAll(filepath.Dir(stateDir), 0o755); err != nil {
		return err
	}
	if err := os.Rename(legacyDir, stateDir); err != nil {
		return fmt.Errorf("migrate legacy CLI state from %s to %s: %w", legacyDir, stateDir, err)
	}
	return nil
}

func Load() (Config, error) {
	stateDir, err := DefaultStateDir()
	if err != nil {
		return Config{}, err
	}
	configPath := filepath.Join(stateDir, "config.json")
	if _, statErr := os.Stat(configPath); errors.Is(statErr, os.ErrNotExist) {
		if legacyDirs, legacyErr := legacyStateDirs(); legacyErr == nil {
			for _, legacyDir := range legacyDirs {
				legacyConfig := filepath.Join(legacyDir, "config.json")
				if _, legacyStatErr := os.Stat(legacyConfig); legacyStatErr == nil {
					stateDir = legacyDir
					configPath = legacyConfig
					break
				}
			}
		}
	}
	cfg := Config{StateDir: stateDir, AutoUpdate: true}
	raw, err := os.ReadFile(configPath)
	if errors.Is(err, os.ErrNotExist) {
		return cfg, nil
	}
	if err != nil {
		return Config{}, err
	}
	if err := json.Unmarshal(raw, &cfg); err != nil {
		return Config{}, err
	}
	cfg.StateDir = stateDir
	return cfg, nil
}

func (c Config) Save() error {
	if c.StateDir == "" {
		return errors.New("state directory is empty")
	}
	if err := os.MkdirAll(c.StateDir, 0o755); err != nil {
		return err
	}
	raw, err := json.MarshalIndent(c, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(c.StateDir, "config.json"), append(raw, '\n'), 0o600)
}

func DetectSpotifyPath() (string, error) {
	candidates := []string{}
	switch runtime.GOOS {
	case "windows":
		candidates = append(candidates, filepath.Join(os.Getenv("APPDATA"), "Spotify"))
	case "darwin":
		candidates = append(candidates, "/Applications/Spotify.app/Contents/Resources")
	case "linux":
		if path, err := exec.LookPath("spotify"); err == nil {
			resolved, resolveErr := filepath.EvalSymlinks(path)
			if resolveErr == nil {
				candidates = append(candidates, filepath.Dir(resolved))
			}
		}
		candidates = append(candidates,
			"/opt/spotify",
			"/usr/share/spotify",
			"/usr/libexec/spotify",
		)
	}

	for _, candidate := range candidates {
		candidate = strings.TrimSpace(candidate)
		if candidate == "" {
			continue
		}
		if info, err := os.Stat(filepath.Join(candidate, "Apps", "xpui.spa")); err == nil && !info.IsDir() {
			cleaned := filepath.Clean(candidate)
			if err := ValidateSpotifyPath(cleaned); err != nil {
				return "", err
			}
			return cleaned, nil
		}
		if hasManagedMarker(filepath.Join(candidate, "Apps", "xpui")) {
			cleaned := filepath.Clean(candidate)
			if err := ValidateSpotifyPath(cleaned); err != nil {
				return "", err
			}
			return cleaned, nil
		}
	}
	if runtime.GOOS == "windows" {
		if storePath := detectWindowsStoreSpotify(); storePath != "" {
			return storePath, nil
		}
	}
	return "", errors.New("could not locate Spotify; pass --spotify with the installation directory")
}

func ValidateSpotifyPath(path string) error {
	if strings.TrimSpace(path) == "" {
		return errors.New("Spotify path is empty")
	}
	if info, err := os.Stat(filepath.Join(path, "Apps", "xpui.spa")); err == nil && !info.IsDir() {
		return nil
	}
	if hasManagedMarker(filepath.Join(path, "Apps", "xpui")) {
		return nil
	}
	return errors.New("Spotify path does not contain Apps/xpui.spa")
}

func hasManagedMarker(xpuiDir string) bool {
	for _, name := range []string{".remixify.json", ".remixtify.json", ".spotify-redesign.json"} {
		if info, err := os.Stat(filepath.Join(xpuiDir, name)); err == nil && !info.IsDir() {
			return true
		}
	}
	return false
}

func IsMicrosoftStorePath(path string) bool {
	normalized := strings.ToLower(filepath.ToSlash(filepath.Clean(path)))
	return strings.Contains(normalized, "/windowsapps/spotifyab.spotifymusic_")
}

func detectWindowsStoreSpotify() string {
	powershell, err := exec.LookPath("powershell.exe")
	if err != nil {
		return ""
	}
	command := exec.Command(
		powershell,
		"-NoProfile",
		"-NonInteractive",
		"-Command",
		`(Get-AppxPackage -Name SpotifyAB.SpotifyMusic -ErrorAction SilentlyContinue).InstallLocation`,
	)
	output, err := command.Output()
	if err != nil {
		return ""
	}
	path := filepath.Clean(strings.TrimSpace(string(output)))
	if path == "." || !IsMicrosoftStorePath(path) {
		return ""
	}
	if info, err := os.Stat(filepath.Join(path, "Apps", "xpui.spa")); err == nil && !info.IsDir() {
		return path
	}
	return ""
}
