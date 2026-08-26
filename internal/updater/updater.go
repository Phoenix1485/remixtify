package updater

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

type channel struct {
	CLI *struct {
		Version   string                        `json:"version"`
		Downloads map[string]downloadDefinition `json:"downloads"`
	} `json:"cli"`
}

type downloadDefinition struct {
	URL    string `json:"url"`
	SHA256 string `json:"sha256"`
}

type PendingUpdate struct {
	Version string `json:"version"`
	Path    string `json:"path"`
	SHA256  string `json:"sha256"`
}

func Check(channelURL, currentVersion, stateDir string) (string, error) {
	if strings.TrimSpace(channelURL) == "" || currentVersion == "dev" {
		return "", nil
	}
	request, err := http.NewRequest(http.MethodGet, channelURL, nil)
	if err != nil {
		return "", err
	}
	request.Header.Set("User-Agent", "Remixify/"+currentVersion)
	client := &http.Client{Timeout: 15 * time.Second}
	response, err := client.Do(request)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return "", fmt.Errorf("update channel returned HTTP %d", response.StatusCode)
	}
	var update channel
	if err := json.NewDecoder(io.LimitReader(response.Body, 2<<20)).Decode(&update); err != nil {
		return "", err
	}
	if update.CLI == nil || update.CLI.Version == "" || update.CLI.Version == currentVersion {
		return "", nil
	}
	key := runtime.GOOS + "-" + runtime.GOARCH
	download, ok := update.CLI.Downloads[key]
	if !ok || download.URL == "" || download.SHA256 == "" {
		return "", nil
	}

	versionDir := filepath.Join(stateDir, "versions", safeVersion(update.CLI.Version))
	name := "remixify"
	if runtime.GOOS == "windows" {
		name += ".exe"
	}
	target := filepath.Join(versionDir, name)
	if err := os.MkdirAll(versionDir, 0o755); err != nil {
		return "", err
	}
	if validFile(target, download.SHA256) {
		if err := writePending(stateDir, update.CLI.Version, target, download.SHA256); err != nil {
			return "", err
		}
		return target, nil
	}

	temporary := target + ".download"
	if err := downloadFile(client, download.URL, temporary); err != nil {
		return "", err
	}
	defer os.Remove(temporary)
	if !validFile(temporary, download.SHA256) {
		return "", errors.New("downloaded update failed SHA-256 verification")
	}
	if err := os.Chmod(temporary, 0o755); err != nil {
		return "", err
	}
	if err := os.Rename(temporary, target); err != nil {
		return "", err
	}
	if err := writePending(stateDir, update.CLI.Version, target, download.SHA256); err != nil {
		return "", err
	}
	return target, nil
}

func Pending(stateDir string) (PendingUpdate, error) {
	raw, err := os.ReadFile(filepath.Join(stateDir, "pending-update.json"))
	if errors.Is(err, os.ErrNotExist) {
		return PendingUpdate{}, nil
	}
	if err != nil {
		return PendingUpdate{}, err
	}
	var pending PendingUpdate
	if err := json.Unmarshal(raw, &pending); err != nil {
		return PendingUpdate{}, err
	}
	if pending.Version == "" || pending.Path == "" || pending.SHA256 == "" {
		return PendingUpdate{}, errors.New("pending update metadata is incomplete")
	}
	if !validFile(pending.Path, pending.SHA256) {
		return PendingUpdate{}, errors.New("pending update failed SHA-256 verification")
	}
	return pending, nil
}

func Activate(stateDir, executablePath string) error {
	versionsRoot, err := filepath.Abs(filepath.Join(stateDir, "versions"))
	if err != nil {
		return err
	}
	executable, err := filepath.Abs(executablePath)
	if err != nil {
		return err
	}
	relative, err := filepath.Rel(versionsRoot, executable)
	if err != nil || relative == ".." || strings.HasPrefix(relative, ".."+string(os.PathSeparator)) || filepath.IsAbs(relative) {
		return fmt.Errorf("refusing to activate an update outside %s", versionsRoot)
	}
	version := filepath.Base(filepath.Dir(executable))
	if safeVersion(version) != version {
		return errors.New("pending update has an invalid version directory")
	}
	return setCurrent(stateDir, version)
}

func ClearPending(stateDir string) error {
	err := os.Remove(filepath.Join(stateDir, "pending-update.json"))
	if errors.Is(err, os.ErrNotExist) {
		return nil
	}
	return err
}

func writePending(stateDir, version, path, sha256 string) error {
	pending := PendingUpdate{Version: safeVersion(version), Path: path, SHA256: sha256}
	raw, err := json.MarshalIndent(pending, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(stateDir, "pending-update.json"), append(raw, '\n'), 0o600)
}

func downloadFile(client *http.Client, url, destination string) error {
	request, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	request.Header.Set("User-Agent", "Remixify-Updater")
	response, err := client.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return fmt.Errorf("update download returned HTTP %d", response.StatusCode)
	}
	file, err := os.OpenFile(destination, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0o700)
	if err != nil {
		return err
	}
	_, copyErr := io.Copy(file, io.LimitReader(response.Body, 100<<20))
	closeErr := file.Close()
	if copyErr != nil {
		return copyErr
	}
	return closeErr
}

func validFile(path, expected string) bool {
	file, err := os.Open(path)
	if err != nil {
		return false
	}
	defer file.Close()
	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return false
	}
	return strings.EqualFold(hex.EncodeToString(hash.Sum(nil)), expected)
}

func setCurrent(stateDir, version string) error {
	return os.WriteFile(filepath.Join(stateDir, "current.txt"), []byte(safeVersion(version)+"\n"), 0o600)
}

func safeVersion(version string) string {
	return strings.Map(func(character rune) rune {
		if character >= 'a' && character <= 'z' || character >= 'A' && character <= 'Z' || character >= '0' && character <= '9' || character == '-' || character == '_' || character == '.' {
			return character
		}
		return '-'
	}, version)
}
