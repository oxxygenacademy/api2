import { verifyToken } from '../../../lib/auth.js';
import { query } from '../../../lib/db.js';
import { handleCors } from '../../../lib/cors.js';

async function handler(req, res) {
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

    // البحث عن الكود والتحقق من أنه غير مستخدم
    const [codeRecord] = await query(
      'SELECT * FROM subscription_codes WHERE code = ? AND is_used = FALSE',
      [code]
    );

    if (!codeRecord) {
      return res.status(404).json({ error: 'Invalid or already used code' });
    }

    // حساب تاريخ الانتهاء
    let expiresAt = null;
    if (codeRecord.type === 'monthly') {
      expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (codeRecord.type === 'custom' && codeRecord.duration_days) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + codeRecord.duration_days);
    }

    // حذف الاشتراكات السابقة للمستخدم
    await query(
      'DELETE FROM platform_subscriptions WHERE user_id = ?',
      [userId]
    );

    // إضافة الاشتراك الجديد
    await query(
      'INSERT INTO platform_subscriptions (user_id, type, expires_at, code) VALUES (?, ?, ?, ?)',
      [userId, codeRecord.type, expiresAt, code]
    );

    // تحديث الكود كمستخدم
    await query(
      'UPDATE subscription_codes SET is_used = TRUE, used_by_user_id = ?, used_at = NOW() WHERE code = ?',
      [userId, code]
    );

    res.status(200).json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: {
        type: codeRecord.type,
        expires_at: expiresAt,
        code: code
      }
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

export default function(req, res) {
  return handleCors(req, res, handler);
}