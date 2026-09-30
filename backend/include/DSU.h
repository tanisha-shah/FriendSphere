#pragma once

#include <vector>
#include <unordered_map>

class DSU {
private:
    std::unordered_map<int, int> parent;
    std::unordered_map<int, int> rank;
    std::unordered_map<int, int> setSize;
    int numComponents{0};

public:
    DSU() = default;

    void addElement(int u);
    int find(int u);
    bool unite(int u, int v);
    bool connected(int u, int v);
    int getComponentSize(int u);
    int getComponentCount() const;

    // Returns a map of rootLeader -> list of member user IDs
    std::unordered_map<int, std::vector<int>> getAllComponents() const;

    void clear();
};
