#include "../include/RecommendationEngine.h"
#include <fstream>
#include <iostream>
#include <sstream>
#include <iomanip>
#include <algorithm>
#include <chrono>
#include <cmath>

RecommendationEngine::RecommendationEngine(const std::string& dataDir)
    : dataDirPath(dataDir) {
    loadData();
}

bool RecommendationEngine::loadData() {
    // 1. Load users
    try {
        std::ifstream file(dataDirPath + "/users.json");
        if (file.is_open()) {
            nlohmann::json j;
            file >> j;
            userList.clear();
            userMap.clear();
            for (const auto& uj : j) {
                User u = User::fromJson(uj);
                userList.push_back(u);
                userMap[u.id] = u;
            }
        }
    } catch (const std::exception& e) {
        std::cerr << "Error reading users: " << e.what() << std::endl;
        return false;
    }

    // 2. Load friendships into Graph
    try {
        std::ifstream file(dataDirPath + "/friendships.json");
        if (file.is_open()) {
            nlohmann::json j;
            file >> j;
            socialGraph.clear();
            for (const auto& u : userList) {
                socialGraph.addNode(u.id);
            }
            for (const auto& fj : j) {
                int u1 = fj.value("user1Id", 0);
                int u2 = fj.value("user2Id", 0);
                double weight = fj.value("weight", 1.0);
                std::string createdAt = fj.value("createdAt", "2024-01-01");
                socialGraph.addEdge(u1, u2, weight, createdAt);
            }
        }
    } catch (const std::exception& e) {
        std::cerr << "Error reading friendships: " << e.what() << std::endl;
    }

    // 3. Load interests dictionary
    try {
        std::ifstream file(dataDirPath + "/interests.json");
        if (file.is_open()) {
            nlohmann::json j;
            file >> j;
            allInterestKeys.clear();
            nlohmann::json items = j;
            if (j.is_object() && j.contains("interests") && j["interests"].is_array()) {
                items = j["interests"];
            }
            if (items.is_array()) {
                for (const auto& item : items) {
                    if (item.is_object() && item.contains("id") && item["id"].is_string()) {
                        allInterestKeys.push_back(item["id"].get<std::string>());
                    } else if (item.is_string()) {
                        allInterestKeys.push_back(item.get<std::string>());
                    }
                }
            }
        }
    } catch (const std::exception& e) {
        std::cerr << "Error reading interests: " << e.what() << std::endl;
    }

    // Fallback: collect all unique interests across users if allInterestKeys is empty
    if (allInterestKeys.empty()) {
        std::unordered_set<std::string> uSet;
        for (const auto& u : userList) {
            for (const auto& interest : u.interests) {
                uSet.insert(interest);
            }
        }
        allInterestKeys.assign(uSet.begin(), uSet.end());
    }

    // 4. Load friend requests
    try {
        std::ifstream file(dataDirPath + "/requests.json");
        if (file.is_open()) {
            nlohmann::json j;
            file >> j;
            friendRequests.clear();
            for (const auto& rj : j) {
                friendRequests.push_back(FriendRequest::fromJson(rj));
            }
        }
    } catch (const std::exception& e) {
        std::cerr << "Error reading requests: " << e.what() << std::endl;
    }

    // 5. Load communities
    try {
        std::ifstream file(dataDirPath + "/communities.json");
        if (file.is_open()) {
            nlohmann::json j;
            file >> j;
            communities.clear();
            for (const auto& cj : j) {
                communities.push_back(Community::fromJson(cj));
            }
        }
    } catch (const std::exception& e) {
        std::cerr << "Error reading communities: " << e.what() << std::endl;
    }

    // 6. Load posts
    try {
        std::ifstream file(dataDirPath + "/posts.json");
        if (file.is_open()) {
            nlohmann::json j;
            file >> j;
            posts.clear();
            for (const auto& pj : j) {
                posts.push_back(Post::fromJson(pj));
            }
        }
    } catch (const std::exception& e) {
        std::cerr << "Error reading posts: " << e.what() << std::endl;
    }

    // 7. Load blocked users if exists
    try {
        std::ifstream file(dataDirPath + "/blocked.json");
        if (file.is_open()) {
            nlohmann::json j;
            file >> j;
            blockedUsers.clear();
            for (auto it = j.begin(); it != j.end(); ++it) {
                int uid = std::stoi(it.key());
                for (int target : it.value()) {
                    blockedUsers[uid].insert(target);
                }
            }
        }
    } catch (...) {}

    rebuildIndices();
    return true;
}

bool RecommendationEngine::saveData() {
    try {
        // Save users
        {
            nlohmann::json j = nlohmann::json::array();
            for (const auto& u : userList) {
                j.push_back(u.toJson());
            }
            std::ofstream file(dataDirPath + "/users.json");
            file << j.dump(2);
        }

        // Save friendships
        {
            nlohmann::json j = nlohmann::json::array();
            for (const auto& e : socialGraph.getAllEdges()) {
                j.push_back({
                    {"user1Id", e.u},
                    {"user2Id", e.v},
                    {"weight", e.weight},
                    {"createdAt", e.createdAt}
                });
            }
            std::ofstream file(dataDirPath + "/friendships.json");
            file << j.dump(2);
        }

        // Save requests
        {
            nlohmann::json j = nlohmann::json::array();
            for (const auto& r : friendRequests) {
                j.push_back(r.toJson());
            }
            std::ofstream file(dataDirPath + "/requests.json");
            file << j.dump(2);
        }

        // Save posts
        {
            nlohmann::json j = nlohmann::json::array();
            for (const auto& p : posts) {
                j.push_back(p.toJson());
            }
            std::ofstream file(dataDirPath + "/posts.json");
            file << j.dump(2);
        }

        // Save blocked users
        {
            nlohmann::json j = nlohmann::json::object();
            for (const auto& [uid, set] : blockedUsers) {
                nlohmann::json arr = nlohmann::json::array();
                for (int b : set) arr.push_back(b);
                j[std::to_string(uid)] = arr;
            }
            std::ofstream file(dataDirPath + "/blocked.json");
            file << j.dump(2);
        }
        return true;
    } catch (const std::exception& e) {
        std::cerr << "Error saving data: " << e.what() << std::endl;
        return false;
    }
}

void RecommendationEngine::rebuildIndices() {
    userMap.clear();
    for (const auto& u : userList) {
        userMap[u.id] = u;
    }

    // MergeSort userList by ID for binary searching
    Sorting::sortUsersById(userList);

    // Build users sorted alphabetically by username
    usersSortedByName = userList;
    Sorting::sortUsersByUsername(usersSortedByName);

    // Build users sorted by activity
    usersSortedByActivity = userList;
    Sorting::sortUsersByActivity(usersSortedByActivity);

    buildTrie();
    rebuildDSU();
    runKMeansClustering();
}

void RecommendationEngine::buildTrie() {
    searchTrie.clear();
    for (const auto& u : userList) {
        searchTrie.insert(u.username, u.id);
        searchTrie.insert(u.name, u.id);
        for (const auto& interest : u.interests) {
            searchTrie.insert(interest, u.id);
        }
        for (const auto& skill : u.skills) {
            searchTrie.insert(skill, u.id);
        }
    }
}

void RecommendationEngine::rebuildDSU() {
    socialDSU.clear();
    for (const auto& u : userList) {
        socialDSU.addElement(u.id);
    }
    for (const auto& edge : socialGraph.getAllEdges()) {
        socialDSU.unite(edge.u, edge.v);
    }
}

void RecommendationEngine::runKMeansClustering() {
    if (userList.empty() || allInterestKeys.empty()) return;

    KMeans clusterer(4, 25);
    clusters = clusterer.fitPredict(userList, allInterestKeys);
}

std::optional<User> RecommendationEngine::getUserById(int userId) const {
    auto it = userMap.find(userId);
    if (it != userMap.end()) {
        return it->second;
    }
    return std::nullopt;
}

std::vector<User> RecommendationEngine::getFriends(int userId) const {
    std::vector<User> friends;
    auto neighborIds = socialGraph.getNeighborIds(userId);
    for (int nid : neighborIds) {
        auto optUser = getUserById(nid);
        if (optUser.has_value()) {
            friends.push_back(*optUser);
        }
    }
    return friends;
}

std::vector<User> RecommendationEngine::getMutualFriends(int u, int v) const {
    std::vector<User> mutual;
    auto mutualIds = BFS::getMutualFriends(socialGraph, u, v);
    for (int mid : mutualIds) {
        auto optUser = getUserById(mid);
        if (optUser.has_value()) {
            mutual.push_back(*optUser);
        }
    }
    return mutual;
}

// 7. Priority Queue (Max-Heap) Top-10 Intelligent Recommendations
std::vector<RecommendationCandidate> RecommendationEngine::getRecommendations(int userId, size_t topK) {
    auto optSource = getUserById(userId);
    if (!optSource.has_value()) return {};
    const User& sourceUser = *optSource;

    // 1. Filter out direct friends
    auto directFriendIds = socialGraph.getNeighborIds(userId);
    std::unordered_set<int> directFriendSet(directFriendIds.begin(), directFriendIds.end());

    // 2. Filter out pending requests
    std::unordered_set<int> pendingSet;
    for (const auto& req : friendRequests) {
        if (req.status == "pending") {
            if (req.fromUserId == userId) pendingSet.insert(req.toUserId);
            if (req.toUserId == userId) pendingSet.insert(req.fromUserId);
        }
    }

    // 3. Filter out blocked users
    std::unordered_set<int> myBlocked;
    if (blockedUsers.find(userId) != blockedUsers.end()) {
        myBlocked = blockedUsers[userId];
    }

    // 4. Filter out dismissed candidates
    std::unordered_set<int> myDismissed;
    if (rejectedCandidates.find(userId) != rejectedCandidates.end()) {
        myDismissed = rejectedCandidates[userId];
    }

    // Source feature vector for Cosine Profile Similarity
    auto sourceVec = Similarity::buildInterestVector(sourceUser, allInterestKeys);

    // BFS distance map from source (1-hop, 2-hop, 3-hop, etc.)
    auto bfsDistances = BFS::getNodesWithinDistance(socialGraph, userId, 6);

    std::vector<RecommendationCandidate> rawCandidates;

    for (const auto& candidateUser : userList) {
        int candidateId = candidateUser.id;

        // Step 2 from prompt: Filter out invalid candidates
        if (candidateId == userId) continue;                                      // Current user
        if (directFriendSet.find(candidateId) != directFriendSet.end()) continue; // Current friends
        if (myBlocked.find(candidateId) != myBlocked.end()) continue;             // Blocked users
        if (myDismissed.find(candidateId) != myDismissed.end()) continue;         // Rejected users
        if (pendingSet.find(candidateId) != pendingSet.end()) continue;           // Pending requests

        // Check if candidate blocked source user
        if (blockedUsers.find(candidateId) != blockedUsers.end() &&
            blockedUsers[candidateId].find(userId) != blockedUsers[candidateId].end()) {
            continue;
        }

        RecommendationCandidate cand;
        cand.userId = candidateId;
        cand.name = candidateUser.name;
        cand.collegeName = candidateUser.college;

        // 3. Count Mutual Friends (via BFS)
        cand.mutualFriendIds = BFS::getMutualFriends(socialGraph, userId, candidateId);
        cand.mutualFriendsCount = static_cast<int>(cand.mutualFriendIds.size());
        cand.mutualFriends = cand.mutualFriendsCount;

        // Mutual Score: normalized (3+ mutual friends gives full 1.0)
        double mutualScore = (cand.mutualFriends > 0) ? std::min(1.0, (double)cand.mutualFriends / 3.0) : 0.0;

        // 4. Interest Jaccard Similarity: |A ∩ B| / |A ∪ B|
        double jaccard = Similarity::jaccardSimilarity(sourceUser.interestSet, candidateUser.interestSet);
        cand.jaccardSimilarity = std::round(jaccard * 100.0) / 100.0;
        cand.interestJaccardScore = cand.jaccardSimilarity;
        cand.interestMatch = static_cast<int>(std::round(jaccard * 100.0));
        cand.sharedInterests = Similarity::getCommonInterests(sourceUser, candidateUser);

        // 5. Cosine Similarity between profile vectors: (A · B) / (||A|| * ||B||)
        auto candidateVec = Similarity::buildInterestVector(candidateUser, allInterestKeys);
        double cosine = Similarity::cosineSimilarity(sourceVec, candidateVec);
        cand.cosineSimilarity = std::round(cosine * 100.0) / 100.0;
        cand.vectorCosineScore = cand.cosineSimilarity;
        cand.profileMatch = static_cast<int>(std::round(cosine * 100.0));

        // 6. Social Connection Distance using Dijkstra / BFS
        int hops = 99;
        if (bfsDistances.find(candidateId) != bfsDistances.end()) {
            hops = bfsDistances[candidateId];
        } else {
            auto dijkstraRes = Dijkstra::getShortestPath(socialGraph, userId, candidateId);
            if (dijkstraRes.reachable && !dijkstraRes.path.empty()) {
                hops = static_cast<int>(dijkstraRes.path.size()) - 1;
            }
        }
        cand.connectionDistance = hops <= 10 ? hops : 99;
        double distanceScore = (hops == 2) ? 1.0 : ((hops == 3) ? 0.60 : ((hops == 4) ? 0.30 : 0.10));

        // 7. Same College Match
        bool sameCollege = (!sourceUser.college.empty() && sourceUser.college == candidateUser.college);
        cand.sameCollege = sameCollege;
        double collegeScore = sameCollege ? 1.0 : 0.0;

        // 8. Shared Community (DSU Connected or shared community member)
        bool sharedComm = socialDSU.connected(userId, candidateId);
        std::string matchedCommName = "";
        for (const auto& comm : communities) {
            bool in1 = std::find(comm.memberIds.begin(), comm.memberIds.end(), userId) != comm.memberIds.end();
            bool in2 = std::find(comm.memberIds.begin(), comm.memberIds.end(), candidateId) != comm.memberIds.end();
            if (in1 && in2) {
                sharedComm = true;
                matchedCommName = comm.name;
                break;
            }
        }
        cand.sharedCommunity = sharedComm;
        cand.communityName = matchedCommName.empty() ? "Connected Cluster" : matchedCommName;
        double communityScore = sharedComm ? 1.0 : 0.0;

        // 8. Configurable Multi-Signal Weighted Recommendation Score:
        // Mutual Friends: 35%, Interest Jaccard: 20%, Cosine Similarity: 20%,
        // Social Distance: 10%, Same College: 10%, Shared Community: 5%
        double computedScore = (scoringWeights.wMutual * mutualScore) +
                               (scoringWeights.wJaccard * cand.jaccardSimilarity) +
                               (scoringWeights.wCosine * cand.cosineSimilarity) +
                               (scoringWeights.wDistance * distanceScore) +
                               (scoringWeights.wCollege * collegeScore) +
                               (scoringWeights.wCommunity * communityScore);

        cand.score = std::round(computedScore * 100.0) / 100.0;
        cand.recommendationScore = cand.score;
        cand.finalScore = cand.score;
        cand.communityAffinityScore = communityScore;
        cand.activityScore = candidateUser.activityScore / 100.0;
        cand.graphProximityScore = distanceScore;

        // Transparent Explainability Generation ("Why am I seeing this?")
        std::string firstMutualName = "";
        if (!cand.mutualFriendIds.empty()) {
            auto firstM = getUserById(cand.mutualFriendIds[0]);
            if (firstM.has_value()) firstMutualName = firstM->name;
        }

        if (cand.mutualFriends > 0) {
            std::string reason = std::to_string(cand.mutualFriends) + " mutual friend" +
                                 (cand.mutualFriends > 1 ? "s" : "");
            if (!firstMutualName.empty()) {
                reason += " including " + firstMutualName;
            }
            cand.reasons.push_back(reason);
            cand.detailedReasons.push_back(reason);
        }

        if (cand.profileMatch >= 50) {
            std::string pReason = std::to_string(cand.profileMatch) + "% profile similarity";
            cand.reasons.push_back(pReason);
            cand.detailedReasons.push_back(pReason);
        }

        if (cand.interestMatch >= 40) {
            std::string iReason = std::to_string(cand.interestMatch) + "% shared interests";
            cand.reasons.push_back(iReason);
            cand.detailedReasons.push_back(iReason);
        } else if (!cand.sharedInterests.empty()) {
            std::string intStr = "Both interested in ";
            for (size_t idx = 0; idx < std::min<size_t>(2, cand.sharedInterests.size()); ++idx) {
                if (idx > 0) intStr += ", ";
                intStr += cand.sharedInterests[idx];
            }
            cand.reasons.push_back(intStr);
            cand.detailedReasons.push_back(intStr);
        }

        if (cand.sameCollege && !candidateUser.college.empty()) {
            std::string cReason = "Same university: " + candidateUser.college;
            cand.reasons.push_back(cReason);
            cand.detailedReasons.push_back(cReason);
        }

        if (hops <= 5) {
            std::string hReason = std::to_string(hops) + " connections away";
            cand.reasons.push_back(hReason);
            cand.detailedReasons.push_back(hReason);
        }

        if (cand.reasons.empty()) {
            cand.reasons.push_back("Active member in your broader network");
            cand.detailedReasons.push_back("Active member in your broader network");
        }
        cand.primaryReason = cand.reasons[0];

        rawCandidates.push_back(cand);
    }

    // Step 9: Insert candidates into a C++ Max Priority Queue & extract top-K
    auto topKList = PriorityRanking::getTopK(rawCandidates, topK);

    // Step 10: Sort descending with custom Merge Sort
    Sorting::sortCandidates(topKList);

    // Populate algorithm badges with exact ranks
    for (size_t i = 0; i < topKList.size(); ++i) {
        topKList[i].algorithms = {
            "BFS (" + std::to_string(topKList[i].connectionDistance) + " hops)",
            "Jaccard (" + std::to_string(topKList[i].jaccardSimilarity).substr(0, 4) + ")",
            "Cosine (" + std::to_string(topKList[i].cosineSimilarity).substr(0, 4) + ")",
            "PriorityQueue (Rank " + std::to_string(i + 1) + ")"
        };
    }

    return topKList;
}

// 1. BFS Network Endpoint: GET /api/users/{id}/network
nlohmann::json RecommendationEngine::getBFSNetwork(int userId) {
    auto optUser = getUserById(userId);
    if (!optUser.has_value()) {
        return nlohmann::json{{"error", "User not found"}};
    }

    auto distances = BFS::getNodesWithinDistance(socialGraph, userId, 4);

    nlohmann::json directFriends = nlohmann::json::array();
    nlohmann::json twoHopFriends = nlohmann::json::array();
    nlohmann::json threeHopConnections = nlohmann::json::array();
    nlohmann::json distanceMap = nlohmann::json::object();

    for (const auto& [nodeId, dist] : distances) {
        if (nodeId == userId) continue;
        distanceMap[std::to_string(nodeId)] = dist;
        auto u = getUserById(nodeId);
        if (!u.has_value()) continue;

        nlohmann::json item = {
            {"userId", u->id},
            {"name", u->name},
            {"username", u->username},
            {"avatar", u->avatar},
            {"distance", dist}
        };

        if (dist == 1) directFriends.push_back(item);
        else if (dist == 2) twoHopFriends.push_back(item);
        else if (dist == 3) threeHopConnections.push_back(item);
    }

    auto trace = BFS::getTraversalTrace(socialGraph, userId, 3);
    nlohmann::json steps = nlohmann::json::array();
    for (const auto& s : trace) {
        auto u = getUserById(s.userId);
        steps.push_back({
            {"userId", s.userId},
            {"name", u.has_value() ? u->name : ""},
            {"depth", s.depth},
            {"parentId", s.parentId}
        });
    }

    return nlohmann::json{
        {"algorithm", "Breadth-First Search (BFS)"},
        {"input", {
            {"userId", userId},
            {"name", optUser->name}
        }},
        {"result", {
            {"directFriends", directFriends},
            {"twoHopFriends", twoHopFriends},
            {"threeHopConnections", threeHopConnections},
            {"distances", distanceMap}
        }},
        {"steps", steps},
        {"timeComplexity", "O(V + E)"},
        {"spaceComplexity", "O(V)"}
    };
}

// 2. DFS Network Explore Endpoint: GET /api/users/{id}/network/explore
nlohmann::json RecommendationEngine::getDFSNeworkExplore(int userId) {
    auto optUser = getUserById(userId);
    if (!optUser.has_value()) {
        return nlohmann::json{{"error", "User not found"}};
    }

    auto trace = DFS::getTraversalTrace(socialGraph, userId, 4);
    nlohmann::json traversalOrder = nlohmann::json::array();
    nlohmann::json steps = nlohmann::json::array();

    std::unordered_set<int> visitedOrder;
    for (const auto& s : trace) {
        auto u = getUserById(s.userId);
        if (s.action == "visit" && visitedOrder.find(s.userId) == visitedOrder.end()) {
            visitedOrder.insert(s.userId);
            traversalOrder.push_back({
                {"userId", s.userId},
                {"name", u.has_value() ? u->name : ""},
                {"depth", s.depth}
            });
        }
        steps.push_back({
            {"userId", s.userId},
            {"name", u.has_value() ? u->name : ""},
            {"depth", s.depth},
            {"parentId", s.parentId},
            {"action", s.action}
        });
    }

    auto bridges = DFS::findBridges(socialGraph);
    nlohmann::json bridgeList = nlohmann::json::array();
    for (const auto& b : bridges) {
        auto u1 = getUserById(b.first);
        auto u2 = getUserById(b.second);
        bridgeList.push_back({
            {"u", b.first},
            {"v", b.second},
            {"uName", u1.has_value() ? u1->name : ""},
            {"vName", u2.has_value() ? u2->name : ""}
        });
    }

    auto triangles = DFS::findTriangles(socialGraph, userId);
    nlohmann::json triangleList = nlohmann::json::array();
    for (const auto& tri : triangles) {
        nlohmann::json triArr = nlohmann::json::array();
        for (int id : tri) {
            auto u = getUserById(id);
            triArr.push_back({
                {"userId", id},
                {"name", u.has_value() ? u->name : ""}
            });
        }
        triangleList.push_back(triArr);
    }

    return nlohmann::json{
        {"algorithm", "Depth-First Search (DFS)"},
        {"input", {
            {"userId", userId},
            {"name", optUser->name}
        }},
        {"result", {
            {"traversalOrder", traversalOrder},
            {"visitedCount", visitedOrder.size()},
            {"bridges", bridgeList},
            {"triangles", triangleList}
        }},
        {"steps", steps},
        {"timeComplexity", "O(V + E)"},
        {"spaceComplexity", "O(V)"}
    };
}

// 3. Dijkstra Shortest Connection: GET /api/network/shortest-path?from=...&to=...
nlohmann::json RecommendationEngine::getDijkstraShortestPathJSON(int fromId, int toId) {
    auto uFrom = getUserById(fromId);
    auto uTo = getUserById(toId);

    if (!uFrom.has_value() || !uTo.has_value()) {
        return nlohmann::json{{"error", "User not found"}};
    }

    auto res = Dijkstra::getShortestPath(socialGraph, fromId, toId);

    nlohmann::json pathUsers = nlohmann::json::array();
    for (int uid : res.path) {
        auto u = getUserById(uid);
        if (u.has_value()) {
            pathUsers.push_back({
                {"userId", u->id},
                {"name", u->name},
                {"username", u->username},
                {"avatar", u->avatar},
                {"college", u->college}
            });
        }
    }

    int hops = res.path.empty() ? 0 : static_cast<int>(res.path.size()) - 1;

    return nlohmann::json{
        {"algorithm", "Dijkstra's Shortest Path Algorithm"},
        {"input", {
            {"from", fromId},
            {"to", toId},
            {"fromName", uFrom->name},
            {"toName", uTo->name}
        }},
        {"result", {
            {"distance", hops},
            {"totalCost", res.totalCost},
            {"socialAffinityScore", res.socialAffinityScore},
            {"reachable", res.reachable},
            {"path", res.path},
            {"pathUsers", pathUsers}
        }},
        {"timeComplexity", "O((V + E) log V)"},
        {"spaceComplexity", "O(V)"}
    };
}

// 4. DSU Communities: GET /api/communities & /api/network/communities
nlohmann::json RecommendationEngine::getDSUCommunitiesJSON() {
    auto compMap = socialDSU.getAllComponents();
    nlohmann::json dsuSets = nlohmann::json::array();
    nlohmann::json userCommMap = nlohmann::json::object();

    for (const auto& [rootId, members] : compMap) {
        nlohmann::json memberArr = nlohmann::json::array();
        for (int uid : members) {
            userCommMap[std::to_string(uid)] = rootId;
            auto u = getUserById(uid);
            if (u.has_value()) {
                memberArr.push_back({
                    {"userId", u->id},
                    {"name", u->name},
                    {"username", u->username},
                    {"avatar", u->avatar}
                });
            }
        }
        dsuSets.push_back({
            {"componentRootId", rootId},
            {"size", members.size()},
            {"members", memberArr}
        });
    }

    nlohmann::json commArr = nlohmann::json::array();
    for (const auto& c : communities) {
        auto cJson = c.toJson();
        nlohmann::json members = nlohmann::json::array();
        for (int uid : c.memberIds) {
            auto u = getUserById(uid);
            if (u.has_value()) members.push_back(u->toJson());
        }
        cJson["members"] = members;
        commArr.push_back(cJson);
    }

    nlohmann::json clusterArr = nlohmann::json::array();
    for (const auto& cl : clusters) {
        auto clJson = cl.toJson();
        nlohmann::json mArr = nlohmann::json::array();
        for (int uid : cl.memberUserIds) {
            auto u = getUserById(uid);
            if (u.has_value()) mArr.push_back(u->toJson());
        }
        clJson["members"] = mArr;
        clusterArr.push_back(clJson);
    }

    return nlohmann::json{
        {"algorithm", "Disjoint Set Union (DSU / Union-Find) & K-Means"},
        {"result", {
            {"totalComponents", socialDSU.getComponentCount()},
            {"userCommunityMap", userCommMap},
            {"dsuComponents", dsuSets},
            {"communities", commArr},
            {"clusters", clusterArr}
        }},
        {"timeComplexity", "O((V + E) * α(V))"},
        {"spaceComplexity", "O(V)"}
    };
}

// 5 & 6. Similarity Analysis: GET /api/users/{a}/similarity/{b}
nlohmann::json RecommendationEngine::getSimilarityAnalysis(int userA, int userB) {
    auto u1 = getUserById(userA);
    auto u2 = getUserById(userB);

    if (!u1.has_value() || !u2.has_value()) {
        return nlohmann::json{{"error", "User not found"}};
    }

    double jaccard = Similarity::jaccardSimilarity(u1->interestSet, u2->interestSet);
    auto vecA = Similarity::buildInterestVector(*u1, allInterestKeys);
    auto vecB = Similarity::buildInterestVector(*u2, allInterestKeys);
    double cosine = Similarity::cosineSimilarity(vecA, vecB);

    auto common = Similarity::getCommonInterests(*u1, *u2);
    auto unionList = Similarity::getUnionInterests(*u1, *u2);

    std::vector<std::string> uniqueA;
    for (const auto& i : u1->interests) {
        if (u2->interestSet.find(i) == u2->interestSet.end()) uniqueA.push_back(i);
    }

    std::vector<std::string> uniqueB;
    for (const auto& i : u2->interests) {
        if (u1->interestSet.find(i) == u1->interestSet.end()) uniqueB.push_back(i);
    }

    return nlohmann::json{
        {"algorithm", "Jaccard & Cosine Similarity Engines"},
        {"input", {
            {"userA", {
                {"userId", u1->id},
                {"name", u1->name},
                {"interests", u1->interests}
            }},
            {"userB", {
                {"userId", u2->id},
                {"name", u2->name},
                {"interests", u2->interests}
            }}
        }},
        {"result", {
            {"jaccardSimilarity", std::round(jaccard * 1000.0) / 1000.0},
            {"jaccardPercentage", std::round(jaccard * 1000.0) / 10.0},
            {"cosineSimilarity", std::round(cosine * 1000.0) / 1000.0},
            {"commonInterests", common},
            {"unionInterests", unionList},
            {"uniqueToUserA", uniqueA},
            {"uniqueToUserB", uniqueB},
            {"intersectionCount", common.size()},
            {"unionCount", unionList.size()},
            {"formulaJaccard", "J(A, B) = |A ∩ B| / |A ∪ B|"},
            {"formulaCosine", "cos(θ) = (A · B) / (||A|| * ||B||)"}
        }},
        {"timeComplexity", "O(|A| + |B| + D)"},
        {"spaceComplexity", "O(|A| + |B|)"}
    };
}

// 9. Binary Search: GET /api/search/users?q=...
nlohmann::json RecommendationEngine::searchUsersBinary(const std::string& query) {
    if (query.empty()) {
        return nlohmann::json{{"error", "Query parameter 'q' is required"}};
    }

    bool isNumeric = true;
    for (char c : query) {
        if (!std::isdigit(static_cast<unsigned char>(c))) {
            isNumeric = false;
            break;
        }
    }

    BinarySearchResult res;
    if (isNumeric) {
        int id = std::stoi(query);
        res = Searching::binarySearchByIdWithTrace(userList, id);
    } else {
        res = Searching::binarySearchByUsername(usersSortedByName, query);
    }

    nlohmann::json steps = nlohmann::json::array();
    for (const auto& s : res.steps) {
        steps.push_back({
            {"stepNumber", s.stepNumber},
            {"left", s.left},
            {"right", s.right},
            {"mid", s.mid},
            {"midVal", s.midVal},
            {"comparison", s.comparison}
        });
    }

    nlohmann::json userObj = nullptr;
    if (res.found && res.user.has_value()) {
        userObj = res.user->toJson();
    }

    return nlohmann::json{
        {"algorithm", "Binary Search on Sorted Arrays"},
        {"input", {
            {"query", query},
            {"datasetSize", userList.size()},
            {"searchType", isNumeric ? "By User ID" : "By Username (Alphabetical)"}
        }},
        {"result", {
            {"found", res.found},
            {"foundIndex", res.foundIndex},
            {"comparisonsCount", res.comparisonsCount},
            {"user", userObj}
        }},
        {"steps", steps},
        {"timeComplexity", "O(log N)"},
        {"spaceComplexity", "O(1)"}
    };
}

// 10. Trie Autocomplete Suggestions: GET /api/search/autocomplete?q=...
std::vector<std::string> RecommendationEngine::getAutocompleteSuggestions(const std::string& prefix, int limit) {
    return searchTrie.getSuggestions(prefix, limit);
}

// User Search using Trie & Substring Matching
std::vector<User> RecommendationEngine::searchUsers(const std::string& query, int limit) {
    if (query.empty()) return {};

    auto matchedIds = searchTrie.searchPrefix(query, limit);
    std::unordered_set<int> matchedSet(matchedIds.begin(), matchedIds.end());

    std::string lowerQuery = query;
    std::transform(lowerQuery.begin(), lowerQuery.end(), lowerQuery.begin(), [](unsigned char c){ return std::tolower(c); });

    for (const auto& u : userList) {
        if (static_cast<int>(matchedSet.size()) >= limit) break;
        std::string lName = u.name;
        std::string lUser = u.username;
        std::transform(lName.begin(), lName.end(), lName.begin(), [](unsigned char c){ return std::tolower(c); });
        std::transform(lUser.begin(), lUser.end(), lUser.begin(), [](unsigned char c){ return std::tolower(c); });

        if (lName.find(lowerQuery) != std::string::npos || lUser.find(lowerQuery) != std::string::npos) {
            matchedSet.insert(u.id);
        }
    }

    std::vector<User> results;
    results.reserve(matchedSet.size());
    for (int id : matchedSet) {
        auto optUser = getUserById(id);
        if (optUser.has_value()) results.push_back(*optUser);
    }
    return results;
}

// 8. Feed Sorting with Custom Merge Sort: GET /api/users/{id}/feed
std::vector<Post> RecommendationEngine::getFeedForUser(int userId, int limit) {
    auto optUser = getUserById(userId);
    auto directFriendIds = socialGraph.getNeighborIds(userId);
    std::unordered_set<int> friendSet(directFriendIds.begin(), directFriendIds.end());
    friendSet.insert(userId); // Self posts

    std::vector<Post> feedPosts = posts;

    for (auto& post : feedPosts) {
        double score = 0.0;
        if (friendSet.find(post.authorId) != friendSet.end()) {
            score += 50.0; // Friend boost
        }
        score += post.likes * 2.0;
        score += post.comments.size() * 3.0;

        if (optUser.has_value()) {
            for (const auto& tag : post.tags) {
                if (optUser->interestSet.find(tag) != optUser->interestSet.end()) {
                    score += 15.0; // Topic match boost
                }
            }
        }
        post.computedScore = score;
    }

    // Merge Sort the feed by computed score
    Sorting::sortPostsByRelevance(feedPosts);

    if (static_cast<int>(feedPosts.size()) > limit) {
        feedPosts.resize(limit);
    }
    return feedPosts;
}

// 12. Complete 12 Algorithms Benchmark
nlohmann::json RecommendationEngine::getAllAlgorithmsBenchmark() {
    using namespace std::chrono;
    nlohmann::json bench = nlohmann::json::array();

    // 1. BFS
    {
        auto t0 = high_resolution_clock::now();
        auto res = BFS::getNodesWithinDistance(socialGraph, 1, 3);
        auto t1 = high_resolution_clock::now();
        bench.push_back({
            {"algorithm", "1. Breadth-First Search (BFS)"},
            {"purpose", "Find friends-of-friends and network distance tiers"},
            {"timeMicroseconds", duration_cast<microseconds>(t1 - t0).count()},
            {"timeComplexity", "O(V + E)"},
            {"spaceComplexity", "O(V)"}
        });
    }

    // 2. DFS
    {
        auto t0 = high_resolution_clock::now();
        auto res = DFS::getConnectedComponents(socialGraph);
        auto t1 = high_resolution_clock::now();
        bench.push_back({
            {"algorithm", "2. Depth-First Search (DFS)"},
            {"purpose", "Connected network exploration, bridge detection, cliques"},
            {"timeMicroseconds", duration_cast<microseconds>(t1 - t0).count()},
            {"timeComplexity", "O(V + E)"},
            {"spaceComplexity", "O(V)"}
        });
    }

    // 3. Dijkstra
    {
        auto t0 = high_resolution_clock::now();
        auto res = Dijkstra::getShortestPath(socialGraph, 1, 15);
        auto t1 = high_resolution_clock::now();
        bench.push_back({
            {"algorithm", "3. Dijkstra's Algorithm"},
            {"purpose", "Shortest weighted connection path between two users"},
            {"timeMicroseconds", duration_cast<microseconds>(t1 - t0).count()},
            {"timeComplexity", "O((V + E) log V)"},
            {"spaceComplexity", "O(V)"}
        });
    }

    // 4. Union-Find (DSU)
    {
        auto t0 = high_resolution_clock::now();
        auto res = socialDSU.getAllComponents();
        auto t1 = high_resolution_clock::now();
        bench.push_back({
            {"algorithm", "4. Disjoint Set Union (DSU)"},
            {"purpose", "Instant O(α(N)) community detection and component grouping"},
            {"timeMicroseconds", duration_cast<microseconds>(t1 - t0).count()},
            {"timeComplexity", "O((V + E) α(V))"},
            {"spaceComplexity", "O(V)"}
        });
    }

    // 5. Jaccard Similarity
    {
        auto t0 = high_resolution_clock::now();
        double sim = Similarity::jaccardSimilarity(userList[0].interestSet, userList[1].interestSet);
        auto t1 = high_resolution_clock::now();
        bench.push_back({
            {"algorithm", "5. Jaccard Similarity"},
            {"purpose", "Interest & skill overlap index: |A ∩ B| / |A ∪ B|"},
            {"timeMicroseconds", duration_cast<microseconds>(t1 - t0).count()},
            {"timeComplexity", "O(|A| + |B|)"},
            {"spaceComplexity", "O(|A| + |B|)"}
        });
    }

    // 6. Cosine Similarity
    {
        auto v1 = Similarity::buildInterestVector(userList[0], allInterestKeys);
        auto v2 = Similarity::buildInterestVector(userList[1], allInterestKeys);
        auto t0 = high_resolution_clock::now();
        double sim = Similarity::cosineSimilarity(v1, v2);
        auto t1 = high_resolution_clock::now();
        bench.push_back({
            {"algorithm", "6. Cosine Similarity"},
            {"purpose", "High-dimensional feature vector angle: (A · B) / (||A|| ||B||)"},
            {"timeMicroseconds", duration_cast<microseconds>(t1 - t0).count()},
            {"timeComplexity", "O(D)"},
            {"spaceComplexity", "O(D)"}
        });
    }

    // 7. Priority Queue (Max-Heap)
    {
        auto t0 = high_resolution_clock::now();
        auto recs = getRecommendations(1, 10);
        auto t1 = high_resolution_clock::now();
        bench.push_back({
            {"algorithm", "7. Priority Queue (Heap)"},
            {"purpose", "Top-K multi-signal recommendation scoring & ranking"},
            {"timeMicroseconds", duration_cast<microseconds>(t1 - t0).count()},
            {"timeComplexity", "O(N log K)"},
            {"spaceComplexity", "O(K)"}
        });
    }

    // 8. Custom Merge Sort
    {
        auto feedCopy = posts;
        auto t0 = high_resolution_clock::now();
        Sorting::sortPostsByRelevance(feedCopy);
        auto t1 = high_resolution_clock::now();
        bench.push_back({
            {"algorithm", "8. Custom Merge Sort"},
            {"purpose", "Deterministic stable sorting of personalized feed & users"},
            {"timeMicroseconds", duration_cast<microseconds>(t1 - t0).count()},
            {"timeComplexity", "O(N log N)"},
            {"spaceComplexity", "O(N)"}
        });
    }

    // 9. Binary Search
    {
        auto t0 = high_resolution_clock::now();
        auto opt = Searching::binarySearchUserById(userList, 10);
        auto t1 = high_resolution_clock::now();
        bench.push_back({
            {"algorithm", "9. Binary Search"},
            {"purpose", "O(log N) lookup in sorted user ID and username indices"},
            {"timeMicroseconds", duration_cast<microseconds>(t1 - t0).count()},
            {"timeComplexity", "O(log N)"},
            {"spaceComplexity", "O(1)"}
        });
    }

    // 10. Hash Map & Hash Set
    {
        auto t0 = high_resolution_clock::now();
        bool isF = (userMap.find(1) != userMap.end());
        auto t1 = high_resolution_clock::now();
        bench.push_back({
            {"algorithm", "10. Hash Map / Hash Set"},
            {"purpose", "O(1) average lookup for profile caching, block lists, and friend checks"},
            {"timeMicroseconds", duration_cast<microseconds>(t1 - t0).count()},
            {"timeComplexity", "O(1) avg"},
            {"spaceComplexity", "O(N)"}
        });
    }

    // 11. Trie (Prefix Tree)
    {
        auto t0 = high_resolution_clock::now();
        auto sugg = searchTrie.getSuggestions("a", 5);
        auto t1 = high_resolution_clock::now();
        bench.push_back({
            {"algorithm", "11. Trie (Prefix Tree)"},
            {"purpose", "Fast instant autocomplete search for names & topics"},
            {"timeMicroseconds", duration_cast<microseconds>(t1 - t0).count()},
            {"timeComplexity", "O(L + K)"},
            {"spaceComplexity", "O(Σ · L)"}
        });
    }

    // 12. K-Means Clustering
    {
        auto t0 = high_resolution_clock::now();
        runKMeansClustering();
        auto t1 = high_resolution_clock::now();
        bench.push_back({
            {"algorithm", "12. K-Means Clustering"},
            {"purpose", "Unsupervised interest-space partitioning into thematic clusters"},
            {"timeMicroseconds", duration_cast<microseconds>(t1 - t0).count()},
            {"timeComplexity", "O(K · N · D · I)"},
            {"spaceComplexity", "O(K · D + N)"}
        });
    }

    return bench;
}

nlohmann::json RecommendationEngine::getRecommendationExplanation(int sourceUserId, int candidateUserId) {
    auto optSource = getUserById(sourceUserId);
    auto optCandidate = getUserById(candidateUserId);

    if (!optSource.has_value() || !optCandidate.has_value()) {
        return nlohmann::json{{"error", "User not found"}};
    }

    const User& source = *optSource;
    const User& candidate = *optCandidate;

    auto mutualIds = BFS::getMutualFriends(socialGraph, sourceUserId, candidateUserId);
    nlohmann::json mutualFriends = nlohmann::json::array();
    for (int mid : mutualIds) {
        auto mUser = getUserById(mid);
        if (mUser.has_value()) {
            mutualFriends.push_back({
                {"id", mUser->id},
                {"name", mUser->name},
                {"username", mUser->username},
                {"avatar", mUser->avatar}
            });
        }
    }

    auto commonInterests = Similarity::getCommonInterests(source, candidate);
    double jaccard = Similarity::jaccardSimilarity(source.interestSet, candidate.interestSet);

    auto sourceVec = Similarity::buildInterestVector(source, allInterestKeys);
    auto candidateVec = Similarity::buildInterestVector(candidate, allInterestKeys);
    double cosine = Similarity::cosineSimilarity(sourceVec, candidateVec);

    auto distances = BFS::getNodesWithinDistance(socialGraph, sourceUserId, 6);
    int hops = (distances.find(candidateUserId) != distances.end()) ? distances[candidateUserId] : 99;

    bool sameCollege = (!source.college.empty() && source.college == candidate.college);
    bool dsuConnected = socialDSU.connected(sourceUserId, candidateUserId);

    double mutualScore = (mutualIds.size() > 0) ? std::min(1.0, (double)mutualIds.size() / 3.0) : 0.0;
    double distanceScore = (hops == 2) ? 1.0 : ((hops == 3) ? 0.60 : ((hops == 4) ? 0.30 : 0.10));
    double collegeScore = sameCollege ? 1.0 : 0.0;
    double commScore = dsuConnected ? 1.0 : 0.0;

    double score = (scoringWeights.wMutual * mutualScore) +
                   (scoringWeights.wJaccard * jaccard) +
                   (scoringWeights.wCosine * cosine) +
                   (scoringWeights.wDistance * distanceScore) +
                   (scoringWeights.wCollege * collegeScore) +
                   (scoringWeights.wCommunity * commScore);
    score = std::round(score * 100.0) / 100.0;

    nlohmann::json breakdown = {
        {"mutualFriendsScore", {
            {"weight", scoringWeights.wMutual},
            {"rawScore", mutualScore},
            {"weightedScore", scoringWeights.wMutual * mutualScore},
            {"description", std::to_string(mutualIds.size()) + " mutual friends via BFS"}
        }},
        {"interestJaccard", {
            {"weight", scoringWeights.wJaccard},
            {"rawScore", jaccard},
            {"weightedScore", scoringWeights.wJaccard * jaccard},
            {"description", "Shared " + std::to_string(commonInterests.size()) + " common interests (" + std::to_string((int)std::round(jaccard * 100.0)) + "%)"}
        }},
        {"vectorCosine", {
            {"weight", scoringWeights.wCosine},
            {"rawScore", cosine},
            {"weightedScore", scoringWeights.wCosine * cosine},
            {"description", "Cosine profile similarity (" + std::to_string((int)std::round(cosine * 100.0)) + "%)"}
        }},
        {"sameCollege", {
            {"weight", scoringWeights.wCollege},
            {"rawScore", collegeScore},
            {"weightedScore", scoringWeights.wCollege * collegeScore},
            {"description", sameCollege ? ("Same university: " + candidate.college) : "Different colleges"}
        }},
        {"socialDistance", {
            {"weight", scoringWeights.wDistance},
            {"rawScore", distanceScore},
            {"weightedScore", scoringWeights.wDistance * distanceScore},
            {"description", std::to_string(hops) + " connections away in social network"}
        }},
        {"sharedCommunity", {
            {"weight", scoringWeights.wCommunity},
            {"rawScore", commScore},
            {"weightedScore", scoringWeights.wCommunity * commScore},
            {"description", dsuConnected ? "In the same connected DSU community" : "Different network components"}
        }}
    };

    return nlohmann::json{
        {"sourceUserId", sourceUserId},
        {"candidateUserId", candidateUserId},
        {"candidateName", candidate.name},
        {"compositeScore", score},
        {"recommendationScore", score},
        {"mutualFriendsCount", mutualIds.size()},
        {"profileMatch", static_cast<int>(std::round(cosine * 100.0))},
        {"interestMatch", static_cast<int>(std::round(jaccard * 100.0))},
        {"breakdown", breakdown},
        {"mutualFriends", mutualFriends},
        {"commonInterests", commonInterests},
        {"hops", hops},
        {"dsuConnected", dsuConnected},
        {"sameCollege", sameCollege},
        {"collegeName", candidate.college}
    };
}

DijkstraResult RecommendationEngine::getSocialPathDijkstra(int sourceId, int targetId) {
    return Dijkstra::getShortestPath(socialGraph, sourceId, targetId);
}

std::vector<int> RecommendationEngine::getShortestPathBFS(int sourceId, int targetId) {
    return BFS::getShortestPath(socialGraph, sourceId, targetId);
}

std::vector<BFSStep> RecommendationEngine::getBFSTraversalTrace(int startId, int maxDepth) {
    return BFS::getTraversalTrace(socialGraph, startId, maxDepth);
}

std::vector<DFSStep> RecommendationEngine::getDFSTraversalTrace(int startId, int maxDepth) {
    return DFS::getTraversalTrace(socialGraph, startId, maxDepth);
}

std::vector<std::pair<int, int>> RecommendationEngine::getSocialBridgesDFS() {
    return DFS::findBridges(socialGraph);
}

std::vector<std::vector<int>> RecommendationEngine::getTrianglesDFS(int userId) {
    return DFS::findTriangles(socialGraph, userId);
}

nlohmann::json RecommendationEngine::getNetworkAnalytics() {
    int totalUsers = static_cast<int>(userList.size());
    int totalEdges = socialGraph.getEdgeCount();
    double density = totalUsers > 1 ? (2.0 * totalEdges) / (totalUsers * (totalUsers - 1)) : 0.0;

    int maxDegree = 0;
    int hubUserId = 0;
    for (const auto& u : userList) {
        int deg = socialGraph.getDegree(u.id);
        if (deg > maxDegree) {
            maxDegree = deg;
            hubUserId = u.id;
        }
    }

    auto bridges = DFS::findBridges(socialGraph);
    int numComponents = socialDSU.getComponentCount();

    return nlohmann::json{
        {"totalUsers", totalUsers},
        {"totalFriendships", totalEdges},
        {"networkDensity", density},
        {"maxDegree", maxDegree},
        {"hubUserId", hubUserId},
        {"hubUserName", getUserById(hubUserId).has_value() ? getUserById(hubUserId)->name : ""},
        {"connectedComponentsCount", numComponents},
        {"bridgeEdgesCount", bridges.size()}
    };
}

std::vector<ClusterInfo> RecommendationEngine::getKMeansClusters() {
    return clusters;
}

std::vector<FriendRequest> RecommendationEngine::getPendingRequestsForUser(int userId) const {
    std::vector<FriendRequest> res;
    for (const auto& r : friendRequests) {
        if (r.toUserId == userId && r.status == "pending") res.push_back(r);
    }
    return res;
}

std::vector<FriendRequest> RecommendationEngine::getSentRequestsByUser(int userId) const {
    std::vector<FriendRequest> res;
    for (const auto& r : friendRequests) {
        if (r.fromUserId == userId && r.status == "pending") res.push_back(r);
    }
    return res;
}

std::vector<Community> RecommendationEngine::getAllCommunities() const {
    return communities;
}

nlohmann::json RecommendationEngine::getInterests() const {
    try {
        std::ifstream file(dataDirPath + "/interests.json");
        if (file.is_open()) {
            nlohmann::json j;
            file >> j;
            return j;
        }
    } catch (...) {}
    return nlohmann::json::array();
}

nlohmann::json RecommendationEngine::getSocialGraphVisualization(int centerUserId, int radius) const {
    std::unordered_set<int> visibleNodeIds;

    if (centerUserId > 0) {
        auto distMap = BFS::getNodesWithinDistance(socialGraph, centerUserId, radius);
        for (const auto& [nodeId, dist] : distMap) {
            visibleNodeIds.insert(nodeId);
        }
    } else {
        for (const auto& u : userList) {
            visibleNodeIds.insert(u.id);
        }
    }

    nlohmann::json nodes = nlohmann::json::array();
    for (int uid : visibleNodeIds) {
        auto optUser = getUserById(uid);
        if (optUser.has_value()) {
            const auto& u = *optUser;
            nodes.push_back({
                {"id", u.id},
                {"name", u.name},
                {"username", u.username},
                {"avatar", u.avatar},
                {"college", u.college},
                {"degree", socialGraph.getDegree(u.id)},
                {"interests", u.interests}
            });
        }
    }

    nlohmann::json links = nlohmann::json::array();
    for (const auto& edge : socialGraph.getAllEdges()) {
        if (visibleNodeIds.find(edge.u) != visibleNodeIds.end() &&
            visibleNodeIds.find(edge.v) != visibleNodeIds.end()) {
            links.push_back({
                {"source", edge.u},
                {"target", edge.v},
                {"weight", edge.weight}
            });
        }
    }

    return nlohmann::json{
        {"nodes", nodes},
        {"links", links}
    };
}

// Dynamic Graph & Friendship Operations
bool RecommendationEngine::addFriendship(int u, int v, double weight) {
    if (u == v) return false;
    socialGraph.addEdge(u, v, weight);
    socialDSU.unite(u, v);
    rebuildIndices();
    saveData();
    return true;
}

bool RecommendationEngine::removeFriendship(int u, int v) {
    socialGraph.removeEdge(u, v);
    rebuildIndices();
    saveData();
    return true;
}

bool RecommendationEngine::sendFriendRequest(int fromId, int toId) {
    if (fromId == toId) return false;
    for (const auto& req : friendRequests) {
        if (((req.fromUserId == fromId && req.toUserId == toId) ||
             (req.fromUserId == toId && req.toUserId == fromId)) &&
            req.status == "pending") {
            return false;
        }
    }
    FriendRequest nr;
    nr.id = static_cast<int>(friendRequests.size()) + 1;
    nr.fromUserId = fromId;
    nr.toUserId = toId;
    nr.status = "pending";
    nr.createdAt = "Just now";
    friendRequests.push_back(nr);
    saveData();
    return true;
}

bool RecommendationEngine::acceptFriendRequest(int requestId) {
    for (auto& req : friendRequests) {
        if (req.id == requestId && req.status == "pending") {
            req.status = "accepted";
            // Dynamically add edge to Graph and unite in DSU
            addFriendship(req.fromUserId, req.toUserId, 3.0);
            return true;
        }
    }
    return false;
}

bool RecommendationEngine::rejectFriendRequest(int requestId) {
    for (auto& req : friendRequests) {
        if (req.id == requestId && req.status == "pending") {
            req.status = "rejected";
            saveData();
            return true;
        }
    }
    return false;
}

bool RecommendationEngine::blockUser(int userId, int targetId) {
    if (userId == targetId) return false;
    blockedUsers[userId].insert(targetId);
    saveData();
    return true;
}

bool RecommendationEngine::unblockUser(int userId, int targetId) {
    if (blockedUsers.find(userId) != blockedUsers.end()) {
        blockedUsers[userId].erase(targetId);
        saveData();
        return true;
    }
    return false;
}

std::vector<int> RecommendationEngine::getBlockedUsers(int userId) const {
    auto it = blockedUsers.find(userId);
    if (it != blockedUsers.end()) {
        return std::vector<int>(it->second.begin(), it->second.end());
    }
    return {};
}

bool RecommendationEngine::dismissCandidate(int userId, int candidateId) {
    rejectedCandidates[userId].insert(candidateId);
    return true;
}

bool RecommendationEngine::createPost(int authorId, const std::string& content, const std::vector<std::string>& tags) {
    Post p;
    p.id = static_cast<int>(posts.size()) + 1;
    p.authorId = authorId;
    p.content = content;
    p.tags = tags;
    p.createdAt = "Just now";
    p.likes = 0;
    posts.insert(posts.begin(), p); // Newest first
    saveData();
    return true;
}

bool RecommendationEngine::likePost(int postId, int userId) {
    for (auto& post : posts) {
        if (post.id == postId) {
            auto it = std::find(post.likedByUserIds.begin(), post.likedByUserIds.end(), userId);
            if (it != post.likedByUserIds.end()) {
                post.likedByUserIds.erase(it);
                post.likes = std::max(0, post.likes - 1);
            } else {
                post.likedByUserIds.push_back(userId);
                post.likes++;
            }
            saveData();
            return true;
        }
    }
    return false;
}

bool RecommendationEngine::addComment(int postId, int authorId, const std::string& content) {
    for (auto& post : posts) {
        if (post.id == postId) {
            Comment c;
            c.id = static_cast<int>(post.comments.size()) + 1;
            c.authorId = authorId;
            c.content = content;
            c.createdAt = "Just now";
            post.comments.push_back(c);
            saveData();
            return true;
        }
    }
    return false;
}

bool RecommendationEngine::updateUserProfile(const User& user) {
    for (auto& u : userList) {
        if (u.id == user.id) {
            u = user;
            u.buildInterestSet();
            rebuildIndices();
            saveData();
            return true;
        }
    }
    return false;
}

bool RecommendationEngine::createUserProfile(const User& user) {
    User newUser = user;
    if (newUser.id <= 0) {
        newUser.id = static_cast<int>(userList.size()) + 1;
    }
    newUser.buildInterestSet();
    userList.push_back(newUser);
    socialGraph.addNode(newUser.id);
    rebuildIndices();
    saveData();
    return true;
}
