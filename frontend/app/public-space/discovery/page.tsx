'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import { TrendingHashtag } from '../../../types';
import { FriendFollowActions } from '../../../components/public-space/FriendFollowActions';
import {
  Search,
  UserPlus,
  Users,
  TrendingUp,
  ArrowLeft,
  Check,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function CommunityDiscoveryPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [trendingTags, setTrendingTags] = useState<TrendingHashtag[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingPending, setLoadingPending] = useState(false);

  // Fetch pending requests & trending tags
  const fetchInitialData = async () => {
    if (user) {
      setLoadingPending(true);
      try {
        const res = await api.getPendingFriendRequests();
        if (res.success && res.data) {
          setPendingRequests(res.data);
        }
      } finally {
        setLoadingPending(false);
      }
    }

    try {
      const tagsRes = await api.getTrendingHashtags();
      if (tagsRes.success && tagsRes.data) {
        setTrendingTags(tagsRes.data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  // Search users
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoadingSearch(true);
    try {
      const res = await api.searchCommunityUsers(searchQuery.trim());
      if (res.success && res.data) {
        setSearchResults(res.data);
      }
    } finally {
      setLoadingSearch(false);
    }
  };

  // Respond to pending request
  const handleRespondRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const res = await api.respondFriendRequest(requestId, action);
      if (res.success) {
        setPendingRequests(pendingRequests.filter((r) => r._id !== requestId));
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <Link
          href="/public-space"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-navy-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Feed
        </Link>

        {/* Hero Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-navy-900">
                Community Discovery & Network
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Search students, alumni, and employers. Connect as friends to expand your daily posting allowance.
              </p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, skill, or @username (e.g. Aarav, Priya, react)..."
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={loadingSearch}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
            >
              {loadingSearch ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Pending Requests Section (if logged in) */}
        {user && pendingRequests.length > 0 && (
          <div className="bg-white rounded-3xl border border-amber-200/90 p-6 shadow-sm space-y-4 bg-amber-50/20">
            <div className="flex items-center justify-between pb-2 border-b border-amber-100">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" /> Pending Friend Requests ({pendingRequests.length})
              </h3>
              <span className="text-xs text-amber-800 font-medium">Accepting increases your daily posting limit!</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pendingRequests.map((req) => {
                const requester = req.requester;
                return (
                  <div
                    key={req._id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                  >
                    <Link
                      href={`/public-space/profile/${requester.username}`}
                      className="flex items-center gap-3 overflow-hidden"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-600 text-white font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden">
                        {requester.avatarUrl ? (
                          <img src={requester.avatarUrl} alt={requester.name} className="w-full h-full object-cover" />
                        ) : (
                          requester.name[0].toUpperCase()
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-navy-900 truncate">{requester.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">@{requester.username}</p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleRespondRequest(req._id, 'accept')}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleRespondRequest(req._id, 'reject')}
                        className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy-900">Search Results ({searchResults.length})</h3>
            <div className="divide-y divide-slate-100">
              {searchResults.map((resultUser) => (
                <div key={resultUser._id} className="py-3.5 flex items-center justify-between gap-4">
                  <Link
                    href={`/public-space/profile/${resultUser.username}`}
                    className="flex items-center gap-3 overflow-hidden"
                  >
                    <div className="w-11 h-11 rounded-full bg-primary-600 text-white font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden">
                      {resultUser.avatarUrl ? (
                        <img src={resultUser.avatarUrl} alt={resultUser.name} className="w-full h-full object-cover" />
                      ) : (
                        resultUser.name[0].toUpperCase()
                      )}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-navy-900 hover:underline truncate">
                          {resultUser.name}
                        </span>
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {resultUser.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">@{resultUser.username}</p>
                      {resultUser.bio && (
                        <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{resultUser.bio}</p>
                      )}
                    </div>
                  </Link>

                  {user && (
                    <FriendFollowActions
                      targetUserId={resultUser._id}
                      initialFriendshipStatus={resultUser.friendshipStatus || 'none'}
                      initialIsFollowing={resultUser.isFollowing || false}
                      isSelf={user.id === resultUser._id}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Hashtags Section */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-600" /> Popular Hashtags
            </h3>
            <span className="text-xs text-slate-400">Click to filter feed</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {trendingTags.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No hashtags active yet.</p>
            ) : (
              trendingTags.map((tag) => (
                <Link
                  key={tag.tag}
                  href={`/public-space`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 text-xs font-semibold text-navy-900 hover:text-primary-700 transition"
                >
                  <span>#{tag.tag}</span>
                  <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded-full border border-slate-100">
                    {tag.count}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Daily Friend Limit Business Rule Callout */}
        <div className="bg-gradient-to-r from-primary-50 via-indigo-50 to-purple-50 rounded-3xl border border-primary-200/70 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <h3 className="text-sm font-bold text-navy-900">How Daily Posting Limits Work</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            InternBridge community maintains anti-spam standards by anchoring your daily posting allowance to your verified network of accepted friends.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">0 Friends</span>
              <span className="font-bold text-navy-900 text-sm">0 posts/day</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">1 Friend</span>
              <span className="font-bold text-navy-900 text-sm">1 post/day</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">2–5 Friends</span>
              <span className="font-bold text-navy-900 text-sm">2 posts/day</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">6–10 Friends</span>
              <span className="font-bold text-navy-900 text-sm">5 posts/day</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-primary-600 block text-[10px] font-semibold uppercase">&gt;10 Friends</span>
              <span className="font-bold text-emerald-600 text-sm">Unlimited</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            *All daily post counts reset automatically at 00:00 IST every midnight.
          </p>
        </div>
      </div>
    </div>
  );
}
