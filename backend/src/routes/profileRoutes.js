import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { requireOwner } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getProfile);
router.put('/', requireOwner, upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'resumeFile', maxCount: 1 }]), updateProfile);

export default router;
