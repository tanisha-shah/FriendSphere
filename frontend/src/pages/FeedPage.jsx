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
        <div className="p-3 bg-seafoam border border-teal-primary/30 rounded-lg text-xs text-teal-dark flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{shareNotice}</span>
        </div>
      )}

      {/* Feed Stream */}
      <div className="space-y-5">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glow-card rounded-xl p-6 h-64 animate-pulse bg-surface-sec" />
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
                className="glow-card rounded-xl p-5 sm:p-6 space-y-4 shadow-sm border border-border-subtle transition-all hover:border-border-subtle/80"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${author.id}`}>
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-11 h-11 rounded-lg object-cover border border-border-subtle hover:border-teal-primary transition-colors"
                      />
                    </Link>
                    <div>
                      <Link
                        to={`/profile/${author.id}`}
                        className="text-sm font-bold text-text-primary hover:text-teal-primary transition-colors flex items-center gap-1.5"
                      >
                        <span>{author.name}</span>
                        {author.activityScore > 85 && (
                          <span className="w-2 h-2 rounded-full bg-brand-400" title="Active Contributor" />
                        )}
                      </Link>
                      <p className="text-xs text-text-secondary">
                        {author.college || author.headline || author.location} • <span className="text-surface0">{post.createdAt}</span>
                      </p>
                    </div>
                  </div>

                  <button className="p-1.5 rounded-xl text-surface0 hover:text-text-primary hover:bg-surface transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Post Text Content */}
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Attached Image if available */}
                {post.imageUrl && (
                  <div className="rounded-lg overflow-hidden border border-border-subtle max-h-96 bg-bg">
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
                        className="px-2.5 py-0.5 rounded-lg bg-surface-sec text-teal-dark text-xs font-medium border border-border-subtle"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Footer Actions: Like, Comment, Share, Save */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-850 text-xs text-text-secondary">
                  <div className="flex items-center gap-6">
                    
                    {/* Like */}
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors group ${
                        isLiked ? 'text-text-secondary font-bold' : 'hover:text-text-secondary'
                      }`}
                    >
                      <Heart className={`w-4 h-4 transition-transform group-hover:scale-125 ${
                        isLiked ? 'fill-rose-500 text-text-secondary' : ''
                      }`} />
                      <span className="font-mono">{post.likes}</span>
                    </button>

                    {/* Comment */}
                    <button
                      onClick={() => setActiveCommentPostId(isCommentsOpen ? null : post.id)}
                      className="flex items-center gap-1.5 hover:text-teal-dark transition-colors group"
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
                      isSaved ? 'text-text-secondary' : 'hover:text-text-secondary'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                {/* Comments Thread */}
                {isCommentsOpen && (
                  <div className="pt-3 border-t border-border-subtle space-y-3 animate-in fade-in duration-150">
                    {post.comments?.map((comment) => (
                      <div key={comment.id} className="p-3 rounded-lg bg-surface-sec text-xs space-y-1">
                        <div className="flex items-center justify-between text-text-secondary text-[10px]">
                          <span className="font-semibold text-text-secondary">Connection #{comment.authorId}</span>
                          <span>{comment.createdAt}</span>
                        </div>
                        <p className="text-text-primary">{comment.content}</p>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a supportive reply..."
                        className="flex-1 bg-surface-sec text-xs text-text-primary placeholder-slate-400 rounded-xl px-3 py-2 border border-border-subtle focus:outline-none focus:border-teal-primary"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-3.5 py-2 rounded-xl bg-teal-primary text-surface font-bold text-xs"
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
          <div className="glow-card rounded-xl p-12 text-center text-xs text-text-secondary">
            No posts found. Share your first discovery above!
          </div>
        )}
      </div>

    </div>
  );
};
