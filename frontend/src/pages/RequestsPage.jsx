import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserPlus, UserCheck, UserX, Clock, CheckCircle2, Users, Shield } from 'lucide-react';
import { AlgorithmBadge } from '../components/AlgorithmBadge';

export const RequestsPage = () => {
  const { currentUser, refreshCurrentUser } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [directFriends, setDirectFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [pending, sent, friends] = await Promise.all([
        api.getPendingRequests(currentUser.id),
        api.getSentRequests(currentUser.id),
        api.getUserFriends(currentUser.id),
      ]);
      setPendingRequests(pending);
      setSentRequests(sent);
      setDirectFriends(friends);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleAccept = async (requestId) => {
    try {
      await api.acceptRequest(requestId);
      setActionMsg('Accepted friend request! Connected on social graph.');
      setTimeout(() => setActionMsg(''), 3000);
      fetchData();
      refreshCurrentUser();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.rejectRequest(requestId);
      setActionMsg('Request declined.');
      setTimeout(() => setActionMsg(''), 3000);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!currentUser) return;
    try {
      await api.removeFriend(currentUser.id, friendId);
      setActionMsg('Friend removed from your social graph.');
      setTimeout(() => setActionMsg(''), 3000);
      fetchData();
      refreshCurrentUser();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <UserPlus className="w-7 h-7 text-brand-400" />
            <span>Friend Requests & Social Ties</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Accepting requests dynamically updates DSU disjoint components and weighted graph edges.
          </p>
        </div>

        <AlgorithmBadge name="DSU" tooltip="Dynamic union & find" />
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Pending Incoming Requests */}
      <div className="glow-card rounded-3xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Pending Incoming Requests ({pendingRequests.length})</span>
        </h2>

        {pendingRequests.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {pendingRequests.map((req) => {
              const fromUser = req.fromUser || {};
              return (
                <div key={req.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={fromUser.avatar}
                      alt={fromUser.name}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{fromUser.name}</h4>
                      <p className="text-xs text-brand-400">@{fromUser.username} • {fromUser.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-brand-500/20"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-2">No pending friend requests at this time.</p>
        )}
      </div>

      {/* Direct Friends Network */}
      <div className="glow-card rounded-3xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Direct Friends in Your Graph ({directFriends.length})</span>
        </h2>

        {directFriends.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {directFriends.map((friend) => (
              <div
                key={friend.id}
                className="p-3.5 rounded-2xl bg-slate-850/80 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{friend.name}</h4>
                    <p className="text-[11px] text-brand-400 truncate">@{friend.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveFriend(friend.id)}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-medium transition-colors"
                >
                  Unfriend
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-2">No direct friends connected yet.</p>
        )}
      </div>

    </div>
  );
};
