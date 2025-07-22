import { killSleepingConnections, getConnectionStatus } from '../../../lib/db.js';
import { handleCors } from '../../../lib/cors.js';

async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // جلب حالة الاتصالات
      const status = await getConnectionStatus();
      
      res.status(200).json({
        success: true,
        connections: status,
        timestamp: new Date().toISOString()
      });
      
    } else if (req.method === 'DELETE') {
      // قتل الاتصالات النائمة
      const killedCount = await killSleepingConnections();
      
      res.status(200).json({
        success: true,
        message: `Killed ${killedCount} sleeping connections`,
        killedConnections: killedCount,
        timestamp: new Date().toISOString()
      });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Connection management error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Connection management failed',
      details: error.message 
    });
  }
}

export default function(req, res) {
  return handleCors(req, res, handler);
}