'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '../../services/api';
import { CommunityNotification } from '../../types';
import {
  Bell,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  UserCheck,
  AtSign,
  Check,
  CheckCheck,
} from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<CommunityNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.getCommunityNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.slice(0, 8));
        setUnreadCount(res.data.filter((n: CommunityNotification) => !n.isRead).length);
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.markCommunityNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllCommunityNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const getIcon = (type: CommunityNotification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 text-primary-500" />;
      case 'share':
        return <Share2 className="w-3.5 h-3.5 text-indigo-500" />;
      case 'friend_request':
        return <UserPlus className="w-3.5 h-3.5 text-amber-500" />;
      case 'friend_accept':
        return <UserCheck className="w-3.5 h-3.5 text-emerald-500" />;
      case 'mention':
        return <AtSign className="w-3.5 h-3.5 text-violet-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-500" />;
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
        return `${senderName} shared your post.`;
      case 'friend_request':
        return `${senderName} sent you a friend request.`;
      case 'friend_accept':
        return `${senderName} accepted your friend request!`;
      case 'mention':
        return `${senderName} mentioned you in a post.`;
      default:
        return 'You have a new notification.';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-xl transition"
        title="Community Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-navy-900">Notifications</h4>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3 hover:bg-slate-50 flex items-start gap-3 transition ${
                    !n.isRead ? 'bg-primary-50/30' : ''
                  }`}
                >
                  <div className="mt-0.5 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="text-slate-800 leading-snug">{getMessage(n)}</p>
                    {n.postContentSnippet && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                        "{n.postContentSnippet}"
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 mt-1 inline-block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(n._id, e)}
                      title="Mark as read"
                      className="p-1 text-slate-400 hover:text-primary-600 rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="pt-2 px-4 border-t border-slate-100 text-center">
            <Link
              href="/public-space/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline block py-1"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
