import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Layers,
  Users,
  MessageSquare,
  Sparkles,
  Tag,
  CheckCircle2,
  X,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CommunitiesPage = () => {
  const { currentUser } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinedMap, setJoinedMap] = useState({});

  useEffect(() => {
    const fetchComm = async () => {
      try {
        setLoading(true);
        const data = await api.getCommunities();
        setCommunities(data);
        if (data.length > 0) {
          const map = {};
          data.forEach(c => {
            map[c.id] = c.memberIds?.includes(currentUser?.id) || true;
          });
          setJoinedMap(map);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComm();
  }, [currentUser]);

  const toggleJoin = (commId) => {
    setJoinedMap(prev => ({ ...prev, [commId]: !prev[commId] }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-brand-400" />
            <span>Communities & Circles</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect with dedicated practitioners, researchers, and creators in focused tech spheres.
          </p>
        </div>
      </div>

      {/* Grid of Community Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glow-card rounded-3xl h-64 animate-pulse bg-slate-900" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communities.map((c) => {
            const isJoined = joinedMap[c.id];
            const memberCount = (c.memberIds?.length || 10) * 12; // Realistic community scale

            return (
              <div
                key={c.id}
                className="glow-card rounded-3xl overflow-hidden border border-slate-800 transition-all hover:-translate-y-1 group flex flex-col justify-between"
              >
                <div>
                  {/* Cover Banner */}
                  <div className="h-32 w-full relative overflow-hidden bg-slate-800">
                    <img
                      src={c.banner}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    
                    <div className="absolute bottom-3 left-4 flex items-center gap-3">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-900 shadow-xl"
                      />
                      <div>
                        <h3 className="text-base font-bold text-slate-100 leading-tight">{c.name}</h3>
                        <span className="text-[11px] text-brand-400 font-semibold">{memberCount} members</span>
                      </div>
                    </div>
                  </div>

                  {/* Description & Topics */}
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {c.primaryInterests?.map((item, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-850 text-brand-400 text-xs font-mono border border-slate-800"
                        >
                          #{item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 border-t border-slate-850/80 mt-2 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCommunity(c)}
                    className="text-xs font-bold text-slate-300 hover:text-brand-300 transition-colors"
                  >
                    View Members & Posts →
                  </button>

                  <button
                    onClick={() => toggleJoin(c.id)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isJoined
                        ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30'
                        : 'bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-slate-950 shadow-md shadow-brand-500/20'
                    }`}
                  >
                    {isJoined ? 'Joined ✓' : '+ Join'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Community Detail Modal */}
      {selectedCommunity && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="h-36 relative bg-slate-800">
              <img src={selectedCommunity.banner} alt="Banner" className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedCommunity(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 text-white hover:bg-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3.5 -mt-12">
                <img src={selectedCommunity.avatar} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border-4 border-slate-900 shadow-xl" />
                <div className="pt-6">
                  <h2 className="text-lg font-bold text-slate-100">{selectedCommunity.name}</h2>
                  <p className="text-xs text-brand-400 font-semibold">{selectedCommunity.category}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedCommunity.description}
              </p>

              {/* Members Roster */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-brand-400" />
                  <span>Active Members ({selectedCommunity.members?.length || 12})</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto">
                  {selectedCommunity.members?.map((m) => (
                    <div key={m.id} className="p-2 rounded-xl bg-slate-850 flex items-center gap-2">
                      <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover" />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-200 truncate block">{m.name}</span>
                        <span className="text-[10px] text-slate-400 truncate block">@{m.username}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
