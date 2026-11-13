import { Router } from 'express';
import {
  getMessages,
  sendMessage,
  editMessageController,
  deleteMessageController,
  toggleReactionController,
  searchMessagesController,
} from '../controllers/message.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { messageLimiter } from '../middlewares/rateLimiters.js';
import { validateObjectId } from '../validators/common.validator.js';
import {
  validateMessageQuery,
  validateSendMessage,
  validateEditMessage,
  validateDeleteMessage,
  validateReaction,
  validateSearchQuery,
} from '../validators/message.validator.js';

// Mounted at /api/conversations/:id/messages; mergeParams exposes the parent :id.
export const conversationMessageRouter = Router({ mergeParams: true });

conversationMessageRouter.use(protect);

// GET /api/conversations/:id/messages/search
conversationMessageRouter.get(
  '/search',
  validateObjectId('id'),
  validateSearchQuery,
  searchMessagesController,
);

// GET /api/conversations/:id/messages
conversationMessageRouter.get(
  '/',
  validateObjectId('id'),
  validateMessageQuery,
  getMessages,
);

// POST /api/conversations/:id/messages
conversationMessageRouter.post(
  '/',
  messageLimiter,
  validateObjectId('id'),
  validateSendMessage,
  sendMessage,
);

// Membership is checked inside each service call, since only the message id is in the URL.
const messageRouter = Router();

messageRouter.use(protect);

// PATCH /api/messages/:id
messageRouter.patch(
  '/:id',
  validateObjectId('id'),
  validateEditMessage,
  editMessageController,
);

// DELETE /api/messages/:id
messageRouter.delete(
  '/:id',
  validateObjectId('id'),
  validateDeleteMessage,
  deleteMessageController,
);

// POST /api/messages/:id/reactions
messageRouter.post(
  '/:id/reactions',
  validateObjectId('id'),
  validateReaction,
  toggleReactionController,
);

export default messageRouter;
