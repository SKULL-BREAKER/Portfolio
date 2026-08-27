import multer from 'multer';
import crypto from 'crypto';
import path from 'path';

// Define secure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../uploads/');
    },
    filename: (req, file, cb) => {
        // Generate secure random filename
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File validation
const fileFilter = (req, file, cb) => {
    // Only allow specific MIME types
    const allowedMimeTypes = [
        'image/jpeg', 'image/png', 'image/webp', 
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, PDF, and DOC/DOCX are allowed.'), false);
    }
};

export const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB limit
    },
    fileFilter: fileFilter
});
