# Bench2Drive Leaderboard - Quick Start Script for Windows PowerShell
# This script starts both backend and frontend servers

Write-Host "🚀 Starting Bench2Drive Leaderboard Application..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = & node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js is not installed." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Function to start backend
function Start-Backend {
    Write-Host "📡 Starting backend server on port 5001..." -ForegroundColor Cyan
    Set-Location backend
    if (!(Test-Path "node_modules")) {
        Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
        & npm install
    }
    $global:backendProcess = Start-Process -NoNewWindow -FilePath "node" -ArgumentList "index.js" -PassThru
    Write-Host "Backend running with PID: $($global:backendProcess.Id)" -ForegroundColor Green
    Set-Location ..
}

# Function to start frontend
function Start-Frontend {
    Write-Host ""
    Write-Host "🎨 Starting frontend on port 3000..." -ForegroundColor Cyan
    Set-Location frontend
    if (!(Test-Path "node_modules")) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
        & npm install
    }
    $global:frontendProcess = Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start" -PassThru
    Write-Host "Frontend running with PID: $($global:frontendProcess.Id)" -ForegroundColor Green
    Set-Location ..
}

# Start both servers
Start-Backend
Start-Sleep -Seconds 2
Start-Frontend

Write-Host ""
Write-Host "✅ Application started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access the application at: http://localhost:3000" -ForegroundColor Blue
Write-Host "📊 Backend API available at: http://localhost:5001" -ForegroundColor Blue
Write-Host ""
Write-Host "To stop the servers, run:" -ForegroundColor Yellow
Write-Host "  Stop-Process -Id $($global:backendProcess.Id), $($global:frontendProcess.Id)" -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "✨ CARLA Leaderboard is running!" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host ""
Write-Host "📊 Frontend: http://localhost:3000" -ForegroundColor Blue
Write-Host "🔌 Backend:  http://localhost:5001" -ForegroundColor Blue
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Keep script running
try {
    Wait-Process -Id $global:backendProcess.Id, $global:frontendProcess.Id
} catch {
    Write-Host "Servers stopped." -ForegroundColor Yellow
}