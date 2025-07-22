import { verifyToken } from '../../../lib/auth.js';
import { query } from '../../../lib/db.js';
import { handleCors } from '../../../lib/cors.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // جلب معلومات الاشتراك
    const [subscription] = await query(
      `SELECT type, expires_at FROM platform_subscriptions 
       WHERE user_id = ? AND (expires_at IS NULL OR expires_at > NOW()) 
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );

    res.status(200).json({
      success: true,
      user: {
        id: user.user_id,
        phone: user.phone,
        subscription: subscription || null,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('User info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default function(req, res) {
  return handleCors(req, res, handler);
}