Add-Type -AssemblyName System.Drawing

$sourcePath = "frontend\public\mascot.jpg"
if (-not (Test-Path $sourcePath)) {
    Write-Error "Source image not found at $sourcePath"
    exit 1
}

$img = [System.Drawing.Image]::FromFile($sourcePath)
$img.Save("frontend\public\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$img.Save("frontend\public\logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$img.Save("frontend\public\brand-mascot.png", [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()

New-Item -ItemType Directory -Force -Path "electron\assets" | Out-Null
Copy-Item -Path "frontend\public\icon.png" -Destination "electron\assets\icon.png" -Force

$bmp = New-Object System.Drawing.Bitmap 256, 256
$g = [System.Drawing.Graphics]::FromImage($bmp)
$src = [System.Drawing.Image]::FromFile($sourcePath)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($src, 0, 0, 256, 256)
$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream "frontend\public\favicon.ico", ([System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()

Copy-Item -Path "frontend\public\favicon.ico" -Destination "electron\assets\icon.ico" -Force

$src.Dispose()
$bmp.Dispose()
Write-Host "Assets successfully created in frontend/public and electron/assets"
