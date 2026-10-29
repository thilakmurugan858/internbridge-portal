import { Router } from 'express';
import {
  apply,
  getMyApplications,
  withdrawApplication,
  getEmployerApplications,
  updateApplicationStatus,
} from '../controllers/applicationController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { applicationCreateSchema, applicationStatusUpdateSchema } from '../validators/schemas';

const router = Router();

router.post('/', authenticate, authorize('student'), validateRequest(applicationCreateSchema), apply);
router.get('/me', authenticate, authorize('student'), getMyApplications);
router.post('/:id/withdraw', authenticate, authorize('student'), withdrawApplication);
router.get('/employer', authenticate, authorize('employer', 'admin'), getEmployerApplications);
router.patch('/:id/status', authenticate, authorize('employer', 'admin'), validateRequest(applicationStatusUpdateSchema), updateApplicationStatus);

export default router;
