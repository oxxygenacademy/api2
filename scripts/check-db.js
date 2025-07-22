import { checkDatabaseConnection, getPoolStatus, closeDatabasePool } from '../lib/db.js';

async function checkDatabase() {
  console.log('🔍 Checking database connection...');
  
  try {
    const isHealthy = await checkDatabaseConnection();
    const poolStatus = getPoolStatus();
    
    console.log('✅ Database Status:', {
      connected: isHealthy,
      pool: poolStatus
    });
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await closeDatabasePool();
    process.exit(0);
  }
}

checkDatabase();