import { Router } from 'express';
import { createReportController } from '../controllers/report.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validateReport } from '../validators/report.validator.js';

const router = Router();

router.use(protect);

// Users can only create reports; listing them is admin-only so moderation state never leaks.
// POST /api/reports
router.post('/', validateReport, createReportController);

export default router;
