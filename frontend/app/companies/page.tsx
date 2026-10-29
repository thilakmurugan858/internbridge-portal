'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../services/api';
import { Company } from '../../types';
import { Building2, MapPin, Search, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const params: any = { limit: 20 };
        if (search) params.search = search;
        if (industry) params.industry = industry;

        const res = await api.getCompanies(params);
        if (res.success && res.data) {
          setCompanies(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [search, industry]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-navy-950">Top Hiring Companies</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore vetted tech startups, scale-ups, and enterprises offering internships
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none"
        >
          <option value="">All Industries</option>
          <option value="Software">Software & Technology</option>
          <option value="Cloud">Cloud & DevOps</option>
          <option value="Financial">Fintech & Banking</option>
          <option value="Artificial Intelligence">AI & Machine Learning</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white border border-slate-200 rounded-2xl p-6 h-48 animate-pulse space-y-4">
              <div className="h-6 bg-slate-100 rounded w-1/2"></div>
              <div className="h-12 bg-slate-50 rounded"></div>
            </div>
          ))}
        </div>
      ) : companies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((comp) => (
            <div
              key={comp._id}
              className="bg-white border border-slate-200 rounded-2xl p-6 card-hover flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-primary-600 font-bold">
                    <Building2 className="w-6 h-6 text-slate-400" />
                  </div>
                  {comp.verified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-base text-navy-900">{comp.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{comp.industry}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {comp.description}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{comp.headquarters || 'Remote'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-5 flex justify-between items-center text-xs">
                <span className="font-bold text-primary-600">
                  {comp.activeOpportunitiesCount || 0} Open Roles
                </span>

                <Link
                  href={`/companies/${comp.slug || comp._id}`}
                  className="inline-flex items-center gap-1 font-semibold text-navy-900 hover:text-primary-600 transition"
                >
                  View Profile
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-sm">
          No companies found matching your search.
        </div>
      )}
    </div>
  );
}
