#include "../include/Searching.h"
#include <algorithm>
#include <cctype>

static std::string toLower(std::string str) {
    std::transform(str.begin(), str.end(), str.begin(), [](unsigned char c){ return std::tolower(c); });
    return str;
}

std::optional<User> Searching::binarySearchUserById(const std::vector<User>& sortedUsers, int targetId) {
    int index = binarySearchUserIndex(sortedUsers, targetId);
    if (index != -1) {
        return sortedUsers[index];
    }
    return std::nullopt;
}

int Searching::binarySearchUserIndex(const std::vector<User>& sortedUsers, int targetId) {
    int left = 0;
    int right = static_cast<int>(sortedUsers.size()) - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (sortedUsers[mid].id == targetId) {
            return mid;
        } else if (sortedUsers[mid].id < targetId) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}

BinarySearchResult Searching::binarySearchByUsername(const std::vector<User>& usersSortedByName, const std::string& username) {
    BinarySearchResult res;
    int left = 0;
    int right = static_cast<int>(usersSortedByName.size()) - 1;
    std::string targetLower = toLower(username);
    int stepNum = 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;
        res.comparisonsCount++;
        std::string currentLower = toLower(usersSortedByName[mid].username);

        BinarySearchStep step;
        step.stepNumber = stepNum++;
        step.left = left;
        step.right = right;
        step.mid = mid;
        step.midVal = usersSortedByName[mid].username;

        if (currentLower == targetLower) {
            step.comparison = "Match found! target == mid (" + usersSortedByName[mid].username + ")";
            res.steps.push_back(step);
            res.found = true;
            res.foundIndex = mid;
            res.user = usersSortedByName[mid];
            return res;
        } else if (targetLower < currentLower) {
            step.comparison = "target '" + targetLower + "' < '" + currentLower + "' -> search left half [L=" + std::to_string(left) + ", R=" + std::to_string(mid - 1) + "]";
            res.steps.push_back(step);
            right = mid - 1;
        } else {
            step.comparison = "target '" + targetLower + "' > '" + currentLower + "' -> search right half [L=" + std::to_string(mid + 1) + ", R=" + std::to_string(right) + "]";
            res.steps.push_back(step);
            left = mid + 1;
        }
    }

    res.found = false;
    res.foundIndex = -1;
    return res;
}

BinarySearchResult Searching::binarySearchByIdWithTrace(const std::vector<User>& sortedUsers, int targetId) {
    BinarySearchResult res;
    int left = 0;
    int right = static_cast<int>(sortedUsers.size()) - 1;
    int stepNum = 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;
        res.comparisonsCount++;

        BinarySearchStep step;
        step.stepNumber = stepNum++;
        step.left = left;
        step.right = right;
        step.mid = mid;
        step.midVal = std::to_string(sortedUsers[mid].id) + " (" + sortedUsers[mid].name + ")";

        if (sortedUsers[mid].id == targetId) {
            step.comparison = "Match found! ID " + std::to_string(targetId) + " at index " + std::to_string(mid);
            res.steps.push_back(step);
            res.found = true;
            res.foundIndex = mid;
            res.user = sortedUsers[mid];
            return res;
        } else if (targetId < sortedUsers[mid].id) {
            step.comparison = "target ID " + std::to_string(targetId) + " < " + std::to_string(sortedUsers[mid].id) + " -> search left half";
            res.steps.push_back(step);
            right = mid - 1;
        } else {
            step.comparison = "target ID " + std::to_string(targetId) + " > " + std::to_string(sortedUsers[mid].id) + " -> search right half";
            res.steps.push_back(step);
            left = mid + 1;
        }
    }

    res.found = false;
    res.foundIndex = -1;
    return res;
}

int Searching::lowerBoundActivity(const std::vector<User>& usersSortedByActivityDesc, double minScore) {
    int left = 0;
    int right = static_cast<int>(usersSortedByActivityDesc.size());

    while (left < right) {
        int mid = left + (right - left) / 2;
        if (usersSortedByActivityDesc[mid].activityScore >= minScore) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left; // Count of users with activity >= minScore
}

int Searching::lowerBoundCandidateScore(const std::vector<RecommendationCandidate>& candidatesSortedDesc, double minScore) {
    int left = 0;
    int right = static_cast<int>(candidatesSortedDesc.size());

    while (left < right) {
        int mid = left + (right - left) / 2;
        if (candidatesSortedDesc[mid].finalScore >= minScore) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
}

bool Searching::isFriend(const std::unordered_set<int>& directFriends, int targetUserId) {
    return directFriends.find(targetUserId) != directFriends.end();
}
