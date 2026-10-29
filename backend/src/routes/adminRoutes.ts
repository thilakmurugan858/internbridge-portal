import { Router } from 'express';
import {
  getPlatformStats,
  getReports,
  resolveReport,
  getAllUsers,
  verifyEmployerOrCompany,
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Protect ALL admin routes with server-side authentication and role check
router.use(authenticate, authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/reports', getReports);
router.patch('/reports/:id', resolveReport);
router.get('/users', getAllUsers);
router.patch('/verify-company', verifyEmployerOrCompany);

export default router;
