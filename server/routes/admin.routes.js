import { Router } from 'express';
import {
  getStats,
  listUsers,
  getUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  listReports,
  getReport,
  reviewReport,
  forceDeleteMessage,
  adminGetConversationMessages,
} from '../controllers/admin.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/role.middleware.js';
import { adminLimiter } from '../middlewares/rateLimiters.js';
import { validateObjectId } from '../validators/common.validator.js';
import {
  validateListUsers,
  validateUpdateUserStatus,
  validateUpdateUserRole,
  validateListReports,
  validateReviewReport,
  validateAdminConversationMessages,
} from '../validators/admin.validator.js';

const router = Router();

// Applied at router level so no admin route can skip auth, role check or rate limit.
router.use(protect, adminOnly, adminLimiter);

// GET /api/admin/stats
router.get('/stats', getStats);

// GET /api/admin/users
router.get('/users', validateListUsers, listUsers);

// GET /api/admin/users/:id
router.get('/users/:id', validateObjectId('id'), getUser);

// PATCH /api/admin/users/:id/status
router.patch(
  '/users/:id/status',
  validateObjectId('id'),
  validateUpdateUserStatus,
  updateUserStatus,
);

// PATCH /api/admin/users/:id/role
router.patch(
  '/users/:id/role',
  validateObjectId('id'),
  validateUpdateUserRole,
  updateUserRole,
);

// DELETE /api/admin/users/:id
router.delete('/users/:id', validateObjectId('id'), deleteUser);

// GET /api/admin/reports
router.get('/reports', validateListReports, listReports);

// GET /api/admin/reports/:id
router.get('/reports/:id', validateObjectId('id'), getReport);

// PATCH /api/admin/reports/:id
router.patch(
  '/reports/:id',
  validateObjectId('id'),
  validateReviewReport,
  reviewReport,
);

// DELETE /api/admin/messages/:id
router.delete('/messages/:id', validateObjectId('id'), forceDeleteMessage);

// GET /api/admin/conversations/:id/messages
router.get(
  '/conversations/:id/messages',
  validateObjectId('id'),
  validateAdminConversationMessages,
  adminGetConversationMessages,
);

export default router;
