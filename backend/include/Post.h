#pragma once

#include <string>
#include <vector>
#include <nlohmann/json.hpp>

struct Comment {
    int id{0};
    int authorId{0};
    std::string content;
    std::string createdAt;

    nlohmann::json toJson() const {
        return nlohmann::json{
            {"id", id},
            {"authorId", authorId},
            {"content", content},
            {"createdAt", createdAt}
        };
    }

    static Comment fromJson(const nlohmann::json& j) {
        Comment c;
        c.id = j.value("id", 0);
        c.authorId = j.value("authorId", 0);
        c.content = j.value("content", "");
        c.createdAt = j.value("createdAt", "");
        return c;
    }
};

struct Post {
    int id{0};
    int authorId{0};
    std::string content;
    std::string imageUrl;
    std::string postType{"standard"}; // standard, photo, video, poll, event
    std::vector<std::string> tags;
    int likes{0};
    std::vector<int> likedByUserIds;
    std::string createdAt;
    std::vector<Comment> comments;

    // Relevance score computed dynamically per requesting user
    double computedScore{0.0};

    nlohmann::json toJson() const {
        nlohmann::json commentsJson = nlohmann::json::array();
        for (const auto& c : comments) {
            commentsJson.push_back(c.toJson());
        }
        return nlohmann::json{
            {"id", id},
            {"authorId", authorId},
            {"content", content},
            {"imageUrl", imageUrl},
            {"postType", postType},
            {"tags", tags},
            {"likes", likes},
            {"likedByUserIds", likedByUserIds},
            {"createdAt", createdAt},
            {"comments", commentsJson},
            {"computedScore", computedScore}
        };
    }

    static Post fromJson(const nlohmann::json& j) {
        Post p;
        p.id = j.value("id", 0);
        p.authorId = j.value("authorId", 0);
        p.content = j.value("content", "");
        p.imageUrl = j.value("imageUrl", "");
        p.postType = j.value("postType", "standard");
        if (j.contains("tags") && j["tags"].is_array()) {
            p.tags = j["tags"].get<std::vector<std::string>>();
        }
        p.likes = j.value("likes", 0);
        if (j.contains("likedByUserIds") && j["likedByUserIds"].is_array()) {
            p.likedByUserIds = j["likedByUserIds"].get<std::vector<int>>();
        }
        p.createdAt = j.value("createdAt", "");
        if (j.contains("comments") && j["comments"].is_array()) {
            for (const auto& cj : j["comments"]) {
                p.comments.push_back(Comment::fromJson(cj));
            }
        }
        p.computedScore = j.value("computedScore", 0.0);
        return p;
    }
};
