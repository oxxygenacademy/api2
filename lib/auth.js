import bcrypt from 'bcryptjs';
import { query } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// توليد معرف مستخدم فريد
export async function generateUserId() {
  try {
    const result = await query('SELECT MAX(user_id) as max_id FROM users');
    return result[0]?.max_id ? result[0].max_id + 1 : 1000;
  } catch (error) {
    console.error('Error generating user ID:', error);
    return 1000;
  }
}

// توليد توكن
export function generateToken(userId, phone) {
  const randomString = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
  return `${userId}|${randomString}`;
}

// تشفير كلمة المرور
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// مقارنة كلمة المرور
export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// التحقق من رقم الهاتف العراقي
export function validateIraqiPhone(phone) {
  const phoneRegex = /^07[0-9]{9}$/;
  return phoneRegex.test(phone);
}

// التحقق من التوكن
export async function verifyToken(token) {
  if (!token || !token.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const actualToken = token.substring(7);
    const result = await query(
      'SELECT * FROM users WHERE token = ? AND active = TRUE', 
      [actualToken]
    );
    
    return result[0] || null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}