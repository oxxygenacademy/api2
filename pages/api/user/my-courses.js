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

    // التحقق من وجود اشتراك نشط
    const [subscription] = await query(
      `SELECT * FROM platform_subscriptions 
       WHERE user_id = ? AND (expires_at IS NULL OR expires_at > NOW())`,
      [user.id]
    );

    if (!subscription) {
      return res.status(200).json({
        success: true,
        courses: [],
        message: 'No active subscription'
      });
    }

    // جلب جميع الكورسات (لأن المستخدم مشترك في المنصة)
    const courses = await query(`
      SELECT c.id, c.title, cat.name as category,
             COUNT(l.id) as total_lessons,
             COUNT(p.id) as completed_lessons
      FROM courses c
      JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN sections s ON c.id = s.course_id
      LEFT JOIN lessons l ON s.id = l.section_id
      LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = ? AND p.completed = TRUE
      GROUP BY c.id, c.title, cat.name
      ORDER BY c.created_at DESC
    `, [user.id]);

    // حساب نسبة التقدم
    const coursesWithProgress = courses.map(course => ({
      ...course,
      progress: course.total_lessons > 0 ? 
        Math.round((course.completed_lessons / course.total_lessons) * 100) : 0
    }));

    res.status(200).json({
      success: true,
      courses: coursesWithProgress
    });

  } catch (error) {
    console.error('My courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}