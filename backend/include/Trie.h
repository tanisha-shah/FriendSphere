#pragma once

#include <string>
#include <vector>
#include <unordered_map>
#include <memory>
#include <unordered_set>

struct TrieNode {
    std::unordered_map<char, std::unique_ptr<TrieNode>> children;
    bool isEndOfWord{false};
    std::unordered_set<int> userIds; // IDs associated with this exact prefix/word
    std::vector<std::string> storedWords; // Words stored at or through this node for quick prefix suggestions
};

struct SearchResultItem {
    int userId;
    std::string matchedToken;
    std::string matchType; // "username", "name", "skill", "interest"
};

class Trie {
private:
    std::unique_ptr<TrieNode> root;

    void collectAllUserIds(const TrieNode* node, std::unordered_set<int>& results, int limit) const;
    void collectAllSuggestions(const TrieNode* node, std::vector<std::string>& results, int limit) const;

public:
    Trie();
    ~Trie() = default;

    // 1. insert: Inserts a word/token mapped to a specific userId: O(L)
    void insert(const std::string& key, int userId = 0);

    // 2. search: Checks if an exact word exists in the Trie: O(L)
    bool search(const std::string& word) const;

    // 3. startsWith: Checks if any prefix exists in the Trie: O(L)
    bool startsWith(const std::string& prefix) const;

    // 4. getSuggestions: Returns auto-complete word suggestions for a prefix: O(L + K)
    std::vector<std::string> getSuggestions(const std::string& prefix, int limit = 10) const;

    // Searches for prefix and returns all matched user IDs up to limit: O(L + K)
    std::vector<int> searchPrefix(const std::string& prefix, int limit = 10) const;

    // Backward compatibility alias for contains
    bool contains(const std::string& word) const { return search(word); }

    // Clears the entire Trie
    void clear();
};
