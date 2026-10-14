import React from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const StoryReel = () => {
  const { currentUser, allUsers } = useAuth();

  const stories = allUsers.slice(1, 8);

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
      {/* Create Story card */}
      {currentUser && (
        <div className="shrink-0 w-28 h-40 rounded-xl overflow-hidden relative group cursor-pointer border border-border-subtle bg-surface-sec transition-all hover:border-teal-primary/40">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-surface-sec flex flex-col items-center">
            <div className="-mt-6 w-8 h-8 rounded-full bg-teal-primary border-2 border-slate-900 flex items-center justify-center text-surface shadow-md">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-text-primary mt-1">Add Story</span>
          </div>
        </div>
      )}

      {/* Connection Stories */}
      {stories.map((user) => (
        <div
          key={user.id}
          className="shrink-0 w-28 h-40 rounded-xl overflow-hidden relative group cursor-pointer border border-border-subtle transition-all hover:scale-[1.02] shadow-sm"
        >
          <img
            src={user.coverImage || user.avatar}
            alt={user.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 from-slate-950/20 via-transparent to-slate-950/80" />
          
          <div className="absolute top-2.5 left-2.5">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-brand-400 shadow-md"
            />
          </div>

          <div className="absolute bottom-2.5 left-2.5 right-2.5">
            <span className="text-xs font-bold text-text-primary line-clamp-1 drop-shadow-md">
              {user.name.split(' ')[0]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
