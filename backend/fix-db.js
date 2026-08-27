import mysql from 'mysql2/promise';

async function fixDb() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'portfolio'
  });

  console.log('Connected to DB. Fixing visibility...');
  
  await connection.execute('UPDATE Certificates SET isPublic = 1');
  await connection.execute('UPDATE Experience SET isPublic = 1');
  await connection.execute('UPDATE Education SET isPublic = 1');

  console.log('Fixed visibility for existing records!');
  await connection.end();
}

fixDb().catch(console.error);
