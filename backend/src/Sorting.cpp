#include "../include/Sorting.h"
#include <algorithm>
#include <cctype>

void Sorting::sortCandidates(std::vector<RecommendationCandidate>& candidates) {
    sort(candidates, [](const RecommendationCandidate& a, const RecommendationCandidate& b) {
        if (std::abs(a.finalScore - b.finalScore) > 1e-5) {
            return a.finalScore > b.finalScore; // Higher score first
        }
        if (a.mutualFriendsCount != b.mutualFriendsCount) {
            return a.mutualFriendsCount > b.mutualFriendsCount; // More mutual friends
        }
        return a.activityScore > b.activityScore; // Higher activity
    });
}

void Sorting::sortPostsByRelevance(std::vector<Post>& posts) {
    sort(posts, [](const Post& a, const Post& b) {
        if (std::abs(a.computedScore - b.computedScore) > 1e-5) {
            return a.computedScore > b.computedScore;
        }
        if (a.likes != b.likes) {
            return a.likes > b.likes;
        }
        return a.id > b.id;
    });
}

void Sorting::sortUsersByActivity(std::vector<User>& users) {
    sort(users, [](const User& a, const User& b) {
        return a.activityScore > b.activityScore;
    });
}

void Sorting::sortUsersById(std::vector<User>& users) {
    sort(users, [](const User& a, const User& b) {
        return a.id < b.id;
    });
}

void Sorting::sortUsersByUsername(std::vector<User>& users) {
    sort(users, [](const User& a, const User& b) {
        std::string nameA = a.username;
        std::string nameB = b.username;
        std::transform(nameA.begin(), nameA.end(), nameA.begin(), [](unsigned char c){ return std::tolower(c); });
        std::transform(nameB.begin(), nameB.end(), nameB.begin(), [](unsigned char c){ return std::tolower(c); });
        return nameA < nameB;
    });
}
