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

    const { lessonId } = req.body;

    if (!lessonId) {
      return res.status(400).json({ error: 'Lesson ID required' });
    }

    // التحقق من وجود الدرس
    const [lesson] = await query('SELECT id FROM lessons WHERE id = ?', [lessonId]);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // تسجيل التقدم
    await query(
      `INSERT INTO progress (user_id, lesson_id, completed, completed_at) 
       VALUES (?, ?, TRUE, NOW()) 
       ON DUPLICATE KEY UPDATE completed = TRUE, completed_at = NOW()`,
      [user.id, lessonId]
    );

    res.status(200).json({
      success: true,
      message: 'Lesson marked as completed'
    });

  } catch (error) {
    console.error('Mark complete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}