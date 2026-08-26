[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$')]
    [string]$Repo,

    [string]$ChannelUrl,

    [string]$SpotifyPath
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

if (-not $ChannelUrl) {
    $parts = $Repo.Split('/', 2)
    $ChannelUrl = "https://$($parts[0]).github.io/$($parts[1])/channel.json"
}

$release = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$Repo/releases/tags/continuous" `
    -Headers @{ 'User-Agent' = 'Remixify-Installer' }
$asset = $release.assets | Where-Object { $_.name -eq 'remixify-windows-amd64.exe' } | Select-Object -First 1
if (-not $asset) {
    throw 'The continuous release does not contain remixify-windows-amd64.exe.'
}

$temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("remixify-install-" + [Guid]::NewGuid().ToString('N'))
$temporaryExe = Join-Path $temporaryRoot 'remixify.exe'
New-Item -ItemType Directory -Path $temporaryRoot | Out-Null
$stateDirectory = Join-Path $env:LOCALAPPDATA 'Remixify'
$formerStateDirectory = Join-Path $env:LOCALAPPDATA 'Remixtify'
$legacyStateDirectory = Join-Path $env:LOCALAPPDATA 'SpotifyRedesign'

try {
    Write-Host 'Downloading Remixify...' -ForegroundColor Cyan
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $temporaryExe -UseBasicParsing

    $spotifyProcesses = Get-Process -Name Spotify -ErrorAction SilentlyContinue
    if ($spotifyProcesses) {
        $spotifyProcesses | Stop-Process -Force
        $spotifyProcesses | Wait-Process -Timeout 10 -ErrorAction SilentlyContinue
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
    $maintenanceProcesses | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop }

    $arguments = @('install', '--channel', $ChannelUrl)
    if ($SpotifyPath) {
        $arguments += @('--spotify', $SpotifyPath)
    }
    & $temporaryExe $arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Remixify exited with code $LASTEXITCODE."
    }
}
finally {
    if (Test-Path -LiteralPath $temporaryRoot) {
        Remove-Item -LiteralPath $temporaryRoot -Recurse -Force
    }
}
