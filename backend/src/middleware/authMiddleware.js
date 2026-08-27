export const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    next();
};

export const requireOwner = (req, res, next) => {
    if (!req.session || !req.session.userId || req.session.role !== 'OWNER') {
        return res.status(403).json({ 
            success: false, 
            message: 'Forbidden. Owner authorization required.' 
        });
    }
    next();
};
