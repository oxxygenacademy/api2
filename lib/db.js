import mysql from 'mysql2/promise';

// دالة الاستعلام مع إغلاق فوري للاتصالات
export async function query(sql, params = []) {
  const startTime = Date.now();
  let conn = null;
  
  try {
    // إنشاء اتصال جديد لكل استعلام
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'learning_platform',
      port: parseInt(process.env.DB_PORT) || 3306,
      timeout: 5000,
      acquireTimeout: 5000,
      charset: 'utf8mb4',
      reconnect: false,
      multipleStatements: false
    });
    
    console.log(`[DB] New connection created for query`);
    
    // تنفيذ الاستعلام
    const [results] = await conn.execute(sql, params);
    
    const duration = Date.now() - startTime;
    console.log(`[DB] Query completed in ${duration}ms, returned ${Array.isArray(results) ? results.length : 1} rows`);
    
    return results;
    
  } catch (error) {
    console.error('[DB] Query error:', error.message);
    throw error;
    
  } finally {
    // إغلاق الاتصال فوراً
    if (conn) {
      try {
        await conn.end();
        console.log('[DB] Connection closed immediately');
      } catch (closeError) {
        console.error('[DB] Error closing connection:', closeError.message);
      }
    }
  }
}

// دالة لقتل جميع الاتصالات النائمة
export async function killSleepingConnections() {
  let adminConn = null;
  
  try {
    adminConn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'learning_platform',
      port: parseInt(process.env.DB_PORT) || 3306,
    });
    
    const [processes] = await adminConn.execute(`
      SELECT ID, COMMAND, TIME, STATE 
      FROM INFORMATION_SCHEMA.PROCESSLIST 
      WHERE USER = ? AND COMMAND = 'Sleep' AND TIME > 10
    `, [process.env.DB_USER]);
    
    console.log(`[DB] Found ${processes.length} sleeping connections to kill`);
    
    for (const process of processes) {
      try {
        await adminConn.execute(`KILL CONNECTION ?`, [process.ID]);
        console.log(`[DB] Killed sleeping connection ${process.ID}`);
      } catch (killError) {
        console.log(`[DB] Could not kill connection ${process.ID}:`, killError.message);
      }
    }
    
    return processes.length;
    
  } catch (error) {
    console.error('[DB] Error killing sleeping connections:', error.message);
    throw error;
    
  } finally {
    if (adminConn) {
      await adminConn.end();
    }
  }
}

// دالة للتحقق من حالة الاتصالات
export async function getConnectionStatus() {
  let conn = null;
  
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'learning_platform',
      port: parseInt(process.env.DB_PORT) || 3306,
    });
    
    const [processes] = await conn.execute(`
      SELECT 
        COUNT(*) as total_connections,
        SUM(CASE WHEN COMMAND = 'Sleep' THEN 1 ELSE 0 END) as sleeping_connections,
        SUM(CASE WHEN COMMAND != 'Sleep' THEN 1 ELSE 0 END) as active_connections
      FROM INFORMATION_SCHEMA.PROCESSLIST 
      WHERE USER = ?
    `, [process.env.DB_USER]);
    
    return processes[0];
    
  } finally {
    if (conn) {
      await conn.end();
    }
  }
}