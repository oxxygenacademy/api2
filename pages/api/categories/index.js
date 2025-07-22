import { query } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // جلب جميع التصنيفات (بدون تحقق من التوكن)
    const categories = await query(`
      SELECT id, name 
      FROM categories 
      ORDER BY name
    `);

    res.status(200).json({
      success: true,
      categories: categories
    });

  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}