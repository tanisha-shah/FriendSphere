#include "../include/DSU.h"

void DSU::addElement(int u) {
    if (parent.find(u) == parent.end()) {
        parent[u] = u;
        rank[u] = 0;
        setSize[u] = 1;
        numComponents++;
    }
}

int DSU::find(int u) {
    if (parent.find(u) == parent.end()) {
        addElement(u);
        return u;
    }
    if (parent[u] == u) {
        return u;
    }
    return parent[u] = find(parent[u]); // Path compression
}

bool DSU::unite(int u, int v) {
    int rootU = find(u);
    int rootV = find(v);

    if (rootU == rootV) return false;

    // Union by rank
    if (rank[rootU] < rank[rootV]) {
        parent[rootU] = rootV;
        setSize[rootV] += setSize[rootU];
    } else if (rank[rootU] > rank[rootV]) {
        parent[rootV] = rootU;
        setSize[rootU] += setSize[rootV];
    } else {
        parent[rootV] = rootU;
        rank[rootU]++;
        setSize[rootU] += setSize[rootV];
    }

    numComponents--;
    return true;
}

bool DSU::connected(int u, int v) {
    return find(u) == find(v);
}

int DSU::getComponentSize(int u) {
    int root = find(u);
    return setSize[root];
}

int DSU::getComponentCount() const {
    return numComponents;
}

std::unordered_map<int, std::vector<int>> DSU::getAllComponents() const {
    std::unordered_map<int, std::vector<int>> components;
    // We make a mutable copy of parent keys to do find with path compression
    for (const auto& [node, p] : parent) {
        // Find root (without altering const map if needed, or by finding parent chain)
        int curr = node;
        auto it = parent.find(curr);
        while (it != parent.end() && it->second != curr) {
            curr = it->second;
            it = parent.find(curr);
        }
        components[curr].push_back(node);
    }
    return components;
}

void DSU::clear() {
    parent.clear();
    rank.clear();
    setSize.clear();
    numComponents = 0;
}
