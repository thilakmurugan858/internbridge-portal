import { Router } from 'express';
import {
  saveOpportunity,
  unsaveOpportunity,
  getSavedOpportunities,
} from '../controllers/savedOpportunityController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('student'), getSavedOpportunities);
router.post('/:opportunityId', authenticate, authorize('student'), saveOpportunity);
router.delete('/:opportunityId', authenticate, authorize('student'), unsaveOpportunity);

export default router;
