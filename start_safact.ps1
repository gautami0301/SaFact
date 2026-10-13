# SaFact Defense Platform PowerShell Launcher
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "    🛡️ SAFACT — SMART AI FOR CROWD FLOW AND THREAT DETECTION" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan

# 1. Environment Verification
Write-Host "[*] Verifying runtime dependencies..." -ForegroundColor Yellow
$py = Get-Command python -ErrorAction SilentlyContinue
$node = Get-Command node -ErrorAction SilentlyContinue

if (-not $py) {
    Write-Error "[!] Python is not installed or not in PATH."
    exit 1
}
if (-not $node) {
    Write-Error "[!] Node.js is not installed or not in PATH."
    exit 1
}
Write-Host "[OK] Python & Node.js available." -ForegroundColor Green

# 2. Kill any stale processes on port 8000 or 3000
Get-NetTCPConnection -LocalPort 8000, 3000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

# 3. Start Backend
Write-Host "[*] Launching Backend Server on http://localhost:8000..." -ForegroundColor Cyan
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PYTHONPATH='$PSScriptRoot\backend'; python '$PSScriptRoot\backend\app\main.py'" -PassThru

Start-Sleep -Seconds 3

# 4. Start Frontend
Write-Host "[*] Launching Frontend Dashboard on http://localhost:3000..." -ForegroundColor Cyan
$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -PassThru

Start-Sleep -Seconds 3

Write-Host "===============================================================================" -ForegroundColor Green
Write-Host "    ✅ SAFACT DEFENSE PLATFORM RUNNING" -ForegroundColor Green
Write-Host "    👉 Dashboard URL: http://localhost:3000" -ForegroundColor White
Write-Host "    👉 Backend API:   http://localhost:8000" -ForegroundColor White
Write-Host "===============================================================================" -ForegroundColor Green

Start-Process "http://localhost:3000"
