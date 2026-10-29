import { Request, Response } from 'express';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { EmployerProfile } from '../models/EmployerProfile';
import { Company } from '../models/Company';
import { AuthService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, companyName, designation } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      sendError(res, 'An account with this email address already exists.', 400);
      return;
    }

    const passwordHash = await AuthService.hashPassword(password);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      isVerified: false,
    });

    if (role === 'student') {
      await StudentProfile.create({
        userId: user._id,
        skills: [],
        education: [],
        experience: [],
      });
    } else if (role === 'employer') {
      let company = null;
      if (companyName) {
        const slug = companyName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') || `company-${Date.now()}`;

        company = await Company.findOne({ slug });
        if (!company) {
          company = await Company.create({
            name: companyName,
            slug,
            description: `${companyName} is an employer partner on InternBridge.`,
            industry: 'Technology',
            verified: false,
          });
        }
      }

      await EmployerProfile.create({
        userId: user._id,
        companyId: company?._id,
        designation: designation || 'Hiring Manager',
        isCompanyAdmin: true,
        isVerified: false,
      });
    }

    const token = AuthService.generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set secure HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
      },
      'Registration successful',
      201
    );
  } catch (error: any) {
    sendError(res, error.message || 'Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    const isMatch = await AuthService.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      sendError(res, 'Invalid email or password.', 401);
      return;
    }

    const token = AuthService.generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    }, 'Login successful');
  } catch (error: any) {
    sendError(res, error.message || 'Login failed', 500);
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  sendSuccess(res, null, 'Logged out successfully');
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    let profileData = null;
    if (user.role === 'student') {
      profileData = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'employer') {
      profileData = await EmployerProfile.findOne({ userId: user._id }).populate('companyId');
    }

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      profile: profileData,
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch user profile', 500);
  }
};
