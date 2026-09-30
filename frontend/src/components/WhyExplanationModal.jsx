import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  X,
  Sparkles,
  CheckCircle,
  Users,
  GitBranch,
  Shield,
  UserPlus,
  ArrowRight,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  School,
  Activity,
  Layers
} from 'lucide-react';
import { AlgorithmBadge } from './AlgorithmBadge';

export const WhyExplanationModal = ({
  isOpen,
  onClose,
  sourceUser,
  candidate,
  onConnect
}) => {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  useEffect(() => {
    if (isOpen && sourceUser && candidate) {
      const fetchExp = async () => {
        try {
          setLoading(true);
          const data = await api.getExplanation(sourceUser.id, candidate.userId);
          setExplanation(data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchExp();
    }
  }, [isOpen, sourceUser, candidate]);

  if (!isOpen || !candidate) return null;

  const user = candidate.user || {};
  const scorePercent = Math.round((candidate.score || candidate.finalScore || 0.85) * 100);
  const profileMatch = candidate.profileMatch ?? Math.round((candidate.cosineSimilarity || 0.8) * 100);
  const interestMatch = candidate.interestMatch ?? Math.round((candidate.jaccardSimilarity || 0.6) * 100);
  const mutualCount = candidate.mutualFriends ?? candidate.mutualFriendsCount ?? 0;
  const hops = candidate.connectionDistance ?? 2;
  const collegeName = candidate.collegeName || user.college;
  const sameCollege = candidate.sameCollege;
  const sharedCommunity = candidate.sharedCommunity;
  const communityName = candidate.communityName || "Technology Cluster";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Why am I seeing this?
              </h2>
              <p className="text-xs text-slate-400">
                Transparent multi-signal AI ranking powered by C++
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* User Profile Mini Snapshot */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-850/80 border border-slate-800">
            <div className="flex items-center gap-3.5">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-2xl object-cover border border-brand-500/40 shadow"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-100">{user.name}</h3>
                <p className="text-xs text-brand-400 font-medium">@{user.username} • {collegeName || user.location}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Score</div>
              <div className="text-2xl font-black text-brand-400 font-mono">{scorePercent}%</div>
            </div>
          </div>

          {/* Social Media Friendly "WHY [NAME]?" Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-300 flex items-center gap-1.5">
              <span>Recommended Because:</span>
            </h4>

            <div className="space-y-2.5 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
              
              {/* Mutual Friends */}
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-100">
                    {mutualCount > 0 ? `${mutualCount} mutual friends` : 'Active member in network'}
                  </span>
                  {explanation?.mutualFriends?.length > 0 && (
                    <span className="text-slate-400 ml-1">
                      (including {explanation.mutualFriends.map(m => m.name.split(' ')[0]).slice(0, 3).join(', ')})
                    </span>
                  )}
                </div>
              </div>

              {/* Profile Similarity (Cosine) */}
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-100">
                    {profileMatch}% profile similarity
                  </span>
                  <span className="text-slate-400 ml-1">(Cosine feature angle)</span>
                </div>
              </div>

              {/* Shared Interests (Jaccard) */}
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-100">
                    {interestMatch}% shared interests
                  </span>
                  {candidate.sharedInterests?.length > 0 && (
                    <span className="text-slate-400 ml-1">
                      in {candidate.sharedInterests.slice(0, 3).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* College */}
              {sameCollege && collegeName && (
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-100">
                      Same university: {collegeName}
                    </span>
                  </div>
                </div>
              )}

              {/* Shared Community */}
              {sharedCommunity && (
                <div className="flex items-start gap-2.5 text-xs text-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-100">
                      Shared community: {communityName}
                    </span>
                  </div>
                </div>
              )}

              {/* Network Distance (Hops) */}
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-100">
                    {hops} connections away
                  </span>
                  <span className="text-slate-400 ml-1">in your social network graph</span>
                </div>
              </div>

            </div>
          </div>

          {/* Collapsible Technical Details (C++ Algorithmic Core) */}
          <div className="border-t border-slate-800 pt-3">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors py-1"
            >
              <span>DAA Computation Pipeline (C++ Engine)</span>
              {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTechnicalDetails && (
              <div className="mt-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400">BFS Hops</div>
                    <div className="text-brand-400 font-bold">{hops} (Degree {hops})</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400">Jaccard Index</div>
                    <div className="text-emerald-400 font-bold">{candidate.jaccardSimilarity || (interestMatch / 100)}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400">Cosine Score</div>
                    <div className="text-teal-400 font-bold">{candidate.cosineSimilarity || (profileMatch / 100)}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400">Max Priority Queue</div>
                    <div className="text-purple-400 font-bold">Extracted Top-K</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  <AlgorithmBadge name="BFS" size="xs" />
                  <AlgorithmBadge name="Jaccard" size="xs" />
                  <AlgorithmBadge name="Cosine" size="xs" />
                  <AlgorithmBadge name="PriorityQueue" size="xs" />
                  <AlgorithmBadge name="DSU" size="xs" />
                  <AlgorithmBadge name="MergeSort" size="xs" />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              if (onConnect) onConnect(candidate.userId);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-brand-500/20 flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Friend</span>
          </button>
        </div>

      </div>
    </div>
  );
};
