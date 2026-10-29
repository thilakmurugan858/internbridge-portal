import { Request } from 'express';

export type UserRole = 'student' | 'employer' | 'admin';

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export type ApplicationStatus = 'applied' | 'in_review' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';

export type WorkMode = 'remote' | 'in_office' | 'hybrid';

export type OpportunityType = 'internship' | 'job';
