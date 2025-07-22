import { verifyToken } from '../../../../lib/auth.js';
import { query } from '../../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // هنا نحتاج للتوكن للتحقق من الاشتراك
    const token = req.headers.authorization;
    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - Login required' });
    }

    const { id } = req.query;
    const { lessonId } = req.query;

    // التحقق من وجود الكورس
    const [course] = await query('SELECT * FROM courses WHERE id = ?', [id]);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

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

    // جلب رابط الدرس إذا تم تحديده
    let lessonUrl = null;
    if (lessonId) {
      const [lesson] = await query(
        `SELECT l.video_url FROM lessons l 
         JOIN sections s ON l.section_id = s.id 
         WHERE l.id = ? AND s.course_id = ?`,
        [lessonId, id]
      );
      
      if (lesson) {
        lessonUrl = lesson.video_url;
      }
    }

    // إنشاء جلسة مشاهدة
    const sessionToken = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // تنتهي بعد 24 ساعة

    await query(
      'INSERT INTO watch_sessions (user_id, course_id, session_token, expires_at) VALUES (?, ?, ?, ?)',
      [user.id, id, sessionToken, expiresAt]
    );

    res.status(200).json({
      success: true,
      watchSession: {
        sessionToken: sessionToken,
        courseId: id,
        lessonUrl: lessonUrl,
        expiresAt: expiresAt
      }
    });

  } catch (error) {
    console.error('Watch session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}