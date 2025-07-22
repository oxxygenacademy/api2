import { query } from '../../lib/db.js';

export default async function handler(req, res) {
  try {
    // اختبار بسيط للاتصال
    const result = await query('SELECT 1 as test');
    
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      result: result
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Database connection failed'
    });
  }
}