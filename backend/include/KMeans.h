#pragma once

#include "User.h"
#include <vector>
#include <string>
#include <unordered_map>
#include <nlohmann/json.hpp>

struct ClusterInfo {
    int clusterId{0};
    std::string clusterLabel;
    std::vector<int> memberUserIds;
    std::vector<double> centroid;
    std::vector<std::string> dominantInterests;

    nlohmann::json toJson() const {
        return nlohmann::json{
            {"clusterId", clusterId},
            {"clusterLabel", clusterLabel},
            {"memberUserIds", memberUserIds},
            {"dominantInterests", dominantInterests}
        };
    }
};

class KMeans {
private:
    int k{4};
    int maxIterations{100};
    double tolerance{1e-4};

    static double euclideanDistance(const std::vector<double>& a, const std::vector<double>& b);

public:
    KMeans(int clusters = 4, int maxIter = 100);

    // Runs K-Means++ clustering on user vectors
    std::vector<ClusterInfo> fitPredict(
        const std::vector<User>& users,
        const std::vector<std::string>& allInterestKeys
    );

    // Predicts the cluster for a single user vector
    static int predict(const std::vector<double>& userVector, const std::vector<std::vector<double>>& centroids);
};
