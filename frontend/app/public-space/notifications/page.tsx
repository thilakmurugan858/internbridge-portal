'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import { CommunityNotification } from '../../../types';
import {
  Bell,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  UserCheck,
  AtSign,
  CheckCheck,
  Check,
  ArrowLeft,
} from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'friends' | 'interactions'>('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getCommunityNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markCommunityNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllCommunityNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'friends') {
      return n.type === 'friend_request' || n.type === 'friend_accept';
    }
    if (filter === 'interactions') {
      return ['like', 'comment', 'share', 'mention'].includes(n.type);
    }
    return true;
  });

  const getIcon = (type: CommunityNotification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-primary-500" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-indigo-500" />;
      case 'friend_request':
        return <UserPlus className="w-4 h-4 text-amber-500" />;
      case 'friend_accept':
        return <UserCheck className="w-4 h-4 text-emerald-500" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-violet-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const getMessage = (n: CommunityNotification) => {
    const senderName = n.sender?.name || 'Someone';
    switch (n.type) {
      case 'like':
        return `${senderName} liked your post.`;
      case 'comment':
        return `${senderName} commented on your post.`;
      case 'share':
        return `${senderName} shared your post to the community.`;
      case 'friend_request':
        return `${senderName} sent you a friend request.`;
      case 'friend_accept':
        return `${senderName} accepted your friend request! You can now view their friend-only updates.`;
      case 'mention':
        return `${senderName} mentioned you in a post.`;
      default:
        return 'You have a new update.';
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50/70 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/public-space"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-navy-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Feed
          </Link>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" /> Mark all as read
            </button>
          )}
        </div>

        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-navy-900">Notifications Center</h1>
              <p className="text-xs text-slate-500">
                Track reactions, comments, friend requests, and mentions across InternBridge.
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
              {unreadCount} unread
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Updates ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('friends')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'friends'
                ? 'bg-primary-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Friend Requests
          </button>
          <button
            onClick={() => setFilter('interactions')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'interactions'
                ? 'bg-primary-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Likes & Comments
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm animate-pulse flex gap-3">
                <div className="w-9 h-9 bg-slate-200 rounded-full"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-navy-900">No notifications here</h3>
            <p className="text-xs text-slate-400">You're all caught up!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {filteredNotifications.map((n) => (
              <div
                key={n._id}
                className={`p-4 flex items-start gap-3.5 transition hover:bg-slate-50 ${
                  !n.isRead ? 'bg-primary-50/25' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 text-xs">
                  <p className="text-navy-900 font-medium leading-relaxed">{getMessage(n)}</p>
                  {n.postContentSnippet && (
                    <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">
                      "{n.postContentSnippet}"
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                    <span>
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {n.sender?.username && (
                      <Link
                        href={`/public-space/profile/${n.sender.username}`}
                        className="text-primary-600 hover:underline font-semibold"
                      >
                        View Profile
                      </Link>
                    )}
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n._id)}
                    className="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-slate-100 transition shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
