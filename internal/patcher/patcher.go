package patcher

import (
	"archive/zip"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const (
	markerName       = ".remixify.json"
	formerMarkerName = ".remixtify.json"
	legacyMarkerName = ".spotify-redesign.json"
	startTag         = "<!-- remixify:start -->"
	endTag           = "<!-- remixify:end -->"
	formerStartTag   = "<!-- remixtify:start -->"
	formerEndTag     = "<!-- remixtify:end -->"
	legacyStartTag   = "<!-- spotify-redesign:start -->"
	legacyEndTag     = "<!-- spotify-redesign:end -->"
)

type Marker struct {
	SchemaVersion  int       `json:"schemaVersion"`
	OriginalSHA    string    `json:"originalSha256"`
	SourceSize     int64     `json:"sourceSize,omitempty"`
	SourceModified int64     `json:"sourceModifiedUnixNano,omitempty"`
	AppliedAt      time.Time `json:"appliedAt"`
}

type Manager struct {
	SpotifyPath string
	StateDir    string
	ChannelURL  string
	Assets      fs.FS
	StoreMode   bool
	AutoUpdate  bool
}

type Status struct {
	Applied          bool
	SpotifyArchive   bool
	ManagedDirectory bool
	OriginalSHA      string
}

func (m Manager) Apply() error {
	sourceAppsDir, targetAppsDir, managedDir, archive, err := m.paths()
	if err != nil {
		return err
	}

	owned, marker, err := readOwnedMarker(managedDir)
	if err != nil {
		return err
	}
	if _, err := os.Stat(managedDir); err == nil && !owned {
		return fmt.Errorf("%s already exists and is not managed by Remixify; restore the other modification first", managedDir)
	}

	if _, err := os.Stat(archive); errors.Is(err, os.ErrNotExist) {
		if !owned || m.StoreMode {
			return fmt.Errorf("Spotify UI archive not found: %s", archive)
		}
		return m.refreshAssets(managedDir, marker)
	} else if err != nil {
		return err
	}

	sha, backupPath, err := m.backupArchive(archive)
	if err != nil {
		return err
	}
	if err := verifySHA256(backupPath, sha); err != nil {
		return fmt.Errorf("backup verification failed: %w", err)
	}
	if m.StoreMode && owned && strings.EqualFold(marker.OriginalSHA, sha) {
		if err := copyStoreCompanions(sourceAppsDir, targetAppsDir); err != nil {
			return err
		}
		return m.refreshAssets(managedDir, marker)
	}

	if err := os.MkdirAll(targetAppsDir, 0o755); err != nil {
		return err
	}
	staging, err := os.MkdirTemp(targetAppsDir, ".remixify-staging-")
	if err != nil {
		return err
	}
	defer os.RemoveAll(staging)

	if err := extractZip(archive, staging); err != nil {
		return fmt.Errorf("extract xpui.spa: %w", err)
	}
	if err := patchIndex(filepath.Join(staging, "index.html")); err != nil {
		return err
	}
	newMarker := Marker{SchemaVersion: 1, OriginalSHA: sha, AppliedAt: time.Now().UTC()}
	if sourceInfo, statErr := os.Stat(archive); statErr == nil {
		newMarker.SourceSize = sourceInfo.Size()
		newMarker.SourceModified = sourceInfo.ModTime().UnixNano()
	}
	if err := m.installRuntime(staging, newMarker); err != nil {
		return err
	}

	if owned {
		if err := safeRemoveOwnedDirectory(targetAppsDir, managedDir); err != nil {
			return err
		}
	}
	if m.StoreMode {
		if err := copyStoreCompanions(sourceAppsDir, targetAppsDir); err != nil {
			return err
		}
	} else {
		if err := os.Remove(archive); err != nil {
			return fmt.Errorf("remove active archive after verified backup: %w", err)
		}
	}
	if err := os.Rename(staging, managedDir); err != nil {
		if !m.StoreMode {
			_ = copyFile(backupPath, archive)
		}
		return fmt.Errorf("activate patched UI: %w", err)
	}
	return nil
}

func (m Manager) Restore() error {
	_, targetAppsDir, managedDir, archive, err := m.paths()
	if err != nil {
		return err
	}
	owned, marker, err := readOwnedMarker(managedDir)
	if err != nil {
		return err
	}
	if !owned {
		return errors.New("Remixify is not applied")
	}
	if m.StoreMode {
		return safeRemoveStoreDirectory(m.StateDir, targetAppsDir, managedDir)
	}

	if _, err := os.Stat(archive); errors.Is(err, os.ErrNotExist) {
		backup := filepath.Join(m.StateDir, "backups", marker.OriginalSHA+".spa")
		if err := verifySHA256(backup, marker.OriginalSHA); err != nil {
			return fmt.Errorf("cannot restore because the verified backup is unavailable: %w", err)
		}
		if err := copyFile(backup, archive); err != nil {
			return err
		}
	} else if err != nil {
		return err
	}
	return safeRemoveOwnedDirectory(targetAppsDir, managedDir)
}

func (m Manager) Status() (Status, error) {
	_, _, managedDir, archive, err := m.paths()
	if err != nil {
		return Status{}, err
	}
	owned, marker, err := readOwnedMarker(managedDir)
	if err != nil {
		return Status{}, err
	}
	_, archiveErr := os.Stat(archive)
	applied := owned && errors.Is(archiveErr, os.ErrNotExist)
	if m.StoreMode && owned && archiveErr == nil {
		if sourceInfo, statErr := os.Stat(archive); statErr != nil {
			return Status{}, statErr
		} else if marker.SourceSize > 0 && marker.SourceModified > 0 {
			applied = sourceInfo.Size() == marker.SourceSize && sourceInfo.ModTime().UnixNano() == marker.SourceModified
		} else {
			sha, hashErr := fileSHA256(archive)
			if hashErr != nil {
				return Status{}, hashErr
			}
			applied = strings.EqualFold(sha, marker.OriginalSHA)
		}
	}
	return Status{
		Applied:          applied,
		SpotifyArchive:   archiveErr == nil,
		ManagedDirectory: owned,
		OriginalSHA:      marker.OriginalSHA,
	}, nil
}

func (m Manager) SyncUpdateStatus() error {
	_, _, managedDir, _, err := m.paths()
	if err != nil {
		return err
	}
	return writeUpdateStatus(m.StateDir, filepath.Join(managedDir, "redesign"))
}

func (m Manager) paths() (sourceAppsDir, targetAppsDir, managedDir, archive string, err error) {
	if strings.TrimSpace(m.SpotifyPath) == "" || strings.TrimSpace(m.StateDir) == "" {
		return "", "", "", "", errors.New("Spotify path and state directory are required")
	}
	root, err := filepath.Abs(m.SpotifyPath)
	if err != nil {
		return "", "", "", "", err
	}
	sourceAppsDir = filepath.Join(root, "Apps")
	info, err := os.Stat(sourceAppsDir)
	if err != nil || !info.IsDir() {
		return "", "", "", "", fmt.Errorf("invalid Spotify Apps directory: %s", sourceAppsDir)
	}
	targetAppsDir = sourceAppsDir
	if m.StoreMode {
		targetAppsDir = filepath.Join(m.StateDir, "AppX")
	}
	return sourceAppsDir, targetAppsDir, filepath.Join(targetAppsDir, "xpui"), filepath.Join(sourceAppsDir, "xpui.spa"), nil
}

func (m Manager) backupArchive(archive string) (string, string, error) {
	sha, err := fileSHA256(archive)
	if err != nil {
		return "", "", err
	}
	backupDir := filepath.Join(m.StateDir, "backups")
	if err := os.MkdirAll(backupDir, 0o755); err != nil {
		return "", "", err
	}
	backup := filepath.Join(backupDir, sha+".spa")
	if _, err := os.Stat(backup); errors.Is(err, os.ErrNotExist) {
		if err := copyFile(archive, backup); err != nil {
			return "", "", err
		}
	} else if err != nil {
		return "", "", err
	}
	return sha, backup, nil
}

func (m Manager) refreshAssets(managedDir string, marker Marker) error {
	if err := patchIndex(filepath.Join(managedDir, "index.html")); err != nil {
		return err
	}
	return m.installRuntime(managedDir, marker)
}

func (m Manager) installRuntime(xpuiDir string, marker Marker) error {
	if m.Assets == nil {
		return errors.New("browser runtime assets are missing")
	}
	runtimeDir := filepath.Join(xpuiDir, "redesign")
	if err := os.RemoveAll(runtimeDir); err != nil {
		return err
	}
	if err := copyFS(m.Assets, runtimeDir); err != nil {
		return err
	}

	config := struct {
		ChannelURL      string `json:"channelUrl,omitempty"`
		LocalChannelURL string `json:"localChannelUrl"`
		AutoUpdate      bool   `json:"autoUpdate"`
	}{m.ChannelURL, "redesign/channel.json", m.AutoUpdate}
	raw, err := json.Marshal(config)
	if err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(runtimeDir, "runtime-config.js"), []byte("window.__SpotifyRedesignConfig="+string(raw)+";\n"), 0o644); err != nil {
		return err
	}
	if err := writeUpdateStatus(m.StateDir, runtimeDir); err != nil {
		return err
	}
	markerRaw, err := json.MarshalIndent(marker, "", "  ")
	if err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(xpuiDir, markerName), append(markerRaw, '\n'), 0o600); err != nil {
		return err
	}
	for _, oldMarker := range []string{formerMarkerName, legacyMarkerName} {
		if err := os.Remove(filepath.Join(xpuiDir, oldMarker)); err != nil && !errors.Is(err, os.ErrNotExist) {
			return err
		}
	}
	return nil
}

func writeUpdateStatus(stateDir, runtimeDir string) error {
	status := struct {
		Ready   bool   `json:"ready"`
		Version string `json:"version,omitempty"`
	}{}
	raw, err := os.ReadFile(filepath.Join(stateDir, "pending-update.json"))
	if err == nil {
		var pending struct {
			Version string `json:"version"`
		}
		if err := json.Unmarshal(raw, &pending); err != nil {
			return err
		}
		status.Ready = pending.Version != ""
		status.Version = pending.Version
	} else if !errors.Is(err, os.ErrNotExist) {
		return err
	}
	statusRaw, err := json.Marshal(status)
	if err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(runtimeDir, "update-status.json"), append(statusRaw, '\n'), 0o644)
}

func patchIndex(path string) error {
	raw, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("read Spotify index.html: %w", err)
	}
	content := string(raw)
	for _, tags := range [][2]string{{startTag, endTag}, {formerStartTag, formerEndTag}, {legacyStartTag, legacyEndTag}} {
		if start := strings.Index(content, tags[0]); start >= 0 {
			end := strings.Index(content[start:], tags[1])
			if end < 0 {
				return errors.New("found an incomplete Remixify injection marker")
			}
			content = content[:start] + content[start+end+len(tags[1]):]
		}
	}
	injection := startTag + "\n" +
		"<script src=\"redesign/runtime-config.js\"></script>\n" +
		"<script defer src=\"redesign/bootstrap.js\"></script>\n" + endTag + "\n"
	index := strings.LastIndex(strings.ToLower(content), "</body>")
	if index < 0 {
		return errors.New("Spotify index.html does not contain </body>")
	}
	content = content[:index] + injection + content[index:]
	return os.WriteFile(path, []byte(content), 0o644)
}

func extractZip(archive, destination string) error {
	reader, err := zip.OpenReader(archive)
	if err != nil {
		return err
	}
	defer reader.Close()
	root, err := filepath.Abs(destination)
	if err != nil {
		return err
	}
	for _, file := range reader.File {
		target := filepath.Join(root, filepath.FromSlash(file.Name))
		if !within(root, target) {
			return fmt.Errorf("archive contains unsafe path: %s", file.Name)
		}
		if file.FileInfo().IsDir() {
			if err := os.MkdirAll(target, 0o755); err != nil {
				return err
			}
			continue
		}
		if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
			return err
		}
		source, err := file.Open()
		if err != nil {
			return err
		}
		dest, err := os.OpenFile(target, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, file.Mode())
		if err != nil {
			source.Close()
			return err
		}
		_, copyErr := io.Copy(dest, source)
		closeErr := dest.Close()
		source.Close()
		if copyErr != nil {
			return copyErr
		}
		if closeErr != nil {
			return closeErr
		}
	}
	return nil
}

func copyFS(source fs.FS, destination string) error {
	return fs.WalkDir(source, ".", func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		target := filepath.Join(destination, filepath.FromSlash(path))
		if entry.IsDir() {
			return os.MkdirAll(target, 0o755)
		}
		raw, err := fs.ReadFile(source, path)
		if err != nil {
			return err
		}
		return os.WriteFile(target, raw, 0o644)
	})
}

func readOwnedMarker(managedDir string) (bool, Marker, error) {
	var raw []byte
	for _, name := range []string{markerName, formerMarkerName, legacyMarkerName} {
		candidate, err := os.ReadFile(filepath.Join(managedDir, name))
		if errors.Is(err, os.ErrNotExist) {
			continue
		}
		if err != nil {
			return false, Marker{}, err
		}
		raw = candidate
		break
	}
	if len(raw) == 0 {
		return false, Marker{}, nil
	}
	var marker Marker
	if err := json.Unmarshal(raw, &marker); err != nil {
		return false, Marker{}, fmt.Errorf("invalid ownership marker: %w", err)
	}
	if marker.SchemaVersion != 1 || marker.OriginalSHA == "" {
		return false, Marker{}, errors.New("unsupported ownership marker")
	}
	return true, marker, nil
}

func safeRemoveOwnedDirectory(appsDir, target string) error {
	appsAbs, err := filepath.Abs(appsDir)
	if err != nil {
		return err
	}
	targetAbs, err := filepath.Abs(target)
	if err != nil {
		return err
	}
	if filepath.Base(targetAbs) != "xpui" || !within(appsAbs, targetAbs) {
		return fmt.Errorf("refusing to remove unexpected directory: %s", targetAbs)
	}
	owned, _, err := readOwnedMarker(targetAbs)
	if err != nil {
		return err
	}
	if !owned {
		return errors.New("refusing to remove a directory without our ownership marker")
	}
	return os.RemoveAll(targetAbs)
}

func safeRemoveStoreDirectory(stateDir, targetAppsDir, managedDir string) error {
	stateAbs, err := filepath.Abs(stateDir)
	if err != nil {
		return err
	}
	targetAbs, err := filepath.Abs(targetAppsDir)
	if err != nil {
		return err
	}
	expected := filepath.Join(stateAbs, "AppX")
	if !strings.EqualFold(targetAbs, expected) || !within(stateAbs, targetAbs) {
		return fmt.Errorf("refusing to remove unexpected Store app directory: %s", targetAbs)
	}
	owned, _, err := readOwnedMarker(managedDir)
	if err != nil {
		return err
	}
	if !owned {
		return errors.New("refusing to remove a Store app directory without our ownership marker")
	}
	return os.RemoveAll(targetAbs)
}

func copyStoreCompanions(sourceAppsDir, targetAppsDir string) error {
	if err := os.MkdirAll(targetAppsDir, 0o755); err != nil {
		return err
	}
	entries, err := os.ReadDir(sourceAppsDir)
	if err != nil {
		return err
	}
	for _, entry := range entries {
		if entry.IsDir() || strings.EqualFold(entry.Name(), "xpui.spa") {
			continue
		}
		source := filepath.Join(sourceAppsDir, entry.Name())
		if strings.EqualFold(filepath.Ext(entry.Name()), ".spa") {
			target := filepath.Join(targetAppsDir, strings.TrimSuffix(entry.Name(), filepath.Ext(entry.Name())))
			if err := extractZip(source, target); err != nil {
				return fmt.Errorf("extract Store app companion %s: %w", entry.Name(), err)
			}
			continue
		}
		target := filepath.Join(targetAppsDir, entry.Name())
		if err := copyFile(source, target); err != nil {
			return fmt.Errorf("copy Store app companion %s: %w", entry.Name(), err)
		}
	}
	return nil
}

func within(root, target string) bool {
	relative, err := filepath.Rel(root, target)
	return err == nil && relative != ".." && !strings.HasPrefix(relative, ".."+string(os.PathSeparator)) && !filepath.IsAbs(relative)
}

func fileSHA256(path string) (string, error) {
	file, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer file.Close()
	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}
	return hex.EncodeToString(hash.Sum(nil)), nil
}

func verifySHA256(path, expected string) error {
	actual, err := fileSHA256(path)
	if err != nil {
		return err
	}
	if !strings.EqualFold(actual, expected) {
		return fmt.Errorf("SHA-256 mismatch: expected %s, got %s", expected, actual)
	}
	return nil
}

func copyFile(source, destination string) error {
	input, err := os.Open(source)
	if err != nil {
		return err
	}
	defer input.Close()
	if err := os.MkdirAll(filepath.Dir(destination), 0o755); err != nil {
		return err
	}
	output, err := os.OpenFile(destination, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0o600)
	if err != nil {
		return err
	}
	_, copyErr := io.Copy(output, input)
	closeErr := output.Close()
	if copyErr != nil {
		return copyErr
	}
	return closeErr
}
