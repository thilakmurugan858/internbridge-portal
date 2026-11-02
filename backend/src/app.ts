import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { sendSuccess, sendError } from './utils/apiResponse';

// Import Routes
import authRoutes from './routes/authRoutes';
import internshipRoutes from './routes/internshipRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import companyRoutes from './routes/companyRoutes';
import studentRoutes from './routes/studentRoutes';
import savedOpportunityRoutes from './routes/savedOpportunityRoutes';
import reportRoutes from './routes/reportRoutes';
import adminRoutes from './routes/adminRoutes';
import publicSpaceRoutes from './routes/publicSpaceRoutes';

export const createApp = () => {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows cross-origin API integration
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: false,
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: true, // Dynamically allow request origin in dev
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body and Cookie Parsers
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(cookieParser());

  // Global Rate Limiting
  app.use('/api', apiLimiter);

  // Health Endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    sendSuccess(res, {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'InternBridge API',
    });
  });

  // Mount API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/internships', internshipRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/companies', companyRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/saved-opportunities', savedOpportunityRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/public-space', publicSpaceRoutes);

  // 404 Route Handler
  app.use('*', (req: Request, res: Response) => {
    sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
};
