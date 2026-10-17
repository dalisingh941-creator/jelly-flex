@echo off
setlocal enabledelayedexpansion
title JellyFlex 2.0 Autonomous Installer and Setup

echo ======================================================================
echo             JELLYFLEX 2.0 - 1-CLICK AUTONOMOUS SETUP
echo   Open-Source Conversational AI Agent Suite (Agno OS + Antigravity)
echo ======================================================================
echo.

:: 1. Verify Python
echo [*] Checking Python installation...
where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] Python was not found in PATH. Please install Python 3.11 or 3.12.
    pause
    exit /b 1
)
python --version

:: 2. Verify Node.js and NPM
echo [*] Checking Node.js installation...
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] Node.js was not found in PATH. Please install Node.js (LTS).
    pause
    exit /b 1
)
node --version
npm --version

:: 3. Setup Python Virtual Environment
echo.
echo [*] Setting up Python virtual environment (.venv)...
if not exist ".venv\Scripts\python.exe" (
    echo [*] Creating virtual environment...
    python -m venv .venv
)

echo [*] Installing backend dependencies...
.venv\Scripts\python.exe -m pip install -r backend\requirements.txt --quiet
if %ERRORLEVEL% neq 0 (
    echo [!] Pip install encountered issues, continuing setup...
)

:: 4. Generate Brand & Mascot Assets
echo.
echo [*] Generating icon assets from official mascot...
powershell -ExecutionPolicy Bypass -File scripts\generate_assets.ps1

:: 5. Install Frontend Dependencies & Build
echo.
echo [*] Building frontend application...
cd frontend
if not exist "node_modules" (
    echo [*] Installing frontend npm packages...
    call npm install --silent
)
echo [*] Compiling Next.js production build...
call npm run build
cd ..

:: 6. Setup Electron Desktop App
echo.
echo [*] Configuring Electron desktop runtime...
cd electron
if not exist "node_modules" (
    echo [*] Installing Electron dependencies...
    call npm install --silent
)
cd ..

echo.
echo ======================================================================
echo         SETUP COMPLETE: JellyFlex 2.0 is Ready to Launch!
echo ======================================================================
echo.
echo [1] Launch Desktop App Now
echo [2] Build Windows NSIS Installer (.exe)
echo [3] Exit
echo.

set /p CHOICE="Enter choice (1, 2, or 3): "

if "%CHOICE%"=="1" (
    echo [*] Launching JellyFlex 2.0 Desktop...
    cd electron
    call npm start
    cd ..
) else if "%CHOICE%"=="2" (
    echo [*] Packaging Windows NSIS Installer via electron-builder...
    cd electron
    call npm run dist
    cd ..
    echo [*] Installer built in electron\dist\
    pause
) else (
    echo [*] Setup exited cleanly.
)
