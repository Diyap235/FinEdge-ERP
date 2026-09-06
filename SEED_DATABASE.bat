@echo off
echo ========================================
echo   FinEdge-ERP - Seeding Database
echo   Creating 200+ entries per entity
echo ========================================
echo.

cd /d "%~dp0backend"

echo Running bulk seed script...
echo This will take 5-10 minutes...
echo.
call npm run seed:bulk

echo.
echo ========================================
echo   Database Seeding Complete!
echo ========================================
echo.
pause
