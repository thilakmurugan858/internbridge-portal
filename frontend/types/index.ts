export type UserRole = 'student' | 'employer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  avatarUrl?: string;
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
