#pragma once

#include "Graph.h"
#include <vector>
#include <unordered_set>
#include <unordered_map>

struct DFSStep {
    int userId;
    int depth;
    int parentId;
    std::string action; // "visit", "backtrack"
};

class DFS {
public:
    // Finds all connected components using recursive Depth-First Search
    static std::vector<std::vector<int>> getConnectedComponents(const Graph& graph);

    // Explores any path between startId and targetId
    static std::vector<int> findAnyPath(const Graph& graph, int startId, int targetId);

    // Detects bridge edges (critical social ties whose removal disconnects the graph)
    static std::vector<std::pair<int, int>> findBridges(const Graph& graph);

    // Detects 3-cliques (triangles) involving the user - fundamental to social triadic closure
    static std::vector<std::vector<int>> findTriangles(const Graph& graph, int userId);

    // Generates a complete DFS traversal step trace for animated graph walkthrough
    static std::vector<DFSStep> getTraversalTrace(const Graph& graph, int startId, int maxDepth = 4);

private:
    static void dfsComponent(const Graph& graph, int u, std::unordered_set<int>& visited, std::vector<int>& component);
    static bool dfsPath(const Graph& graph, int curr, int target, std::unordered_set<int>& visited, std::vector<int>& path);
    static void bridgeDfs(const Graph& graph, int u, int p, std::unordered_map<int, int>& tin, std::unordered_map<int, int>& low,
                          std::unordered_set<int>& visited, int& timer, std::vector<std::pair<int, int>>& bridges);
};
