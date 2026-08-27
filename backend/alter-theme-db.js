import mysql from 'mysql2/promise';

async function alterDb() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'portfolio'
  });

  console.log('Connected to DB. Altering Profiles table...');
  
  try {
    await connection.execute('ALTER TABLE Profiles ADD COLUMN themeSettings TEXT');
    console.log('Added themeSettings column successfully!');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('themeSettings column already exists.');
    } else {
      console.error('Error:', error);
    }
  }

  await connection.end();
}

alterDb().catch(console.error);
