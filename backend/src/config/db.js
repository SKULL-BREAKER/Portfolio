import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// We expect DATABASE_URL or individual DB_ variables
// If using DATABASE_URL (e.g. mysql://user:pass@host:port/dbname), mysql2 can parse it
// But let's support a clean object configuration as well
let pool;

try {
    if (process.env.DATABASE_URL) {
        pool = mysql.createPool(process.env.DATABASE_URL);
    } else {
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'portfolio',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }
} catch (error) {
    console.error('Failed to initialize database connection pool:', error);
}

export default pool;
