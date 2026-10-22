package desktopbridge

import (
	"net/http"
	"strings"
	"testing"
)

func TestOnlySpotifyWithCapabilityCanDispatch(t *testing.T) {
	called := make(chan string, 2)
	server, err := Start(func(action string) error { called <- action; return nil })
	if err != nil {
		t.Fatal(err)
	}
	defer server.Close()
	for _, test := range []struct {
		origin, token, body string
		status              int
	}{
		{"https://example.com", server.Token, `{"action":"window-close"}`, http.StatusForbidden},
		{Origin, "wrong", `{"action":"window-close"}`, http.StatusForbidden},
		{Origin, server.Token, `{"action":"arbitrary-command"}`, http.StatusBadRequest},
		{Origin, server.Token, `{"action":"window-maximize"}`, http.StatusAccepted},
	} {
		request, _ := http.NewRequest(http.MethodPost, server.URL+"/action", strings.NewReader(test.body))
		request.Header.Set("Origin", test.origin)
		request.Header.Set("X-Remixify-Token", test.token)
		response, err := http.DefaultClient.Do(request)
		if err != nil {
			t.Fatal(err)
		}
		response.Body.Close()
		if response.StatusCode != test.status {
			t.Fatalf("unexpected HTTP status %d for %s", response.StatusCode, test.body)
		}
	}
	if len(called) != 1 || <-called != "window-maximize" {
		t.Fatal("unauthorized or unknown command dispatched")
	}
}

func TestPrivateNetworkPreflightAndRestart(t *testing.T) {
	first, err := Start(func(string) error { return nil })
	if err != nil {
		t.Fatal(err)
	}
	defer first.Close()
	second, err := Start(func(string) error { return nil })
	if err != nil {
		t.Fatal(err)
	}
	defer second.Close()
	if first.Token == second.Token || !strings.HasPrefix(second.URL, "http://127.0.0.1:") {
		t.Fatal("bridge must use a fresh capability on loopback")
	}
	request, _ := http.NewRequest(http.MethodOptions, first.URL+"/action", nil)
	request.Header.Set("Origin", Origin)
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusNoContent || response.Header.Get("Access-Control-Allow-Private-Network") != "true" || response.Header.Get("Access-Control-Allow-Origin") != Origin {
		t.Fatal("Spotify's browser cannot complete the private-network preflight")
	}
}
