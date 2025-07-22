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

    const { id } = req.query;

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

    // جلب الأقسام
    const sections = await query(
      'SELECT id, title, order_index FROM sections WHERE course_id = ? ORDER BY order_index',
      [id]
    );

    // جلب الدروس لكل قسم (بدون روابط الفيديو)
    for (let section of sections) {
      section.lessons = await query(
        'SELECT id, title, order_index FROM lessons WHERE section_id = ? ORDER BY order_index',
        [section.id]
      );
    }

    // جلب تقدم المستخدم
    const progress = await query(
      `SELECT lesson_id, completed FROM progress 
       WHERE user_id = ? AND lesson_id IN (
         SELECT l.id FROM lessons l 
         JOIN sections s ON l.section_id = s.id 
         WHERE s.course_id = ?
       )`,
      [user.id, id]
    );

    // إضافة معلومات التقدم للدروس
    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.lesson_id] = p.completed;
    });

    for (let section of sections) {
      for (let lesson of section.lessons) {
        lesson.completed = progressMap[lesson.id] || false;
      }
    }

    // إنشاء جلسة مشاهدة
    const sessionToken = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await query(
      'INSERT INTO watch_sessions (user_id, course_id, session_token, expires_at) VALUES (?, ?, ?, ?)',
      [user.id, id, sessionToken, expiresAt]
    );

    res.status(200).json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        sections: sections
      },
      watchSession: {
        sessionToken: sessionToken,
        courseId: parseInt(id),
        expiresAt: expiresAt
      },
      userProgress: {
        totalLessons: sections.reduce((total, section) => total + section.lessons.length, 0),
        completedLessons: progress.filter(p => p.completed).length
      }
    });

  } catch (error) {
    console.error('Watch session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default function(req, res) {
  return handleCors(req, res, handler);
}