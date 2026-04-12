/*
  Verification flow smoke test.
  Steps:
  1) Register user
  2) Read verification token from DB
  3) Call verify-email endpoint
  4) Login should succeed (200)

  Usage:
    BASE_URL=http://localhost:3001 node scripts/smoke-verify-login.js
*/

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

function loadEnvFromDotEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

async function request(pathname, options = {}) {
  const res = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  return { status: res.status, ok: res.ok, data };
}

async function run() {
  loadEnvFromDotEnv();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

  const ts = Date.now();
  const email = `verify+${ts}@test.com`;
  const password = 'VerifyPass123!';

  const register = await request('/api/users/register', {
    method: 'POST',
    body: JSON.stringify({
      firstName: 'Verify',
      lastName: 'Tester',
      email,
      password,
      userType: 'homeowner',
    }),
  });
  console.log('REGISTER', register.status, register.data?.success ?? register.data?.error ?? register.data?.raw);
  if (!register.ok) process.exit(1);

  const userId = register.data?.user?.id;
  if (!userId) {
    console.error('No user id returned from register.');
    process.exit(1);
  }

  const tokenResult = await pool.query(
    'SELECT token FROM verification_tokens WHERE email = $1 ORDER BY expires_at DESC LIMIT 1',
    [email.toLowerCase()]
  );

  const token = tokenResult.rows[0]?.token;
  if (!token) {
    console.error('No verification token found in database for', email);
    process.exit(1);
  }

  const verify = await request(`/api/auth/verify-email?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`, {
    method: 'GET',
  });
  console.log('VERIFY', verify.status, verify.data?.success ?? verify.data?.error ?? verify.data?.raw);
  if (!verify.ok) process.exit(1);

  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  console.log('LOGIN_AFTER_VERIFY', login.status, login.data?.success ?? login.data?.error ?? login.data?.raw);
  if (!login.ok || !login.data?.token) process.exit(1);

  console.log('VERIFY_FLOW_PASS userId=', userId);

  await pool.end();
}

run().catch(async (err) => {
  console.error('VERIFY_FLOW_ERROR', err?.message || err);
  process.exit(1);
});
