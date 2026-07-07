# ShopSphere India Localhost Launcher
# Double-click or run this script in PowerShell to start both servers.

Write-Host "=========================================" -ForegroundColor Green
Write-Host "       Starting ShopSphere India         " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Start Backend in a new window
Write-Host "[1/2] Starting backend server (port 5000) in a new window..." -ForegroundColor Yellow
Start-Process powershell -WorkingDirectory "C:\Users\NAMAN\.gemini\antigravity\scratch\shopsphere\backend" -ArgumentList "-NoExit", "-Command", "npm run dev"

# Wait a brief moment for the backend to initialize
Start-Sleep -Seconds 3

# Start Frontend in a new window
Write-Host "[2/2] Starting frontend server (port 5173) in a new window..." -ForegroundColor Yellow
Start-Process powershell -WorkingDirectory "C:\Users\NAMAN\.gemini\antigravity\scratch\shopsphere\frontend" -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "-----------------------------------------" -ForegroundColor Green
Write-Host "ShopSphere India has been launched!" -ForegroundColor Green
Write-Host "-----------------------------------------" -ForegroundColor Green
Write-Host "Frontend App:    http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API:     http://localhost:5000" -ForegroundColor Cyan
Write-Host "Admin Demo:      admin@shopsphere.com / password123" -ForegroundColor Gray
Write-Host "User Demo:       john@example.com / password123" -ForegroundColor Gray
Write-Host "=========================================" -ForegroundColor Green
