import React from 'react';

const algoColors = {
  BFS: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  DFS: 'bg-purple-500/10 text-teal-dark border-purple-500/30',
  Dijkstra: 'bg-emerald-500/10 text-teal-dark border-emerald-500/30',
  DSU: 'bg-amber-500/10 text-text-secondary border-amber-500/30',
  Jaccard: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  Cosine: 'bg-indigo-500/10 text-teal-dark border-indigo-500/30',
  KMeans: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  'Min-Heap': 'bg-teal-500/10 text-teal-dark border-teal-500/30',
  MergeSort: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  Trie: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  BinarySearch: 'bg-rose-500/10 text-text-secondary border-rose-500/30',
};

export const AlgorithmBadge = ({ name, tooltip, size = 'sm' }) => {
  const color = algoColors[name] || 'bg-surface text-text-secondary border-border-subtle';
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      title={tooltip || `Powered by ${name} C++ Algorithmic Core`}
      className={`inline-flex items-center font-mono font-medium rounded-full border ${color} ${sizeClass} transition-all duration-200 hover:scale-105 select-none`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {name}
    </span>
  );
};
