import { query } from '../../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    // جلب الكورسات في تصنيف معين (بدون تحقق من التوكن)
    const courses = await query(`
      SELECT c.id, c.title, cat.name as category 
      FROM courses c 
      JOIN categories cat ON c.category_id = cat.id 
      WHERE cat.id = ?
      ORDER BY c.created_at DESC
    `, [id]);

    res.status(200).json({
      success: true,
      courses: courses
    });

  } catch (error) {
    console.error('Category courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}