//go:build windows

package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"testing"
	"time"
)

// The copied test executable acts as an updater, exercising the real WScript
// handoff without launching Spotify or touching the user's installation.
func TestMain(m *testing.M) {
	if output := os.Getenv("REMIXIFY_PROTOCOL_TEST_OUTPUT"); output != "" && len(os.Args) == 2 && os.Args[1] == "download-update" {
		if err := os.WriteFile(output, []byte(os.Args[1]), 0o600); err != nil {
			os.Exit(2)
		}
		os.Exit(0)
	}
	os.Exit(m.Run())
}

func TestWindowsProtocolDispatch(t *testing.T) {
	for _, mode := range []string{"lf", "crlf", "legacy"} {
		t.Run(mode, func(t *testing.T) {
			state := t.TempDir()
			versionDir := filepath.Join(state, "versions", "test-version")
			if err := os.MkdirAll(versionDir, 0o755); err != nil {
				t.Fatal(err)
			}
			name := "remixify.exe"
			if mode == "legacy" {
				name = "spotify-redesign.exe"
			}
			self, err := os.Executable()
			if err != nil {
				t.Fatal(err)
			}
			if err := copyExecutable(self, filepath.Join(versionDir, name)); err != nil {
				t.Fatal(err)
			}
			ending := "\n"
			if mode == "crlf" {
				ending = "\r\n"
			}
			if err := os.WriteFile(filepath.Join(state, "current.txt"), []byte("test-version"+ending), 0o600); err != nil {
				t.Fatal(err)
			}
			script := filepath.Join(state, "protocol.vbs")
			if err := os.WriteFile(script, []byte(updateProtocolScript(state)), 0o600); err != nil {
				t.Fatal(err)
			}
			output := filepath.Join(state, "dispatched.txt")
			command := exec.Command("cscript.exe", "//Nologo", script, "remixify://download-update")
			command.Env = append(os.Environ(), "REMIXIFY_PROTOCOL_TEST_OUTPUT="+output)
			if raw, err := command.CombinedOutput(); err != nil {
				t.Fatalf("WScript failed: %v: %s", err, raw)
			}
			deadline := time.Now().Add(5 * time.Second)
			for time.Now().Before(deadline) {
				if raw, err := os.ReadFile(output); err == nil && string(raw) == "download-update" {
					return
				}
				time.Sleep(20 * time.Millisecond)
			}
			t.Fatal("Windows did not dispatch to the selected updater executable")
		})
	}
}
