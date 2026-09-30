@echo off
echo ===================================================
echo     Launching FriendSphere Full-Stack Platform
echo ===================================================

echo [1/2] Starting C++ Algorithmic Backend Server on Port 8080...
start "FriendSphere C++ Server" cmd /k "wsl -d Ubuntu bash -c 'cd /mnt/c/sem5/DAA/assignment/FriendSphere && g++ -std=c++17 -O3 -pthread -Ibackend/include backend/src/*.cpp -o friendsphere_server && ./friendsphere_server 8080 data'"

echo [2/2] Starting React Frontend on Port 5173...
cd frontend
npm run dev
