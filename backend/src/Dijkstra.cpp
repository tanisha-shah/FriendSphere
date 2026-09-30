#include "../include/Dijkstra.h"
#include <queue>
#include <limits>
#include <algorithm>

DijkstraResult Dijkstra::getShortestPath(const Graph& graph, int startId, int targetId) {
    DijkstraResult result;
    if (startId == targetId) {
        result.path = {startId};
        result.totalCost = 0.0;
        result.socialAffinityScore = 1.0;
        result.reachable = true;
        return result;
    }

    // Min-heap: pair<cost, node>
    std::priority_queue<std::pair<double, int>,
                        std::vector<std::pair<double, int>>,
                        std::greater<std::pair<double, int>>> pq;

    std::unordered_map<int, double> dist;
    std::unordered_map<int, int> parent;
    const double INF = std::numeric_limits<double>::infinity();

    for (int node : graph.getAllNodes()) {
        dist[node] = INF;
    }

    dist[startId] = 0.0;
    pq.push({0.0, startId});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue;
        if (u == targetId) break;

        for (const auto& [v, weight] : graph.getNeighbors(u)) {
            // Social edge friction: stronger weight = smaller traversal cost
            double edgeCost = (weight > 0.0) ? (1.0 / weight) : 1.0;
            if (dist[u] + edgeCost < dist[v]) {
                dist[v] = dist[u] + edgeCost;
                parent[v] = u;
                pq.push({dist[v], v});
            }
        }
    }

    if (dist[targetId] == INF) {
        result.reachable = false;
        return result;
    }

    result.reachable = true;
    result.totalCost = dist[targetId];
    // Convert path cost back to an intuitive 0.0 - 1.0 affinity score
    result.socialAffinityScore = 1.0 / (1.0 + dist[targetId]);

    // Reconstruct path
    int curr = targetId;
    while (curr != startId) {
        result.path.push_back(curr);
        curr = parent[curr];
    }
    result.path.push_back(startId);
    std::reverse(result.path.begin(), result.path.end());

    return result;
}

std::unordered_map<int, double> Dijkstra::getDistancesFromSource(const Graph& graph, int startId) {
    std::priority_queue<std::pair<double, int>,
                        std::vector<std::pair<double, int>>,
                        std::greater<std::pair<double, int>>> pq;

    std::unordered_map<int, double> dist;
    const double INF = std::numeric_limits<double>::infinity();

    for (int node : graph.getAllNodes()) {
        dist[node] = INF;
    }

    dist[startId] = 0.0;
    pq.push({0.0, startId});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue;

        for (const auto& [v, weight] : graph.getNeighbors(u)) {
            double edgeCost = (weight > 0.0) ? (1.0 / weight) : 1.0;
            if (dist[u] + edgeCost < dist[v]) {
                dist[v] = dist[u] + edgeCost;
                pq.push({dist[v], v});
            }
        }
    }

    return dist;
}

double Dijkstra::getClosenessCentrality(const Graph& graph, int userId) {
    auto dists = getDistancesFromSource(graph, userId);
    double totalDistance = 0.0;
    int reachableNodes = 0;

    for (const auto& [v, d] : dists) {
        if (v != userId && !std::isinf(d)) {
            totalDistance += d;
            reachableNodes++;
        }
    }

    if (reachableNodes == 0 || totalDistance == 0.0) return 0.0;
    return static_cast<double>(reachableNodes) / totalDistance;
}
