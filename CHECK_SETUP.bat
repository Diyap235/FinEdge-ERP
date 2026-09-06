@echo off
echo ========================================
echo   FinEdge-ERP - Setup Verification
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Node.js NOT FOUND
    echo     Please install Node.js from https://nodejs.org
) else (
    echo [OK] Node.js installed
    node --version
)
echo.

echo Checking NPM installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] NPM NOT FOUND
) else (
    echo [OK] NPM installed
    npm --version
)
echo.

echo Checking backend dependencies...
cd /d "%~dp0backend"
if exist "node_modules" (
    echo [OK] Backend dependencies installed
) else (
    echo [X] Backend dependencies NOT installed
    echo     Run: cd backend ^&^& npm install
)
echo.

echo Checking frontend dependencies...
cd /d "%~dp0frontend"
if exist "node_modules" (
    echo [OK] Frontend dependencies installed
) else (
    echo [X] Frontend dependencies NOT installed
    echo     Run: cd frontend ^&^& npm install
)
echo.

echo Checking backend .env file...
cd /d "%~dp0backend"
if exist ".env" (
    echo [OK] Backend .env exists
) else (
    echo [X] Backend .env NOT FOUND
    echo     Copy .env.example to .env
)
echo.

echo Checking frontend .env file...
cd /d "%~dp0frontend"
if exist ".env" (
    echo [OK] Frontend .env exists
) else (
    echo [X] Frontend .env NOT FOUND
    echo     Copy .env.example to .env
)
echo.

echo ========================================
echo   Verification Complete
echo ========================================
echo.
echo If everything shows [OK], you can run:
echo   START_ALL.bat
echo.
pause
