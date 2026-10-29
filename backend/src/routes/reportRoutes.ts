import { Router } from 'express';
import { createReport } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { reportCreateSchema } from '../validators/schemas';

const router = Router();

router.post('/', authenticate, validateRequest(reportCreateSchema), createReport);

export default router;
