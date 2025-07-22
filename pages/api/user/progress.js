import { verifyToken } from '../../../lib/auth.js';
import { query } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization;
    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { courseId } = req.query;

    let whereClause = '';
    let params = [user.id];

    if (courseId) {
      whereClause = 'AND s.course_id = ?';
      params.push(courseId);
    }

    // جلب التقدم
    const progress = await query(`
      SELECT c.id as course_id, c.title as course_title,
             s.id as section_id, s.title as section_title,
             l.id as lesson_id, l.title as lesson_title,
             p.completed, p.completed_at
      FROM courses c
      JOIN sections s ON c.id = s.course_id
      JOIN lessons l ON s.id = l.section_id
      LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = ?
      ${whereClause}
      ORDER BY c.id, s.order_index, l.order_index
    `, params);

    res.status(200).json({
      success: true,
      progress: progress
    });

  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}