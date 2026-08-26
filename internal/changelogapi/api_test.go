package changelogapi

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestPaginationBounds(t *testing.T) {
	tests := []struct {
		query      string
		wantLimit  int
		wantOffset int
		wantError  bool
	}{
		{"", 20, 0, false},
		{"?limit=50&offset=100", 50, 100, false},
		{"?limit=0", 0, 0, true},
		{"?limit=51", 0, 0, true},
		{"?offset=-1", 0, 0, true},
		{"?offset=10001", 0, 0, true},
	}
	for _, test := range tests {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/changelogs"+test.query, nil)
		limit, offset, err := pagination(req)
		if (err != nil) != test.wantError {
			t.Fatalf("query %q error = %v", test.query, err)
		}
		if err == nil && (limit != test.wantLimit || offset != test.wantOffset) {
			t.Fatalf("query %q got (%d,%d), want (%d,%d)", test.query, limit, offset, test.wantLimit, test.wantOffset)
		}
	}
}

func TestInvalidSlugIsRejectedBeforeDatabaseAccess(t *testing.T) {
	api := New(nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/changelogs/not%20valid", nil)
	req.SetPathValue("slug", "not valid")
	response := httptest.NewRecorder()
	api.Handler().ServeHTTP(response, req)
	if response.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusBadRequest)
	}
	if got := response.Header().Get("X-Content-Type-Options"); got != "nosniff" {
		t.Fatalf("X-Content-Type-Options = %q", got)
	}
}

func TestHealthDoesNotLeakDatabaseErrors(t *testing.T) {
	api := New(nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	response := httptest.NewRecorder()
	api.Handler().ServeHTTP(response, req)
	if response.Code != http.StatusServiceUnavailable {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusServiceUnavailable)
	}
	body := strings.ToLower(response.Body.String())
	for _, token := range []string{"password", "dsn", "sql:", "connection refused"} {
		if strings.Contains(body, token) {
			t.Fatalf("health response leaked %q: %s", token, body)
		}
	}
}
