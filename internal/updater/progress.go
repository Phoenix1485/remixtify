package updater

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"time"
)

// Progress reports measured bytes and completed installation steps, never estimated time.
type Progress struct {
	Stage      string `json:"stage"`
	Version    string `json:"version,omitempty"`
	Bytes      int64  `json:"bytes,omitempty"`
	TotalBytes int64  `json:"totalBytes,omitempty"`
	Step       int    `json:"step,omitempty"`
	Steps      int    `json:"steps,omitempty"`
	Message    string `json:"message,omitempty"`
	UpdatedAt  int64  `json:"updatedAt"`
}

func WriteJSON(path string, value any) error {
	raw, err := json.Marshal(value)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	file, err := os.CreateTemp(filepath.Dir(path), ".update-*.tmp")
	if err != nil {
		return err
	}
	defer os.Remove(file.Name())
	if _, err := file.Write(append(raw, '\n')); err != nil {
		file.Close()
		return err
	}
	if err := file.Close(); err != nil {
		return err
	}
	return os.Rename(file.Name(), path)
}

func ReportProgress(stateDir string, progress Progress) error {
	progress.UpdatedAt = time.Now().UnixMilli()
	return WriteJSON(filepath.Join(stateDir, "update-progress.json"), progress)
}

func ReadProgress(stateDir string) (Progress, error) {
	var progress Progress
	raw, err := os.ReadFile(filepath.Join(stateDir, "update-progress.json"))
	if errors.Is(err, os.ErrNotExist) {
		return progress, nil
	}
	if err != nil {
		return progress, err
	}
	err = json.Unmarshal(raw, &progress)
	return progress, err
}

type progressWriter struct {
	bytes, total int64
	last         time.Time
	report       func(int64, int64)
}

func (w *progressWriter) Write(data []byte) (int, error) {
	w.bytes += int64(len(data))
	if time.Since(w.last) >= 250*time.Millisecond {
		w.last = time.Now()
		w.report(w.bytes, w.total)
	}
	return len(data), nil
}
