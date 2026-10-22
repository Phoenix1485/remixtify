package updater

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"testing"
)

func TestDownloadRequiresExplicitActivation(t *testing.T) {
	binary := []byte("verified update")
	digest := sha256.Sum256(binary)
	sha := hex.EncodeToString(digest[:])

	var server *httptest.Server
	server = httptest.NewServer(http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		switch request.URL.Path {
		case "/channel.json":
			_ = json.NewEncoder(response).Encode(map[string]any{
				"cli": map[string]any{
					"version": "new-version",
					"downloads": map[string]any{
						runtime.GOOS + "-" + runtime.GOARCH: map[string]string{
							"url":    server.URL + "/remixify",
							"sha256": sha,
						},
					},
				},
			})
		case "/remixify":
			_, _ = response.Write(binary)
		default:
			http.NotFound(response, request)
		}
	}))
	defer server.Close()

	stateDir := t.TempDir()
	path, err := Check(server.URL+"/channel.json", "old-version", stateDir)
	if err != nil {
		t.Fatal(err)
	}
	if path == "" {
		t.Fatal("expected a downloaded update")
	}
	if _, err := os.Stat(filepath.Join(stateDir, "current.txt")); !os.IsNotExist(err) {
		t.Fatal("downloading must not activate the update")
	}
	pending, err := Pending(stateDir)
	if err != nil {
		t.Fatal(err)
	}
	if pending.Version != "new-version" || pending.Path != path {
		t.Fatalf("unexpected pending update: %#v", pending)
	}

	if err := Activate(stateDir, path); err != nil {
		t.Fatal(err)
	}
	current, err := os.ReadFile(filepath.Join(stateDir, "current.txt"))
	if err != nil {
		t.Fatal(err)
	}
	if string(current) != "new-version\n" {
		t.Fatalf("unexpected current version: %q", current)
	}
	if err := ClearPending(stateDir); err != nil {
		t.Fatal(err)
	}
	if pending, err := Pending(stateDir); err != nil || pending.Path != "" {
		t.Fatalf("pending update was not cleared: %#v, %v", pending, err)
	}
}

func TestDownloadProgressAndFailure(t *testing.T) {
	for _, failure := range []string{"", "checksum", "truncated"} {
		t.Run("download-"+failure, func(t *testing.T) {
			binary := []byte("verified update bytes")
			digest := sha256.Sum256(binary)
			sha := hex.EncodeToString(digest[:])
			if failure == "checksum" {
				sha = "invalid"
			}
			var server *httptest.Server
			server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.URL.Path == "/binary" {
					length := len(binary)
					if failure == "truncated" {
						length++
					}
					w.Header().Set("Content-Length", strconv.Itoa(length))
					_, _ = w.Write(binary)
					return
				}
				_ = json.NewEncoder(w).Encode(map[string]any{"cli": map[string]any{
					"version": "next", "downloads": map[string]any{runtime.GOOS + "-" + runtime.GOARCH: map[string]string{"url": server.URL + "/binary", "sha256": sha}},
				}})
			}))
			defer server.Close()
			state := t.TempDir()
			var events []Progress
			path, err := CheckWithProgress(server.URL, "old", state, func() {
				p, readErr := ReadProgress(state)
				if readErr != nil {
					t.Fatal(readErr)
				}
				events = append(events, p)
				if p.Stage == "downloading" || p.Stage == "verifying" {
					pending, _ := Pending(state)
					if pending.Path != "" {
						t.Fatal("unverified download marked ready")
					}
				}
			})
			last := events[len(events)-1]
			if failure != "" {
				if err == nil || path != "" || last.Stage != "error" || last.Message == "" {
					t.Fatalf("failure not reported: %v, %#v", err, last)
				}
				pending, _ := Pending(state)
				if pending.Path != "" {
					t.Fatal("failed update must not be installable")
				}
				matches, _ := filepath.Glob(filepath.Join(state, "versions", "*", "*.download"))
				if len(matches) != 0 {
					t.Fatal("failed download was not cleaned up")
				}
				return
			}
			if err != nil || path == "" || last.Stage != "ready" {
				t.Fatalf("download failed: %v, %#v", err, last)
			}
			if last.Bytes != int64(len(binary)) || last.TotalBytes != int64(len(binary)) || last.UpdatedAt == 0 {
				t.Fatalf("incorrect measured progress: %#v", last)
			}
		})
	}
}
