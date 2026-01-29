# BlockChat Protocol - PowerShell Startup Script
# Starts both frontend and backend servers

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  BLOCKCHAT PROTOCOL - STARTING SERVERS" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

$ProjectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectPath

# Start Backend
Write-Host "[1/2] Starting Backend on port 5000..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k python backend.py"
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[2/2] Starting Frontend on port 8000..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k python -m http.server 8000"

Write-Host "`n================================================" -ForegroundColor Green
Write-Host "  ✓ SERVERS STARTED SUCCESSFULLY" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Green

Write-Host "Frontend URL:  " -ForegroundColor Cyan -NoNewline
Write-Host "http://localhost:8000" -ForegroundColor White

Write-Host "Backend URL:   " -ForegroundColor Cyan -NoNewline
Write-Host "http://localhost:5000" -ForegroundColor White

Write-Host "`nDEMO CREDENTIALS:" -ForegroundColor Cyan
Write-Host "  Email:    user@example.com" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White

Write-Host "`nDatabase: blockchat.db (SQLite)" -ForegroundColor Cyan
Write-Host "`nClose the terminal windows to stop the servers.`n" -ForegroundColor Yellow
