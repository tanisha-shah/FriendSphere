import React, { useMemo } from 'react';

export const BFSGraphView = ({
  nodes = [],
  links = [],
  sourceId,
  currentNodeId,
  discoveredIds = [],
  processedIds = [],
  distances = {},
  onSelectNode
}) => {
  // Compute circle positions in a neat 2D circular/layered radial layout around the source
  const layout = useMemo(() => {
    if (!nodes || nodes.length === 0) return { positions: {}, width: 440, height: 320 };

    const width = 460;
    const height = 330;
    const centerX = width / 2;
    const centerY = height / 2;
    const positions = {};

    // Source node placed at center
    positions[sourceId] = { x: centerX, y: centerY };

    // Group remaining nodes by distance / tier
    const tier1 = [];
    const tier2 = [];
    const other = [];

    nodes.forEach(n => {
      if (n.id === sourceId) return;
      const d = distances[n.id] ?? (distances[String(n.id)] ?? 99);
      if (d === 1) tier1.push(n);
      else if (d === 2) tier2.push(n);
      else other.push(n);
    });

    // Place Tier 1 in inner circle (radius 80)
    const r1 = 82;
    tier1.forEach((n, idx) => {
      const angle = (idx / Math.max(tier1.length, 1)) * 2 * Math.PI - Math.PI / 2;
      positions[n.id] = {
        x: centerX + r1 * Math.cos(angle),
        y: centerY + r1 * Math.sin(angle)
      };
    });

    // Place Tier 2 in outer circle (radius 135)
    const r2 = 136;
    tier2.forEach((n, idx) => {
      const angle = (idx / Math.max(tier2.length, 1)) * 2 * Math.PI - Math.PI / 3;
      positions[n.id] = {
        x: centerX + r2 * Math.cos(angle),
        y: centerY + r2 * Math.sin(angle)
      };
    });

    // Remainder
    const r3 = 145;
    other.forEach((n, idx) => {
      const angle = (idx / Math.max(other.length, 1)) * 2 * Math.PI;
      positions[n.id] = {
        x: centerX + r3 * Math.cos(angle),
        y: centerY + r3 * Math.sin(angle)
      };
    });

    return { positions, width, height };
  }, [nodes, sourceId, distances]);

  const { positions, width, height } = layout;

  return (
    <div className="relative w-full h-[330px] bg-bg/90 rounded-2xl border border-border-subtle overflow-hidden flex items-center justify-center select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="sourceGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
          </radialGradient>
          <filter id="activeShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#14b8a6" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Concentric tier guide rings */}
        <circle cx={width / 2} cy={height / 2} r="82" fill="none" stroke="currentColor" strokeDasharray="3 3" className="text-border-subtle/50" />
        <circle cx={width / 2} cy={height / 2} r="136" fill="none" stroke="currentColor" strokeDasharray="3 3" className="text-border-subtle/40" />

        {/* Edges */}
        <g strokeLinecap="round">
          {links.map((link, idx) => {
            const sourcePos = positions[link.source?.id ?? link.source];
            const targetPos = positions[link.target?.id ?? link.target];
            if (!sourcePos || !targetPos) return null;

            const u = link.source?.id ?? link.source;
            const v = link.target?.id ?? link.target;

            const isCurrentEdge =
              (u === currentNodeId && discoveredIds.includes(v)) ||
              (v === currentNodeId && discoveredIds.includes(u));

            const isExploredEdge =
              processedIds.includes(u) && processedIds.includes(v);

            return (
              <line
                key={`link-${idx}`}
                x1={sourcePos.x}
                y1={sourcePos.y}
                x2={targetPos.x}
                y2={targetPos.y}
                stroke={isCurrentEdge ? '#14b8a6' : isExploredEdge ? '#94a3b8' : '#e2e8f0'}
                strokeWidth={isCurrentEdge ? 2.5 : isExploredEdge ? 1.5 : 1}
                strokeOpacity={isCurrentEdge ? 1 : isExploredEdge ? 0.7 : 0.35}
                className="transition-all duration-300"
              />
            );
          })}
        </g>

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = positions[node.id];
          if (!pos) return null;

          const isSource = node.id === sourceId;
          const isCurrent = node.id === currentNodeId;
          const isDiscovered = discoveredIds.includes(node.id);
          const isProcessed = processedIds.includes(node.id);

          let fill = '#ffffff';
          let stroke = '#cbd5e1';
          let strokeWidth = 1.5;

          if (isSource) {
            fill = '#14b8a6';
            stroke = '#0d9488';
            strokeWidth = 3;
          } else if (isCurrent) {
            fill = '#3b82f6';
            stroke = '#1d4ed8';
            strokeWidth = 3.5;
          } else if (isDiscovered && !isProcessed) {
            fill = '#f59e0b';
            stroke = '#d97706';
            strokeWidth = 2.5;
          } else if (isProcessed) {
            fill = '#10b981';
            stroke = '#059669';
            strokeWidth = 2;
          }

          const dist = distances[node.id] ?? distances[String(node.id)];
          const displayName = node.name ? node.name.split(' ')[0] : `ID ${node.id}`;

          return (
            <g
              key={`node-${node.id}`}
              transform={`translate(${pos.x}, ${pos.y})`}
              className="cursor-pointer transition-transform duration-200 hover:scale-110"
              onClick={() => onSelectNode && onSelectNode(node.id)}
            >
              {isCurrent && (
                <circle
                  r="21"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  className="animate-ping opacity-60"
                />
              )}

              {/* Main circle */}
              <circle
                r={isSource ? 16 : isCurrent ? 15 : 13}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                filter={isCurrent || isSource ? 'url(#activeShadow)' : undefined}
                className="transition-colors duration-300"
              />

              {/* Inner symbol or distance */}
              <text
                dy="4"
                textAnchor="middle"
                fontSize={isSource ? "10" : "9"}
                fontWeight="bold"
                fill={isSource || isCurrent || isProcessed ? "#ffffff" : "#475569"}
              >
                {isSource ? 'YOU' : dist !== undefined ? `d=${dist}` : displayName.slice(0, 1)}
              </text>

              {/* Label underneath */}
              <text
                dy={isSource ? "28" : "25"}
                textAnchor="middle"
                fontSize="10"
                fontWeight={isCurrent || isSource ? "bold" : "500"}
                fill={isCurrent ? "#1e40af" : isSource ? "#0f766e" : "#334155"}
                className="pointer-events-none"
              >
                {displayName}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating graph status badge */}
      <div className="absolute top-2.5 right-2.5 bg-surface/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-border-subtle text-[11px] font-medium text-text-secondary flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        <span>Click nodes to inspect</span>
      </div>
    </div>
  );
};
