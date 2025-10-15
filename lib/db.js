import { neon } from '@neondatabase/serverless';

export async function query(text, params) {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    const result = await sql(text, params || []);
    return { rows: result };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getClient() {
  // For compatibility with existing code
  const sql = neon(process.env.DATABASE_URL);
  
  return {
    query: async (text, params) => {
      const result = await sql(text, params || []);
      return { rows: result };
    },
    release: () => {}, // No-op for neon
  };
}
