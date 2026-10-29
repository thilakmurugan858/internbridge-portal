import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Job } from '../models/Job';
import { EmployerProfile } from '../models/EmployerProfile';
import { Company } from '../models/Company';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const query: any = { status: 'active' };

    if (req.query.search) {
      const searchRegex = new RegExp(String(req.query.search).trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { companyName: searchRegex },
        { category: searchRegex },
        { skillsRequired: { $in: [searchRegex] } },
      ];
    }

    if (req.query.category) {
      query.category = { $regex: new RegExp(`^${req.query.category}$`, 'i') };
    }

    if (req.query.location) {
      query.location = { $regex: new RegExp(String(req.query.location), 'i') };
    }

    if (req.query.workMode && req.query.workMode !== 'all') {
      query.workMode = req.query.workMode;
    }

    if (req.query.jobType) {
      query.jobType = req.query.jobType;
    }

    if (req.query.minExperience) {
      const exp = parseInt(req.query.minExperience as string, 10);
      if (!isNaN(exp)) {
        query.experienceYearsMin = { $lte: exp };
      }
    }

    if (req.query.minSalary) {
      const minSal = parseInt(req.query.minSalary as string, 10);
      if (!isNaN(minSal)) {
        query['salary.min'] = { $gte: minSal };
      }
    }

    let sort: any = { createdAt: -1 };
    if (req.query.sortBy === 'salary_desc') {
      sort = { 'salary.max': -1 };
    } else if (req.query.sortBy === 'deadline') {
      sort = { deadline: 1 };
    }

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('companyId', 'name logoUrl industry headquarters verified')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(query),
    ]);

    sendSuccess(res, jobs, 'Jobs retrieved successfully', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch jobs', 500);
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid job ID format', 400);
      return;
    }

    const job = await Job.findByIdAndUpdate(
      id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).populate('companyId');

    if (!job) {
      sendError(res, 'Job listing not found', 404);
      return;
    }

    sendSuccess(res, job, 'Job details fetched');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch job details', 500);
  }
};

export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'employer') {
      sendError(res, 'Only employers can publish jobs', 403);
      return;
    }

    const employerProfile = await EmployerProfile.findOne({ userId: req.user.userId });
    if (!employerProfile || !employerProfile.companyId) {
      sendError(res, 'Please set up your company profile before publishing a job', 400);
      return;
    }

    const company = await Company.findById(employerProfile.companyId);
    if (!company) {
      sendError(res, 'Associated company not found', 404);
      return;
    }

    const data = req.body;
    const job = await Job.create({
      title: data.title,
      employerId: req.user.userId,
      companyId: company._id,
      companyName: company.name,
      category: data.category,
      location: data.location,
      workMode: data.workMode,
      jobType: data.jobType || 'full_time',
      experienceYearsMin: data.experienceYearsMin || 0,
      salary: {
        min: data.salaryMin || 0,
        max: data.salaryMax || 0,
        currency: 'INR',
        period: data.salaryPeriod || 'year',
      },
      openings: data.openings || 1,
      description: data.description,
      responsibilities: data.responsibilities,
      skillsRequired: data.skillsRequired,
      eligibility: data.eligibility || [],
      perks: data.perks || [],
      deadline: new Date(data.deadline),
      status: 'active',
    });

    sendSuccess(res, job, 'Job created successfully', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create job', 500);
  }
};

export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid job ID', 400);
      return;
    }

    const job = await Job.findById(id);
    if (!job) {
      sendError(res, 'Job listing not found', 404);
      return;
    }

    if (job.employerId.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      sendError(res, 'Forbidden: You do not own this job listing', 403);
      return;
    }

    const updated = await Job.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    sendSuccess(res, updated, 'Job updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update job', 500);
  }
};

export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendError(res, 'Invalid job ID', 400);
      return;
    }

    const job = await Job.findById(id);
    if (!job) {
      sendError(res, 'Job listing not found', 404);
      return;
    }

    if (job.employerId.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      sendError(res, 'Forbidden: You do not own this job listing', 403);
      return;
    }

    job.status = 'archived';
    await job.save();

    sendSuccess(res, null, 'Job archived successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to delete job', 500);
  }
};
