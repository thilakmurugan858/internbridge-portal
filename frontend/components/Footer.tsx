import React from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Intern<span className="text-primary-400">Bridge</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering early-career students and graduates with verified internships, high-impact jobs, and direct access to top recruiters across technology, design, and business.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Genuine, Verified Opportunities</span>
            </div>
          </div>

          {/* Internships Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Internships</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/internships?workMode=remote" className="hover:text-white transition">Work from Home</Link></li>
              <li><Link href="/internships?category=Software+Engineering" className="hover:text-white transition">Engineering Internships</Link></li>
              <li><Link href="/internships?category=Design+%26+Frontend" className="hover:text-white transition">Design & UI/UX</Link></li>
              <li><Link href="/internships?category=Data+Science+%26+AI" className="hover:text-white transition">Data Science & AI</Link></li>
              <li><Link href="/internships?paidOnly=true" className="hover:text-white transition">High-Stipend Opportunities</Link></li>
            </ul>
          </div>

          {/* Jobs & Companies */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Jobs & Companies</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/jobs" className="hover:text-white transition">Fresher Jobs</Link></li>
              <li><Link href="/jobs?workMode=remote" className="hover:text-white transition">Remote Jobs</Link></li>
              <li><Link href="/companies" className="hover:text-white transition">Top Hiring Companies</Link></li>
              <li><Link href="/register?role=employer" className="hover:text-white transition">Post an Internship</Link></li>
            </ul>
          </div>

          {/* Platform & Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-white transition">About InternBridge</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact & Help Center</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy (Draft)</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Terms of Service (Draft)</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} InternBridge Platform. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Designed for student careers with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
