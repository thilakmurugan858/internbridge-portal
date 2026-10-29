'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../services/api';
import { InternshipCard } from '../components/InternshipCard';
import { Internship, Company } from '../types';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Building2,
  Code2,
  Palette,
  LineChart,
  Cpu,
  Layers,
  GraduationCap,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [featuredInternships, setFeaturedInternships] = useState<Internship[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [featuredRes, categoriesRes, companiesRes] = await Promise.all([
          api.getFeaturedInternships(),
          api.getCategories(),
          api.getCompanies({ limit: 4 }),
        ]);

        if (featuredRes.success && featuredRes.data) {
          setFeaturedInternships(featuredRes.data);
        }
        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
        if (companiesRes.success && companiesRes.data) {
          setCompanies(companiesRes.data);
        }
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchKeyword.trim()) query.append('search', searchKeyword.trim());
    if (searchLocation.trim()) query.append('location', searchLocation.trim());
    router.push(`/internships?${query.toString()}`);
  };

  const popularSkills = [
    'React.js',
    'TypeScript',
    'Python',
    'Node.js',
    'Figma',
    'Machine Learning',
    'SQL',
    'Docker',
  ];

  const categoryIcons: Record<string, React.ReactNode> = {
    'Software Engineering': <Code2 className="w-5 h-5 text-indigo-600" />,
    'Design & Frontend': <Palette className="w-5 h-5 text-pink-600" />,
    'DevOps & Cloud': <Cpu className="w-5 h-5 text-sky-600" />,
    'Data Science & AI': <LineChart className="w-5 h-5 text-purple-600" />,
    'Product & Operations': <Layers className="w-5 h-5 text-amber-600" />,
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/70 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100/80 border border-primary-200 text-primary-800 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            <span>Over 1,200+ Verified Internship Openings Added This Week</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-navy-950 max-w-4xl mx-auto leading-tight">
            Launch Your Career with <span className="text-primary-600">High-Impact</span> Internships & Jobs
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            InternBridge bridges the gap between ambitious students and high-growth technology companies. Apply directly to verified opportunities with real stipends.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-3xl mx-auto bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex items-center gap-2.5 px-3 py-2 flex-1 w-full border-b sm:border-b-0 sm:border-r border-slate-100">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Job title, skills, or company name..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 w-full sm:w-64 border-b sm:border-b-0 border-slate-100">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="City or 'Remote'..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition shadow-sm hover:shadow"
            >
              Search
            </button>
          </form>

          {/* Popular Skills Pills */}
          <div className="mt-6 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-500">
            <span className="font-semibold text-navy-900">Trending Skills:</span>
            {popularSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => router.push(`/internships?search=${encodeURIComponent(skill)}`)}
                className="bg-white hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 border border-slate-200 px-2.5 py-1 rounded-lg transition"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">Explore by Category</h2>
            <p className="text-slate-500 text-sm mt-1">Discover roles matched to your field of study</p>
          </div>
          <Link
            href="/internships"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            View all categories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(categories.length > 0
            ? categories
            : [
                { name: 'Software Engineering', count: 18 },
                { name: 'Design & Frontend', count: 12 },
                { name: 'DevOps & Cloud', count: 9 },
                { name: 'Data Science & AI', count: 14 },
                { name: 'Product & Operations', count: 7 },
              ]
          ).map((cat, i) => (
            <Link
              key={i}
              href={`/internships?category=${encodeURIComponent(cat.name)}`}
              className="bg-white p-5 rounded-2xl border border-slate-200 card-hover flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-primary-50 transition">
                {categoryIcons[cat.name] || <TrendingUp className="w-5 h-5 text-primary-600" />}
              </div>
              <div>
                <h3 className="font-bold text-navy-900 text-sm group-hover:text-primary-600 transition">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{cat.count}+ active openings</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Opportunities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                Hand-Picked Roles
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">Featured Internships</h2>
            <p className="text-slate-500 text-sm mt-1">
              Verified stipend programs from industry-leading companies
            </p>
          </div>
          <Link
            href="/internships"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Browse all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-2xl p-6 h-64 animate-pulse space-y-4">
                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                <div className="h-6 bg-slate-100 rounded w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                <div className="h-16 bg-slate-50 rounded"></div>
              </div>
            ))}
          </div>
        ) : featuredInternships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredInternships.map((internship) => (
              <InternshipCard key={internship._id} internship={internship} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-sm">
              Connect to MongoDB and run seed data to explore featured opportunities!
            </p>
          </div>
        )}
      </section>

      {/* Why Choose InternBridge */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">
              Why InternBridge Stands Apart
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Designed with integrity for student success and trustworthy hiring
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy-900">Zero Fake or Scam Listings</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every company registration is vetted before listings go live. Our moderation dashboard enforces strict anti-fraud safeguards.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy-900">Guaranteed Fair Compensation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clear transparency on stipend amounts, payment cycles, and performance bonuses with no surprise hidden fees for candidates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy-900">Direct Recruiter Feedback</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track every stage of your application lifecycle in real-time from review to shortlisting and interview invites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Companies Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">Top Hiring Companies</h2>
            <p className="text-slate-500 text-sm mt-1">Leading employers actively hiring talent</p>
          </div>
          <Link
            href="/companies"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            View all companies
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {companies.map((comp) => (
            <Link
              key={comp._id}
              href={`/companies/${comp.slug || comp._id}`}
              className="bg-white p-5 rounded-2xl border border-slate-200 card-hover space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                  <Building2 className="w-6 h-6 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-navy-900 truncate">{comp.name}</h3>
                  <p className="text-xs text-slate-400 truncate">{comp.industry}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">{comp.description}</p>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400">{comp.headquarters}</span>
                <span className="font-semibold text-primary-600">
                  {comp.activeOpportunitiesCount || 0} Openings
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Dual CTA Section for Student & Employer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-primary-900 to-navy-900 rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-primary-300">
                For Students & Graduates
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold mt-2 mb-3">
                Ready to accelerate your career?
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                Create a professional candidate profile, upload your resume, and unlock one-click applications to high-stipend internships.
              </p>
            </div>
            <div className="mt-8">
              <Link
                href="/register?role=student"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-navy-900 font-bold text-sm hover:bg-slate-100 transition shadow"
              >
                Create Student Account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-navy-950 rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between border border-slate-800">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                For Recruiters & Hiring Managers
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold mt-2 mb-3">
                Hire world-class young talent today
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                Post internships and entry-level positions to reach verified students from top universities. Manage candidate pipelines effortlessly.
              </p>
            </div>
            <div className="mt-8">
              <Link
                href="/register?role=employer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition shadow"
              >
                Post an Internship
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
