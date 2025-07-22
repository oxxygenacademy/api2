import { verifyToken } from '../../../lib/auth.js';
import { query } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization;
    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { code, targetUserId, type = 'monthly' } = req.body;

    if (!code && !targetUserId) {
      return res.status(400).json({ error: 'Code or target user ID required' });
    }

    let userId = user.id;

    // إذا كان هناك معرف مستخدم مستهدف
    if (targetUserId) {
      const [targetUser] = await query(
        'SELECT id FROM users WHERE user_id = ? AND active = TRUE',
        [targetUserId]
      );
      
      if (!targetUser) {
        return res.status(404).json({ error: 'Target user not found' });
      }
      
      userId = targetUser.id;
    }

    // تحديد تاريخ الانتهاء
    let expiresAt = null;
    if (type === 'monthly') {
      expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // إضافة الاشتراك
    await query(
      'INSERT INTO platform_subscriptions (user_id, type, expires_at, code) VALUES (?, ?, ?, ?)',
      [userId, type, expiresAt, code]
    );

    res.status(200).json({
      success: true,
      message: 'Subscription added successfully'
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}