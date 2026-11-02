'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Post, PostingAllowance, TrendingHashtag } from '../../types';
import { CreatePostCard } from '../../components/public-space/CreatePostCard';
import { PostCard } from '../../components/public-space/PostCard';
import { AllowanceBadge } from '../../components/public-space/AllowanceBadge';
import {
  Sparkles,
  Users,
  TrendingUp,
  Clock,
  Hash,
  Search,
  Bookmark,
  UserPlus,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export default function PublicSpacePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'friends' | 'trending' | 'recent'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [allowance, setAllowance] = useState<PostingAllowance | null>(null);
  const [trendingTags, setTrendingTags] = useState<TrendingHashtag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch allowance
  const fetchAllowance = async () => {
    if (!user) return;
    try {
      const res = await api.getPostingAllowance();
      if (res.success && res.data) {
        setAllowance(res.data);
      }
    } catch {}
  };

  // Fetch trending hashtags
  const fetchTrendingTags = async () => {
    try {
      const res = await api.getTrendingHashtags();
      if (res.success && res.data) {
        setTrendingTags(res.data);
      }
    } catch {}
  };

  // Fetch feed posts
  const fetchFeed = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const params: Record<string, any> = {
        tab: activeTab,
        page: pageNum,
        limit: 10,
      };
      if (selectedTag) params.hashtag = selectedTag;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.getCommunityFeed(params);
      if (res.success && res.data) {
        const fetchedPosts = Array.isArray(res.data) ? res.data : (res.data as any).posts || [];
        if (append) {
          setPosts((prev) => [...prev, ...fetchedPosts]);
        } else {
          setPosts(fetchedPosts);
        }
        setHasMore(fetchedPosts.length === 10);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchAllowance();
    fetchTrendingTags();
  }, [user]);

  useEffect(() => {
    setPage(1);
    fetchFeed(1, false);
  }, [activeTab, selectedTag]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchFeed(1, false);
  };

  const handlePostCreated = (newPost: Post, updatedAllowance: PostingAllowance) => {
    setPosts([newPost, ...posts]);
    setAllowance(updatedAllowance);
  };

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts(posts.filter((p) => p._id !== deletedPostId));
    fetchAllowance();
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage, true);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Search Banner */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-navy-900">
                Public <span className="text-primary-600">Space</span>
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-primary-100 text-primary-700 rounded-full">
                Community Feed
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Connect with peers, share career milestones, discuss internship opportunities, and build your network.
            </p>
          </div>

          {/* Search Bar & Quick Links */}
          <div className="flex items-center gap-2.5">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts or topics..."
                className="w-56 sm:w-64 pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>

            <Link
              href="/public-space/discovery"
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 text-primary-600" />
              <span className="hidden sm:inline">Find Peers</span>
            </Link>

            <Link
              href="/public-space/saved"
              className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-amber-600 rounded-xl shadow-sm transition"
              title="Saved Posts"
            >
              <Bookmark className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (3 cols) - Profile Quick View & Allowance */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-5">
            {user ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name[0].toUpperCase()
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-sm font-bold text-navy-900 truncate">{user.name}</h3>
                    <p className="text-xs text-slate-500 truncate">
                      @{user.username || user.email.split('@')[0]}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between text-xs">
                  <Link
                    href={`/public-space/profile/${user.username || user.id}`}
                    className="text-primary-600 font-semibold hover:underline"
                  >
                    View Community Profile →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm text-center space-y-3">
                <h3 className="text-sm font-bold text-navy-900">Join the Community</h3>
                <p className="text-xs text-slate-500">
                  Log in to create posts, add friends, like insights, and engage with students across India.
                </p>
                <div className="flex gap-2 justify-center pt-1">
                  <Link
                    href="/login"
                    className="px-4 py-1.5 text-xs font-semibold bg-primary-600 text-white rounded-xl shadow-sm hover:bg-primary-700 transition"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}

            {/* Allowance Badge */}
            {user && <AllowanceBadge allowance={allowance} />}

            {/* Navigation Shortcuts */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-1 text-xs">
              <Link
                href="/public-space/discovery"
                className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition font-medium"
              >
                <UserPlus className="w-4 h-4 text-primary-500" /> Discover Peers & Friends
              </Link>
              <Link
                href="/public-space/saved"
                className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-amber-600 transition font-medium"
              >
                <Bookmark className="w-4 h-4 text-amber-500" /> Saved Posts
              </Link>
            </div>
          </aside>

          {/* Center Column (6 cols) - Feed Tabs, Create Post, Posts */}
          <main className="lg:col-span-8 xl:col-span-6 space-y-5">
            {/* Feed Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-1.5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'all'
                      ? 'bg-primary-50 text-primary-700 shadow-xs'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> For You
                </button>

                <button
                  onClick={() => setActiveTab('friends')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'friends'
                      ? 'bg-primary-50 text-primary-700 shadow-xs'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> Friends Only
                </button>

                <button
                  onClick={() => setActiveTab('trending')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'trending'
                      ? 'bg-primary-50 text-primary-700 shadow-xs'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" /> Trending
                </button>

                <button
                  onClick={() => setActiveTab('recent')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'recent'
                      ? 'bg-primary-50 text-primary-700 shadow-xs'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" /> Recent
                </button>
              </div>

              <button
                onClick={() => fetchFeed(1, false)}
                title="Refresh feed"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Active Tag Filter Indicator */}
            {selectedTag && (
              <div className="flex items-center justify-between px-4 py-2 bg-primary-50 border border-primary-200 rounded-xl text-xs text-primary-800">
                <span className="flex items-center gap-1 font-semibold">
                  <Hash className="w-3.5 h-3.5" /> Filtering by #{selectedTag}
                </span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="font-bold hover:underline"
                >
                  Clear filter ×
                </button>
              </div>
            )}

            {/* Create Post Card */}
            {user && (
              <CreatePostCard
                allowance={allowance}
                onPostCreated={handlePostCreated}
                currentUserAvatar={user.avatarUrl}
                currentUserName={user.name}
              />
            )}

            {/* Posts Feed */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm animate-pulse space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      <div className="space-y-1 flex-1">
                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/6"></div>
                      </div>
                    </div>
                    <div className="h-14 bg-slate-100 rounded"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-navy-900">No posts in this feed yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {activeTab === 'friends'
                    ? 'None of your accepted friends have posted yet. Connect with more peers or switch to the For You tab.'
                    : 'Be the first to start a conversation in this section!'}
                </p>
                {activeTab === 'friends' && (
                  <Link
                    href="/public-space/discovery"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold shadow-sm hover:bg-primary-700 transition"
                  >
                    <UserPlus className="w-4 h-4" /> Find Friends
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUserId={user?.id}
                    onPostDeleted={handlePostDeleted}
                    onHashtagClick={(tag) => setSelectedTag(tag)}
                  />
                ))}

                {hasMore && (
                  <div className="text-center pt-2">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-6 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition disabled:opacity-50"
                    >
                      {loadingMore ? 'Loading more posts...' : 'Load More Posts'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Right Column (3 cols) - Trending Hashtags & Rules */}
          <aside className="hidden xl:block xl:col-span-3 space-y-5">
            {/* Trending Hashtags */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-primary-600" /> Trending Topics
                </h3>
              </div>

              {trendingTags.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No active hashtags yet.</p>
              ) : (
                <div className="space-y-2">
                  {trendingTags.map((tag) => (
                    <button
                      key={tag.tag}
                      onClick={() => setSelectedTag(tag.tag)}
                      className={`w-full text-left p-2 rounded-xl transition flex items-center justify-between text-xs ${
                        selectedTag === tag.tag
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="font-medium text-navy-900">#{tag.tag}</span>
                      <span className="text-[11px] text-slate-400">{tag.count} posts</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Community Standards Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3 text-xs text-slate-600">
              <h4 className="font-bold text-navy-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Community Guidelines
              </h4>
              <ul className="space-y-2 text-[11px] text-slate-500 leading-relaxed">
                <li>• Respect peers, recruiters, and fellow applicants.</li>
                <li>• Keep job recommendations and hiring referrals honest.</li>
                <li>• Daily post limits protect against spam and encourage quality.</li>
                <li>• Tag users with @username and topics with #hashtags.</li>
              </ul>
              <div className="pt-2 border-t border-slate-100">
                <Link
                  href="/public-space/discovery"
                  className="text-primary-600 hover:underline font-medium block text-[11px]"
                >
                  Explore community directory →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
