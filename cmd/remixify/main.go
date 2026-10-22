package main

import (
	"bytes"
	"errors"
	"flag"
	"fmt"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"

	"remixify/internal/bundle"
	appconfig "remixify/internal/config"
	"remixify/internal/patcher"
	"remixify/internal/singleinstance"
	"remixify/internal/updater"
	"remixify/internal/windowcontrol"
)

var version = "dev"

func main() {
	if err := run(os.Args[1:]); err != nil {
		if errors.Is(err, errUpdateBusy) {
			return
		}
		if len(os.Args) > 1 && (os.Args[1] == "update-now" || os.Args[1] == "download-update" || os.Args[1] == "update") {
			if cfg, configErr := appconfig.Load(); configErr == nil {
				assets, _ := fs.Sub(bundle.Files, "dist")
				progress, _ := updater.ReadProgress(cfg.StateDir)
				progress.Stage = "error"
				progress.Message = err.Error()
				publishUpdateProgress(cfg, assets, progress)
				appendMaintenanceLog(cfg.StateDir, "update failed: "+err.Error())
			}
		}
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1)
	}
}

func run(arguments []string) error {
	if len(arguments) == 0 {
		usage()
		return nil
	}
	if arguments[0] == "install" {
		if err := appconfig.MigrateLegacyState(); err != nil {
			return err
		}
	}
	cfg, err := appconfig.Load()
	if err != nil {
		return err
	}
	assets, err := fs.Sub(bundle.Files, "dist")
	if err != nil {
		return err
	}

	switch arguments[0] {
	case "window-minimize", "window-maximize", "window-close":
		return windowcontrol.Run(strings.TrimPrefix(arguments[0], "window-"))
	case "install":
		flags := flag.NewFlagSet("install", flag.ContinueOnError)
		spotifyPath := flags.String("spotify", cfg.SpotifyPath, "Spotify installation directory")
		channel := flags.String("channel", cfg.ChannelURL, "GitHub Pages channel.json URL")
		autoDownload := cfg.AutoUpdate
		flags.BoolVar(&autoDownload, "auto-download", cfg.AutoUpdate, "automatically download published updates")
		flags.BoolVar(&autoDownload, "auto-update", cfg.AutoUpdate, "alias for --auto-download")
		if err := flags.Parse(arguments[1:]); err != nil {
			return err
		}
		cfg.SpotifyPath = strings.TrimSpace(*spotifyPath)
		cfg.ChannelURL = strings.TrimSpace(*channel)
		cfg.AutoUpdate = autoDownload
		if cfg.SpotifyPath == "" {
			cfg.SpotifyPath, err = appconfig.DetectSpotifyPath()
			if err != nil {
				return err
			}
		}
		if err := appconfig.ValidateSpotifyPath(cfg.SpotifyPath); err != nil {
			return err
		}
		if err := cfg.Save(); err != nil {
			return err
		}
		if err := installSelf(cfg); err != nil {
			return err
		}
		if err := manager(cfg, assets).Apply(); err != nil {
			_ = disableMaintenance(cfg.StateDir)
			return spotifyClosedHint(err)
		}
		if runtime.GOOS == "windows" {
			if appconfig.IsMicrosoftStorePath(cfg.SpotifyPath) {
				if err := os.Remove(storeSessionMarker(cfg.StateDir)); err != nil && !errors.Is(err, os.ErrNotExist) {
					return fmt.Errorf("clear previous Spotify Store session: %w", err)
				}
			}
			if err := startMaintenance(cfg.StateDir); err != nil {
				fmt.Fprintln(os.Stderr, "warning: background maintenance will start after the next Windows sign-in:", err)
			}
			if appconfig.IsMicrosoftStorePath(cfg.SpotifyPath) {
				launcher := filepath.Join(cfg.StateDir, "Remixify.cmd")
				if err := createStoreShortcut(cfg, launcher); err != nil {
					fmt.Fprintln(os.Stderr, "warning: could not create the Microsoft Store launch shortcut:", err)
				}
			}
		}
		fmt.Println("Remixify installed.")
		if cfg.AutoUpdate {
			fmt.Println("Automatic downloads are enabled; you will choose when to install each downloaded release.")
		} else {
			fmt.Println("Automatic downloads are disabled; a Download available button will appear for each release.")
		}
		if appconfig.IsMicrosoftStorePath(cfg.SpotifyPath) {
			fmt.Println("Microsoft Store mode is active. The original Spotify tile will be redirected to the customized app directory.")
		} else {
			fmt.Println("You can keep launching Spotify from its original app icon or Start menu entry.")
		}
		return nil

	case "apply":
		if err := ensureSpotifyPath(&cfg); err != nil {
			return err
		}
		if err := manager(cfg, assets).Apply(); err != nil {
			return spotifyClosedHint(err)
		}
		fmt.Println("Spotify UI patch applied.")
		return nil

	case "restore":
		if err := disableMaintenance(cfg.StateDir); err != nil {
			return err
		}
		if err := ensureSpotifyPath(&cfg); err != nil {
			return err
		}
		if err := manager(cfg, assets).Restore(); err != nil {
			return spotifyClosedHint(err)
		}
		if appconfig.IsMicrosoftStorePath(cfg.SpotifyPath) {
			fmt.Println("Writable Microsoft Store app directory removed and automatic redirection disabled. The signed Spotify package was never modified.")
		} else {
			fmt.Println("Original Spotify UI restored from the verified backup and automatic maintenance disabled.")
		}
		return nil

	case "uninstall":
		if err := disableMaintenance(cfg.StateDir); err != nil {
			return err
		}
		if err := ensureSpotifyPath(&cfg); err != nil {
			return err
		}
		if err := restoreIfApplied(manager(cfg, assets)); err != nil {
			return spotifyClosedHint(err)
		}
		if runtime.GOOS == "windows" {
			if desktop, desktopErr := windowsDesktopPath(); desktopErr == nil {
				for _, name := range []string{"Remixify.lnk", "Remixtify.lnk", "Spotify Redesign.lnk"} {
					shortcut := filepath.Join(desktop, name)
					if filepath.Base(shortcut) == name {
						_ = os.Remove(shortcut)
					}
				}
			}
		}
		fmt.Println("Remixify removed from Spotify. Backups and CLI versions were kept for recovery.")
		return nil

	case "deactivate":
		if err := ensureSpotifyPath(&cfg); err != nil {
			return err
		}
		wasRunning, runningErr := spotifyRunning()
		if runningErr != nil {
			return runningErr
		}
		if wasRunning {
			if err := stopSpotify(); err != nil {
				return err
			}
		}
		if err := disableMaintenance(cfg.StateDir); err != nil {
			return err
		}
		if err := restoreIfApplied(manager(cfg, assets)); err != nil {
			if wasRunning {
				_ = launchStockSpotify(cfg)
			}
			return err
		}
		if wasRunning {
			return launchStockSpotify(cfg)
		}
		return nil

	case "watch":
		flags := flag.NewFlagSet("watch", flag.ContinueOnError)
		skipUpdate := flags.Bool("skip-update", false, "skip the initial automatic CLI update check")
		once := flags.Bool("once", false, "run one maintenance pass and exit")
		if err := flags.Parse(arguments[1:]); err != nil {
			return err
		}
		if err := ensureSpotifyPath(&cfg); err != nil {
			return err
		}
		return watchMaintenance(cfg, assets, *skipUpdate, *once)

	case "status":
		if err := ensureSpotifyPath(&cfg); err != nil {
			return err
		}
		status, err := manager(cfg, assets).Status()
		if err != nil {
			return err
		}
		mode := "direct"
		if appconfig.IsMicrosoftStorePath(cfg.SpotifyPath) {
			mode = "microsoft-store"
		}
		fmt.Printf("version: %s\nmode: %s\nautomatic downloads: %t\nspotify: %s\napplied: %t\nspotify archive present: %t\nmanaged xpui directory: %t\n",
			version, mode, cfg.AutoUpdate, cfg.SpotifyPath, status.Applied, status.SpotifyArchive, status.ManagedDirectory)
		return nil

	case "configure":
		flags := flag.NewFlagSet("configure", flag.ContinueOnError)
		spotifyPath := flags.String("spotify", cfg.SpotifyPath, "Spotify installation directory")
		channel := flags.String("channel", cfg.ChannelURL, "GitHub Pages channel.json URL")
		autoDownload := cfg.AutoUpdate
		flags.BoolVar(&autoDownload, "auto-download", cfg.AutoUpdate, "automatically download published updates")
		flags.BoolVar(&autoDownload, "auto-update", cfg.AutoUpdate, "alias for --auto-download")
		if err := flags.Parse(arguments[1:]); err != nil {
			return err
		}
		cfg.SpotifyPath = strings.TrimSpace(*spotifyPath)
		cfg.ChannelURL = strings.TrimSpace(*channel)
		cfg.AutoUpdate = autoDownload
		if cfg.SpotifyPath != "" {
			if err := appconfig.ValidateSpotifyPath(cfg.SpotifyPath); err != nil {
				return err
			}
		}
		if err := cfg.Save(); err != nil {
			return err
		}
		fmt.Println("Configuration saved.")
		if runtime.GOOS == "windows" {
			if err := enableUpdateProtocol(cfg.StateDir, ""); err != nil {
				return err
			}
		}
		return nil

	case "update":
		path, err := checkUpdate(cfg, assets, version)
		if err != nil {
			return err
		}
		if path == "" {
			fmt.Println("No update is available.")
		} else {
			if err := manager(cfg, assets).SyncUpdateStatus(); err != nil {
				return err
			}
			fmt.Println("Update downloaded and ready to install:", path)
		}
		return nil

	case "download-update":
		if err := ensureSpotifyPath(&cfg); err != nil {
			return err
		}
		path, err := checkUpdate(cfg, assets, version)
		if err != nil {
			return err
		}
		if path == "" {
			fmt.Println("You are up to date.")
			return nil
		}
		if err := manager(cfg, assets).SyncUpdateStatus(); err != nil {
			return err
		}
		fmt.Println("Update downloaded and ready to install.")
		return nil

	case "update-now":
		flags := flag.NewFlagSet("update-now", flag.ContinueOnError)
		skipUpdate := flags.Bool("skip-update", false, "apply the already downloaded CLI version")
		if err := flags.Parse(arguments[1:]); err != nil {
			return err
		}
		if err := ensureSpotifyPath(&cfg); err != nil {
			return err
		}
		if !*skipUpdate {
			pending, pendingErr := updater.Pending(cfg.StateDir)
			if pendingErr != nil {
				return pendingErr
			}
			if pending.Path == "" {
				return errors.New("the update has not finished downloading")
			}
			publishUpdateProgress(cfg, assets, updater.Progress{Stage: "starting", Version: pending.Version, Step: 1, Steps: 4, Message: "Starting the verified installer"})
			return exec.Command(pending.Path, "update-now", "--skip-update").Start()
		}
		executable, executableErr := os.Executable()
		if executableErr != nil {
			return executableErr
		}
		release, acquired, lockErr := acquireUpdate(cfg.StateDir)
		if lockErr != nil {
			return lockErr
		}
		if !acquired {
			return errUpdateBusy
		}
		defer release()
		publishUpdateProgress(cfg, assets, updater.Progress{Stage: "stopping", Version: version, Step: 1, Steps: 4, Message: "Closing Spotify"})
		wasRunning, runningErr := spotifyRunning()
		if runningErr != nil {
			return runningErr
		}
		if wasRunning {
			if err := stopSpotify(); err != nil {
				return err
			}
		}
		publishUpdateProgress(cfg, assets, updater.Progress{Stage: "installing", Version: version, Step: 2, Steps: 4, Message: "Installing the new interface"})
		if err := manager(cfg, assets).Apply(); err != nil {
			return err
		}
		publishUpdateProgress(cfg, assets, updater.Progress{Stage: "installing", Version: version, Step: 3, Steps: 4, Message: "Updating launchers and repairing the update link"})
		if err := installSelf(cfg); err != nil {
			return err
		}
		if err := updater.Activate(cfg.StateDir, executable); err != nil {
			return err
		}
		if err := updater.ClearPending(cfg.StateDir); err != nil {
			fmt.Fprintln(os.Stderr, "warning: could not clear the pending update:", err)
		}
		if err := manager(cfg, assets).SyncUpdateStatus(); err != nil {
			fmt.Fprintln(os.Stderr, "warning: could not refresh the update status:", err)
		}
		if wasRunning {
			publishUpdateProgress(cfg, assets, updater.Progress{Stage: "restarting", Version: version, Step: 4, Steps: 4, Message: "Reopening Spotify"})
			if err := launchSpotify(cfg); err != nil {
				return err
			}
		}
		publishUpdateProgress(cfg, assets, updater.Progress{Stage: "complete", Version: version, Step: 4, Steps: 4, Message: "Update installed successfully"})
		if runtime.GOOS == "windows" {
			_ = startMaintenance(cfg.StateDir)
		}
		return nil

	case "launch":
		flags := flag.NewFlagSet("launch", flag.ContinueOnError)
		skipUpdate := flags.Bool("skip-update", false, "skip one automatic CLI update check")
		if err := flags.Parse(arguments[1:]); err != nil {
			return err
		}
		if err := ensureSpotifyPath(&cfg); err != nil {
			return err
		}
		if cfg.AutoUpdate && !*skipUpdate {
			updatedPath, updateErr := checkUpdate(cfg, assets, version)
			if updateErr != nil {
				fmt.Fprintln(os.Stderr, "warning: automatic update download failed:", updateErr)
			} else if updatedPath != "" {
				if syncErr := manager(cfg, assets).SyncUpdateStatus(); syncErr != nil {
					fmt.Fprintln(os.Stderr, "warning: could not publish the downloaded update status:", syncErr)
				}
			}
		}
		if err := manager(cfg, assets).Apply(); err != nil {
			return spotifyClosedHint(err)
		}
		return launchSpotify(cfg)

	case "version", "--version", "-v":
		fmt.Println(version)
		return nil
	case "help", "--help", "-h":
		usage()
		return nil
	default:
		usage()
		return fmt.Errorf("unknown command %q", arguments[0])
	}
}

func manager(cfg appconfig.Config, assets fs.FS) patcher.Manager {
	return patcher.Manager{
		SpotifyPath: cfg.SpotifyPath,
		StateDir:    cfg.StateDir,
		ChannelURL:  cfg.ChannelURL,
		Assets:      assets,
		StoreMode:   appconfig.IsMicrosoftStorePath(cfg.SpotifyPath),
		AutoUpdate:  cfg.AutoUpdate,
	}
}

func ensureSpotifyPath(cfg *appconfig.Config) error {
	if cfg.SpotifyPath != "" {
		if err := appconfig.ValidateSpotifyPath(cfg.SpotifyPath); err == nil {
			return nil
		}
	}
	detected, err := appconfig.DetectSpotifyPath()
	if err != nil {
		return err
	}
	cfg.SpotifyPath = detected
	return cfg.Save()
}

func restoreIfApplied(patchManager patcher.Manager) error {
	status, err := patchManager.Status()
	if err != nil {
		return err
	}
	if !status.ManagedDirectory {
		return nil
	}
	return patchManager.Restore()
}

func installSelf(cfg appconfig.Config) error {
	executable, err := os.Executable()
	if err != nil {
		return err
	}
	installedVersion := version
	if installedVersion == "dev" {
		installedVersion = "development"
	}
	versionDir := filepath.Join(cfg.StateDir, "versions", installedVersion)
	if err := os.MkdirAll(versionDir, 0o755); err != nil {
		return err
	}
	name := "remixify"
	if runtime.GOOS == "windows" {
		name += ".exe"
	}
	target := filepath.Join(versionDir, name)
	if !samePath(executable, target) {
		if err := copyExecutable(executable, target); err != nil {
			return err
		}
	}
	if err := os.WriteFile(filepath.Join(cfg.StateDir, "current.txt"), []byte(installedVersion+"\n"), 0o600); err != nil {
		return err
	}
	if runtime.GOOS == "windows" {
		launcher := filepath.Join(cfg.StateDir, "Remixify.cmd")
		content := "@echo off\r\nsetlocal\r\nset /p REMIXIFY_VERSION=<\"%~dp0current.txt\"\r\nif \"%~1\"==\"\" (\r\n  \"%~dp0versions\\%REMIXIFY_VERSION%\\remixify.exe\" launch\r\n) else (\r\n  \"%~dp0versions\\%REMIXIFY_VERSION%\\remixify.exe\" %*\r\n)\r\n"
		if err := os.WriteFile(launcher, []byte(content), 0o700); err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(cfg.StateDir, "remixify.cmd"), []byte(content), 0o700); err != nil {
			return err
		}
		// Existing desktop shortcuts use this script, including pre-rename installs.
		// Repair it before removing the old launcher filenames during an update.
		escapedLauncher := strings.ReplaceAll(launcher, `"`, `""`)
		launchVBS := "Set shell = CreateObject(\"WScript.Shell\")\r\nshell.Run Chr(34) & \"" + escapedLauncher + "\" & Chr(34) & \" launch\", 0, False\r\n"
		if err := os.WriteFile(filepath.Join(cfg.StateDir, "launch.vbs"), []byte(launchVBS), 0o700); err != nil {
			return err
		}
		for _, legacyName := range []string{"Remixtify.cmd", "remixtify.cmd", "Spotify Redesign.cmd", "spotify-redesign.cmd"} {
			if err := os.Remove(filepath.Join(cfg.StateDir, legacyName)); err != nil && !errors.Is(err, os.ErrNotExist) {
				return err
			}
		}
		if err := enableMaintenance(cfg.StateDir, launcher); err != nil {
			fmt.Fprintln(os.Stderr, "warning: could not enable background maintenance:", err)
		}
		if err := enableUpdateProtocol(cfg.StateDir, launcher); err != nil {
			fmt.Fprintln(os.Stderr, "warning: could not enable the in-app update action:", err)
		}
	}
	return nil
}

func enableMaintenance(stateDir, launcher string) error {
	disabledMarker := filepath.Join(stateDir, "maintenance.disabled")
	if err := os.Remove(disabledMarker); err != nil && !errors.Is(err, os.ErrNotExist) {
		return err
	}
	vbsPath := filepath.Join(stateDir, "maintenance.vbs")
	escapedLauncher := strings.ReplaceAll(launcher, `"`, `""`)
	vbs := "Set shell = CreateObject(\"WScript.Shell\")\r\nshell.Run Chr(34) & \"" + escapedLauncher + "\" & Chr(34) & \" watch\", 0, False\r\n"
	if err := os.WriteFile(vbsPath, []byte(vbs), 0o700); err != nil {
		return err
	}
	runValue := `wscript.exe "` + vbsPath + `"`
	command := exec.Command("reg.exe", "add", `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`, "/v", "RemixifyMaintenance", "/t", "REG_SZ", "/d", runValue, "/f")
	if output, err := command.CombinedOutput(); err != nil {
		return fmt.Errorf("register maintenance startup: %w: %s", err, strings.TrimSpace(string(output)))
	}
	_ = exec.Command("reg.exe", "delete", `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`, "/v", "SpotifyRedesignMaintenance", "/f").Run()
	_ = exec.Command("reg.exe", "delete", `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`, "/v", "RemixtifyMaintenance", "/f").Run()
	return nil
}

func startMaintenance(stateDir string) error {
	vbsPath := filepath.Join(stateDir, "maintenance.vbs")
	if _, err := os.Stat(vbsPath); err != nil {
		return err
	}
	return exec.Command("wscript.exe", vbsPath).Start()
}

func enableUpdateProtocol(stateDir, launcher string) error {
	protocolVBS := filepath.Join(stateDir, "protocol.vbs")
	vbs := updateProtocolScript(stateDir)
	if err := os.WriteFile(protocolVBS, []byte(vbs), 0o700); err != nil {
		return err
	}
	commands := [][]string{}
	for _, protocol := range []struct {
		key         string
		description string
	}{
		{`HKCU\Software\Classes\remixify`, "URL:Remixify"},
		{`HKCU\Software\Classes\remixtify`, "URL:Remixify compatibility action"},
		// Keep the former protocol registered so installed legacy bundles remain reversible.
		{`HKCU\Software\Classes\spotify-redesign`, "URL:Remixify compatibility action"},
	} {
		commands = append(commands,
			[]string{"add", protocol.key, "/ve", "/d", protocol.description, "/f"},
			[]string{"add", protocol.key, "/v", "URL Protocol", "/d", "", "/f"},
			[]string{"add", protocol.key + `\shell\open\command`, "/ve", "/d", `wscript.exe "` + protocolVBS + `" "%1"`, "/f"},
		)
	}
	for _, arguments := range commands {
		if output, err := exec.Command("reg.exe", arguments...).CombinedOutput(); err != nil {
			return fmt.Errorf("register update protocol: %w: %s", err, strings.TrimSpace(string(output)))
		}
	}
	return nil
}

func createStoreShortcut(cfg appconfig.Config, launcher string) error {
	desktop, err := windowsDesktopPath()
	if err != nil {
		return err
	}
	launchVBS := filepath.Join(cfg.StateDir, "launch.vbs")
	escapedLauncher := strings.ReplaceAll(launcher, `"`, `""`)
	vbs := "Set shell = CreateObject(\"WScript.Shell\")\r\nshell.Run Chr(34) & \"" + escapedLauncher + "\" & Chr(34) & \" launch\", 0, False\r\n"
	if err := os.WriteFile(launchVBS, []byte(vbs), 0o700); err != nil {
		return err
	}

	powershell, err := exec.LookPath("powershell.exe")
	if err != nil {
		return err
	}
	shortcutPath := filepath.Join(desktop, "Remixify.lnk")
	wscriptPath := filepath.Join(os.Getenv("WINDIR"), "System32", "wscript.exe")
	iconPath := filepath.Join(cfg.SpotifyPath, "Spotify.exe")
	script := `$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($env:REMIXIFY_SHORTCUT_PATH)
$shortcut.TargetPath = $env:REMIXIFY_WSCRIPT_PATH
$shortcut.Arguments = '"' + $env:REMIXIFY_LAUNCH_VBS + '"'
$shortcut.WorkingDirectory = $env:REMIXIFY_STATE_PATH
$shortcut.IconLocation = $env:REMIXIFY_ICON_PATH + ',0'
$shortcut.Description = 'Launch Spotify with Remixify'
$shortcut.Save()`
	command := exec.Command(powershell, "-NoProfile", "-NonInteractive", "-Command", script)
	command.Env = append(os.Environ(),
		"REMIXIFY_SHORTCUT_PATH="+shortcutPath,
		"REMIXIFY_WSCRIPT_PATH="+wscriptPath,
		"REMIXIFY_LAUNCH_VBS="+launchVBS,
		"REMIXIFY_STATE_PATH="+cfg.StateDir,
		"REMIXIFY_ICON_PATH="+iconPath,
	)
	if output, err := command.CombinedOutput(); err != nil {
		return fmt.Errorf("create desktop shortcut: %w: %s", err, strings.TrimSpace(string(output)))
	}
	for _, legacyName := range []string{"Remixtify.lnk", "Spotify Redesign.lnk"} {
		legacyShortcut := filepath.Join(desktop, legacyName)
		if !strings.EqualFold(legacyShortcut, shortcutPath) {
			_ = os.Remove(legacyShortcut)
		}
	}
	return nil
}

func windowsDesktopPath() (string, error) {
	powershell, err := exec.LookPath("powershell.exe")
	if err != nil {
		return "", err
	}
	output, err := exec.Command(powershell, "-NoProfile", "-NonInteractive", "-Command", `[Environment]::GetFolderPath('Desktop')`).Output()
	if err != nil {
		return "", err
	}
	desktop := strings.TrimSpace(string(output))
	if desktop == "" {
		return "", errors.New("Windows desktop directory was not found")
	}
	return desktop, nil
}

func disableMaintenance(stateDir string) error {
	if err := os.MkdirAll(stateDir, 0o755); err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(stateDir, "maintenance.disabled"), []byte("disabled\n"), 0o600); err != nil {
		return err
	}
	if runtime.GOOS != "windows" {
		return nil
	}
	key := `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`
	for _, valueName := range []string{"RemixifyMaintenance", "RemixtifyMaintenance", "SpotifyRedesignMaintenance"} {
		if err := exec.Command("reg.exe", "query", key, "/v", valueName).Run(); err == nil {
			command := exec.Command("reg.exe", "delete", key, "/v", valueName, "/f")
			output, deleteErr := command.CombinedOutput()
			if deleteErr != nil {
				return fmt.Errorf("remove maintenance startup: %w: %s", deleteErr, strings.TrimSpace(string(output)))
			}
		}
	}
	for _, protocolKey := range []string{`HKCU\Software\Classes\remixify`, `HKCU\Software\Classes\remixtify`, `HKCU\Software\Classes\spotify-redesign`} {
		if err := exec.Command("reg.exe", "query", protocolKey).Run(); err == nil {
			if protocolOutput, protocolErr := exec.Command("reg.exe", "delete", protocolKey, "/f").CombinedOutput(); protocolErr != nil {
				return fmt.Errorf("remove update protocol: %w: %s", protocolErr, strings.TrimSpace(string(protocolOutput)))
			}
		}
	}
	return nil
}

func copyExecutable(source, destination string) error {
	input, err := os.Open(source)
	if err != nil {
		return err
	}
	defer input.Close()
	output, err := os.OpenFile(destination, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0o755)
	if err != nil {
		return err
	}
	_, copyErr := output.ReadFrom(input)
	closeErr := output.Close()
	if copyErr != nil {
		return copyErr
	}
	return closeErr
}

func samePath(left, right string) bool {
	leftAbs, leftErr := filepath.Abs(left)
	rightAbs, rightErr := filepath.Abs(right)
	return leftErr == nil && rightErr == nil && strings.EqualFold(leftAbs, rightAbs)
}

func launchSpotify(cfg appconfig.Config) error {
	var command *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		if appconfig.IsMicrosoftStorePath(cfg.SpotifyPath) {
			if err := markCustomStoreSession(cfg.StateDir); err != nil {
				return err
			}
			spotifyAlias := filepath.Join(os.Getenv("LOCALAPPDATA"), "Microsoft", "WindowsApps", "Spotify.exe")
			arguments := []string{"--app-directory=" + filepath.Join(cfg.StateDir, "AppX")}
			rawPort := strings.TrimSpace(os.Getenv("REMIXIFY_DEBUG_PORT"))
			debugVariable := "REMIXIFY_DEBUG_PORT"
			if rawPort == "" {
				rawPort = strings.TrimSpace(os.Getenv("REMIXTIFY_DEBUG_PORT"))
				debugVariable = "REMIXTIFY_DEBUG_PORT"
			}
			if rawPort == "" {
				rawPort = strings.TrimSpace(os.Getenv("SPOTIFY_REDESIGN_DEBUG_PORT"))
				debugVariable = "SPOTIFY_REDESIGN_DEBUG_PORT"
			}
			if rawPort != "" {
				port, parseErr := strconv.Atoi(rawPort)
				if parseErr != nil || port < 1 || port > 65535 {
					return fmt.Errorf("invalid %s: %q", debugVariable, rawPort)
				}
				arguments = append(arguments, "--remote-debugging-port="+rawPort)
			}
			command = exec.Command(spotifyAlias, arguments...)
		} else {
			command = exec.Command(filepath.Join(cfg.SpotifyPath, "Spotify.exe"))
		}
	case "darwin":
		command = exec.Command("open", "-a", "/Applications/Spotify.app")
	default:
		command = exec.Command(filepath.Join(cfg.SpotifyPath, "spotify"))
	}
	if err := command.Start(); err != nil {
		if appconfig.IsMicrosoftStorePath(cfg.SpotifyPath) {
			_ = os.Remove(storeSessionMarker(cfg.StateDir))
		}
		return err
	}
	return nil
}

func launchStockSpotify(cfg appconfig.Config) error {
	var command *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		if appconfig.IsMicrosoftStorePath(cfg.SpotifyPath) {
			spotifyAlias := filepath.Join(os.Getenv("LOCALAPPDATA"), "Microsoft", "WindowsApps", "Spotify.exe")
			command = exec.Command(spotifyAlias)
		} else {
			command = exec.Command(filepath.Join(cfg.SpotifyPath, "Spotify.exe"))
		}
	case "darwin":
		command = exec.Command("open", "-a", "/Applications/Spotify.app")
	default:
		command = exec.Command(filepath.Join(cfg.SpotifyPath, "spotify"))
	}
	return command.Start()
}

func watchMaintenance(cfg appconfig.Config, assets fs.FS, skipUpdate, once bool) error {
	release, acquired, err := singleinstance.Acquire("RemixifyMaintenance")
	if err != nil {
		return err
	}
	if !acquired {
		return nil
	}
	// Hand the watcher to the newly installed executable after releasing its mutex.
	restartWatcher := false
	defer func() {
		release()
		if restartWatcher {
			_ = startMaintenance(cfg.StateDir)
		}
	}()
	if runtime.GOOS == "windows" {
		if err := enableUpdateProtocol(cfg.StateDir, ""); err != nil {
			appendMaintenanceLog(cfg.StateDir, "repair update link failed: "+err.Error())
		}
	}

	disabledMarker := filepath.Join(cfg.StateDir, "maintenance.disabled")
	if _, err := os.Stat(disabledMarker); err == nil {
		return nil
	}
	patchManager := manager(cfg, assets)
	closeBridge, bridgeErr := startDesktopBridge(cfg, assets)
	if bridgeErr != nil {
		appendMaintenanceLog(cfg.StateDir, "desktop bridge failed: "+bridgeErr.Error())
	} else {
		defer closeBridge()
	}
	nextStorePathRefresh := time.Now()
	downloadUpdate := func() {
		previous, _ := updater.Pending(cfg.StateDir)
		installedVersion := version
		if raw, readErr := os.ReadFile(filepath.Join(cfg.StateDir, "current.txt")); readErr == nil {
			if current := strings.TrimSpace(string(raw)); current != "" && current != "development" {
				installedVersion = current
			}
		}
		updatedPath, updateErr := checkUpdate(cfg, assets, installedVersion)
		if updateErr != nil {
			appendMaintenanceLog(cfg.StateDir, "update download failed: "+updateErr.Error())
			return
		}
		if updatedPath == "" {
			return
		}
		if syncErr := patchManager.SyncUpdateStatus(); syncErr != nil {
			appendMaintenanceLog(cfg.StateDir, "publish downloaded update status failed: "+syncErr.Error())
			return
		}
		if !samePath(previous.Path, updatedPath) {
			appendMaintenanceLog(cfg.StateDir, "update downloaded and waiting for user confirmation")
		}
	}
	maintenancePass := func() {
		releaseUpdate, acquiredUpdate, updateLockErr := acquireUpdate(cfg.StateDir)
		if updateLockErr != nil || !acquiredUpdate {
			return
		}
		defer releaseUpdate()
		if _, err := os.Stat(disabledMarker); err == nil {
			return
		}
		running, processErr := spotifyRunning()
		if processErr != nil || running {
			return
		}
		if appconfig.IsMicrosoftStorePath(cfg.SpotifyPath) && !time.Now().Before(nextStorePathRefresh) {
			nextStorePathRefresh = time.Now().Add(time.Minute)
			if detected, detectErr := appconfig.DetectSpotifyPath(); detectErr == nil && !samePath(detected, cfg.SpotifyPath) {
				cfg.SpotifyPath = detected
				if saveErr := cfg.Save(); saveErr != nil {
					appendMaintenanceLog(cfg.StateDir, "save updated Spotify Store path failed: "+saveErr.Error())
				} else {
					patchManager = manager(cfg, assets)
				}
			}
		}
		status, statusErr := patchManager.Status()
		if statusErr == nil && status.SpotifyArchive && !status.Applied {
			if applyErr := patchManager.Apply(); applyErr != nil {
				appendMaintenanceLog(cfg.StateDir, "apply failed: "+applyErr.Error())
			}
		}
	}

	maintenancePass()
	if once {
		return nil
	}

	if cfg.AutoUpdate && !skipUpdate {
		downloadUpdate()
	}

	maintenanceTicker := time.NewTicker(10 * time.Second)
	defer maintenanceTicker.Stop()
	var storeLaunchTicker *time.Ticker
	var storeLaunchEvents <-chan time.Time
	if appconfig.IsMicrosoftStorePath(cfg.SpotifyPath) {
		storeLaunchTicker = time.NewTicker(500 * time.Millisecond)
		storeLaunchEvents = storeLaunchTicker.C
		defer storeLaunchTicker.Stop()
		if running, runningErr := spotifyRunning(); runningErr == nil && !running {
			_ = os.Remove(storeSessionMarker(cfg.StateDir))
		}
	}
	nextUpdate := time.Now().Add(time.Minute)
	for {
		if raw, readErr := os.ReadFile(filepath.Join(cfg.StateDir, "current.txt")); readErr == nil {
			current := strings.TrimSpace(string(raw))
			if current != "" && current != "development" && current != version {
				restartWatcher = true
				return nil
			}
		}
		select {
		case <-storeLaunchEvents:
			if _, err := os.Stat(disabledMarker); err == nil {
				return nil
			}
			if err := redirectStoreLaunch(&cfg, assets); err != nil {
				appendMaintenanceLog(cfg.StateDir, "redirect Store launch failed: "+err.Error())
			}
		case <-maintenanceTicker.C:
			if _, err := os.Stat(disabledMarker); err == nil {
				return nil
			}
			maintenancePass()
			if !cfg.AutoUpdate {
				continue
			}
			if time.Now().Before(nextUpdate) {
				continue
			}
			nextUpdate = time.Now().Add(time.Minute)
			downloadUpdate()
		}
	}
}

func redirectStoreLaunch(cfg *appconfig.Config, assets fs.FS) error {
	running, err := spotifyRunning()
	if err != nil {
		return err
	}
	marker := storeSessionMarker(cfg.StateDir)
	if !running {
		if err := os.Remove(marker); err != nil && !errors.Is(err, os.ErrNotExist) {
			return err
		}
		return nil
	}
	if _, err := os.Stat(marker); err == nil {
		return nil
	}

	if err := stopSpotify(); err != nil {
		return fmt.Errorf("stop stock Spotify: %w", err)
	}
	if detected, detectErr := appconfig.DetectSpotifyPath(); detectErr == nil {
		cfg.SpotifyPath = detected
		if saveErr := cfg.Save(); saveErr != nil {
			return saveErr
		}
	}
	if err := manager(*cfg, assets).Apply(); err != nil {
		return err
	}
	if err := launchSpotify(*cfg); err != nil {
		return err
	}
	appendMaintenanceLog(cfg.StateDir, "redirected original Microsoft Store launch to customized app directory")
	return nil
}

func storeSessionMarker(stateDir string) string {
	return filepath.Join(stateDir, "store-session.active")
}

func markCustomStoreSession(stateDir string) error {
	if err := os.MkdirAll(stateDir, 0o755); err != nil {
		return err
	}
	return os.WriteFile(storeSessionMarker(stateDir), []byte(time.Now().UTC().Format(time.RFC3339Nano)+"\n"), 0o600)
}

func spotifyRunning() (bool, error) {
	switch runtime.GOOS {
	case "windows":
		output, err := exec.Command("tasklist.exe", "/FI", "IMAGENAME eq Spotify.exe", "/FO", "CSV", "/NH").CombinedOutput()
		if err != nil {
			return false, err
		}
		return bytes.Contains(bytes.ToLower(output), []byte(`"spotify.exe"`)), nil
	default:
		err := exec.Command("pgrep", "-x", "spotify").Run()
		if err == nil {
			return true, nil
		}
		if exitError, ok := err.(*exec.ExitError); ok && exitError.ExitCode() == 1 {
			return false, nil
		}
		return false, err
	}
}

func stopSpotify() error {
	if runtime.GOOS == "windows" {
		output, err := exec.Command("taskkill.exe", "/F", "/T", "/IM", "Spotify.exe").CombinedOutput()
		if err != nil {
			return fmt.Errorf("taskkill Spotify.exe: %w: %s", err, strings.TrimSpace(string(output)))
		}
		return nil
	}
	output, err := exec.Command("pkill", "-x", "spotify").CombinedOutput()
	if err != nil {
		return fmt.Errorf("stop spotify: %w: %s", err, strings.TrimSpace(string(output)))
	}
	return nil
}

func appendMaintenanceLog(stateDir, message string) {
	file, err := os.OpenFile(filepath.Join(stateDir, "maintenance.log"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o600)
	if err != nil {
		return
	}
	defer file.Close()
	_, _ = fmt.Fprintf(file, "%s %s\n", time.Now().UTC().Format(time.RFC3339), message)
}

func spotifyClosedHint(err error) error {
	return fmt.Errorf("%w (make sure Spotify is completely closed, including its tray process)", err)
}

func usage() {
	fmt.Println(`Remixify - independent Spotify desktop UI patcher

Usage:
  remixify install [--spotify PATH] [--channel URL] [--auto-download=true|false]
  remixify launch
  remixify watch [--once]
  remixify apply
  remixify restore
  remixify deactivate
  remixify uninstall
  remixify status
  remixify update
  remixify configure [--spotify PATH] [--channel URL] [--auto-download=true|false]
  remixify version`)
}
