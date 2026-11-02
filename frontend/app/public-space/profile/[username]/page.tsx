'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import { api } from '../../../../services/api';
import { CommunityProfile, Post } from '../../../../types';
import { FriendFollowActions } from '../../../../components/public-space/FriendFollowActions';
import { PostCard } from '../../../../components/public-space/PostCard';
import {
  MapPin,
  Calendar,
  CheckCircle,
  Users,
  MessageSquare,
  ArrowLeft,
  Bell,
  Sparkles,
} from 'lucide-react';

export default function UserCommunityProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'friends'>('posts');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.getCommunityProfile(username);
      if (res.success && res.data) {
        setProfile(res.data);
        // Also fetch user's posts
        const postsRes = await api.getCommunityFeed({ authorUsername: res.data.user.username });
        if (postsRes.success && postsRes.data) {
          const list = Array.isArray(postsRes.data) ? postsRes.data : (postsRes.data as any).posts || [];
          setPosts(list);
        }
      } else {
        setErrorMessage(res.message || 'User profile not found');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    if (!profile) return;
    try {
      const res = await api.getFriendsList(profile.user.id);
      if (res.success && res.data) {
        setFriendsList(res.data);
      }
    } catch {}
  };

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  useEffect(() => {
    if (activeTab === 'friends' && profile) {
      fetchFriends();
    }
  }, [activeTab, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10">
        <div className="max-w-4xl mx-auto px-4 animate-pulse space-y-6">
          <div className="h-44 bg-slate-200 rounded-3xl"></div>
          <div className="h-28 bg-white rounded-2xl p-6"></div>
        </div>
      </div>
    );
  }

  if (errorMessage || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto font-bold text-lg">
            !
          </div>
          <h2 className="text-lg font-bold text-navy-900">User Not Found</h2>
          <p className="text-xs text-slate-500">{errorMessage || 'The requested user profile does not exist.'}</p>
          <Link
            href="/public-space"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Space
          </Link>
        </div>
      </div>
    );
  }

  const { user, stats, relationship } = profile;

  return (
    <div className="min-h-screen bg-slate-50/70 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <Link
          href="/public-space"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-navy-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Feed
        </Link>

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Cover gradient */}
          <div className="h-32 sm:h-44 bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-700 relative"></div>

          <div className="px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white p-1.5 shadow-md shrink-0">
                <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name[0].toUpperCase()
                  )}
                </div>
              </div>

              {/* Actions */}
              {currentUser && (
                <div className="sm:mb-2">
                  <FriendFollowActions
                    targetUserId={user.id}
                    initialFriendshipStatus={relationship.friendshipStatus}
                    initialIsFollowing={relationship.isFollowing}
                    isSelf={relationship.isSelf}
                    onRelationshipChange={fetchProfile}
                  />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-navy-900">{user.name}</h1>
                  {user.isVerified && (
                    <span title="Verified Member">
                      <CheckCircle className="w-4 h-4 text-primary-600" />
                    </span>
                  )}
                  <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {user.role}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">@{user.username}</p>
              </div>

              {user.bio ? (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl">{user.bio}</p>
              ) : (
                <p className="text-xs text-slate-400 italic">No bio provided.</p>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1">
                {user.location && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {user.location}
                  </span>
                )}
                <span className="flex items-center gap-1 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Member since{' '}
                  {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Stats Metrics Row */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-6 pt-5 border-t border-slate-100 text-center">
              <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Friends</p>
                <p className="text-lg font-bold text-navy-900 mt-0.5">{stats.acceptedFriendCount}</p>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Followers</p>
                <p className="text-lg font-bold text-navy-900 mt-0.5">{stats.followersCount}</p>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Following</p>
                <p className="text-lg font-bold text-navy-900 mt-0.5">{stats.followingCount}</p>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Posts</p>
                <p className="text-lg font-bold text-navy-900 mt-0.5">{stats.postsCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'posts'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Posts ({stats.postsCount})
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'friends'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-navy-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Friends ({stats.acceptedFriendCount})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' ? (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
                {user.name} hasn't published any public posts yet.
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId={currentUser?.id}
                  onPostDeleted={(id) => setPosts(posts.filter((p) => p._id !== id))}
                />
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy-900">Accepted Friends ({friendsList.length})</h3>
            {friendsList.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No friends connected yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {friendsList.map((friend) => (
                  <div
                    key={friend._id}
                    className="p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50 flex items-center justify-between gap-3 transition"
                  >
                    <Link
                      href={`/public-space/profile/${friend.username}`}
                      className="flex items-center gap-2.5 overflow-hidden"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                        {friend.avatarUrl ? (
                          <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full object-cover" />
                        ) : (
                          friend.name[0].toUpperCase()
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-navy-900 truncate">{friend.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">@{friend.username}</p>
                      </div>
                    </Link>
                    <Link
                      href={`/public-space/profile/${friend.username}`}
                      className="text-xs font-semibold text-primary-600 hover:underline shrink-0"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
