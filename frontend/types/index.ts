export type UserRole = 'student' | 'employer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: UserRole;
  isVerified: boolean;
  avatarUrl?: string;
  bio?: string;
  location?: string;
}

export interface Company {
  _id: string;
  name: string;
  slug: string;
  description: string;
  website?: string;
  logoUrl?: string;
  industry: string;
  companySize?: string;
  headquarters?: string;
  foundedYear?: number;
  verified: boolean;
  activeOpportunitiesCount?: number;
}

export interface Internship {
  _id: string;
  title: string;
  employerId: string;
  companyId: Company | string;
  companyName: string;
  category: string;
  location: string;
  workMode: 'remote' | 'in_office' | 'hybrid';
  durationWeeks: number;
  stipend: {
    amount: number;
    currency: string;
    type: 'fixed' | 'negotiable' | 'unpaid' | 'performance_based';
    period: 'month' | 'lump_sum' | 'week';
  };
  openings: number;
  description: string;
  responsibilities: string[];
  skillsRequired: string[];
  eligibility: string[];
  perks: string[];
  deadline: string;
  startDate: string;
  status: 'active' | 'closed' | 'archived' | 'flagged';
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
}

export interface Job {
  _id: string;
  title: string;
  employerId: string;
  companyId: Company | string;
  companyName: string;
  category: string;
  location: string;
  workMode: 'remote' | 'in_office' | 'hybrid';
  jobType: 'full_time' | 'part_time' | 'contract';
  experienceYearsMin: number;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: 'year' | 'month';
  };
  openings: number;
  description: string;
  responsibilities: string[];
  skillsRequired: string[];
  eligibility: string[];
  perks: string[];
  deadline: string;
  status: 'active' | 'closed' | 'archived' | 'flagged';
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
}

export type ApplicationStatus = 'applied' | 'in_review' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';

export interface Application {
  _id: string;
  opportunityId: string;
  opportunityType: 'internship' | 'job';
  studentId: {
    _id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  } | string;
  employerId: string;
  companyId: Company | string;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl?: string;
  screeningAnswers?: Array<{ question: string; answer: string }>;
  statusHistory: Array<{
    status: ApplicationStatus;
    changedAt: string;
    note?: string;
  }>;
  withdrawnAt?: string;
  createdAt: string;
  opportunity?: Partial<Internship & Job>;
  studentProfile?: any;
}

// -------------------------------------------------------------
// PUBLIC SPACE (COMMUNITY ENGAGEMENT) TYPES
// -------------------------------------------------------------
export type PostPrivacy = 'public' | 'friends' | 'private';
export type MediaType = 'none' | 'image' | 'video';

export interface Post {
  _id: string;
  userId: string | { _id: string; name: string; username: string; avatarUrl?: string };
  authorName: string;
  username: string;
  authorAvatar?: string;
  friendCountAtPost: number;
  content: string;
  mediaUrls: string[];
  mediaType: MediaType;
  privacy: PostPrivacy;
  hashtags: string[];
  mentionedUserIds: string[];
  mentionedUsernames: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  status: 'active' | 'flagged' | 'deleted';
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  isSaved?: boolean;
  isAuthor?: boolean;
}

export interface PostComment {
  _id: string;
  postId: string;
  userId: string;
  authorName: string;
  username: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostingAllowance {
  acceptedFriends: number;
  dailyLimit: number;
  usedToday: number;
  remaining: number;
  allowed: boolean;
  isUnlimited: boolean;
  message?: string;
}

export interface Friendship {
  _id: string;
  requester: { _id: string; name: string; username: string; avatarUrl?: string } | string;
  recipient: { _id: string; name: string; username: string; avatarUrl?: string } | string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CommunityNotification {
  _id: string;
  recipient: string;
  sender?: { _id: string; name: string; username: string; avatarUrl?: string };
  type: 'like' | 'comment' | 'share' | 'friend_request' | 'friend_accept' | 'mention';
  postId?: string;
  postContentSnippet?: string;
  relationshipId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CommunityProfile {
  user: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    bio?: string;
    location?: string;
    role: UserRole;
    isVerified: boolean;
    createdAt: string;
  };
  stats: {
    acceptedFriendCount: number;
    followersCount: number;
    followingCount: number;
    postsCount: number;
  };
  relationship: {
    isSelf: boolean;
    friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected';
    isFollowing: boolean;
  };
}

export interface TrendingHashtag {
  tag: string;
  count: number;
}
