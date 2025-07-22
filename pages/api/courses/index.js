import { query } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // جلب الكورسات مع التصنيفات (بدون تحقق من التوكن)
    const courses = await query(`
      SELECT c.id, c.title, cat.name as category 
      FROM courses c 
      JOIN categories cat ON c.category_id = cat.id 
      ORDER BY c.created_at DESC
    `);

    res.status(200).json({
      success: true,
      courses: courses
    });

  } catch (error) {
    console.error('Courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}