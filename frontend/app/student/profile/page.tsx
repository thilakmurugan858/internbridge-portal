'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import {
  User,
  GraduationCap,
  Briefcase,
  FileText,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ChevronLeft,
  Link as LinkIcon,
} from 'lucide-react';

export default function StudentProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.getStudentProfile();
        if (res.success && res.data) {
          const u = res.data.user;
          const p = res.data.profile;
          if (u) setName(u.name || '');
          if (p) {
            setHeadline(p.headline || '');
            setBio(p.bio || '');
            setPhone(p.phone || '');
            setLocation(p.location || '');
            setResumeUrl(p.resumeUrl || '');
            setSkills(p.skills || []);
            setGithubUrl(p.githubUrl || '');
            setLinkedinUrl(p.linkedinUrl || '');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');

    try {
      const res = await api.updateStudentProfile({
        name,
        headline,
        bio,
        phone,
        location,
        resumeUrl,
        skills,
        githubUrl,
        linkedinUrl,
      });

      if (res.success) {
        setSuccessMessage('Profile saved successfully!');
        await refreshUser();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        href="/student"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Candidate Profile & Resume</h1>
          <p className="text-xs text-slate-500 mt-0.5">Keep your details fresh to attract top hiring teams</p>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-navy-900">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-navy-900">Professional Headline</label>
              <input
                type="text"
                placeholder="e.g. B.Tech Computer Science | Full Stack Enthusiast"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-navy-900">Contact Phone</label>
              <input
                type="text"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-navy-900">Current Location / City</label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, India"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-navy-900">About Me (Bio)</label>
            <textarea
              rows={3}
              placeholder="Brief summary of your academic journey, strengths, and career aspirations..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {/* Skills Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-navy-900">Skills & Competencies</h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a skill and press Enter (e.g. React, Docker, Python)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleAddSkill}
              className="flex-1 text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy-900 font-semibold text-xs transition"
            >
              Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary-50 text-primary-700 border border-primary-200 text-xs font-medium"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-red-600 transition"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Resume & Links Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            Resume & Online Profiles
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-navy-900">
                Resume URL (Google Drive, Dropbox, or hosted PDF)
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/.../view"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy-900">GitHub Profile URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy-900">LinkedIn Profile URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
