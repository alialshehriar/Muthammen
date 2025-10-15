import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function query(text, params) {
  try {
    // Convert parameterized query to tagged template
    let finalQuery = text;
    if (params && params.length > 0) {
      // Replace $1, $2, etc. with actual values
      params.forEach((param, index) => {
        const placeholder = `$${index + 1}`;
        const value = typeof param === 'string' ? `'${param.replace(/'/g, "''")}'` : param;
        finalQuery = finalQuery.replace(placeholder, value);
      });
    }
    
    const result = await sql(finalQuery);
    return { rows: result };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getClient() {
  return {
    query: async (text, params) => {
      return await query(text, params);
    },
    release: () => {}, // No-op for neon
  };
}
