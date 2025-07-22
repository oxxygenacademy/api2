import { checkDatabaseConnection, getPoolStatus } from '../../../lib/db.js';
import { handleCors } from '../../../lib/cors.js';

async function handler(req, res) {
  try {
    const isHealthy = await checkDatabaseConnection();
    const poolStatus = getPoolStatus();
    
    res.status(200).json({
      success: true,
      database: {
        connected: isHealthy,
        pool: poolStatus,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database health check failed',
      details: error.message
    });
  }
}

export default function(req, res) {
  return handleCors(req, res, handler);
}