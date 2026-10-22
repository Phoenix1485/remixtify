package desktopbridge

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"net"
	"net/http"
	"strings"
	"time"
)

const Origin = "https://xpui.app.spotify.com"

type Descriptor struct {
	URL   string `json:"url"`
	Token string `json:"token"`
}

type Server struct {
	Descriptor
	http *http.Server
}

func Start(action func(string) error) (*Server, error) {
	listener, err := net.Listen("tcp4", "127.0.0.1:0")
	if err != nil {
		return nil, err
	}
	random := make([]byte, 32)
	if _, err := rand.Read(random); err != nil {
		listener.Close()
		return nil, err
	}
	server := &Server{Descriptor: Descriptor{URL: "http://" + listener.Addr().String(), Token: hex.EncodeToString(random)}}
	server.http = &http.Server{Handler: server.handler(action), ReadHeaderTimeout: 3 * time.Second, ReadTimeout: 5 * time.Second, WriteTimeout: 10 * time.Second, IdleTimeout: 20 * time.Second, MaxHeaderBytes: 4096}
	go func() { _ = server.http.Serve(listener) }()
	return server, nil
}

func (s *Server) Close() error { return s.http.Close() }

func (s *Server) handler(action func(string) error) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-store")
		// A random per-process capability and an exact origin check protect the
		// loopback endpoint. Arbitrary sites cannot operate the Spotify window.
		if r.Header.Get("Origin") != Origin {
			http.Error(w, "origin denied", http.StatusForbidden)
			return
		}
		w.Header().Set("Access-Control-Allow-Origin", Origin)
		w.Header().Set("Vary", "Origin")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Remixify-Token")
		w.Header().Set("Access-Control-Allow-Private-Network", "true")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		if subtle.ConstantTimeCompare([]byte(r.Header.Get("X-Remixify-Token")), []byte(s.Token)) != 1 {
			http.Error(w, "invalid capability", http.StatusForbidden)
			return
		}
		if r.URL.Path == "/status" && r.Method == http.MethodGet {
			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(`{"ready":true}`))
			return
		}
		if r.URL.Path != "/action" || r.Method != http.MethodPost {
			http.NotFound(w, r)
			return
		}
		var request struct {
			Action string `json:"action"`
		}
		decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1024))
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&request); err != nil {
			http.Error(w, "invalid action", http.StatusBadRequest)
			return
		}
		switch request.Action {
		case "window-minimize", "window-maximize", "window-close", "download-update", "update-now", "deactivate":
		default:
			http.Error(w, "unsupported action", http.StatusBadRequest)
			return
		}
		if err := action(request.Action); err != nil {
			http.Error(w, strings.TrimSpace(err.Error()), http.StatusServiceUnavailable)
			return
		}
		w.WriteHeader(http.StatusAccepted)
	})
}
