cmake_minimum_required(VERSION 3.15)
project(FriendSphere VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(
    backend/include
)

set(SOURCES
    backend/src/main.cpp
    backend/src/Graph.cpp
    backend/src/BFS.cpp
    backend/src/DFS.cpp
    backend/src/Dijkstra.cpp
    backend/src/DSU.cpp
    backend/src/Similarity.cpp
    backend/src/PriorityRanking.cpp
    backend/src/Sorting.cpp
    backend/src/Searching.cpp
    backend/src/Trie.cpp
    backend/src/KMeans.cpp
    backend/src/RecommendationEngine.cpp
    backend/src/API.cpp
)

add_executable(friendsphere_server ${SOURCES})

# Windows socket libraries for httplib
if(WIN32)
    target_link_libraries(friendsphere_server PRIVATE ws2_32 crypt32)
else()
    target_link_libraries(friendsphere_server PRIVATE pthread)
endif()
