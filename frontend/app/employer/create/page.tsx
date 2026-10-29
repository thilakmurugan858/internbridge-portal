'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { ChevronLeft, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CreateListingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Software Engineering');
  const [location, setLocation] = useState('Remote');
  const [workMode, setWorkMode] = useState<'remote' | 'in_office' | 'hybrid'>('remote');
  const [durationWeeks, setDurationWeeks] = useState(12);
  const [stipendAmount, setStipendAmount] = useState(20000);
  const [stipendPeriod, setStipendPeriod] = useState('month');
  const [openings, setOpenings] = useState(2);
  const [description, setDescription] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState(
    'Develop clean and modular features\nParticipate in code reviews\nCollaborate with team members'
  );
  const [skillsText, setSkillsText] = useState('React, TypeScript, Node.js');
  const [perksText, setPerksText] = useState('Certificate, Letter of Recommendation, Flexible Hours');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'employer') {
      alert('Employer access required.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const responsibilities = responsibilitiesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const skillsRequired = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const perks = perksText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.createInternship({
        title: title.trim(),
        category,
        location: location.trim(),
        workMode,
        durationWeeks: Number(durationWeeks),
        stipendAmount: Number(stipendAmount),
        stipendPeriod,
        openings: Number(openings),
        description: description.trim(),
        responsibilities: responsibilities.length > 0 ? responsibilities : ['Work on assigned tasks'],
        skillsRequired: skillsRequired.length > 0 ? skillsRequired : ['Communication'],
        perks,
        deadline: new Date(deadline).toISOString(),
      });

      if (res.success && res.data) {
        alert('Internship published successfully!');
        router.push('/employer');
      } else {
        setErrorMessage(res.message || 'Failed to publish internship.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        href="/employer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">Publish New Internship</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Specify role requirements, compensation, and application deadline
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-navy-900">Internship Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frontend React Developer Intern"
              className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-navy-900">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl p-2.5 bg-white focus:outline-none"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Design & Frontend">Design & Frontend</option>
                <option value="DevOps & Cloud">DevOps & Cloud</option>
                <option value="Data Science & AI">Data Science & AI</option>
                <option value="Product & Operations">Product & Operations</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-navy-900">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as any)}
                className="w-full text-sm border border-slate-200 rounded-xl p-2.5 bg-white focus:outline-none"
              >
                <option value="remote">Remote (Work from Home)</option>
                <option value="hybrid">Hybrid</option>
                <option value="in_office">In Office</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-navy-900">City / Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru, Hyderabad, or Remote"
                className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-navy-900">Duration (Weeks)</label>
              <input
                type="number"
                required
                min={1}
                max={52}
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-navy-900">Monthly Stipend (₹ INR)</label>
              <input
                type="number"
                required
                min={0}
                value={stipendAmount}
                onChange={(e) => setStipendAmount(Number(e.target.value))}
                className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-navy-900">Number of Openings</label>
              <input
                type="number"
                required
                min={1}
                value={openings}
                onChange={(e) => setOpenings(Number(e.target.value))}
                className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-navy-900">Application Deadline</label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-navy-900">Detailed Description</label>
            <textarea
              rows={4}
              required
              minLength={20}
              placeholder="Provide context about your company, team culture, project scope, and what the intern will learn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-navy-900">
              Key Responsibilities (One item per line)
            </label>
            <textarea
              rows={3}
              value={responsibilitiesText}
              onChange={(e) => setResponsibilitiesText(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-navy-900">
              Required Skills (Comma-separated)
            </label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="React, TypeScript, CSS, Git"
              className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-navy-900">
              Perks & Benefits (Comma-separated)
            </label>
            <input
              type="text"
              value={perksText}
              onChange={(e) => setPerksText(e.target.value)}
              placeholder="Certificate, Letter of Recommendation, Flexible Hours"
              className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Link
            href="/employer"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-7 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow transition disabled:opacity-50"
          >
            {isLoading ? 'Publishing...' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
