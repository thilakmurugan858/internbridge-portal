import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Company } from '../models/Company';
import { Internship } from '../models/Internship';
import { Job } from '../models/Job';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 12));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.search) {
      query.name = { $regex: new RegExp(String(req.query.search).trim(), 'i') };
    }
    if (req.query.industry) {
      query.industry = { $regex: new RegExp(String(req.query.industry).trim(), 'i') };
    }

    const [companies, total] = await Promise.all([
      Company.find(query).sort({ verified: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Company.countDocuments(query),
    ]);

    // Count open opportunities for each company
    const enriched = await Promise.all(
      companies.map(async (comp) => {
        const [internshipCount, jobCount] = await Promise.all([
          Internship.countDocuments({ companyId: comp._id, status: 'active' }),
          Job.countDocuments({ companyId: comp._id, status: 'active' }),
        ]);
        return {
          ...comp,
          activeOpportunitiesCount: internshipCount + jobCount,
        };
      })
    );

    sendSuccess(res, enriched, 'Companies fetched successfully', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch companies', 500);
  }
};

export const getCompanyBySlugOrId = async (req: Request, res: Response): Promise<void> => {
  try {
    const identifier = String(req.params.identifier);
    let company = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      company = await Company.findById(identifier).lean();
    }
    if (!company) {
      company = await Company.findOne({ slug: identifier.toLowerCase() }).lean();
    }

    if (!company) {
      sendError(res, 'Company not found', 404);
      return;
    }

    const [internships, jobs] = await Promise.all([
      Internship.find({ companyId: company._id, status: 'active' }).sort({ createdAt: -1 }).lean(),
      Job.find({ companyId: company._id, status: 'active' }).sort({ createdAt: -1 }).lean(),
    ]);

    sendSuccess(res, {
      company,
      internships,
      jobs,
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch company details', 500);
  }
};
