import { Router } from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { jobCreateSchema } from '../validators/schemas';

const router = Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', authenticate, authorize('employer', 'admin'), validateRequest(jobCreateSchema), createJob);
router.patch('/:id', authenticate, authorize('employer', 'admin'), updateJob);
router.delete('/:id', authenticate, authorize('employer', 'admin'), deleteJob);

export default router;
