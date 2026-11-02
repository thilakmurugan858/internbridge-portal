import { Request } from 'express';

export type UserRole = 'student' | 'employer' | 'admin';

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  username?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export type ApplicationStatus = 'applied' | 'in_review' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';

export type WorkMode = 'remote' | 'in_office' | 'hybrid';

export type OpportunityType = 'internship' | 'job';

// Public Space Types
export type PostPrivacy = 'public' | 'friends' | 'private';
export type PostMediaType = 'text' | 'image' | 'video';
export type PostStatus = 'active' | 'archived' | 'flagged' | 'deleted';
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';
export type NotificationType =
  | 'like'
  | 'comment'
  | 'share'
  | 'friend_request'
  | 'friend_accept'
  | 'mention';
export type PostReportReason =
  | 'inappropriate'
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'false_info'
  | 'other';
