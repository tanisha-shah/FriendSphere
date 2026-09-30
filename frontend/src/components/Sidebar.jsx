import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  User,
  Users,
  UserPlus,
  Compass,
  Layers,
  BarChart3,
  Cpu,
  Bookmark,
  Sparkles
} from 'lucide-react';

export const Sidebar = () => {
  const { currentUser, pendingRequestsCount } = useAuth();

  const primaryNav = [
    { to: '/', label: 'Home', icon: Home },
    { to: currentUser ? `/profile/${currentUser.id}` : '/profile/1', label: 'My Profile', icon: User },
    { to: '/network', label: 'My Network', icon: Users },
    { to: '/suggestions', label: 'Friend Suggestions', icon: Sparkles, badge: 'Smart' },
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/communities', label: 'Communities', icon: Layers },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/lab', label: 'How FriendSphere Thinks', icon: Cpu, isLab: true },
  ];

  return (
    <aside className="w-60 shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-5">
        
        {/* User Profile Mini Snapshot */}
        {currentUser && (
          <div className="glow-card rounded-3xl p-4 transition-all hover:border-brand-500/30">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-11 h-11 rounded-2xl object-cover border border-brand-500/40 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <NavLink
                  to={`/profile/${currentUser.id}`}
                  className="text-xs font-bold text-slate-100 hover:text-brand-300 truncate block"
                >
                  {currentUser.name}
                </NavLink>
                <p className="text-[11px] text-brand-400 font-medium truncate">@{currentUser.username}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{currentUser.college || currentUser.location}</p>
              </div>
            </div>
          </div>
        )}

        {/* Primary Navigation Menu */}
        <nav className="glow-card rounded-3xl p-2.5 space-y-1">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-teal-500 text-slate-950 font-bold shadow-md shadow-brand-500/20'
                      : item.isLab
                      ? 'text-teal-300 hover:bg-teal-950/40 hover:text-teal-200 border border-teal-500/20'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-brand-400 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Social Network Metric Snapshot */}
        <div className="glow-card rounded-3xl p-4 bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Network Reach
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-xl bg-slate-800/60">
              <span className="block text-base font-bold text-slate-100 font-mono">8</span>
              <span className="text-[10px] text-slate-400">Direct Ties</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/60">
              <span className="block text-base font-bold text-brand-400 font-mono">34</span>
              <span className="text-[10px] text-slate-400">2nd-Degree</span>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
};
