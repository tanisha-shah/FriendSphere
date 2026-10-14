import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  UserPlus,
  Users,
  Calendar,
  Layers,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { WhyExplanationModal } from './WhyExplanationModal';

export const RightSidebar = () => {
  const { currentUser, allUsers, refreshCurrentUser } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const events = [
    { id: 1, title: 'Global Graph ML Summit 2025', date: 'OCT 12', time: '6:00 PM GMT', attendees: 340, tag: 'AI & Graphs' },
    { id: 2, title: 'ICPC World Finals Watch Party', date: 'OCT 18', time: '4:30 PM GMT', attendees: 180, tag: 'Algorithms' },
    { id: 3, title: 'Creative Shaders & WebGPU Meetup', date: 'NOV 02', time: '7:00 PM GMT', attendees: 95, tag: 'Graphics' }
  ];

  const fetchSideData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [recData, commData] = await Promise.all([
        api.getRecommendations(currentUser.id, 4),
        api.getCommunities(),
      ]);
      setSuggestions(recData);
      setCommunities(commData.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSideData();
  }, [currentUser]);

  const handleConnect = async (candidateUserId) => {
    if (!currentUser) return;
    try {
      await api.removeFriend(currentUser.id, candidateUserId);
      await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1Id: currentUser.id, user2Id: candidateUserId, weight: 3.5 })
      });
      setActionSuccess('Connected!');
      setTimeout(() => setActionSuccess(''), 2500);
      refreshCurrentUser();
      fetchSideData();
    } catch (e) {
      console.error(e);
    }
  };

  const openWhyModal = (candidate) => {
    setSelectedCandidate(candidate);
    setIsWhyModalOpen(true);
  };

  // 4 online friends
  const onlineUsers = allUsers.filter(u => u.id !== currentUser?.id).slice(0, 5);

  return (
    <aside className="w-80 shrink-0 hidden xl:block space-y-5">
      
      {/* People You May Know */}
      <div className="glow-card rounded-xl p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-dark" />
            <span>People You May Know</span>
          </h3>
          <Link to="/suggestions" className="text-[11px] font-semibold text-teal-dark hover:text-teal-primary">
            See All
          </Link>
        </div>

        {actionSuccess && (
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-teal-dark flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        <div className="space-y-3">
          {suggestions.slice(0, 3).map((cand) => {
            const user = cand.user || {};
            return (
              <div key={cand.userId} className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Link to={`/profile/${user.id}`}>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-lg object-cover border border-border-subtle hover:border-teal-primary transition-colors shrink-0"
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      to={`/profile/${user.id}`}
                      className="text-xs font-bold text-text-primary hover:text-teal-dark truncate block"
                    >
                      {user.name}
                    </Link>
                    <p className="text-[10px] text-teal-dark truncate">
                      {cand.mutualFriendsCount > 0 ? `${cand.mutualFriendsCount} mutual friends` : user.college || user.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openWhyModal(cand)}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-teal-primary hover:bg-surface transition-colors"
                    title="Why am I seeing this?"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleConnect(cand.userId)}
                    className="px-2.5 py-1 rounded-xl bg-seafoam hover:bg-teal-primary hover:text-surface text-teal-dark border border-teal-primary/30 text-[11px] font-bold transition-all"
                  >
                    Connect
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending Communities */}
      <div className="glow-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-dark" />
            <span>Trending Communities</span>
          </h3>
          <Link to="/communities" className="text-[11px] font-semibold text-teal-dark hover:text-teal-primary">
            Explore
          </Link>
        </div>

        <div className="space-y-2.5">
          {communities.map((c) => (
            <Link
              key={c.id}
              to="/communities"
              className="p-2.5 rounded-lg bg-surface hover:bg-surface border border-border-subtle flex items-center gap-3 transition-colors group block"
            >
              <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-text-primary group-hover:text-teal-primary truncate">
                  {c.name}
                </h4>
                <p className="text-[10px] text-text-secondary">
                  {c.memberIds?.length || 12} members • {c.category}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>



      {/* Why Explanation Modal */}
      {selectedCandidate && (
        <WhyExplanationModal
          isOpen={isWhyModalOpen}
          onClose={() => setIsWhyModalOpen(false)}
          sourceUser={currentUser}
          candidate={selectedCandidate}
          onConnect={() => {
            fetchSideData();
            refreshCurrentUser();
          }}
        />
      )}

    </aside>
  );
};
