import { Response } from 'express';
import mongoose from 'mongoose';
import { ListingReport } from '../models/ListingReport';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Authentication required to report listings', 401);
      return;
    }

    const { opportunityId, opportunityType, reason, details } = req.body;

    if (!mongoose.Types.ObjectId.isValid(opportunityId)) {
      sendError(res, 'Invalid opportunity ID', 400);
      return;
    }

    const report = await ListingReport.create({
      opportunityId,
      opportunityType,
      reportedBy: req.user.userId,
      reason,
      details,
      status: 'pending',
    });

    sendSuccess(res, report, 'Report submitted to moderation team. Thank you.', 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to submit listing report', 500);
  }
};
