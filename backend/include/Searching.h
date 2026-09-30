#pragma once

#include "User.h"
#include "Post.h"
#include "PriorityRanking.h"
#include <vector>
#include <optional>
#include <string>
#include <nlohmann/json.hpp>

struct BinarySearchStep {
    int stepNumber;
    int left;
    int right;
    int mid;
    std::string midVal;
    std::string comparison; // "target < mid (search left)", "target > mid (search right)", "match found"
};

struct BinarySearchResult {
    bool found{false};
    int foundIndex{-1};
    std::optional<User> user;
    std::vector<BinarySearchStep> steps;
    int comparisonsCount{0};
};

class Searching {
public:
    // Binary search on sorted user vector by user ID: O(log N)
    static std::optional<User> binarySearchUserById(const std::vector<User>& sortedUsers, int targetId);

    // Binary search index of user in sorted vector by ID: O(log N)
    static int binarySearchUserIndex(const std::vector<User>& sortedUsers, int targetId);

    // Binary search by Username on vector of users sorted alphabetically by username: O(log N)
    static BinarySearchResult binarySearchByUsername(const std::vector<User>& usersSortedByName, const std::string& username);

    // Binary search with step-by-step trace for ID
    static BinarySearchResult binarySearchByIdWithTrace(const std::vector<User>& sortedUsers, int targetId);

    // Binary search to find lower bound of users with activityScore >= minScore
    static int lowerBoundActivity(const std::vector<User>& usersSortedByActivityDesc, double minScore);

    // Binary search on sorted recommendation candidates by finalScore
    static int lowerBoundCandidateScore(const std::vector<RecommendationCandidate>& candidatesSortedDesc, double minScore);

    // Hash Set / Hash Map based instant lookup helpers
    static bool isFriend(const std::unordered_set<int>& directFriends, int targetUserId);
};

// Explicit alias matching DAA assignment requirements
using BinarySearcher = Searching;
