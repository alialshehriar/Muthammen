import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simple API key authentication
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
      // Get all evaluations with user information
      const evaluations = await sql`
        SELECT 
          e.id,
          e.property_type,
          e.city,
          e.neighborhood,
          e.area,
          e.estimated_value,
          e.created_at,
          u.name as user_name,
          u.email as user_email
        FROM evaluations e
        LEFT JOIN users u ON e.user_id = u.id
        ORDER BY e.created_at DESC
        LIMIT 1000
      `;

      // Get summary statistics
      const stats = await sql`
        SELECT 
          COUNT(*) as total_evaluations,
          AVG(estimated_value) as avg_value,
          MIN(estimated_value) as min_value,
          MAX(estimated_value) as max_value,
          COUNT(DISTINCT city) as cities_count,
          COUNT(DISTINCT property_type) as property_types_count
        FROM evaluations
      `;

      // Get evaluations by city
      const byCity = await sql`
        SELECT 
          city,
          COUNT(*) as count,
          AVG(estimated_value) as avg_value
        FROM evaluations
        WHERE city IS NOT NULL
        GROUP BY city
        ORDER BY count DESC
        LIMIT 10
      `;

      // Get evaluations by property type
      const byPropertyType = await sql`
        SELECT 
          property_type,
          COUNT(*) as count,
          AVG(estimated_value) as avg_value
        FROM evaluations
        WHERE property_type IS NOT NULL
        GROUP BY property_type
        ORDER BY count DESC
      `;

      // Get recent evaluations (last 7 days)
      const recentEvaluations = await sql`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          AVG(estimated_value) as avg_value
        FROM evaluations
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;

      return res.status(200).json({
        success: true,
        evaluations,
        stats: stats[0],
        byCity,
        byPropertyType,
        recentEvaluations
      });
    }

    return res.status(405).json({
      success: false,
      error: 'طريقة غير مسموحة'
    });

  } catch (error) {
    console.error('Error in admin evaluations API:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ في الخادم',
      details: error.message
    });
  }
}

