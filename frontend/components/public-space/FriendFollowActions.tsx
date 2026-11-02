'use client';

import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Check,
  X,
  BellRing,
  BellOff,
} from 'lucide-react';

interface FriendFollowActionsProps {
  targetUserId: string;
  initialFriendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected';
  initialIsFollowing: boolean;
  isSelf: boolean;
  onRelationshipChange?: () => void;
}

export const FriendFollowActions: React.FC<FriendFollowActionsProps> = ({
  targetUserId,
  initialFriendshipStatus,
  initialIsFollowing,
  isSelf,
  onRelationshipChange,
}) => {
  const [friendshipStatus, setFriendshipStatus] = useState(initialFriendshipStatus);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (isSelf) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
        You
      </span>
    );
  }

  // Handle Send Friend Request
  const handleSendFriendRequest = async () => {
    setLoadingAction('friend');
    try {
      const res = await api.sendFriendRequest(targetUserId);
      if (res.success) {
        setFriendshipStatus('pending_sent');
        onRelationshipChange?.();
      }
    } finally {
      setLoadingAction(null);
    }
  };

  // Handle Cancel Friend Request
  const handleCancelFriendRequest = async () => {
    setLoadingAction('friend');
    try {
      const res = await api.cancelFriendRequest(targetUserId);
      if (res.success) {
        setFriendshipStatus('none');
        onRelationshipChange?.();
      }
    } finally {
      setLoadingAction(null);
    }
  };

  // Handle Respond (Accept / Reject)
  const handleRespond = async (action: 'accept' | 'reject') => {
    setLoadingAction(`respond_${action}`);
    try {
      const res = await api.respondFriendRequest(targetUserId, action);
      if (res.success) {
        setFriendshipStatus(action === 'accept' ? 'accepted' : 'none');
        onRelationshipChange?.();
      }
    } finally {
      setLoadingAction(null);
    }
  };

  // Handle Remove Friend
  const handleRemoveFriend = async () => {
    if (!window.confirm('Are you sure you want to remove this friend? Your posting limit may be affected.')) return;
    setLoadingAction('friend');
    try {
      const res = await api.removeFriend(targetUserId);
      if (res.success) {
        setFriendshipStatus('none');
        onRelationshipChange?.();
      }
    } finally {
      setLoadingAction(null);
    }
  };

  // Handle Follow / Unfollow
  const handleToggleFollow = async () => {
    setLoadingAction('follow');
    const nextState = !isFollowing;
    setIsFollowing(nextState);

    try {
      if (nextState) {
        await api.followUser(targetUserId);
      } else {
        await api.unfollowUser(targetUserId);
      }
      onRelationshipChange?.();
    } catch {
      setIsFollowing(!nextState);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Friend Action Button */}
      {friendshipStatus === 'none' || friendshipStatus === 'rejected' ? (
        <button
          onClick={handleSendFriendRequest}
          disabled={loadingAction === 'friend'}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition disabled:opacity-50"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Friend</span>
        </button>
      ) : friendshipStatus === 'pending_sent' ? (
        <button
          onClick={handleCancelFriendRequest}
          disabled={loadingAction === 'friend'}
          title="Click to cancel request"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition disabled:opacity-50"
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Request Sent</span>
        </button>
      ) : friendshipStatus === 'pending_received' ? (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleRespond('accept')}
            disabled={!!loadingAction}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" /> Accept
          </button>
          <button
            onClick={() => handleRespond('reject')}
            disabled={!!loadingAction}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" /> Reject
          </button>
        </div>
      ) : friendshipStatus === 'accepted' ? (
        <button
          onClick={handleRemoveFriend}
          disabled={loadingAction === 'friend'}
          title="Click to remove friend"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-rose-50 text-emerald-700 hover:text-rose-700 border border-emerald-200 hover:border-rose-200 transition group"
        >
          <UserCheck className="w-3.5 h-3.5 group-hover:hidden" />
          <UserX className="w-3.5 h-3.5 hidden group-hover:inline" />
          <span className="group-hover:hidden">Friends</span>
          <span className="hidden group-hover:inline">Unfriend</span>
        </button>
      ) : null}

      {/* Follow Action Button */}
      <button
        onClick={handleToggleFollow}
        disabled={loadingAction === 'follow'}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
          isFollowing
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
        }`}
      >
        {isFollowing ? (
          <>
            <BellOff className="w-3.5 h-3.5 text-slate-500" />
            <span>Following</span>
          </>
        ) : (
          <>
            <BellRing className="w-3.5 h-3.5 text-primary-600" />
            <span>Follow</span>
          </>
        )}
      </button>
    </div>
  );
};
