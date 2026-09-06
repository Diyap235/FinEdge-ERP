@echo off
echo.
echo ===================================================
echo  Checking FinEdge ERP Server Status
echo ===================================================
echo.

echo Checking Backend (Port 3000)...
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Backend is running on http://localhost:3000
) else (
    echo [X] Backend is NOT running
    echo     Start it with: cd backend ^& npm start
)

echo.
echo Checking Frontend (Port 5173)...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Frontend is running on http://localhost:5173
) else (
    echo [X] Frontend is NOT running
    echo     Start it with: cd frontend ^& npm run dev
)

echo.
echo ===================================================
echo  If both servers are running, open:
echo  http://localhost:5173
echo ===================================================
echo.
pause
