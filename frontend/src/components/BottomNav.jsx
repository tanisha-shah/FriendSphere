import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Compass,
  Users,
  Sparkles,
  User
} from 'lucide-react';

export const BottomNav = () => {
  const { currentUser } = useAuth();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/suggestions', label: 'Suggestions', icon: Sparkles },
    { to: '/network', label: 'Network', icon: Users },
    { to: currentUser ? `/profile/${currentUser.id}` : '/profile/1', label: 'Profile', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-sec  border-t border-border-subtle px-4 py-2 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                isActive ? 'text-teal-dark font-bold' : 'text-text-secondary hover:text-text-primary'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};
