const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const http = require('http');
const { spawn, exec } = require('child_process');
const fs = require('fs');

let mainWindow = null;
let backendProcess = null;
let frontendProcess = null;

const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');

// Find Python executable (.venv or system python)
function getPythonExecutable() {
  const winVenv = path.join(ROOT_DIR, '.venv', 'Scripts', 'python.exe');
  if (fs.existsSync(winVenv)) return winVenv;

  const nixVenv = path.join(ROOT_DIR, '.venv', 'bin', 'python');
  if (fs.existsSync(nixVenv)) return nixVenv;

  return process.platform === 'win32' ? 'python' : 'python3';
}

// Poll Gateway Health Endpoint
function waitForGateway(url, timeoutMs = 25000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          retry();
        }
      });

      req.on('error', () => {
        retry();
      });

      req.setTimeout(1500, () => {
        req.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`Timeout waiting for gateway at ${url}`));
      } else {
        setTimeout(check, 600);
      }
    };

    check();
  });
}

// Start Backend Process
function startBackend() {
  const pythonBin = getPythonExecutable();
  console.log(`[JellyFlex Desktop] Spawning backend with ${pythonBin}`);

  backendProcess = spawn(pythonBin, ['backend/main.py'], {
    cwd: ROOT_DIR,
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
    shell: process.platform === 'win32',
  });

  backendProcess.stdout?.on('data', (d) => console.log(`[Backend] ${d.toString().trim()}`));
  backendProcess.stderr?.on('data', (d) => console.error(`[Backend ERR] ${d.toString().trim()}`));

  backendProcess.on('close', (code) => {
    console.log(`[JellyFlex Desktop] Backend exited with code ${code}`);
  });
}

// Start Frontend Process if not already running
function startFrontend() {
  console.log('[JellyFlex Desktop] Starting Next.js UI server...');
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  frontendProcess = spawn(npmCmd, ['run', 'start', '--', '-p', '3000'], {
    cwd: FRONTEND_DIR,
    shell: true,
  });

  frontendProcess.stdout?.on('data', (d) => console.log(`[Frontend] ${d.toString().trim()}`));
  frontendProcess.stderr?.on('data', (d) => console.error(`[Frontend ERR] ${d.toString().trim()}`));
}

function createMainWindow() {
  const iconPath = path.join(__dirname, 'assets', process.platform === 'win32' ? 'icon.ico' : 'icon.png');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1040,
    minHeight: 680,
    title: 'JellyFlex 2.0 — Conversational AI Agent Suite',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#FAF9F5',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load URL
  mainWindow.loadURL('http://127.0.0.1:3000');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Graceful cleanup of child processes
function cleanupProcesses() {
  console.log('[JellyFlex Desktop] Cleaning up background processes...');
  if (backendProcess && backendProcess.pid) {
    if (process.platform === 'win32') {
      exec(`taskkill /pid ${backendProcess.pid} /T /F`, () => {});
    } else {
      backendProcess.kill('SIGTERM');
    }
    backendProcess = null;
  }

  if (frontendProcess && frontendProcess.pid) {
    if (process.platform === 'win32') {
      exec(`taskkill /pid ${frontendProcess.pid} /T /F`, () => {});
    } else {
      frontendProcess.kill('SIGTERM');
    }
    frontendProcess = null;
  }
}

app.whenReady().then(async () => {
  try {
    startBackend();
    console.log('[JellyFlex Desktop] Waiting for Python FastAPI Gateway...');
    await waitForGateway('http://127.0.0.1:8000/health', 25000);
    console.log('[JellyFlex Desktop] Python Gateway is HEALTHY.');

    // Check if frontend already running on 3000
    try {
      await waitForGateway('http://127.0.0.1:3000', 1500);
      console.log('[JellyFlex Desktop] Frontend already listening on 3000.');
    } catch {
      startFrontend();
      await waitForGateway('http://127.0.0.1:3000', 25000);
    }

    createMainWindow();
  } catch (err) {
    console.error('[JellyFlex Desktop Startup Error]', err);
    dialog.showErrorBox(
      'JellyFlex Startup Error',
      `Failed to initialize local agent runtime:\n${err.message}\n\nPlease run setup_installer.bat to repair dependencies.`
    );
    cleanupProcesses();
    app.quit();
  }
});

app.on('window-all-closed', () => {
  cleanupProcesses();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  cleanupProcesses();
});
