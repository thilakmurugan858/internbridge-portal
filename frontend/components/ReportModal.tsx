'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReportModalProps {
  opportunityId: string;
  opportunityTitle: string;
  opportunityType?: 'internship' | 'job';
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  opportunityId,
  opportunityTitle,
  opportunityType = 'internship',
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('misleading_information');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('Please log in to submit a listing report.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.reportListing({
        opportunityId,
        opportunityType,
        reason,
        details: details.trim(),
      });

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setErrorMessage(res.message || 'Failed to submit report.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">Report Submitted</h3>
            <p className="text-xs text-slate-600">
              Our trust and safety moderation team will review this opportunity promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <ShieldAlert className="w-5 h-5" />
              <h2 className="text-base font-bold text-navy-900">Report Opportunity</h2>
            </div>
            <p className="text-xs text-slate-500">
              Reporting: <span className="font-semibold text-slate-700">{opportunityTitle}</span>
            </p>

            {errorMessage && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-navy-900">Reason for Report</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="fraud_scam">Fraudulent or Suspicious Scam</option>
                <option value="misleading_information">Misleading Compensation or Details</option>
                <option value="inappropriate_content">Inappropriate Content</option>
                <option value="discriminatory">Discriminatory Requirements</option>
                <option value="other">Other Violation</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-navy-900">Detailed Explanation</label>
              <textarea
                rows={3}
                required
                minLength={10}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain the specific issue observed with this listing..."
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div className="pt-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Reporting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
