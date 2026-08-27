import db from '../config/db.js';

export const getProfile = async (req, res) => {
    try {
        const [profiles] = await db.execute('SELECT * FROM Profiles LIMIT 1');
        if (profiles.length === 0) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        
        const profile = profiles[0];
        
        // If visitor, only return if public
        if (req.session?.role !== 'OWNER' && !profile.isPublic) {
            return res.status(404).json({ success: false, message: 'Profile not found or private' });
        }
        // Prevent browser caching so theme changes reflect immediately
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.json({ success: true, profile });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { headline, about, careerObjective, isPublic, status, themeSettings } = req.body;
        
        const [profiles] = await db.execute('SELECT id FROM Profiles WHERE userId = ?', [req.session.userId]);
        if (profiles.length === 0) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        
        const profileId = profiles[0].id;
        
        const isPublicVal = (isPublic === 'true' || isPublic === true) ? 1 : 0;
        
        let updateQuery = 'UPDATE Profiles SET headline = ?, about = ?, careerObjective = ?, status = ?, isPublic = ?, themeSettings = ?';
        let updateParams = [headline, about, careerObjective, status, isPublicVal, themeSettings];
        
        if (req.files && req.files['profileImage']) {
            updateQuery += ', profileImage = ?';
            updateParams.push('/uploads/' + req.files['profileImage'][0].filename);
        }
        
        if (req.files && req.files['resumeFile']) {
            updateQuery += ', resumeFile = ?, resumeOriginal = ?';
            updateParams.push('/uploads/' + req.files['resumeFile'][0].filename);
            updateParams.push(req.files['resumeFile'][0].originalname);
        }
        
        updateQuery += ' WHERE id = ?';
        updateParams.push(profileId);
        
        await db.execute(updateQuery, updateParams);
        
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
