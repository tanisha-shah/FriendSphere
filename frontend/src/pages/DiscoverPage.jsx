import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Compass,
  Search,
  Users,
  Layers,
  Sparkles,
  TrendingUp,
  Tag,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DiscoverPage = () => {
  const { currentUser, refreshCurrentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('people'); // 'people', 'communities', 'interests', 'trending'
  const [searchQuery, setSearchQuery] = useState('');
  const [people, setPeople] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const trendingTopics = [
    { name: 'Graph Neural Networks', count: '1.4k posts', category: 'AI & Data' },
    { name: 'Zero-Knowledge Proofs', count: '920 posts', category: 'Security' },
    { name: 'C++23 Standard Library', count: '2.1k posts', category: 'Engineering' },
    { name: 'Real-time Vulkan Shaders', count: '760 posts', category: 'Graphics' },
    { name: 'Astrophotography Stacking', count: '540 posts', category: 'Science' }
  ];

  const fetchDiscoveryData = async () => {
    try {
      setLoading(true);
      const [pData, cData, iData] = await Promise.all([
        searchQuery.trim() ? api.searchUsers(searchQuery.trim(), 30) : api.getUsers(),
        api.getCommunities(),
        api.getInterests()
      ]);
      setPeople(pData);
      setCommunities(cData);
      setInterests(iData.interests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoveryData();
  }, [searchQuery]);

  const handleConnect = async (targetUserId) => {
    if (!currentUser) return;
    try {
      await api.removeFriend(currentUser.id, targetUserId);
      await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1Id: currentUser.id, user2Id: targetUserId, weight: 3.5 })
      });
      setActionMsg('Connected to user!');
      setTimeout(() => setActionMsg(''), 2500);
      refreshCurrentUser();
      fetchDiscoveryData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Header & Search */}
      <div className="glow-card rounded-xl p-6 sm:p-8 space-y-5 from-slate-900 border border-border-subtle">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-teal-dark" />
            <span>Discover FriendSphere</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Explore active minds, vibrant communities, and trending tech discussions.
          </p>
        </div>

        {/* Search Bar with Autocomplete */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people, interests or communities..."
            className="w-full bg-bg text-sm text-text-primary placeholder-slate-400 rounded-lg pl-11 pr-4 py-3.5 border border-border-subtle/80 focus:outline-none focus:border-teal-primary focus:ring-2 focus:ring-brand-500/20 transition-all shadow-inner"
          />
          <Search className="w-5 h-5 text-text-secondary absolute left-4 top-4" />
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          {[
            { id: 'people', label: 'People', icon: Users },
            { id: 'communities', label: 'Communities', icon: Layers },
            { id: 'interests', label: 'Interests & Topics', icon: Tag },
            { id: 'trending', label: 'Trending', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-teal-primary text-surface font-bold shadow-md shadow-sm'
                    : 'bg-surface text-text-secondary hover:bg-surface hover:text-text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-teal-dark">
          {actionMsg}
        </div>
      )}

      {/* Tab 1: People */}
      {activeTab === 'people' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {people.map((u) => (
            <div
              key={u.id}
              className="glow-card rounded-xl p-5 flex flex-col justify-between transition-all hover:-translate-y-1 group border border-border-subtle"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-12 h-12 rounded-lg object-cover border border-border-subtle group-hover:border-teal-primary transition-colors"
                  />
                  <div className="min-w-0">
                    <Link to={`/profile/${u.id}`} className="text-sm font-bold text-text-primary hover:text-teal-primary truncate block">
                      {u.name}
                    </Link>
                    <p className="text-xs text-teal-dark truncate">@{u.username}</p>
                    <p className="text-[11px] text-text-secondary truncate">{u.college || u.location}</p>
                  </div>
                </div>

                <p className="text-xs text-text-secondary line-clamp-2 mb-3">
                  {u.headline || u.bio}
                </p>

                {u.interests && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {u.interests.slice(0, 3).map((item, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-surface text-text-secondary text-[10px] font-mono">
                        #{item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                <Link to={`/profile/${u.id}`} className="text-xs text-teal-dark font-semibold hover:underline">
                  View Profile
                </Link>
                {u.id !== currentUser?.id && (
                  <button
                    onClick={() => handleConnect(u.id)}
                    className="px-3 py-1 rounded-xl bg-seafoam hover:bg-teal-primary hover:text-surface text-teal-dark border border-teal-primary/30 text-xs font-bold transition-all"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Communities */}
      {activeTab === 'communities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communities.map((c) => (
            <div key={c.id} className="glow-card rounded-xl overflow-hidden border border-border-subtle hover:-translate-y-1 transition-all group">
              <div className="h-28 relative bg-surface overflow-hidden">
                <img src={c.banner} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 from-slate-950 to-transparent" />
                <div className="absolute bottom-3 left-4 flex items-center gap-3">
                  <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-lg object-cover border-2 border-slate-900" />
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{c.name}</h3>
                    <p className="text-[11px] text-teal-dark">{c.category}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-text-secondary line-clamp-2">{c.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-xs">
                  <span className="text-text-secondary">{c.memberIds?.length || 15} members</span>
                  <Link to="/communities" className="text-teal-dark font-semibold hover:underline">
                    View Community →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Interests */}
      {activeTab === 'interests' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {interests.map((item) => (
            <div key={item.id} className="glow-card rounded-lg p-4 space-y-1.5 border border-border-subtle hover:border-teal-primary/40 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-dark">{item.category}</span>
              <h3 className="text-sm font-bold text-text-primary">#{item.name}</h3>
              <p className="text-xs text-text-secondary">Discover active members and discussions</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Trending */}
      {activeTab === 'trending' && (
        <div className="glow-card rounded-xl p-6 divide-y divide-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 pb-2">
            <TrendingUp className="w-4 h-4 text-teal-dark" />
            <span>Trending Across FriendSphere</span>
          </h2>
          {trendingTopics.map((topic, i) => (
            <div key={i} className="pt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-text-secondary font-semibold">{topic.category} • Trending</span>
                <h4 className="text-sm font-bold text-text-primary mt-0.5">#{topic.name}</h4>
                <span className="text-xs text-text-secondary">{topic.count}</span>
              </div>
              <span className="text-xs text-teal-dark font-semibold">Explore →</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
