#pragma once

#include "User.h"
#include <vector>
#include <string>
#include <queue>
#include <nlohmann/json.hpp>

struct ScoringWeights {
    double wMutual{0.35};     // 35%
    double wJaccard{0.20};    // 20%
    double wCosine{0.20};     // 20%
    double wDistance{0.10};   // 10%
    double wCollege{0.10};    // 10%
    double wCommunity{0.05};  // 5%

    nlohmann::json toJson() const {
        return nlohmann::json{
            {"wMutual", wMutual},
            {"wJaccard", wJaccard},
            {"wCosine", wCosine},
            {"wDistance", wDistance},
            {"wCollege", wCollege},
            {"wCommunity", wCommunity}
        };
    }

    static ScoringWeights fromJson(const nlohmann::json& j) {
        ScoringWeights w;
        w.wMutual = j.value("wMutual", 0.35);
        w.wJaccard = j.value("wJaccard", 0.20);
        w.wCosine = j.value("wCosine", 0.20);
        w.wDistance = j.value("wDistance", 0.10);
        w.wCollege = j.value("wCollege", 0.10);
        w.wCommunity = j.value("wCommunity", 0.05);
        return w;
    }
};

struct RecommendationCandidate {
    int userId{0};
    std::string name;
    int mutualFriends{0};
    double jaccardSimilarity{0.0};
    double cosineSimilarity{0.0};
    int connectionDistance{2};
    bool sameCollege{false};
    std::string collegeName;
    bool sharedCommunity{false};
    std::string communityName;
    double score{0.0};
    double recommendationScore{0.0};
    int interestMatch{0};       // Percentage e.g. 72%
    int profileMatch{0};        // Percentage e.g. 84%
    std::vector<std::string> reasons;
    std::vector<std::string> algorithms;

    // Detailed scores for breakdown & visualization
    double finalScore{0.0};
    double graphProximityScore{0.0};   // From BFS degrees / mutual friends
    double interestJaccardScore{0.0};  // Shared interest Jaccard
    double vectorCosineScore{0.0};     // High-dimensional Cosine
    double communityAffinityScore{0.0};// Shared communities & DSU cluster
    double activityScore{0.0};         // User engagement weight
    int mutualFriendsCount{0};
    std::vector<int> mutualFriendIds;
    std::vector<std::string> sharedInterests;
    std::string primaryReason;         // Explainable AI text
    std::vector<std::string> detailedReasons;

    // Greater operator for Min-Heap top-K maintenance
    bool operator>(const RecommendationCandidate& other) const {
        return score > other.score;
    }

    // Less operator for Max-Heap
    bool operator<(const RecommendationCandidate& other) const {
        return score < other.score;
    }

    nlohmann::json toJson() const {
        return nlohmann::json{
            {"userId", userId},
            {"name", name},
            {"mutualFriends", mutualFriends},
            {"jaccardSimilarity", jaccardSimilarity},
            {"cosineSimilarity", cosineSimilarity},
            {"connectionDistance", connectionDistance},
            {"sameCollege", sameCollege},
            {"collegeName", collegeName},
            {"sharedCommunity", sharedCommunity},
            {"communityName", communityName},
            {"score", score},
            {"recommendationScore", recommendationScore},
            {"interestMatch", interestMatch},
            {"profileMatch", profileMatch},
            {"reasons", reasons},
            {"algorithms", algorithms},
            {"finalScore", finalScore},
            {"graphProximityScore", graphProximityScore},
            {"interestJaccardScore", interestJaccardScore},
            {"vectorCosineScore", vectorCosineScore},
            {"communityAffinityScore", communityAffinityScore},
            {"activityScore", activityScore},
            {"mutualFriendsCount", mutualFriendsCount},
            {"mutualFriendIds", mutualFriendIds},
            {"sharedInterests", sharedInterests},
            {"primaryReason", primaryReason},
            {"detailedReasons", detailedReasons}
        };
    }
};

class PriorityRanking {
public:
    // Uses a Max-Heap priority queue to extract top-K candidates in O(N + K log N) time
    static std::vector<RecommendationCandidate> getTopK(
        const std::vector<RecommendationCandidate>& candidates,
        size_t k
    );

    // Max-Heap sorting of candidates
    static std::vector<RecommendationCandidate> rankAll(
        const std::vector<RecommendationCandidate>& candidates
    );
};
