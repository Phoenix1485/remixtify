[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$stateDirectory = [System.IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'Remixify'))
$formerStateDirectory = [System.IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'Remixtify'))
$legacyStateDirectory = [System.IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'SpotifyRedesign'))
$expectedStateDirectory = [System.IO.Path]::GetFullPath("$env:LOCALAPPDATA\Remixify")
$expectedFormerStateDirectory = [System.IO.Path]::GetFullPath("$env:LOCALAPPDATA\Remixtify")
$expectedLegacyStateDirectory = [System.IO.Path]::GetFullPath("$env:LOCALAPPDATA\SpotifyRedesign")

if (-not $stateDirectory.Equals($expectedStateDirectory, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to uninstall from an unexpected directory: $stateDirectory"
}
if (-not $formerStateDirectory.Equals($expectedFormerStateDirectory, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to inspect an unexpected former directory: $formerStateDirectory"
}
if (-not $legacyStateDirectory.Equals($expectedLegacyStateDirectory, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to inspect an unexpected legacy directory: $legacyStateDirectory"
}

$installedStateDirectory = if (Test-Path -LiteralPath $stateDirectory) { $stateDirectory } elseif (Test-Path -LiteralPath $formerStateDirectory) { $formerStateDirectory } elseif (Test-Path -LiteralPath $legacyStateDirectory) { $legacyStateDirectory } else { $stateDirectory }

function Write-Step {
    param([string]$Message)
    Write-Host $Message -NoNewline
}

function Write-Success {
    Write-Host ' > OK' -ForegroundColor Green
}

$spotifyProcesses = Get-Process -Name Spotify -ErrorAction SilentlyContinue
if ($spotifyProcesses) {
    Write-Step 'Closing Spotify...'
    $spotifyProcesses | Stop-Process -Force
    $spotifyProcesses | Wait-Process -Timeout 10 -ErrorAction SilentlyContinue
    Write-Success
}

$maintenanceProcesses = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
    Where-Object {
        $_.Name -in @('remixify.exe', 'remixtify.exe', 'spotify-redesign.exe') -and
        $_.ExecutablePath -and
        ($_.ExecutablePath.StartsWith($stateDirectory, [StringComparison]::OrdinalIgnoreCase) -or
         $_.ExecutablePath.StartsWith($formerStateDirectory, [StringComparison]::OrdinalIgnoreCase) -or
         $_.ExecutablePath.StartsWith($legacyStateDirectory, [StringComparison]::OrdinalIgnoreCase)) -and
        $_.CommandLine -match '(?i)(?:^|\s)watch(?:\s|$)'
    }
if ($maintenanceProcesses) {
    Write-Step 'Stopping background maintenance...'
    $maintenanceProcesses | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop }
    Write-Success
}

if (Test-Path -LiteralPath $installedStateDirectory) {
    $currentFile = Join-Path $installedStateDirectory 'current.txt'
    if (-not (Test-Path -LiteralPath $currentFile)) {
        throw "The installed version marker is missing: $currentFile"
    }
    $currentVersion = (Get-Content -LiteralPath $currentFile -Raw).Trim()
    $versionsDirectory = [System.IO.Path]::GetFullPath((Join-Path $installedStateDirectory 'versions'))
    $installedExecutable = [System.IO.Path]::GetFullPath((Join-Path $versionsDirectory "$currentVersion\remixify.exe"))
    if (-not (Test-Path -LiteralPath $installedExecutable -PathType Leaf)) {
        $installedExecutable = [System.IO.Path]::GetFullPath((Join-Path $versionsDirectory "$currentVersion\remixtify.exe"))
    }
    if (-not (Test-Path -LiteralPath $installedExecutable -PathType Leaf)) {
        $installedExecutable = [System.IO.Path]::GetFullPath((Join-Path $versionsDirectory "$currentVersion\spotify-redesign.exe"))
    }
    if (-not $installedExecutable.StartsWith("$versionsDirectory\", [StringComparison]::OrdinalIgnoreCase)) {
        throw 'The installed version marker contains an unsafe path.'
    }
    if (-not (Test-Path -LiteralPath $installedExecutable -PathType Leaf)) {
        throw "The installed uninstaller executable is missing: $installedExecutable"
    }

    Write-Step 'Restoring Spotify...'
    & $installedExecutable uninstall
    if ($LASTEXITCODE -ne 0) {
        throw "Remixify could not restore Spotify (exit code $LASTEXITCODE). No files were removed."
    }
    Write-Success
}

Write-Step 'Removing launch integrations...'
$runKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
foreach ($runValue in @('RemixifyMaintenance', 'RemixtifyMaintenance', 'SpotifyRedesignMaintenance')) {
    if (Get-ItemProperty -LiteralPath $runKey -Name $runValue -ErrorAction SilentlyContinue) {
        Remove-ItemProperty -LiteralPath $runKey -Name $runValue -Force
    }
}
foreach ($protocolKey in @(
    'Registry::HKEY_CURRENT_USER\Software\Classes\remixify',
    'Registry::HKEY_CURRENT_USER\Software\Classes\remixtify',
    'Registry::HKEY_CURRENT_USER\Software\Classes\spotify-redesign'
)) {
    if (Test-Path -LiteralPath $protocolKey) {
        Remove-Item -LiteralPath $protocolKey -Recurse -Force
    }
}
foreach ($shortcutName in @('Remixify.lnk', 'Remixtify.lnk', 'Spotify Redesign.lnk')) {
    $desktopShortcut = Join-Path ([Environment]::GetFolderPath('Desktop')) $shortcutName
    if (Test-Path -LiteralPath $desktopShortcut) {
        Remove-Item -LiteralPath $desktopShortcut -Force
    }
}
Write-Success

Write-Step 'Removing Remixify from PATH...'
$userPath = [Environment]::GetEnvironmentVariable('Path', [EnvironmentVariableTarget]::User)
$filteredPath = @($userPath -split ';' | Where-Object {
    if (-not $_) { return $false }
    try {
        $candidate = [System.IO.Path]::GetFullPath($_).TrimEnd('\')
        -not $candidate.Equals($stateDirectory.TrimEnd('\'), [StringComparison]::OrdinalIgnoreCase) -and
        -not $candidate.Equals($formerStateDirectory.TrimEnd('\'), [StringComparison]::OrdinalIgnoreCase) -and
        -not $candidate.Equals($legacyStateDirectory.TrimEnd('\'), [StringComparison]::OrdinalIgnoreCase)
    }
    catch {
        $true
    }
})
[Environment]::SetEnvironmentVariable('Path', ($filteredPath -join ';'), [EnvironmentVariableTarget]::User)
Write-Success

foreach ($directory in @($stateDirectory, $formerStateDirectory, $legacyStateDirectory)) {
    if (Test-Path -LiteralPath $directory) {
        Write-Step "Removing installed files, settings, and backups from $directory..."
        Remove-Item -LiteralPath $directory -Recurse -Force
        Write-Success
    }
}

Write-Host ''
Write-Host 'Remixify was completely uninstalled.' -ForegroundColor Green
Write-Host 'Spotify itself was not removed. Open Spotify normally to use its original interface.'
