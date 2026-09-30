#pragma once

#include "RecommendationEngine.h"

class API {
private:
    RecommendationEngine& engine;
    int port{8080};

public:
    API(RecommendationEngine& eng, int p = 8080);
    void start();
};
