package main

import (
	"context"
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/go-sql-driver/mysql"

	"remixify/internal/changelogapi"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	dsn, err := databaseDSN()
	if err != nil {
		logger.Error("database configuration is invalid", "error", err)
		os.Exit(1)
	}

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		logger.Error("database configuration failed", "error", err)
		os.Exit(1)
	}
	defer db.Close()
	db.SetMaxOpenConns(12)
	db.SetMaxIdleConns(6)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(90 * time.Second)

	startup, cancelStartup := context.WithTimeout(context.Background(), 45*time.Second)
	defer cancelStartup()
	if err = waitForDatabase(startup, db); err != nil {
		logger.Error("database did not become ready", "error", err)
		os.Exit(1)
	}
	if err = changelogapi.Migrate(startup, db); err != nil {
		logger.Error("database migration failed", "error", err)
		os.Exit(1)
	}

	api := changelogapi.New(db, logger)
	server := &http.Server{
		Addr:              ":8080",
		Handler:           api.Handler(),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       8 * time.Second,
		WriteTimeout:      12 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    16 << 10,
	}

	shutdownContext, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	go func() {
		logger.Info("changelog API listening", "address", server.Addr)
		if serveErr := server.ListenAndServe(); serveErr != nil && !errors.Is(serveErr, http.ErrServerClosed) {
			logger.Error("HTTP server failed", "error", serveErr)
			os.Exit(1)
		}
	}()

	<-shutdownContext.Done()
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err = server.Shutdown(ctx); err != nil {
		logger.Error("graceful shutdown failed", "error", err)
	}
}

func databaseDSN() (string, error) {
	required := func(name string) (string, error) {
		value := os.Getenv(name)
		if value == "" {
			return "", errors.New(name + " is required")
		}
		return value, nil
	}
	host, err := required("DB_HOST")
	if err != nil {
		return "", err
	}
	name, err := required("DB_NAME")
	if err != nil {
		return "", err
	}
	user, err := required("DB_USER")
	if err != nil {
		return "", err
	}
	password, err := required("DB_PASSWORD")
	if err != nil {
		return "", err
	}
	port := 3306
	if raw := os.Getenv("DB_PORT"); raw != "" {
		port, err = strconv.Atoi(raw)
		if err != nil || port < 1 || port > 65535 {
			return "", errors.New("DB_PORT must be a valid TCP port")
		}
	}
	config := mysql.NewConfig()
	config.User = user
	config.Passwd = password
	config.Net = "tcp"
	config.Addr = host + ":" + strconv.Itoa(port)
	config.DBName = name
	config.ParseTime = true
	config.Collation = "utf8mb4_unicode_ci"
	config.Timeout = 5 * time.Second
	config.ReadTimeout = 5 * time.Second
	config.WriteTimeout = 5 * time.Second
	config.Params = map[string]string{"charset": "utf8mb4", "time_zone": "'+00:00'"}
	return config.FormatDSN(), nil
}

func waitForDatabase(ctx context.Context, db *sql.DB) error {
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()
	for {
		if err := db.PingContext(ctx); err == nil {
			return nil
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
		}
	}
}
