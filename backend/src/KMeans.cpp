#include "../include/KMeans.h"
#include "../include/Similarity.h"
#include <cmath>
#include <algorithm>
#include <random>
#include <numeric>

KMeans::KMeans(int clusters, int maxIter)
    : k(clusters), maxIterations(maxIter) {}

double KMeans::euclideanDistance(const std::vector<double>& a, const std::vector<double>& b) {
    double sum = 0.0;
    for (size_t i = 0; i < a.size() && i < b.size(); ++i) {
        double diff = a[i] - b[i];
        sum += diff * diff;
    }
    return std::sqrt(sum);
}

int KMeans::predict(const std::vector<double>& userVector, const std::vector<std::vector<double>>& centroids) {
    if (centroids.empty()) return 0;

    int bestCluster = 0;
    double bestDist = 1e18;

    for (size_t i = 0; i < centroids.size(); ++i) {
        double dist = euclideanDistance(userVector, centroids[i]);
        if (dist < bestDist) {
            bestDist = dist;
            bestCluster = static_cast<int>(i);
        }
    }
    return bestCluster;
}

std::vector<ClusterInfo> KMeans::fitPredict(
    const std::vector<User>& users,
    const std::vector<std::string>& allInterestKeys
) {
    if (users.empty() || allInterestKeys.empty()) return {};

    size_t n = users.size();
    size_t d = allInterestKeys.size();
    int actualK = std::min(k, static_cast<int>(n));

    // 1. Build feature vectors
    std::vector<std::vector<double>> features(n);
    for (size_t i = 0; i < n; ++i) {
        features[i] = Similarity::buildInterestVector(users[i], allInterestKeys);
    }

    // 2. K-Means++ Initialization
    std::vector<std::vector<double>> centroids(actualK, std::vector<double>(d, 0.0));
    std::mt19937 rng(42); // Deterministic seed for reproducible clusters

    centroids[0] = features[0]; // First centroid
    for (int c = 1; c < actualK; ++c) {
        std::vector<double> distSq(n, 0.0);
        double totalDistSq = 0.0;

        for (size_t i = 0; i < n; ++i) {
            double minDist = 1e18;
            for (int prevC = 0; prevC < c; ++prevC) {
                double dist = euclideanDistance(features[i], centroids[prevC]);
                minDist = std::min(minDist, dist);
            }
            distSq[i] = minDist * minDist;
            totalDistSq += distSq[i];
        }

        // Pick next centroid proportional to distSq
        std::uniform_real_distribution<double> dist(0.0, totalDistSq);
        double r = dist(rng);
        double cumulative = 0.0;
        size_t chosenIdx = 0;

        for (size_t i = 0; i < n; ++i) {
            cumulative += distSq[i];
            if (cumulative >= r) {
                chosenIdx = i;
                break;
            }
        }
        centroids[c] = features[chosenIdx];
    }

    // 3. Iterative Clustering
    std::vector<int> assignments(n, 0);

    for (int iter = 0; iter < maxIterations; ++iter) {
        bool changed = false;

        // Assignment step
        for (size_t i = 0; i < n; ++i) {
            int newCluster = predict(features[i], centroids);
            if (newCluster != assignments[i]) {
                assignments[i] = newCluster;
                changed = true;
            }
        }

        // Update centroids step
        std::vector<std::vector<double>> newCentroids(actualK, std::vector<double>(d, 0.0));
        std::vector<int> clusterCounts(actualK, 0);

        for (size_t i = 0; i < n; ++i) {
            int cluster = assignments[i];
            clusterCounts[cluster]++;
            for (size_t dim = 0; dim < d; ++dim) {
                newCentroids[cluster][dim] += features[i][dim];
            }
        }

        double maxShift = 0.0;
        for (int c = 0; c < actualK; ++c) {
            if (clusterCounts[c] > 0) {
                for (size_t dim = 0; dim < d; ++dim) {
                    newCentroids[c][dim] /= clusterCounts[c];
                }
                maxShift = std::max(maxShift, euclideanDistance(centroids[c], newCentroids[c]));
                centroids[c] = newCentroids[c];
            }
        }

        if (!changed || maxShift < tolerance) {
            break;
        }
    }

    // 4. Construct ClusterInfo results with dominant interests & labels
    std::vector<ClusterInfo> results(actualK);
    for (int c = 0; c < actualK; ++c) {
        results[c].clusterId = c;
        results[c].centroid = centroids[c];

        // Find dominant interests in this centroid
        std::vector<std::pair<double, std::string>> interestWeights;
        for (size_t dim = 0; dim < d; ++dim) {
            if (centroids[c][dim] > 0.05) {
                interestWeights.push_back({centroids[c][dim], allInterestKeys[dim]});
            }
        }
        std::sort(interestWeights.rbegin(), interestWeights.rend());

        for (size_t w = 0; w < std::min<size_t>(3, interestWeights.size()); ++w) {
            results[c].dominantInterests.push_back(interestWeights[w].second);
        }

        // Generate semantic cluster label
        if (!results[c].dominantInterests.empty()) {
            std::string label = "Circle: ";
            for (size_t idx = 0; idx < results[c].dominantInterests.size(); ++idx) {
                if (idx > 0) label += " & ";
                label += results[c].dominantInterests[idx];
            }
            results[c].clusterLabel = label;
        } else {
            results[c].clusterLabel = "General Circle #" + std::to_string(c + 1);
        }
    }

    for (size_t i = 0; i < n; ++i) {
        results[assignments[i]].memberUserIds.push_back(users[i].id);
    }

    return results;
}
