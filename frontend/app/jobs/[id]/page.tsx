'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '../../../services/api';
import { Job, Company } from '../../../types';
import { ApplyModal } from '../../../components/ApplyModal';
import { ReportModal } from '../../../components/ReportModal';
import {
  Building2,
  MapPin,
  Banknote,
  Briefcase,
  Clock,
  CheckCircle2,
  ChevronLeft,
  Users,
  Flag,
} from 'lucide-react';

export default function JobDetailsPage() {
  const params = useParams();
  const id = String(params.id);

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      setIsLoading(true);
      try {
        const res = await api.getJobById(id);
        if (res.success && res.data) {
          setJob(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadJob();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 animate-pulse space-y-4">
          <div className="h-6 bg-slate-100 rounded w-1/3"></div>
          <div className="h-8 bg-slate-100 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-navy-900">Job Listing Not Found</h2>
        <Link href="/jobs" className="text-primary-600 font-semibold text-sm">
          Back to all jobs
        </Link>
      </div>
    );
  }

  const formatSalary = () => {
    const { salary } = job;
    if (!salary || (!salary.min && !salary.max)) return 'Competitive Compensation';
    return `₹${(salary.min / 100000).toFixed(1)}L - ₹${(salary.max / 100000).toFixed(1)}L / ${salary.period}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {job.jobType.replace('_', ' ')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950">{job.title}</h1>
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-primary-600">{job.companyName}</span>
            </div>
          </div>

          <button
            onClick={() => setIsApplyModalOpen(true)}
            disabled={hasApplied}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-sm shadow transition"
          >
            {hasApplied ? 'Applied' : 'Apply For Job'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">SALARY</span>
            <div className="flex items-center gap-1.5 font-bold text-navy-900">
              <Banknote className="w-4 h-4 text-emerald-600" />
              <span>{formatSalary()}</span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">LOCATION</span>
            <div className="flex items-center gap-1.5 font-bold text-navy-900">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span>{job.location}</span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">EXPERIENCE</span>
            <div className="flex items-center gap-1.5 font-bold text-navy-900">
              <Briefcase className="w-4 h-4 text-purple-600" />
              <span>{job.experienceYearsMin === 0 ? 'Fresher (0 yrs)' : `${job.experienceYearsMin}+ yrs`}</span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">APPLY BY</span>
            <div className="flex items-center gap-1.5 font-bold text-navy-900">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{new Date(job.deadline).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-navy-900">Job Description</h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {job.responsibilities && job.responsibilities.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-navy-900">Responsibilities</h2>
            <ul className="space-y-2">
              {job.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2 shrink-0"></div>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {job.skillsRequired && job.skillsRequired.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-navy-900">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1.5 transition"
          >
            <Flag className="w-3.5 h-3.5" />
            Report listing
          </button>
        </div>
      </div>

      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => setHasApplied(true)}
        opportunityId={job._id}
        opportunityTitle={job.title}
        opportunityType="job"
        companyName={job.companyName}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        opportunityId={job._id}
        opportunityTitle={job.title}
        opportunityType="job"
      />
    </div>
  );
}
