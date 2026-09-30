import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Search,
  Home,
  Compass,
  Users,
  Bell,
  MessageSquare,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  X,
  UserCheck,
  Send,
  Sliders,
  Moon,
  Sun
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, allUsers, switchUser, pendingRequestsCount } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Aravind Kumar liked your post about graph optimizations.', time: '10m ago', unread: true },
    { id: 2, text: 'Sophia Chen mentioned you in a discussion on Graph Neural Networks.', time: '1h ago', unread: true },
    { id: 3, text: 'You have 3 new friend recommendations based on shared interests in Algorithms.', time: '2h ago', unread: false }
  ]);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const msgRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await api.searchUsers(searchQuery.trim(), 6);
        setSearchResults(results);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchDropdown(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserDropdown(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (msgRef.current && !msgRef.current.contains(e.target)) setShowMessages(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (id) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(`/profile/${id}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-all">
                <span className="text-xl font-black text-slate-950">FS</span>
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  FriendSphere
                </span>
                <p className="hidden md:block text-[10px] text-slate-400 font-medium tracking-wide">
                  Connect smarter. Discover naturally.
                </p>
              </div>
            </Link>
          </div>

          {/* Autocomplete Search Bar */}
          <div className="flex-1 max-w-md relative" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                placeholder="Search people, interests or communities..."
                className="w-full bg-slate-800/90 text-sm text-slate-100 placeholder-slate-400 rounded-full pl-10 pr-10 py-2 border border-slate-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in-50 duration-150">
                <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Search Suggestions</span>
                  <span className="text-[10px] text-brand-400 font-medium">Instant Matching</span>
                </div>
                {searchResults.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user.id)}
                        className="px-4 py-2.5 hover:bg-slate-800/80 cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-200 truncate">
                            {user.name} <span className="text-xs text-slate-400 font-normal">@{user.username}</span>
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {user.college || user.headline || user.location}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-slate-400">
                    {isSearching ? 'Searching network...' : 'No results found.'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`p-2.5 rounded-xl transition-colors ${
                location.pathname === '/' ? 'text-brand-400 bg-brand-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Home Feed"
            >
              <Home className="w-5 h-5" />
            </Link>
            <Link
              to="/discover"
              className={`p-2.5 rounded-xl transition-colors ${
                location.pathname.startsWith('/discover') ? 'text-brand-400 bg-brand-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Discover"
            >
              <Compass className="w-5 h-5" />
            </Link>
            <Link
              to="/network"
              className={`p-2.5 rounded-xl transition-colors ${
                location.pathname === '/network' ? 'text-brand-400 bg-brand-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="My Network"
            >
              <Users className="w-5 h-5" />
            </Link>
          </nav>

          {/* Right Action Icons & Profile Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Messages Dropdown */}
            <div className="relative" ref={msgRef}>
              <button
                onClick={() => setShowMessages(!showMessages)}
                className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors relative"
                title="Messages"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-400 rounded-full"></span>
              </button>

              {showMessages && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in-50 duration-150">
                  <div className="p-3.5 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Direct Messages</span>
                    <span className="text-[11px] text-brand-400">1 Unread</span>
                  </div>
                  <div className="divide-y divide-slate-800/50 max-h-72 overflow-y-auto">
                    <div className="p-3 hover:bg-slate-800/60 cursor-pointer flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                        alt="Aravind"
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-200 flex justify-between">
                          <span>Aravind Kumar</span>
                          <span className="text-[10px] text-slate-500">2m</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">Hey Khushi! Did you check the new shortest path benchmark?</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in-50 duration-150">
                  <div className="p-3.5 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Notifications</span>
                    <Link to="/requests" onClick={() => setShowNotifications(false)} className="text-[11px] text-brand-400 hover:underline">
                      Requests ({pendingRequestsCount})
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-800/50 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3.5 hover:bg-slate-800/60 cursor-pointer flex gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-slate-200">{n.text}</p>
                          <span className="text-[10px] text-slate-500">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile & User Switcher */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition-all"
              >
                {currentUser && (
                  <>
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover border border-brand-500/50"
                    />
                    <span className="hidden sm:inline-block text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </>
                )}
              </button>

              {/* User Switcher Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in-50 duration-150">
                  <div className="p-4 bg-slate-800/80 border-b border-slate-800">
                    <p className="text-xs font-bold text-slate-200">Switch Test Profile</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Explore personalized social discovery from any user's perspective.
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/40">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-800 transition-colors ${
                          currentUser?.id === u.id ? 'bg-brand-950/40 border-l-2 border-brand-500' : ''
                        }`}
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-200 truncate">{u.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">@{u.username} • {u.college || u.location}</div>
                        </div>
                        {currentUser?.id === u.id && (
                          <span className="text-[10px] font-semibold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="p-2.5 bg-slate-850 border-t border-slate-800 flex justify-between">
                    <Link
                      to={`/profile/${currentUser?.id}`}
                      onClick={() => setShowUserDropdown(false)}
                      className="text-xs text-brand-400 hover:text-brand-300 font-semibold px-2 py-1"
                    >
                      View My Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
