import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          Draft Policy Document (Educational / Portfolio Project)
        </span>
        <h1 className="text-3xl font-extrabold text-navy-950 mt-2">Privacy Policy Draft</h1>
        <p className="text-xs text-slate-500 mt-1">Last Updated: October 2026</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-xs text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-900">1. Information We Collect</h2>
          <p>
            When registering on InternBridge, we collect account details such as your name, email address, password hash, role (Student or Employer), education, skills, and past experiences. For employers, we collect company profile information including company name, website, and industry.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-900">2. How Information is Used</h2>
          <p>
            Candidate information is shared with prospective employers strictly when the candidate explicitly applies to an internship or job posting. Resumes and personal contact coordinates are not publicly searchable or indexed by web search engines without explicit authorization.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-900">3. Authentication & Cookies</h2>
          <p>
            We use secure HttpOnly session cookies and JSON Web Tokens (JWT) strictly for session management and route protection. No third-party tracking or cross-site behavioral advertising cookies are placed on user devices.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-900">4. Disclaimer</h2>
          <p>
            This document is a technical architectural draft for the InternBridge demonstrator platform and does not constitute formal legal advice.
          </p>
        </section>
      </div>
    </div>
  );
}
