import { verifyToken } from '../../../../lib/auth.js';
import { query } from '../../../../lib/db.js';
import { handleCors } from '../../../../lib/cors.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization;
    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - Login required' });
    }

    const { id } = req.query; // lesson ID

    // التحقق من الاشتراك
    const [subscription] = await query(
      `SELECT * FROM platform_subscriptions 
       WHERE user_id = ? AND (expires_at IS NULL OR expires_at > NOW())`,
      [user.id]
    );

    if (!subscription) {
      return res.status(403).json({ 
        error: 'No active subscription',
        message: 'يجب الاشتراك في المنصة لمشاهدة الدروس'
      });
    }

    // جلب معلومات الدرس
    const [lesson] = await query(
      `SELECT l.id, l.title, l.video_url, l.order_index,
              s.id as section_id, s.title as section_title,
              c.id as course_id, c.title as course_title
       FROM lessons l 
       JOIN sections s ON l.section_id = s.id 
       JOIN courses c ON s.course_id = c.id
       WHERE l.id = ?`,
      [id]
    );

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // تسجيل بداية المشاهدة (اختياري)
    await query(
      `INSERT INTO watch_sessions (user_id, course_id, session_token, expires_at) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE expires_at = ?`,
      [user.id, lesson.course_id, `lesson_${id}_${Date.now()}`, new Date(Date.now() + 24*60*60*1000), new Date(Date.now() + 24*60*60*1000)]
    );

    res.status(200).json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        video_url: lesson.video_url,
        section_title: lesson.section_title,
        course_title: lesson.course_title,
        course_id: lesson.course_id
      }
    });

  } catch (error) {
    console.error('Get lesson video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default function(req, res) {
  return handleCors(req, res, handler);
}