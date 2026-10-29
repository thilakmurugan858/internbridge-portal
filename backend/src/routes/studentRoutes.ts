import { Router } from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { studentProfileUpdateSchema } from '../validators/schemas';

const router = Router();

router.get('/me', authenticate, authorize('student'), getMyProfile);
router.patch('/me', authenticate, authorize('student'), validateRequest(studentProfileUpdateSchema), updateMyProfile);

export default router;
