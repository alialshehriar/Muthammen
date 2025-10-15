import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Authentication
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'muthammen_admin_2024_secure_key';

  if (apiKey !== ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'غير مصرح - مفتاح API غير صحيح'
    });
  }

  const { table } = req.query;
  const allowedTables = ['users', 'evaluations', 'map_notifications'];

  if (!allowedTables.includes(table)) {
    return res.status(400).json({
      success: false,
      error: 'اسم الجدول غير صالح'
    });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // GET - Fetch all data from table
    if (req.method === 'GET') {
      const data = await sql`SELECT * FROM ${sql(table)} ORDER BY created_at DESC LIMIT 1000`;
      
      return res.status(200).json({
        success: true,
        data,
        count: data.length
      });
    }

    // POST - Add new record
    if (req.method === 'POST') {
      const record = req.body;
      
      // Remove id, created_at, updated_at if present
      delete record.id;
      delete record.created_at;
      delete record.updated_at;

      const columns = Object.keys(record);
      const values = Object.values(record);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const columnNames = columns.join(', ');

      const query = `
        INSERT INTO ${table} (${columnNames})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await sql.unsafe(query, values);

      return res.status(201).json({
        success: true,
        message: 'تم إضافة السجل بنجاح',
        data: result[0]
      });
    }

    // PUT - Update record
    if (req.method === 'PUT') {
      const { id, updates } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'معرف السجل مطلوب'
        });
      }

      // Remove protected fields
      delete updates.id;
      delete updates.created_at;

      const columns = Object.keys(updates);
      const values = Object.values(updates);

      if (columns.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'لا توجد حقول للتحديث'
        });
      }

      const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
      const query = `
        UPDATE ${table}
        SET ${setClause}, updated_at = NOW()
        WHERE id = $${columns.length + 1}
        RETURNING *
      `;

      const result = await sql.unsafe(query, [...values, id]);

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'السجل غير موجود'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'تم تحديث السجل بنجاح',
        data: result[0]
      });
    }

    // DELETE - Delete record
    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'معرف السجل مطلوب'
        });
      }

      const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
      const result = await sql.unsafe(query, [id]);

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'السجل غير موجود'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'تم حذف السجل بنجاح'
      });
    }

    return res.status(405).json({
      success: false,
      error: 'طريقة غير مسموحة'
    });

  } catch (error) {
    console.error('Error in database API:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ في الخادم',
      details: error.message
    });
  }
}

