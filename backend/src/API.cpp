#include "../include/API.h"
#include "../include/httplib.h"
#include <iostream>
#include <string>

static int parseUserId(const std::string& s) {
    if (s.empty()) return 0;
    size_t start = 0;
    if (s[0] == 'U' || s[0] == 'u') start = 1;
    try {
        return std::stoi(s.substr(start));
    } catch (...) {
        return 0;
    }
}

API::API(RecommendationEngine& eng, int p)
    : engine(eng), port(p) {}

void API::start() {
    httplib::Server svr;

    // Global CORS middleware & preflight handler
    svr.set_default_headers({
        {"Access-Control-Allow-Origin", "*"},
        {"Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"},
        {"Access-Control-Allow-Headers", "Content-Type, Authorization"}
    });

    svr.Options(".*", [](const httplib::Request&, httplib::Response& res) {
        res.status = 200;
    });

    // Health check
    svr.Get("/api/health", [](const httplib::Request&, httplib::Response& res) {
        nlohmann::json j = {
            {"status", "healthy"},
            {"engine", "FriendSphere C++ Algorithmic Core"},
            {"version", "1.0.0"},
            {"algorithmsCount", 12}
        };
        res.set_content(j.dump(), "application/json");
    });

    // 12 Algorithms Benchmark & Metadata: GET /api/algorithms/all
    svr.Get("/api/algorithms/all", [this](const httplib::Request&, httplib::Response& res) {
        auto bench = engine.getAllAlgorithmsBenchmark();
        res.set_content(bench.dump(), "application/json");
    });

    // ==========================================
    // 1. BFS: GET /api/users/{id}/network
    // ==========================================
    svr.Get(R"(/api/users/([Uu]?\d+)/network)", [this](const httplib::Request& req, httplib::Response& res) {
        int userId = parseUserId(req.matches[1]);
        auto result = engine.getBFSNetwork(userId);
        res.set_content(result.dump(), "application/json");
    });

    // ==========================================
    // 2. DFS: GET /api/users/{id}/network/explore
    // ==========================================
    svr.Get(R"(/api/users/([Uu]?\d+)/network/explore)", [this](const httplib::Request& req, httplib::Response& res) {
        int userId = parseUserId(req.matches[1]);
        auto result = engine.getDFSNeworkExplore(userId);
        res.set_content(result.dump(), "application/json");
    });

    // ==========================================
    // 3. DIJKSTRA: GET /api/network/shortest-path?from=...&to=...
    // ==========================================
    svr.Get("/api/network/shortest-path", [this](const httplib::Request& req, httplib::Response& res) {
        int fromId = 1;
        int toId = 2;
        if (req.has_param("from")) fromId = parseUserId(req.get_param_value("from"));
        else if (req.has_param("source")) fromId = parseUserId(req.get_param_value("source"));

        if (req.has_param("to")) toId = parseUserId(req.get_param_value("to"));
        else if (req.has_param("target")) toId = parseUserId(req.get_param_value("target"));

        auto result = engine.getDijkstraShortestPathJSON(fromId, toId);
        res.set_content(result.dump(), "application/json");
    });

    // Dijkstra route alias
    svr.Get("/api/algorithms/dijkstra", [this](const httplib::Request& req, httplib::Response& res) {
        int source = 1;
        int target = 2;
        if (req.has_param("source")) source = parseUserId(req.get_param_value("source"));
        else if (req.has_param("from")) source = parseUserId(req.get_param_value("from"));

        if (req.has_param("target")) target = parseUserId(req.get_param_value("target"));
        else if (req.has_param("to")) target = parseUserId(req.get_param_value("to"));

        auto result = engine.getDijkstraShortestPathJSON(source, target);
        res.set_content(result.dump(), "application/json");
    });

    // ==========================================
    // 4. UNION-FIND (DSU): GET /api/communities & /api/network/communities
    // ==========================================
    svr.Get("/api/communities", [this](const httplib::Request& req, httplib::Response& res) {
        if (req.has_param("format") && req.get_param_value("format") == "dsu") {
            auto result = engine.getDSUCommunitiesJSON();
            res.set_content(result.dump(), "application/json");
            return;
        }

        // Return array of communities with members for frontend compatibility
        auto communities = engine.getAllCommunities();
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& c : communities) {
            auto cJson = c.toJson();
            nlohmann::json members = nlohmann::json::array();
            for (int uid : c.memberIds) {
                auto u = engine.getUserById(uid);
                if (u.has_value()) {
                    members.push_back(u->toJson());
                }
            }
            cJson["members"] = members;
            arr.push_back(cJson);
        }
        res.set_content(arr.dump(), "application/json");
    });

    svr.Get("/api/network/communities", [this](const httplib::Request&, httplib::Response& res) {
        auto result = engine.getDSUCommunitiesJSON();
        res.set_content(result.dump(), "application/json");
    });

    // ==========================================
    // 5 & 6. SIMILARITY: GET /api/users/{a}/similarity/{b}
    // ==========================================
    svr.Get(R"(/api/users/([Uu]?\d+)/similarity/([Uu]?\d+))", [this](const httplib::Request& req, httplib::Response& res) {
        int u1 = parseUserId(req.matches[1]);
        int u2 = parseUserId(req.matches[2]);
        auto result = engine.getSimilarityAnalysis(u1, u2);
        res.set_content(result.dump(), "application/json");
    });

    // ==========================================
    // 7. PRIORITY QUEUE (MAX-HEAP): GET /api/users/{id}/recommendations & /api/users/{id}/suggestions
    // ==========================================
    auto handleRecommendations = [this](const httplib::Request& req, httplib::Response& res) {
        int userId = parseUserId(req.matches[1]);
        size_t topK = 10;
        if (req.has_param("topK")) {
            try {
                topK = std::stoul(req.get_param_value("topK"));
            } catch (...) {}
        }

        auto candidates = engine.getRecommendations(userId, topK);
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& cand : candidates) {
            auto candJson = cand.toJson();
            auto userObj = engine.getUserById(cand.userId);
            if (userObj.has_value()) {
                candJson["user"] = userObj->toJson();
            }
            arr.push_back(candJson);
        }
        res.set_content(arr.dump(), "application/json");
    };

    svr.Get(R"(/api/users/([Uu]?\d+)/recommendations)", handleRecommendations);
    svr.Get(R"(/api/users/([Uu]?\d+)/suggestions)", handleRecommendations);

    // Recommendation Explain
    svr.Get(R"(/api/users/([Uu]?\d+)/recommendations/explain/([Uu]?\d+))", [this](const httplib::Request& req, httplib::Response& res) {
        int sourceId = parseUserId(req.matches[1]);
        int candidateId = parseUserId(req.matches[2]);
        auto explanation = engine.getRecommendationExplanation(sourceId, candidateId);
        res.set_content(explanation.dump(), "application/json");
    });

    // Recommendation Configurable Weights: GET & POST /api/recommendations/weights
    svr.Get("/api/recommendations/weights", [this](const httplib::Request&, httplib::Response& res) {
        res.set_content(engine.getScoringWeights().toJson().dump(), "application/json");
    });

    svr.Post("/api/recommendations/weights", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = nlohmann::json::parse(req.body);
            ScoringWeights weights = ScoringWeights::fromJson(j);
            engine.setScoringWeights(weights);
            res.set_content(nlohmann::json{{"success", true}, {"weights", weights.toJson()}}.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    // Dismiss recommendation candidate
    svr.Post("/api/recommendations/dismiss", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = nlohmann::json::parse(req.body);
            int userId = parseUserId(j.value("userId", "0"));
            int candidateId = parseUserId(j.value("candidateId", "0"));
            if (userId == 0 && j.contains("userId") && j["userId"].is_number()) userId = j["userId"].get<int>();
            if (candidateId == 0 && j.contains("candidateId") && j["candidateId"].is_number()) candidateId = j["candidateId"].get<int>();
            bool success = engine.dismissCandidate(userId, candidateId);
            res.set_content(nlohmann::json{{"success", success}}.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    // ==========================================
    // BLOCKING: POST /api/users/block, /api/users/{id}/block & unblock
    // ==========================================
    svr.Post(R"(/api/users/([Uu]?\d+)/block)", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            int targetId = parseUserId(req.matches[1]);
            int userId = 1;
            if (!req.body.empty()) {
                auto j = nlohmann::json::parse(req.body);
                if (j.contains("userId")) userId = parseUserId(j.value("userId", "1"));
            }
            bool success = engine.blockUser(userId, targetId);
            res.set_content(nlohmann::json{{"success", success}}.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    svr.Post("/api/users/block", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = nlohmann::json::parse(req.body);
            int userId = j.contains("userId") ? (j["userId"].is_number() ? j["userId"].get<int>() : parseUserId(j["userId"].get<std::string>())) : 1;
            int targetId = j.contains("targetId") ? (j["targetId"].is_number() ? j["targetId"].get<int>() : parseUserId(j["targetId"].get<std::string>())) : 0;
            bool success = engine.blockUser(userId, targetId);
            res.set_content(nlohmann::json{{"success", success}}.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    svr.Post("/api/users/unblock", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = nlohmann::json::parse(req.body);
            int userId = j.contains("userId") ? (j["userId"].is_number() ? j["userId"].get<int>() : parseUserId(j["userId"].get<std::string>())) : 1;
            int targetId = j.contains("targetId") ? (j["targetId"].is_number() ? j["targetId"].get<int>() : parseUserId(j["targetId"].get<std::string>())) : 0;
            bool success = engine.unblockUser(userId, targetId);
            res.set_content(nlohmann::json{{"success", success}}.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    svr.Get(R"(/api/users/([Uu]?\d+)/blocked)", [this](const httplib::Request& req, httplib::Response& res) {
        int userId = parseUserId(req.matches[1]);
        auto blockedIds = engine.getBlockedUsers(userId);
        nlohmann::json arr = nlohmann::json::array();
        for (int bid : blockedIds) {
            auto u = engine.getUserById(bid);
            if (u.has_value()) arr.push_back(u->toJson());
        }
        res.set_content(arr.dump(), "application/json");
    });

    // ==========================================
    // 9. BINARY SEARCH: GET /api/search/users?q=...
    // ==========================================
    svr.Get("/api/search/users", [this](const httplib::Request& req, httplib::Response& res) {
        std::string q = req.get_param_value("q");
        auto result = engine.searchUsersBinary(q);
        res.set_content(result.dump(), "application/json");
    });

    // ==========================================
    // 11. TRIE AUTOCOMPLETE: GET /api/search/autocomplete?q=...
    // ==========================================
    svr.Get("/api/search/autocomplete", [this](const httplib::Request& req, httplib::Response& res) {
        std::string q = req.get_param_value("q");
        int limit = 10;
        if (req.has_param("limit")) {
            try { limit = std::stoi(req.get_param_value("limit")); } catch (...) {}
        }
        auto suggestions = engine.getAutocompleteSuggestions(q, limit);
        nlohmann::json resp = {
            {"algorithm", "Trie Prefix Tree Search"},
            {"query", q},
            {"suggestions", suggestions}
        };
        res.set_content(resp.dump(), "application/json");
    });

    // General search (Trie + Substring)
    svr.Get("/api/search", [this](const httplib::Request& req, httplib::Response& res) {
        std::string query = req.get_param_value("q");
        int limit = 10;
        if (req.has_param("limit")) {
            try { limit = std::stoi(req.get_param_value("limit")); } catch (...) {}
        }
        auto results = engine.searchUsers(query, limit);
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& u : results) {
            arr.push_back(u.toJson());
        }
        res.set_content(arr.dump(), "application/json");
    });

    // ==========================================
    // 8. MERGE SORT FEED: GET /api/users/{id}/feed
    // ==========================================
    svr.Get(R"(/api/users/([Uu]?\d+)/feed)", [this](const httplib::Request& req, httplib::Response& res) {
        int userId = parseUserId(req.matches[1]);
        int limit = 30;
        if (req.has_param("limit")) {
            try { limit = std::stoi(req.get_param_value("limit")); } catch (...) {}
        }
        auto feed = engine.getFeedForUser(userId, limit);
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& post : feed) {
            auto postJson = post.toJson();
            auto author = engine.getUserById(post.authorId);
            if (author.has_value()) {
                postJson["author"] = author->toJson();
            }
            arr.push_back(postJson);
        }
        res.set_content(arr.dump(), "application/json");
    });

    // Get all users
    svr.Get("/api/users", [this](const httplib::Request&, httplib::Response& res) {
        const auto& users = engine.getAllUsers();
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& u : users) {
            arr.push_back(u.toJson());
        }
        res.set_content(arr.dump(), "application/json");
    });

    // Get specific user
    svr.Get(R"(/api/users/([Uu]?\d+))", [this](const httplib::Request& req, httplib::Response& res) {
        int userId = parseUserId(req.matches[1]);
        auto optUser = engine.getUserById(userId);
        if (optUser.has_value()) {
            res.set_content(optUser->toJson().dump(), "application/json");
        } else {
            res.status = 404;
            res.set_content(nlohmann::json{{"error", "User not found"}}.dump(), "application/json");
        }
    });

    // Get user friends
    svr.Get(R"(/api/users/([Uu]?\d+)/friends)", [this](const httplib::Request& req, httplib::Response& res) {
        int userId = parseUserId(req.matches[1]);
        auto friends = engine.getFriends(userId);
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& f : friends) {
            arr.push_back(f.toJson());
        }
        res.set_content(arr.dump(), "application/json");
    });

    // Mutual friends
    svr.Get(R"(/api/users/([Uu]?\d+)/mutual/([Uu]?\d+))", [this](const httplib::Request& req, httplib::Response& res) {
        int u = parseUserId(req.matches[1]);
        int v = parseUserId(req.matches[2]);
        auto mutuals = engine.getMutualFriends(u, v);
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& m : mutuals) {
            arr.push_back(m.toJson());
        }
        res.set_content(arr.dump(), "application/json");
    });

    // Pending requests
    svr.Get(R"(/api/users/([Uu]?\d+)/requests/pending)", [this](const httplib::Request& req, httplib::Response& res) {
        int userId = parseUserId(req.matches[1]);
        auto requests = engine.getPendingRequestsForUser(userId);
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& r : requests) {
            auto rJson = r.toJson();
            auto fromUser = engine.getUserById(r.fromUserId);
            if (fromUser.has_value()) {
                rJson["fromUser"] = fromUser->toJson();
            }
            arr.push_back(rJson);
        }
        res.set_content(arr.dump(), "application/json");
    });

    // Sent requests
    svr.Get(R"(/api/users/([Uu]?\d+)/requests/sent)", [this](const httplib::Request& req, httplib::Response& res) {
        int userId = parseUserId(req.matches[1]);
        auto requests = engine.getSentRequestsByUser(userId);
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& r : requests) {
            auto rJson = r.toJson();
            auto toUser = engine.getUserById(r.toUserId);
            if (toUser.has_value()) {
                rJson["toUser"] = toUser->toJson();
            }
            arr.push_back(rJson);
        }
        res.set_content(arr.dump(), "application/json");
    });

    // Graph Visualization Data
    svr.Get("/api/graph", [this](const httplib::Request& req, httplib::Response& res) {
        int centerId = 0;
        int radius = 2;
        if (req.has_param("centerId")) {
            try { centerId = parseUserId(req.get_param_value("centerId")); } catch (...) {}
        }
        if (req.has_param("radius")) {
            try { radius = std::stoi(req.get_param_value("radius")); } catch (...) {}
        }
        auto graphData = engine.getSocialGraphVisualization(centerId, radius);
        res.set_content(graphData.dump(), "application/json");
    });

    // Network Analytics
    svr.Get("/api/analytics", [this](const httplib::Request&, httplib::Response& res) {
        auto analytics = engine.getNetworkAnalytics();
        res.set_content(analytics.dump(), "application/json");
    });

    // KMeans Clusters
    svr.Get("/api/clusters", [this](const httplib::Request&, httplib::Response& res) {
        auto clusters = engine.getKMeansClusters();
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& cl : clusters) {
            auto cJson = cl.toJson();
            nlohmann::json memberUsers = nlohmann::json::array();
            for (int uid : cl.memberUserIds) {
                auto u = engine.getUserById(uid);
                if (u.has_value()) {
                    memberUsers.push_back(u->toJson());
                }
            }
            cJson["members"] = memberUsers;
            arr.push_back(cJson);
        }
        res.set_content(arr.dump(), "application/json");
    });

    // Interests
    svr.Get("/api/interests", [this](const httplib::Request&, httplib::Response& res) {
        res.set_content(engine.getInterests().dump(), "application/json");
    });

    // Traces: BFS Trace
    svr.Get("/api/algorithms/bfs-trace", [this](const httplib::Request& req, httplib::Response& res) {
        int start = req.has_param("start") ? parseUserId(req.get_param_value("start")) : 1;
        int maxDepth = 3;
        if (req.has_param("maxDepth")) {
            try { maxDepth = std::stoi(req.get_param_value("maxDepth")); } catch (...) {}
        }
        auto trace = engine.getBFSTraversalTrace(start, maxDepth);
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& step : trace) {
            auto u = engine.getUserById(step.userId);
            arr.push_back({
                {"userId", step.userId},
                {"name", u.has_value() ? u->name : ""},
                {"depth", step.depth},
                {"parentId", step.parentId}
            });
        }
        res.set_content(arr.dump(), "application/json");
    });

    // Traces: DFS Trace
    svr.Get("/api/algorithms/dfs-trace", [this](const httplib::Request& req, httplib::Response& res) {
        int start = req.has_param("start") ? parseUserId(req.get_param_value("start")) : 1;
        int maxDepth = 4;
        if (req.has_param("maxDepth")) {
            try { maxDepth = std::stoi(req.get_param_value("maxDepth")); } catch (...) {}
        }
        auto trace = engine.getDFSTraversalTrace(start, maxDepth);
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& step : trace) {
            auto u = engine.getUserById(step.userId);
            arr.push_back({
                {"userId", step.userId},
                {"name", u.has_value() ? u->name : ""},
                {"depth", step.depth},
                {"parentId", step.parentId},
                {"action", step.action}
            });
        }
        res.set_content(arr.dump(), "application/json");
    });

    // Traces: DFS Bridges
    svr.Get("/api/algorithms/bridges", [this](const httplib::Request&, httplib::Response& res) {
        auto bridges = engine.getSocialBridgesDFS();
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& b : bridges) {
            auto u1 = engine.getUserById(b.first);
            auto u2 = engine.getUserById(b.second);
            arr.push_back({
                {"u", b.first},
                {"v", b.second},
                {"uName", u1.has_value() ? u1->name : ""},
                {"vName", u2.has_value() ? u2->name : ""}
            });
        }
        res.set_content(arr.dump(), "application/json");
    });

    // Traces: DFS Triangles
    svr.Get(R"(/api/algorithms/triangles/([Uu]?\d+))", [this](const httplib::Request& req, httplib::Response& res) {
        int userId = parseUserId(req.matches[1]);
        auto triangles = engine.getTrianglesDFS(userId);
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& tri : triangles) {
            nlohmann::json triArr = nlohmann::json::array();
            for (int uid : tri) {
                auto u = engine.getUserById(uid);
                triArr.push_back({
                    {"id", uid},
                    {"name", u.has_value() ? u->name : ""}
                });
            }
            arr.push_back(triArr);
        }
        res.set_content(arr.dump(), "application/json");
    });

    // POST: Add friendship directly
    svr.Post("/api/friends/add", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = nlohmann::json::parse(req.body);
            int u1 = j.contains("user1Id") ? (j["user1Id"].is_number() ? j["user1Id"].get<int>() : parseUserId(j["user1Id"].get<std::string>())) : 0;
            int u2 = j.contains("user2Id") ? (j["user2Id"].is_number() ? j["user2Id"].get<int>() : parseUserId(j["user2Id"].get<std::string>())) : 0;
            double weight = j.value("weight", 3.0);
            bool success = engine.addFriendship(u1, u2, weight);
            res.set_content(nlohmann::json{{"success", success}}.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    // POST: Remove friendship
    auto handleRemoveFriend = [this](int u1, int u2, httplib::Response& res) {
        bool success = engine.removeFriendship(u1, u2);
        res.set_content(nlohmann::json{{"success", success}}.dump(), "application/json");
    };

    svr.Post("/api/friends/remove", [this, handleRemoveFriend](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = nlohmann::json::parse(req.body);
            int u1 = j.contains("user1Id") ? (j["user1Id"].is_number() ? j["user1Id"].get<int>() : parseUserId(j["user1Id"].get<std::string>())) : 0;
            int u2 = j.contains("user2Id") ? (j["user2Id"].is_number() ? j["user2Id"].get<int>() : parseUserId(j["user2Id"].get<std::string>())) : 0;
            handleRemoveFriend(u1, u2, res);
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    // DELETE /api/friends/{id} (Removes friendship with active user u1=1 or passed in header/query)
    svr.Delete(R"(/api/friends/([Uu]?\d+))", [this, handleRemoveFriend](const httplib::Request& req, httplib::Response& res) {
        int targetId = parseUserId(req.matches[1]);
        int activeUserId = 1;
        if (req.has_param("userId")) activeUserId = parseUserId(req.get_param_value("userId"));
        handleRemoveFriend(activeUserId, targetId, res);
    });

    // POST: Send friend request (supports /api/requests/send and /api/friends/request)
    auto handleSendRequest = [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = nlohmann::json::parse(req.body);
            int fromId = j.contains("fromUserId") ? (j["fromUserId"].is_number() ? j["fromUserId"].get<int>() : parseUserId(j["fromUserId"].get<std::string>())) : 0;
            int toId = j.contains("toUserId") ? (j["toUserId"].is_number() ? j["toUserId"].get<int>() : parseUserId(j["toUserId"].get<std::string>())) : 0;
            bool success = engine.sendFriendRequest(fromId, toId);
            res.set_content(nlohmann::json{{"success", success}}.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json{{"error", e.what()}}.dump(), "application/json");
        }
    };

    svr.Post("/api/requests/send", handleSendRequest);
    svr.Post("/api/friends/request", handleSendRequest);

    // POST: Accept friend request (supports /api/requests/accept and /api/friends/accept)
    auto handleAcceptRequest = [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = nlohmann::json::parse(req.body);
            int reqId = j.value("requestId", 0);
            if (reqId == 0 && j.contains("id")) reqId = j.value("id", 0);
            bool success = engine.acceptFriendRequest(reqId);
            res.set_content(nlohmann::json{{"success", success}}.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json{{"error", e.what()}}.dump(), "application/json");
        }
    };

    svr.Post("/api/requests/accept", handleAcceptRequest);
    svr.Post("/api/friends/accept", handleAcceptRequest);

    // POST: Reject friend request
    svr.Post("/api/requests/reject", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = nlohmann::json::parse(req.body);
            int reqId = j.value("requestId", 0);
            if (reqId == 0 && j.contains("id")) reqId = j.value("id", 0);
            bool success = engine.rejectFriendRequest(reqId);
            res.set_content(nlohmann::json{{"success", success}}.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    // POST: Create post
    svr.Post("/api/posts/create", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = nlohmann::json::parse(req.body);
            int authorId = j.contains("authorId") ? (j["authorId"].is_number() ? j["authorId"].get<int>() : parseUserId(j["authorId"].get<std::string>())) : 0;
            std::string content = j.value("content", "");
            std::vector<std::string> tags;
            if (j.contains("tags") && j["tags"].is_array()) {
                tags = j["tags"].get<std::vector<std::string>>();
            }
            bool success = engine.createPost(authorId, content, tags);
            res.set_content(nlohmann::json{{"success", success}}.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    // POST: Like post
    svr.Post("/api/posts/like", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = nlohmann::json::parse(req.body);
            int postId = j.value("postId", 0);
            int userId = j.contains("userId") ? (j["userId"].is_number() ? j["userId"].get<int>() : parseUserId(j["userId"].get<std::string>())) : 0;
            bool success = engine.likePost(postId, userId);
            res.set_content(nlohmann::json{{"success", success}}.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    // POST: Add comment
    svr.Post("/api/posts/comment", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = nlohmann::json::parse(req.body);
            int postId = j.value("postId", 0);
            int authorId = j.contains("authorId") ? (j["authorId"].is_number() ? j["authorId"].get<int>() : parseUserId(j["authorId"].get<std::string>())) : 0;
            std::string content = j.value("content", "");
            bool success = engine.addComment(postId, authorId, content);
            res.set_content(nlohmann::json{{"success", success}}.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    // POST: Update user profile
    svr.Post("/api/users/profile", [this](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = nlohmann::json::parse(req.body);
            User u = User::fromJson(j);
            bool success = false;
            if (u.id > 0 && engine.getUserById(u.id).has_value()) {
                success = engine.updateUserProfile(u);
            } else {
                success = engine.createUserProfile(u);
            }
            res.set_content(nlohmann::json{{"success", success}}.dump(), "application/json");
        } catch (const std::exception& e) {
            res.status = 400;
            res.set_content(nlohmann::json{{"error", e.what()}}.dump(), "application/json");
        }
    });

    std::cout << "========================================================\n";
    std::cout << "  FriendSphere C++ Algorithmic Core REST Server Running\n";
    std::cout << "  Port: " << port << " | Ready for requests!\n";
    std::cout << "========================================================\n" << std::endl;

    svr.listen("0.0.0.0", port);
}
