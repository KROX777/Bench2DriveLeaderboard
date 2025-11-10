@echo off
title Bench2Drive Leaderboard

echo Starting Bench2Drive Leaderboard...
echo ==================================

REM 启动后端服务器
echo Starting backend server...
cd backend
start "Backend Server" cmd /c "npm start"
cd ..

REM 等待后端启动
timeout /t 10 /nobreak >nul

REM 启动前端开发服务器
echo Starting frontend development server...
cd frontend
start "Frontend Server" cmd /c "npm start"
cd ..

echo.
echo Both servers are starting up:
echo - Backend:  http://localhost:5001
echo - Frontend: http://localhost:3000
echo.

echo Press Ctrl+C to stop both servers
pause >nul