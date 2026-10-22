//go:build !windows

package main

import (
	"io/fs"
	appconfig "remixify/internal/config"
)

func startDesktopBridge(appconfig.Config, fs.FS) (func(), error) { return func() {}, nil }
