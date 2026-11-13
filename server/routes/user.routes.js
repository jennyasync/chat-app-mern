import { Router } from 'express';
import {
  searchUsers,
  getPublicProfile,
  updatePreferences,
  getBlockedUsers,
  blockUser,
  unblockUser,
} from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validateObjectId } from '../validators/common.validator.js';
import {
  validateSearchQuery,
  validateUsername,
  validatePreferences,
} from '../validators/user.validator.js';

const router = Router();

router.use(protect);

// GET /api/users/search
router.get('/search', validateSearchQuery, searchUsers);

// GET /api/users/me/blocked
router.get('/me/blocked', getBlockedUsers);

// PATCH /api/users/me/preferences
router.patch('/me/preferences', validatePreferences, updatePreferences);

// POST /api/users/:userId/block
router.post('/:userId/block', validateObjectId('userId'), blockUser);

// DELETE /api/users/:userId/block
router.delete('/:userId/block', validateObjectId('userId'), unblockUser);

// GET /api/users/:username
router.get('/:username', validateUsername, getPublicProfile);

export default router;
