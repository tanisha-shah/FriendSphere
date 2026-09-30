#pragma once

#include "Graph.h"
#include <vector>
#include <unordered_map>

struct DijkstraResult {
    std::vector<int> path;
    double totalCost{0.0};
    double socialAffinityScore{0.0};
    bool reachable{false};
};

class Dijkstra {
public:
    // Computes the optimal social affinity path between startId and targetId
    // where higher edge interaction weight means lower social distance: cost = 1.0 / weight
    static DijkstraResult getShortestPath(const Graph& graph, int startId, int targetId);

    // Computes shortest distances from startId to all reachable nodes
    static std::unordered_map<int, double> getDistancesFromSource(const Graph& graph, int startId);

    // Computes Closeness Centrality for a user based on all-pairs shortest paths
    static double getClosenessCentrality(const Graph& graph, int userId);
};
