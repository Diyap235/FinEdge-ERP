@echo off
echo Starting FinEdge-ERP Backend...
cd /d "%~dp0backend"
call npm run dev
pause
