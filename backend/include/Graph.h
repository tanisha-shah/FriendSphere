#pragma once

#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <string>
#include <nlohmann/json.hpp>

struct Edge {
    int u;
    int v;
    double weight; // interaction strength (higher = closer relationship)
    std::string createdAt;
};

class Graph {
private:
    // Adjacency list: userId -> vector of (neighborId, weight)
    std::unordered_map<int, std::vector<std::pair<int, double>>> adjList;
    // Set of all registered user IDs
    std::unordered_set<int> userIds;
    // All unique edges
    std::vector<Edge> edges;

public:
    Graph() = default;

    void addNode(int userId);
    void removeNode(int userId);
    void addEdge(int u, int v, double weight = 1.0, const std::string& createdAt = "");
    void removeEdge(int u, int v);
    bool hasEdge(int u, int v) const;
    double getEdgeWeight(int u, int v) const;

    const std::vector<std::pair<int, double>>& getNeighbors(int userId) const;
    std::vector<int> getNeighborIds(int userId) const;
    const std::unordered_set<int>& getAllNodes() const;
    const std::vector<Edge>& getAllEdges() const;

    size_t getNodeCount() const;
    size_t getEdgeCount() const;
    int getDegree(int userId) const;

    // Graph metrics
    double getLocalClusteringCoefficient(int userId) const;
    double getAverageClusteringCoefficient() const;
    double getNetworkDensity() const;
    std::unordered_map<int, double> getDegreeCentrality() const;

    // Export graph topology for React Flow / D3 visualization
    nlohmann::json getGraphVisualizationData() const;

    void clear();
};
