import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Sparkles,
  HelpCircle,
  UserPlus,
  CheckCircle2,
  Users,
  Compass,
  TrendingUp,
  Cpu,
  Layers,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { AlgorithmBadge } from '../components/AlgorithmBadge';
import { DAAExplanationModal } from '../components/DAAExplanationModal';

export const DiscoveryPage = () => {
  const { currentUser, refreshCurrentUser } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topK, setTopK] = useState(12);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchRecommendations = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await api.getRecommendations(currentUser.id, topK);
      setCandidates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [currentUser, topK]);

  const handleExplain = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleSendRequest = async (candidateUserId) => {
    try {
      await api.sendRequest(currentUser.id, candidateUserId);
      setActionMessage(`Friend request sent!`);
      setTimeout(() => setActionMessage(''), 3000);
      fetchRecommendations();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDirectConnect = async (candidateUserId) => {
    try {
      await api.removeFriend(currentUser.id, candidateUserId);
      await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1Id: currentUser.id, user2Id: candidateUserId, weight: 4.0 })
      });
      setActionMessage('Added to your social graph!');
      setTimeout(() => setActionMessage(''), 3000);
      refreshCurrentUser();
      fetchRecommendations();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Hero Banner with DAA Highlights */}
      <div className="glow-card rounded-xl p-6 sm:p-8 from-slate-900 border border-teal-primary/20 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-seafoam rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-seafoam border border-teal-primary/30 text-xs font-semibold text-teal-dark">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Central DAA Recommendation Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Intelligent Friend Discovery & Social Affinity
          </h1>

          <p className="text-sm text-text-secondary leading-relaxed">
            Discover potential connections scored in genuine <span className="text-teal-primary font-semibold">C++17/20</span> using <span className="text-blue-400 font-mono">BFS Degrees of Separation</span>, <span className="text-cyan-400 font-mono">Jaccard Interest Index</span>, <span className="text-teal-dark font-mono">High-Dimensional Cosine Vectors</span>, <span className="text-teal-dark font-mono">Dijkstra Affinity</span>, and <span className="text-text-secondary font-mono">DSU Social Clusters</span>.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <AlgorithmBadge name="Min-Heap" tooltip="Top-K candidates extracted in O(N log K) time" />
            <AlgorithmBadge name="MergeSort" tooltip="Multi-criteria sorting (Score > Mutuals > Activity)" />
            <AlgorithmBadge name="Jaccard" tooltip="Interest set intersection over union" />
            <AlgorithmBadge name="Cosine" tooltip="Dot product normalized on high-dim vectors" />
            <AlgorithmBadge name="BFS" tooltip="2nd-degree & mutual friend discovery" />
            <AlgorithmBadge name="DSU" tooltip="Disjoint Set Union social partition tracking" />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-surface-sec border border-border-subtle">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-text-secondary">Top-K Heap Filter:</span>
          {[6, 12, 20].map((num) => (
            <button
              key={num}
              onClick={() => setTopK(num)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                topK === num
                  ? 'bg-teal-primary text-surface font-bold shadow-md shadow-sm'
                  : 'bg-surface text-text-secondary hover:bg-surface-hov'
              }`}
            >
              Top {num}
            </button>
          ))}
        </div>

        {actionMessage && (
          <div className="text-xs font-medium text-teal-dark bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionMessage}</span>
          </div>
        )}
      </div>

      {/* Recommendations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glow-card rounded-lg p-5 h-64 animate-pulse space-y-4">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-lg bg-surface" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface rounded w-3/4" />
                  <div className="h-3 bg-surface rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-surface rounded-xl" />
              <div className="h-8 bg-surface rounded-xl" />
            </div>
          ))}
        </div>
      ) : candidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidates.map((cand, index) => {
            const user = cand.user || {};
            const scorePercent = (cand.finalScore * 100).toFixed(1);

            return (
              <div
                key={cand.userId}
                className="glow-card rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:shadow-sm group relative"
              >
                {/* Ranking Pill */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-surface border border-border-subtle px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-teal-dark">
                  <span>#{index + 1}</span>
                  <span className="text-text-secondary">|</span>
                  <span>{scorePercent}%</span>
                </div>

                {/* Profile Header */}
                <div>
                  <div className="flex items-center gap-3.5 mb-3.5 pr-20">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-14 h-14 rounded-lg object-cover border-2 border-teal-primary/40 shrink-0 group-hover:border-brand-400 transition-colors"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-text-primary truncate group-hover:text-teal-primary transition-colors">
                        {user.name}
                      </h3>
                      <p className="text-xs text-teal-dark font-medium truncate">@{user.username}</p>
                      <p className="text-[11px] text-text-secondary truncate">{user.location}</p>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2 mb-3.5">
                    {user.headline || user.bio}
                  </p>

                  {/* Primary Transparent Reason */}
                  <div className="p-3 rounded-lg bg-surface-sec border border-border-subtle/60 mb-3.5 text-xs text-text-primary space-y-1">
                    <div className="text-[10px] font-semibold text-teal-dark uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Why Recommended</span>
                    </div>
                    <p className="font-medium leading-relaxed">{cand.primaryReason}</p>
                  </div>

                  {/* Common Interests Badges */}
                  {cand.sharedInterests && cand.sharedInterests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {cand.sharedInterests.slice(0, 3).map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-surface text-text-secondary text-[10px] font-medium border border-border-subtle/80"
                        >
                          #{item}
                        </span>
                      ))}
                      {cand.sharedInterests.length > 3 && (
                        <span className="text-[10px] text-text-secondary self-center">
                          +{cand.sharedInterests.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-border-subtle/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExplain(cand)}
                      className="flex-1 py-2 px-3 rounded-xl bg-surface hover:bg-surface-hov text-text-secondary hover:text-text-primary border border-border-subtle text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-teal-dark" />
                      <span>Why This Match?</span>
                    </button>

                    <button
                      onClick={() => handleDirectConnect(cand.userId)}
                      className="py-2 px-3 rounded-xl bg-teal-primary hover:bg-teal-primary hover:text-surface text-xs font-bold transition-all shadow-md shadow-sm flex items-center justify-center gap-1"
                      title="Add Direct Connection"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="glow-card rounded-xl p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-text-secondary">No New Recommendations Found</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            You are currently connected or have pending requests with all closely matched users in this social circle.
          </p>
        </div>
      )}

      {/* Deep Explainability Modal */}
      {selectedCandidate && (
        <DAAExplanationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sourceUser={currentUser}
          candidate={selectedCandidate}
          onFriendAdded={() => {
            fetchRecommendations();
            refreshCurrentUser();
          }}
        />
      )}

    </div>
  );
};
