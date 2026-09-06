@echo off
echo ========================================
echo   FinEdge-ERP - Starting All Services
echo ========================================
echo.

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"

echo [0/3] Killing any existing processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
timeout /t 1 /nobreak >nul

echo [1/3] Starting Backend on port 3000...
start "FinEdge Backend" cmd /k "cd /d "%SCRIPT_DIR%backend" && npm run dev"
timeout /t 5 /nobreak >nul

echo [2/3] Starting Frontend on port 5173...
start "FinEdge Frontend" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   Services Started!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Waiting 10 seconds for services to initialize...
timeout /t 10 /nobreak >nul

echo Opening browser...
start http://localhost:5173

echo.
echo ========================================
echo   FinEdge-ERP is now running!
echo ========================================
echo.
echo Don't close the Backend and Frontend windows!
echo.
pause
