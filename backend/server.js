import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet()); // Sets various HTTP headers for security
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // Allow cookies to be sent with requests
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Session Management
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-development-only',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax', // Use 'none' if backend and frontend are on different domains in production and HTTPS is used
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

import authRoutes from './src/routes/authRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import fileRoutes from './src/routes/fileRoutes.js';
import certificateRoutes from './src/routes/certificateRoutes.js';
import { projectsRouter, skillsRouter, educationRouter, experienceRouter, achievementsRouter, socialLinksRouter } from './src/routes/genericRoutes.js';

// Basic Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/projects', projectsRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/education', educationRouter);
app.use('/api/experience', experienceRouter);
app.use('/api/achievements', achievementsRouter);
app.use('/api/links', socialLinksRouter);

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
    
    app.get(/^.*$/, (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', 'frontend', 'dist', 'index.html'));
    });
}

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
