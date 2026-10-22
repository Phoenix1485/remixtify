package main

import (
	"crypto/sha256"
	"errors"
	"fmt"
	"io/fs"
	"strings"

	appconfig "remixify/internal/config"
	"remixify/internal/singleinstance"
	"remixify/internal/updater"
)

var errUpdateBusy = errors.New("another update operation is already running")

func acquireUpdate(stateDir string) (func(), bool, error) {
	digest := sha256.Sum256([]byte(strings.ToLower(stateDir)))
	return singleinstance.Acquire(fmt.Sprintf("RemixifyUpdate-%x", digest[:8]))
}

func checkUpdate(cfg appconfig.Config, assets fs.FS, installedVersion string) (string, error) {
	release, acquired, err := acquireUpdate(cfg.StateDir)
	if err != nil {
		return "", err
	}
	if !acquired {
		return "", errUpdateBusy
	}
	defer release()
	return updater.CheckWithProgress(cfg.ChannelURL, installedVersion, cfg.StateDir, func() {
		if err := manager(cfg, assets).SyncUpdateStatus(); err != nil {
			appendMaintenanceLog(cfg.StateDir, "publish update progress failed: "+err.Error())
		}
	})
}

func publishUpdateProgress(cfg appconfig.Config, assets fs.FS, progress updater.Progress) {
	if err := updater.ReportProgress(cfg.StateDir, progress); err != nil {
		appendMaintenanceLog(cfg.StateDir, "save update progress failed: "+err.Error())
	}
	if err := manager(cfg, assets).SyncUpdateStatus(); err != nil {
		appendMaintenanceLog(cfg.StateDir, "publish update progress failed: "+err.Error())
	}
}

// Execute the selected executable directly: WScript.Run silently swallowed failures
// from older .cmd launchers, leaving the web UI stuck at "Starting update".
func updateProtocolScript(stateDir string) string {
	state := strings.ReplaceAll(stateDir, `"`, `""`)
	var cases strings.Builder
	for _, action := range []string{"update-now", "download-update", "deactivate"} {
		fmt.Fprintf(&cases, "Case \"remixify://%s\", \"remixtify://%s\", \"spotify-redesign://%s\": action = \"%s\"\r\n", action, action, action, action)
	}
	return "Option Explicit\r\nDim shell, files, current, exe, uri, action\r\n" +
		"If WScript.Arguments.Count <> 1 Then WScript.Quit 1\r\n" +
		"uri = LCase(WScript.Arguments(0))\r\nIf Right(uri, 1) = \"/\" Then uri = Left(uri, Len(uri)-1)\r\n" +
		"Select Case uri\r\n" + cases.String() + "Case Else: WScript.Quit 1\r\nEnd Select\r\n" +
		"Set shell = CreateObject(\"WScript.Shell\")\r\nSet files = CreateObject(\"Scripting.FileSystemObject\")\r\n" +
		"current = Trim(files.OpenTextFile(\"" + state + "\\current.txt\").ReadAll)\r\n" +
		"exe = \"" + state + "\\versions\\\" & current & \"\\remixify.exe\"\r\n" +
		"If Not files.FileExists(exe) Then exe = \"" + state + "\\versions\\\" & current & \"\\spotify-redesign.exe\"\r\n" +
		"shell.Run Chr(34) & exe & Chr(34) & \" \" & action, 0, False\r\n"
}
