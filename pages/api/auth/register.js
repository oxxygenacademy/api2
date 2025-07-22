import { query } from '../../../lib/db.js';
import { hashPassword, generateUserId, generateToken, validateIraqiPhone } from '../../../lib/auth.js';

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
      return res.status(400).json({ error: 'Invalid Iraqi phone number' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // التحقق من وجود المستخدم
    const [existingUser] = await query('SELECT id FROM users WHERE phone = ?', [phone]);
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already exists' });
    }

    // إنشاء المستخدم
    const userId = await generateUserId();
    const hashedPassword = await hashPassword(password);
    const token = generateToken(userId, phone);
    const device = req.headers['user-agent'] || 'unknown';

    // حفظ المستخدم
    const result = await query(
      'INSERT INTO users (user_id, phone, password, token) VALUES (?, ?, ?, ?)',
      [userId, phone, hashedPassword, token]
    );

    const insertedUserId = result.insertId;

    // حفظ الجلسة
    await query(
      'INSERT INTO sessions (user_id, device) VALUES (?, ?)',
      [insertedUserId, device]
    );

    res.status(201).json({
      success: true,
      user: {
        id: userId,
        phone: phone,
        token: `Bearer ${token}`
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}