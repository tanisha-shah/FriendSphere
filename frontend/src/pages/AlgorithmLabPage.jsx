import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ForceGraphViewer } from '../components/ForceGraphViewer';
import {
  Cpu,
  Play,
  RotateCcw,
  Sparkles,
  GitBranch,
  Network,
  Shield,
  Layers,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Users,
  ChevronRight,
  Database,
  Binary,
  Code2,
  BarChart3,
  Boxes,
  Zap,
  HelpCircle
} from 'lucide-react';
import { AlgorithmBadge } from '../components/AlgorithmBadge';

export const AlgorithmLabPage = () => {
  const { currentUser, allUsers } = useAuth();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bfs'); // bfs, dfs, dijkstra, jaccard, cosine, priorityqueue, mergesort, binarysearch, trie, dsu, kmeans

  // Benchmark stats
  const [benchmarks, setBenchmarks] = useState([]);

  // Algorithm-specific state
  // 1. BFS State
  const [bfsStartUser, setBfsStartUser] = useState(currentUser?.id || 1);
  const [bfsResult, setBfsResult] = useState(null);
  const [bfsStepIdx, setBfsStepIdx] = useState(0);

  useEffect(() => {
    if (currentUser?.id) {
      setBfsStartUser(currentUser.id);
    }
  }, [currentUser]);

  // 2. DFS State
  const [dfsStartUser, setDfsStartUser] = useState(1);
  const [dfsResult, setDfsResult] = useState(null);
  const [dfsStepIdx, setDfsStepIdx] = useState(0);

  // 3. Dijkstra State
  const [dijkstraFrom, setDijkstraFrom] = useState(1);
  const [dijkstraTo, setDijkstraTo] = useState(15);
  const [dijkstraResult, setDijkstraResult] = useState(null);

  // 4. Similarity State (Jaccard & Cosine)
  const [simUserA, setSimUserA] = useState(1);
  const [simUserB, setSimUserB] = useState(5);
  const [simResult, setSimResult] = useState(null);

  // 5. Priority Queue State
  const [pqUser, setPqUser] = useState(1);
  const [pqResults, setPqResults] = useState([]);
  const [pqStep, setPqStep] = useState(0);

  // 6. Merge Sort State
  const [sortItems, setSortItems] = useState([
    { id: 1, name: 'Khushi', score: 95 },
    { id: 19, name: 'Maya', score: 93 },
    { id: 5, name: 'Priya', score: 88 },
    { id: 2, name: 'Rahul', score: 72 },
    { id: 14, name: 'Rohan', score: 84 },
    { id: 33, name: 'Deepak', score: 90 },
    { id: 42, name: 'Leila', score: 91 },
    { id: 29, name: 'Sneha', score: 86 }
  ]);
  const [mergeSortSteps, setMergeSortSteps] = useState([]);
  const [sortStepIdx, setSortStepIdx] = useState(0);

  // 7. Binary Search State
  const [searchQuery, setSearchQuery] = useState('khushi_s');
  const [binarySearchResult, setBinarySearchResult] = useState(null);

  // 8. Trie State
  const [triePrefix, setTriePrefix] = useState('pro');
  const [trieSuggestions, setTrieSuggestions] = useState([]);

  // 9. DSU State
  const [dsuResult, setDsuResult] = useState(null);

  // 10. KMeans State
  const [clusters, setClusters] = useState([]);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [gData, benchData, dsuData, clusterData] = await Promise.all([
          api.getGraphData(0, 3),
          api.getAllAlgorithmsBenchmark().catch(() => []),
          api.getNetworkCommunities().catch(() => null),
          api.getClusters().catch(() => [])
        ]);
        setGraphData(gData);
        setBenchmarks(benchData);
        setDsuResult(dsuData);
        setClusters(clusterData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // Fetch BFS data when tab or start user changes
  useEffect(() => {
    if (activeTab === 'bfs') {
      api.getUserNetwork(bfsStartUser).then(setBfsResult).catch(console.error);
    }
  }, [activeTab, bfsStartUser]);

  // Fetch DFS data
  useEffect(() => {
    if (activeTab === 'dfs') {
      api.getUserNetworkExplore(dfsStartUser).then(setDfsResult).catch(console.error);
    }
  }, [activeTab, dfsStartUser]);

  // Fetch Dijkstra
  useEffect(() => {
    if (activeTab === 'dijkstra') {
      api.getShortestPath(dijkstraFrom, dijkstraTo).then(setDijkstraResult).catch(console.error);
    }
  }, [activeTab, dijkstraFrom, dijkstraTo]);

  // Fetch Similarity
  useEffect(() => {
    if (activeTab === 'jaccard' || activeTab === 'cosine') {
      api.getSimilarity(simUserA, simUserB).then(setSimResult).catch(console.error);
    }
  }, [activeTab, simUserA, simUserB]);

  // Fetch Priority Queue recommendations
  useEffect(() => {
    if (activeTab === 'priorityqueue') {
      api.getSuggestions(pqUser, 10).then(setPqResults).catch(console.error);
    }
  }, [activeTab, pqUser]);

  // Fetch Binary Search
  useEffect(() => {
    if (activeTab === 'binarysearch') {
      api.searchUsersBinary(searchQuery).then(setBinarySearchResult).catch(console.error);
    }
  }, [activeTab, searchQuery]);

  // Fetch Trie Autocomplete
  useEffect(() => {
    if (activeTab === 'trie') {
      api.getAutocomplete(triePrefix).then(res => setTrieSuggestions(res.suggestions || [])).catch(console.error);
    }
  }, [activeTab, triePrefix]);

  const algorithmTabs = [
    { id: 'bfs', label: '1. BFS Traversal', badge: 'O(V + E)', color: 'text-blue-400' },
    { id: 'dfs', label: '2. DFS Exploration', badge: 'O(V + E)', color: 'text-text-secondary' },
    { id: 'dijkstra', label: '3. Dijkstra Path', badge: 'O((V+E) log V)', color: 'text-teal-dark' },
    { id: 'dsu', label: '4. Union-Find (DSU)', badge: 'O(α(N))', color: 'text-text-secondary' },
    { id: 'jaccard', label: '5. Jaccard Index', badge: 'O(|A| + |B|)', color: 'text-teal-dark' },
    { id: 'cosine', label: '6. Cosine Vector', badge: 'O(D)', color: 'text-teal-dark' },
    { id: 'priorityqueue', label: '7. Max-Heap Queue', badge: 'O(N log K)', color: 'text-teal-dark' },
    { id: 'mergesort', label: '8. Merge Sort', badge: 'O(N log N)', color: 'text-pink-400' },
    { id: 'binarysearch', label: '9. Binary Search', badge: 'O(log N)', color: 'text-cyan-400' },
    { id: 'trie', label: '10. Trie Prefix', badge: 'O(L + K)', color: 'text-lime-400' },
    { id: 'kmeans', label: '11. K-Means++', badge: 'O(K·N·D·I)', color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          How FriendSphere Thinks
        </h1>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {algorithmTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2.5 rounded-lg whitespace-nowrap text-xs font-bold transition-all flex items-center gap-2 border ${
              activeTab === tab.id
                ? 'bg-surface border-teal-primary/60 text-surface shadow-sm shadow-sm'
                : 'bg-surface-sec border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-sec'
            }`}
          >
            <span className={tab.color}>{tab.label}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg text-text-secondary border border-border-subtle">
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* ACTIVE ALGORITHM VISUALIZATION CANVAS */}
      <div className="glow-card rounded-xl p-6 border border-border-subtle bg-surface-sec space-y-6">

        {/* 1. BFS VISUALIZATION */}
        {activeTab === 'bfs' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="border-b border-border-subtle pb-4">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <span className="text-blue-400 font-mono">1. Breadth-First Search (BFS)</span>
                <span className="text-xs text-text-secondary font-normal">• Friends-of-Friends & Distance Tiers</span>
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Discovers 1-hop direct friends, 2-hop friends-of-friends, and 3-hop wider social ties layer by layer using a FIFO Queue.
              </p>
            </div>

            {/* BFS Execution Flow Chart: Active Profile -> Queue -> Visited -> Friends-of-Friends */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              {/* Active Profile */}
              <div className="p-4 rounded-lg bg-bg border border-blue-500/30 space-y-2">
                <div className="text-text-secondary uppercase text-[10px] font-bold tracking-wider">1. Active Profile</div>
                <div className="font-bold text-blue-400 text-sm">{bfsResult?.input?.name || currentUser?.name || 'Tanisha Shah'}</div>
                <div className="text-[11px] text-text-secondary">Node ID: {bfsStartUser}</div>
              </div>

              {/* FIFO Queue */}
              <div className="p-4 rounded-lg bg-bg border border-border-subtle space-y-2">
                <div className="text-text-secondary uppercase text-[10px] font-bold tracking-wider">2. C++ FIFO Queue</div>
                <div className="flex flex-wrap gap-1 text-[11px]">
                  {bfsResult?.steps?.slice(0, 6).map((s, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-blue-950/60 border border-blue-800 text-blue-300 rounded">
                      U{s.userId}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visited Nodes */}
              <div className="p-4 rounded-lg bg-bg border border-border-subtle space-y-2">
                <div className="text-text-secondary uppercase text-[10px] font-bold tracking-wider">3. Visited Set</div>
                <div className="text-teal-dark font-bold">{bfsResult?.steps?.length || 0} nodes processed</div>
                <div className="text-[10px] text-text-secondary">O(1) Hash Set Lookup</div>
              </div>

              {/* Distance Tiers */}
              <div className="p-4 rounded-lg bg-bg border border-border-subtle space-y-2">
                <div className="text-text-secondary uppercase text-[10px] font-bold tracking-wider">4. Discovered Tiers</div>
                <div className="space-y-0.5 text-[11px]">
                  <div className="text-teal-dark">1-Hop: {bfsResult?.result?.directFriends?.length || 0} direct</div>
                  <div className="text-teal-dark">2-Hop: {bfsResult?.result?.twoHopFriends?.length || 0} candidates</div>
                  <div className="text-teal-dark">3-Hop: {bfsResult?.result?.threeHopConnections?.length || 0} extended</div>
                </div>
              </div>
            </div>

            {/* Discovered Candidates Cards */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-text-primary">2nd-Degree Friends-of-Friends (Recommendation Pool):</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {bfsResult?.result?.twoHopFriends?.slice(0, 8).map(u => (
                  <div key={u.userId} className="p-3 rounded-lg bg-surface-sec border border-border-subtle flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-xl object-cover border border-border-subtle" />
                    <div className="truncate">
                      <div className="text-xs font-bold text-text-primary truncate">{u.name}</div>
                      <div className="text-[10px] text-teal-dark">2 Hops Away</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complexity Footer */}
            <div className="p-3 rounded-lg bg-bg border border-border-subtle/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-text-secondary">Time Complexity: <strong className="text-teal-dark">O(V + E)</strong></span>
              <span className="text-text-secondary">Space Complexity: <strong className="text-teal-dark">O(V)</strong></span>
              <span className="text-text-secondary">C++ Data Structure: <strong className="text-blue-400">std::queue&lt;int&gt;</strong></span>
            </div>
          </div>
        )}

        {/* 2. DFS VISUALIZATION */}
        {activeTab === 'dfs' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="text-text-secondary font-mono">2. Depth-First Search (DFS) & Bridge Detection</span>
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Explores connected network depth recursively and identifies critical social bridge edges using Tarjan's low-link values.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-text-secondary">Root Node:</span>
                <select
                  value={dfsStartUser}
                  onChange={(e) => setDfsStartUser(Number(e.target.value))}
                  className="bg-surface text-text-primary px-3 py-1.5 rounded-xl border border-border-subtle font-medium"
                >
                  {allUsers.slice(0, 15).map(u => (
                    <option key={u.id} value={u.id}>{u.name} (ID: {u.id})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Traversal Order sequence */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-text-secondary">DFS Traversal Order Sequence:</span>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {dfsResult?.result?.traversalOrder?.slice(0, 14).map((node, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-sec border border-border-subtle text-text-primary">
                    <span className="text-text-secondary font-bold">#{i + 1}</span>
                    <span>{node.name}</span>
                    <span className="text-[10px] text-surface0">(d={node.depth})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bridges */}
            {dfsResult?.result?.bridges && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-text-secondary">Detected Critical Bridge Ties:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {dfsResult.result.bridges.map((b, i) => (
                    <div key={i} className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
                      <span className="font-semibold text-text-primary">{b.uName}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-text-secondary" />
                      <span className="font-semibold text-text-primary">{b.vName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-bg border border-border-subtle/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-text-secondary">Time Complexity: <strong className="text-teal-dark">O(V + E)</strong></span>
              <span className="text-text-secondary">Space Complexity: <strong className="text-teal-dark">O(V) (Call Stack)</strong></span>
              <span className="text-text-secondary">Algorithm: <strong className="text-text-secondary">Tarjan's Bridge Finder</strong></span>
            </div>
          </div>
        )}

        {/* 3. DIJKSTRA VISUALIZATION */}
        {activeTab === 'dijkstra' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="text-teal-dark font-mono">3. Dijkstra's Shortest Social Route</span>
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Finds the optimal path of highest interaction affinity between two people. Cost = 1 / weight.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-text-secondary">From:</span>
                <select
                  value={dijkstraFrom}
                  onChange={(e) => setDijkstraFrom(Number(e.target.value))}
                  className="bg-surface text-text-primary px-2.5 py-1.5 rounded-xl border border-border-subtle"
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>

                <span className="text-text-secondary">To:</span>
                <select
                  value={dijkstraTo}
                  onChange={(e) => setDijkstraTo(Number(e.target.value))}
                  className="bg-surface text-text-primary px-2.5 py-1.5 rounded-xl border border-border-subtle"
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Path visualization */}
            {dijkstraResult && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-bg border border-emerald-500/30 space-y-3">
                  <div className="text-xs font-bold text-text-secondary">Optimal Connection Path ({dijkstraResult.result?.distance} hops):</div>
                  <div className="flex flex-wrap items-center gap-3">
                    {dijkstraResult.result?.pathUsers?.map((u, i) => (
                      <React.Fragment key={u.userId}>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-sec border border-emerald-500/40 shadow-sm">
                          <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-lg object-cover" />
                          <span className="text-xs font-bold text-text-primary">{u.name}</span>
                        </div>
                        {i < dijkstraResult.result.pathUsers.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-teal-dark shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Node Distance Table */}
                <div className="p-3 rounded-lg bg-surface-sec border border-border-subtle text-xs font-mono grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-text-secondary block text-[10px]">Total Distance</span>
                    <strong className="text-teal-dark">{dijkstraResult.result?.distance} Hops</strong>
                  </div>
                  <div>
                    <span className="text-text-secondary block text-[10px]">Friction Cost</span>
                    <strong className="text-teal-dark">{dijkstraResult.result?.totalCost?.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-text-secondary block text-[10px]">Social Affinity</span>
                    <strong className="text-teal-dark">{Math.round((dijkstraResult.result?.socialAffinityScore || 0.8) * 100)}%</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-bg border border-border-subtle/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-text-secondary">Time Complexity: <strong className="text-teal-dark">O((V + E) log V)</strong></span>
              <span className="text-text-secondary">Space Complexity: <strong className="text-teal-dark">O(V)</strong></span>
              <span className="text-text-secondary">Data Structure: <strong className="text-teal-dark">std::priority_queue (Min-Heap)</strong></span>
            </div>
          </div>
        )}

        {/* 4. JACCARD SIMILARITY */}
        {activeTab === 'jaccard' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="text-teal-dark font-mono">5. Jaccard Similarity Index</span>
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Formula: J(A, B) = |A ∩ B| / |A ∪ B|. Calculates discrete interest set overlap percentage.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <select
                  value={simUserA}
                  onChange={(e) => setSimUserA(Number(e.target.value))}
                  className="bg-surface text-text-primary px-2.5 py-1.5 rounded-xl border border-border-subtle"
                >
                  {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <span className="text-text-secondary">vs</span>
                <select
                  value={simUserB}
                  onChange={(e) => setSimUserB(Number(e.target.value))}
                  className="bg-surface text-text-primary px-2.5 py-1.5 rounded-xl border border-border-subtle"
                >
                  {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>

            {simResult && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* User A Interests */}
                <div className="p-4 rounded-lg bg-bg border border-border-subtle space-y-2">
                  <div className="font-bold text-text-primary">{simResult.input?.userA?.name} (Set A)</div>
                  <div className="flex flex-wrap gap-1">
                    {simResult.input?.userA?.interests?.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60 font-mono text-[11px]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Intersection & Score */}
                <div className="p-4 rounded-lg bg-teal-950/20 border border-teal-500/40 text-center flex flex-col justify-center items-center space-y-2">
                  <div className="text-[10px] uppercase font-bold text-teal-dark tracking-wider">Jaccard Score</div>
                  <div className="text-3xl font-black font-mono text-teal-dark">
                    {simResult.result?.jaccardPercentage}%
                  </div>
                  <div className="text-[11px] text-text-secondary font-mono">
                    Intersection: {simResult.result?.intersectionCount} / Union: {simResult.result?.unionCount}
                  </div>
                </div>

                {/* User B Interests */}
                <div className="p-4 rounded-lg bg-bg border border-border-subtle space-y-2">
                  <div className="font-bold text-text-primary">{simResult.input?.userB?.name} (Set B)</div>
                  <div className="flex flex-wrap gap-1">
                    {simResult.input?.userB?.interests?.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-purple-950/60 text-teal-dark border border-purple-800/60 font-mono text-[11px]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-bg border border-border-subtle/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-text-secondary">Time Complexity: <strong className="text-teal-dark">O(|A| + |B|)</strong></span>
              <span className="text-text-secondary">Space Complexity: <strong className="text-teal-dark">O(|A| + |B|)</strong></span>
              <span className="text-text-secondary">Formula: <strong className="text-teal-dark">|A ∩ B| / |A ∪ B|</strong></span>
            </div>
          </div>
        )}

        {/* 5. COSINE SIMILARITY */}
        {activeTab === 'cosine' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="text-teal-dark font-mono">6. High-Dimensional Cosine Similarity</span>
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Formula: cos(θ) = (A · B) / (||A|| * ||B||). Compares vectorized feature embeddings in 20-dimensional interest space.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <select
                  value={simUserA}
                  onChange={(e) => setSimUserA(Number(e.target.value))}
                  className="bg-surface text-text-primary px-2.5 py-1.5 rounded-xl border border-border-subtle"
                >
                  {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <span className="text-text-secondary">vs</span>
                <select
                  value={simUserB}
                  onChange={(e) => setSimUserB(Number(e.target.value))}
                  className="bg-surface text-text-primary px-2.5 py-1.5 rounded-xl border border-border-subtle"
                >
                  {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>

            {simResult && (
              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-indigo-950/20 border border-indigo-500/40 flex flex-col items-center justify-center text-center space-y-2">
                  <span className="text-xs font-mono uppercase text-teal-dark">Normalized Vector Cosine Score</span>
                  <div className="text-4xl font-black font-mono text-teal-dark">
                    {simResult.result?.cosineSimilarity}
                  </div>
                  <p className="text-xs text-text-secondary max-w-md">
                    Represents the geometric angle cos(θ) between the two profile vectors in global feature vocabulary space.
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-bg border border-border-subtle/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-text-secondary">Time Complexity: <strong className="text-teal-dark">O(D) (D = Vocabulary Dimensions)</strong></span>
              <span className="text-text-secondary">Space Complexity: <strong className="text-teal-dark">O(D)</strong></span>
            </div>
          </div>
        )}

        {/* 6. PRIORITY QUEUE (HEAP) */}
        {activeTab === 'priorityqueue' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="text-teal-dark font-mono">7. Max-Heap Priority Queue Extraction</span>
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Inserts candidate friend scores into a C++ std::priority_queue and pops top-K recommendations in O(N log K).
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-text-secondary">Target User:</span>
                <select
                  value={pqUser}
                  onChange={(e) => setPqUser(Number(e.target.value))}
                  className="bg-surface text-text-primary px-2.5 py-1.5 rounded-xl border border-border-subtle"
                >
                  {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>

            {/* Heap Extraction Cards */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-teal-dark">Top-Ranked Candidates Popped from Heap:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pqResults.slice(0, 6).map((c, i) => (
                  <div key={c.userId} className="p-4 rounded-lg bg-bg border border-purple-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                        <span className="text-teal-dark font-mono">#{i + 1}</span>
                        <span>{c.name}</span>
                      </div>
                      <div className="text-[11px] text-text-secondary mt-0.5">{c.mutualFriends} mutual friends • {c.connectionDistance} hops</div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black font-mono text-teal-dark">{Math.round((c.score || 0.8) * 100)}%</span>
                      <span className="text-[9px] block text-surface0 font-mono">HEAP ROOT</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-bg border border-border-subtle/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-text-secondary">Time Complexity: <strong className="text-teal-dark">O(N log K)</strong></span>
              <span className="text-text-secondary">Space Complexity: <strong className="text-teal-dark">O(K)</strong></span>
              <span className="text-text-secondary">C++ Implementation: <strong className="text-teal-dark">std::priority_queue&lt;Candidate&gt;</strong></span>
            </div>
          </div>
        )}

        {/* 7. MERGE SORT */}
        {activeTab === 'mergesort' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="border-b border-border-subtle pb-4">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <span className="text-pink-400 font-mono">8. Custom Divide-and-Conquer Merge Sort</span>
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Deterministic O(N log N) stable sorting used to rank personalized feeds and candidate recommendation lists.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-xs font-bold text-text-secondary">Recursive Partition & Merge Tree:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                {sortItems.map((item, i) => (
                  <div key={item.id} className="p-3 rounded-lg bg-bg border border-border-subtle flex items-center justify-between">
                    <div>
                      <span className="text-text-secondary text-[10px]">Index [{i}]</span>
                      <div className="font-bold text-text-primary">{item.name}</div>
                    </div>
                    <div className="text-pink-400 font-bold text-sm">{item.score} pts</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-bg border border-border-subtle/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-text-secondary">Time Complexity: <strong className="text-teal-dark">O(N log N)</strong></span>
              <span className="text-text-secondary">Space Complexity: <strong className="text-teal-dark">O(N)</strong></span>
              <span className="text-text-secondary">Property: <strong className="text-pink-400">Stable & Deterministic</strong></span>
            </div>
          </div>
        )}

        {/* 8. BINARY SEARCH */}
        {activeTab === 'binarysearch' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="text-cyan-400 font-mono">9. Binary Search on Sorted Indices</span>
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Logarithmic O(log N) lookup across sorted user IDs and alphabetically sorted usernames.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Username or User ID..."
                  className="bg-surface text-text-primary px-3 py-1.5 rounded-xl border border-border-subtle font-mono"
                />
              </div>
            </div>

            {/* Binary Search Trace */}
            {binarySearchResult && (
              <div className="space-y-3 text-xs">
                <div className="font-bold text-text-secondary">Step-by-Step Binary Halving Log:</div>
                <div className="space-y-2 font-mono">
                  {binarySearchResult.steps?.map((step) => (
                    <div key={step.stepNumber} className="p-3 rounded-lg bg-bg border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[11px] font-bold">
                          Step {step.stepNumber}
                        </span>
                        <span className="text-text-secondary">[L: {step.left}, Mid: {step.mid}, R: {step.right}]</span>
                      </div>
                      <div className="text-text-primary">{step.comparison}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-bg border border-border-subtle/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-text-secondary">Time Complexity: <strong className="text-teal-dark">O(log N)</strong></span>
              <span className="text-text-secondary">Space Complexity: <strong className="text-teal-dark">O(1)</strong></span>
              <span className="text-text-secondary">Comparisons: <strong className="text-cyan-400">{binarySearchResult?.result?.comparisonsCount || 1}</strong></span>
            </div>
          </div>
        )}

        {/* 9. TRIE PREFIX AUTOCOMPLETE */}
        {activeTab === 'trie' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="text-lime-400 font-mono">10. Trie (Prefix Tree) Autocomplete</span>
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Prefix tree enabling sub-millisecond instant word completions and character branch traversals.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-text-secondary">Type Prefix:</span>
                <input
                  type="text"
                  value={triePrefix}
                  onChange={(e) => setTriePrefix(e.target.value)}
                  placeholder="e.g. pro, al, kh..."
                  className="bg-surface text-text-primary px-3 py-1.5 rounded-xl border border-border-subtle font-mono text-xs"
                />
              </div>
            </div>

            {/* Trie Suggestions */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-text-secondary">Trie Matched Subtree Suggestions for '{triePrefix}':</span>
              <div className="flex flex-wrap gap-2">
                {trieSuggestions.length > 0 ? (
                  trieSuggestions.map((s, i) => (
                    <div key={i} className="px-3 py-1.5 rounded-lg bg-lime-950/30 border border-lime-500/40 text-lime-300 font-mono text-xs flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5" />
                      <span>{s}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-surface0 font-mono">No prefix matches in Trie vocabulary.</div>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-bg border border-border-subtle/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-text-secondary">Time Complexity: <strong className="text-teal-dark">O(L + K) (L = Prefix Length)</strong></span>
              <span className="text-text-secondary">Space Complexity: <strong className="text-teal-dark">O(Σ · L)</strong></span>
            </div>
          </div>
        )}

        {/* 10. UNION-FIND (DSU) */}
        {activeTab === 'dsu' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="border-b border-border-subtle pb-4">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <span className="text-text-secondary font-mono">4. Disjoint Set Union (DSU / Union-Find)</span>
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Maintains connected social network components and communities with union-by-rank and path compression in nearly O(1) amortized time.
              </p>
            </div>

            {dsuResult?.result?.dsuComponents && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {dsuResult.result.dsuComponents.map((comp) => (
                  <div key={comp.componentRootId} className="p-4 rounded-lg bg-bg border border-amber-500/30 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-text-secondary font-mono">DSU Root Leader: User #{comp.componentRootId}</span>
                      <span className="px-2 py-0.5 rounded bg-surface text-text-secondary font-mono text-[10px]">{comp.size} Members</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {comp.members?.slice(0, 10).map((m) => (
                        <span key={m.userId} className="px-2 py-0.5 rounded-lg bg-surface-sec text-text-primary border border-border-subtle text-[11px]">
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 rounded-lg bg-bg border border-border-subtle/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-text-secondary">Time Complexity: <strong className="text-teal-dark">O((V + E) · α(V))</strong></span>
              <span className="text-text-secondary">Space Complexity: <strong className="text-teal-dark">O(V)</strong></span>
              <span className="text-text-secondary">Optimizations: <strong className="text-text-secondary">Union by Rank & Path Compression</strong></span>
            </div>
          </div>
        )}

        {/* 11. K-MEANS */}
        {activeTab === 'kmeans' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="border-b border-border-subtle pb-4">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <span className="text-orange-400 font-mono">11. K-Means++ Clustering</span>
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Partitions the high-dimensional user base into K organic thematic circles based on interest vector Euclidean proximity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {clusters.map((cl) => (
                <div key={cl.clusterId} className="p-4 rounded-lg bg-bg border border-orange-500/30 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-orange-400">{cl.clusterLabel || `Cluster #${cl.clusterId + 1}`}</span>
                    <span className="px-2 py-0.5 rounded bg-surface text-text-secondary font-mono text-[10px]">{cl.memberUserIds?.length || 0} Members</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-text-secondary">Dominant Cluster Topics:</span>
                    <div className="flex flex-wrap gap-1">
                      {cl.dominantInterests?.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-orange-950/40 text-orange-300 border border-orange-800/40 font-mono text-[10px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-bg border border-border-subtle/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-text-secondary">Time Complexity: <strong className="text-teal-dark">O(K · N · D · I)</strong></span>
              <span className="text-text-secondary">Space Complexity: <strong className="text-teal-dark">O(K · D + N)</strong></span>
              <span className="text-text-secondary">Initialization: <strong className="text-orange-400">K-Means++ Seeding</strong></span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
