'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Users,
  Briefcase,
  AlertTriangle,
  Building,
  CheckCircle,
  XCircle,
  Flag,
  FileCheck,
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'users'>('reports');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!authLoading && user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const loadAdminData = async () => {
      try {
        const [statsRes, reportsRes, usersRes] = await Promise.all([
          api.getAdminStats(),
          api.getAdminReports({ status: 'pending' }),
          api.getAdminUsers({ limit: 20 }),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (reportsRes.success) setReports(reportsRes.data || []);
        if (usersRes.success) setUsersList(usersRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      loadAdminData();
    }
  }, [user, authLoading, router]);

  const handleResolveReport = async (reportId: string, action: string) => {
    const notes = prompt('Enter resolution note:');
    if (notes === null) return;

    try {
      const res = await api.resolveReport(reportId, {
        status: 'resolved',
        actionTaken: action,
        resolutionNotes: notes,
      });

      if (res.success) {
        alert(`Report resolved with action: ${action}`);
        setReports((prev) => prev.filter((r) => r._id !== reportId));
      } else {
        alert(res.message || 'Failed to resolve report.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred.');
    }
  };

  if (authLoading || isLoading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-400">Loading admin panel...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-navy-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-purple-300 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            Platform Trust & Moderation
          </span>
          <h1 className="text-2xl font-bold mt-1">Administrator Control Center</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Audit reported listings, manage platform integrity, and review safety metrics
          </p>
        </div>
      </div>

      {/* Platform Statistics */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
            <div className="text-2xl font-bold text-navy-900 mt-1">{stats.totalUsers}</div>
            <p className="text-[11px] text-slate-500">{stats.totalStudents} students, {stats.totalEmployers} recruiters</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Internships</span>
            <div className="text-2xl font-bold text-navy-900 mt-1">{stats.totalInternships}</div>
            <p className="text-[11px] text-slate-500">Live published roles</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Applications</span>
            <div className="text-2xl font-bold text-navy-900 mt-1">{stats.totalApplications}</div>
            <p className="text-[11px] text-slate-500">Total candidate submissions</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Pending Reports</span>
            <div className="text-2xl font-bold text-navy-900 mt-1">{stats.pendingReports}</div>
            <p className="text-[11px] text-slate-500">Requires review</p>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'reports'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          Flagged Listing Reports ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          Registered Users ({usersList.length})
        </button>
      </div>

      {/* Tab 1: Reports Moderation */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((rep) => (
              <div
                key={rep._id}
                className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-200">
                        {rep.reason.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 capitalize">Type: {rep.opportunityType}</span>
                    </div>

                    <h3 className="text-base font-bold text-navy-950 mt-1">
                      {rep.opportunity?.title || 'Reported Opportunity'}
                    </h3>
                    <p className="text-xs text-slate-500">Company: {rep.opportunity?.companyName}</p>
                  </div>

                  <span className="text-xs text-slate-400">
                    Reported on {new Date(rep.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl text-xs text-slate-700 border border-slate-100">
                  <strong className="block text-navy-900 mb-0.5">Reporter&apos;s Detail:</strong>
                  {rep.details}
                </div>

                <div className="pt-2 flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => handleResolveReport(rep._id, 'none')}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Dismiss (False Alarm)
                  </button>
                  <button
                    onClick={() => handleResolveReport(rep._id, 'warning_issued')}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100"
                  >
                    Issue Warning
                  </button>
                  <button
                    onClick={() => handleResolveReport(rep._id, 'listing_removed')}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                  >
                    Remove / Disable Listing
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-sm">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              No pending reports. Moderation queue is clear!
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Verified</th>
                <th className="p-4 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {usersList.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <p className="font-bold text-navy-950">{u.name}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="p-4 capitalize font-semibold">{u.role}</td>
                  <td className="p-4">
                    {u.isVerified ? (
                      <span className="text-emerald-600 font-bold">Yes</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
