/**
 * run-schema.js
 * Runs database/schema.sql against the DATABASE_URL in your .env file.
 *
 * Usage:
 *   cd backend
 *   node scripts/run-schema.js
 *
 * Make sure DATABASE_URL is set in backend/.env before running.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env manually (no dotenv dependency needed)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL || DATABASE_URL.includes('your_') || !DATABASE_URL.startsWith('postgres')) {
  console.error('\n❌ DATABASE_URL is not set or is still a placeholder.');
  console.error('Set it in backend/.env to your Railway PostgreSQL connection string.\n');
  process.exit(1);
}

const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
if (!fs.existsSync(schemaPath)) {
  console.error(`❌ Schema file not found at: ${schemaPath}`);
  process.exit(1);
}

const sql = fs.readFileSync(schemaPath, 'utf8');

async function run() {
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected.\n🏗️  Running schema...\n');

    await client.query(sql);

    console.log('✅ Schema applied successfully.');
    console.log('   Tables created: users, verification_tokens, password_reset_tokens,');
    console.log('   subscriptions, project_documents, messages, estimates, scheduler_state\n');

    client.release();
  } catch (err) {
    console.error('❌ Schema error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
