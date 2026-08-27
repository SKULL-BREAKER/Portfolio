import db from '../config/db.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const getCertificates = async (req, res) => {
    try {
        let query = 'SELECT id, title, organization, issueDate, credentialId, credentialUrl, description, fileUrl, originalFileName, mimeType, sizeBytes, displayOrder, isPublic, allowDownload FROM Certificates';
        const params = [];
        
        if (req.session?.role !== 'OWNER') {
            query += ' WHERE isPublic = 1';
        }
        query += ' ORDER BY displayOrder ASC, issueDate DESC';
        
        const [certs] = await db.execute(query, params);
        res.json({ success: true, certificates: certs });
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const createCertificate = async (req, res) => {
    try {
        const { title, organization, issueDate, credentialId, credentialUrl, description, displayOrder, isPublic, allowDownload } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'File is required' });
        }
        
        const fileUrl = `/api/files/${req.file.filename}`; // Or just store filename
        const originalFileName = req.file.originalname;
        const mimeType = req.file.mimetype;
        const sizeBytes = req.file.size;
        
        const id = crypto.randomUUID();
        
        const [profiles] = await db.execute('SELECT id FROM Profiles WHERE userId = ?', [req.session.userId]);
        const profileId = profiles[0].id;
        
        await db.execute(
            `INSERT INTO Certificates 
            (id, profileId, title, organization, issueDate, credentialId, credentialUrl, description, fileUrl, originalFileName, mimeType, sizeBytes, displayOrder, isPublic, allowDownload) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, profileId, title, organization, issueDate, credentialId || null, credentialUrl || null, description || null, req.file.filename, originalFileName, mimeType, sizeBytes, displayOrder || 0, isPublic === 'true' ? 1 : 0, allowDownload === 'true' ? 1 : 0]
        );
        
        res.json({ success: true, message: 'Certificate created successfully', id });
    } catch (error) {
        console.error('Error creating certificate:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteCertificate = async (req, res) => {
    try {
        const { id } = req.params;
        const [certs] = await db.execute('SELECT fileUrl FROM Certificates WHERE id = ?', [id]);
        
        if (certs.length === 0) {
            return res.status(404).json({ success: false, message: 'Certificate not found' });
        }
        
        const filename = certs[0].fileUrl;
        const filePath = path.join(process.cwd(), '..', 'uploads', filename);
        
        // Delete file from disk if it exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        await db.execute('DELETE FROM Certificates WHERE id = ?', [id]);
        res.json({ success: true, message: 'Certificate deleted successfully' });
    } catch (error) {
        console.error('Error deleting certificate:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
