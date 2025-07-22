import { query } from '../../../lib/db.js';
import { comparePassword, generateToken, validateIraqiPhone } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, password } = req.body;

  try {
    // التحقق من البيانات
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    if (!validateIraqiPhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // البحث عن المستخدم
    const [user] = await query(
      'SELECT * FROM users WHERE phone = ? AND active = TRUE', 
      [phone]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // حذف الجلسات السابقة
    await query('DELETE FROM sessions WHERE user_id = ?', [user.id]);

    // إنشاء توكن جديد
    const newToken = generateToken(user.user_id, phone);
    const device = req.headers['user-agent'] || 'unknown';

    // تحديث التوكن
    await query(
      'UPDATE users SET token = ? WHERE id = ?',
      [newToken, user.id]
    );

    // إنشاء جلسة جديدة
    await query(
      'INSERT INTO sessions (user_id, device) VALUES (?, ?)',
      [user.id, device]
    );

    res.status(200).json({
      success: true,
      user: {
        id: user.user_id,
        phone: user.phone,
        token: `Bearer ${newToken}`
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}