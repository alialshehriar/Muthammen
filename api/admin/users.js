import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simple API key authentication (في الإنتاج، استخدم JWT أو OAuth)
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'muthammen_admin_2024_secure_key';

  if (apiKey !== ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'غير مصرح - مفتاح API غير صحيح'
    });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === 'GET') {
      // Get all users with their statistics
      const users = await sql`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.email_verified,
          u.created_at,
          u.updated_at,
          COUNT(DISTINCT e.id) as evaluation_count,
          COALESCE(SUM(e.estimated_value), 0) as total_evaluation_value
        FROM users u
        LEFT JOIN evaluations e ON u.id = e.user_id
        GROUP BY u.id, u.name, u.email, u.email_verified, u.created_at, u.updated_at
        ORDER BY u.created_at DESC
      `;

      return res.status(200).json({
        success: true,
        users,
        total: users.length
      });
    }

    if (req.method === 'PUT') {
      // Update user
      const { userId, updates } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'معرف المستخدم مطلوب'
        });
      }

      const allowedUpdates = ['name', 'email', 'email_verified'];
      const updateFields = Object.keys(updates).filter(key => allowedUpdates.includes(key));

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'لا توجد حقول صالحة للتحديث'
        });
      }

      const setClause = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const values = [userId, ...updateFields.map(field => updates[field])];

      await sql`
        UPDATE users
        SET ${sql.unsafe(setClause)}, updated_at = NOW()
        WHERE id = $1
      `.execute(values);

      return res.status(200).json({
        success: true,
        message: 'تم تحديث المستخدم بنجاح'
      });
    }

    if (req.method === 'DELETE') {
      // Delete user
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'معرف المستخدم مطلوب'
        });
      }

      // Delete user's evaluations first
      await sql`DELETE FROM evaluations WHERE user_id = ${userId}`;

      // Delete user
      await sql`DELETE FROM users WHERE id = ${userId}`;

      return res.status(200).json({
        success: true,
        message: 'تم حذف المستخدم بنجاح'
      });
    }

    return res.status(405).json({
      success: false,
      error: 'طريقة غير مسموحة'
    });

  } catch (error) {
    console.error('Error in admin users API:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ في الخادم',
      details: error.message
    });
  }
}

