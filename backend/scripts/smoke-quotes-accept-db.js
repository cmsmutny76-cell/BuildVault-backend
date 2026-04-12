/*
  Smoke test DB-backed quotes accept API
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

async function registerVerify(prefix, pool, userType) {
  const email = `${prefix}+${Date.now()}@test.com`;
  const password = 'QuotePass123!';
  const reg = await req('/api/users/register', {
    method: 'POST',
    body: JSON.stringify({ firstName: prefix, lastName: 'User', email, password, userType }),
  });
  if (!reg.ok) throw new Error(`register failed ${reg.status}`);

  const userId = reg.data.user.id;
  const tokenRow = await pool.query('SELECT token FROM verification_tokens WHERE email = $1 ORDER BY expires_at DESC LIMIT 1', [email.toLowerCase()]);
  const token = tokenRow.rows[0]?.token;
  if (!token) throw new Error('missing verification token');

  const verify = await req(`/api/auth/verify-email?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`);
  if (!verify.ok) throw new Error(`verify failed ${verify.status}`);

  const login = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!login.ok) throw new Error(`login failed ${login.status}`);

  return { userId, token: login.data.token };
}

async function run() {
  loadEnv();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  const homeowner = await registerVerify('homeownerq', pool, 'homeowner');
  const contractorA = await registerVerify('contractora', pool, 'contractor');
  const contractorB = await registerVerify('contractorb', pool, 'contractor');

  const projectId = `proj_${Date.now()}`;
  const acceptedEstimateId = `est_${Date.now()}_a`;
  const pendingEstimateId = `est_${Date.now()}_b`;

  await pool.query(
    `INSERT INTO estimates (id, project_id, homeowner_id, contractor_id, amount, status, details, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,'pending','{}'::jsonb,NOW(),NOW()),
            ($6,$2,$3,$7,$8,'pending','{}'::jsonb,NOW(),NOW())`,
    [acceptedEstimateId, projectId, homeowner.userId, contractorA.userId, 15000, pendingEstimateId, contractorB.userId, 17000]
  );

  const accept = await req('/api/quotes/accept', {
    method: 'POST',
    headers: { Authorization: `Bearer ${homeowner.token}` },
    body: JSON.stringify({ estimateId: acceptedEstimateId, userId: homeowner.userId, projectId }),
  });

  console.log('ACCEPT', accept.status, accept.data?.success);
  if (!accept.ok) process.exit(1);

  const rows = await pool.query('SELECT id, status FROM estimates WHERE id = ANY($1::text[]) ORDER BY id', [[acceptedEstimateId, pendingEstimateId]]);
  const byId = Object.fromEntries(rows.rows.map((r) => [r.id, r.status]));

  console.log('STATUSES', byId[acceptedEstimateId], byId[pendingEstimateId]);
  if (byId[acceptedEstimateId] !== 'accepted' || byId[pendingEstimateId] !== 'rejected') {
    throw new Error('unexpected estimate statuses after acceptance');
  }

  console.log('QUOTES_ACCEPT_DB_SMOKE_PASS');
  await pool.end();
}

run().catch((e) => {
  console.error('QUOTES_ACCEPT_DB_SMOKE_FAIL', e.message || e);
  process.exit(1);
});
