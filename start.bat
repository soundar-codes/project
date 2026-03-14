@echo off
title Unified-Class Platform
color 0A
echo.
echo  =============================================
echo   Unified-Class Platform  ^|  Starting...
echo  =============================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Backend (port 5000)...
start "UCP Backend" cmd /k "cd node-backend && npm start"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend (port 3000)...
start "UCP Frontend" cmd /k "cd frontend && npm start"

echo.
echo  =============================================
echo   App running!
echo   Frontend  → http://localhost:3000
echo   Backend   → http://localhost:5000/api/health
echo   Builder   → http://localhost:3000/builder
echo  =============================================
echo.
pause
