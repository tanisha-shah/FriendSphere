#include "../include/Graph.h"
#include <algorithm>
#include <cmath>

void Graph::addNode(int userId) {
    userIds.insert(userId);
    if (adjList.find(userId) == adjList.end()) {
        adjList[userId] = {};
    }
}

void Graph::removeNode(int userId) {
    userIds.erase(userId);
    adjList.erase(userId);
    // Remove incoming edges from neighbors
    for (auto& [u, neighbors] : adjList) {
        neighbors.erase(
            std::remove_if(neighbors.begin(), neighbors.end(),
                           [userId](const std::pair<int, double>& p) { return p.first == userId; }),
            neighbors.end()
        );
    }
    // Remove from edges vector
    edges.erase(
        std::remove_if(edges.begin(), edges.end(),
                       [userId](const Edge& e) { return e.u == userId || e.v == userId; }),
        edges.end()
    );
}

void Graph::addEdge(int u, int v, double weight, const std::string& createdAt) {
    if (u == v) return;
    addNode(u);
    addNode(v);

    // Check if edge already exists to update weight
    bool found = false;
    for (auto& pair : adjList[u]) {
        if (pair.first == v) {
            pair.second = weight;
            found = true;
            break;
        }
    }
    for (auto& pair : adjList[v]) {
        if (pair.first == u) {
            pair.second = weight;
            break;
        }
    }

    if (!found) {
        adjList[u].push_back({v, weight});
        adjList[v].push_back({u, weight});
        edges.push_back({std::min(u, v), std::max(u, v), weight, createdAt});
    }
}

void Graph::removeEdge(int u, int v) {
    if (adjList.find(u) != adjList.end()) {
        auto& nu = adjList[u];
        nu.erase(std::remove_if(nu.begin(), nu.end(), [v](const auto& p) { return p.first == v; }), nu.end());
    }
    if (adjList.find(v) != adjList.end()) {
        auto& nv = adjList[v];
        nv.erase(std::remove_if(nv.begin(), nv.end(), [u](const auto& p) { return p.first == u; }), nv.end());
    }
    edges.erase(
        std::remove_if(edges.begin(), edges.end(),
                       [u, v](const Edge& e) {
                           return (e.u == u && e.v == v) || (e.u == v && e.v == u);
                       }),
        edges.end()
    );
}

bool Graph::hasEdge(int u, int v) const {
    auto it = adjList.find(u);
    if (it == adjList.end()) return false;
    for (const auto& p : it->second) {
        if (p.first == v) return true;
    }
    return false;
}

double Graph::getEdgeWeight(int u, int v) const {
    auto it = adjList.find(u);
    if (it != adjList.end()) {
        for (const auto& p : it->second) {
            if (p.first == v) return p.second;
        }
    }
    return 0.0;
}

const std::vector<std::pair<int, double>>& Graph::getNeighbors(int userId) const {
    static const std::vector<std::pair<int, double>> emptyNeighbors;
    auto it = adjList.find(userId);
    if (it != adjList.end()) {
        return it->second;
    }
    return emptyNeighbors;
}

std::vector<int> Graph::getNeighborIds(int userId) const {
    std::vector<int> result;
    auto it = adjList.find(userId);
    if (it != adjList.end()) {
        result.reserve(it->second.size());
        for (const auto& p : it->second) {
            result.push_back(p.first);
        }
    }
    return result;
}

const std::unordered_set<int>& Graph::getAllNodes() const {
    return userIds;
}

const std::vector<Edge>& Graph::getAllEdges() const {
    return edges;
}

size_t Graph::getNodeCount() const {
    return userIds.size();
}

size_t Graph::getEdgeCount() const {
    return edges.size();
}

int Graph::getDegree(int userId) const {
    auto it = adjList.find(userId);
    if (it != adjList.end()) {
        return static_cast<int>(it->second.size());
    }
    return 0;
}

// Local clustering coefficient C(u) = 2 * E(N(u)) / (k_u * (k_u - 1))
double Graph::getLocalClusteringCoefficient(int userId) const {
    const auto& neighbors = getNeighborIds(userId);
    int k = static_cast<int>(neighbors.size());
    if (k < 2) return 0.0;

    int edgesBetweenNeighbors = 0;
    std::unordered_set<int> neighborSet(neighbors.begin(), neighbors.end());

    for (size_t i = 0; i < neighbors.size(); ++i) {
        int u = neighbors[i];
        for (size_t j = i + 1; j < neighbors.size(); ++j) {
            int v = neighbors[j];
            if (hasEdge(u, v)) {
                edgesBetweenNeighbors++;
            }
        }
    }

    return (2.0 * edgesBetweenNeighbors) / (k * (k - 1.0));
}

double Graph::getAverageClusteringCoefficient() const {
    if (userIds.empty()) return 0.0;
    double sum = 0.0;
    for (int u : userIds) {
        sum += getLocalClusteringCoefficient(u);
    }
    return sum / userIds.size();
}

double Graph::getNetworkDensity() const {
    size_t n = userIds.size();
    if (n <= 1) return 0.0;
    double possibleEdges = (n * (n - 1.0)) / 2.0;
    return edges.size() / possibleEdges;
}

std::unordered_map<int, double> Graph::getDegreeCentrality() const {
    std::unordered_map<int, double> centrality;
    size_t n = userIds.size();
    if (n <= 1) return centrality;

    for (int u : userIds) {
        centrality[u] = static_cast<double>(getDegree(u)) / (n - 1.0);
    }
    return centrality;
}

nlohmann::json Graph::getGraphVisualizationData() const {
    nlohmann::json j;
    j["nodes"] = nlohmann::json::array();
    j["links"] = nlohmann::json::array();

    for (int u : userIds) {
        j["nodes"].push_back({
            {"id", u},
            {"degree", getDegree(u)},
            {"clusteringCoeff", getLocalClusteringCoefficient(u)}
        });
    }

    for (const auto& e : edges) {
        j["links"].push_back({
            {"source", e.u},
            {"target", e.v},
            {"weight", e.weight}
        });
    }

    return j;
}

void Graph::clear() {
    adjList.clear();
    userIds.clear();
    edges.clear();
}
