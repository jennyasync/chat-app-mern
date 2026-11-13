import { Router } from 'express';
import {
  uploadAvatarController,
  deleteAvatarController,
  uploadMessageImageController,
} from '../controllers/upload.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { uploadLimiter } from '../middlewares/rateLimiters.js';
import {
  uploadAvatar,
  uploadMessageImage,
  handleUploadErrors,
} from '../middlewares/upload.middleware.js';

const router = Router();

router.use(protect);

// POST /api/upload/avatar
router.post(
  '/avatar',
  uploadLimiter,
  uploadAvatar,
  handleUploadErrors,
  uploadAvatarController,
);

// DELETE /api/upload/avatar
router.delete('/avatar', deleteAvatarController);

// POST /api/upload/message-image
router.post(
  '/message-image',
  uploadLimiter,
  uploadMessageImage,
  handleUploadErrors,
  uploadMessageImageController,
);

export default router;
