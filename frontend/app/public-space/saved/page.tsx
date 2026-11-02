'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import { Post } from '../../../types';
import { PostCard } from '../../../components/public-space/PostCard';
import { Bookmark, ArrowLeft, MessageSquare } from 'lucide-react';

export default function SavedPostsPage() {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedPosts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getSavedPosts();
      if (res.success && res.data) {
        setSavedPosts(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50/70 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation & Title */}
        <div className="flex items-center justify-between">
          <Link
            href="/public-space"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-navy-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Feed
          </Link>
          <span className="text-xs text-slate-500 font-medium">
            {savedPosts.length} saved post{savedPosts.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Bookmark className="w-5 h-5 fill-amber-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-navy-900">Saved Posts</h1>
            <p className="text-xs text-slate-500">
              Your personal library of bookmarked community posts, hiring advice, and career tips.
            </p>
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-16 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : savedPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-navy-900">No saved posts yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Bookmark useful posts from the community feed to revisit career tips, study resources, and opportunities later.
            </p>
            <div className="pt-2">
              <Link
                href="/public-space"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <MessageSquare className="w-4 h-4" /> Explore Feed
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {savedPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={user?.id}
                onPostDeleted={(id) => setSavedPosts(savedPosts.filter((p) => p._id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
