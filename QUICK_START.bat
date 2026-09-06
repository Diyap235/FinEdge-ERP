@echo off
echo.
echo ===================================================
echo  FinEdge ERP - Quick Start
echo ===================================================
echo.
echo Step 1: Installing missing dependencies...
echo.

cd /d "%~dp0frontend"
call npm install react-hot-toast

echo.
echo Step 2: Starting Backend Server...
echo.

cd /d "%~dp0backend"
start "FinEdge Backend" cmd /k "npm start"

timeout /t 3

echo.
echo Step 3: Starting Frontend Development Server...
echo.

cd /d "%~dp0frontend"
start "FinEdge Frontend" cmd /k "npm run dev"

echo.
echo ===================================================
echo  Both servers are starting in separate windows!
echo  Backend: http://localhost:3000
echo  Frontend: http://localhost:5173
echo ===================================================
echo.
pause
