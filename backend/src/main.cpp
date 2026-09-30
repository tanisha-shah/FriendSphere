#include "../include/RecommendationEngine.h"
#include "../include/API.h"
#include <iostream>
#include <string>

int main(int argc, char* argv[]) {
    int port = 8080;
    std::string dataDir = "data";

    if (argc > 1) {
        port = std::stoi(argv[1]);
    }
    if (argc > 2) {
        dataDir = argv[2];
    }

    std::cout << "Starting FriendSphere Backend Server...\n";
    std::cout << "Loading dataset from: " << dataDir << std::endl;

    RecommendationEngine engine(dataDir);
    std::cout << "Loaded " << engine.getAllUsers().size() << " users, "
              << engine.getGraph().getEdgeCount() << " friendships into Social Graph.\n";

    API api(engine, port);
    api.start();

    return 0;
}
