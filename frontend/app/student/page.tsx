'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Application } from '../../types';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  Ban,
  User,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Inbox,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!authLoading && user && user.role !== 'student') {
      router.push('/employer');
      return;
    }

    const loadApplications = async () => {
      try {
        const res = await api.getMyApplications();
        if (res.success && res.data) {
          setApplications(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadApplications();
    }
  }, [user, authLoading, router]);

  const handleWithdraw = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw this application? This cannot be undone.')) {
      return;
    }
    try {
      const res = await api.withdrawApplication(appId);
      if (res.success) {
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: 'withdrawn' } : app))
        );
      } else {
        alert(res.message || 'Failed to withdraw application.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Applied</span>;
      case 'in_review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">In Review</span>;
      case 'shortlisted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">Shortlisted</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Accepted 🎉</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">Not Selected</span>;
      case 'withdrawn':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">Withdrawn</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Welcome Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Student Dashboard
          </span>
          <h1 className="text-2xl font-extrabold text-navy-950 mt-1">Hello, {user?.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track applications, monitor recruiter reviews, and keep your profile updated
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/student/saved"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
          >
            <Bookmark className="w-4 h-4 text-slate-400" />
            Saved Roles
          </Link>
          <Link
            href="/student/profile"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-xs hover:bg-primary-700 transition"
          >
            <User className="w-4 h-4" />
            Edit Profile & Resume
          </Link>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-navy-950">
            My Applications ({applications.length})
          </h2>
          <Link
            href="/internships"
            className="text-xs font-semibold text-primary-600 hover:underline"
          >
            Find more internships &rarr;
          </Link>
        </div>

        {applications.length > 0 ? (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 card-hover flex flex-col sm:flex-row justify-between sm:items-center gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 capitalize">
                      {app.opportunityType}
                    </span>
                    {getStatusBadge(app.status)}
                  </div>

                  <h3 className="font-bold text-base text-navy-950">
                    {app.opportunity?.title || 'Position Title'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {(app.companyId as any)?.name || 'Company Partner'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {app.statusHistory && app.statusHistory.length > 0 && app.statusHistory[app.statusHistory.length - 1].note && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <strong className="text-navy-900">Latest update:</strong> {app.statusHistory[app.statusHistory.length - 1].note}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <Link
                    href={`/${app.opportunityType === 'job' ? 'jobs' : 'internships'}/${app.opportunityId}`}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition"
                  >
                    View Listing
                  </Link>

                  {app.status !== 'withdrawn' && app.status !== 'rejected' && app.status !== 'accepted' && (
                    <button
                      onClick={() => handleWithdraw(app._id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 border border-red-100 hover:bg-red-50 transition"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-navy-900">No applications submitted yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven&apos;t applied to any opportunities so far. Browse active internships and apply with your profile!
            </p>
            <Link
              href="/internships"
              className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-xs hover:bg-primary-700 transition"
            >
              Discover Internships
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
