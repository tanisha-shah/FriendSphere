#pragma once

#include "User.h"
#include <vector>
#include <string>
#include <unordered_set>

class Similarity {
public:
    // Calculates Jaccard similarity between two sets of strings (interests / skills): |A ∩ B| / |A ∪ B|
    static double jaccardSimilarity(const std::unordered_set<std::string>& setA,
                                    const std::unordered_set<std::string>& setB);

    // Overload for vector of strings
    static double jaccardSimilarity(const std::vector<std::string>& vecA,
                                    const std::vector<std::string>& vecB);

    // Calculates Cosine similarity between two numerical feature vectors: (A · B) / (||A|| * ||B||)
    static double cosineSimilarity(const std::vector<double>& vecA,
                                   const std::vector<double>& vecB);

    // Calculates common intersection elements
    static std::vector<std::string> getCommonInterests(const User& u1, const User& u2);

    // Calculates union elements
    static std::vector<std::string> getUnionInterests(const User& u1, const User& u2);

    // Generates high-dimensional binary/weighted vector of interests based on global interest vocabulary
    static std::vector<double> buildInterestVector(const User& user,
                                                  const std::vector<std::string>& allInterestKeys);
};

// Explicit alias matching DAA assignment requirements
using SimilarityEngine = Similarity;
