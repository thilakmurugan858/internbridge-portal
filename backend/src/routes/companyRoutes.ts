import { Router } from 'express';
import { getCompanies, getCompanyBySlugOrId } from '../controllers/companyController';

const router = Router();

router.get('/', getCompanies);
router.get('/:identifier', getCompanyBySlugOrId);

export default router;
