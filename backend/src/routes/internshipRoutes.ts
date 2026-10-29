import { Router } from 'express';
import {
  getInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship,
  getFeaturedOpportunities,
  getCategories,
} from '../controllers/internshipController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { internshipCreateSchema, internshipUpdateSchema } from '../validators/schemas';

const router = Router();

router.get('/featured', getFeaturedOpportunities);
router.get('/categories', getCategories);
router.get('/', getInternships);
router.get('/:id', getInternshipById);
router.post('/', authenticate, authorize('employer', 'admin'), validateRequest(internshipCreateSchema), createInternship);
router.patch('/:id', authenticate, authorize('employer', 'admin'), validateRequest(internshipUpdateSchema), updateInternship);
router.delete('/:id', authenticate, authorize('employer', 'admin'), deleteInternship);

export default router;
