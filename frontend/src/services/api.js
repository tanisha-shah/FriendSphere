const API_BASE = '/api';

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('C++ Algorithmic Core is currently unreachable.');
    return res.json();
  },

  // Users & Profiles
  async getUsers() {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Failed to load users');
    return res.json();
  },

  async getUser(id) {
    const res = await fetch(`${API_BASE}/users/${id}`);
    if (!res.ok) throw new Error('User not found');
    return res.json();
  },

  async getUserFriends(id) {
    const res = await fetch(`${API_BASE}/users/${id}/friends`);
    if (!res.ok) throw new Error('Failed to load friends');
    return res.json();
  },

  async updateProfile(userData) {
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Recommendations & Intelligent Discovery
  async getRecommendations(userId, topK = 10) {
    const res = await fetch(`${API_BASE}/users/${userId}/recommendations?topK=${topK}`);
    if (!res.ok) throw new Error('Failed to compute friend recommendations');
    return res.json();
  },

  async getSuggestions(userId, topK = 10) {
    const res = await fetch(`${API_BASE}/users/${userId}/suggestions?topK=${topK}`);
    if (!res.ok) throw new Error('Failed to compute friend suggestions');
    return res.json();
  },

  async getExplanation(sourceId, candidateId) {
    const res = await fetch(`${API_BASE}/users/${sourceId}/recommendations/explain/${candidateId}`);
    if (!res.ok) throw new Error('Failed to fetch recommendation explainability');
    return res.json();
  },

  async dismissRecommendation(userId, candidateId) {
    const res = await fetch(`${API_BASE}/recommendations/dismiss`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, candidateId }),
    });
    return res.json();
  },

  async getScoringWeights() {
    const res = await fetch(`${API_BASE}/recommendations/weights`);
    return res.json();
  },

  async updateScoringWeights(weights) {
    const res = await fetch(`${API_BASE}/recommendations/weights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weights),
    });
    return res.json();
  },

  // Network & Traversal (BFS & DFS)
  async getUserNetwork(userId) {
    const res = await fetch(`${API_BASE}/users/${userId}/network`);
    if (!res.ok) throw new Error('Failed to fetch BFS network separation');
    return res.json();
  },

  async getUserNetworkExplore(userId) {
    const res = await fetch(`${API_BASE}/users/${userId}/network/explore`);
    if (!res.ok) throw new Error('Failed to fetch DFS network exploration');
    return res.json();
  },

  // Shortest Path (Dijkstra)
  async getShortestPath(from, to) {
    const res = await fetch(`${API_BASE}/network/shortest-path?from=${from}&to=${to}`);
    if (!res.ok) throw new Error('Failed to calculate shortest connection path');
    return res.json();
  },

  async getDijkstraPath(source, target) {
    return this.getShortestPath(source, target);
  },

  // Similarity Engine (Jaccard & Cosine)
  async getSimilarity(userA, userB) {
    const res = await fetch(`${API_BASE}/users/${userA}/similarity/${userB}`);
    if (!res.ok) throw new Error('Failed to compute similarity analysis');
    return res.json();
  },

  // Communities (DSU & KMeans)
  async getCommunities(format = '') {
    const url = format ? `${API_BASE}/communities?format=${format}` : `${API_BASE}/communities`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch communities');
    return res.json();
  },

  async getNetworkCommunities() {
    const res = await fetch(`${API_BASE}/network/communities`);
    if (!res.ok) throw new Error('Failed to fetch DSU components');
    return res.json();
  },

  async getClusters() {
    const res = await fetch(`${API_BASE}/clusters`);
    if (!res.ok) throw new Error('Failed to fetch KMeans clusters');
    return res.json();
  },

  // Search (Binary Search & Trie Autocomplete)
  async searchUsersBinary(query) {
    const res = await fetch(`${API_BASE}/search/users?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Binary search query failed');
    return res.json();
  },

  async getAutocomplete(prefix, limit = 10) {
    const res = await fetch(`${API_BASE}/search/autocomplete?q=${encodeURIComponent(prefix)}&limit=${limit}`);
    if (!res.ok) return { suggestions: [] };
    return res.json();
  },

  async searchUsers(query, limit = 10) {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!res.ok) throw new Error('Search query failed');
    return res.json();
  },

  // Feed & Posts
  async getFeed(userId, limit = 30) {
    const res = await fetch(`${API_BASE}/users/${userId}/feed?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to load feed');
    return res.json();
  },

  async createPost(authorId, content, tags = []) {
    const res = await fetch(`${API_BASE}/posts/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId, content, tags }),
    });
    return res.json();
  },

  async likePost(postId, userId) {
    const res = await fetch(`${API_BASE}/posts/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, userId }),
    });
    return res.json();
  },

  async addComment(postId, authorId, content) {
    const res = await fetch(`${API_BASE}/posts/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, authorId, content }),
    });
    return res.json();
  },

  // Friend Requests & Graph Updates
  async sendRequest(fromUserId, toUserId) {
    const res = await fetch(`${API_BASE}/friends/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromUserId, toUserId }),
    });
    return res.json();
  },

  async acceptRequest(requestId) {
    const res = await fetch(`${API_BASE}/friends/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });
    return res.json();
  },

  async rejectRequest(requestId) {
    const res = await fetch(`${API_BASE}/requests/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });
    return res.json();
  },

  async removeFriend(user1Id, user2Id) {
    const res = await fetch(`${API_BASE}/friends/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user1Id, user2Id }),
    });
    return res.json();
  },

  async getPendingRequests(userId) {
    const res = await fetch(`${API_BASE}/users/${userId}/requests/pending`);
    return res.json();
  },

  async getSentRequests(userId) {
    const res = await fetch(`${API_BASE}/users/${userId}/requests/sent`);
    return res.json();
  },

  async getMutualFriends(u, v) {
    const res = await fetch(`${API_BASE}/users/${u}/mutual/${v}`);
    return res.json();
  },

  // Blocking System (Real Hash Set exclusion)
  async blockUser(userId, targetId) {
    const res = await fetch(`${API_BASE}/users/${targetId}/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, targetId }),
    });
    return res.json();
  },

  async unblockUser(userId, targetId) {
    const res = await fetch(`${API_BASE}/users/unblock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, targetId }),
    });
    return res.json();
  },

  async getBlockedUsers(userId) {
    const res = await fetch(`${API_BASE}/users/${userId}/blocked`);
    return res.json();
  },

  // Analytics & Graph Visualization
  async getGraphData(centerId = 0, radius = 2) {
    const res = await fetch(`${API_BASE}/graph?centerId=${centerId}&radius=${radius}`);
    return res.json();
  },

  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`);
    return res.json();
  },

  async getInterests() {
    const res = await fetch(`${API_BASE}/interests`);
    return res.json();
  },

  // Algorithm Benchmarks & Traces
  async getAllAlgorithmsBenchmark() {
    const res = await fetch(`${API_BASE}/algorithms/all`);
    return res.json();
  },

  async getBfsTrace(start, maxDepth = 3) {
    const res = await fetch(`${API_BASE}/algorithms/bfs-trace?start=${start}&maxDepth=${maxDepth}`);
    return res.json();
  },

  async getDfsTrace(start, maxDepth = 4) {
    const res = await fetch(`${API_BASE}/algorithms/dfs-trace?start=${start}&maxDepth=${maxDepth}`);
    return res.json();
  },

  async getBridges() {
    const res = await fetch(`${API_BASE}/algorithms/bridges`);
    return res.json();
  },

  async getTriangles(userId) {
    const res = await fetch(`${API_BASE}/algorithms/triangles/${userId}`);
    return res.json();
  }
};
