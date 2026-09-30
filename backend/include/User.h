#pragma once

#include <string>
#include <vector>
#include <unordered_set>
#include <nlohmann/json.hpp>

struct User {
    int id{0};
    std::string username;
    std::string name;
    std::string email;
    std::string avatar;
    std::string coverImage;
    std::string headline;
    std::string bio;
    std::string college;
    std::string location;
    std::vector<std::string> interests;
    std::vector<std::string> skills;
    double activityScore{0.0};
    std::string joinedDate;

    // Fast lookup set of interests for similarity calculations
    std::unordered_set<std::string> interestSet;

    void buildInterestSet() {
        interestSet.clear();
        for (const auto& interest : interests) {
            interestSet.insert(interest);
        }
    }

    nlohmann::json toJson() const {
        return nlohmann::json{
            {"id", id},
            {"username", username},
            {"name", name},
            {"email", email},
            {"avatar", avatar},
            {"coverImage", coverImage},
            {"headline", headline},
            {"bio", bio},
            {"college", college},
            {"location", location},
            {"interests", interests},
            {"skills", skills},
            {"activityScore", activityScore},
            {"joinedDate", joinedDate}
        };
    }

    static User fromJson(const nlohmann::json& j) {
        User u;
        u.id = j.value("id", 0);
        u.username = j.value("username", "");
        u.name = j.value("name", "");
        u.email = j.value("email", "");
        u.avatar = j.value("avatar", "");
        u.coverImage = j.value("coverImage", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80");
        u.headline = j.value("headline", "");
        u.bio = j.value("bio", "");
        u.college = j.value("college", "Tech University");
        u.location = j.value("location", "");
        if (j.contains("interests") && j["interests"].is_array()) {
            u.interests = j["interests"].get<std::vector<std::string>>();
        }
        if (j.contains("skills") && j["skills"].is_array()) {
            u.skills = j["skills"].get<std::vector<std::string>>();
        }
        u.activityScore = j.value("activityScore", 0.0);
        u.joinedDate = j.value("joinedDate", "");
        u.buildInterestSet();
        return u;
    }
};

struct FriendRequest {
    int id{0};
    int fromUserId{0};
    int toUserId{0};
    std::string status{"pending"}; // pending, accepted, rejected
    std::string createdAt;

    nlohmann::json toJson() const {
        return nlohmann::json{
            {"id", id},
            {"fromUserId", fromUserId},
            {"toUserId", toUserId},
            {"status", status},
            {"createdAt", createdAt}
        };
    }

    static FriendRequest fromJson(const nlohmann::json& j) {
        FriendRequest r;
        r.id = j.value("id", 0);
        r.fromUserId = j.value("fromUserId", 0);
        r.toUserId = j.value("toUserId", 0);
        r.status = j.value("status", "pending");
        r.createdAt = j.value("createdAt", "");
        return r;
    }
};

struct Community {
    std::string id;
    std::string name;
    std::string description;
    std::string category;
    std::string avatar;
    std::string banner;
    std::vector<int> memberIds;
    std::vector<std::string> primaryInterests;

    nlohmann::json toJson() const {
        return nlohmann::json{
            {"id", id},
            {"name", name},
            {"description", description},
            {"category", category},
            {"avatar", avatar},
            {"banner", banner},
            {"memberIds", memberIds},
            {"primaryInterests", primaryInterests}
        };
    }

    static Community fromJson(const nlohmann::json& j) {
        Community c;
        c.id = j.value("id", "");
        c.name = j.value("name", "");
        c.description = j.value("description", "");
        c.category = j.value("category", "");
        c.avatar = j.value("avatar", "");
        c.banner = j.value("banner", "");
        if (j.contains("memberIds") && j["memberIds"].is_array()) {
            c.memberIds = j["memberIds"].get<std::vector<int>>();
        }
        if (j.contains("primaryInterests") && j["primaryInterests"].is_array()) {
            c.primaryInterests = j["primaryInterests"].get<std::vector<std::string>>();
        }
        return c;
    }
};
