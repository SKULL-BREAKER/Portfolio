import express from 'express';
import path from 'path';
import fs from 'fs';
import db from '../config/db.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const fileId = req.params.id;
        
        // Find certificate or file in DB
        const [certs] = await db.execute('SELECT fileUrl, originalFileName, mimeType, isPublic, allowDownload FROM Certificates WHERE fileUrl = ?', [fileId]);
        
        if (certs.length === 0) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }
        
        const cert = certs[0];
        
        // Check authorization
        if (req.session?.role !== 'OWNER' && !cert.isPublic) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        
        const filePath = path.join(process.cwd(), '..', 'uploads', path.basename(cert.fileUrl));
        
        // Ensure path traversal protection
        if (!filePath.startsWith(path.join(process.cwd(), '..', 'uploads'))) {
             return res.status(403).json({ success: false, message: 'Invalid path' });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'File not found on disk' });
        }
        
        // Set secure headers
        res.setHeader('Content-Type', cert.mimeType);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // If query param download=true and allowDownload is true
        if (req.query.download === 'true') {
            if (req.session?.role !== 'OWNER' && !cert.allowDownload) {
                return res.status(403).json({ success: false, message: 'Download not permitted' });
            }
            res.setHeader('Content-Disposition', `attachment; filename="${cert.originalFileName}"`);
        } else {
            res.setHeader('Content-Disposition', 'inline');
        }
        
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        
    } catch (error) {
        console.error('File serving error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
