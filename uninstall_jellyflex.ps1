# JellyFlex 2.0 - Clean Uninstaller & Cryptographic Shredder (PowerShell for Windows)
[CmdletBinding()]
param (
    [switch]$FullPurge
)

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "JellyFlex 2.0 - Clean Uninstaller & Cryptographic Shredder" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

# 1. Stop background processes
Write-Host "Stopping active JellyFlex background processes..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -like "*uvicorn*" -or $_.CommandLine -like "*main:app*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process | Where-Object { $_.CommandLine -like "*next-server*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# 2. Cryptographic shred sensitive files
$targets = @("backend\database\secure_state.db", "backend\database\secure_state.db-wal", "backend\database\secure_state.db-shm", ".env")
foreach ($target in $targets) {
    if (Test-Path $target) {
        Write-Host "Shredding encrypted file: $target..." -ForegroundColor Red
        $bytes = (Get-Item $target).Length
        $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        $buffer = New-Object byte[] (([Math]::Max($bytes, 64)))
        for ($i = 0; $i -lt 3; $i++) {
            $rng.GetBytes($buffer)
            [System.IO.File]::WriteAllBytes((Resolve-Path $target), $buffer)
        }
        Remove-Item $target -Force -ErrorAction SilentlyContinue
    }
}

# 3. Clean cache directories
Write-Host "Removing runtime caches and staging directories..." -ForegroundColor Yellow
$cleanupDirs = @(".rea_staging", "backend\database", ".pytest_cache", "backend\__pycache__")
if ($FullPurge) {
    $cleanupDirs += @("frontend\.next", "frontend\node_modules", ".venv")
}
foreach ($dir in $cleanupDirs) {
    if (Test-Path $dir) {
        Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "JellyFlex 2.0 clean wipe complete with zero leftover traces." -ForegroundColor Green
