'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  GraduationCap,
  Building2,
  Menu,
  X,
  User as UserIcon,
  Bookmark,
  PlusCircle,
  ShieldAlert,
  LogOut,
  ChevronDown,
  MessageSquare,
  Users,
  Compass,
} from 'lucide-react';
import { NotificationBell } from './public-space/NotificationBell';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-700 to-primary-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-navy-900">
                Intern<span className="text-primary-600">Bridge</span>
              </span>
              <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider bg-primary-100 text-primary-700 rounded">
                Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/internships"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/internships')
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
              }`}
            >
              Internships
            </Link>
            <Link
              href="/jobs"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/jobs')
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
              }`}
            >
              Jobs
            </Link>
            <Link
              href="/companies"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/companies')
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
              }`}
            >
              Top Companies
            </Link>
            <Link
              href="/public-space"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname?.startsWith('/public-space')
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-primary-600" />
              <span>Public Space</span>
              <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider bg-primary-100 text-primary-700 rounded-full">
                Feed
              </span>
            </Link>
          </nav>

          {/* User / Auth CTAs */}
          <div className="hidden md:flex items-center gap-2.5">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary-600 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm hover:shadow transition"
                >
                  Register
                </Link>
                <Link
                  href="/register?role=employer"
                  className="px-3.5 py-2 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition"
                >
                  Employer Post Free
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <NotificationBell />

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div className="text-left text-xs">
                      <p className="font-semibold text-navy-900 max-w-[120px] truncate">{user.name}</p>
                      <p className="text-slate-500 capitalize">{user.role}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold text-navy-900 truncate">{user.email}</p>
                        {user.username && (
                          <p className="text-xs text-primary-600 font-medium">@{user.username}</p>
                        )}
                      </div>

                      {/* Public Space Shortcuts */}
                      <div className="py-1">
                        <Link
                          href={`/public-space/profile/${user.username || user.id}`}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <UserIcon className="w-4 h-4 text-primary-600" />
                          My Public Space Profile
                        </Link>
                        <Link
                          href="/public-space/saved"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Bookmark className="w-4 h-4 text-amber-500" />
                          Saved Community Posts
                        </Link>
                        <Link
                          href="/public-space/discovery"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Compass className="w-4 h-4 text-indigo-500" />
                          Discover Peers & Friends
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 my-1"></div>

                      {user.role === 'student' && (
                        <>
                          <Link
                            href="/student"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Briefcase className="w-4 h-4 text-slate-500" />
                            My Applications
                          </Link>
                          <Link
                            href="/student/saved"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Bookmark className="w-4 h-4 text-slate-500" />
                            Saved Opportunities
                          </Link>
                          <Link
                            href="/student/profile"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <UserIcon className="w-4 h-4 text-slate-500" />
                            Edit Resume & Info
                          </Link>
                        </>
                      )}

                      {user.role === 'employer' && (
                        <>
                          <Link
                            href="/employer"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Briefcase className="w-4 h-4 text-slate-500" />
                            Employer Dashboard
                          </Link>
                          <Link
                            href="/employer/create"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-primary-600 font-medium hover:bg-primary-50"
                          >
                            <PlusCircle className="w-4 h-4 text-primary-600" />
                            Publish Opportunity
                          </Link>
                        </>
                      )}

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-purple-700 font-medium hover:bg-purple-50"
                        >
                          <ShieldAlert className="w-4 h-4 text-purple-600" />
                          Admin Moderation
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-1">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/internships"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-100"
          >
            Internships
          </Link>
          <Link
            href="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-100"
          >
            Jobs
          </Link>
          <Link
            href="/companies"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-100"
          >
            Companies
          </Link>
          <Link
            href="/public-space"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-md font-medium text-primary-700 bg-primary-50"
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Public Space
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary-200">Feed</span>
          </Link>

          <div className="border-t border-slate-200 pt-3">
            {!user ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg border border-slate-200 font-semibold text-slate-700"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-primary-600 text-white font-semibold"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 px-3">Signed in as {user.name} ({user.role})</p>
                <Link
                  href={`/public-space/profile/${user.username || user.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
                >
                  My Public Space Profile
                </Link>
                <Link
                  href="/public-space/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
                >
                  Saved Community Posts
                </Link>
                <Link
                  href="/public-space/discovery"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
                >
                  Discover Peers & Friends
                </Link>
                {user.role === 'student' && (
                  <Link
                    href="/student"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
                  >
                    My Applications
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
