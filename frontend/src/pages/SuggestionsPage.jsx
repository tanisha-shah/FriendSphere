import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Sparkles,
  UserPlus,
  Check,
  X,
  HelpCircle,
  Users,
  CheckCircle2,
  School,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Heart,
  Compass
} from 'lucide-react';
import { WhyExplanationModal } from '../components/WhyExplanationModal';

// Deterministic harmonious organic palette for avatar initials
const AVATAR_PALETTES = [
  { bg: '#3D6F5E', text: '#FAFCFA' }, // Deep Sage
  { bg: '#4A6B82', text: '#FAFCFA' }, // Slate Blue
  { bg: '#8C6250', text: '#FAFCFA' }, // Warm Terracotta
  { bg: '#6D5D7A', text: '#FAFCFA' }, // Dusty Mulberry
  { bg: '#507567', text: '#FAFCFA' }, // Forest Teal
  { bg: '#826848', text: '#FAFCFA' }, // Warm Ochre
  { bg: '#48727B', text: '#FAFCFA' }, // Deep Seafoam
  { bg: '#785A65', text: '#FAFCFA' }, // Rosewood
  { bg: '#4E687A', text: '#FAFCFA' }, // Charcoal Slate
  { bg: '#6B6856', text: '#FAFCFA' }, // Olive Sage
];

const getInitialsColor = (name = '', id = 0) => {
  let hash = Number(id) || 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
};

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'FS';
};

// Consistent, beautiful initials avatar component
export const UserAvatar = ({ name = '', id = 0, size = 'md', className = '' }) => {
  const { bg, text } = getInitialsColor(name, id);
  const initials = getInitials(name);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm font-bold',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-18 h-18 text-xl font-extrabold',
  }[size] || 'w-11 h-11 text-sm font-bold';

  return (
    <div
      style={{ backgroundColor: bg, color: text }}
      className={`${sizeClasses} rounded-2xl flex items-center justify-center shrink-0 tracking-tight select-none shadow-xs border border-white/40 ${className}`}
    >
      {initials}
    </div>
  );
};

// Conversational human interest tags
const formatInterest = (tag = '') => {
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
    quantum_comp: 'Quantum Computing',
    astronomy: 'Astronomy',
    music_prod: 'Music Production',
    fitness: 'Fitness',
    photography: 'Photography',
    chess: 'Chess',
    hiking: 'Hiking',
  };
  return map[tag] || tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Conversational bios with authentic human personality
const PERSONALITY_BIOS = {
  2: 'Grandmaster on Codeforces. Always down to solve graph optimization and network flow puzzles.',
  3: 'Exploring neural networks and graph convolutions. Stargazer, runner, and matcha addict.',
  4: 'Linux kernel hacker & mechanical keyboard builder. Weekend privacy and crypto chats.',
  5: 'Frontend architect, tea enthusiast, and marathon runner. Passionate about interactive graphs.',
  6: 'Game engine developer & sci-fi reader. Building real-time ray tracing shaders.',
  7: 'Quantum computing researcher & classical pianist. Loves fast chess and alpine hiking.',
  8: 'Cloud infrastructure engineer. Can discuss Kubernetes and pour-over coffee for hours.',
  9: 'Graph data scientist and street photographer. Loves dynamic network clustering.',
  10: 'Robotics builder, embedded systems tinkerer, and weekend mountain hiker.',
  11: 'Building fluid mobile apps with offline-first sync engines and delightful reactive animations.',
  12: 'Obsessed with LSM-trees, B+ tree concurrency, disk caching, and write-ahead logs.',
  13: 'Building resilient microservices, high-throughput gRPC pipelines, and raft consensus clusters.',
  14: 'Working on prompt distillation, speculative decoding, and multimodal graph attention.',
  15: 'Studying post-quantum lattice cryptography, side-channel attacks, and network packet analysis.',
  16: 'Designing accessible human-centered interfaces, interaction design systems, and delightful UX.',
  17: 'Real-time edge neural inference on embedded GPUs, optical flow, and 3D spatial mapping.',
  18: 'Creating lightning fast web apps with Next.js, Node, and edge computing. Active OSS maintainer.',
  19: 'Statistical arbitrage, algorithmic game theory, stochastic calculus, and order book simulations.',
  20: 'Graph theoretical models of protein interaction networks, phylogenetic tree construction.'
};

const getHumanBio = (user) => {
  if (PERSONALITY_BIOS[user.id]) return PERSONALITY_BIOS[user.id];
  if (user.bio && user.bio.length < 90) return user.bio;
  if (user.headline) return user.headline;
  return 'Tech enthusiast & builder. Passionate about algorithms and open collaboration.';
};

export const SuggestionsPage = () => {
  const { currentUser, allUsers, refreshCurrentUser } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  
  // Interactive connection state: sets of userIds
  const [sentRequests, setSentRequests] = useState(new Set());
  const [dismissedIds, setDismissedIds] = useState(new Set());

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

  useEffect(() => {
    fetchSuggestions();
  }, [currentUser]);

  // Connect action with instant UI state change and undo support
  const handleConnect = async (candidateUserId) => {
    if (!currentUser) return;
    setSentRequests(prev => new Set([...prev, candidateUserId]));

    try {
      await api.sendRequest(currentUser.id, candidateUserId);
      await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1Id: currentUser.id, user2Id: candidateUserId, weight: 3.5 })
      });
      refreshCurrentUser();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUndoConnect = (candidateUserId) => {
    setSentRequests(prev => {
      const next = new Set(prev);
      next.delete(candidateUserId);
      return next;
    });
  };

  const handleDismiss = async (candidateUserId) => {
    if (!currentUser) return;
    setDismissedIds(prev => new Set([...prev, candidateUserId]));
    try {
      await api.dismissRecommendation(currentUser.id, candidateUserId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenWhy = (candidate) => {
    setSelectedCandidate(candidate);
    setIsWhyModalOpen(true);
  };

  // Helper to construct a human sentence and stacked avatars for mutual connections
  const getMutualDetails = (cand) => {
    const friendIds = cand.mutualFriendIds || [];
    const count = cand.mutualFriends || cand.mutualFriendsCount || friendIds.length;
    
    // Find mutual friends in allUsers
    const friendUsers = friendIds
      .map(id => allUsers.find(u => u.id === id))
      .filter(Boolean);

    let sentence = '';
    if (friendUsers.length >= 2) {
      const name1 = friendUsers[0].name.split(' ')[0];
      const name2 = friendUsers[1].name.split(' ')[0];
      if (count > 2) {
        sentence = `${count} mutual friends, including ${name1} and ${name2}`;
      } else {
        sentence = `Mutual friends with ${name1} and ${name2}`;
      }
    } else if (friendUsers.length === 1) {
      const name1 = friendUsers[0].name.split(' ')[0];
      sentence = count > 1 ? `${count} mutual friends, including ${name1}` : `Mutual friend with ${name1}`;
    } else if (count > 0) {
      sentence = `${count} mutual friends`;
    } else if (cand.sharedInterests && cand.sharedInterests.length > 0) {
      const formatted = cand.sharedInterests.slice(0, 2).map(formatInterest).join(' and ');
      sentence = `You both like ${formatted}`;
    } else if (cand.sameCollege) {
      sentence = `Both at ${cand.collegeName || 'Nirma University'}`;
    } else if (cand.communityName && cand.communityName !== 'Connected Cluster') {
      sentence = `Both in ${cand.communityName}`;
    } else {
      sentence = 'Similar project interests and network';
    }

    return { count, friendUsers, sentence };
  };

  // Filter out dismissed
  const visibleCandidates = candidates.filter(c => !dismissedIds.has(c.userId));

  // Segmentation into curated sections
  // 1. Featured Top Matches (1-2 highest scores)
  const topMatches = visibleCandidates.slice(0, 2);
  const featuredIds = new Set(topMatches.map(c => c.userId));
  const remaining = visibleCandidates.filter(c => !featuredIds.has(c.userId));

  // 2. Because of mutual friends (has mutual friends)
  const mutualFriendsSection = remaining.filter(c => (c.mutualFriends || c.mutualFriendsCount || 0) > 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Human Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E9E8E2] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            People you may know
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Based on your mutual friends and network connections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 bg-white border border-[#E8E6DF] px-3 py-1.5 rounded-full shadow-xs">
            {topMatches.length + mutualFriendsSection.length} recommendations
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white border border-[#EAE8E2] animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-white border border-[#EAE8E2] animate-pulse" />
            ))}
          </div>
        </div>
      ) : visibleCandidates.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center space-y-3 border border-[#E9E8E2] shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-700">You're all caught up!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No new suggestions right now. Explore new communities or invite classmates to FriendSphere!
          </p>
        </div>
      ) : (
        <div className="space-y-9">

          {/* SECTION 1: TOP MATCHES (LARGE FEATURED CARDS) */}
          {topMatches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-primary" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                    Top Matches for You
                  </h2>
                </div>
                <span className="text-xs text-slate-600 font-medium">Highest alignment</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {topMatches.map((cand) => {
                  const user = cand.user || {};
                  const isSent = sentRequests.has(cand.userId);
                  const scorePercent = Math.round((cand.score || cand.finalScore || 0.78) * 100);
                  const { friendUsers, sentence } = getMutualDetails(cand);

                  return (
                    <div
                      key={cand.userId}
                      className="bg-white rounded-2xl p-6 border border-[#E8E6DF] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group"
                    >
                      {/* Quiet Dismiss Button */}
                      <button
                        onClick={() => handleDismiss(cand.userId)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Dismiss recommendation"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div>
                        {/* Top Profile Header */}
                        <div className="flex items-start gap-4 pr-7">
                          <UserAvatar name={user.name} id={user.id} size="xl" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-bold text-slate-800 truncate">
                                {user.name}
                              </h3>
                              {/* Neutral Match Score Pill */}
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                                {scorePercent}% Match
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 font-medium">
                              @{user.username} {user.college ? `• ${user.college}` : ''}
                            </p>

                            {/* Human Bio with Personality */}
                            <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                              {getHumanBio(user)}
                            </p>
                          </div>
                        </div>

                        {/* Conversational Mutual Friends & Stacked Avatars Row */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2.5">
                          {friendUsers.length > 0 && (
                            <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                              {friendUsers.slice(0, 3).map((f) => (
                                <UserAvatar
                                  key={f.id}
                                  name={f.name}
                                  id={f.id}
                                  size="xs"
                                  className="ring-2 ring-white"
                                />
                              ))}
                            </div>
                          )}
                          <span className="text-xs text-slate-600 font-medium">
                            {sentence}
                          </span>
                        </div>

                        {/* Non-technical Interest Tags in Clean Font */}
                        {cand.sharedInterests && cand.sharedInterests.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {cand.sharedInterests.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200/60 px-2.5 py-0.5 rounded-md"
                              >
                                {formatInterest(tag)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button
                          onClick={() => handleOpenWhy(cand)}
                          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Why am I seeing this?</span>
                        </button>

                        <div>
                          {isSent ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#EAF3EE] text-[#285E4D] border border-[#C5DDD2] flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" />
                                <span>Request sent</span>
                              </span>
                              <button
                                onClick={() => handleUndoConnect(cand.userId)}
                                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                              >
                                Undo
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleConnect(cand.userId)}
                              className="px-4 py-1.5 rounded-xl bg-teal-primary hover:bg-teal-dark text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Connect</span>
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: BECAUSE OF YOUR MUTUAL FRIENDS */}
          {mutualFriendsSection.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h2 className="text-sm font-bold text-slate-800">
                  Because of your mutual friends
                </h2>
                <span className="text-xs text-slate-600">Shared social circles</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mutualFriendsSection.map((cand) => {
                  const user = cand.user || {};
                  const isSent = sentRequests.has(cand.userId);
                  const scorePercent = Math.round((cand.score || cand.finalScore || 0.7) * 100);
                  const { friendUsers, sentence } = getMutualDetails(cand);

                  return (
                    <div
                      key={cand.userId}
                      className="bg-white rounded-2xl p-4 border border-[#E8E6DF] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group"
                    >
                      {/* Quiet Dismiss */}
                      <button
                        onClick={() => handleDismiss(cand.userId)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div>
                        {/* Profile header */}
                        <div className="flex items-start gap-3 pr-6">
                          <UserAvatar name={user.name} id={user.id} size="md" />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-slate-800 truncate">
                              {user.name}
                            </h3>
                            <p className="text-[11px] text-slate-600 truncate">
                              @{user.username}
                            </p>
                          </div>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {scorePercent}%
                          </span>
                        </div>

                        {/* Personality bio snippet */}
                        <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                          {getHumanBio(user)}
                        </p>

                        {/* Mutual Connection row */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                          {friendUsers.length > 0 && (
                            <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                              {friendUsers.slice(0, 2).map((f) => (
                                <UserAvatar
                                  key={f.id}
                                  name={f.name}
                                  id={f.id}
                                  size="xs"
                                  className="ring-2 ring-white"
                                />
                              ))}
                            </div>
                          )}
                          <span className="text-[11px] text-slate-600 font-medium line-clamp-1">
                            {sentence}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenWhy(cand)}
                          className="text-[11px] text-slate-600 hover:text-slate-800 font-medium"
                        >
                          Why?
                        </button>

                        {isSent ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#EAF3EE] text-[#285E4D]">
                              ✓ Sent
                            </span>
                            <button
                              onClick={() => handleUndoConnect(cand.userId)}
                              className="text-[11px] text-slate-600 underline hover:text-slate-800"
                            >
                              Undo
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleConnect(cand.userId)}
                            className="px-3 py-1 rounded-lg bg-teal-primary hover:bg-teal-dark text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
            handleConnect(targetId);
          }}
        />
      )}

    </div>
  );
};
export default SuggestionsPage;
