#pragma once

#include "PriorityRanking.h"
#include "Post.h"
#include "User.h"
#include <vector>
#include <functional>
#include <string>

class Sorting {
public:
    // Generic Merge Sort implementation with custom comparator: O(N log N) time, O(N) space, stable
    template <typename T, typename Compare>
    static void mergeSort(std::vector<T>& arr, int left, int right, Compare comp) {
        if (left >= right) return;
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid, comp);
        mergeSort(arr, mid + 1, right, comp);
        merge(arr, left, mid, right, comp);
    }

    template <typename T, typename Compare>
    static void sort(std::vector<T>& arr, Compare comp) {
        if (arr.empty()) return;
        mergeSort(arr, 0, static_cast<int>(arr.size()) - 1, comp);
    }

    // Specialized Merge Sort for Recommendation Candidates
    static void sortCandidates(std::vector<RecommendationCandidate>& candidates);

    // Specialized Merge Sort for Feed Posts (by computed relevance score, likes, timestamp)
    static void sortPostsByRelevance(std::vector<Post>& posts);

    // Specialized Merge Sort for Users (by activity score, ID, or Username)
    static void sortUsersByActivity(std::vector<User>& users);
    static void sortUsersById(std::vector<User>& users);
    static void sortUsersByUsername(std::vector<User>& users);

private:
    template <typename T, typename Compare>
    static void merge(std::vector<T>& arr, int left, int mid, int right, Compare comp) {
        std::vector<T> leftArr(arr.begin() + left, arr.begin() + mid + 1);
        std::vector<T> rightArr(arr.begin() + mid + 1, arr.begin() + right + 1);

        size_t i = 0, j = 0;
        int k = left;

        while (i < leftArr.size() && j < rightArr.size()) {
            if (comp(leftArr[i], rightArr[j])) {
                arr[k++] = leftArr[i++];
            } else {
                arr[k++] = rightArr[j++];
            }
        }

        while (i < leftArr.size()) {
            arr[k++] = leftArr[i++];
        }
        while (j < rightArr.size()) {
            arr[k++] = rightArr[j++];
        }
    }
};

// Explicit alias matching DAA assignment requirements
using MergeSorter = Sorting;
