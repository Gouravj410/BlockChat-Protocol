@echo off
REM BlockChat Protocol - Startup Script
REM Starts both frontend and backend servers

setlocal
cd /d "%~dp0"

echo.
echo ================================================
echo   BLOCKCHAT PROTOCOL - STARTING SERVERS
echo ================================================
echo.
echo [1/2] Starting Backend (Port 5000)...
start cmd /k python backend.py
timeout /t 3 /nobreak

echo.
echo [2/2] Starting Frontend (Port 8000)...
start cmd /k python -m http.server 8000

echo.
echo ================================================
echo   ✓ SERVERS STARTED
echo ================================================
echo.
echo Frontend:  http://localhost:8000
echo Backend:   http://localhost:5000
echo.
echo Demo Credentials:
echo   Email: user@example.com
echo   Password: password123
echo.
echo Close these windows to stop the servers.
echo.
timeout /t 3 /nobreak
