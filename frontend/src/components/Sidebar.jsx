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
    { to: '/lab', label: 'How FriendSphere Thinks', icon: Cpu, isLab: true },
  ];

  return (
    <aside className="w-52 shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-4">
        
        {/* User Profile Mini Snapshot */}
        {currentUser && (
          <div className="glow-card rounded-xl p-3 transition-all hover:border-teal-primary/30">
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-lg object-cover border border-teal-primary/40 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <NavLink
                  to={`/profile/${currentUser.id}`}
                  className="text-xs font-bold text-text-primary hover:text-teal-primary truncate block"
                >
                  {currentUser.name}
                </NavLink>
                <p className="text-[10px] text-teal-dark font-medium truncate">@{currentUser.username}</p>
              </div>
            </div>
          </div>
        )}

        {/* Primary Navigation Menu */}
        <nav className="glow-card rounded-xl p-2 space-y-0.5">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-teal-primary text-surface font-bold shadow-xs'
                      : item.isLab
                      ? 'text-teal-dark hover:bg-teal-950/40 hover:text-teal-dark border border-teal-500/20'
                      : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-brand-400 text-surface">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>



      </div>
    </aside>
  );
};
