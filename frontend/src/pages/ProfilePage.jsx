import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  User,
  MapPin,
  Calendar,
  GraduationCap,
  Users,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  MoreHorizontal,
  Layers,
  Sparkles,
  GitBranch,
  ArrowRight,
  Heart
} from 'lucide-react';

export const ProfilePage = () => {
  const { id } = useParams();
  const { currentUser, refreshCurrentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [mutualFriends, setMutualFriends] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [dijkstraPath, setDijkstraPath] = useState(null);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'about', 'friends', 'communities', 'network'
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const targetId = Number(id || currentUser?.id);
  const isSelf = currentUser?.id === targetId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const [u, userFriends, feed] = await Promise.all([
          api.getUser(targetId),
          api.getUserFriends(targetId),
          api.getFeed(targetId, 30),
        ]);
        setProfileUser(u);
        setFriends(userFriends);
        setUserPosts(feed.filter(p => p.authorId === targetId));

        if (currentUser && currentUser.id !== targetId) {
          const [mutuals, dPath] = await Promise.all([
            api.getMutualFriends(currentUser.id, targetId),
            api.getDijkstraPath(currentUser.id, targetId),
          ]);
          setMutualFriends(mutuals);
          setDijkstraPath(dPath);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (targetId) {
      fetchProfile();
    }
  }, [targetId, currentUser]);

  const handleConnectDirect = async () => {
    if (!currentUser) return;
    try {
      await api.removeFriend(currentUser.id, targetId);
      await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1Id: currentUser.id, user2Id: targetId, weight: 4.0 })
      });
      setActionMsg('Added friend to your network!');
      setTimeout(() => setActionMsg(''), 2500);
      refreshCurrentUser();
      const updatedFriends = await api.getUserFriends(targetId);
      setFriends(updatedFriends);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !profileUser) {
    return (
      <div className="glow-card rounded-3xl p-8 max-w-4xl mx-auto h-96 animate-pulse bg-slate-900" />
    );
  }

  const isFriend = friends.some(f => f.id === currentUser?.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      
      {/* Profile Card Header */}
      <div className="glow-card rounded-3xl overflow-hidden border border-slate-800 shadow-md">
        
        {/* Cover Photo */}
        <div className="h-48 sm:h-56 w-full relative bg-slate-800">
          <img
            src={profileUser.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </div>

        {/* Profile Info Row */}
        <div className="p-6 sm:p-8 pt-0 relative space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            <div className="flex items-end gap-4">
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-slate-950 shadow-2xl shrink-0"
              />
              <div className="mb-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
                  <span>{profileUser.name}</span>
                  {profileUser.activityScore > 85 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-400" title="Active Contributor" />
                  )}
                </h1>
                <p className="text-xs text-brand-400 font-semibold">@{profileUser.username}</p>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isSelf ? (
                <>
                  {isFriend ? (
                    <span className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Connected
                    </span>
                  ) : (
                    <button
                      onClick={handleConnectDirect}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add Friend</span>
                    </button>
                  )}

                  <button className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                </>
              ) : (
                <span className="text-xs text-slate-400 font-medium px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  Your Public Profile
                </span>
              )}

              <button className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

          </div>

          {actionMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionMsg}</span>
            </div>
          )}

          {/* Headline & Bio */}
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold text-slate-200">{profileUser.headline}</h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{profileUser.bio}</p>
          </div>

          {/* Metadata Row: College, City, Joined */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-850">
            {profileUser.college && (
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-brand-400" />
                <span>{profileUser.college}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-400" />
              <span>{profileUser.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-400" />
              <span>Joined {profileUser.joinedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-400" />
              <span><strong className="text-slate-200 font-mono">{friends.length}</strong> Connections</span>
            </div>
          </div>

        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex items-center gap-1 px-6 border-t border-slate-800 overflow-x-auto bg-slate-900/50">
          {[
            { id: 'posts', label: 'Posts' },
            { id: 'about', label: 'About' },
            { id: 'friends', label: `Friends (${friends.length})` },
            { id: 'network', label: 'Network Path' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-brand-400 text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Tab 1: Posts */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <article key={post.id} className="glow-card rounded-3xl p-5 space-y-3.5 border border-slate-800">
                <div className="flex items-center gap-3">
                  <img src={profileUser.avatar} alt={profileUser.name} className="w-10 h-10 rounded-2xl object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{profileUser.name}</h4>
                    <span className="text-[10px] text-slate-400">{post.createdAt}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{post.content}</p>
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="Post" className="w-full h-64 object-cover rounded-2xl border border-slate-800" />
                )}
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-850">
                  <span className="flex items-center gap-1 font-mono"><Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> {post.likes}</span>
                  <span className="flex items-center gap-1 font-mono"><MessageSquare className="w-3.5 h-3.5" /> {post.comments?.length || 0}</span>
                </div>
              </article>
            ))
          ) : (
            <div className="glow-card rounded-3xl p-8 text-center text-xs text-slate-400">
              No posts shared yet by this user.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: About (Interests, Skills, Bio) */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="glow-card rounded-3xl p-6 space-y-3 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400">Interests & Topics</h3>
            <div className="flex flex-wrap gap-1.5">
              {profileUser.interests?.map((item, i) => (
                <span key={i} className="px-2.5 py-1 rounded-xl bg-slate-800 text-brand-300 text-xs font-mono">
                  #{item}
                </span>
              ))}
            </div>
          </div>

          <div className="glow-card rounded-3xl p-6 space-y-3 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">Technical Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {profileUser.skills?.map((item, i) => (
                <span key={i} className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Friends */}
      {activeTab === 'friends' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {friends.map((f) => (
              <Link
                key={f.id}
                to={`/profile/${f.id}`}
                className="p-3.5 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-800 flex items-center gap-3 transition-colors"
              >
                <img src={f.avatar} alt={f.name} className="w-10 h-10 rounded-xl object-cover" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-200 truncate">{f.name}</h4>
                  <p className="text-[10px] text-slate-400 truncate">@{f.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Network Path */}
      {activeTab === 'network' && (
        <div className="glow-card rounded-3xl p-6 space-y-4 border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            <span>Shortest Social Connection Route</span>
          </h3>

          {!isSelf && dijkstraPath ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {dijkstraPath.pathUsers?.map((u, i) => (
                  <React.Fragment key={u.id}>
                    <span className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold ${
                      u.id === currentUser?.id ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40' :
                      u.id === targetId ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                      'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}>
                      {u.name}
                    </span>
                    {i < dijkstraPath.pathUsers.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-800">
                <div>
                  <span className="text-slate-400">Connection Degrees:</span>
                  <p className="font-mono font-bold text-slate-100">{dijkstraPath.path?.length ? dijkstraPath.path.length - 1 : 0} Hops</p>
                </div>
                <div>
                  <span className="text-slate-400">Social Affinity:</span>
                  <p className="font-mono font-bold text-brand-400">{(dijkstraPath.socialAffinityScore * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Viewing your own profile origin.</p>
          )}
        </div>
      )}

    </div>
  );
};
