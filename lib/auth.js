import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

// إنشاء توكن JWT
export function generateToken(user) {
  return jwt.sign(
    { 
      user_id: user.user_id,
      phone: user.phone,
      id: user.id 
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// التحقق من صحة التوكن
export async function verifyToken(authHeader) {
  try {
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const users = await query(
      'SELECT * FROM users WHERE user_id = ? AND active = TRUE',
      [decoded.user_id]
    );

    if (users.length === 0) {
      throw new Error('User not found or inactive');
    }

    return {
      ...decoded,
      id: users[0].id,
      user_id: users[0].user_id,
      phone: users[0].phone,
      created_at: users[0].created_at
    };

  } catch (error) {
    console.error('Token verification error:', error.message);
    throw new Error('Invalid or expired token');
  }
}

// تشفير كلمة المرور
export async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// مقارنة كلمة المرور
export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// إنشاء معرف مستخدم عشوائي
export function generateUserId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}