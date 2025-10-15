// Neon HTTP API Database Connection
// This uses Neon's HTTP API instead of the serverless driver

export async function query(sql, params = []) {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Extract connection details from DATABASE_URL
  // Format: postgresql://user:password@host/database?sslmode=require
  const url = new URL(DATABASE_URL);
  const host = url.hostname;
  const database = url.pathname.slice(1); // Remove leading slash
  
  // Use Neon HTTP API
  const neonApiUrl = `https://${host}/sql`;
  
  const response = await fetch(neonApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEON_API_KEY}`,
    },
    body: JSON.stringify({
      query: sql,
      params: params,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Neon API error: ${error}`);
  }

  const data = await response.json();
  return data;
}

export async function transaction(queries) {
  const results = [];
  
  for (const { sql, params } of queries) {
    const result = await query(sql, params);
    results.push(result);
  }
  
  return results;
}

