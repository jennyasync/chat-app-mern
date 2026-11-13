import { Router } from 'express';
import {
  getConversations,
  createDirect,
  createGroup,
  getConversation,
  updateConversation,
  addMembers,
  removeMember,
  promoteAdmin,
  demoteAdmin,
  toggleMute,
  toggleArchive,
  deleteConversation,
  markRead,
  getUnreadSummary,
} from '../controllers/conversation.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import {
  validateObjectId,
  validatePagination,
} from '../validators/common.validator.js';
import {
  validateCreateDirect,
  validateCreateGroup,
  validateUpdateConversation,
  validateAddMembers,
  validateArchivedQuery,
} from '../validators/conversation.validator.js';

const router = Router();

router.use(protect);

// GET /api/conversations
router.get('/', validatePagination, validateArchivedQuery, getConversations);

// GET /api/conversations/unread-summary
router.get('/unread-summary', getUnreadSummary);

// POST /api/conversations/direct
router.post('/direct', validateCreateDirect, createDirect);

// POST /api/conversations/group
router.post('/group', validateCreateGroup, createGroup);

// GET /api/conversations/:id
router.get('/:id', validateObjectId('id'), getConversation);
router.patch(
  '/:id',
  validateObjectId('id'),
  validateUpdateConversation,
  updateConversation,
);

// DELETE /api/conversations/:id
router.delete('/:id', validateObjectId('id'), deleteConversation);

// POST /api/conversations/:id/members
router.post(
  '/:id/members',
  validateObjectId('id'),
  validateAddMembers,
  addMembers,
);

// DELETE /api/conversations/:id/members/:userId
router.delete(
  '/:id/members/:userId',
  validateObjectId('id'),
  validateObjectId('userId'),
  removeMember,
);

// POST /api/conversations/:id/admins/:userId
router.post(
  '/:id/admins/:userId',
  validateObjectId('id'),
  validateObjectId('userId'),
  promoteAdmin,
);

// DELETE /api/conversations/:id/admins/:userId
router.delete(
  '/:id/admins/:userId',
  validateObjectId('id'),
  validateObjectId('userId'),
  demoteAdmin,
);

// POST /api/conversations/:id/mute
router.post('/:id/mute', validateObjectId('id'), toggleMute);

// POST /api/conversations/:id/archive
router.post('/:id/archive', validateObjectId('id'), toggleArchive);

// POST /api/conversations/:id/read
router.post('/:id/read', validateObjectId('id'), markRead);

export default router;
