#include "../include/PriorityRanking.h"
#include <algorithm>
#include <queue>

std::vector<RecommendationCandidate> PriorityRanking::getTopK(
    const std::vector<RecommendationCandidate>& candidates,
    size_t k
) {
    if (candidates.empty() || k == 0) return {};

    // C++ Max Priority Queue (Max-Heap)
    std::priority_queue<RecommendationCandidate> maxHeap(candidates.begin(), candidates.end());

    std::vector<RecommendationCandidate> topKResults;
    topKResults.reserve(std::min(k, candidates.size()));

    while (!maxHeap.empty() && topKResults.size() < k) {
        topKResults.push_back(maxHeap.top());
        maxHeap.pop();
    }

    return topKResults;
}

std::vector<RecommendationCandidate> PriorityRanking::rankAll(
    const std::vector<RecommendationCandidate>& candidates
) {
    std::priority_queue<RecommendationCandidate> maxHeap(candidates.begin(), candidates.end());
    std::vector<RecommendationCandidate> ranked;
    ranked.reserve(candidates.size());

    while (!maxHeap.empty()) {
        ranked.push_back(maxHeap.top());
        maxHeap.pop();
    }
    return ranked;
}
