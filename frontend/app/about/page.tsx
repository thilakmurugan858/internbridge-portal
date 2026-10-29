import React from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Target, Users, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
          Our Mission & Vision
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950">
          About InternBridge
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          InternBridge was founded to bridge the critical experience gap between higher education and meaningful industry careers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-navy-950">For Students</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            We provide genuine, verified internship listings with guaranteed stipends, clear responsibilities, and zero hidden application fees. Every college student deserves transparent pathways to prove their abilities.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-navy-950">For Employers</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hiring teams can post opportunities, review rich applicant portfolios and resumes, and update application stages seamlessly without clunky enterprise recruiting software.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-navy-950">Platform Integrity & Quality Standards</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Unlike unmoderated job boards flooded with unpaid training scams, InternBridge maintains proactive moderation filters and verified employer badges. When community members report questionable listings, our administration tools immediately safeguard candidates.
        </p>
        <div className="pt-4">
          <Link
            href="/internships"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow transition"
          >
            Explore Active Internships
          </Link>
        </div>
      </div>
    </div>
  );
}
