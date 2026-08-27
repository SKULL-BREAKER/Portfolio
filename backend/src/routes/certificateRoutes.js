import express from 'express';
import { getCertificates, createCertificate, deleteCertificate } from '../controllers/certificateController.js';
import { requireOwner } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getCertificates);
router.post('/', requireOwner, upload.single('file'), createCertificate);
router.delete('/:id', requireOwner, deleteCertificate);

export default router;
