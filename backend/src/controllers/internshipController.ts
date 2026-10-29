import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Internship } from '../models/Internship';
import { EmployerProfile } from '../models/EmployerProfile';
import { Company } from '../models/Company';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export const getInternships = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const query: any = { status: 'active' };

    // Search query
    if (req.query.search) {
      const searchRegex = new RegExp(String(req.query.search).trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { companyName: searchRegex },
        { category: searchRegex },
        { skillsRequired: { $in: [searchRegex] } },
      ];
    }

    // Filters
    if (req.query.category) {
      query.category = { $regex: new RegExp(`^${req.query.category}$`, 'i') };
    }

    if (req.query.location) {
      query.location = { $regex: new RegExp(String(req.query.location), 'i') };
    }

    if (req.query.workMode && req.query.workMode !== 'all') {
      query.workMode = req.query.workMode;
    }

    if (req.query.duration) {
      const maxDuration = parseInt(req.query.duration as string, 10);
      if (!isNaN(maxDuration)) {
        query.durationWeeks = { $lte: maxDuration };
      }
    }

    if (req.query.minStipend) {
      const min = parseInt(req.query.minStipend as string, 10);
      if (!isNaN(min)) {
        query['stipend.amount'] = { $gte: min };
      }
    }

    if (req.query.paidOnly === 'true') {
      query['stipend.type'] = { $ne: 'unpaid' };
      query['stipend.amount'] = { $gt: 0 };
    }

    // Sort
    let sort: any = { createdAt: -1 };
    if (req.query.sortBy === 'stipend_desc') {
      sort = { 'stipend.amount': -1 };
    } else if (req.query.sortBy === 'stipend_asc') {
      sort = { 'stipend.amount': 1 };
    } else if (req.query.sortBy === 'deadline') {
      sort = { deadline: 1 };
    }

    const [internships, total] = await Promise.all([
      Internship.find(query)
        .populate('companyId', 'name logoUrl industry headquarters verified')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Internship.countDocuments(query),
    ]);

    sendSuccess(res, internships, 'Internships retrieved successfully', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch internships', 500);
  }
};

export const getInternshipById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid internship ID format', 400);
      return;
    }

    const internship = await Internship.findByIdAndUpdate(
      id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).populate('companyId');

    if (!internship) {
      sendError(res, 'Internship not found', 404);
      return;
    }

    sendSuccess(res, internship, 'Internship details fetched');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch internship details', 500);
  }
};

export const createInternship = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'employer') {
      sendError(res, 'Only employers can publish internships', 403);
      return;
    }

    const employerProfile = await EmployerProfile.findOne({ userId: req.user.userId });
    if (!employerProfile || !employerProfile.companyId) {
      sendError(res, 'Please set up your company profile before publishing an internship', 400);
      return;
    }

    const company = await Company.findById(employerProfile.companyId);
    if (!company) {
      sendError(res, 'Associated company not found', 404);
      return;
    }

    const data = req.body;
    const internship = await Internship.create({
      title: data.title,
      employerId: req.user.userId,
      companyId: company._id,
      companyName: company.name,
      category: data.category,
      location: data.location,
      workMode: data.workMode,
      durationWeeks: data.durationWeeks,
      stipend: {
        amount: data.stipendAmount || 0,
        currency: 'INR',
        type: data.stipendType || 'fixed',
        period: data.stipendPeriod || 'month',
      },
      openings: data.openings || 1,
      description: data.description,
      responsibilities: data.responsibilities,
      skillsRequired: data.skillsRequired,
      eligibility: data.eligibility || [],
      perks: data.perks || [],
      deadline: new Date(data.deadline),
      startDate: data.startDate || 'Immediately',
      status: 'active',
    });

    sendSuccess(res, internship, 'Internship created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create internship', 500);
  }
};

export const updateInternship = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid internship ID', 400);
      return;
    }

    const internship = await Internship.findById(id);
    if (!internship) {
      sendError(res, 'Internship not found', 404);
      return;
    }

    // Verify ownership: employer who created it or admin
    if (internship.employerId.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      sendError(res, 'Forbidden: You do not own this internship listing', 403);
      return;
    }

    const updated = await Internship.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    sendSuccess(res, updated, 'Internship updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update internship', 500);
  }
};

export const deleteInternship = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid internship ID', 400);
      return;
    }

    const internship = await Internship.findById(id);
    if (!internship) {
      sendError(res, 'Internship not found', 404);
      return;
    }

    if (internship.employerId.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      sendError(res, 'Forbidden: You do not own this internship listing', 403);
      return;
    }

    internship.status = 'archived';
    await internship.save();

    sendSuccess(res, null, 'Internship archived successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to delete internship', 500);
  }
};

export const getFeaturedOpportunities = async (_req: Request, res: Response): Promise<void> => {
  try {
    const featured = await Internship.find({ status: 'active' })
      .populate('companyId', 'name logoUrl headquarters verified')
      .sort({ viewsCount: -1, createdAt: -1 })
      .limit(6)
      .lean();

    sendSuccess(res, featured, 'Featured opportunities fetched');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch featured opportunities', 500);
  }
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Internship.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ]);

    const formatted = categories.map((c) => ({
      name: c._id,
      count: c.count,
    }));

    sendSuccess(res, formatted, 'Categories fetched successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch categories', 500);
  }
};
