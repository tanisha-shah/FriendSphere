import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  X,
  Sparkles,
  Network,
  GitBranch,
  ShieldCheck,
  TrendingUp,
  Users,
  Compass,
  ArrowRight,
  UserPlus,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { AlgorithmBadge } from './AlgorithmBadge';

export const DAAExplanationModal = ({
  isOpen,
  onClose,
  sourceUser,
  candidate,
  onFriendAdded
}) => {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    if (isOpen && sourceUser && candidate) {
      const fetchExplanation = async () => {
        try {
          setLoading(true);
          const data = await api.getExplanation(sourceUser.id, candidate.userId);
          setExplanation(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchExplanation();
    }
  }, [isOpen, sourceUser, candidate]);

  if (!isOpen || !candidate) return null;

  const handleSendRequest = async () => {
    try {
      await api.sendRequest(sourceUser.id, candidate.userId);
      setActionSuccess('Friend request sent successfully!');
      if (onFriendAdded) onFriendAdded();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFriendDirect = async () => {
    try {
      await api.removeFriend(sourceUser.id, candidate.userId); // safely ensure no duplicate
      await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1Id: sourceUser.id, user2Id: candidate.userId, weight: 4.0 })
      });
      setActionSuccess('Added to direct friend network!');
      if (onFriendAdded) onFriendAdded();
    } catch (e) {
      console.error(e);
    }
  };

  const user = candidate.user || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg  flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-surface-sec border border-border-subtle/80 rounded-xl shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 from-slate-900 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-seafoam border border-teal-primary/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-dark" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                DAA Algorithmic Recommendation Breakdown
              </h2>
              <p className="text-xs text-text-secondary">
                Transparent Explainability & Mathematical Scoring
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface hover:bg-surface-hov text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Target Profile Card */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border-subtle/60">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-14 h-14 rounded-lg object-cover border-2 border-teal-primary/50"
              />
              <div>
                <h3 className="text-base font-bold text-text-primary">{user.name}</h3>
                <p className="text-xs text-teal-dark font-medium">@{user.username} • {user.location}</p>
                <p className="text-xs text-text-secondary mt-1 line-clamp-1">{user.headline || user.bio}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-text-secondary font-medium">DAA Match Score</div>
              <div className="text-2xl font-black text-teal-dark font-mono">
                {(candidate.finalScore * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Detailed Reason Badges */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-dark" />
              Algorithmic Justifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {candidate.detailedReasons?.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-surface-sec border border-border-subtle text-xs text-text-primary flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-dark shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mathematical Metric Scoring Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-dark" />
              DAA Multi-Factor Score Composition
            </h4>
            
            <div className="space-y-2.5 bg-surface-sec p-4 rounded-lg border border-border-subtle">
              
              {/* Graph Proximity */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <AlgorithmBadge name="BFS" size="xs" />
                    <span>Graph Proximity (Hops & Mutuals)</span>
                  </span>
                  <span className="font-mono text-teal-dark">{(candidate.graphProximityScore * 100).toFixed(1)}% (Weight: 35%)</span>
                </div>
                <div className="h-2 bg-surface-hov rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${candidate.graphProximityScore * 100}%` }}
                  />
                </div>
              </div>

              {/* Jaccard Similarity */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <AlgorithmBadge name="Jaccard" size="xs" />
                    <span>Interest Jaccard Similarity</span>
                  </span>
                  <span className="font-mono text-teal-dark">{(candidate.interestJaccardScore * 100).toFixed(1)}% (Weight: 25%)</span>
                </div>
                <div className="h-2 bg-surface-hov rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${candidate.interestJaccardScore * 100}%` }}
                  />
                </div>
              </div>

              {/* Cosine Vector Similarity */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <AlgorithmBadge name="Cosine" size="xs" />
                    <span>High-Dimensional Cosine Vector</span>
                  </span>
                  <span className="font-mono text-teal-dark">{(candidate.vectorCosineScore * 100).toFixed(1)}% (Weight: 20%)</span>
                </div>
                <div className="h-2 bg-surface-hov rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${candidate.vectorCosineScore * 100}%` }}
                  />
                </div>
              </div>

              {/* Community & DSU */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <AlgorithmBadge name="DSU" size="xs" />
                    <span>Community / K-Means Affinity</span>
                  </span>
                  <span className="font-mono text-teal-dark">{(candidate.communityAffinityScore * 100).toFixed(1)}% (Weight: 10%)</span>
                </div>
                <div className="h-2 bg-surface-hov rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${candidate.communityAffinityScore * 100}%` }}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Dijkstra Social Affinity Shortest Path */}
          {loading ? (
            <div className="p-4 text-center text-xs text-text-secondary animate-pulse">
              Computing graph traversal paths...
            </div>
          ) : explanation && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-teal-dark" />
                Dijkstra Shortest Social Path & Traversal
              </h4>

              <div className="p-4 rounded-lg bg-surface-sec border border-border-subtle/60 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-text-secondary">Social Path:</span>
                  {explanation.dijkstraPathUsers?.map((u, i) => (
                    <React.Fragment key={u.id}>
                      <span className={`px-2.5 py-1 rounded-lg font-mono text-xs ${
                        u.id === sourceUser.id
                          ? 'bg-seafoam text-teal-primary border border-teal-primary/40'
                          : u.id === candidate.userId
                          ? 'bg-emerald-500/20 text-teal-dark border border-emerald-500/40'
                          : 'bg-slate-700 text-text-primary'
                      }`}>
                        {u.name}
                      </span>
                      {i < explanation.dijkstraPathUsers.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-surface0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-border-subtle">
                  <div>
                    <span className="text-text-secondary">BFS Separation:</span>
                    <p className="font-mono font-bold text-text-primary">{explanation.shortestHops} degree{explanation.shortestHops !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Dijkstra Affinity:</span>
                    <p className="font-mono font-bold text-teal-dark">{(explanation.dijkstraSocialAffinity * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <span className="text-text-secondary">DSU Cluster:</span>
                    <p className="font-mono font-bold text-text-secondary">{explanation.sameDSUComponent ? 'Connected Circle' : 'Separate'}</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Mutual Friends Section */}
          {explanation?.mutualFriends?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Mutual Friends ({explanation.mutualFriends.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {explanation.mutualFriends.map((mf) => (
                  <div
                    key={mf.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border-subtle text-xs text-text-primary"
                  >
                    <img src={mf.avatar} alt={mf.name} className="w-5 h-5 rounded-full object-cover" />
                    <span>{mf.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {actionSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-teal-dark flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-surface-sec border-t border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlgorithmBadge name="Min-Heap" size="xs" tooltip="Top-K priority extracted in O(N log K)" />
            <AlgorithmBadge name="MergeSort" size="xs" tooltip="Multi-criteria sorted in O(N log N)" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSendRequest}
              className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-hov text-text-primary hover:text-text-primary border border-border-subtle text-xs font-semibold transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Send Request
            </button>
            <button
              onClick={handleAddFriendDirect}
              className="px-4 py-2 rounded-xl bg-teal-primary hover:bg-teal-primary hover:text-surface text-xs font-bold transition-all shadow-md shadow-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Connect Directly
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
