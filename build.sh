#!/bin/bash
set -e

echo "=== Building FriendSphere C++ Algorithmic Core ==="
g++ -std=c++17 -O3 -pthread -Ibackend/include backend/src/*.cpp -o friendsphere_server

echo "=== Build Complete! Starting Server ==="
./friendsphere_server 8080 data
