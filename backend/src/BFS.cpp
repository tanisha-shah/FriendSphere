#include "../include/BFS.h"
#include <queue>
#include <algorithm>

std::vector<int> BFS::getShortestPath(const Graph& graph, int startId, int targetId) {
    if (startId == targetId) return {startId};

    std::queue<int> q;
    std::unordered_map<int, int> parent;
    std::unordered_set<int> visited;

    q.push(startId);
    visited.insert(startId);
    bool found = false;

    while (!q.empty()) {
        int curr = q.front();
        q.pop();

        if (curr == targetId) {
            found = true;
            break;
        }

        for (int neighbor : graph.getNeighborIds(curr)) {
            if (visited.find(neighbor) == visited.end()) {
                visited.insert(neighbor);
                parent[neighbor] = curr;
                q.push(neighbor);
            }
        }
    }

    if (!found) return {};

    // Reconstruct path
    std::vector<int> path;
    int curr = targetId;
    while (curr != startId) {
        path.push_back(curr);
        curr = parent[curr];
    }
    path.push_back(startId);
    std::reverse(path.begin(), path.end());
    return path;
}

std::unordered_map<int, int> BFS::getNodesWithinDistance(const Graph& graph, int startId, int maxDepth) {
    std::unordered_map<int, int> distances;
    std::queue<std::pair<int, int>> q; // (node, depth)

    q.push({startId, 0});
    distances[startId] = 0;

    while (!q.empty()) {
        auto [curr, depth] = q.front();
        q.pop();

        if (depth >= maxDepth) continue;

        for (int neighbor : graph.getNeighborIds(curr)) {
            if (distances.find(neighbor) == distances.end()) {
                distances[neighbor] = depth + 1;
                q.push({neighbor, depth + 1});
            }
        }
    }

    return distances;
}

std::vector<int> BFS::getFriendsOfFriends(const Graph& graph, int startId) {
    std::vector<int> fof;
    const auto directFriends = graph.getNeighborIds(startId);
    std::unordered_set<int> directFriendSet(directFriends.begin(), directFriends.end());
    directFriendSet.insert(startId); // exclude self

    std::unordered_set<int> secondDegreeSet;

    for (int friendId : directFriends) {
        for (int candidate : graph.getNeighborIds(friendId)) {
            if (directFriendSet.find(candidate) == directFriendSet.end()) {
                secondDegreeSet.insert(candidate);
            }
        }
    }

    fof.assign(secondDegreeSet.begin(), secondDegreeSet.end());
    return fof;
}

std::vector<int> BFS::getMutualFriends(const Graph& graph, int u, int v) {
    std::vector<int> mutual;
    const auto uNeighbors = graph.getNeighborIds(u);
    const auto vNeighbors = graph.getNeighborIds(v);

    std::unordered_set<int> uSet(uNeighbors.begin(), uNeighbors.end());
    for (int neighbor : vNeighbors) {
        if (uSet.find(neighbor) != uSet.end()) {
            mutual.push_back(neighbor);
        }
    }
    return mutual;
}

std::vector<BFSStep> BFS::getTraversalTrace(const Graph& graph, int startId, int maxDepth) {
    std::vector<BFSStep> trace;
    std::queue<std::pair<int, int>> q;
    std::unordered_set<int> visited;
    std::unordered_map<int, int> parent;

    q.push({startId, 0});
    visited.insert(startId);
    parent[startId] = -1;

    while (!q.empty()) {
        auto [curr, depth] = q.front();
        q.pop();

        trace.push_back({curr, depth, parent[curr]});

        if (depth >= maxDepth) continue;

        for (int neighbor : graph.getNeighborIds(curr)) {
            if (visited.find(neighbor) == visited.end()) {
                visited.insert(neighbor);
                parent[neighbor] = curr;
                q.push({neighbor, depth + 1});
            }
        }
    }

    return trace;
}
