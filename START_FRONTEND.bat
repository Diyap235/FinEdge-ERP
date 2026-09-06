@echo off
echo Starting FinEdge-ERP Frontend...
cd /d "%~dp0frontend"
call npm run dev
pause
