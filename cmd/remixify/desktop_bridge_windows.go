//go:build windows

package main

import (
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"

	appconfig "remixify/internal/config"
	"remixify/internal/desktopbridge"
	"remixify/internal/updater"
	"remixify/internal/windowcontrol"
)

func startDesktopBridge(cfg appconfig.Config, assets fs.FS) (func(), error) {
	server, err := desktopbridge.Start(func(action string) error {
		if strings.HasPrefix(action, "window-") {
			return windowcontrol.Run(strings.TrimPrefix(action, "window-"))
		}
		executable, err := os.Executable()
		if err != nil {
			return err
		}
		command := exec.Command(executable, action)
		command.SysProcAttr = &syscall.SysProcAttr{HideWindow: true, CreationFlags: 0x08000000}
		if err := command.Start(); err != nil {
			return err
		}
		go func() { _ = command.Wait() }()
		return nil
	})
	if err != nil {
		return nil, err
	}
	if err := updater.WriteJSON(filepath.Join(cfg.StateDir, "desktop-control.json"), server.Descriptor); err != nil {
		server.Close()
		return nil, err
	}
	if err := manager(cfg, assets).SyncUpdateStatus(); err != nil {
		server.Close()
		return nil, err
	}
	return func() { _ = server.Close() }, nil
}
