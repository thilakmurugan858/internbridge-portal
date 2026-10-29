import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          Draft Terms of Service (Educational / Portfolio Project)
        </span>
        <h1 className="text-3xl font-extrabold text-navy-950 mt-2">Terms of Service Draft</h1>
        <p className="text-xs text-slate-500 mt-1">Last Updated: October 2026</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-xs text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using InternBridge, you agree to comply with and be bound by these draft terms. If you disagree with any portion of these provisions, you should refrain from using the platform services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-900">2. Employer Obligations</h2>
          <p>
            Employers are strictly prohibited from publishing fraudulent listings, asking students for upfront security deposits, or misrepresenting internship compensation. Violations result in immediate removal of listings and employer account suspension.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-900">3. Candidate Conduct</h2>
          <p>
            Students warrant that all credentials, academic degrees, and experiences listed on their profile are authentic. Misrepresenting qualifications or attempting automated application spam is prohibited.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-navy-900">4. Legal Notice</h2>
          <p>
            These terms are drafted for system design demonstration purposes and have not been reviewed by legal counsel.
          </p>
        </section>
      </div>
    </div>
  );
}
