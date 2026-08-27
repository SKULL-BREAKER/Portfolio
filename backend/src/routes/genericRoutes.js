import express from 'express';
import { createCRUDController } from '../controllers/factoryController.js';
import { requireOwner } from '../middleware/authMiddleware.js';

/**
 * Creates a standard Express router for a given table.
 */
export const createCRUDRouter = (tableName, fields) => {
    const router = express.Router();
    const controller = createCRUDController(tableName, fields);
    
    router.get('/', controller.getAll);
    router.post('/', requireOwner, controller.createOne);
    router.put('/:id', requireOwner, controller.updateOne);
    router.delete('/:id', requireOwner, controller.deleteOne);
    
    return router;
};

// Define fields for each table (matching database schema)
const projectFields = ['slug', 'title', 'shortDescription', 'description', 'image', 'githubUrl', 'liveUrl', 'documentationUrl', 'technologies', 'category', 'startDate', 'endDate', 'status', 'isFeatured', 'displayOrder', 'isPublic'];
const skillFields = ['name', 'category', 'proficiency', 'yearsOfExp', 'icon', 'displayOrder'];
const educationFields = ['institution', 'degree', 'department', 'startDate', 'endDate', 'grade', 'description', 'institutionUrl', 'achievements', 'displayOrder', 'isPublic'];
const experienceFields = ['company', 'position', 'startDate', 'endDate', 'isCurrent', 'description', 'companyUrl', 'displayOrder', 'isPublic'];
const achievementFields = ['title', 'description', 'date', 'displayOrder', 'isPublic'];
const socialLinkFields = ['platform', 'displayName', 'url', 'icon', 'description', 'displayOrder', 'isPublic'];

// Export generated routers
export const projectsRouter = createCRUDRouter('Projects', projectFields);
export const skillsRouter = createCRUDRouter('Skills', skillFields);
export const educationRouter = createCRUDRouter('Education', educationFields);
export const experienceRouter = createCRUDRouter('Experience', experienceFields);
export const achievementsRouter = createCRUDRouter('Achievements', achievementFields);
export const socialLinksRouter = createCRUDRouter('SocialLinks', socialLinkFields);
