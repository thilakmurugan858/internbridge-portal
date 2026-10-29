import { Response } from 'express';
import { StudentProfile } from '../models/StudentProfile';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'student') {
      sendError(res, 'Student access only', 403);
      return;
    }

    const [user, profile] = await Promise.all([
      User.findById(req.user.userId).select('name email role isVerified avatarUrl'),
      StudentProfile.findOne({ userId: req.user.userId }),
    ]);

    if (!user) {
      sendError(res, 'User record not found', 404);
      return;
    }

    sendSuccess(res, { user, profile }, 'Student profile retrieved');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch student profile', 500);
  }
};

export const updateMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'student') {
      sendError(res, 'Student access only', 403);
      return;
    }

    const { name, ...profileData } = req.body;

    if (name) {
      await User.findByIdAndUpdate(req.user.userId, { name: name.trim() });
    }

    const updatedProfile = await StudentProfile.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: profileData },
      { new: true, upsert: true }
    );

    sendSuccess(res, updatedProfile, 'Profile updated successfully');
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update student profile', 500);
  }
};
