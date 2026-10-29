'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Internship, Company } from '../../../types';
import { ApplyModal } from '../../../components/ApplyModal';
import { ReportModal } from '../../../components/ReportModal';
import {
  Building2,
  MapPin,
  Calendar,
  Banknote,
  Users,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Bookmark,
  Share2,
  Flag,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

export default function InternshipDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = String(params.id);

  const [internship, setInternship] = useState<Internship | null>(null);
  const [related, setRelated] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      setIsLoading(true);
      try {
        const res = await api.getInternshipById(id);
        if (res.success && res.data) {
          setInternship(res.data);

          // Fetch related in same category
          const relRes = await api.getInternships({
            category: res.data.category,
            limit: 3,
          });
          if (relRes.success && relRes.data) {
            setRelated(relRes.data.filter((item: Internship) => item._id !== id));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  const company = internship?.companyId as Company | undefined;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user || user.role !== 'student') {
      alert('Please log in as a student to bookmark opportunities.');
      return;
    }
    try {
      if (isSaved) {
        await api.unsaveOpportunity(id);
        setIsSaved(false);
      } else {
        await api.saveOpportunity(id, 'internship');
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 animate-pulse space-y-6">
          <div className="h-6 bg-slate-100 rounded w-1/4"></div>
          <div className="h-8 bg-slate-100 rounded w-2/3"></div>
          <div className="h-20 bg-slate-50 rounded"></div>
        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Internship Not Found</h2>
        <p className="text-slate-500 text-sm">
          This listing may have been closed or removed by the employer.
        </p>
        <Link
          href="/internships"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to all internships
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/internships"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Listings
        </Link>
      </div>

      {/* Main Listing Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                {internship.category}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                {internship.workMode.replace('_', ' ')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
              {internship.title}
            </h1>

            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <Building2 className="w-4 h-4 text-slate-400" />
              <Link
                href={`/companies/${company?.slug || internship.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="font-semibold text-primary-600 hover:underline"
              >
                {internship.companyName}
              </Link>
              {company?.verified && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Action CTAs: Bookmark & Share */}
          <div className="flex items-center gap-2 self-end sm:self-start">
            <button
              onClick={handleBookmarkToggle}
              title="Bookmark"
              className={`p-2.5 rounded-xl border transition ${
                isSaved
                  ? 'bg-primary-50 border-primary-300 text-primary-600'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-primary-600' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              title="Share"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Key Highlight Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
          <div>
            <span className="text-xs text-slate-400 block mb-1">STIPEND</span>
            <div className="flex items-center gap-1.5 font-bold text-navy-900 text-sm">
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span>₹{internship.stipend?.amount?.toLocaleString('en-IN')} / {internship.stipend?.period}</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1">LOCATION</span>
            <div className="flex items-center gap-1.5 font-bold text-navy-900 text-sm">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span>{internship.location}</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1">DURATION</span>
            <div className="flex items-center gap-1.5 font-bold text-navy-900 text-sm">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>{internship.durationWeeks} Weeks</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-400 block mb-1">APPLY BY</span>
            <div className="flex items-center gap-1.5 font-bold text-navy-900 text-sm">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{new Date(internship.deadline).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Meta Stats: Openings, views, applications */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 pt-2">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            <strong className="text-navy-900">{internship.openings}</strong> Openings
          </span>
          <span>
            <strong className="text-navy-900">{internship.applicationsCount || 0}</strong> Applicants
          </span>
          <span>
            Posted on {new Date(internship.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Apply CTA Bar */}
        <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-500">
            {hasApplied ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> You have already applied for this position.
              </span>
            ) : (
              <span>Actively reviewing applications. Fast candidate response within 48 hours.</span>
            )}
          </div>

          <button
            onClick={() => setIsApplyModalOpen(true)}
            disabled={hasApplied}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-primary-600/20 transition"
          >
            {hasApplied ? 'Applied' : 'Apply Now'}
          </button>
        </div>
      </div>

      {/* Detailed Description, Responsibilities, Requirements */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-8">
        {/* About the internship */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-navy-900">About the Internship</h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {internship.description}
          </p>
        </div>

        {/* Key Responsibilities */}
        {internship.responsibilities && internship.responsibilities.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-navy-900">Key Responsibilities</h2>
            <ul className="space-y-2">
              {internship.responsibilities.map((resp, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2 shrink-0"></div>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Required Skills */}
        {internship.skillsRequired && internship.skillsRequired.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-navy-900">Skill(s) Required</h2>
            <div className="flex flex-wrap gap-2">
              {internship.skillsRequired.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Eligibility Criteria */}
        {internship.eligibility && internship.eligibility.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-navy-900">Who can apply</h2>
            <ul className="space-y-2">
              {internship.eligibility.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Perks & Benefits */}
        {internship.perks && internship.perks.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-navy-900">Perks & Benefits</h2>
            <div className="flex flex-wrap gap-2">
              {internship.perks.map((perk, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-medium text-xs border border-emerald-200"
                >
                  {perk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Report Listing Trigger */}
        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1.5 transition"
          >
            <Flag className="w-3.5 h-3.5" />
            Report this listing for policy violation
          </button>
        </div>
      </div>

      {/* Modals */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          setHasApplied(true);
          setInternship((prev) => prev ? { ...prev, applicationsCount: prev.applicationsCount + 1 } : null);
        }}
        opportunityId={internship._id}
        opportunityTitle={internship.title}
        opportunityType="internship"
        companyName={internship.companyName}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        opportunityId={internship._id}
        opportunityTitle={internship.title}
        opportunityType="internship"
      />
    </div>
  );
}
