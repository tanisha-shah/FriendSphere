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
  const [bfsStartUser, setBfsStartUser] = useState(1);
  const [bfsResult, setBfsResult] = useState(null);
  const [bfsStepIdx, setBfsStepIdx] = useState(0);

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
    { id: 'dfs', label: '2. DFS Exploration', badge: 'O(V + E)', color: 'text-rose-400' },
    { id: 'dijkstra', label: '3. Dijkstra Path', badge: 'O((V+E) log V)', color: 'text-emerald-400' },
    { id: 'dsu', label: '4. Union-Find (DSU)', badge: 'O(α(N))', color: 'text-amber-400' },
    { id: 'jaccard', label: '5. Jaccard Index', badge: 'O(|A| + |B|)', color: 'text-teal-400' },
    { id: 'cosine', label: '6. Cosine Vector', badge: 'O(D)', color: 'text-indigo-400' },
    { id: 'priorityqueue', label: '7. Max-Heap Queue', badge: 'O(N log K)', color: 'text-purple-400' },
    { id: 'mergesort', label: '8. Merge Sort', badge: 'O(N log N)', color: 'text-pink-400' },
    { id: 'binarysearch', label: '9. Binary Search', badge: 'O(log N)', color: 'text-cyan-400' },
    { id: 'trie', label: '10. Trie Prefix', badge: 'O(L + K)', color: 'text-lime-400' },
    { id: 'kmeans', label: '11. K-Means++', badge: 'O(K·N·D·I)', color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      
      {/* Hero Banner */}
      <div className="glow-card rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-brand-500/20 relative overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-xs font-bold text-brand-400 w-fit mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>Real-Time C++ Algorithmic Core</span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
          <span>How FriendSphere Thinks</span>
          <span className="text-xs font-mono font-normal px-2.5 py-1 bg-slate-800 rounded-full text-slate-300 border border-slate-700">
            DAA Engine Demonstration
          </span>
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl mt-2">
          Explore interactive visualizations of the 12 Design and Analysis of Algorithms (DAA) mechanisms powering FriendSphere. All calculations, traversals, and similarities execute natively in C++17.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {algorithmTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2.5 rounded-2xl whitespace-nowrap text-xs font-bold transition-all flex items-center gap-2 border ${
              activeTab === tab.id
                ? 'bg-slate-800 border-brand-500/60 text-white shadow-lg shadow-brand-500/10'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <span className={tab.color}>{tab.label}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-400 border border-slate-800">
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* ACTIVE ALGORITHM VISUALIZATION CANVAS */}
      <div className="glow-card rounded-3xl p-6 border border-slate-800 bg-slate-900/90 space-y-6">

        {/* 1. BFS VISUALIZATION */}
        {activeTab === 'bfs' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span className="text-blue-400 font-mono">1. Breadth-First Search (BFS)</span>
                  <span className="text-xs text-slate-400 font-normal">• Friends-of-Friends & Distance Tiers</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Discovers 1-hop direct friends, 2-hop friends-of-friends, and 3-hop wider social ties layer by layer using a FIFO Queue.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Start User:</span>
                <select
                  value={bfsStartUser}
                  onChange={(e) => setBfsStartUser(Number(e.target.value))}
                  className="bg-slate-800 text-slate-100 px-3 py-1.5 rounded-xl border border-slate-700 font-medium"
                >
                  {allUsers.slice(0, 15).map(u => (
                    <option key={u.id} value={u.id}>{u.name} (ID: {u.id})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* BFS Execution Flow Chart: Start User -> Queue -> Visited -> Friends-of-Friends */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              {/* Start User */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-blue-500/30 space-y-2">
                <div className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">1. Start User</div>
                <div className="font-bold text-blue-400 text-sm">{bfsResult?.input?.name || 'Khushi Sharma'}</div>
                <div className="text-[11px] text-slate-400">Node ID: {bfsStartUser}</div>
              </div>

              {/* FIFO Queue */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">2. C++ FIFO Queue</div>
                <div className="flex flex-wrap gap-1 text-[11px]">
                  {bfsResult?.steps?.slice(0, 6).map((s, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-blue-950/60 border border-blue-800 text-blue-300 rounded">
                      U{s.userId}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visited Nodes */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">3. Visited Set</div>
                <div className="text-emerald-400 font-bold">{bfsResult?.steps?.length || 0} nodes processed</div>
                <div className="text-[10px] text-slate-400">O(1) Hash Set Lookup</div>
              </div>

              {/* Distance Tiers */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">4. Discovered Tiers</div>
                <div className="space-y-0.5 text-[11px]">
                  <div className="text-teal-400">1-Hop: {bfsResult?.result?.directFriends?.length || 0} direct</div>
                  <div className="text-brand-400">2-Hop: {bfsResult?.result?.twoHopFriends?.length || 0} candidates</div>
                  <div className="text-purple-400">3-Hop: {bfsResult?.result?.threeHopConnections?.length || 0} extended</div>
                </div>
              </div>
            </div>

            {/* Discovered Candidates Cards */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-200">2nd-Degree Friends-of-Friends (Recommendation Pool):</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {bfsResult?.result?.twoHopFriends?.slice(0, 8).map(u => (
                  <div key={u.userId} className="p-3 rounded-2xl bg-slate-850 border border-slate-800 flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-xl object-cover border border-slate-700" />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-100 truncate">{u.name}</div>
                      <div className="text-[10px] text-brand-400">2 Hops Away</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complexity Footer */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Time Complexity: <strong className="text-emerald-400">O(V + E)</strong></span>
              <span className="text-slate-400">Space Complexity: <strong className="text-teal-400">O(V)</strong></span>
              <span className="text-slate-400">C++ Data Structure: <strong className="text-blue-400">std::queue&lt;int&gt;</strong></span>
            </div>
          </div>
        )}

        {/* 2. DFS VISUALIZATION */}
        {activeTab === 'dfs' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span className="text-rose-400 font-mono">2. Depth-First Search (DFS) & Bridge Detection</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Explores connected network depth recursively and identifies critical social bridge edges using Tarjan's low-link values.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Root Node:</span>
                <select
                  value={dfsStartUser}
                  onChange={(e) => setDfsStartUser(Number(e.target.value))}
                  className="bg-slate-800 text-slate-100 px-3 py-1.5 rounded-xl border border-slate-700 font-medium"
                >
                  {allUsers.slice(0, 15).map(u => (
                    <option key={u.id} value={u.id}>{u.name} (ID: {u.id})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Traversal Order sequence */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">DFS Traversal Order Sequence:</span>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {dfsResult?.result?.traversalOrder?.slice(0, 14).map((node, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-850 border border-slate-700 text-slate-200">
                    <span className="text-rose-400 font-bold">#{i + 1}</span>
                    <span>{node.name}</span>
                    <span className="text-[10px] text-slate-500">(d={node.depth})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bridges */}
            {dfsResult?.result?.bridges && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-rose-400">Detected Critical Bridge Ties:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {dfsResult.result.bridges.map((b, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{b.uName}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
                      <span className="font-semibold text-slate-200">{b.vName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Time Complexity: <strong className="text-emerald-400">O(V + E)</strong></span>
              <span className="text-slate-400">Space Complexity: <strong className="text-teal-400">O(V) (Call Stack)</strong></span>
              <span className="text-slate-400">Algorithm: <strong className="text-rose-400">Tarjan's Bridge Finder</strong></span>
            </div>
          </div>
        )}

        {/* 3. DIJKSTRA VISUALIZATION */}
        {activeTab === 'dijkstra' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span className="text-emerald-400 font-mono">3. Dijkstra's Shortest Social Route</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Finds the optimal path of highest interaction affinity between two people. Cost = 1 / weight.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400">From:</span>
                <select
                  value={dijkstraFrom}
                  onChange={(e) => setDijkstraFrom(Number(e.target.value))}
                  className="bg-slate-800 text-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-700"
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>

                <span className="text-slate-400">To:</span>
                <select
                  value={dijkstraTo}
                  onChange={(e) => setDijkstraTo(Number(e.target.value))}
                  className="bg-slate-800 text-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-700"
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
                <div className="p-4 rounded-3xl bg-slate-950/80 border border-emerald-500/30 space-y-3">
                  <div className="text-xs font-bold text-slate-300">Optimal Connection Path ({dijkstraResult.result?.distance} hops):</div>
                  <div className="flex flex-wrap items-center gap-3">
                    {dijkstraResult.result?.pathUsers?.map((u, i) => (
                      <React.Fragment key={u.userId}>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-850 border border-emerald-500/40 shadow-sm">
                          <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-lg object-cover" />
                          <span className="text-xs font-bold text-slate-100">{u.name}</span>
                        </div>
                        {i < dijkstraResult.result.pathUsers.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Node Distance Table */}
                <div className="p-3 rounded-2xl bg-slate-850/60 border border-slate-800 text-xs font-mono grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Distance</span>
                    <strong className="text-emerald-400">{dijkstraResult.result?.distance} Hops</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Friction Cost</span>
                    <strong className="text-brand-400">{dijkstraResult.result?.totalCost?.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Social Affinity</span>
                    <strong className="text-teal-400">{Math.round((dijkstraResult.result?.socialAffinityScore || 0.8) * 100)}%</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Time Complexity: <strong className="text-emerald-400">O((V + E) log V)</strong></span>
              <span className="text-slate-400">Space Complexity: <strong className="text-teal-400">O(V)</strong></span>
              <span className="text-slate-400">Data Structure: <strong className="text-emerald-400">std::priority_queue (Min-Heap)</strong></span>
            </div>
          </div>
        )}

        {/* 4. JACCARD SIMILARITY */}
        {activeTab === 'jaccard' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span className="text-teal-400 font-mono">5. Jaccard Similarity Index</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Formula: J(A, B) = |A ∩ B| / |A ∪ B|. Calculates discrete interest set overlap percentage.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <select
                  value={simUserA}
                  onChange={(e) => setSimUserA(Number(e.target.value))}
                  className="bg-slate-800 text-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-700"
                >
                  {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <span className="text-slate-400">vs</span>
                <select
                  value={simUserB}
                  onChange={(e) => setSimUserB(Number(e.target.value))}
                  className="bg-slate-800 text-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-700"
                >
                  {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>

            {simResult && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* User A Interests */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-200">{simResult.input?.userA?.name} (Set A)</div>
                  <div className="flex flex-wrap gap-1">
                    {simResult.input?.userA?.interests?.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/60 font-mono text-[11px]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Intersection & Score */}
                <div className="p-4 rounded-2xl bg-teal-950/20 border border-teal-500/40 text-center flex flex-col justify-center items-center space-y-2">
                  <div className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">Jaccard Score</div>
                  <div className="text-3xl font-black font-mono text-teal-400">
                    {simResult.result?.jaccardPercentage}%
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    Intersection: {simResult.result?.intersectionCount} / Union: {simResult.result?.unionCount}
                  </div>
                </div>

                {/* User B Interests */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-200">{simResult.input?.userB?.name} (Set B)</div>
                  <div className="flex flex-wrap gap-1">
                    {simResult.input?.userB?.interests?.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/60 font-mono text-[11px]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Time Complexity: <strong className="text-emerald-400">O(|A| + |B|)</strong></span>
              <span className="text-slate-400">Space Complexity: <strong className="text-teal-400">O(|A| + |B|)</strong></span>
              <span className="text-slate-400">Formula: <strong className="text-teal-400">|A ∩ B| / |A ∪ B|</strong></span>
            </div>
          </div>
        )}

        {/* 5. COSINE SIMILARITY */}
        {activeTab === 'cosine' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span className="text-indigo-400 font-mono">6. High-Dimensional Cosine Similarity</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Formula: cos(θ) = (A · B) / (||A|| * ||B||). Compares vectorized feature embeddings in 20-dimensional interest space.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <select
                  value={simUserA}
                  onChange={(e) => setSimUserA(Number(e.target.value))}
                  className="bg-slate-800 text-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-700"
                >
                  {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <span className="text-slate-400">vs</span>
                <select
                  value={simUserB}
                  onChange={(e) => setSimUserB(Number(e.target.value))}
                  className="bg-slate-800 text-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-700"
                >
                  {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>

            {simResult && (
              <div className="space-y-4">
                <div className="p-6 rounded-3xl bg-indigo-950/20 border border-indigo-500/40 flex flex-col items-center justify-center text-center space-y-2">
                  <span className="text-xs font-mono uppercase text-indigo-300">Normalized Vector Cosine Score</span>
                  <div className="text-4xl font-black font-mono text-indigo-400">
                    {simResult.result?.cosineSimilarity}
                  </div>
                  <p className="text-xs text-slate-300 max-w-md">
                    Represents the geometric angle cos(θ) between the two profile vectors in global feature vocabulary space.
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Time Complexity: <strong className="text-emerald-400">O(D) (D = Vocabulary Dimensions)</strong></span>
              <span className="text-slate-400">Space Complexity: <strong className="text-teal-400">O(D)</strong></span>
            </div>
          </div>
        )}

        {/* 6. PRIORITY QUEUE (HEAP) */}
        {activeTab === 'priorityqueue' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span className="text-purple-400 font-mono">7. Max-Heap Priority Queue Extraction</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Inserts candidate friend scores into a C++ std::priority_queue and pops top-K recommendations in O(N log K).
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Target User:</span>
                <select
                  value={pqUser}
                  onChange={(e) => setPqUser(Number(e.target.value))}
                  className="bg-slate-800 text-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-700"
                >
                  {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>

            {/* Heap Extraction Cards */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-purple-300">Top-Ranked Candidates Popped from Heap:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pqResults.slice(0, 6).map((c, i) => (
                  <div key={c.userId} className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        <span className="text-purple-400 font-mono">#{i + 1}</span>
                        <span>{c.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{c.mutualFriends} mutual friends • {c.connectionDistance} hops</div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black font-mono text-purple-400">{Math.round((c.score || 0.8) * 100)}%</span>
                      <span className="text-[9px] block text-slate-500 font-mono">HEAP ROOT</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Time Complexity: <strong className="text-emerald-400">O(N log K)</strong></span>
              <span className="text-slate-400">Space Complexity: <strong className="text-teal-400">O(K)</strong></span>
              <span className="text-slate-400">C++ Implementation: <strong className="text-purple-400">std::priority_queue&lt;Candidate&gt;</strong></span>
            </div>
          </div>
        )}

        {/* 7. MERGE SORT */}
        {activeTab === 'mergesort' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-pink-400 font-mono">8. Custom Divide-and-Conquer Merge Sort</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Deterministic O(N log N) stable sorting used to rank personalized feeds and candidate recommendation lists.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-300">Recursive Partition & Merge Tree:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                {sortItems.map((item, i) => (
                  <div key={item.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px]">Index [{i}]</span>
                      <div className="font-bold text-slate-100">{item.name}</div>
                    </div>
                    <div className="text-pink-400 font-bold text-sm">{item.score} pts</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Time Complexity: <strong className="text-emerald-400">O(N log N)</strong></span>
              <span className="text-slate-400">Space Complexity: <strong className="text-teal-400">O(N)</strong></span>
              <span className="text-slate-400">Property: <strong className="text-pink-400">Stable & Deterministic</strong></span>
            </div>
          </div>
        )}

        {/* 8. BINARY SEARCH */}
        {activeTab === 'binarysearch' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span className="text-cyan-400 font-mono">9. Binary Search on Sorted Indices</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Logarithmic O(log N) lookup across sorted user IDs and alphabetically sorted usernames.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Username or User ID..."
                  className="bg-slate-800 text-slate-100 px-3 py-1.5 rounded-xl border border-slate-700 font-mono"
                />
              </div>
            </div>

            {/* Binary Search Trace */}
            {binarySearchResult && (
              <div className="space-y-3 text-xs">
                <div className="font-bold text-slate-300">Step-by-Step Binary Halving Log:</div>
                <div className="space-y-2 font-mono">
                  {binarySearchResult.steps?.map((step) => (
                    <div key={step.stepNumber} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[11px] font-bold">
                          Step {step.stepNumber}
                        </span>
                        <span className="text-slate-400">[L: {step.left}, Mid: {step.mid}, R: {step.right}]</span>
                      </div>
                      <div className="text-slate-200">{step.comparison}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Time Complexity: <strong className="text-emerald-400">O(log N)</strong></span>
              <span className="text-slate-400">Space Complexity: <strong className="text-teal-400">O(1)</strong></span>
              <span className="text-slate-400">Comparisons: <strong className="text-cyan-400">{binarySearchResult?.result?.comparisonsCount || 1}</strong></span>
            </div>
          </div>
        )}

        {/* 9. TRIE PREFIX AUTOCOMPLETE */}
        {activeTab === 'trie' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span className="text-lime-400 font-mono">10. Trie (Prefix Tree) Autocomplete</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Prefix tree enabling sub-millisecond instant word completions and character branch traversals.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Type Prefix:</span>
                <input
                  type="text"
                  value={triePrefix}
                  onChange={(e) => setTriePrefix(e.target.value)}
                  placeholder="e.g. pro, al, kh..."
                  className="bg-slate-800 text-slate-100 px-3 py-1.5 rounded-xl border border-slate-700 font-mono text-xs"
                />
              </div>
            </div>

            {/* Trie Suggestions */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">Trie Matched Subtree Suggestions for '{triePrefix}':</span>
              <div className="flex flex-wrap gap-2">
                {trieSuggestions.length > 0 ? (
                  trieSuggestions.map((s, i) => (
                    <div key={i} className="px-3 py-1.5 rounded-2xl bg-lime-950/30 border border-lime-500/40 text-lime-300 font-mono text-xs flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5" />
                      <span>{s}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 font-mono">No prefix matches in Trie vocabulary.</div>
                )}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Time Complexity: <strong className="text-emerald-400">O(L + K) (L = Prefix Length)</strong></span>
              <span className="text-slate-400">Space Complexity: <strong className="text-teal-400">O(Σ · L)</strong></span>
            </div>
          </div>
        )}

        {/* 10. UNION-FIND (DSU) */}
        {activeTab === 'dsu' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-amber-400 font-mono">4. Disjoint Set Union (DSU / Union-Find)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Maintains connected social network components and communities with union-by-rank and path compression in nearly O(1) amortized time.
              </p>
            </div>

            {dsuResult?.result?.dsuComponents && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {dsuResult.result.dsuComponents.map((comp) => (
                  <div key={comp.componentRootId} className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-400 font-mono">DSU Root Leader: User #{comp.componentRootId}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">{comp.size} Members</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {comp.members?.slice(0, 10).map((m) => (
                        <span key={m.userId} className="px-2 py-0.5 rounded-lg bg-slate-850 text-slate-200 border border-slate-700 text-[11px]">
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Time Complexity: <strong className="text-emerald-400">O((V + E) · α(V))</strong></span>
              <span className="text-slate-400">Space Complexity: <strong className="text-teal-400">O(V)</strong></span>
              <span className="text-slate-400">Optimizations: <strong className="text-amber-400">Union by Rank & Path Compression</strong></span>
            </div>
          </div>
        )}

        {/* 11. K-MEANS */}
        {activeTab === 'kmeans' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-orange-400 font-mono">11. K-Means++ Clustering</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Partitions the high-dimensional user base into K organic thematic circles based on interest vector Euclidean proximity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {clusters.map((cl) => (
                <div key={cl.clusterId} className="p-4 rounded-2xl bg-slate-950 border border-orange-500/30 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-orange-400">{cl.clusterLabel || `Cluster #${cl.clusterId + 1}`}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">{cl.memberUserIds?.length || 0} Members</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Dominant Cluster Topics:</span>
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

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Time Complexity: <strong className="text-emerald-400">O(K · N · D · I)</strong></span>
              <span className="text-slate-400">Space Complexity: <strong className="text-teal-400">O(K · D + N)</strong></span>
              <span className="text-slate-400">Initialization: <strong className="text-orange-400">K-Means++ Seeding</strong></span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
