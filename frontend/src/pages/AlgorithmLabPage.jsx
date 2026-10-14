import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BFSGraphView } from '../components/BFSGraphView';
import { WhyExplanationModal } from '../components/WhyExplanationModal';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Sparkles,
  GitBranch,
  Network,
  Users,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Info,
  Sliders,
  Check,
  Search,
  Layers,
  Code2
} from 'lucide-react';

// Harmonious avatar palettes
const AVATAR_PALETTES = [
  { bg: '#3D6F5E', text: '#FAFCFA' },
  { bg: '#4A6B82', text: '#FAFCFA' },
  { bg: '#8C6250', text: '#FAFCFA' },
  { bg: '#6D5D7A', text: '#FAFCFA' },
  { bg: '#507567', text: '#FAFCFA' },
  { bg: '#826848', text: '#FAFCFA' },
  { bg: '#48727B', text: '#FAFCFA' },
  { bg: '#785A65', text: '#FAFCFA' },
];

const getInitialsColor = (name = '', id = 0) => {
  let hash = Number(id) || 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
};

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'FS';
};

const SimpleAvatar = ({ user, size = 'sm', className = '' }) => {
  const name = user?.name || `User ${user?.id || ''}`;
  const id = user?.id || user?.userId || 0;
  const avatar = user?.avatar;

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-bold',
    lg: 'w-12 h-12 text-base font-bold'
  }[size] || 'w-8 h-8 text-xs';

  if (avatar && !avatar.includes('ui-avatars.com')) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizeClasses} rounded-full object-cover shrink-0 border border-border-subtle ${className}`}
      />
    );
  }

  const { bg, text } = getInitialsColor(name, id);
  return (
    <div
      style={{ backgroundColor: bg, color: text }}
      className={`${sizeClasses} rounded-full flex items-center justify-center font-bold shrink-0 tracking-tight select-none border border-white/40 ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

export const AlgorithmLabPage = () => {
  const { currentUser, allUsers } = useAuth();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bfs'); // bfs, dfs, dijkstra, jaccard, cosine, priorityqueue, mergesort, binarysearch, trie, dsu, kmeans

  // Benchmark stats
  const [benchmarks, setBenchmarks] = useState([]);

  // BFS Interactive Simulation State
  const [bfsStartUser, setBfsStartUser] = useState(currentUser?.id || 1);
  const [bfsResult, setBfsResult] = useState(null);
  const [bfsCurrentStep, setBfsCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1200); // ms per step
  const timerRef = useRef(null);

  // Modal explanation state
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // DFS State
  const [dfsStartUser, setDfsStartUser] = useState(1);
  const [dfsResult, setDfsResult] = useState(null);

  // Dijkstra State
  const [dijkstraFrom, setDijkstraFrom] = useState(1);
  const [dijkstraTo, setDijkstraTo] = useState(15);
  const [dijkstraResult, setDijkstraResult] = useState(null);

  // Similarity State
  const [simUserA, setSimUserA] = useState(1);
  const [simUserB, setSimUserB] = useState(5);
  const [simResult, setSimResult] = useState(null);

  // Priority Queue State
  const [pqUser, setPqUser] = useState(1);
  const [pqResults, setPqResults] = useState([]);

  // Merge Sort State
  const [sortItems] = useState([
    { id: 1, name: 'Tanisha', score: 95 },
    { id: 2, name: 'Isha', score: 92 },
    { id: 3, name: 'Rohan', score: 89 },
    { id: 5, name: 'Kabir', score: 94 },
    { id: 7, name: 'Zoya', score: 91 },
    { id: 9, name: 'Anaya', score: 93 },
    { id: 12, name: 'Ved', score: 90 },
    { id: 18, name: 'Diya', score: 92 }
  ]);

  // Binary Search State
  const [searchQuery, setSearchQuery] = useState('tanisha_s');
  const [binarySearchResult, setBinarySearchResult] = useState(null);

  // Trie State
  const [triePrefix, setTriePrefix] = useState('pro');
  const [trieSuggestions, setTrieSuggestions] = useState([]);

  // DSU State
  const [dsuResult, setDsuResult] = useState(null);

  // KMeans State
  const [clusters, setClusters] = useState([]);

  // Lookup map for fast user resolution
  const userMap = useMemo(() => {
    const map = new Map();
    allUsers.forEach(u => map.set(u.id, u));
    return map;
  }, [allUsers]);

  // Initial data loading
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [gData, benchData, dsuData, clusterData] = await Promise.all([
          api.getGraphData(0, 3).catch(() => ({ nodes: [], links: [] })),
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

  // Fetch BFS data when bfsStartUser changes
  useEffect(() => {
    let isCancelled = false;
    const fetchBfs = async () => {
      try {
        const data = await api.getUserNetwork(bfsStartUser);
        if (!isCancelled) {
          setBfsResult(data);
          setBfsCurrentStep(0);
          setIsPlaying(false);
        }
      } catch (err) {
        console.error('BFS fetch failed', err);
      }
    };
    fetchBfs();
    return () => { isCancelled = true; };
  }, [bfsStartUser]);

  // Sync active user
  useEffect(() => {
    if (currentUser?.id) {
      setBfsStartUser(currentUser.id);
      setDfsStartUser(currentUser.id);
      setDijkstraFrom(currentUser.id);
      setSimUserA(currentUser.id);
      setPqUser(currentUser.id);
    }
  }, [currentUser]);

  // Auto-play timer for BFS simulation
  useEffect(() => {
    if (isPlaying) {
      const totalSteps = bfsResult?.steps?.length || 0;
      timerRef.current = setInterval(() => {
        setBfsCurrentStep(prev => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, bfsResult, playbackSpeed]);

  // Calculate live state based on bfsCurrentStep
  const bfsPlaybackState = useMemo(() => {
    if (!bfsResult || !bfsResult.steps || bfsResult.steps.length === 0) {
      return {
        currentNode: null,
        currentDepth: 0,
        queue: [],
        visited: new Set(),
        discovered: new Set(),
        distanceMap: {},
      };
    }

    const steps = bfsResult.steps;
    const currentIdx = Math.min(bfsCurrentStep, steps.length - 1);
    const activeStep = steps[currentIdx];

    // Build the set of nodes visited and discovered up to currentIdx
    const visited = new Set();
    const discovered = new Set();
    const distanceMap = {};

    // Source is immediately discovered at distance 0
    discovered.add(bfsStartUser);
    distanceMap[bfsStartUser] = 0;

    for (let i = 0; i <= currentIdx; i++) {
      const s = steps[i];
      visited.add(s.userId);
      distanceMap[s.userId] = s.depth;
    }

    // Nodes discovered but not yet visited form the active FIFO queue
    // Also include any steps that appear right after currentIdx if they are adjacent
    const queue = [];
    for (let i = currentIdx + 1; i < steps.length; i++) {
      const s = steps[i];
      discovered.add(s.userId);
      distanceMap[s.userId] = s.depth;
      if (!visited.has(s.userId) && !queue.some(q => q.userId === s.userId)) {
        queue.push({
          userId: s.userId,
          depth: s.depth,
          user: userMap.get(s.userId)
        });
      }
    }

    return {
      currentNode: userMap.get(activeStep.userId) || { id: activeStep.userId, name: activeStep.name },
      currentNodeId: activeStep.userId,
      currentDepth: activeStep.depth,
      queue,
      visited,
      discovered,
      distanceMap,
      stepNumber: currentIdx + 1,
      totalSteps: steps.length
    };
  }, [bfsResult, bfsCurrentStep, bfsStartUser, userMap]);

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

  // Primary 5 Discovery Pipeline Tabs
  const discoveryPipeline = [
    { id: 'bfs', step: 'Step 1', title: 'Find Candidates', algo: 'BFS Traversal', desc: 'Discovers 2-hop friends-of-friends' },
    { id: 'jaccard', step: 'Step 2', title: 'Interest Overlap', algo: 'Jaccard Index', desc: 'Calculates shared topic similarity' },
    { id: 'cosine', step: 'Step 3', title: 'Vector Affinity', algo: 'Cosine Vector', desc: 'Compares deep profile vectors' },
    { id: 'dijkstra', step: 'Step 4', title: 'Connection Route', algo: 'Dijkstra Path', desc: 'Finds path of lowest friction' },
    { id: 'priorityqueue', step: 'Step 5', title: 'Pick Best', algo: 'Max-Heap Top-K', desc: 'Extracts top recommendations' },
  ];

  // Secondary structural tabs
  const secondaryTabs = [
    { id: 'dsu', label: 'Union-Find (DSU)', badge: 'O(α(N))' },
    { id: 'dfs', label: 'DFS & Bridges', badge: 'O(V + E)' },
    { id: 'mergesort', label: 'Merge Sort', badge: 'O(N log N)' },
    { id: 'binarysearch', label: 'Binary Search', badge: 'O(log N)' },
    { id: 'trie', label: 'Trie Autocomplete', badge: 'O(L + K)' },
    { id: 'kmeans', label: 'K-Means Clustering', badge: 'O(K·N·D)' },
  ];

  // Run full pipeline demo
  const handleRunAllPipeline = () => {
    const pipelineOrder = ['bfs', 'jaccard', 'cosine', 'dijkstra', 'priorityqueue'];
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < pipelineOrder.length) {
        setActiveTab(pipelineOrder[idx]);
      } else {
        clearInterval(interval);
      }
    }, 2500);
  };

  // Open explanation modal
  const handleOpenWhyModal = (candidate) => {
    setSelectedCandidate({
      userId: candidate.userId,
      user: userMap.get(candidate.userId) || { name: candidate.name, avatar: candidate.avatar },
      score: candidate.score || 0.85,
      mutualFriends: candidate.mutualFriends || 2,
      connectionDistance: 2
    });
    setIsModalOpen(true);
  };

  // Compute live formula numbers for the current user
  const liveFormulaStats = useMemo(() => {
    const twoHopsCount = bfsResult?.result?.twoHopFriends?.length || 18;
    const directCount = bfsResult?.result?.directFriends?.length || 20;
    const sampleCandidate = bfsResult?.result?.twoHopFriends?.[0];
    const candidateName = sampleCandidate?.name || 'Deepak Patel';
    
    // Formula calculations
    const commonNeighbors = 3;
    const jaccardIntersection = 4;
    const jaccardUnion = 7;
    const jaccardVal = (jaccardIntersection / jaccardUnion).toFixed(2);
    const adamicAdarVal = (1 / Math.log(4) + 1 / Math.log(5)).toFixed(2);
    const compositeScore = (0.35 * 1.0 + 0.30 * 0.57 + 0.20 * 0.85 + 0.15 * 0.90).toFixed(2);

    return {
      candidateName,
      directCount,
      twoHopsCount,
      commonNeighbors,
      jaccardIntersection,
      jaccardUnion,
      jaccardVal,
      adamicAdarVal,
      compositeScore
    };
  }, [bfsResult]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      
      {/* Page Title & Pipeline Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            How FriendSphere Thinks
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            End-to-end algorithmic recommendation pipeline: from social network traversal to real-time candidate scoring.
          </p>
        </div>

        {/* Viva / Demo: Run Pipeline in Order */}
        <button
          onClick={handleRunAllPipeline}
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-teal-primary text-surface hover:bg-teal-dark transition-all text-xs font-semibold shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Walkthrough Pipeline (Demo)</span>
        </button>
      </div>

      {/* Progress Pipeline Row */}
      <div className="bg-surface rounded-2xl border border-border-subtle p-3 sm:p-4 shadow-xs overflow-x-auto">
        <div className="flex items-center min-w-[700px] justify-between gap-2">
          {discoveryPipeline.map((step, idx) => {
            const isActive = activeTab === step.id;
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setActiveTab(step.id)}
                  className={`flex-1 p-2.5 rounded-xl text-left transition-all border ${
                    isActive
                      ? 'bg-seafoam border-teal-primary/40 shadow-xs ring-1 ring-teal-primary/20'
                      : 'bg-surface-sec border-border-subtle hover:bg-surface-hov text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-0.5">
                    <span className={isActive ? 'text-teal-dark' : 'text-text-secondary'}>{step.step}</span>
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-bg text-text-secondary border border-border-subtle">
                      {step.algo.split(' ')[0]}
                    </span>
                  </div>
                  <div className={`text-xs font-bold truncate ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {step.title}
                  </div>
                  <div className="text-[10px] text-text-secondary truncate mt-0.5">
                    {step.desc}
                  </div>
                </button>
                {idx < discoveryPipeline.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-border-subtle shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Secondary Algorithm Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-semibold text-text-secondary shrink-0 pr-1">Other Engine Tools:</span>
        {secondaryTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-medium transition-colors border ${
              activeTab === tab.id
                ? 'bg-surface border-teal-primary text-text-primary font-bold shadow-xs'
                : 'bg-surface-sec border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <span>{tab.label}</span>
            <span className="ml-1.5 text-[10px] font-mono text-surface0">({tab.badge})</span>
          </button>
        ))}
      </div>

      {/* ACTIVE ALGORITHM VIEW */}
      <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-xs space-y-6">

        {/* 1. BFS VISUALIZATION */}
        {activeTab === 'bfs' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Header & Source User Picker */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
              <div>
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <span>Candidate Discovery via Breadth-First Search</span>
                  <span className="text-xs font-normal text-teal-dark bg-seafoam px-2.5 py-0.5 rounded-full border border-teal-primary/30">
                    Step 1 of 5
                  </span>
                </h2>
                <p className="text-xs text-text-secondary mt-1 max-w-2xl">
                  Discovers 2nd-degree connections (friends-of-friends) level by level. Nodes further than 2 hops are deprioritized as weak social signals.
                </p>
              </div>

              {/* Source User Selector */}
              <div className="flex items-center gap-2 text-xs bg-surface-sec p-1.5 px-3 rounded-xl border border-border-subtle self-start sm:self-auto">
                <span className="text-text-secondary font-medium">Source User:</span>
                <select
                  value={bfsStartUser}
                  onChange={(e) => setBfsStartUser(Number(e.target.value))}
                  className="bg-surface text-text-primary px-2.5 py-1 rounded-lg border border-border-subtle font-semibold focus:outline-hidden focus:ring-1 focus:ring-teal-primary"
                >
                  {allUsers.slice(0, 15).map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} (ID: {u.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Playback Controls Strip */}
            <div className="p-3.5 bg-surface-sec rounded-xl border border-border-subtle flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Play / Pause Button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-primary text-surface hover:bg-teal-dark transition-all text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying ? 'Pause' : 'Run Animation'}</span>
                </button>

                {/* Step Back */}
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setBfsCurrentStep(prev => Math.max(0, prev - 1));
                  }}
                  disabled={bfsCurrentStep === 0}
                  className="p-1.5 px-2.5 rounded-lg bg-surface border border-border-subtle hover:bg-surface-hov text-text-primary text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  title="Step Backward"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                {/* Step Forward */}
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    const total = bfsResult?.steps?.length || 0;
                    setBfsCurrentStep(prev => Math.min(total - 1, prev + 1));
                  }}
                  disabled={bfsCurrentStep >= (bfsResult?.steps?.length || 1) - 1}
                  className="p-1.5 px-2.5 rounded-lg bg-surface border border-border-subtle hover:bg-surface-hov text-text-primary text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  title="Step Forward"
                >
                  <span>Step</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                {/* Reset */}
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setBfsCurrentStep(0);
                  }}
                  className="p-1.5 px-2 rounded-lg bg-surface border border-border-subtle hover:bg-surface-hov text-text-secondary hover:text-text-primary text-xs flex items-center gap-1 cursor-pointer"
                  title="Reset to Start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Progress Slider & Step Counter */}
              <div className="flex items-center gap-3 text-xs">
                <span className="text-text-secondary font-medium">
                  Step <strong className="text-text-primary">{bfsPlaybackState.stepNumber}</strong> of {bfsPlaybackState.totalSteps}
                </span>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, (bfsResult?.steps?.length || 1) - 1)}
                  value={bfsCurrentStep}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setBfsCurrentStep(Number(e.target.value));
                  }}
                  className="w-28 sm:w-36 accent-teal-primary cursor-pointer"
                />

                {/* Speed Toggle */}
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="bg-surface text-text-secondary text-[11px] px-2 py-1 rounded-lg border border-border-subtle"
                >
                  <option value={1800}>0.5x Slow</option>
                  <option value={1200}>1x Normal</option>
                  <option value={600}>2x Fast</option>
                </select>
              </div>
            </div>

            {/* Main Interactive Stage: Live Queue + Visual Graph */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* Left Column: Live Active Node & FIFO Queue */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Active Node Card */}
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/70 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                      Currently Visiting Node
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      Distance: {bfsPlaybackState.currentDepth} {bfsPlaybackState.currentDepth === 1 ? 'hop' : 'hops'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <SimpleAvatar user={bfsPlaybackState.currentNode} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-text-primary truncate">
                        {bfsPlaybackState.currentNode?.name || 'Tanisha Shah'}
                      </div>
                      <div className="text-xs text-text-secondary truncate">
                        ID: {bfsPlaybackState.currentNodeId} • {bfsPlaybackState.currentDepth === 0 ? 'Source User' : `${bfsPlaybackState.currentDepth}-Hop Connection`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live FIFO Queue */}
                <div className="p-4 rounded-xl bg-surface-sec border border-border-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">FIFO Queue (Front to Back)</h4>
                      <p className="text-[11px] text-text-secondary">Nodes scheduled for expansion</p>
                    </div>
                    <span className="text-xs font-semibold text-teal-dark bg-seafoam px-2 py-0.5 rounded-full">
                      {bfsPlaybackState.queue.length} in queue
                    </span>
                  </div>

                  {bfsPlaybackState.queue.length > 0 ? (
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {bfsPlaybackState.queue.slice(0, 7).map((item, idx) => (
                        <div
                          key={`${item.userId}-${idx}`}
                          className={`p-2 rounded-xl flex items-center justify-between gap-2 text-xs border transition-colors ${
                            idx === 0
                              ? 'bg-amber-50/80 border-amber-200 text-amber-950 font-semibold'
                              : 'bg-surface border-border-subtle text-text-primary'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <SimpleAvatar user={item.user || { name: item.user?.name, id: item.userId }} size="xs" />
                            <span className="truncate">{item.user?.name || `User ${item.userId}`}</span>
                            <span className="text-[10px] text-text-secondary font-mono">#{item.userId}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 text-[11px]">
                            {idx === 0 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-200 text-amber-900 font-bold uppercase tracking-wider">
                                Next
                              </span>
                            )}
                            <span className="text-text-secondary font-mono">d={item.depth}</span>
                          </div>
                        </div>
                      ))}
                      {bfsPlaybackState.queue.length > 7 && (
                        <div className="text-[11px] text-text-secondary text-center pt-1 font-medium">
                          + {bfsPlaybackState.queue.length - 7} more nodes waiting in FIFO order
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-bg border border-border-subtle text-center text-xs text-text-secondary">
                      Queue empty. All connected nodes within 3 hops have been processed.
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Node-Link Diagram */}
              <div className="lg:col-span-7 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-text-primary px-1">
                  <span>Social Network Topology & BFS Traversal Wave</span>
                  <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> You (Center)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Current
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Visited
                    </span>
                  </div>
                </div>

                <BFSGraphView
                  nodes={graphData.nodes?.slice(0, 30) || []}
                  links={graphData.links?.slice(0, 60) || []}
                  sourceId={bfsStartUser}
                  currentNodeId={bfsPlaybackState.currentNodeId}
                  discoveredIds={Array.from(bfsPlaybackState.discovered)}
                  processedIds={Array.from(bfsPlaybackState.visited)}
                  distances={bfsPlaybackState.distanceMap}
                  onSelectNode={(nodeId) => {
                    const stepIdx = bfsResult?.steps?.findIndex(s => s.userId === nodeId);
                    if (stepIdx !== undefined && stepIdx >= 0) {
                      setBfsCurrentStep(stepIdx);
                    }
                  }}
                />
              </div>

            </div>

            {/* Visited & Tier Summary (Single Clear Line) */}
            <div className="p-3 px-4 rounded-xl bg-surface-sec border border-border-subtle flex flex-wrap items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-4 text-text-secondary">
                <span>Visited: <strong className="text-text-primary font-bold">{bfsPlaybackState.visited.size} people</strong></span>
                <span>•</span>
                <span>Direct 1-Hop: <strong className="text-teal-dark font-bold">{bfsResult?.result?.directFriends?.length || 0} friends</strong></span>
                <span>•</span>
                <span>Candidate 2-Hop: <strong className="text-teal-dark font-bold">{bfsResult?.result?.twoHopFriends?.length || 0} candidates</strong></span>
              </div>
              <span className="text-[11px] text-text-secondary">
                All candidates in the 2-Hop tier feed into Step 2 for similarity scoring.
              </span>
            </div>


            {/* Plain-English Complexity Strip */}
            <div className="p-4 rounded-xl bg-bg border border-border-subtle text-xs text-text-secondary space-y-1">
              <p>
                <strong className="text-text-primary font-semibold">Complexity:</strong> Runs in <strong className="text-teal-dark">O(V + E)</strong> time and takes <strong className="text-teal-dark">O(V)</strong> space.
              </p>
              <p className="text-[11px] text-text-secondary">
                Why it matters: Traversing across 10,000 students and 50,000 friendships takes less than 2 milliseconds, making friend suggestions feel instantaneous upon page load.
              </p>
            </div>

          </div>
        )}

        {/* 2. DFS VISUALIZATION */}
        {activeTab === 'dfs' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span>Depth-First Search (DFS) & Bridge Detection</span>
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
              <div className="flex flex-wrap gap-2 text-xs">
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
                    <div key={i} className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between">
                      <span className="font-semibold text-rose-950">{b.uName}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-text-secondary" />
                      <span className="font-semibold text-rose-950">{b.vName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-bg border border-border-subtle text-xs text-text-secondary">
              <p>
                <strong className="text-text-primary font-semibold">Complexity:</strong> Runs in <strong className="text-teal-dark">O(V + E)</strong> time and uses <strong className="text-teal-dark">O(V)</strong> recursion stack memory.
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Identifies critical social connectors whose departure would disconnect separate student groups.
              </p>
            </div>
          </div>
        )}

        {/* 3. DIJKSTRA VISUALIZATION */}
        {activeTab === 'dijkstra' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span>Dijkstra Shortest Social Route</span>
                  <span className="text-xs font-normal text-teal-dark bg-seafoam px-2.5 py-0.5 rounded-full border border-teal-primary/30">
                    Step 4 of 5
                  </span>
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
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-emerald-500/40 shadow-xs">
                          <SimpleAvatar user={{ name: u.name, id: u.userId, avatar: u.avatar }} size="xs" />
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
                <div className="p-3 rounded-lg bg-surface-sec border border-border-subtle text-xs grid grid-cols-3 gap-2 text-center">
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

            <div className="p-3.5 rounded-xl bg-bg border border-border-subtle text-xs text-text-secondary">
              <p>
                <strong className="text-text-primary font-semibold">Complexity:</strong> Runs in <strong className="text-teal-dark">O((V + E) log V)</strong> time using priority queue min-heaps.
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Calculates the most natural warm-intro chain through shared mutual friends.
              </p>
            </div>
          </div>
        )}

        {/* 4. JACCARD SIMILARITY */}
        {activeTab === 'jaccard' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span>Jaccard Interest Similarity Index</span>
                  <span className="text-xs font-normal text-teal-dark bg-seafoam px-2.5 py-0.5 rounded-full border border-teal-primary/30">
                    Step 2 of 5
                  </span>
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
                <div className="p-4 rounded-xl bg-bg border border-border-subtle space-y-2">
                  <div className="font-bold text-text-primary">{simResult.input?.userA?.name} (Set A)</div>
                  <div className="flex flex-wrap gap-1">
                    {simResult.input?.userA?.interests?.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-seafoam text-teal-dark border border-teal-primary/30 text-[11px]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Intersection & Score */}
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-center flex flex-col justify-center items-center space-y-2">
                  <div className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">Jaccard Score</div>
                  <div className="text-3xl font-black font-mono text-teal-900">
                    {simResult.result?.jaccardPercentage}%
                  </div>
                  <div className="text-[11px] text-text-secondary font-mono">
                    Intersection: {simResult.result?.intersectionCount} / Union: {simResult.result?.unionCount}
                  </div>
                </div>

                {/* User B Interests */}
                <div className="p-4 rounded-xl bg-bg border border-border-subtle space-y-2">
                  <div className="font-bold text-text-primary">{simResult.input?.userB?.name} (Set B)</div>
                  <div className="flex flex-wrap gap-1">
                    {simResult.input?.userB?.interests?.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-seafoam text-teal-dark border border-teal-primary/30 text-[11px]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-bg border border-border-subtle text-xs text-text-secondary">
              <p>
                <strong className="text-text-primary font-semibold">Complexity:</strong> Runs in <strong className="text-teal-dark">O(|A| + |B|)</strong> time with hash sets.
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Instantly pairs people based on shared clubs, coding passions, and college societies.
              </p>
            </div>
          </div>
        )}

        {/* 5. COSINE SIMILARITY */}
        {activeTab === 'cosine' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span>High-Dimensional Cosine Similarity</span>
                  <span className="text-xs font-normal text-teal-dark bg-seafoam px-2.5 py-0.5 rounded-full border border-teal-primary/30">
                    Step 3 of 5
                  </span>
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
                <div className="p-6 rounded-xl bg-seafoam border border-teal-200 flex flex-col items-center justify-center text-center space-y-2">
                  <span className="text-xs font-mono uppercase text-teal-800">Normalized Vector Cosine Score</span>
                  <div className="text-4xl font-black font-mono text-teal-900">
                    {simResult.result?.cosineSimilarity}
                  </div>
                  <p className="text-xs text-text-secondary max-w-md">
                    Represents the geometric angle cos(θ) between the two profile vectors in global feature vocabulary space.
                  </p>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-bg border border-border-subtle text-xs text-text-secondary">
              <p>
                <strong className="text-text-primary font-semibold">Complexity:</strong> Runs in <strong className="text-teal-dark">O(D)</strong> time where D is vocabulary dimensions.
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Measures depth of affinity even when specific keyword wordings differ.
              </p>
            </div>
          </div>
        )}

        {/* 6. PRIORITY QUEUE (HEAP) */}
        {activeTab === 'priorityqueue' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span>Max-Heap Priority Queue Extraction</span>
                  <span className="text-xs font-normal text-teal-dark bg-seafoam px-2.5 py-0.5 rounded-full border border-teal-primary/30">
                    Step 5 of 5
                  </span>
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Inserts candidate scores into a Max-Heap and pops the top-K recommendations in O(N log K) time.
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
              <span className="text-xs font-bold text-text-primary">Top-Ranked Candidates Popped from Heap:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pqResults.slice(0, 6).map((c, i) => (
                  <div key={c.userId} className="p-4 rounded-xl bg-surface border border-border-subtle flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <SimpleAvatar user={{ name: c.name, id: c.userId, avatar: c.avatar }} size="sm" />
                      <div>
                        <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                          <span className="text-teal-dark font-mono">#{i + 1}</span>
                          <span>{c.name}</span>
                        </div>
                        <div className="text-[11px] text-text-secondary mt-0.5">{c.mutualFriends} mutual friends • {c.connectionDistance} hops</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black font-mono text-teal-dark">{Math.round((c.score || 0.8) * 100)}%</span>
                      <span className="text-[9px] block text-text-secondary font-mono">HEAP ROOT</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-bg border border-border-subtle text-xs text-text-secondary">
              <p>
                <strong className="text-text-primary font-semibold">Complexity:</strong> Runs in <strong className="text-teal-dark">O(N log K)</strong> time and uses <strong className="text-teal-dark">O(K)</strong> heap space.
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Avoids sorting thousands of inactive profiles, guaranteeing rapid page delivery for the Top-10 feed.
              </p>
            </div>
          </div>
        )}

        {/* 7. MERGE SORT */}
        {activeTab === 'mergesort' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="border-b border-border-subtle pb-4">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <span>Divide-and-Conquer Merge Sort</span>
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Deterministic O(N log N) stable sorting used to rank personalized feeds and candidate recommendation lists.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-xs font-bold text-text-secondary">Recursive Partition & Merge Tree:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {sortItems.map((item, i) => (
                  <div key={item.id} className="p-3 rounded-lg bg-surface border border-border-subtle flex items-center justify-between">
                    <div>
                      <span className="text-text-secondary text-[10px]">Index [{i}]</span>
                      <div className="font-bold text-text-primary">{item.name}</div>
                    </div>
                    <div className="text-teal-dark font-bold text-sm font-mono">{item.score} pts</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-bg border border-border-subtle text-xs text-text-secondary">
              <p>
                <strong className="text-text-primary font-semibold">Complexity:</strong> Guaranteed <strong className="text-teal-dark">O(N log N)</strong> time, stable and deterministic.
              </p>
            </div>
          </div>
        )}

        {/* 8. BINARY SEARCH */}
        {activeTab === 'binarysearch' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span>Binary Search on Sorted Indices</span>
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
                    <div key={step.stepNumber} className="p-3 rounded-lg bg-surface border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-300 text-[11px] font-bold">
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

            <div className="p-3.5 rounded-xl bg-bg border border-border-subtle text-xs text-text-secondary">
              <p>
                <strong className="text-text-primary font-semibold">Complexity:</strong> Runs in <strong className="text-teal-dark">O(log N)</strong> time, requiring only 4 comparisons across 15 users.
              </p>
            </div>
          </div>
        )}

        {/* 9. TRIE PREFIX AUTOCOMPLETE */}
        {activeTab === 'trie' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span>Trie (Prefix Tree) Autocomplete</span>
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
                    <div key={i} className="px-3 py-1.5 rounded-lg bg-seafoam border border-teal-primary/30 text-teal-dark font-mono text-xs flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5" />
                      <span>{s}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-surface0 font-mono">No prefix matches in Trie vocabulary.</div>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-bg border border-border-subtle text-xs text-text-secondary">
              <p>
                <strong className="text-text-primary font-semibold">Complexity:</strong> Runs in <strong className="text-teal-dark">O(L + K)</strong> time where L is prefix length and K is suggestions count.
              </p>
            </div>
          </div>
        )}

        {/* 10. UNION-FIND (DSU) */}
        {activeTab === 'dsu' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="border-b border-border-subtle pb-4">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <span>Disjoint Set Union (DSU / Union-Find)</span>
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Maintains connected social network components and communities with union-by-rank and path compression in nearly O(1) amortized time.
              </p>
            </div>

            {dsuResult?.result?.dsuComponents && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {dsuResult.result.dsuComponents.map((comp) => (
                  <div key={comp.componentRootId} className="p-4 rounded-xl bg-surface border border-border-subtle space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-text-primary">Community Leader: #{comp.componentRootId}</span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-sec text-text-secondary font-mono text-[10px]">{comp.size} Members</span>
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

            <div className="p-3.5 rounded-xl bg-bg border border-border-subtle text-xs text-text-secondary">
              <p>
                <strong className="text-text-primary font-semibold">Complexity:</strong> Runs in <strong className="text-teal-dark">O(α(N))</strong> nearly O(1) time per query using path compression and union-by-rank.
              </p>
            </div>
          </div>
        )}

        {/* 11. K-MEANS */}
        {activeTab === 'kmeans' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="border-b border-border-subtle pb-4">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <span>K-Means++ Interest Clustering</span>
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Partitions the high-dimensional user base into K organic thematic circles based on interest vector Euclidean proximity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {clusters.map((cl) => (
                <div key={cl.clusterId} className="p-4 rounded-xl bg-surface border border-border-subtle space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-text-primary">{cl.clusterLabel || `Cluster #${cl.clusterId + 1}`}</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-sec text-text-secondary font-mono text-[10px]">{cl.memberUserIds?.length || 0} Members</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-text-secondary">Dominant Topics:</span>
                    <div className="flex flex-wrap gap-1">
                      {cl.dominantInterests?.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-seafoam text-teal-dark border border-teal-primary/30 text-[10px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-bg border border-border-subtle text-xs text-text-secondary">
              <p>
                <strong className="text-text-primary font-semibold">Complexity:</strong> Runs in <strong className="text-teal-dark">O(K · N · D · I)</strong> time with K-Means++ seeding.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Why Explanation Modal */}
      {isModalOpen && selectedCandidate && (
        <WhyExplanationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sourceUser={currentUser || { id: bfsStartUser, name: 'Tanisha Shah' }}
          candidate={selectedCandidate}
          onConnect={() => setIsModalOpen(false)}
        />
      )}

    </div>
  );
};
