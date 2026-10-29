import { Response } from 'express';
import mongoose from 'mongoose';
import { SavedOpportunity } from '../models/SavedOpportunity';
import { Internship } from '../models/Internship';
import { Job } from '../models/Job';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export const saveOpportunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'student') {
      sendError(res, 'Student access only', 403);
      return;
    }

    const opportunityId = String(req.params.opportunityId);
    const { opportunityType = 'internship' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(opportunityId)) {
      sendError(res, 'Invalid opportunity ID', 400);
      return;
    }

    const saved = await SavedOpportunity.findOneAndUpdate(
      {
        studentId: req.user.userId,
        opportunityId: new mongoose.Types.ObjectId(opportunityId),
      },
      {
        studentId: req.user.userId,
        opportunityId: new mongoose.Types.ObjectId(opportunityId),
        opportunityType,
      },
      { upsert: true, new: true }
    );

    sendSuccess(res, saved, 'Opportunity saved to bookmarks');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to save opportunity', 500);
  }
};

export const unsaveOpportunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'student') {
      sendError(res, 'Student access only', 403);
      return;
    }

    const opportunityId = String(req.params.opportunityId);
    if (!mongoose.Types.ObjectId.isValid(opportunityId)) {
      sendError(res, 'Invalid opportunity ID', 400);
      return;
    }

    await SavedOpportunity.findOneAndDelete({
      studentId: req.user.userId,
      opportunityId: new mongoose.Types.ObjectId(opportunityId),
    });

    sendSuccess(res, null, 'Opportunity removed from bookmarks');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to remove saved opportunity', 500);
  }
};

export const getSavedOpportunities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'student') {
      sendError(res, 'Student access only', 403);
      return;
    }

    const bookmarks = await SavedOpportunity.find({ studentId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    const populated = await Promise.all(
      bookmarks.map(async (b) => {
        let details = null;
        if (b.opportunityType === 'internship') {
          details = await Internship.findById(b.opportunityId).populate('companyId', 'name logoUrl').lean();
        } else {
          details = await Job.findById(b.opportunityId).populate('companyId', 'name logoUrl').lean();
        }
        return {
          ...b,
          opportunity: details,
        };
      })
    );

    sendSuccess(res, populated, 'Saved opportunities retrieved');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch saved opportunities', 500);
  }
};
