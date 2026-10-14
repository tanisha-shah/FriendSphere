import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Search, Users, UserPlus, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { AlgorithmBadge } from '../components/AlgorithmBadge';

export const PeoplePage = () => {
  const { currentUser, refreshCurrentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [friendsList, setFriendsList] = useState([]);
  const [actionMsg, setActionMsg] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = searchQuery.trim()
        ? await api.searchUsers(searchQuery.trim(), 45)
        : await api.getUsers();
      setUsers(data);

      if (currentUser) {
        const directFriends = await api.getUserFriends(currentUser.id);
        setFriendsList(directFriends.map(f => f.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, currentUser]);

  const handleSendRequest = async (targetId) => {
    if (!currentUser) return;
    try {
      await api.sendRequest(currentUser.id, targetId);
      setActionMsg('Friend request sent!');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDirect = async (targetId) => {
    if (!currentUser) return;
    try {
      await api.removeFriend(currentUser.id, targetId);
      await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1Id: currentUser.id, user2Id: targetId, weight: 3.0 })
      });
      setActionMsg('Added friend to your network!');
      setTimeout(() => setActionMsg(''), 3000);
      setFriendsList([...friendsList, targetId]);
      refreshCurrentUser();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2.5">
            <Users className="w-7 h-7 text-teal-dark" />
            <span>People & Network Directory</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Search 40+ members across algorithms, AI, systems, and creative circles powered by C++ Trie.
          </p>
        </div>

        <AlgorithmBadge name="Trie" tooltip="Instant prefix search tree" />
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by prefix of name, username, skill, or interest..."
            className="w-full bg-surface-sec text-sm text-text-primary placeholder-slate-400 rounded-lg pl-11 pr-4 py-3 border border-border-subtle focus:outline-none focus:border-teal-primary focus:ring-1 focus:ring-brand-500 transition-all"
          />
          <Search className="w-5 h-5 text-text-secondary absolute left-3.5 top-3.5" />
        </div>

        {actionMsg && (
          <div className="text-xs text-teal-dark bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionMsg}</span>
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glow-card rounded-xl p-5 h-48 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((user) => {
            const isSelf = user.id === currentUser?.id;
            const isFriend = friendsList.includes(user.id);

            return (
              <div
                key={user.id}
                className="glow-card rounded-xl p-5 flex flex-col justify-between transition-all hover:-translate-y-1 group"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-lg object-cover border border-border-subtle group-hover:border-teal-primary/50 transition-colors"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/profile/${user.id}`}
                        className="text-sm font-bold text-text-primary hover:text-teal-dark truncate block"
                      >
                        {user.name}
                      </Link>
                      <span className="text-xs text-teal-dark font-medium truncate block">@{user.username}</span>
                      <span className="text-[11px] text-text-secondary">{user.location}</span>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2 mb-3">
                    {user.headline || user.bio}
                  </p>

                  {/* Interests */}
                  {user.interests && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {user.interests.slice(0, 3).map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-surface text-text-secondary text-[10px] font-mono border border-border-subtle/60"
                        >
                          #{item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                  <Link
                    to={`/profile/${user.id}`}
                    className="text-xs font-semibold text-teal-dark hover:text-teal-primary transition-colors"
                  >
                    View Profile →
                  </Link>

                  {!isSelf && (
                    isFriend ? (
                      <span className="text-xs text-teal-dark font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Connected
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddDirect(user.id)}
                        className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hov text-text-primary text-xs font-semibold border border-border-subtle flex items-center gap-1.5 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-teal-dark" />
                        <span>Connect</span>
                      </button>
                    )
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
