# Fallout 76 Config Editor Bootstrap Script
$repoUrl = "https://github.com/Santaslileper/fallout-76-config-editor.git"
$destDir = "$HOME\Desktop\Fallout76Config"

Write-Host "--- Fallout 76 Config Editor: Quick Install ---" -ForegroundColor Yellow

if (Test-Path $destDir) {
    Write-Host "Directory $destDir already exists. Replacing with fresh version..." -ForegroundColor Cyan
    Remove-Item -Path $destDir -Recurse -Force
}

Write-Host "Cloning repository..." -ForegroundColor Cyan
git clone $repoUrl $destDir
Set-Location $destDir

Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "Launching Fallout 76 Config Editor..." -ForegroundColor Yellow

Start-Process ".\Fallout76Config.exe"
