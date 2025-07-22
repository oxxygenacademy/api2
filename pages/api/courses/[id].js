import { query } from '../../../lib/db.js';
import { handleCors } from '../../../lib/cors.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    // جلب معلومات الكورس (بدون تحقق من التوكن)
    const [course] = await query(
      'SELECT c.*, cat.name as category FROM courses c JOIN categories cat ON c.category_id = cat.id WHERE c.id = ?',
      [id]
    );

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // جلب الفصول
    const sections = await query(
      'SELECT id, title, order_index FROM sections WHERE course_id = ? ORDER BY order_index',
      [id]
    );

    // جلب الدروس لكل فصل
    for (let section of sections) {
      section.lessons = await query(
        'SELECT id, title, order_index FROM lessons WHERE section_id = ? ORDER BY order_index',
        [section.id]
      );
    }

    res.status(200).json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        category: course.category,
        sections: sections
      }
    });

  } catch (error) {
    console.error('Course details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default function(req, res) {
  return handleCors(req, res, handler);
}