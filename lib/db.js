import mysql from 'mysql2/promise';

const dbConfig = {
  host: '45.84.205.153', // استبدل بـ host الخاص بك
  port: 3306,
  user: 'u860905067_sss21',
  password: '7Vo65sW&',
  database: 'u860905067_sss21',
  charset: 'utf8mb4',
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
};

let connection;

export async function getDB() {
  try {
    if (!connection) {
      connection = await mysql.createConnection(dbConfig);
      console.log('Database connected successfully');
    }
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export async function query(sql, params = []) {
  try {
    const db = await getDB();
    const [results] = await db.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}