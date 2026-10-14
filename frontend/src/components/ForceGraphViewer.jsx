import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, RotateCcw, Eye, ShieldAlert, Sparkles } from 'lucide-react';

const clusterColors = [
  '#2dd4bf', // Teal (Algorithms / Tech)
  '#38bdf8', // Sky (AI / ML)
  '#a855f7', // Purple (Systems / Security)
  '#f43f5e', // Rose (Creative / Media)
  '#fbbf24', // Amber (Quantum / Astro)
  '#34d399', // Emerald (Outdoors)
];

export const ForceGraphViewer = ({
  data,
  highlightPath = [],
  highlightBridges = [],
  bfsWaveSteps = [],
  activeUserId = null,
  onNodeClick = null,
  selectedNodeId = null
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    if (!data || !data.nodes || data.nodes.length === 0 || !svgRef.current) return;

    const width = containerRef.current ? containerRef.current.clientWidth : 800;
    const height = containerRef.current ? containerRef.current.clientHeight : 550;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    svg.attr('viewBox', [0, 0, width, height]);

    // Zoom container
    const g = svg.append('g');

    const zoom = d3.zoom()
      .scaleExtent([0.2, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    // Deep copy data for D3 simulation
    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({ ...d }));

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => 80 / (d.weight || 1)))
      .force('charge', d3.forceManyBody().strength(-220))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(25));

    // Paths lookup for Dijkstra highlights
    const pathEdges = new Set();
    if (highlightPath && highlightPath.length > 1) {
      for (let i = 0; i < highlightPath.length - 1; i++) {
        const u = highlightPath[i];
        const v = highlightPath[i + 1];
        pathEdges.add(`${Math.min(u, v)}-${Math.max(u, v)}`);
      }
    }

    // Bridges lookup
    const bridgeEdges = new Set();
    if (highlightBridges && highlightBridges.length > 0) {
      for (const b of highlightBridges) {
        bridgeEdges.add(`${Math.min(b.u, b.v)}-${Math.max(b.u, b.v)}`);
      }
    }

    // Render Links
    const link = g.append('g')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => {
        const edgeKey = `${Math.min(d.source.id || d.source, d.target.id || d.target)}-${Math.max(d.source.id || d.source, d.target.id || d.target)}`;
        if (pathEdges.has(edgeKey)) return 4.5;
        if (bridgeEdges.has(edgeKey)) return 3.5;
        return Math.max(1.2, (d.weight || 1) * 0.8);
      })
      .attr('stroke', d => {
        const edgeKey = `${Math.min(d.source.id || d.source, d.target.id || d.target)}-${Math.max(d.source.id || d.source, d.target.id || d.target)}`;
        if (pathEdges.has(edgeKey)) return '#10b981'; // Dijkstra glowing green
        if (bridgeEdges.has(edgeKey)) return '#f43f5e'; // Bridge critical red
        return '#334155';
      })
      .attr('stroke-dasharray', d => {
        const edgeKey = `${Math.min(d.source.id || d.source, d.target.id || d.target)}-${Math.max(d.source.id || d.source, d.target.id || d.target)}`;
        if (bridgeEdges.has(edgeKey)) return '4 3';
        return null;
      });

    // Render Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Node Outer Glow / Rings
    node.append('circle')
      .attr('r', d => {
        if (d.id === activeUserId) return 22;
        if (d.id === selectedNodeId) return 20;
        if (highlightPath.includes(d.id)) return 18;
        return 14;
      })
      .attr('fill', (d, i) => {
        if (d.id === activeUserId) return '#14b8a6';
        if (d.id === selectedNodeId) return '#f59e0b';
        if (highlightPath.includes(d.id)) return '#10b981';
        return clusterColors[d.id % clusterColors.length];
      })
      .attr('stroke', d => {
        if (d.id === activeUserId) return '#ffffff';
        if (d.id === selectedNodeId) return '#fbbf24';
        if (highlightPath.includes(d.id)) return '#6ee7b7';
        return '#0f172a';
      })
      .attr('stroke-width', d => (d.id === activeUserId || d.id === selectedNodeId || highlightPath.includes(d.id) ? 3 : 1.5))
      .attr('class', 'cursor-pointer transition-transform hover:scale-125')
      .on('mouseover', (event, d) => setHoveredNode(d))
      .on('mouseout', () => setHoveredNode(null))
      .on('click', (event, d) => {
        if (onNodeClick) onNodeClick(d);
      });

    // Node Labels
    node.append('text')
      .attr('dy', 26)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-family', 'sans-serif')
      .attr('font-weight', d => (d.id === activeUserId || d.id === selectedNodeId ? 'bold' : 'normal'))
      .attr('fill', d => (d.id === activeUserId ? '#2dd4bf' : d.id === selectedNodeId ? '#fbbf24' : '#cbd5e1'))
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
  }, [data, highlightPath, highlightBridges, activeUserId, selectedNodeId]);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-bg rounded-xl overflow-hidden border border-border-subtle" ref={containerRef}>
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Graph Legend & Controls */}
      <div className="absolute top-4 left-4 p-3 rounded-lg bg-surface-sec  border border-border-subtle text-xs space-y-2 shadow-md">
        <div className="font-bold text-text-primary flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-dark" />
          <span>Interactive Social Graph</span>
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-brand-400 border border-white"></span>
            <span className="text-text-secondary">Active User (You)</span>
          </div>
          {highlightPath.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-teal-dark font-semibold">Dijkstra Shortest Path</span>
            </div>
          )}
          {highlightBridges.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-rose-500 border-t border-dashed border-rose-400"></span>
              <span className="text-text-secondary font-semibold">DFS Critical Bridge</span>
            </div>
          )}
        </div>
      </div>

      {/* Node Tooltip on Hover */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 max-w-xs p-3.5 rounded-lg bg-surface-sec  border border-teal-primary/30 text-xs shadow-md animate-in fade-in-50 duration-100">
          <div className="flex items-center gap-2.5 mb-1.5">
            {hoveredNode.avatar && (
              <img src={hoveredNode.avatar} alt={hoveredNode.name} className="w-7 h-7 rounded-full object-cover" />
            )}
            <div>
              <div className="font-bold text-text-primary">{hoveredNode.name}</div>
              <div className="text-[10px] text-teal-dark">@{hoveredNode.username} • Node #{hoveredNode.id}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-text-secondary pt-1.5 border-t border-border-subtle">
            <div>Degree: <span className="font-mono text-surface font-bold">{hoveredNode.degree} friends</span></div>
            <div>Clustering: <span className="font-mono text-teal-primary font-bold">{(hoveredNode.clusteringCoeff * 100).toFixed(0)}%</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
