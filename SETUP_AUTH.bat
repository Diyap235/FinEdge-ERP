@echo off
echo ========================================
echo  FinEdge ERP - Authentication Setup
echo ========================================
echo.

echo [1/4] Installing dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Running database migration...
call npx prisma migrate dev --name add_user_password
if errorlevel 1 (
    echo ERROR: Migration failed
    pause
    exit /b 1
)

echo.
echo [3/4] Generating Prisma client...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)

echo.
echo [4/4] Creating admin user...
node scripts\create-admin.js
if errorlevel 1 (
    echo ERROR: Failed to create admin user
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Authentication Setup Complete!
echo ========================================
echo.
echo Default Admin Credentials:
echo   Email: admin@finedge.com
echo   Password: Password@123
echo.
echo IMPORTANT: Change the password after first login!
echo.
echo Next steps:
echo   1. Run START_ALL.bat to start the application
echo   2. Go to http://localhost:5173/login
echo   3. Login with the credentials above
echo.
pause
