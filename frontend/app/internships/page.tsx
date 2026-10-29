'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../../services/api';
import { InternshipCard } from '../../components/InternshipCard';
import { FilterSidebar } from '../../components/FilterSidebar';
import { Internship } from '../../types';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

function InternshipListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || 'all');
  const [paidOnly, setPaidOnly] = useState(searchParams.get('paidOnly') === 'true');
  const [minStipend, setMinStipend] = useState(searchParams.get('minStipend') || '');
  const [duration, setDuration] = useState(searchParams.get('duration') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');

  // Load categories once
  useEffect(() => {
    api.getCategories().then((res) => {
      if (res.success && res.data) setCategories(res.data);
    });
  }, []);

  // Fetch listings on query change
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          page,
          limit: 10,
          sortBy,
        };
        if (search) params.search = search;
        if (category) params.category = category;
        if (location) params.location = location;
        if (workMode && workMode !== 'all') params.workMode = workMode;
        if (paidOnly) params.paidOnly = 'true';
        if (minStipend) params.minStipend = minStipend;
        if (duration) params.duration = duration;

        const res = await api.getInternships(params);
        if (res.success && res.data) {
          setInternships(res.data);
          if (res.meta) {
            setTotalPages(res.meta.totalPages || 1);
            setTotalCount(res.meta.total || 0);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [page, search, category, location, workMode, paidOnly, minStipend, duration, sortBy]);

  const handleFilterChange = (name: string, value: any) => {
    setPage(1);
    if (name === 'workMode') setWorkMode(value);
    if (name === 'category') setCategory(value);
    if (name === 'location') setLocation(value);
    if (name === 'paidOnly') setPaidOnly(value);
    if (name === 'minStipend') setMinStipend(value);
    if (name === 'duration') setDuration(value);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setWorkMode('all');
    setPaidOnly(false);
    setMinStipend('');
    setDuration('');
    setSortBy('newest');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header & Search Bar */}
      <div className="mb-8 space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy-950">Browse Internships</h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing <span className="font-semibold text-navy-900">{totalCount}</span> active verified opportunities
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by title, company name, or technology..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center justify-center gap-2 flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700"
            >
              <SlidersHorizontal className="w-4 h-4 text-primary-600" />
              Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="stipend_desc">Highest Stipend</option>
              <option value="stipend_asc">Lowest Stipend</option>
              <option value="deadline">Closing Soonest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside className={`${mobileFilterOpen ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
          <FilterSidebar
            filters={{ category, location, workMode, paidOnly, minStipend, duration }}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            categories={categories}
          />
        </aside>

        {/* Listings column */}
        <div className="lg:col-span-3 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white border border-slate-200 rounded-2xl p-6 h-48 animate-pulse space-y-4">
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  <div className="h-6 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-10 bg-slate-50 rounded"></div>
                </div>
              ))}
            </div>
          ) : internships.length > 0 ? (
            <div className="space-y-4">
              {internships.map((internship) => (
                <InternshipCard key={internship._id} internship={internship} />
              ))}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="pt-6 flex items-center justify-between border-t border-slate-200">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <span className="text-xs font-semibold text-slate-500">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Inbox className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">No Internships Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No opportunities matched your exact filter combination. Try clearing your filters or searching with broader keywords.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 px-4 py-2 rounded-xl bg-primary-600 text-white font-semibold text-xs hover:bg-primary-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InternshipListPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">Loading internships...</div>}>
      <InternshipListContent />
    </Suspense>
  );
}
