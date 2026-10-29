import { Response } from 'express';
import mongoose from 'mongoose';
import { Application } from '../models/Application';
import { Internship } from '../models/Internship';
import { Job } from '../models/Job';
import { StudentProfile } from '../models/StudentProfile';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export const apply = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'student') {
      sendError(res, 'Only students can apply to opportunities', 403);
      return;
    }

    const { opportunityId, opportunityType, coverLetter, resumeUrl, answers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(opportunityId)) {
      sendError(res, 'Invalid opportunity ID format', 400);
      return;
    }

    // Check duplicate application
    const existing = await Application.findOne({
      opportunityId,
      studentId: req.user.userId,
    });

    if (existing) {
      sendError(res, 'You have already submitted an application for this opportunity.', 409);
      return;
    }

    let opportunity: any = null;
    if (opportunityType === 'internship') {
      opportunity = await Internship.findById(opportunityId);
    } else {
      opportunity = await Job.findById(opportunityId);
    }

    if (!opportunity) {
      sendError(res, 'The requested opportunity does not exist or has been removed.', 404);
      return;
    }

    if (opportunity.status !== 'active') {
      sendError(res, 'This listing is no longer accepting applications.', 400);
      return;
    }

    // Check application deadline
    if (new Date() > new Date(opportunity.deadline)) {
      sendError(res, 'The application deadline for this position has passed.', 400);
      return;
    }

    // If resumeUrl not provided in request, fall back to student's profile resume
    let finalResume = resumeUrl;
    if (!finalResume) {
      const studentProfile = await StudentProfile.findOne({ userId: req.user.userId });
      finalResume = studentProfile?.resumeUrl;
    }

    const application = await Application.create({
      opportunityId,
      opportunityType,
      studentId: req.user.userId,
      employerId: opportunity.employerId,
      companyId: opportunity.companyId,
      status: 'applied',
      coverLetter,
      resumeUrl: finalResume,
      screeningAnswers: answers || [],
      statusHistory: [
        {
          status: 'applied',
          changedAt: new Date(),
          note: 'Application submitted by student',
          changedBy: new mongoose.Types.ObjectId(req.user.userId),
        },
      ],
    });

    // Increment applicationsCount on listing
    if (opportunityType === 'internship') {
      await Internship.findByIdAndUpdate(opportunityId, { $inc: { applicationsCount: 1 } });
    } else {
      await Job.findByIdAndUpdate(opportunityId, { $inc: { applicationsCount: 1 } });
    }

    sendSuccess(res, application, 'Application submitted successfully', 201);
  } catch (error: any) {
    if (error.code === 11000) {
      sendError(res, 'You have already submitted an application for this opportunity.', 409);
      return;
    }
    sendError(res, error.message || 'Failed to submit application', 500);
  }
};

export const getMyApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'student') {
      sendError(res, 'Only students can view their personal applications', 403);
      return;
    }

    const applications = await Application.find({ studentId: req.user.userId })
      .populate('companyId', 'name logoUrl headquarters')
      .sort({ createdAt: -1 })
      .lean();

    // Populate opportunity details manually for polymorphic ref
    const enriched = await Promise.all(
      applications.map(async (app) => {
        let oppDetails = null;
        if (app.opportunityType === 'internship') {
          oppDetails = await Internship.findById(app.opportunityId)
            .select('title category location workMode stipend durationWeeks deadline status')
            .lean();
        } else {
          oppDetails = await Job.findById(app.opportunityId)
            .select('title category location workMode salary jobType deadline status')
            .lean();
        }
        return {
          ...app,
          opportunity: oppDetails,
        };
      })
    );

    sendSuccess(res, enriched, 'Student applications fetched');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch student applications', 500);
  }
};

export const withdrawApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid application ID', 400);
      return;
    }

    const application = await Application.findById(id);
    if (!application) {
      sendError(res, 'Application not found', 404);
      return;
    }

    if (application.studentId.toString() !== req.user?.userId) {
      sendError(res, 'You are not authorized to withdraw this application', 403);
      return;
    }

    if (application.status === 'withdrawn') {
      sendError(res, 'Application has already been withdrawn', 400);
      return;
    }

    if (application.status === 'rejected' || application.status === 'accepted') {
      sendError(res, `Cannot withdraw an application that has already been ${application.status}`, 400);
      return;
    }

    application.status = 'withdrawn';
    application.withdrawnAt = new Date();
    application.statusHistory.push({
      status: 'withdrawn',
      changedAt: new Date(),
      note: 'Withdrawn by candidate',
      changedBy: new mongoose.Types.ObjectId(req.user.userId),
    });

    await application.save();

    sendSuccess(res, application, 'Application withdrawn successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to withdraw application', 500);
  }
};

export const getEmployerApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'employer') {
      sendError(res, 'Only employers can access employer applicant pipelines', 403);
      return;
    }

    const query: any = { employerId: req.user.userId };

    if (req.query.opportunityId) {
      query.opportunityId = req.query.opportunityId;
    }

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    const applications = await Application.find(query)
      .populate('studentId', 'name email avatarUrl')
      .populate('companyId', 'name logoUrl')
      .sort({ createdAt: -1 })
      .lean();

    // Populate student profiles & opportunity details
    const enriched = await Promise.all(
      applications.map(async (app: any) => {
        const studentProfile = await StudentProfile.findOne({ userId: app.studentId?._id }).lean();
        let oppDetails = null;
        if (app.opportunityType === 'internship') {
          oppDetails = await Internship.findById(app.opportunityId).select('title category location').lean();
        } else {
          oppDetails = await Job.findById(app.opportunityId).select('title category location').lean();
        }
        return {
          ...app,
          studentProfile,
          opportunity: oppDetails,
        };
      })
    );

    sendSuccess(res, enriched, 'Employer applications fetched');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch employer applications', 500);
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid application ID format', 400);
      return;
    }

    const application = await Application.findById(id);
    if (!application) {
      sendError(res, 'Application not found', 404);
      return;
    }

    // Strict ownership verification: must be the employer who created the listing, or admin
    if (application.employerId.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      sendError(res, 'Access denied: You do not have permission to manage applications for this position', 403);
      return;
    }

    if (application.status === 'withdrawn') {
      sendError(res, 'Cannot update status of a withdrawn application', 400);
      return;
    }

    application.status = status;
    application.statusHistory.push({
      status,
      changedAt: new Date(),
      note: note || `Status updated to ${status} by hiring manager`,
      changedBy: new mongoose.Types.ObjectId(req.user?.userId),
    });

    await application.save();

    sendSuccess(res, application, `Application status updated to ${status}`);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update application status', 500);
  }
};
