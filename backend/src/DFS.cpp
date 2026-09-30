#include "../include/DFS.h"
#include <algorithm>

std::vector<std::vector<int>> DFS::getConnectedComponents(const Graph& graph) {
    std::vector<std::vector<int>> components;
    std::unordered_set<int> visited;

    for (int node : graph.getAllNodes()) {
        if (visited.find(node) == visited.end()) {
            std::vector<int> component;
            dfsComponent(graph, node, visited, component);
            components.push_back(component);
        }
    }
    return components;
}

void DFS::dfsComponent(const Graph& graph, int u, std::unordered_set<int>& visited, std::vector<int>& component) {
    visited.insert(u);
    component.push_back(u);

    for (int neighbor : graph.getNeighborIds(u)) {
        if (visited.find(neighbor) == visited.end()) {
            dfsComponent(graph, neighbor, visited, component);
        }
    }
}

std::vector<int> DFS::findAnyPath(const Graph& graph, int startId, int targetId) {
    std::unordered_set<int> visited;
    std::vector<int> path;
    if (dfsPath(graph, startId, targetId, visited, path)) {
        std::reverse(path.begin(), path.end());
        return path;
    }
    return {};
}

bool DFS::dfsPath(const Graph& graph, int curr, int target, std::unordered_set<int>& visited, std::vector<int>& path) {
    visited.insert(curr);
    if (curr == target) {
        path.push_back(curr);
        return true;
    }

    for (int neighbor : graph.getNeighborIds(curr)) {
        if (visited.find(neighbor) == visited.end()) {
            if (dfsPath(graph, neighbor, target, visited, path)) {
                path.push_back(curr);
                return true;
            }
        }
    }
    return false;
}

std::vector<std::pair<int, int>> DFS::findBridges(const Graph& graph) {
    std::unordered_map<int, int> tin, low;
    std::unordered_set<int> visited;
    std::vector<std::pair<int, int>> bridges;
    int timer = 0;

    for (int node : graph.getAllNodes()) {
        if (visited.find(node) == visited.end()) {
            bridgeDfs(graph, node, -1, tin, low, visited, timer, bridges);
        }
    }
    return bridges;
}

void DFS::bridgeDfs(const Graph& graph, int u, int p, std::unordered_map<int, int>& tin,
                    std::unordered_map<int, int>& low, std::unordered_set<int>& visited,
                    int& timer, std::vector<std::pair<int, int>>& bridges) {
    visited.insert(u);
    tin[u] = low[u] = ++timer;

    for (int v : graph.getNeighborIds(u)) {
        if (v == p) continue;
        if (visited.find(v) != visited.end()) {
            low[u] = std::min(low[u], tin[v]);
        } else {
            bridgeDfs(graph, v, u, tin, low, visited, timer, bridges);
            low[u] = std::min(low[u], low[v]);
            if (low[v] > tin[u]) {
                bridges.push_back({std::min(u, v), std::max(u, v)});
            }
        }
    }
}

std::vector<std::vector<int>> DFS::findTriangles(const Graph& graph, int userId) {
    std::vector<std::vector<int>> triangles;
    const auto neighbors = graph.getNeighborIds(userId);

    for (size_t i = 0; i < neighbors.size(); ++i) {
        int u = neighbors[i];
        for (size_t j = i + 1; j < neighbors.size(); ++j) {
            int v = neighbors[j];
            if (graph.hasEdge(u, v)) {
                triangles.push_back({userId, u, v});
            }
        }
    }
    return triangles;
}

std::vector<DFSStep> DFS::getTraversalTrace(const Graph& graph, int startId, int maxDepth) {
    std::vector<DFSStep> trace;
    std::unordered_set<int> visited;

    auto dfs = [&](auto self, int u, int p, int d) -> void {
        visited.insert(u);
        trace.push_back({u, d, p, "visit"});
        if (d >= maxDepth) return;

        for (int v : graph.getNeighborIds(u)) {
            if (visited.find(v) == visited.end()) {
                self(self, v, u, d + 1);
                trace.push_back({u, d, p, "backtrack"});
            }
        }
    };

    dfs(dfs, startId, -1, 0);
    return trace;
}
