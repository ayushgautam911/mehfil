import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });

const { Client } = pg;

async function ping() {
  console.log(`[${new Date().toISOString()}] Pinging database to keep it active...`);
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT 1 as ping;');
    console.log(`[${new Date().toISOString()}] Database ping successful:`, res.rows);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Database ping failed:`, err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

ping();
