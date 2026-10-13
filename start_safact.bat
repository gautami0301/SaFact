@echo off
setlocal enabledelayedexpansion

title SaFact Defense Platform Launcher
color 0B

echo ===============================================================================
echo     🛡️ SAFACT — SMART AI FOR CROWD FLOW AND THREAT DETECTION
echo ===============================================================================
echo.

:: 1. Check Python
echo [*] Checking Python installation...
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] ERROR: Python is not detected in PATH.
    echo     Please install Python 3.10+ and re-run this script.
    pause
    exit /b 1
)
echo [OK] Python detected.

:: 2. Check Node.js
echo [*] Checking Node.js installation...
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] ERROR: Node.js is not detected in PATH.
    echo     Please install Node.js 18+ and re-run this script.
    pause
    exit /b 1
)
echo [OK] Node.js detected.

:: 3. Check YOLO Model
if not exist "yolov8n.pt" (
    echo [*] Downloading YOLOv8n deep learning weights (one-time setup)...
    python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
    echo [OK] YOLOv8n downloaded successfully.
)

:: 4. Start Backend Server (FastAPI on Port 8000)
echo [*] Launching SaFact AI Backend on http://localhost:8000...
start "SaFact Backend (Port 8000)" cmd /k "cd /d %~dp0 && set PYTHONPATH=%~dp0backend&& python backend\app\main.py"

:: 5. Wait for backend to initialize
timeout /t 3 /nobreak >nul

:: 6. Start Frontend Server (Vite React on Port 3000)
echo [*] Launching SaFact Command Dashboard on http://localhost:3000...
start "SaFact Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

:: 7. Wait and Open Browser
timeout /t 3 /nobreak >nul
echo.
echo ===============================================================================
echo     ✅ SAFACT PLATFORM SUCCESSFULLY LAUNCHED!
echo.
echo     🔗 Application URL:  http://localhost:3000
echo     🔗 Backend API Docs: http://localhost:8000/docs
echo ===============================================================================
echo.
echo Opening browser to http://localhost:3000...
start http://localhost:3000

endlocal
