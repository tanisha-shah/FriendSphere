#include "../include/Similarity.h"
#include <cmath>
#include <algorithm>

double Similarity::jaccardSimilarity(const std::unordered_set<std::string>& setA,
                                     const std::unordered_set<std::string>& setB) {
    if (setA.empty() && setB.empty()) return 0.0;

    int intersectionCount = 0;
    for (const auto& item : setA) {
        if (setB.find(item) != setB.end()) {
            intersectionCount++;
        }
    }

    int unionCount = static_cast<int>(setA.size() + setB.size() - intersectionCount);
    if (unionCount == 0) return 0.0;

    return static_cast<double>(intersectionCount) / unionCount;
}

double Similarity::jaccardSimilarity(const std::vector<std::string>& vecA,
                                     const std::vector<std::string>& vecB) {
    std::unordered_set<std::string> setA(vecA.begin(), vecA.end());
    std::unordered_set<std::string> setB(vecB.begin(), vecB.end());
    return jaccardSimilarity(setA, setB);
}

double Similarity::cosineSimilarity(const std::vector<double>& vecA,
                                    const std::vector<double>& vecB) {
    if (vecA.size() != vecB.size() || vecA.empty()) return 0.0;

    double dotProduct = 0.0;
    double normA = 0.0;
    double normB = 0.0;

    for (size_t i = 0; i < vecA.size(); ++i) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA <= 1e-9 || normB <= 1e-9) return 0.0;

    return dotProduct / (std::sqrt(normA) * std::sqrt(normB));
}

std::vector<std::string> Similarity::getCommonInterests(const User& u1, const User& u2) {
    std::vector<std::string> common;
    for (const auto& interest : u1.interests) {
        if (u2.interestSet.find(interest) != u2.interestSet.end()) {
            common.push_back(interest);
        }
    }
    return common;
}

std::vector<std::string> Similarity::getUnionInterests(const User& u1, const User& u2) {
    std::unordered_set<std::string> unionSet(u1.interests.begin(), u1.interests.end());
    for (const auto& interest : u2.interests) {
        unionSet.insert(interest);
    }
    return std::vector<std::string>(unionSet.begin(), unionSet.end());
}

std::vector<double> Similarity::buildInterestVector(const User& user,
                                                    const std::vector<std::string>& allInterestKeys) {
    std::vector<double> vec(allInterestKeys.size(), 0.0);
    for (size_t i = 0; i < allInterestKeys.size(); ++i) {
        if (user.interestSet.find(allInterestKeys[i]) != user.interestSet.end()) {
            vec[i] = 1.0;
        }
    }
    return vec;
}
