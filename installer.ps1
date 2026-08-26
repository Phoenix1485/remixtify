[CmdletBinding()]
param(
    [ValidatePattern('^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$')]
    [string]$Repo,

    [string]$ChannelUrl,

    [Alias('AutoUpdate')]
    [ValidateSet('y', 'n')]
    [string]$AutoDownload
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Write-Step {
    param([string]$Message)
    Write-Host $Message -NoNewline
}

function Write-Success {
    Write-Host ' > OK' -ForegroundColor Green
}

if ($PSVersionTable.PSVersion -lt [version]'5.1') {
    throw "PowerShell 5.1 or newer is required. Current version: $($PSVersionTable.PSVersion)"
}

$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if ($principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning 'Run this installer as your normal Windows user. Administrator mode creates files for the wrong profile.'
}

$temporaryRoot = $null
$localExecutable = Join-Path $PSScriptRoot 'build\remixify.exe'
$executable = $localExecutable
$stateDirectory = Join-Path $env:LOCALAPPDATA 'Remixify'
$formerStateDirectory = Join-Path $env:LOCALAPPDATA 'Remixtify'
$legacyStateDirectory = Join-Path $env:LOCALAPPDATA 'SpotifyRedesign'

if (-not $AutoDownload) {
    $AutoDownload = (Read-Host 'Automatically download updates in the background? (y/n)').Trim().ToLowerInvariant()
    if ($AutoDownload -notin @('y', 'n')) {
        throw 'Please answer with exactly y or n.'
    }
}
$autoDownloadEnabled = $AutoDownload -eq 'y'

try {
    if ($Repo) {
        if (-not $ChannelUrl) {
            $parts = $Repo.Split('/', 2)
            $ChannelUrl = "https://$($parts[0]).github.io/$($parts[1])/channel.json"
        }

        Write-Step 'Fetching the latest Remixify release...'
        $release = Invoke-RestMethod `
            -Uri "https://api.github.com/repos/$Repo/releases/tags/continuous" `
            -Headers @{ 'User-Agent' = 'Remixify-Installer' }
        $asset = $release.assets | Where-Object { $_.name -eq 'remixify-windows-amd64.exe' } | Select-Object -First 1
        if (-not $asset) {
            throw 'The continuous release does not contain remixify-windows-amd64.exe.'
        }
        Write-Success

        $temporaryRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("remixify-install-" + [Guid]::NewGuid().ToString('N'))
        New-Item -ItemType Directory -Path $temporaryRoot | Out-Null
        $executable = Join-Path $temporaryRoot 'remixify.exe'
        Write-Step 'Downloading Remixify...'
        Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $executable -UseBasicParsing
        Write-Success

        Write-Step 'Verifying the downloaded executable...'
        $channel = Invoke-RestMethod -Uri $ChannelUrl -Headers @{ 'User-Agent' = 'Remixify-Installer' }
        $expectedHash = $channel.cli.downloads.'windows-amd64'.sha256
        if (-not $expectedHash) {
            throw 'The update channel does not contain a Windows AMD64 SHA-256 hash.'
        }
        $actualHash = (Get-FileHash -LiteralPath $executable -Algorithm SHA256).Hash
        if ($actualHash -ne $expectedHash) {
            throw "Downloaded executable failed SHA-256 verification. Expected $expectedHash, received $actualHash."
        }
        Write-Success
    }
    elseif (-not (Test-Path -LiteralPath $localExecutable)) {
        throw 'No local build was found. Pass -Repo "OWNER/REPOSITORY" to install the latest GitHub release.'
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
        Write-Step 'Restarting background maintenance...'
        $maintenanceProcesses | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop }
        Write-Success
    }

    Write-Step 'Installing Remixify...'
    $arguments = @('install', "--auto-download=$($autoDownloadEnabled.ToString().ToLowerInvariant())")
    if ($ChannelUrl) {
        $arguments += @('--channel', $ChannelUrl)
    }
    & $executable $arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Remixify exited with code $LASTEXITCODE."
    }
    Write-Success

    $userPath = [Environment]::GetEnvironmentVariable('Path', [EnvironmentVariableTarget]::User)
    $pathEntries = @($userPath -split ';' | Where-Object {
        if (-not $_) { return $false }
        try {
            $candidate = [System.IO.Path]::GetFullPath($_).TrimEnd('\')
            -not $candidate.Equals([System.IO.Path]::GetFullPath($formerStateDirectory).TrimEnd('\'), [StringComparison]::OrdinalIgnoreCase) -and
            -not $candidate.Equals([System.IO.Path]::GetFullPath($legacyStateDirectory).TrimEnd('\'), [StringComparison]::OrdinalIgnoreCase)
        }
        catch {
            $true
        }
    })
    if ($pathEntries -notcontains $stateDirectory) {
        [Environment]::SetEnvironmentVariable('Path', (($pathEntries + $stateDirectory) -join ';'), [EnvironmentVariableTarget]::User)
    }
    if (($env:Path -split ';') -notcontains $stateDirectory) {
        $env:Path = "$env:Path;$stateDirectory"
    }

    Write-Host ''
    Write-Host 'Remixify is installed.' -ForegroundColor Green
    Write-Host 'Open Spotify normally. Microsoft Store launches are automatically redirected to the customized UI.'
    Write-Host 'You can also run: remixify launch'
}
finally {
    if ($temporaryRoot -and (Test-Path -LiteralPath $temporaryRoot)) {
        Remove-Item -LiteralPath $temporaryRoot -Recurse -Force
    }
}
