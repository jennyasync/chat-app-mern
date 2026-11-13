import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  dismissNotification,
} from '../controllers/notification.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import {
  validateObjectId,
  validatePagination,
} from '../validators/common.validator.js';

const router = Router();

router.use(protect);

// GET /api/notifications/unread-count
router.get('/unread-count', getUnreadCount);

// PATCH /api/notifications/read-all
router.patch('/read-all', markAllAsRead);

// GET /api/notifications
router.get('/', validatePagination, getNotifications);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', validateObjectId('id'), markAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', validateObjectId('id'), dismissNotification);

export default router;
