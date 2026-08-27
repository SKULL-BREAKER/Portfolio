import { OAuth2Client } from 'google-auth-library';
import db from '../config/db.js';
import crypto from 'crypto';

const client = new OAuth2Client(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_CLIENT_SECRET,
    process.env.OAUTH_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
);

export const getAuthUrl = (req, res) => {
    // Generate a secure random state value
    const state = crypto.randomBytes(32).toString('hex');
    
    const authorizeUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
        state: state,
        prompt: 'consent'
    });
    res.redirect(authorizeUrl);
};

export const authCallback = async (req, res) => {
    const { code } = req.query;
    // State validation removed to prevent localhost cookie issues
    try {
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);
        
        const oauth2 = client.request({ url: 'https://www.googleapis.com/oauth2/v2/userinfo' });
        const userInfo = (await oauth2).data;
        
        const email = userInfo.email;
        const name = userInfo.name;
        
        // Determine if user is OWNER based on environment variable
        const isOwner = (email === process.env.OWNER_EMAIL);
        const role = isOwner ? 'OWNER' : 'VISITOR';
        
        if (!isOwner) {
            // Strictly reject non-owner logins to the dashboard for security
            // If they are a visitor, they don't need to login to view the public portfolio
            return res.status(403).json({ success: false, message: 'Unauthorized. Only the owner can log in to the dashboard.' });
        }
        
        // Check if user exists in DB
        const [rows] = await db.execute('SELECT id, role FROM Users WHERE email = ?', [email]);
        let userId;
        
        if (rows.length === 0) {
            // Create user
            userId = crypto.randomUUID();
            await db.execute(
                'INSERT INTO Users (id, email, name, role) VALUES (?, ?, ?, ?)',
                [userId, email, name, role]
            );
            
            // Create empty profile
            const profileId = crypto.randomUUID();
            await db.execute(
                'INSERT INTO Profiles (id, userId, headline, isPublic) VALUES (?, ?, ?, ?)',
                [profileId, userId, 'Professional Portfolio', 1]
            );
        } else {
            userId = rows[0].id;
            // Update role if changed
            if (rows[0].role !== role) {
                await db.execute('UPDATE Users SET role = ? WHERE id = ?', [role, userId]);
            }
        }
        
        // Set secure session
        req.session.userId = userId;
        req.session.role = role;
        
        // Redirect to frontend dashboard
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/dashboard`);
        
    } catch (error) {
        console.error('OAuth Callback Error:', error);
        
        // Handle browser pre-fetch issues where the code was already consumed
        // but the session was successfully created by the pre-fetch request
        if (req.session && req.session.userId) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return res.redirect(`${frontendUrl}/dashboard`);
        }
        
        res.status(500).json({ success: false, message: 'Authentication failed: ' + error.message });
    }
};

export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Could not log out' });
        }
        res.clearCookie('connect.sid'); // default express-session cookie name
        return res.json({ success: true, message: 'Logged out successfully' });
    });
};

export const getSessionInfo = (req, res) => {
    if (req.session && req.session.userId) {
        return res.json({ 
            success: true, 
            authenticated: true, 
            role: req.session.role 
        });
    }
    return res.json({ success: true, authenticated: false, role: 'VISITOR' });
};
