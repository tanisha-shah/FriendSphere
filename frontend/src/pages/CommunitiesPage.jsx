import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Layers,
  Users,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  X,
  Plus,
  ArrowRight,
  Compass,
  Check,
  Bookmark,
  Share2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Curated high-resolution thematic photos for communities (replacing initials)
const COMMUNITY_ASSETS = {
  c1: {
    avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
    category: 'Computer Science',
    sampleMembers: 'Aravind, Sophia, Priya and 28 others'
  },
  c2: {
    avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
    category: 'Artificial Intelligence',
    sampleMembers: 'Deepak, Ananya, Leo and 19 others'
  },
  c3: {
    avatar: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=80',
    category: 'Security & Systems',
    sampleMembers: 'Marcus, David, Tariq and 14 others'
  },
  c4: {
    avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1000&auto=format&fit=crop&q=80',
    category: 'Creative Tech & Game Dev',
    sampleMembers: 'Lucas, Priya, Zoe and 22 others'
  },
  c5: {
    avatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1000&auto=format&fit=crop&q=80',
    category: 'Science & Physics',
    sampleMembers: 'Elena, Sophia, Clara and 11 others'
  },
  c6: {
    avatar: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
    category: 'Lifestyle & Outdoors',
    sampleMembers: 'David, Leo, Emily and 26 others'
  }
};

// High-resolution real portrait photos for members (replacing initials / silhouettes)
const MEMBER_PORTRAITS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80',
];

const getMemberPhoto = (id = 1) => {
  const num = Number(id) || 1;
  return MEMBER_PORTRAITS[num % MEMBER_PORTRAITS.length];
};

const formatTag = (tag = '') => {
  const map = {
    algorithms: 'Algorithms',
    competitive_prog: 'Competitive Programming',
    chess: 'Chess',
    ai_ml: 'AI & ML',
    data_science: 'Data Science',
    cybersec: 'Cybersecurity',
    blockchain: 'Blockchain',
    cloud_comp: 'Cloud Computing',
    game_dev: 'Game Development',
    web_dev: 'Web Development',
    music_prod: 'Music Production',
    photography: 'Photography',
    quantum_comp: 'Quantum Computing',
    astronomy: 'Astronomy',
    hiking: 'Hiking & Trails',
    fitness: 'Fitness'
  };
  return map[tag] || tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const CommunitiesPage = () => {
  const { currentUser } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinedMap, setJoinedMap] = useState({});
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const fetchComm = async () => {
      try {
        setLoading(true);
        const data = await api.getCommunities();
        setCommunities(data);
        if (data.length > 0) {
          const map = {};
          data.forEach(c => {
            map[c.id] = c.memberIds?.includes(currentUser?.id) ?? true;
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

  const categories = ['All', 'Computer Science', 'Artificial Intelligence', 'Security & Systems', 'Creative & Gaming', 'Science & Physics', 'Lifestyle & Outdoors'];

  const filteredCommunities = communities.filter(c => {
    if (activeFilter === 'All') return true;
    return c.category === activeFilter;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Human Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E9E8E2] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-teal-dark" />
            <span>Communities & Circles</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover student clubs, research groups, and interest spheres across campus.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-600 bg-white border border-[#E8E6DF] px-3.5 py-1.5 rounded-full shadow-xs">
            {communities.length} Active Circles
          </span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === cat
                ? 'bg-teal-primary text-white font-semibold shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-[#E8E6DF] hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Community Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl h-80 animate-pulse bg-white border border-[#E9E8E2]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCommunities.map((c) => {
            const isJoined = joinedMap[c.id];
            const memberCount = (c.memberIds?.length || 10) * 12;
            const asset = COMMUNITY_ASSETS[c.id] || {
              avatar: c.avatar,
              banner: c.banner,
              category: c.category,
              sampleMembers: 'Campus peers & researchers'
            };

            // Sample member avatars for the card preview
            const previewMemberIds = (c.memberIds && c.memberIds.length > 0)
              ? c.memberIds.slice(0, 4)
              : [1, 2, 3, 5];

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-[#E8E6DF] shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Cover Banner */}
                  <div className="h-36 sm:h-40 w-full relative overflow-hidden bg-slate-100">
                    <img
                      src={asset.banner}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Subtle gradient to ensure category badge pops */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
                    
                    {/* Category Badge on Banner */}
                    <div className="absolute top-3.5 right-3.5">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-800 shadow-xs border border-white/80 backdrop-blur-sm">
                        {asset.category || c.category}
                      </span>
                    </div>
                  </div>

                  {/* Community Photo Avatar Overlapping Banner */}
                  <div className="px-6 relative flex items-end justify-between -mt-10 mb-3">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-white shrink-0">
                      <img
                        src={asset.avatar}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Quick Join Button in Header */}
                    <button
                      onClick={() => toggleJoin(c.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isJoined
                          ? 'bg-[#EAF3EE] text-[#285E4D] border border-[#C5DDD2]'
                          : 'bg-teal-primary hover:bg-teal-dark text-white shadow-xs'
                      }`}
                    >
                      {isJoined ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Joined</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Join Circle</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Main Content Area on Crisp White Background */}
                  <div className="px-6 pb-4 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-primary transition-colors leading-snug">
                        {c.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                        <Users className="w-3.5 h-3.5 text-teal-dark shrink-0" />
                        <span>{memberCount} active campus members</span>
                      </div>
                    </div>

                    {/* Clear, readable description */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {c.description}
                    </p>

                    {/* Interest Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {c.primaryInterests?.map((item, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200/70"
                        >
                          {formatTag(item)}
                        </span>
                      ))}
                    </div>

                    {/* Stacked Real Member Face Photos */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2.5">
                      <div className="flex -space-x-2 overflow-hidden shrink-0">
                        {previewMemberIds.map((uid, idx) => (
                          <img
                            key={idx}
                            src={getMemberPhoto(uid)}
                            alt="Member"
                            className="w-7 h-7 rounded-full border-2 border-white object-cover"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500 font-medium truncate">
                        Joined by {asset.sampleMembers}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-6 py-3.5 bg-slate-50/60 border-t border-[#EAE8E2] flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCommunity(c)}
                    className="text-xs font-semibold text-slate-700 hover:text-teal-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View Members & Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[11px] text-slate-400 font-medium">
                    Verified Circle
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Community Detail Modal */}
      {selectedCommunity && (() => {
        const modalAsset = COMMUNITY_ASSETS[selectedCommunity.id] || {
          avatar: selectedCommunity.avatar,
          banner: selectedCommunity.banner,
          category: selectedCommunity.category
        };
        const isJoined = joinedMap[selectedCommunity.id];
        const memberCount = (selectedCommunity.memberIds?.length || 10) * 12;

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="relative w-full max-w-2xl bg-white border border-[#E8E6DF] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Modal Banner */}
              <div className="h-40 relative bg-slate-100 overflow-hidden">
                <img
                  src={modalAsset.banner}
                  alt={selectedCommunity.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedCommunity(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-7 space-y-5">
                <div className="flex items-start justify-between gap-4 -mt-14 relative z-10">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white shrink-0">
                    <img
                      src={modalAsset.avatar}
                      alt={selectedCommunity.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <button
                    onClick={() => toggleJoin(selectedCommunity.id)}
                    className={`mt-6 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isJoined
                        ? 'bg-[#EAF3EE] text-[#285E4D] border border-[#C5DDD2]'
                        : 'bg-teal-primary hover:bg-teal-dark text-white shadow-xs'
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Joined Circle</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Join Circle</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900 leading-snug">
                    {selectedCommunity.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                    <span className="font-semibold text-teal-dark">{modalAsset.category || selectedCommunity.category}</span>
                    <span>&bull;</span>
                    <span>{memberCount} registered peers</span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedCommunity.description}
                </p>

                {/* Topic tags */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedCommunity.primaryInterests?.map((item, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/70"
                    >
                      {formatTag(item)}
                    </span>
                  ))}
                </div>

                {/* Members Roster with Real Photos (No Initials) */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-teal-dark" />
                      <span>Active Circle Members</span>
                    </h4>
                    <span className="text-xs text-slate-500">
                      Showing connected members
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                    {(selectedCommunity.members && selectedCommunity.members.length > 0
                      ? selectedCommunity.members
                      : (selectedCommunity.memberIds || [1, 2, 3, 5, 7, 9]).map((id) => ({
                          id,
                          name: `Classmate ${id}`,
                          username: `student_${id}`,
                          college: 'Nirma University'
                        }))
                    ).map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3 hover:bg-slate-100/70 transition-colors"
                      >
                        {/* Real Photo Portrait */}
                        <img
                          src={getMemberPhoto(m.id)}
                          alt={m.name}
                          className="w-9 h-9 rounded-full object-cover border border-white shadow-xs shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-800 truncate block">
                            {m.name}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate block">
                            @{m.username} {m.college ? `• ${m.college}` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
export default CommunitiesPage;
