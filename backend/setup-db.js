import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setup() {
    try {
        console.log("Connecting to MySQL to create database...");
        // Connect without a specific database to create it
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root', // From your .env file
        });
        
        await connection.query('CREATE DATABASE IF NOT EXISTS portfolio;');
        console.log("✅ Database 'portfolio' created or already exists.");
        await connection.end();

        console.log("Connecting to 'portfolio' database to import tables...");
        const dbConnection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'portfolio',
            multipleStatements: true // Allows running multiple queries at once
        });

        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log("Executing schema.sql...");
        await dbConnection.query(schema);
        console.log("✅ All tables created successfully!");
        
        await dbConnection.end();
        console.log("🎉 Database setup is 100% complete. The backend should now connect perfectly.");
    } catch (error) {
        console.error("❌ Error setting up database:", error.message);
    }
}

setup();
