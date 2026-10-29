'use client';

import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  filters: {
    category: string;
    location: string;
    workMode: string;
    paidOnly: boolean;
    minStipend: string;
    duration: string;
  };
  onFilterChange: (name: string, value: any) => void;
  onReset: () => void;
  categories?: Array<{ name: string; count: number }>;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onReset,
  categories = [],
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-20 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary-600" />
          <h2 className="font-bold text-navy-900 text-sm">Filters</h2>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-primary-600 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* Work Mode */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Work Mode
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {['all', 'remote', 'hybrid', 'in_office'].map((mode) => (
            <button
              key={mode}
              onClick={() => onFilterChange('workMode', mode)}
              className={`text-xs py-1.5 px-2 rounded-lg font-medium border text-center capitalize transition ${
                filters.workMode === mode
                  ? 'bg-primary-50 border-primary-500 text-primary-700 font-semibold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {mode === 'all' ? 'All Modes' : mode.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat.name}>
              {cat.name} ({cat.count})
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          City / Location
        </label>
        <input
          type="text"
          placeholder="e.g. Bengaluru, Remote, Delhi"
          value={filters.location}
          onChange={(e) => onFilterChange('location', e.target.value)}
          className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        />
      </div>

      {/* Paid Only Checkbox */}
      <div className="pt-2 border-t border-slate-100">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-navy-900">
          <input
            type="checkbox"
            checked={filters.paidOnly}
            onChange={(e) => onFilterChange('paidOnly', e.target.checked)}
            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
          />
          Paid Internships Only
        </label>
      </div>

      {/* Min Stipend Filter */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold uppercase tracking-wider text-slate-500">
            Min Monthly Stipend
          </label>
          <span className="font-semibold text-primary-600">
            {filters.minStipend ? `₹${parseInt(filters.minStipend).toLocaleString()}` : 'Any'}
          </span>
        </div>
        <select
          value={filters.minStipend}
          onChange={(e) => onFilterChange('minStipend', e.target.value)}
          className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        >
          <option value="">Any Stipend</option>
          <option value="5000">₹5,000+ / month</option>
          <option value="10000">₹10,000+ / month</option>
          <option value="20000">₹20,000+ / month</option>
          <option value="30000">₹30,000+ / month</option>
        </select>
      </div>

      {/* Max Duration */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Maximum Duration
        </label>
        <select
          value={filters.duration}
          onChange={(e) => onFilterChange('duration', e.target.value)}
          className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        >
          <option value="">Any Duration</option>
          <option value="4">1 Month (4 weeks)</option>
          <option value="12">3 Months (12 weeks)</option>
          <option value="24">6 Months (24 weeks)</option>
        </select>
      </div>
    </div>
  );
};
