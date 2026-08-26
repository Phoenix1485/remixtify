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
