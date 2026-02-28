# Fallout 76 Config Editor Bootstrap Script
$repoUrl = "https://github.com/Santaslileper/fallout-76-config-editor.git"
$destDir = "$HOME\Desktop\Fallout76Config"

Write-Host "--- Fallout 76 Config Editor: Quick Install ---" -ForegroundColor Yellow

if (Test-Path $destDir) {
    Write-Host "Directory $destDir already exists. Updating..." -ForegroundColor Cyan
    Set-Location $destDir
    git pull
}
else {
    Write-Host "Cloning repository..." -ForegroundColor Cyan
    git clone $repoUrl $destDir
    Set-Location $destDir
}

Write-Host "Checking for Python..." -ForegroundColor Cyan
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python not found! Please install Python 3.x from python.org" -ForegroundColor Red
    return
}

Write-Host "Installing requirements..." -ForegroundColor Cyan
pip install -r requirements.txt

Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "You can now run the app using: ./launcher.bat" -ForegroundColor Yellow

# Start the app?
# Start-Process ".\launcher.bat"
