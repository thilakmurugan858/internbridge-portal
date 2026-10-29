'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '../../../services/api';
import { Company, Internship, Job } from '../../../types';
import { InternshipCard } from '../../../components/InternshipCard';
import { JobCard } from '../../../components/JobCard';
import { Building2, MapPin, Globe, ShieldCheck, ChevronLeft } from 'lucide-react';

export default function CompanyProfilePage() {
  const params = useParams();
  const identifier = String(params.id);

  const [company, setCompany] = useState<Company | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await api.getCompanyByIdentifier(identifier);
        if (res.success && res.data) {
          setCompany(res.data.company);
          setInternships(res.data.internships || []);
          setJobs(res.data.jobs || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [identifier]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 animate-pulse space-y-4">
        <div className="h-40 bg-white rounded-3xl"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-navy-900">Company Not Found</h2>
        <Link href="/companies" className="text-sm font-semibold text-primary-600">
          Back to company directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        href="/companies"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Companies
      </Link>

      {/* Company Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-2xl border border-primary-100">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-navy-950">{company.name}</h1>
                {company.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Partner
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">{company.industry}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{company.headquarters || 'Remote'}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed max-w-3xl pt-2">
          {company.description}
        </p>
      </div>

      {/* Opportunities Offered */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
          <h2 className="text-xl font-bold text-navy-950">
            Available Opportunities ({internships.length + jobs.length})
          </h2>
        </div>

        {internships.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Internships ({internships.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {internships.map((internship) => (
                <InternshipCard key={internship._id} internship={internship} />
              ))}
            </div>
          </div>
        )}

        {jobs.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Jobs ({jobs.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          </div>
        )}

        {internships.length === 0 && jobs.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
            No open listings currently available for this employer.
          </div>
        )}
      </div>
    </div>
  );
}
