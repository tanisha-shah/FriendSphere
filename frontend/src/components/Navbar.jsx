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
  Sun,
  LogOut,
  User
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, logout, pendingRequestsCount } = useAuth();
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
    <header className="sticky top-0 z-40 bg-surface-sec  border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-lg bg-teal-primary flex items-center justify-center shadow-sm shadow-sm group-hover:scale-105 transition-all">
                <span className="text-xl font-black text-surface">FS</span>
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-teal-primary bg-clip-text text-transparent">
                  FriendSphere
                </span>
                <p className="hidden md:block text-[10px] text-text-secondary font-medium tracking-wide">
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
                className="w-full bg-surface text-sm text-text-primary placeholder-slate-400 rounded-full pl-10 pr-10 py-2 border border-border-subtle focus:outline-none focus:border-teal-primary focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
              <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-text-secondary hover:text-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute left-0 right-0 mt-2 bg-surface-sec border border-border-subtle rounded-lg shadow-md overflow-hidden z-50 animate-in fade-in-50 duration-150">
                <div className="px-4 py-2.5 bg-surface border-b border-border-subtle flex items-center justify-between text-xs font-semibold text-text-secondary">
                  <span>Search Suggestions</span>
                  <span className="text-[10px] text-teal-dark font-medium">Instant Matching</span>
                </div>
                {searchResults.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user.id)}
                        className="px-4 py-2.5 hover:bg-surface cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-border-subtle"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-text-primary truncate">
                            {user.name} <span className="text-xs text-text-secondary font-normal">@{user.username}</span>
                          </div>
                          <div className="text-xs text-text-secondary truncate">
                            {user.college || user.headline || user.location}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-text-secondary">
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
                location.pathname === '/' ? 'text-teal-dark bg-seafoam' : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              }`}
              title="Home Feed"
            >
              <Home className="w-5 h-5" />
            </Link>
            <Link
              to="/discover"
              className={`p-2.5 rounded-xl transition-colors ${
                location.pathname.startsWith('/discover') ? 'text-teal-dark bg-seafoam' : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              }`}
              title="Discover"
            >
              <Compass className="w-5 h-5" />
            </Link>
            <Link
              to="/network"
              className={`p-2.5 rounded-xl transition-colors ${
                location.pathname === '/network' ? 'text-teal-dark bg-seafoam' : 'text-text-secondary hover:text-text-primary hover:bg-surface'
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
                className="p-2.5 rounded-full bg-surface hover:bg-surface-hov text-text-secondary hover:text-text-primary transition-colors relative"
                title="Messages"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-400 rounded-full"></span>
              </button>

              {showMessages && (
                <div className="absolute right-0 mt-2 w-80 bg-surface-sec border border-border-subtle rounded-lg shadow-md overflow-hidden z-50 animate-in fade-in-50 duration-150">
                  <div className="p-3.5 bg-surface border-b border-border-subtle flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">Direct Messages</span>
                    <span className="text-[11px] text-teal-dark">1 Unread</span>
                  </div>
                  <div className="divide-y divide-slate-800/50 max-h-72 overflow-y-auto">
                    <div className="p-3 hover:bg-surface cursor-pointer flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                        alt="Aravind"
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-text-primary flex justify-between">
                          <span>Aravind Kumar</span>
                          <span className="text-[10px] text-surface0">2m</span>
                        </div>
                        <p className="text-xs text-text-secondary truncate">Hey Tanisha! Did you check the new shortest path benchmark?</p>
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
                className="p-2.5 rounded-full bg-surface hover:bg-surface-hov text-text-secondary hover:text-text-primary transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {pendingRequestsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-teal-primary text-surface font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-sec border border-border-subtle rounded-lg shadow-md overflow-hidden z-50 animate-in fade-in-50 duration-150">
                  <div className="p-3.5 bg-surface border-b border-border-subtle flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">Notifications</span>
                    <Link to="/requests" onClick={() => setShowNotifications(false)} className="text-[11px] text-teal-dark hover:underline">
                      Requests ({pendingRequestsCount})
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-800/50 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3.5 hover:bg-surface cursor-pointer flex gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-text-primary">{n.text}</p>
                          <span className="text-[10px] text-surface0">{n.time}</span>
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
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-surface hover:bg-surface-hov border border-border-subtle text-left transition-all"
              >
                {currentUser && (
                  <>
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover border border-teal-primary/50"
                    />
                    <span className="hidden sm:inline-block text-xs font-semibold text-text-primary max-w-[100px] truncate">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
                  </>
                )}
              </button>

              {/* Profile Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-surface-sec border border-border-subtle rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in-50 duration-150">
                  {/* Account Header */}
                  <div className="p-4 bg-surface border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentUser?.avatar}
                        alt={currentUser?.name}
                        className="w-11 h-11 rounded-full object-cover border border-teal-primary/40 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-text-primary truncate">
                          {currentUser?.name}
                        </div>
                        <div className="text-xs text-text-secondary truncate">
                          {currentUser?.email}
                        </div>
                        <div className="mt-1">
                          <span className="text-[10px] font-semibold text-teal-dark bg-seafoam px-2 py-0.5 rounded-full inline-block">
                            @{currentUser?.username}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-2 space-y-1">
                    <Link
                      to={`/profile/${currentUser?.id}`}
                      onClick={() => setShowUserDropdown(false)}
                      className="w-full px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface rounded-xl flex items-center gap-2.5 transition-colors"
                    >
                      <User className="w-4 h-4 text-teal-primary" />
                      <span>View Profile</span>
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
