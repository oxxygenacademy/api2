import { query } from '../../lib/db.js';
import { handleCors } from '../../lib/cors.js';

async function handler(req, res) {
  try {
    // جلب جميع الدروس مع الروابط
    const lessons = await query(`
      SELECT l.id, l.title, l.video_url, 
             s.title as section_title,
             c.title as course_title
      FROM lessons l 
      JOIN sections s ON l.section_id = s.id 
      JOIN courses c ON s.course_id = c.id 
      ORDER BY c.id, s.order_index, l.order_index
    `);

    res.status(200).json({
      success: true,
      lessons: lessons
    });

  } catch (error) {
    console.error('Test lesson error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default function(req, res) {
  return handleCors(req, res, handler);
}