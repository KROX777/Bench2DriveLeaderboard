#!/bin/bash

# Bench2Drive Leaderboard - Quick Start Script
# This script starts both backend and frontend servers

#!/bin/bash

echo "🚀 Starting Bench2Drive Leaderboard Application..."
echo ""

# Start backend
echo "📡 Starting backend server on port 5001..."
cd backend
node index.js &
BACKEND_PID=$!
echo "Backend running with PID: $BACKEND_PID"
cd ..

# Wait for backend to start
sleep 2

# Start frontend
echo ""
echo "🎨 Starting frontend on port 3000..."
cd frontend
npm start &
FRONTEND_PID=$!
echo "Frontend running with PID: $FRONTEND_PID"
cd ..

echo ""
echo "✅ Application started successfully!"
echo ""
echo "🌐 Access the application at: http://localhost:3000"
echo "📊 Backend API available at: http://localhost:5001"
echo ""
echo "To stop the servers:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Or press Ctrl+C to stop this script (servers will keep running)"

echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Function to start backend
start_backend() {
    echo "📦 Starting backend server..."
    cd backend
    if [ ! -d "node_modules" ]; then
        echo "Installing backend dependencies..."
        npm install
    fi
    npm start &
    BACKEND_PID=$!
    cd ..
    echo "✅ Backend running on http://localhost:5000 (PID: $BACKEND_PID)"
    echo ""
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting frontend server..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install
    fi
    npm start &
    FRONTEND_PID=$!
    cd ..
    echo "✅ Frontend will open at http://localhost:3000 (PID: $FRONTEND_PID)"
    echo ""
}

# Trap Ctrl+C to stop both servers
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Start both servers
start_backend
sleep 2
start_frontend

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ CARLA Leaderboard is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Frontend: http://localhost:3000"
echo "🔌 Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Keep script running
wait
