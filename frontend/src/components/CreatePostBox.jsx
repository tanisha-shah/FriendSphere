import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Image,
  Video,
  Calendar,
  BarChart2,
  Send,
  Sparkles,
  X,
  Tag
} from 'lucide-react';

export const CreatePostBox = ({ onPostCreated, availableInterests = [] }) => {
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('standard'); // 'standard', 'photo', 'video', 'event', 'poll'
  const [imageUrl, setImageUrl] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);

  const samplePhotos = [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !currentUser) return;
    try {
      setSubmitting(true);
      await onPostCreated({
        authorId: currentUser.id,
        content: content.trim(),
        tags: selectedTags,
        imageUrl: postType === 'photo' ? (imageUrl || samplePhotos[0]) : '',
        postType
      });
      setContent('');
      setImageUrl('');
      setPostType('standard');
      setSelectedTags([]);
      setShowTagSelector(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  return (
    <div className="glow-card rounded-3xl p-5 space-y-4 shadow-sm border border-slate-800">
      
      {/* Top Input Row */}
      <div className="flex items-center gap-3">
        {currentUser && (
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-2xl object-cover border border-brand-500/30 shrink-0"
          />
        )}
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={currentUser ? `What's on your mind, ${currentUser.name.split(' ')[0]}?` : "What's on your mind?"}
          className="flex-1 bg-slate-850 text-sm text-slate-100 placeholder-slate-400 rounded-2xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
        />
      </div>

      {/* Conditional Media / Poll Expansion */}
      {postType === 'photo' && (
        <div className="p-3.5 rounded-2xl bg-slate-850/80 border border-slate-700 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Attach Image URL or select sample:</span>
            <button onClick={() => setPostType('standard')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste image link (e.g. https://...)..."
            className="w-full bg-slate-900 text-xs text-slate-100 rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-brand-500"
          />
          <div className="flex gap-2 pt-1">
            {samplePhotos.map((url, i) => (
              <img
                key={i}
                src={url}
                alt="Sample"
                onClick={() => setImageUrl(url)}
                className={`w-14 h-10 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                  imageUrl === url ? 'border-brand-400 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {postType === 'poll' && (
        <div className="p-3.5 rounded-2xl bg-slate-850/80 border border-slate-700 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Create Poll Options:</span>
            <button onClick={() => setPostType('standard')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          {pollOptions.map((opt, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`Option ${idx + 1}...`}
              value={opt}
              onChange={(e) => {
                const next = [...pollOptions];
                next[idx] = e.target.value;
                setPollOptions(next);
              }}
              className="w-full bg-slate-900 text-xs text-slate-100 rounded-xl px-3 py-2 border border-slate-700"
            />
          ))}
        </div>
      )}

      {/* Selected Tags Badge preview */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-lg bg-brand-500/10 text-brand-400 text-xs font-mono border border-brand-500/30 flex items-center gap-1"
            >
              #{tag}
              <button onClick={() => toggleTag(tag)} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tag Selector Drawer */}
      {showTagSelector && (
        <div className="p-3 bg-slate-850 rounded-2xl border border-slate-800 space-y-2 animate-in fade-in">
          <span className="text-[11px] font-semibold text-slate-400">Select topics to tag in your post:</span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {availableInterests.map((interest) => (
              <button
                type="button"
                key={interest.id}
                onClick={() => toggleTag(interest.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                  selectedTags.includes(interest.id)
                    ? 'bg-brand-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                #{interest.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Buttons: Photo, Video, Event, Poll + Submit */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-xs">
        <div className="flex items-center gap-1 sm:gap-2">
          
          <button
            type="button"
            onClick={() => setPostType(postType === 'photo' ? 'standard' : 'photo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors ${
              postType === 'photo' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
            }`}
          >
            <Image className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Photo</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType(postType === 'video' ? 'standard' : 'video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors ${
              postType === 'video' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
            }`}
          >
            <Video className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Video</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType(postType === 'event' ? 'standard' : 'event')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors ${
              postType === 'event' ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Event</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType(postType === 'poll' ? 'standard' : 'poll')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors ${
              postType === 'poll' ? 'bg-purple-500/10 text-purple-400' : 'text-slate-400 hover:text-purple-400 hover:bg-slate-800'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Poll</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTagSelector(!showTagSelector)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-brand-400 hover:bg-slate-800 font-medium transition-colors"
          >
            <Tag className="w-4 h-4 text-brand-400" />
          </button>

        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !content.trim()}
          className="px-5 py-2 rounded-2xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-all shadow-md shadow-brand-500/20 flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Post</span>
        </button>
      </div>

    </div>
  );
};
