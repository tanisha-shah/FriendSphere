import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StoryReel } from '../components/StoryReel';
import { CreatePostBox } from '../components/CreatePostBox';
import { Link } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Clock,
  Sparkles,
  Send,
  CheckCircle2,
  Tag
} from 'lucide-react';

export const FeedPage = () => {
  const { currentUser } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableInterests, setAvailableInterests] = useState([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [shareNotice, setShareNotice] = useState('');

  const fetchFeedData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [posts, intData] = await Promise.all([
        api.getFeed(currentUser.id, 30),
        api.getInterests()
      ]);
      setFeed(posts);
      setAvailableInterests(intData.interests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedData();
  }, [currentUser]);

  const handlePostCreated = async (postData) => {
    await api.createPost(postData.authorId, postData.content, postData.tags);
    fetchFeedData();
  };

  const handleLike = async (postId) => {
    if (!currentUser) return;
    try {
      const alreadyLiked = likedPosts.has(postId);
      const nextLiked = new Set(likedPosts);

      if (alreadyLiked) {
        nextLiked.delete(postId);
        setFeed(feed.map(p => p.id === postId ? { ...p, likes: Math.max(0, p.likes - 1) } : p));
      } else {
        nextLiked.add(postId);
        setFeed(feed.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
        await api.likePost(postId, currentUser.id);
      }
      setLikedPosts(nextLiked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = (postId) => {
    const nextSaved = new Set(savedPosts);
    if (nextSaved.has(postId)) {
      nextSaved.delete(postId);
    } else {
      nextSaved.add(postId);
    }
    setSavedPosts(nextSaved);
  };

  const handleShare = (postId) => {
    navigator.clipboard?.writeText?.(window.location.origin);
    setShareNotice('Link copied to clipboard!');
    setTimeout(() => setShareNotice(''), 2500);
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim() || !currentUser) return;
    try {
      await api.addComment(postId, currentUser.id, commentText.trim());
      setCommentText('');
      fetchFeedData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-200">
      
      {/* Story Highlights Reel */}
      <StoryReel />

      {/* "What's on your mind?" Create Post Box */}
      <CreatePostBox
        onPostCreated={handlePostCreated}
        availableInterests={availableInterests}
      />

      {shareNotice && (
        <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-2xl text-xs text-brand-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{shareNotice}</span>
        </div>
      )}

      {/* Feed Stream */}
      <div className="space-y-5">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glow-card rounded-3xl p-6 h-64 animate-pulse bg-slate-900" />
            ))}
          </div>
        ) : feed.length > 0 ? (
          feed.map((post) => {
            const author = post.author || {};
            const isCommentsOpen = activeCommentPostId === post.id;
            const isLiked = likedPosts.has(post.id) || post.likes > 40;
            const isSaved = savedPosts.has(post.id);

            return (
              <article
                key={post.id}
                className="glow-card rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm border border-slate-800 transition-all hover:border-slate-700/80"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${author.id}`}>
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-700 hover:border-brand-500 transition-colors"
                      />
                    </Link>
                    <div>
                      <Link
                        to={`/profile/${author.id}`}
                        className="text-sm font-bold text-slate-100 hover:text-brand-300 transition-colors flex items-center gap-1.5"
                      >
                        <span>{author.name}</span>
                        {author.activityScore > 85 && (
                          <span className="w-2 h-2 rounded-full bg-brand-400" title="Active Contributor" />
                        )}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {author.college || author.headline || author.location} • <span className="text-slate-500">{post.createdAt}</span>
                      </p>
                    </div>
                  </div>

                  <button className="p-1.5 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Post Text Content */}
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Attached Image if available */}
                {post.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-96 bg-slate-950">
                    <img
                      src={post.imageUrl}
                      alt="Post visual"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-lg bg-slate-850 text-brand-400 text-xs font-medium border border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Footer Actions: Like, Comment, Share, Save */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-850 text-xs text-slate-400">
                  <div className="flex items-center gap-6">
                    
                    {/* Like */}
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors group ${
                        isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 transition-transform group-hover:scale-125 ${
                        isLiked ? 'fill-rose-500 text-rose-500' : ''
                      }`} />
                      <span className="font-mono">{post.likes}</span>
                    </button>

                    {/* Comment */}
                    <button
                      onClick={() => setActiveCommentPostId(isCommentsOpen ? null : post.id)}
                      className="flex items-center gap-1.5 hover:text-brand-400 transition-colors group"
                    >
                      <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="font-mono">{post.comments?.length || 0}</span>
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => handleShare(post.id)}
                      className="flex items-center gap-1.5 hover:text-blue-400 transition-colors group"
                    >
                      <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">Share</span>
                    </button>

                  </div>

                  {/* Save / Bookmark */}
                  <button
                    onClick={() => handleBookmark(post.id)}
                    className={`transition-colors ${
                      isSaved ? 'text-amber-400' : 'hover:text-amber-400'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                {/* Comments Thread */}
                {isCommentsOpen && (
                  <div className="pt-3 border-t border-slate-800 space-y-3 animate-in fade-in duration-150">
                    {post.comments?.map((comment) => (
                      <div key={comment.id} className="p-3 rounded-2xl bg-slate-850/80 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-400 text-[10px]">
                          <span className="font-semibold text-slate-300">Connection #{comment.authorId}</span>
                          <span>{comment.createdAt}</span>
                        </div>
                        <p className="text-slate-200">{comment.content}</p>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a supportive reply..."
                        className="flex-1 bg-slate-900 text-xs text-slate-100 placeholder-slate-400 rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-brand-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-3.5 py-2 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}

              </article>
            );
          })
        ) : (
          <div className="glow-card rounded-3xl p-12 text-center text-xs text-slate-400">
            No posts found. Share your first discovery above!
          </div>
        )}
      </div>

    </div>
  );
};
