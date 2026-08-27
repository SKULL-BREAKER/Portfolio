import express from 'express';
import { getAuthUrl, authCallback, logout, getSessionInfo } from '../controllers/authController.js';

const router = express.Router();

router.get('/google/url', getAuthUrl);
router.get('/google/callback', authCallback);
router.post('/logout', logout);
router.get('/session', getSessionInfo);

export default router;
