'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Application, Internship } from '../../types';
import {
  Briefcase,
  Users,
  PlusCircle,
  Clock,
  ExternalLink,
  CheckCircle,
  XCircle,
  FileText,
  Building2,
  AlertCircle,
  Mail,
} from 'lucide-react';

export default function EmployerDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'applicants' | 'listings'>('applicants');
  const [applications, setApplications] = useState<Application[]>([]);
  const [listings, setListings] = useState<Internship[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!authLoading && user && user.role !== 'employer' && user.role !== 'admin') {
      router.push('/student');
      return;
    }

    const loadEmployerData = async () => {
      try {
        const [appsRes, internshipsRes] = await Promise.all([
          api.getEmployerApplications({ status: statusFilter !== 'all' ? statusFilter : undefined }),
          api.getInternships({ limit: 50 }),
        ]);

        if (appsRes.success && appsRes.data) {
          setApplications(appsRes.data);
        }
        if (internshipsRes.success && internshipsRes.data) {
          // Filter listings created by this employer
          setListings(internshipsRes.data.filter((l: any) => l.employerId === user?.id || user?.role === 'admin'));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadEmployerData();
    }
  }, [user, authLoading, router, statusFilter]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setUpdatingAppId(appId);
    try {
      const res = await api.updateApplicationStatus(appId, newStatus, `Recruiter updated status to ${newStatus}`);
      if (res.success) {
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: newStatus as any } : app))
        );
      } else {
        alert(res.message || 'Status update failed.');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    } finally {
      setUpdatingAppId(null);
    }
  };

  const handleArchiveListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to close and archive this listing?')) return;
    try {
      const res = await api.deleteInternship(listingId);
      if (res.success) {
        setListings((prev) => prev.filter((l) => l._id !== listingId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || isLoading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-400">Loading employer dashboard...</div>;
  }

  const shortlistedCount = applications.filter((a) => a.status === 'shortlisted').length;
  const inReviewCount = applications.filter((a) => a.status === 'in_review').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Recruiter Control Center
          </span>
          <h1 className="text-2xl font-extrabold text-navy-950 mt-1">Hiring Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage candidate applications, screen resumes, and publish opportunities
          </p>
        </div>

        <Link
          href="/employer/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-600/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Publish New Opportunity
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Candidates
          </span>
          <div className="text-2xl font-bold text-navy-900">{applications.length}</div>
          <p className="text-[11px] text-slate-500">Across all published listings</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
            Pending Review
          </span>
          <div className="text-2xl font-bold text-navy-900">{inReviewCount}</div>
          <p className="text-[11px] text-slate-500">Candidates awaiting initial evaluation</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
            Shortlisted Candidates
          </span>
          <div className="text-2xl font-bold text-navy-900">{shortlistedCount}</div>
          <p className="text-[11px] text-slate-500">Moved to interview stages</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          onClick={() => setActiveTab('applicants')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'applicants'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          Applicant Pipeline ({applications.length})
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'listings'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          Active Listings ({listings.length})
        </button>
      </div>

      {/* Tab 1: Applicant Pipeline */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500">
              Filter by Pipeline Stage:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="applied">Applied (New)</option>
              <option value="in_review">In Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app: any) => (
                <div
                  key={app._id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-navy-950">
                          {app.studentId?.name || 'Applicant'}
                        </h3>
                        <span className="text-xs text-slate-400">({app.studentId?.email})</span>
                      </div>
                      <p className="text-xs text-primary-600 font-medium mt-0.5">
                        Applied for: <strong>{app.opportunity?.title || 'Internship Position'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Stage:</span>
                      <select
                        value={app.status}
                        disabled={updatingAppId === app._id || app.status === 'withdrawn'}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className="text-xs font-bold border border-slate-300 rounded-xl px-3 py-1.5 bg-slate-50 text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="applied">Applied</option>
                        <option value="in_review">In Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Candidate Headline & Skills */}
                  {app.studentProfile && (
                    <div className="space-y-2">
                      {app.studentProfile.headline && (
                        <p className="text-xs text-slate-600 italic">
                          &ldquo;{app.studentProfile.headline}&rdquo;
                        </p>
                      )}
                      {app.studentProfile.skills && app.studentProfile.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {app.studentProfile.skills.map((s: string, i: number) => (
                            <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cover Letter */}
                  {app.coverLetter && (
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                      <strong className="block text-navy-900 mb-1">Candidate Statement / Cover Letter:</strong>
                      {app.coverLetter}
                    </div>
                  )}

                  {/* Resume & Profile Action */}
                  <div className="flex items-center gap-4 text-xs pt-1">
                    {app.resumeUrl ? (
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-primary-600 hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        View Attached Resume &rarr;
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No resume URL attached</span>
                    )}

                    <span className="text-slate-400">
                      Submitted on {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-sm">
              No applications in this pipeline stage yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Published Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {listings.length > 0 ? (
            <div className="space-y-3">
              {listings.map((l) => (
                <div
                  key={l._id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {l.status}
                      </span>
                      <span className="text-xs text-slate-400">({l.category})</span>
                    </div>
                    <h3 className="font-bold text-base text-navy-950">{l.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{l.location} ({l.workMode})</span>
                      <span>₹{l.stipend?.amount?.toLocaleString()} / month</span>
                      <span><strong>{l.applicationsCount || 0}</strong> Applications</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/internships/${l._id}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View Public
                    </Link>
                    <button
                      onClick={() => handleArchiveListing(l._id)}
                      className="px-3 py-1.5 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Close / Archive
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <p className="text-sm text-slate-500">You haven&apos;t published any listings yet.</p>
              <Link
                href="/employer/create"
                className="inline-block px-4 py-2 rounded-xl bg-primary-600 text-white font-semibold text-xs"
              >
                Create First Listing
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
