<#
.SYNOPSIS
    JellyFlex 2.0 Autonomous 1-Click Installer & Runner Script for PowerShell.
#>

param(
    [switch]$BuildInstaller,
    [switch]$Launch
)

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "            JELLYFLEX 2.0 - 1-CLICK AUTONOMOUS SETUP" -ForegroundColor Cyan
Write-Host "  Open-Source Conversational AI Agent Suite (Agno OS + Antigravity)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verify Python
Write-Host "[*] Checking Python installation..." -ForegroundColor Yellow
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python was not found in PATH. Please install Python 3.11 or 3.12."
    exit 1
}
python --version

# 2. Verify Node.js
Write-Host "[*] Checking Node.js installation..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js was not found in PATH. Please install Node.js (LTS)."
    exit 1
}
node --version
npm --version

# 3. Setup Virtual Environment
Write-Host "`n[*] Setting up Python virtual environment (.venv)..." -ForegroundColor Yellow
if (-not (Test-Path ".venv\Scripts\python.exe")) {
    Write-Host "[*] Creating virtual environment..." -ForegroundColor Gray
    python -m venv .venv
}

# 4. Generate Brand & Mascot Assets
Write-Host "`n[*] Generating icon assets from official mascot..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File scripts\generate_assets.ps1

# 5. Build Frontend
Write-Host "`n[*] Building frontend application..." -ForegroundColor Yellow
Push-Location frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "[*] Installing frontend dependencies..." -ForegroundColor Gray
    npm install --silent
}
Write-Host "[*] Compiling Next.js production build..." -ForegroundColor Gray
npm run build
Pop-Location

# 6. Configure Electron
Write-Host "`n[*] Configuring Electron desktop runtime..." -ForegroundColor Yellow
Push-Location electron
if (-not (Test-Path "node_modules")) {
    Write-Host "[*] Installing Electron packages..." -ForegroundColor Gray
    npm install --silent
}

if ($BuildInstaller) {
    Write-Host "`n[*] Building Windows NSIS Installer (.exe)..." -ForegroundColor Green
    npm run dist
    Pop-Location
    Write-Host "`n[✓] Installer output saved in electron\dist\" -ForegroundColor Green
    exit 0
}

if ($Launch) {
    Write-Host "`n[*] Launching JellyFlex 2.0 Desktop..." -ForegroundColor Green
    npm start
    Pop-Location
    exit 0
}

Pop-Location

Write-Host "`n======================================================================" -ForegroundColor Green
Write-Host "        SETUP COMPLETE: JellyFlex 2.0 is Ready to Launch!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "To launch desktop app:  .\setup_installer.ps1 -Launch" -ForegroundColor White
Write-Host "To build .exe installer: .\setup_installer.ps1 -BuildInstaller" -ForegroundColor White
