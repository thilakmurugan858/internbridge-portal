'use client';

import React from 'react';
import Link from 'next/link';
import { Job } from '../types';
import {
  MapPin,
  Briefcase,
  Banknote,
  Building,
  ChevronRight,
  Clock,
} from 'lucide-react';

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const formatSalary = () => {
    const { salary } = job;
    if (!salary || (!salary.min && !salary.max)) return 'Competitive';
    return `₹${(salary.min / 100000).toFixed(1)}L - ₹${(salary.max / 100000).toFixed(1)}L / ${salary.period}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 card-hover flex flex-col justify-between group">
      <div>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {job.jobType.replace('_', ' ')}
          </span>
          <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded border capitalize bg-slate-100 text-slate-700 border-slate-200">
            {job.workMode.replace('_', ' ')}
          </span>
        </div>

        <Link href={`/jobs/${job._id}`}>
          <h3 className="text-lg font-bold text-navy-900 group-hover:text-primary-600 transition line-clamp-1">
            {job.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
          <Building className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-medium">{job.companyName}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 py-3 border-y border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{job.experienceYearsMin === 0 ? 'Fresher (0 yrs)' : `${job.experienceYearsMin}+ yrs`}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
            <Banknote className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-navy-900">{formatSalary()}</span>
          </div>
        </div>

        {job.skillsRequired && job.skillsRequired.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skillsRequired.slice(0, 4).map((skill, i) => (
              <span
                key={i}
                className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Apply before {new Date(job.deadline).toLocaleDateString()}
        </span>

        <Link
          href={`/jobs/${job._id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition"
        >
          View Job
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
