/*
  Smoke test DB-backed messages API
  - register sender
  - register receiver
  - verify both users
  - login sender
  - send message
  - get conversations for sender
*/

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[k]) process.env[k] = v;
  }
}

async function req(p, opt = {}) {
  const res = await fetch(`${baseUrl}${p}`, {
    ...opt,
    headers: { 'Content-Type': 'application/json', ...(opt.headers || {}) },
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}

async function registerAndVerify(prefix, pool) {
  const email = `${prefix}+${Date.now()}@test.com`;
  const password = 'MsgPass123!';
  const reg = await req('/api/users/register', {
    method: 'POST',
    body: JSON.stringify({ firstName: prefix, lastName: 'User', email, password, userType: 'homeowner' }),
  });
  if (!reg.ok) throw new Error(`register failed ${reg.status}`);

  const userId = reg.data?.user?.id;
  const tokenRow = await pool.query('SELECT token FROM verification_tokens WHERE email = $1 ORDER BY expires_at DESC LIMIT 1', [email.toLowerCase()]);
  const token = tokenRow.rows[0]?.token;
  if (!token || !userId) throw new Error('verification token missing');

  const verify = await req(`/api/auth/verify-email?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`);
  if (!verify.ok) throw new Error(`verify failed ${verify.status}`);

  const login = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!login.ok) throw new Error(`login failed ${login.status}`);

  return { email, userId, authToken: login.data.token };
}

async function run() {
  loadEnv();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  const sender = await registerAndVerify('sender', pool);
  const receiver = await registerAndVerify('receiver', pool);

  const send = await req('/api/messages', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sender.authToken}` },
    body: JSON.stringify({ senderId: sender.userId, receiverId: receiver.userId, content: 'Hello from smoke test' }),
  });

  console.log('SEND', send.status, send.data?.success);
  if (!send.ok) process.exit(1);

  const list = await req(`/api/messages?userId=${encodeURIComponent(sender.userId)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${sender.authToken}` },
  });

  console.log('LIST', list.status, list.data?.success, Array.isArray(list.data?.conversations) ? list.data.conversations.length : -1);
  if (!list.ok) process.exit(1);

  console.log('MESSAGES_DB_SMOKE_PASS');
  await pool.end();
}

run().catch((e) => {
  console.error('MESSAGES_DB_SMOKE_FAIL', e.message || e);
  process.exit(1);
});
