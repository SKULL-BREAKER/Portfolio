import db from '../config/db.js';
import crypto from 'crypto';

/**
 * Creates standard CRUD controllers for a given table.
 * 
 * @param {string} tableName - The name of the table in the database
 * @param {Array<string>} fields - The fields to insert/update (excluding id, profileId, createdAt, updatedAt)
 * @returns {Object} { getAll, createOne, updateOne, deleteOne }
 */
export const createCRUDController = (tableName, fields) => {
    return {
        getAll: async (req, res) => {
            try {
                let query = `SELECT * FROM ${tableName}`;
                const params = [];
                
                // If visitor, only return public records (if the table has an isPublic column)
                // Note: Skills table doesn't have isPublic in our schema, but others do.
                const hasIsPublic = ['Projects', 'Education', 'Experience', 'Achievements', 'SocialLinks'].includes(tableName);
                
                if (hasIsPublic && req.session?.role !== 'OWNER') {
                    query += ' WHERE isPublic = 1';
                }
                
                // Add ordering
                if (['Projects', 'Education', 'Experience', 'Skills', 'Achievements', 'SocialLinks'].includes(tableName)) {
                    query += ' ORDER BY displayOrder ASC';
                }
                
                const [rows] = await db.execute(query, params);
                res.json({ success: true, data: rows });
            } catch (error) {
                console.error(`Error fetching ${tableName}:`, error);
                res.status(500).json({ success: false, message: 'Server error' });
            }
        },

        createOne: async (req, res) => {
            try {
                const id = crypto.randomUUID();
                
                const [profiles] = await db.execute('SELECT id FROM Profiles WHERE userId = ?', [req.session.userId]);
                if (profiles.length === 0) return res.status(404).json({ success: false, message: 'Profile not found' });
                const profileId = profiles[0].id;
                
                const values = [id, profileId];
                const placeholders = ['?', '?'];
                
                for (const field of fields) {
                    values.push(req.body[field] !== undefined ? req.body[field] : null);
                    placeholders.push('?');
                }
                
                const query = `INSERT INTO ${tableName} (id, profileId, ${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;
                await db.execute(query, values);
                
                res.json({ success: true, message: 'Record created successfully', id });
            } catch (error) {
                console.error(`Error creating ${tableName}:`, error);
                res.status(500).json({ success: false, message: 'Server error' });
            }
        },

        updateOne: async (req, res) => {
            try {
                const { id } = req.params;
                const values = [];
                const updates = [];
                
                for (const field of fields) {
                    if (req.body[field] !== undefined) {
                        updates.push(`${field} = ?`);
                        values.push(req.body[field]);
                    }
                }
                
                if (updates.length === 0) {
                    return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
                }
                
                values.push(id);
                const query = `UPDATE ${tableName} SET ${updates.join(', ')} WHERE id = ?`;
                
                const [result] = await db.execute(query, values);
                if (result.affectedRows === 0) {
                    return res.status(404).json({ success: false, message: 'Record not found' });
                }
                
                res.json({ success: true, message: 'Record updated successfully' });
            } catch (error) {
                console.error(`Error updating ${tableName}:`, error);
                res.status(500).json({ success: false, message: 'Server error' });
            }
        },

        deleteOne: async (req, res) => {
            try {
                const { id } = req.params;
                const [result] = await db.execute(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
                
                if (result.affectedRows === 0) {
                    return res.status(404).json({ success: false, message: 'Record not found' });
                }
                
                res.json({ success: true, message: 'Record deleted successfully' });
            } catch (error) {
                console.error(`Error deleting ${tableName}:`, error);
                res.status(500).json({ success: false, message: 'Server error' });
            }
        }
    };
};
