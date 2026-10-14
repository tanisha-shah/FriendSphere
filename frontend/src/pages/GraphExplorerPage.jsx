import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ForceGraphViewer } from '../components/ForceGraphViewer';
import { AlgorithmBadge } from '../components/AlgorithmBadge';
import {
  Network,
  GitBranch,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  Sliders,
  Maximize2
} from 'lucide-react';

export const GraphExplorerPage = () => {
  const { currentUser, allUsers } = useAuth();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  
  // Algorithm Simulator States
  const [mode, setMode] = useState('full'); // 'full', 'dijkstra', 'bfs', 'bridges', 'triangles'
  const [targetUserId, setTargetUserId] = useState(2);
  const [dijkstraResult, setDijkstraResult] = useState(null);
  const [bfsTrace, setBfsTrace] = useState([]);
  const [bridges, setBridges] = useState([]);
  const [triangles, setTriangles] = useState([]);
  const [highlightPath, setHighlightPath] = useState([]);
  const [highlightBridges, setHighlightBridges] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [bfsStepIndex, setBfsStepIndex] = useState(0);

  const fetchGraph = async () => {
    try {
      setLoading(true);
      const data = await api.getGraphData(0, 3);
      setGraphData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  // Run Dijkstra Shortest Path
  const runDijkstra = async () => {
    if (!currentUser || !targetUserId) return;
    try {
      setSimulating(true);
      const res = await api.getDijkstraPath(currentUser.id, targetUserId);
      setDijkstraResult(res);
      setHighlightPath(res.path || []);
      setHighlightBridges([]);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  // Run BFS Traversal Trace
  const runBfsTrace = async () => {
    if (!currentUser) return;
    try {
      setSimulating(true);
      const trace = await api.getBfsTrace(currentUser.id, 3);
      setBfsTrace(trace);
      setBfsStepIndex(0);
      setHighlightPath([currentUser.id]);
      setHighlightBridges([]);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  // Run DFS Bridges (Tarjan's algorithm)
  const runDfsBridges = async () => {
    try {
      setSimulating(true);
      const bridgeList = await api.getBridges();
      setBridges(bridgeList);
      setHighlightBridges(bridgeList);
      setHighlightPath([]);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  // Run Triangles Finder
  const runTriangles = async () => {
    if (!currentUser) return;
    try {
      setSimulating(true);
      const triList = await api.getTriangles(currentUser.id);
      setTriangles(triList);
      setHighlightBridges([]);
      setHighlightPath([]);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  const handleReset = () => {
    setHighlightPath([]);
    setHighlightBridges([]);
    setDijkstraResult(null);
    setBfsTrace([]);
    setBridges([]);
    setTriangles([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2.5">
            <Network className="w-7 h-7 text-teal-dark" />
            <span>Interactive Social Graph & Algorithm Simulator</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Real-time D3 canvas powered by C++ graph algorithms with interactive live step traces.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AlgorithmBadge name="BFS" />
          <AlgorithmBadge name="DFS" />
          <AlgorithmBadge name="Dijkstra" />
        </div>
      </div>

      {/* Main Visualizer + Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Graph Canvas */}
        <div className="lg:col-span-2 h-[600px] relative">
          {loading ? (
            <div className="w-full h-full bg-surface-sec rounded-xl animate-pulse flex items-center justify-center text-xs text-text-secondary">
              Loading social topology...
            </div>
          ) : (
            <ForceGraphViewer
              data={graphData}
              activeUserId={currentUser?.id}
              selectedNodeId={targetUserId}
              highlightPath={highlightPath}
              highlightBridges={highlightBridges}
            />
          )}
        </div>

        {/* Right 1 Col: Algorithm Controls */}
        <div className="space-y-5">
          
          {/* Mode Tabs */}
          <div className="glow-card rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-dark" />
              <span>DAA Algorithm Simulation Modes</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setMode('dijkstra'); handleReset(); }}
                className={`p-3 rounded-lg text-xs font-semibold text-left transition-all border ${
                  mode === 'dijkstra'
                    ? 'bg-emerald-500/20 text-teal-dark border-emerald-500/50 shadow-md shadow-sm'
                    : 'bg-surface text-text-secondary border-border-subtle/60 hover:bg-surface-hov'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Dijkstra Path</span>
                </div>
                <div className="text-[10px] text-text-secondary">Weighted affinity path</div>
              </button>

              <button
                onClick={() => { setMode('bfs'); handleReset(); }}
                className={`p-3 rounded-lg text-xs font-semibold text-left transition-all border ${
                  mode === 'bfs'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-md shadow-sm'
                    : 'bg-surface text-text-secondary border-border-subtle/60 hover:bg-surface-hov'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Network className="w-3.5 h-3.5" />
                  <span>BFS Traversal</span>
                </div>
                <div className="text-[10px] text-text-secondary">Level-order wave trace</div>
              </button>

              <button
                onClick={() => { setMode('bridges'); handleReset(); runDfsBridges(); }}
                className={`p-3 rounded-lg text-xs font-semibold text-left transition-all border ${
                  mode === 'bridges'
                    ? 'bg-rose-500/20 text-text-secondary border-rose-500/50 shadow-md shadow-sm'
                    : 'bg-surface text-text-secondary border-border-subtle/60 hover:bg-surface-hov'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>DFS Bridges</span>
                </div>
                <div className="text-[10px] text-text-secondary">Tarjan's critical ties</div>
              </button>

              <button
                onClick={() => { setMode('triangles'); handleReset(); runTriangles(); }}
                className={`p-3 rounded-lg text-xs font-semibold text-left transition-all border ${
                  mode === 'triangles'
                    ? 'bg-purple-500/20 text-teal-dark border-purple-500/50 shadow-md shadow-sm'
                    : 'bg-surface text-text-secondary border-border-subtle/60 hover:bg-surface-hov'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Triadic Closures</span>
                </div>
                <div className="text-[10px] text-text-secondary">3-cliques & triangles</div>
              </button>
            </div>
          </div>

          {/* Mode Configuration & Output Panel */}
          <div className="glow-card rounded-xl p-5 space-y-4">
            {mode === 'dijkstra' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-teal-dark flex items-center gap-1.5">
                    <GitBranch className="w-4 h-4" />
                    <span>Dijkstra Shortest Path Finder</span>
                  </h4>
                  <AlgorithmBadge name="Dijkstra" size="xs" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-text-secondary">Select Target User:</label>
                  <select
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(Number(e.target.value))}
                    className="w-full bg-surface text-xs text-text-primary rounded-xl px-3 py-2 border border-border-subtle focus:outline-none focus:border-emerald-500"
                  >
                    {allUsers
                      .filter((u) => u.id !== currentUser?.id)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} (@{u.username})
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  onClick={runDijkstra}
                  disabled={simulating}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-surface font-bold text-xs transition-all shadow-md shadow-sm flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Calculate Path in C++</span>
                </button>

                {dijkstraResult && (
                  <div className="p-4 rounded-lg bg-surface-sec border border-emerald-500/30 space-y-3 animate-in fade-in">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Total Graph Cost:</span>
                      <span className="font-mono text-teal-dark font-bold">{dijkstraResult.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Social Affinity:</span>
                      <span className="font-mono text-teal-dark font-bold">{(dijkstraResult.socialAffinityScore * 100).toFixed(1)}%</span>
                    </div>
                    <div className="pt-2 border-t border-border-subtle">
                      <div className="text-[11px] font-semibold text-text-secondary mb-1.5">Reconstructed Shortest Route:</div>
                      <div className="flex flex-wrap items-center gap-1 text-xs">
                        {dijkstraResult.pathUsers?.map((u, i) => (
                          <React.Fragment key={u.id}>
                            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-teal-dark font-mono text-[11px]">
                              {u.name}
                            </span>
                            {i < dijkstraResult.pathUsers.length - 1 && (
                              <ArrowRight className="w-3 h-3 text-surface0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === 'bfs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <Network className="w-4 h-4" />
                    <span>BFS Level-Order Expansion</span>
                  </h4>
                  <AlgorithmBadge name="BFS" size="xs" />
                </div>

                <p className="text-xs text-text-secondary">
                  Explores the network layer-by-layer starting from your profile (Depth 0, 1, 2, 3) in $O(V + E)$ time.
                </p>

                <button
                  onClick={runBfsTrace}
                  className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-surface font-bold text-xs transition-all shadow-md shadow-sm flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Run BFS Level Order</span>
                </button>

                {bfsTrace.length > 0 && (
                  <div className="p-3 rounded-lg bg-surface-sec border border-blue-500/30 max-h-48 overflow-y-auto space-y-1.5">
                    {bfsTrace.map((step, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-surface">
                        <span className="text-text-primary">Depth {step.depth}: {step.name}</span>
                        <span className="font-mono text-[10px] text-blue-400">Node #{step.userId}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {mode === 'bridges' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>DFS Tarjan's Bridge Detector</span>
                  </h4>
                  <AlgorithmBadge name="DFS" size="xs" />
                </div>

                <p className="text-xs text-text-secondary">
                  Critical bridge connections whose removal fragments the graph into multiple disconnected components.
                </p>

                <div className="p-3 rounded-lg bg-surface-sec border border-rose-500/30 max-h-48 overflow-y-auto space-y-1.5">
                  {bridges.length > 0 ? (
                    bridges.map((b, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-surface text-text-secondary">
                        <span>{b.uName} ↔ {b.vName}</span>
                        <span className="font-mono text-[10px] text-text-secondary">Edge #{b.u}-{b.v}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-text-secondary text-center py-2">
                      Computing bridges using DFS low-link values...
                    </div>
                  )}
                </div>
              </div>
            )}

            {mode === 'triangles' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-teal-dark flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Triadic Closures (3-Cliques)</span>
                  </h4>
                  <AlgorithmBadge name="DFS" size="xs" />
                </div>

                <p className="text-xs text-text-secondary">
                  Triangles represent strong social ties where two of your friends are also friends with each other.
                </p>

                <div className="p-3 rounded-lg bg-surface-sec border border-purple-500/30 max-h-48 overflow-y-auto space-y-1.5">
                  {triangles.map((tri, idx) => (
                    <div key={idx} className="text-xs py-1.5 px-2.5 rounded bg-surface text-teal-dark font-mono">
                      △ ({tri.map(t => t.name).join(' - ')})
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full py-2 rounded-xl bg-surface hover:bg-surface-hov text-text-secondary text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Visual Overlays</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
