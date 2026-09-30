# FriendSphere 🌐
### "Connect smarter. Discover naturally."
**Production-Grade Social Media Platform Powered by a Genuine C++17 Algorithmic Engine**
*Design and Analysis of Algorithms (DAA) Capstone Project*

FriendSphere is a full-stack social media website that delivers a realistic, polished product experience (inspired by LinkedIn, Facebook, and modern community platforms) while operating entirely on a high-performance **C++17 Algorithmic Core** over REST APIs.

---

## 🏛️ System Architecture

```
                                  ┌─────────────────────────────┐
                                  │   React 18 + Vite Frontend  │
                                  │ (Tailwind, D3.js, Recharts) │
                                  └──────────────┬──────────────┘
                                                 │ HTTP / JSON REST API
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │    C++ REST API Server      │
                                  │ (httplib.h + nlohmann/json) │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │ C++ Recommendation Engine   │
                                  └──────────────┬──────────────┘
                                                 │
            ┌──────────────┬──────────────┬──────┴───────┬──────────────┬──────────────┐
            ▼              ▼              ▼              ▼              ▼              ▼
       ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
       │  Graph  │    │   BFS   │    │   DFS   │    │Dijkstra │    │   DSU   │    │ KMeans  │
       │Adjacency│    │ 2nd-Deg │    │ Tarjan  │    │Affinity │    │ Union-  │    │ Feature │
       │  Lists  │    │ Mutuals │    │ Bridges │    │ Shortest│    │  Find   │    │Clusters │
       └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
            ▲              ▲              ▲              ▲              ▲              ▲
            │              │              │              │              │              │
       ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
       │ Jaccard │    │ Cosine  │    │Min-Heap │    │  Merge  │    │ Binary  │    │  Trie   │
       │Interest │    │ Vector  │    │  Top-K  │    │  Sort   │    │ Search  │    │ Prefix  │
       │  Index  │    │ Angle   │    │ Ranking │    │ Ranking │    │ Lookups │    │ Autocomp│
       └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │ Persistent JSON File Storage│
                                  │ (Users, Graph, Posts, etc.) │
                                  └─────────────────────────────┘
```

---

## 🧠 12 DAA Algorithms & Live Feature Mapping

| # | Algorithm | Implementation File | Website Feature & Behavior | Time Complexity | Space Complexity |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Breadth-First Search (BFS)** | `BFS.cpp` | Discovers 2nd-degree connections, counts mutual friends, and computes distance tiers (1-hop, 2-hop, 3-hop) | $O(V + E)$ | $O(V)$ |
| **2** | **Depth-First Search (DFS)** | `DFS.cpp` | Explores network connectivity, detects critical bridge ties with Tarjan's low-link values, and identifies 3-cliques | $O(V + E)$ | $O(V)$ |
| **3** | **Dijkstra's Algorithm** | `Dijkstra.cpp` | Finds shortest social affinity connection path where cost = $1 / \text{weight}$ | $O((V + E) \log V)$ | $O(V)$ |
| **4** | **Disjoint Set Union (DSU)** | `DSU.cpp` | Instant $O(\alpha(N))$ community detection and component grouping with Path Compression and Union by Rank | $O((V + E) \alpha(V))$ | $O(V)$ |
| **5** | **Jaccard Similarity** | `Similarity.cpp` | Interest and skill overlap ratio: $J(A, B) = \frac{\|A \cap B\|}{\|A \cup B\|}$ | $O(\|A\| + \|B\|)$ | $O(\|A\| + \|B\|)$ |
| **6** | **Cosine Similarity** | `Similarity.cpp` | High-dimensional geometric feature angle between interest vectors: $\cos(\theta) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|}$ | $O(D)$ | $O(D)$ |
| **7** | **Priority Queue (Max-Heap)** | `PriorityRanking.cpp`| Inserts candidate scores into `std::priority_queue` and extracts top 10 recommendations | $O(N \log K)$ | $O(K)$ |
| **8** | **Custom Merge Sort** | `Sorting.cpp` | Stable, deterministic divide-and-conquer ranking of recommendation candidates and feed posts | $O(N \log N)$ | $O(N)$ |
| **9** | **Binary Search** | `Searching.cpp` | Logarithmic $O(\log N)$ search across alphabetically sorted usernames and user ID indices | $O(\log N)$ | $O(1)$ |
| **10**| **Hash Map / Hash Set** | `Searching.cpp` | Instant $O(1)$ lookup for user profiles, friendship verification, and blocked user exclusion | $O(1)$ avg | $O(N)$ |
| **11**| **Trie (Prefix Tree)** | `Trie.cpp` | Sub-millisecond autocomplete across names, skills, and topic tags (`insert`, `search`, `startsWith`, `getSuggestions`) | $O(L + K)$ | $O(\Sigma \cdot L)$ |
| **12**| **K-Means Clustering** | `KMeans.cpp` | Unsupervised interest-space partitioning into thematic circles with K-Means++ initialization | $O(K \cdot N \cdot D \cdot I)$ | $O(K \cdot D + N)$ |

---

## 🎯 Configurable Multi-Signal Recommendation Formula

For any user $U$, the C++ backend scores every potential candidate $V$:

$$\text{Score}(U, V) = 0.35 \cdot \text{Mutual} + 0.20 \cdot \text{Jaccard} + 0.20 \cdot \text{Cosine} + 0.10 \cdot \text{Distance} + 0.10 \cdot \text{College} + 0.05 \cdot \text{Community}$$

### Exclusions:
* Self (ID match)
* Current direct friends (Adjacency Hash Set)
* Blocked users (Blocked Hash Set)
* Dismissed / rejected suggestions
* Pending friend requests

---

## 🚀 How to Run FriendSphere

### Prerequisites
* **C++ Compiler**: `g++` (C++17 or later) or `clang++`
* **Node.js**: v18+ & `npm`

### Step 1: Run the C++ Backend Server

```bash
# In Linux / macOS / WSL (Ubuntu)
cd /path/to/FriendSphere
g++ -std=c++17 -O3 -pthread -Ibackend/include backend/src/*.cpp -o friendsphere_server
./friendsphere_server 8080 data

# In Windows (MinGW / MSVC)
g++ -std=c++17 -O3 -Ibackend/include backend/src/*.cpp -o friendsphere_server.exe -lws2_32 -lcrypt32
./friendsphere_server.exe 8080 data
```
Server starts on `http://localhost:8080`.

### Step 2: Run the React Frontend

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser. The Vite development server automatically proxies all `/api` calls directly to the C++ backend on port 8080.

---

## 📡 REST API Reference

| Endpoint | Method | Description | Algorithm |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Health check & engine status | System |
| `/api/users/:id/suggestions` | `GET` | Intelligent friend recommendations | BFS + Jaccard + Cosine + Dijkstra + Max-Heap |
| `/api/users/:id/recommendations/explain/:candId` | `GET` | Explainability breakdown ("Why am I seeing this?") | DAA Metrics |
| `/api/recommendations/weights` | `GET`, `POST` | Get or update dynamic scoring weights | Heuristic System |
| `/api/users/:id/network` | `GET` | 1-hop, 2-hop, 3-hop distance tiers | Breadth-First Search |
| `/api/users/:id/network/explore` | `GET` | Full traversal order, bridges & cliques | Depth-First Search |
| `/api/network/shortest-path?from=...&to=...` | `GET` | Shortest social connection path | Dijkstra's Algorithm |
| `/api/communities` & `/api/network/communities` | `GET` | Connected communities & clusters | Union-Find (DSU) & K-Means |
| `/api/users/:a/similarity/:b` | `GET` | Exact Jaccard & Cosine calculation | Similarity Engine |
| `/api/search/users?q=...` | `GET` | Binary search on sorted user indices | Binary Search |
| `/api/search/autocomplete?q=...` | `GET` | Instant prefix completions | Trie Prefix Tree |
| `/api/users/:id/feed` | `GET` | Personalized relevance-ranked feed | Custom Merge Sort |
| `/api/friends/request` | `POST` | Send friend request | Graph System |
| `/api/friends/accept` | `POST` | Accept friend request (updates Graph & DSU) | Dynamic Graph |
| `/api/friends/remove` | `POST`, `DELETE`| Remove friendship (removes Graph edge) | Dynamic Graph |
| `/api/users/:id/block` | `POST` | Add user to Blocked Hash Set | Hash Set |
| `/api/algorithms/all` | `GET` | Microsecond benchmarks for all 12 algorithms | Benchmarking |

---

## 📄 License
Created for Academic & Educational Demonstration in Design and Analysis of Algorithms (DAA).
