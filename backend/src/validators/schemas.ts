import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['student', 'employer'], {
    errorMap: () => ({ message: 'Role must be either student or employer' }),
  }),
  companyName: z.string().optional(),
  designation: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const internshipCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  category: z.string().min(2, 'Category is required'),
  location: z.string().min(2, 'Location is required'),
  workMode: z.enum(['remote', 'in_office', 'hybrid']),
  durationWeeks: z.coerce.number().min(1, 'Duration must be at least 1 week').max(52),
  stipendAmount: z.coerce.number().min(0, 'Stipend must be positive or zero'),
  stipendType: z.enum(['fixed', 'negotiable', 'unpaid', 'performance_based']).default('fixed'),
  stipendPeriod: z.enum(['month', 'lump_sum', 'week']).default('month'),
  openings: z.coerce.number().min(1).default(1),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  responsibilities: z.array(z.string()).min(1, 'At least one responsibility is required'),
  skillsRequired: z.array(z.string()).min(1, 'At least one skill is required'),
  eligibility: z.array(z.string()).optional().default([]),
  perks: z.array(z.string()).optional().default([]),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid deadline date is required',
  }),
  startDate: z.string().optional().default('Immediately'),
});

export const internshipUpdateSchema = internshipCreateSchema.partial().extend({
  status: z.enum(['active', 'closed', 'archived']).optional(),
});

export const jobCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  category: z.string().min(2, 'Category is required'),
  location: z.string().min(2, 'Location is required'),
  workMode: z.enum(['remote', 'in_office', 'hybrid']),
  jobType: z.enum(['full_time', 'part_time', 'contract']).default('full_time'),
  experienceYearsMin: z.coerce.number().min(0).default(0),
  salaryMin: z.coerce.number().min(0),
  salaryMax: z.coerce.number().min(0),
  salaryPeriod: z.enum(['year', 'month']).default('year'),
  openings: z.coerce.number().min(1).default(1),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  responsibilities: z.array(z.string()).min(1, 'At least one responsibility is required'),
  skillsRequired: z.array(z.string()).min(1, 'At least one skill is required'),
  eligibility: z.array(z.string()).optional().default([]),
  perks: z.array(z.string()).optional().default([]),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid deadline date is required',
  }),
});

export const applicationCreateSchema = z.object({
  opportunityId: z.string().min(1, 'Opportunity ID is required'),
  opportunityType: z.enum(['internship', 'job']),
  coverLetter: z.string().max(2000, 'Cover letter cannot exceed 2000 characters').optional(),
  resumeUrl: z.string().optional(),
  answers: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .optional(),
});

export const applicationStatusUpdateSchema = z.object({
  status: z.enum(['in_review', 'shortlisted', 'accepted', 'rejected']),
  note: z.string().max(500).optional(),
});

export const reportCreateSchema = z.object({
  opportunityId: z.string().min(1, 'Opportunity ID is required'),
  opportunityType: z.enum(['internship', 'job']),
  reason: z.enum(['fraud_scam', 'misleading_information', 'inappropriate_content', 'discriminatory', 'other']),
  details: z.string().min(10, 'Details must be at least 10 characters').max(1000),
});

export const studentProfileUpdateSchema = z.object({
  headline: z.string().max(150).optional(),
  bio: z.string().max(1000).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).optional(),
  education: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string(),
        fieldOfStudy: z.string(),
        startYear: z.number(),
        endYear: z.number().optional(),
        grade: z.string().optional(),
      })
    )
    .optional(),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string(),
        location: z.string().optional(),
        startDate: z.string().transform((str) => new Date(str)),
        endDate: z
          .string()
          .optional()
          .transform((str) => (str ? new Date(str) : undefined)),
        isCurrent: z.boolean().default(false),
        description: z.string().optional(),
      })
    )
    .optional(),
  resumeUrl: z.string().optional(),
  portfolioWebsite: z.string().optional(),
  githubUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
});


// Public Space Schemas
export const createPostSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty').max(3000, 'Post content cannot exceed 3000 characters'),
  mediaUrls: z.array(z.string().url('Invalid media URL')).optional().default([]),
  mediaType: z.enum(['text', 'image', 'video']).default('text'),
  privacy: z.enum(['public', 'friends', 'private']).default('public'),
});

export const updatePostSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty').max(3000, 'Post content cannot exceed 3000 characters').optional(),
  privacy: z.enum(['public', 'friends', 'private']).optional(),
  mediaUrls: z.array(z.string().url('Invalid media URL')).optional(),
  mediaType: z.enum(['text', 'image', 'video']).optional(),
});

export const addCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment cannot exceed 1000 characters'),
});

export const sharePostSchema = z.object({
  caption: z.string().max(500, 'Caption cannot exceed 500 characters').optional(),
});

export const postReportSchema = z.object({
  reason: z.enum(['inappropriate', 'spam', 'harassment', 'hate_speech', 'false_info', 'other']),
  details: z.string().max(1000).optional(),
});
