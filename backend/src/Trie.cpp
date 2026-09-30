#include "../include/Trie.h"
#include <algorithm>
#include <cctype>

Trie::Trie() {
    root = std::make_unique<TrieNode>();
}

void Trie::insert(const std::string& key, int userId) {
    if (key.empty()) return;

    TrieNode* curr = root.get();
    for (char ch : key) {
        char lowerCh = static_cast<char>(std::tolower(static_cast<unsigned char>(ch)));
        if (curr->children.find(lowerCh) == curr->children.end()) {
            curr->children[lowerCh] = std::make_unique<TrieNode>();
        }
        curr = curr->children[lowerCh].get();
        if (userId > 0) {
            curr->userIds.insert(userId);
        }
    }
    curr->isEndOfWord = true;
    if (std::find(curr->storedWords.begin(), curr->storedWords.end(), key) == curr->storedWords.end()) {
        curr->storedWords.push_back(key);
    }
}

bool Trie::search(const std::string& word) const {
    if (word.empty()) return false;

    const TrieNode* curr = root.get();
    for (char ch : word) {
        char lowerCh = static_cast<char>(std::tolower(static_cast<unsigned char>(ch)));
        auto it = curr->children.find(lowerCh);
        if (it == curr->children.end()) {
            return false;
        }
        curr = it->second.get();
    }
    return curr->isEndOfWord;
}

bool Trie::startsWith(const std::string& prefix) const {
    if (prefix.empty()) return true;

    const TrieNode* curr = root.get();
    for (char ch : prefix) {
        char lowerCh = static_cast<char>(std::tolower(static_cast<unsigned char>(ch)));
        auto it = curr->children.find(lowerCh);
        if (it == curr->children.end()) {
            return false;
        }
        curr = it->second.get();
    }
    return true;
}

std::vector<std::string> Trie::getSuggestions(const std::string& prefix, int limit) const {
    if (prefix.empty()) return {};

    const TrieNode* curr = root.get();
    for (char ch : prefix) {
        char lowerCh = static_cast<char>(std::tolower(static_cast<unsigned char>(ch)));
        auto it = curr->children.find(lowerCh);
        if (it == curr->children.end()) {
            return {};
        }
        curr = it->second.get();
    }

    std::vector<std::string> suggestions;
    collectAllSuggestions(curr, suggestions, limit);
    return suggestions;
}

void Trie::collectAllSuggestions(const TrieNode* node, std::vector<std::string>& results, int limit) const {
    if (!node || static_cast<int>(results.size()) >= limit) return;

    for (const auto& w : node->storedWords) {
        if (std::find(results.begin(), results.end(), w) == results.end()) {
            results.push_back(w);
            if (static_cast<int>(results.size()) >= limit) return;
        }
    }

    for (const auto& [ch, childNode] : node->children) {
        collectAllSuggestions(childNode.get(), results, limit);
        if (static_cast<int>(results.size()) >= limit) return;
    }
}

std::vector<int> Trie::searchPrefix(const std::string& prefix, int limit) const {
    if (prefix.empty()) return {};

    const TrieNode* curr = root.get();
    for (char ch : prefix) {
        char lowerCh = static_cast<char>(std::tolower(static_cast<unsigned char>(ch)));
        auto it = curr->children.find(lowerCh);
        if (it == curr->children.end()) {
            return {}; // Prefix not found
        }
        curr = it->second.get();
    }

    std::unordered_set<int> matchedSet;
    collectAllUserIds(curr, matchedSet, limit);

    return std::vector<int>(matchedSet.begin(), matchedSet.end());
}

void Trie::collectAllUserIds(const TrieNode* node, std::unordered_set<int>& results, int limit) const {
    if (!node || static_cast<int>(results.size()) >= limit) return;

    for (int id : node->userIds) {
        results.insert(id);
        if (static_cast<int>(results.size()) >= limit) return;
    }

    for (const auto& [ch, childNode] : node->children) {
        collectAllUserIds(childNode.get(), results, limit);
        if (static_cast<int>(results.size()) >= limit) return;
    }
}

void Trie::clear() {
    root = std::make_unique<TrieNode>();
}
