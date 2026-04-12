/*
  Smoke test for core auth/profile flows.
  Usage:
    node scripts/smoke-test.js
  Optional:
    BASE_URL=http://localhost:3001 node scripts/smoke-test.js
*/

const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  return { ok: res.ok, status: res.status, data };
}

async function run() {
  const ts = Date.now();
  const email = `smoke+${ts}@test.com`;
  const password = 'SmokePass123!';

  const registerBody = {
    firstName: 'Smoke',
    lastName: 'Tester',
    email,
    password,
    userType: 'homeowner',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
  };

  const reg = await request('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(registerBody),
  });
  console.log('REGISTER', reg.status, reg.data?.success ?? reg.data?.error ?? reg.data?.raw);
  if (!reg.ok) process.exit(1);

  const token = reg.data?.token;
  const userId = reg.data?.user?.id;
  if (!token || !userId) {
    console.error('REGISTER_TOKEN_MISSING', reg.data);
    process.exit(1);
  }

  const save = await request('/api/users/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      id: userId,
      firstName: 'Smoke',
      lastName: 'Tester',
      phone: '555-0101',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      userType: 'homeowner',
    }),
  });
  console.log('PROFILE_SAVE', save.status, save.data?.success ?? save.data?.error ?? save.data?.raw);
  if (!save.ok) process.exit(1);

  const profile = await request(`/api/users/profile?userId=${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('PROFILE_GET', profile.status, profile.data?.success ?? profile.data?.error ?? profile.data?.raw);
  if (!profile.ok) process.exit(1);

  const city = profile.data?.profile?.city;
  if (city !== 'Dallas') {
    console.error('PERSISTENCE_CHECK failed: expected city Dallas, got', city);
    process.exit(1);
  }

  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  console.log('LOGIN_AFTER_REGISTER', login.status, login.data?.success ?? login.data?.error ?? login.data?.raw);

  if (login.status !== 403 && !login.ok) {
    console.error('Unexpected login response:', login.status, login.data);
    process.exit(1);
  }

  console.log('SMOKE_TEST_PASS userId=', userId);
}

run().catch((err) => {
  console.error('SMOKE_TEST_ERROR', err?.message || err);
  process.exit(1);
});
