'use client';

import React from 'react';
import Link from 'next/link';
import { PostingAllowance } from '../../types';
import { Users, AlertCircle, CheckCircle2, Sparkles, Clock, UserPlus } from 'lucide-react';

interface AllowanceBadgeProps {
  allowance: PostingAllowance | null;
  loading?: boolean;
}

export const AllowanceBadge: React.FC<AllowanceBadgeProps> = ({ allowance, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-slate-100 rounded w-2/3"></div>
      </div>
    );
  }

  if (!allowance) return null;

  const { acceptedFriends, dailyLimit, usedToday, remaining, allowed, isUnlimited } = allowance;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-navy-900">Posting Allowance</h3>
            <p className="text-xs text-slate-500">Based on accepted friends</p>
          </div>
        </div>

        {isUnlimited ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" /> Unlimited
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              allowed
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {remaining} left today
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Friends</p>
          <p className="text-lg font-bold text-navy-900 mt-0.5">{acceptedFriends}</p>
        </div>
        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Daily Limit</p>
          <p className="text-lg font-bold text-navy-900 mt-0.5">{isUnlimited ? '∞' : dailyLimit}</p>
        </div>
        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Used Today</p>
          <p className="text-lg font-bold text-navy-900 mt-0.5">{usedToday}</p>
        </div>
      </div>

      {/* Dynamic Status Banner */}
      {acceptedFriends === 0 ? (
        <div className="rounded-xl bg-amber-50/90 border border-amber-200 p-3.5 text-xs text-amber-900 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">Posting Locked (0 Friends)</p>
              <p className="text-amber-700 mt-0.5 leading-relaxed">
                Connect with at least 1 student or peer to unlock posting in Public Space.
              </p>
            </div>
          </div>
          <Link
            href="/public-space/discovery"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-xs shadow-sm transition"
          >
            <UserPlus className="w-3.5 h-3.5" /> Find & Add Friends
          </Link>
        </div>
      ) : !allowed ? (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Daily Limit Reached ({usedToday}/{dailyLimit})</p>
            <p className="mt-0.5 text-rose-700">
              Add more friends to expand your tier, or wait until midnight IST.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">
              {isUnlimited
                ? 'Unlimited Posting Active'
                : `You can publish ${remaining} more post${remaining === 1 ? '' : 's'} today.`}
            </p>
            <p className="text-emerald-700 mt-0.5">
              {acceptedFriends <= 1
                ? 'Tip: Add 1 more friend to increase your daily limit to 2!'
                : acceptedFriends <= 5
                ? 'Tip: Reach 6 friends to unlock 5 posts daily!'
                : acceptedFriends <= 10
                ? 'Tip: Reach 11 friends to unlock unlimited posts!'
                : 'Enjoy unlimited community engagement!'}
            </p>
          </div>
        </div>
      )}

      {/* Rules Explainer Accordion / Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" /> Resets daily at 00:00 IST
        </span>
        <Link
          href="/public-space/discovery"
          className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
        >
          Community Rules
        </Link>
      </div>
    </div>
  );
};
