# StormSafe Layout Builder — one-shot setup script for a fresh Windows machine.
#
# Usage:
#   1. Open PowerShell on the new machine
#   2. Paste this entire file's contents, or run:
#        irm https://raw.githubusercontent.com/stormsafe365/2Dlayout-confirmation/main/setup-new-machine.ps1 | iex
#
# What it does:
#   - Installs Git for Windows + Node.js LTS if missing (winget)
#   - Clones (or updates) the repo at ~/Desktop/layout-builder
#   - Runs `npm install`
#   - Prints instructions to start the dev server

$ErrorActionPreference = 'Stop'

function Ensure($cmd, $wingetId, $label) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Write-Host "==> Installing $label ..." -ForegroundColor Cyan
    winget install --id $wingetId --silent --accept-package-agreements --accept-source-agreements
  } else {
    Write-Host "==> $label is already installed" -ForegroundColor Green
  }
}

# 1. Prereqs
Ensure 'git'  'Git.Git'           'Git for Windows'
Ensure 'node' 'OpenJS.NodeJS.LTS' 'Node.js (LTS)'

# 2. Refresh PATH so newly-installed tools work in this same window
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')

# 3. Clone (or update) the repo on the Desktop
$target = Join-Path $env:USERPROFILE 'Desktop\layout-builder'
if (Test-Path $target) {
  Write-Host "==> Updating existing copy..." -ForegroundColor Cyan
  Set-Location $target
  git pull
} else {
  Write-Host "==> Cloning repo to $target ..." -ForegroundColor Cyan
  git clone https://github.com/stormsafe365/2Dlayout-confirmation.git $target
  Set-Location $target
}

# 4. Install dependencies
Write-Host "==> Installing project dependencies (1-2 min)..." -ForegroundColor Cyan
npm install

# 5. Done
Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host "  Setup complete!"                          -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Project folder:  $target"
Write-Host "  Start the app:   " -NoNewline; Write-Host "npm run dev"            -ForegroundColor Cyan
Write-Host "  Open in browser: " -NoNewline; Write-Host "http://localhost:5173"  -ForegroundColor Cyan
Write-Host "  Open in Claude Code: drag the layout-builder folder onto Claude Code"
Write-Host ""
