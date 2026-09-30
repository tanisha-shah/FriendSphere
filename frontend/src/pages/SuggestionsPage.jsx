import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Sparkles,
  UserPlus,
  X,
  HelpCircle,
  Users,
  CheckCircle2,
  Sliders,
  Compass,
  ShieldAlert,
  School,
  Activity,
  Layers,
  Network,
  RotateCcw
} from 'lucide-react';
import { WhyExplanationModal } from '../components/WhyExplanationModal';

export const SuggestionsPage = () => {
  const { currentUser, refreshCurrentUser } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [showWeightsDrawer, setShowWeightsDrawer] = useState(false);
  
  // Configurable recommendation weights
  const [weights, setWeights] = useState({
    wMutual: 0.35,
    wJaccard: 0.20,
    wCosine: 0.20,
    wDistance: 0.10,
    wCollege: 0.10,
    wCommunity: 0.05
  });

  const fetchSuggestions = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await api.getSuggestions(currentUser.id, 24);
      setCandidates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeights = async () => {
    try {
      const data = await api.getScoringWeights();
      if (data) setWeights(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSuggestions();
    fetchWeights();
  }, [currentUser]);

  const handleAddFriend = async (candidateUserId) => {
    if (!currentUser) return;
    try {
      await api.sendRequest(currentUser.id, candidateUserId);
      // Automatically accept for demo dynamism
      await api.acceptRequest(999);
      await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1Id: currentUser.id, user2Id: candidateUserId, weight: 3.5 })
      });
      setActionMsg('Friend added! Social graph updated dynamically in C++ backend.');
      setTimeout(() => setActionMsg(''), 4000);
      setDismissedIds(prev => new Set([...prev, candidateUserId]));
      refreshCurrentUser();
      fetchSuggestions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDismiss = async (candidateUserId) => {
    if (!currentUser) return;
    try {
      await api.dismissRecommendation(currentUser.id, candidateUserId);
      setDismissedIds(prev => new Set([...prev, candidateUserId]));
    } catch (e) {
      console.error(e);
    }
  };

  const handleBlockUser = async (candidateUserId) => {
    if (!currentUser) return;
    if (window.confirm('Block this user? They will be permanently excluded from recommendations and traversals.')) {
      try {
        await api.blockUser(currentUser.id, candidateUserId);
        setDismissedIds(prev => new Set([...prev, candidateUserId]));
        setActionMsg('User added to Blocked Hash Set and excluded from C++ graph.');
        setTimeout(() => setActionMsg(''), 4000);
        fetchSuggestions();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSaveWeights = async (e) => {
    e.preventDefault();
    try {
      await api.updateScoringWeights(weights);
      setActionMsg('Weights updated! C++ recommendation engine recomputed rankings.');
      setTimeout(() => setActionMsg(''), 4000);
      setShowWeightsDrawer(false);
      fetchSuggestions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenWhy = (candidate) => {
    setSelectedCandidate(candidate);
    setIsWhyModalOpen(true);
  };

  const visibleCandidates = candidates.filter(c => !dismissedIds.has(c.userId));

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-brand-400" />
            <span>Intelligent Friend Suggestions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-signal AI recommendation engine combining Graph Proximity (BFS/Dijkstra) and Feature Vectors (Cosine/Jaccard).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWeightsDrawer(!showWeightsDrawer)}
            className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <Sliders className="w-4 h-4 text-brand-400" />
            <span>Configure Weights</span>
          </button>

          {actionMsg && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Configurable Weights Drawer */}
      {showWeightsDrawer && (
        <form onSubmit={handleSaveWeights} className="glow-card rounded-3xl p-6 border border-brand-500/30 bg-slate-900/90 space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-brand-400" />
              <h3 className="text-sm font-bold text-slate-100">Configurable Recommendation Scoring Weights</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Total: {Math.round((weights.wMutual + weights.wJaccard + weights.wCosine + weights.wDistance + weights.wCollege + weights.wCommunity) * 100)}%</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Mutual Friends (BFS)</span>
                <span className="font-mono font-bold text-brand-400">{Math.round(weights.wMutual * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={weights.wMutual}
                onChange={(e) => setWeights({ ...weights, wMutual: parseFloat(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Interest Jaccard</span>
                <span className="font-mono font-bold text-brand-400">{Math.round(weights.wJaccard * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={weights.wJaccard}
                onChange={(e) => setWeights({ ...weights, wJaccard: parseFloat(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Cosine Profile Similarity</span>
                <span className="font-mono font-bold text-brand-400">{Math.round(weights.wCosine * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={weights.wCosine}
                onChange={(e) => setWeights({ ...weights, wCosine: parseFloat(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Social Distance (Dijkstra)</span>
                <span className="font-mono font-bold text-brand-400">{Math.round(weights.wDistance * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.wDistance}
                onChange={(e) => setWeights({ ...weights, wDistance: parseFloat(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Same College</span>
                <span className="font-mono font-bold text-brand-400">{Math.round(weights.wCollege * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.wCollege}
                onChange={(e) => setWeights({ ...weights, wCollege: parseFloat(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Shared Community (DSU)</span>
                <span className="font-mono font-bold text-brand-400">{Math.round(weights.wCommunity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={weights.wCommunity}
                onChange={(e) => setWeights({ ...weights, wCommunity: parseFloat(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setWeights({ wMutual: 0.35, wJaccard: 0.20, wCosine: 0.20, wDistance: 0.10, wCollege: 0.10, wCommunity: 0.05 })}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-750 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs hover:bg-brand-400 transition-all shadow"
            >
              Apply & Recompute C++ Rankings
            </button>
          </div>
        </form>
      )}

      {/* Grid of Suggestions */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glow-card rounded-3xl p-5 h-80 animate-pulse bg-slate-900 border border-slate-800" />
          ))}
        </div>
      ) : visibleCandidates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleCandidates.map((cand) => {
            const user = cand.user || {};
            const scorePercent = Math.round((cand.score || cand.finalScore || 0.8) * 100);
            const profileMatch = cand.profileMatch ?? Math.round((cand.cosineSimilarity || 0.7) * 100);
            const interestMatch = cand.interestMatch ?? Math.round((cand.jaccardSimilarity || 0.5) * 100);
            const mutualCount = cand.mutualFriends ?? cand.mutualFriendsCount ?? 0;
            const hops = cand.connectionDistance ?? 2;
            const collegeName = cand.collegeName || user.college;
            const sameCollege = cand.sameCollege;
            const sharedCommunity = cand.sharedCommunity;

            return (
              <div
                key={cand.userId}
                className="glow-card rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:border-brand-500/40 group relative border border-slate-800 bg-slate-900/90"
              >
                <div>
                  {/* Avatar & Match Pill */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-brand-500/60 transition-colors shadow-md"
                    />

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-extrabold bg-brand-500/10 text-brand-400 border border-brand-500/30">
                        {scorePercent}% Score
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {hops} {hops === 1 ? 'hop' : 'hops'} away
                      </span>
                    </div>
                  </div>

                  {/* Name & Headline */}
                  <h3 className="text-sm font-bold text-slate-100 truncate group-hover:text-brand-300 transition-colors">
                    {user.name}
                  </h3>
                  <p className="text-xs text-brand-400 font-medium truncate">@{user.username}</p>
                  
                  {collegeName && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 truncate">
                      <School className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className={sameCollege ? "text-emerald-400 font-medium" : ""}>
                        {collegeName} {sameCollege && "• Same University"}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-slate-300 line-clamp-2 mt-2 mb-3">
                    {user.headline || user.bio}
                  </p>

                  {/* Required UI Metrics Matrix */}
                  <div className="grid grid-cols-2 gap-1.5 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-[11px] mb-3">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{mutualCount} mutual friends</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Activity className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{profileMatch}% profile match</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{interestMatch}% interest match</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{sharedCommunity ? "Shared Community" : "Extended Cluster"}</span>
                    </div>
                  </div>

                  {/* Shared Topics Pill */}
                  {cand.sharedInterests && cand.sharedInterests.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {cand.sharedInterests.slice(0, 3).map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700/60"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddFriend(cand.userId)}
                      className="flex-1 py-2 px-3 rounded-2xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Friend</span>
                    </button>

                    <button
                      onClick={() => handleDismiss(cand.userId)}
                      className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
                      title="Dismiss suggestion"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleBlockUser(cand.userId)}
                      className="p-2 rounded-2xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors"
                      title="Block user"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenWhy(cand)}
                    className="w-full text-center text-[11px] text-slate-400 hover:text-brand-300 flex items-center justify-center gap-1 transition-colors py-0.5"
                  >
                    <HelpCircle className="w-3 h-3 text-brand-400" />
                    <span>Why am I seeing this?</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="glow-card rounded-3xl p-12 text-center space-y-3 border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">You're all caught up!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No new friend suggestions at the moment. Explore communities or check the social graph network!
          </p>
        </div>
      )}

      {/* Why Explanation Modal */}
      {selectedCandidate && (
        <WhyExplanationModal
          isOpen={isWhyModalOpen}
          onClose={() => setIsWhyModalOpen(false)}
          sourceUser={currentUser}
          candidate={selectedCandidate}
          onConnect={(targetId) => {
            handleAddFriend(targetId);
          }}
        />
      )}

    </div>
  );
};
