#pragma once

#include "Graph.h"
#include "BFS.h"
#include "DFS.h"
#include "Dijkstra.h"
#include "DSU.h"
#include "Similarity.h"
#include "PriorityRanking.h"
#include "Sorting.h"
#include "Searching.h"
#include "Trie.h"
#include "KMeans.h"
#include "User.h"
#include "Post.h"

#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <string>
#include <nlohmann/json.hpp>

class RecommendationEngine {
private:
    Graph socialGraph;
    DSU socialDSU;
    Trie searchTrie;
    std::unordered_map<int, User> userMap;
    std::vector<User> userList;             // Kept sorted by ID for binary search
    std::vector<User> usersSortedByName;     // Kept sorted by Username for binary search
    std::vector<User> usersSortedByActivity; // Kept sorted for range search
    std::vector<std::string> allInterestKeys;
    std::vector<ClusterInfo> clusters;
    std::vector<FriendRequest> friendRequests;
    std::vector<Community> communities;
    std::vector<Post> posts;
    std::string dataDirPath;

    // Blocked users map: userId -> set of blocked user IDs
    std::unordered_map<int, std::unordered_set<int>> blockedUsers;

    // Rejected candidates map: userId -> set of dismissed candidate IDs
    std::unordered_map<int, std::unordered_set<int>> rejectedCandidates;

    // Configurable scoring weights:
    // Mutual Friends: 35%, Interest Jaccard: 20%, Cosine Similarity: 20%,
    // Social Distance: 10%, Same College: 10%, Shared Community: 5%
    ScoringWeights scoringWeights;

public:
    RecommendationEngine(const std::string& dataDir = "data");

    // Load and save data
    bool loadData();
    bool saveData();

    // Dynamic Graph & Friendship Mutation
    bool addFriendship(int u, int v, double weight = 1.0);
    bool removeFriendship(int u, int v);
    bool sendFriendRequest(int fromId, int toId);
    bool acceptFriendRequest(int requestId);
    bool rejectFriendRequest(int requestId);

    // Block & Dismiss functionality (Real Hash Set exclusion)
    bool blockUser(int userId, int targetId);
    bool unblockUser(int userId, int targetId);
    std::vector<int> getBlockedUsers(int userId) const;
    bool dismissCandidate(int userId, int candidateId);

    // Configurable scoring system
    void setScoringWeights(const ScoringWeights& weights) { scoringWeights = weights; }
    ScoringWeights getScoringWeights() const { return scoringWeights; }

    // Posts & Social Features
    bool createPost(int authorId, const std::string& content, const std::vector<std::string>& tags);
    bool likePost(int postId, int userId);
    bool addComment(int postId, int authorId, const std::string& content);
    bool updateUserProfile(const User& user);
    bool createUserProfile(const User& user);

    // 12 Core DAA Algorithmic Endpoints & Helpers
    // 1. BFS: Friends-of-friends, 1-hop, 2-hop, 3-hop, distance tiers
    nlohmann::json getBFSNetwork(int userId);

    // 2. DFS: Social network traversal order and structural bridges / triangles
    nlohmann::json getDFSNeworkExplore(int userId);

    // 3. Dijkstra: Shortest connection path between two users
    nlohmann::json getDijkstraShortestPathJSON(int fromId, int toId);

    // 4. Union-Find (DSU): Community detection & connected components
    nlohmann::json getDSUCommunitiesJSON();

    // 5 & 6. Similarity Engine: Jaccard & Cosine similarity with intersection/union
    nlohmann::json getSimilarityAnalysis(int userA, int userB);

    // 7. Priority Queue (Max-Heap): Multi-signal intelligent recommendations
    std::vector<RecommendationCandidate> getRecommendations(int userId, size_t topK = 10);
    nlohmann::json getRecommendationExplanation(int sourceUserId, int candidateUserId);

    // 8. Custom Merge Sort: Feed and candidates ranking
    std::vector<Post> getFeedForUser(int userId, int limit = 20);

    // 9. Binary Search: Sorted user lookup by username or ID
    nlohmann::json searchUsersBinary(const std::string& query);

    // 10. Trie (Prefix Tree): Autocomplete suggestions
    std::vector<std::string> getAutocompleteSuggestions(const std::string& prefix, int limit = 10);
    std::vector<User> searchUsers(const std::string& query, int limit = 10);

    // 11. K-Means Clustering
    std::vector<ClusterInfo> getKMeansClusters();

    // 12. Network Analytics & Centrality
    nlohmann::json getNetworkAnalytics();
    nlohmann::json getAllAlgorithmsBenchmark();

    // Traces & Visualizations
    DijkstraResult getSocialPathDijkstra(int sourceId, int targetId);
    std::vector<int> getShortestPathBFS(int sourceId, int targetId);
    std::vector<BFSStep> getBFSTraversalTrace(int startId, int maxDepth = 3);
    std::vector<DFSStep> getDFSTraversalTrace(int startId, int maxDepth = 4);
    std::vector<std::pair<int, int>> getSocialBridgesDFS();
    std::vector<std::vector<int>> getTrianglesDFS(int userId);
    nlohmann::json getSocialGraphVisualization(int centerUserId = 0, int radius = 2) const;

    // Queries
    const std::vector<User>& getAllUsers() const { return userList; }
    std::optional<User> getUserById(int userId) const;
    std::vector<User> getFriends(int userId) const;
    std::vector<User> getMutualFriends(int u, int v) const;
    std::vector<FriendRequest> getPendingRequestsForUser(int userId) const;
    std::vector<FriendRequest> getSentRequestsByUser(int userId) const;
    std::vector<Community> getAllCommunities() const;
    const std::vector<Post>& getAllPosts() const { return posts; }
    nlohmann::json getInterests() const;
    const Graph& getGraph() const { return socialGraph; }

private:
    void rebuildIndices();
    void buildTrie();
    void runKMeansClustering();
    void rebuildDSU();
};
