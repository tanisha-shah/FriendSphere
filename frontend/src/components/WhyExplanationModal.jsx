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
import { UserAvatar } from '../pages/SuggestionsPage';

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg  flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-surface-sec border border-border-subtle/80 rounded-xl shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 from-slate-900 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-seafoam border border-teal-primary/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-dark" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Why am I seeing this?
              </h2>
              <p className="text-xs text-text-secondary">
                Transparent multi-signal AI ranking powered by C++
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface hover:bg-surface-hov text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* User Profile Mini Snapshot */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-sec border border-border-subtle">
            <div className="flex items-center gap-3.5">
              <UserAvatar name={user.name} id={user.id} size="md" />
              <div>
                <h3 className="text-sm font-bold text-text-primary">{user.name}</h3>
                <p className="text-xs text-text-secondary font-medium">@{user.username} • {collegeName || user.location}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Score</div>
              <div className="text-2xl font-black text-teal-dark font-mono">{scorePercent}%</div>
            </div>
          </div>

          {/* Social Media Friendly "WHY [NAME]?" Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-primary flex items-center gap-1.5">
              <span>Recommended Because:</span>
            </h4>

            <div className="space-y-2.5 bg-surface p-4 rounded-lg border border-border-subtle">
              
              {/* Mutual Friends */}
              <div className="flex items-start gap-2.5 text-xs text-text-primary">
                <CheckCircle className="w-4 h-4 text-teal-dark shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary">
                    {mutualCount > 0 ? `${mutualCount} mutual friends` : 'Active member in network'}
                  </span>
                  {explanation?.mutualFriends?.length > 0 && (
                    <span className="text-text-secondary ml-1">
                      (including {explanation.mutualFriends.map(m => m.name.split(' ')[0]).slice(0, 3).join(', ')})
                    </span>
                  )}
                </div>
              </div>

              {/* Profile Similarity (Cosine) */}
              <div className="flex items-start gap-2.5 text-xs text-text-primary">
                <CheckCircle className="w-4 h-4 text-teal-dark shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary">
                    {profileMatch}% profile similarity
                  </span>
                  <span className="text-text-secondary ml-1">(Cosine feature angle)</span>
                </div>
              </div>

              {/* Shared Interests (Jaccard) */}
              <div className="flex items-start gap-2.5 text-xs text-text-primary">
                <CheckCircle className="w-4 h-4 text-teal-dark shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary">
                    {interestMatch}% shared interests
                  </span>
                  {candidate.sharedInterests?.length > 0 && (
                    <span className="text-text-secondary ml-1">
                      in {candidate.sharedInterests.slice(0, 3).map(tag => {
                        const map = {
                          ai_ml: 'AI & ML',
                          competitive_prog: 'Competitive Programming',
                          web_dev: 'Web Development',
                          open_source: 'Open Source',
                          algorithms: 'Algorithms',
                          data_science: 'Data Science',
                          cybersec: 'Cybersecurity',
                          game_dev: 'Game Development',
                          cloud_comp: 'Cloud Computing',
                          blockchain: 'Blockchain',
                          robotics: 'Robotics',
                          quantum_comp: 'Quantum Computing'
                        };
                        return map[tag] || tag.replace(/_/g, ' ');
                      }).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* College */}
              {sameCollege && collegeName && (
                <div className="flex items-start gap-2.5 text-xs text-text-primary">
                  <CheckCircle className="w-4 h-4 text-teal-dark shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-text-primary">
                      Same university: {collegeName}
                    </span>
                  </div>
                </div>
              )}

              {/* Shared Community */}
              {sharedCommunity && (
                <div className="flex items-start gap-2.5 text-xs text-text-primary">
                  <CheckCircle className="w-4 h-4 text-teal-dark shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-text-primary">
                      Shared community: {communityName}
                    </span>
                  </div>
                </div>
              )}

              {/* Network Distance (Hops) */}
              <div className="flex items-start gap-2.5 text-xs text-text-primary">
                <CheckCircle className="w-4 h-4 text-teal-dark shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary">
                    {hops} connections away
                  </span>
                  <span className="text-text-secondary ml-1">in your social network graph</span>
                </div>
              </div>

            </div>
          </div>

          {/* Collapsible Technical Details (C++ Algorithmic Core) */}
          <div className="border-t border-border-subtle pt-3">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full flex items-center justify-between text-xs text-text-secondary hover:text-text-primary font-medium transition-colors py-1"
            >
              <span>DAA Computation Pipeline (C++ Engine)</span>
              {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTechnicalDetails && (
              <div className="mt-3 p-4 rounded-lg bg-bg border border-border-subtle space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-xl bg-surface-sec border border-border-subtle">
                    <div className="text-text-secondary">BFS Hops</div>
                    <div className="text-teal-dark font-bold">{hops} (Degree {hops})</div>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-sec border border-border-subtle">
                    <div className="text-text-secondary">Jaccard Index</div>
                    <div className="text-teal-dark font-bold">{candidate.jaccardSimilarity || (interestMatch / 100)}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-sec border border-border-subtle">
                    <div className="text-text-secondary">Cosine Score</div>
                    <div className="text-teal-dark font-bold">{candidate.cosineSimilarity || (profileMatch / 100)}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-sec border border-border-subtle">
                    <div className="text-text-secondary">Max Priority Queue</div>
                    <div className="text-teal-dark font-bold">Extracted Top-K</div>
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
        <div className="p-4 bg-surface-sec border-t border-border-subtle flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-surface transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              if (onConnect) onConnect(candidate.userId);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-teal-primary hover:bg-teal-dark text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Connect</span>
          </button>
        </div>

      </div>
    </div>
  );
};
