#pragma once

#include "Graph.h"
#include <vector>
#include <unordered_map>
#include <unordered_set>

struct BFSStep {
    int userId;
    int depth;
    int parentId;
};

class BFS {
public:
    // Computes the shortest unweighted path (degree of separation) between startId and targetId
    static std::vector<int> getShortestPath(const Graph& graph, int startId, int targetId);

    // Returns all nodes within maxDepth hops from startId, mapped with their exact separation degree
    static std::unordered_map<int, int> getNodesWithinDistance(const Graph& graph, int startId, int maxDepth = 2);

    // Returns 2nd-degree friends (friends of friends who are NOT direct friends and NOT self)
    static std::vector<int> getFriendsOfFriends(const Graph& graph, int startId);

    // Finds mutual friends between two users
    static std::vector<int> getMutualFriends(const Graph& graph, int u, int v);

    // Level-order traversal trace for visual educational step-through in UI
    static std::vector<BFSStep> getTraversalTrace(const Graph& graph, int startId, int maxDepth = 3);
};
