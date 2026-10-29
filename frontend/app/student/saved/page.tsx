'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import { InternshipCard } from '../../../components/InternshipCard';
import { JobCard } from '../../../components/JobCard';
import { ChevronLeft, Bookmark, Inbox } from 'lucide-react';

export default function SavedOpportunitiesPage() {
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await api.getSavedOpportunities();
        if (res.success && res.data) {
          setSavedItems(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSaved();
  }, []);

  const handleUnsave = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.opportunityId !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        href="/student"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-navy-950 flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-primary-600" />
          Saved Opportunities ({savedItems.length})
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review saved positions and submit applications before deadlines expire
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-400">Loading saved roles...</div>
      ) : savedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedItems.map((item) => {
            if (!item.opportunity) return null;
            if (item.opportunityType === 'job') {
              return <JobCard key={item._id} job={item.opportunity} />;
            }
            return (
              <InternshipCard
                key={item._id}
                internship={item.opportunity}
                isBookmarked={true}
                onBookmarkToggle={() => handleUnsave(item.opportunityId)}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-navy-900">No saved opportunities</h3>
          <p className="text-xs text-slate-500">
            When browsing internships or jobs, click the bookmark icon to save roles for later review.
          </p>
        </div>
      )}
    </div>
  );
}
