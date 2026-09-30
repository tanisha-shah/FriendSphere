import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Users,
  Network,
  UserPlus,
  MessageSquare,
  Sparkles,
  GitBranch,
  X,
  ArrowRight,
  Shield,
  Layers,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { AlgorithmBadge } from '../components/AlgorithmBadge';

export const NetworkPage = () => {
  const { currentUser, allUsers, refreshCurrentUser } = useAuth();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserStats, setSelectedUserStats] = useState(null);
  const [friendsSet, setFriendsSet] = useState(new Set());
  const [fofSet, setFofSet] = useState(new Set());
  const [suggestedSet, setSuggestedSet] = useState(new Set());
  const [actionSuccess, setActionSuccess] = useState('');

  const svgRef = useRef(null);
  const containerRef = useRef(null);

  const fetchNetworkTopology = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [gData, friends, recs] = await Promise.all([
        api.getGraphData(0, 3),
        api.getUserFriends(currentUser.id),
        api.getRecommendations(currentUser.id, 10),
      ]);

      setGraphData(gData);

      const fSet = new Set(friends.map(f => f.id));
      setFriendsSet(fSet);

      const sSet = new Set(recs.map(r => r.userId));
      setSuggestedSet(sSet);

      // Friends of friends (2-hops)
      const fof = new Set();
      gData.links.forEach(l => {
        const u = typeof l.source === 'object' ? l.source.id : l.source;
        const v = typeof l.target === 'object' ? l.target.id : l.target;
        if (fSet.has(u) && !fSet.has(v) && v !== currentUser.id) fof.add(v);
        if (fSet.has(v) && !fSet.has(u) && u !== currentUser.id) fof.add(u);
      });
      setFofSet(fof);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkTopology();
  }, [currentUser]);

  // Load details when a node is selected
  const handleSelectNode = async (node) => {
    const userObj = allUsers.find(u => u.id === node.id);
    setSelectedUser(userObj || node);

    if (currentUser && node.id !== currentUser.id) {
      try {
        const [mutuals, dPath] = await Promise.all([
          api.getMutualFriends(currentUser.id, node.id),
          api.getDijkstraPath(currentUser.id, node.id),
        ]);
        setSelectedUserStats({
          mutuals,
          dijkstraPath: dPath,
          hops: dPath.path?.length ? dPath.path.length - 1 : (friendsSet.has(node.id) ? 1 : (fofSet.has(node.id) ? 2 : 3)),
          affinity: Math.round((dPath.socialAffinityScore || 0.7) * 100)
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      setSelectedUserStats(null);
    }
  };

  // Render D3 Graph Canvas
  useEffect(() => {
    if (!graphData.nodes.length || !svgRef.current) return;

    const width = containerRef.current ? containerRef.current.clientWidth : 800;
    const height = 580;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', [0, 0, width, height]);

    const g = svg.append('g');

    const zoom = d3.zoom()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => g.attr('transform', event.transform));

    svg.call(zoom);

    const nodes = graphData.nodes.map(d => ({ ...d }));
    const links = graphData.links.map(d => ({ ...d }));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(75))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(24));

    // Links
    const link = g.append('g')
      .attr('stroke', '#334155')
      .attr('stroke-opacity', 0.5)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => Math.max(1, (d.weight || 1) * 0.7));

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      );

    // Node circles with category colors
    node.append('circle')
      .attr('r', d => (d.id === currentUser?.id ? 20 : selectedUser?.id === d.id ? 18 : 14))
      .attr('fill', d => {
        if (d.id === currentUser?.id) return '#14b8a6'; // Active User (Teal)
        if (friendsSet.has(d.id)) return '#10b981'; // Direct Friend (Emerald)
        if (fofSet.has(d.id)) return '#38bdf8'; // Friend of Friend (Sky)
        if (suggestedSet.has(d.id)) return '#f59e0b'; // Suggested (Amber)
        return '#a855f7'; // Community Member (Purple)
      })
      .attr('stroke', d => (selectedUser?.id === d.id ? '#ffffff' : '#0f172a'))
      .attr('stroke-width', d => (selectedUser?.id === d.id ? 3 : 1.5))
      .attr('class', 'cursor-pointer hover:scale-125 transition-transform')
      .on('click', (event, d) => handleSelectNode(d));

    // Node Labels
    node.append('text')
      .attr('dy', 26)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', d => (d.id === currentUser?.id ? 'bold' : 'normal'))
      .attr('fill', d => (d.id === currentUser?.id ? '#2dd4bf' : '#cbd5e1'))
      .text(d => d.name ? d.name.split(' ')[0] : `User ${d.id}`);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [graphData, friendsSet, fofSet, suggestedSet, selectedUser, currentUser]);

  const handleConnectDirect = async (userId) => {
    if (!currentUser) return;
    try {
      await api.removeFriend(currentUser.id, userId);
      await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1Id: currentUser.id, user2Id: userId, weight: 4.0 })
      });
      setActionSuccess('Connected on social graph!');
      setTimeout(() => setActionSuccess(''), 3000);
      refreshCurrentUser();
      fetchNetworkTopology();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <Network className="w-6 h-6 text-brand-400" />
            <span>My Social Network</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explore your social network topology, connection distances, and community clusters.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400"></span>
            <span className="text-slate-300">You</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Direct Friend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span className="text-slate-300">Friend of Friend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-300">Suggested Match</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span className="text-slate-300">Community</span>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Graph Viewer + Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Canvas */}
        <div className="lg:col-span-2 h-[580px] relative glow-card rounded-3xl overflow-hidden border border-slate-800" ref={containerRef}>
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 animate-pulse">
              Mapping social connections...
            </div>
          ) : (
            <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-slate-950" />
          )}

          <div className="absolute bottom-3 right-3 text-[11px] text-slate-500 bg-slate-900/80 px-2.5 py-1 rounded-xl">
            Drag nodes • Scroll to Zoom & Pan
          </div>
        </div>

        {/* Selected Node Inspector Drawer */}
        <div className="glow-card rounded-3xl p-5 space-y-5 border border-slate-800">
          {selectedUser ? (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-500/40"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{selectedUser.name}</h3>
                    <p className="text-xs text-brand-400 font-medium">@{selectedUser.username}</p>
                    <p className="text-[11px] text-slate-400">{selectedUser.college || selectedUser.location}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedUser.headline || selectedUser.bio}
              </p>

              {/* Network Connection Stats */}
              {selectedUserStats && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-2xl bg-slate-850">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Social Distance</span>
                      <span className="text-sm font-black font-mono text-slate-100">
                        {selectedUserStats.hops} Degree{selectedUserStats.hops !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-850">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Affinity Score</span>
                      <span className="text-sm font-black font-mono text-brand-400">
                        {selectedUserStats.affinity}%
                      </span>
                    </div>
                  </div>

                  {/* Mutual Friends list */}
                  {selectedUserStats.mutuals?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-300">
                        Mutual Friends ({selectedUserStats.mutuals.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedUserStats.mutuals.map((m) => (
                          <span
                            key={m.id}
                            className="px-2 py-0.5 rounded-lg bg-slate-800 text-[11px] text-slate-200 border border-slate-700"
                          >
                            {m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interests */}
                  {selectedUser.interests && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-300">Shared Topics:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedUser.interests.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-lg bg-brand-500/10 text-brand-300 text-[10px] font-mono">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {selectedUser.id !== currentUser?.id && (
                <div className="pt-3 border-t border-slate-800 flex gap-2">
                  {friendsSet.has(selectedUser.id) ? (
                    <span className="w-full py-2.5 text-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Direct Friend
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConnectDirect(selectedUser.id)}
                      className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add to Network</span>
                    </button>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
              <Network className="w-12 h-12 text-slate-700" />
              <h4 className="text-sm font-bold text-slate-300">Select any connection</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Click any person in the network graph to inspect degrees of separation, shared topics, and shortest social paths.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
