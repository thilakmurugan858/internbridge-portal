'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Internship } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  MapPin,
  Calendar,
  Banknote,
  Building,
  Bookmark,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface InternshipCardProps {
  internship: Internship;
  isBookmarked?: boolean;
  onBookmarkToggle?: (id: string, newState: boolean) => void;
}

export const InternshipCard: React.FC<InternshipCardProps> = ({
  internship,
  isBookmarked = false,
  onBookmarkToggle,
}) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(isBookmarked);
  const [loadingBookmark, setLoadingBookmark] = useState(false);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || user.role !== 'student') {
      alert('Please log in with a student account to save opportunities.');
      return;
    }

    setLoadingBookmark(true);
    try {
      if (saved) {
        await api.unsaveOpportunity(internship._id);
        setSaved(false);
        onBookmarkToggle?.(internship._id, false);
      } else {
        await api.saveOpportunity(internship._id, 'internship');
        setSaved(true);
        onBookmarkToggle?.(internship._id, true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookmark(false);
    }
  };

  const formatStipend = () => {
    const { stipend } = internship;
    if (!stipend || stipend.type === 'unpaid') return 'Unpaid';
    return `₹${stipend.amount.toLocaleString('en-IN')} / ${stipend.period}`;
  };

  const getWorkModeBadgeClass = () => {
    switch (internship.workMode) {
      case 'remote':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'hybrid':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 card-hover relative flex flex-col justify-between group">
      <div>
        {/* Header: Title, Company, Bookmark */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                <Sparkles className="w-3 h-3" />
                Actively Hiring
              </span>
              <span
                className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded border capitalize ${getWorkModeBadgeClass()}`}
              >
                {internship.workMode.replace('_', ' ')}
              </span>
            </div>

            <Link href={`/internships/${internship._id}`}>
              <h3 className="text-lg font-bold text-navy-900 group-hover:text-primary-600 transition line-clamp-1">
                {internship.title}
              </h3>
            </Link>

            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
              <Building className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-medium">{internship.companyName}</span>
            </div>
          </div>

          <button
            onClick={handleBookmark}
            disabled={loadingBookmark}
            title={saved ? 'Remove bookmark' : 'Save opportunity'}
            className={`p-2 rounded-xl border transition ${
              saved
                ? 'bg-primary-50 border-primary-200 text-primary-600'
                : 'border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-200 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-primary-600' : ''}`} />
          </button>
        </div>

        {/* Key Metrics: Location, Duration, Stipend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 py-3 border-y border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{internship.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{internship.durationWeeks} Weeks</span>
          </div>
          <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
            <Banknote className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-navy-900">{formatStipend()}</span>
          </div>
        </div>

        {/* Skills Required */}
        {internship.skillsRequired && internship.skillsRequired.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {internship.skillsRequired.slice(0, 4).map((skill, i) => (
              <span
                key={i}
                className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
              >
                {skill}
              </span>
            ))}
            {internship.skillsRequired.length > 4 && (
              <span className="text-[11px] text-slate-400 font-medium self-center">
                +{internship.skillsRequired.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Date posted & Action Button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <span className="text-xs text-slate-400">
          Posted {new Date(internship.createdAt).toLocaleDateString()}
        </span>

        <Link
          href={`/internships/${internship._id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition"
        >
          View Details
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
