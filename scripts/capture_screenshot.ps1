$screenshotPath1 = "C:\Users\ANURAG\.gemini\antigravity\brain\0acedb32-81e4-43c4-92f3-2695ed70e57a\artifacts\jellyflex_ui_preview.png"
$screenshotPath2 = "C:\Users\ANURAG\.gemini\antigravity\brain\0acedb32-81e4-43c4-92f3-2695ed70e57a\jellyflex_anthropic_ui.png"

$targetDir1 = Split-Path -Path $screenshotPath1 -Parent
if (-not (Test-Path $targetDir1)) {
    New-Item -ItemType Directory -Path $targetDir1 -Force | Out-Null
}

$backendProc = Start-Process -FilePath ".venv\Scripts\python.exe" -ArgumentList "backend\main.py" -PassThru -WindowStyle Hidden
Write-Host "Started backend with PID $($backendProc.Id)"

$frontendProc = Start-Process -FilePath "npm.cmd" -ArgumentList "run start -- -p 3000" -WorkingDirectory "frontend" -PassThru -WindowStyle Hidden
Write-Host "Started frontend with PID $($frontendProc.Id)"

# Wait for backend
Write-Host "Waiting for backend on port 8000..."
for ($i = 0; $i -lt 30; $i++) {
    try {
        $res = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/health" -UseBasicParsing -TimeoutSec 2
        if ($res.StatusCode -eq 200) {
            Write-Host "Backend is online!"
            break
        }
    } catch {}
    Start-Sleep -Seconds 1
}

# Wait for frontend
Write-Host "Waiting for frontend on port 3000..."
for ($i = 0; $i -lt 30; $i++) {
    try {
        $res = Invoke-WebRequest -Uri "http://127.0.0.1:3000" -UseBasicParsing -TimeoutSec 2
        if ($res.StatusCode -eq 200) {
            Write-Host "Frontend is online!"
            break
        }
    } catch {}
    Start-Sleep -Seconds 1
}

Start-Sleep -Seconds 3

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chromePath)) {
    $chromePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
}

Write-Host "Capturing screenshot using $chromePath to $screenshotPath1..."
$browserArgs = "--headless --disable-gpu --hide-scrollbars --window-size=1600,1020 --virtual-time-budget=8000 --screenshot=`"$screenshotPath1`" http://localhost:3000"
Start-Process -FilePath $chromePath -ArgumentList $browserArgs -Wait

Start-Sleep -Seconds 2

if (Test-Path $screenshotPath1) {
    Copy-Item $screenshotPath1 -Destination $screenshotPath2 -Force
    $fileInfo = Get-Item $screenshotPath1
    Write-Host "Screenshot successfully captured: $($fileInfo.FullName) ($($fileInfo.Length) bytes)"
} else {
    Write-Error "Screenshot failed to generate."
}

# Graceful cleanup
Write-Host "Terminating background test servers..."
Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue
taskkill /F /IM python.exe 2>$null
taskkill /F /IM node.exe /FI "WINDOWTITLE eq npm*" 2>$null
Write-Host "Cleaned up."
