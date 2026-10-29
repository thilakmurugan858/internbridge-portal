import { Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Internship } from '../models/Internship';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { Company } from '../models/Company';
import { ListingReport } from '../models/ListingReport';
import { AuditService } from '../services/auditService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export const getPlatformStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalEmployers,
      totalInternships,
      totalJobs,
      totalApplications,
      totalCompanies,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'employer' }),
      Internship.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      Company.countDocuments(),
      ListingReport.countDocuments({ status: 'pending' }),
    ]);

    sendSuccess(res, {
      totalUsers,
      totalStudents,
      totalEmployers,
      totalInternships,
      totalJobs,
      totalApplications,
      totalCompanies,
      pendingReports,
    }, 'Platform statistics retrieved');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch platform stats', 500);
  }
};

export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string;
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const reports = await ListingReport.find(query)
      .populate('reportedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Populate opportunity info
    const enriched = await Promise.all(
      reports.map(async (rep) => {
        let opp = null;
        if (rep.opportunityType === 'internship') {
          opp = await Internship.findById(rep.opportunityId).select('title companyName status').lean();
        } else {
          opp = await Job.findById(rep.opportunityId).select('title companyName status').lean();
        }
        return {
          ...rep,
          opportunity: opp,
        };
      })
    );

    sendSuccess(res, enriched, 'Moderation reports fetched');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch moderation reports', 500);
  }
};

export const resolveReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status, actionTaken, resolutionNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid report ID', 400);
      return;
    }

    const report = await ListingReport.findById(id);
    if (!report) {
      sendError(res, 'Report not found', 404);
      return;
    }

    report.status = status || 'resolved';
    report.actionTaken = actionTaken || 'none';
    report.resolutionNotes = resolutionNotes;
    report.resolvedBy = new mongoose.Types.ObjectId(req.user?.userId);
    report.resolvedAt = new Date();

    await report.save();

    // If listing should be removed / flagged
    if (actionTaken === 'listing_removed') {
      if (report.opportunityType === 'internship') {
        await Internship.findByIdAndUpdate(report.opportunityId, { status: 'flagged' });
      } else {
        await Job.findByIdAndUpdate(report.opportunityId, { status: 'flagged' });
      }
    }

    // Audit log
    await AuditService.log({
      action: `RESOLVE_REPORT_${actionTaken?.toUpperCase() || 'NONE'}`,
      performedBy: req.user!.userId,
      targetType: 'report',
      targetId: report._id.toString(),
      details: { actionTaken, notes: resolutionNotes, opportunityId: report.opportunityId },
      ipAddress: req.ip,
    });

    sendSuccess(res, report, 'Report resolved successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to resolve report', 500);
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string, 10) || 20);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.role && req.query.role !== 'all') {
      query.role = req.query.role;
    }
    if (req.query.search) {
      query.$or = [
        { name: { $regex: String(req.query.search), $options: 'i' } },
        { email: { $regex: String(req.query.search), $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    sendSuccess(res, users, 'Users retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch users', 500);
  }
};

export const verifyEmployerOrCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId, verified } = req.body;
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      sendError(res, 'Invalid company ID', 400);
      return;
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      { verified: verified ?? true },
      { new: true }
    );

    if (!company) {
      sendError(res, 'Company not found', 404);
      return;
    }

    await AuditService.log({
      action: verified ? 'VERIFY_COMPANY' : 'UNVERIFY_COMPANY',
      performedBy: req.user!.userId,
      targetType: 'company',
      targetId: companyId,
      ipAddress: req.ip,
    });

    sendSuccess(res, company, `Company verification status updated to ${verified}`);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update company verification status', 500);
  }
};
