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
      <div className="glow-card rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-brand-500/20 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-xs font-semibold text-brand-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Central DAA Recommendation Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Intelligent Friend Discovery & Social Affinity
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Discover potential connections scored in genuine <span className="text-brand-300 font-semibold">C++17/20</span> using <span className="text-blue-400 font-mono">BFS Degrees of Separation</span>, <span className="text-cyan-400 font-mono">Jaccard Interest Index</span>, <span className="text-indigo-400 font-mono">High-Dimensional Cosine Vectors</span>, <span className="text-emerald-400 font-mono">Dijkstra Affinity</span>, and <span className="text-amber-400 font-mono">DSU Social Clusters</span>.
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">Top-K Heap Filter:</span>
          {[6, 12, 20].map((num) => (
            <button
              key={num}
              onClick={() => setTopK(num)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                topK === num
                  ? 'bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              Top {num}
            </button>
          ))}
        </div>

        {actionMessage && (
          <div className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionMessage}</span>
          </div>
        )}
      </div>

      {/* Recommendations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glow-card rounded-2xl p-5 h-64 animate-pulse space-y-4">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-slate-800 rounded-xl" />
              <div className="h-8 bg-slate-800 rounded-xl" />
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
                className="glow-card rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5 group relative"
              >
                {/* Ranking Pill */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-brand-400">
                  <span>#{index + 1}</span>
                  <span className="text-slate-400">|</span>
                  <span>{scorePercent}%</span>
                </div>

                {/* Profile Header */}
                <div>
                  <div className="flex items-center gap-3.5 mb-3.5 pr-20">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-500/40 shrink-0 group-hover:border-brand-400 transition-colors"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-100 truncate group-hover:text-brand-300 transition-colors">
                        {user.name}
                      </h3>
                      <p className="text-xs text-brand-400 font-medium truncate">@{user.username}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.location}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-3.5">
                    {user.headline || user.bio}
                  </p>

                  {/* Primary Transparent Reason */}
                  <div className="p-3 rounded-2xl bg-slate-850/80 border border-slate-700/60 mb-3.5 text-xs text-slate-200 space-y-1">
                    <div className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider flex items-center gap-1">
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
                          className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700/80"
                        >
                          #{item}
                        </span>
                      ))}
                      {cand.sharedInterests.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{cand.sharedInterests.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExplain(cand)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-brand-400" />
                      <span>Why This Match?</span>
                    </button>

                    <button
                      onClick={() => handleDirectConnect(cand.userId)}
                      className="py-2 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-1"
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
        <div className="glow-card rounded-3xl p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No New Recommendations Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
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
